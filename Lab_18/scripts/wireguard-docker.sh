#!/usr/bin/env bash
# Túnel WireGuard entre DOS CONTENEDORES Docker que controlamos (no es compañero ni VPS).
# - AllowedIPs solo con la IP del otro peer (/32): no es full-tunnel.
# - Las claves privadas se generan y se quedan DENTRO de cada contenedor: nunca se escriben en evidence/.
# - Captura UDP/51820 en la red entre los dos peers y comprueba que el payload es ilegible.
# - Al terminar baja wg0 y borra contenedores y red.
set -u
cd "$(dirname "$0")/.."
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo."; exit 1; }
E=evidence
mkdir -p $E; rm -f $E/wg-* $E/ping-* $E/wg0-*
trap 'docker rm -f lab18-wg-a lab18-wg-b >/dev/null 2>&1; docker network rm lab18net >/dev/null 2>&1' EXIT
docker rm -f lab18-wg-a lab18-wg-b >/dev/null 2>&1; docker network rm lab18net >/dev/null 2>&1

echo ">> Construyendo la imagen (la primera vez tarda)…"
docker build -q -t lab18-wg docker >/dev/null || { echo "falló docker build"; exit 1; }

docker network create lab18net >/dev/null
for n in a b; do
  docker run -d --name lab18-wg-$n --network lab18net --cap-add NET_ADMIN -v "$PWD/$E":/out lab18-wg sleep infinity >/dev/null
done
IPA=$(docker inspect -f '{{(index .NetworkSettings.Networks "lab18net").IPAddress}}' lab18-wg-a)
IPB=$(docker inspect -f '{{(index .NetworkSettings.Networks "lab18net").IPAddress}}' lab18-wg-b)
echo ">> Peers: A=$IPA  B=$IPB (red de Docker, puerto UDP 51820)"

# 1) Claves: se generan dentro de cada contenedor; solo se intercambian las PÚBLICAS.
for n in a b; do docker exec lab18-wg-$n sh -c 'umask 077; wg genkey > /tmp/private; wg pubkey < /tmp/private > /tmp/public'; done
PUBA=$(docker exec lab18-wg-a cat /tmp/public); PUBB=$(docker exec lab18-wg-b cat /tmp/public)

# 2) Interfaz wg0 con AllowedIPs = solo la IP del otro peer.
docker exec lab18-wg-a sh -c "ip link add wg0 type wireguard && wg set wg0 private-key /tmp/private listen-port 51820 peer $PUBB allowed-ips 10.18.0.2/32 endpoint $IPB:51820 && ip addr add 10.18.0.1/24 dev wg0 && ip link set wg0 up"
docker exec lab18-wg-b sh -c "ip link add wg0 type wireguard && wg set wg0 private-key /tmp/private listen-port 51820 peer $PUBA allowed-ips 10.18.0.1/32 endpoint $IPA:51820 && ip addr add 10.18.0.2/24 dev wg0 && ip link set wg0 up"

# 3) Capturas: en eth0 (lo que ve la red) y en wg0 de B (lo que ve el otro peer, ya descifrado).
docker exec -d lab18-wg-a sh -c 'tcpdump -i eth0 -nn -U -w /out/wg-51820.pcap udp port 51820 2>/dev/null'
docker exec -d lab18-wg-b sh -c 'tcpdump -i wg0 -nn -l -A icmp > /out/wg0-dentro-del-tunel.txt 2>/dev/null'
sleep 2

# 4) Tráfico por el túnel: ping con un patrón reconocible ("LAB18SECRET!") para probar que viaja cifrado.
echo ">> ping a través del túnel (10.18.0.1 -> 10.18.0.2)"
docker exec lab18-wg-a ping -c 5 -p 4c4142313853454352455421 10.18.0.2 | tee $E/ping-A-a-B.txt | tail -4
sleep 3
docker exec lab18-wg-b ping -c 2 10.18.0.1 | tail -3 | tee $E/ping-B-a-A.txt >/dev/null
docker exec lab18-wg-a pkill tcpdump; docker exec lab18-wg-b pkill tcpdump; sleep 1

# 5) wg show de ambos (con las keys públicas recortadas; wg show nunca imprime la private key).
rec() { sed -E 's/(public key: |peer: )([A-Za-z0-9+\/]{8})[A-Za-z0-9+\/=]+/\1\2…/'; }
for n in a b; do docker exec lab18-wg-$n wg show wg0 | rec > $E/wg-show-$n.txt; done
echo ">> wg show (peer A):"; cat $E/wg-show-a.txt

# 6) Análisis de la captura de red (qué ve la red entre los peers).
python3 scripts/analizar-pcap.py $E/wg-51820.pcap LAB18SECRET | tee $E/wg-captura-resumen.txt
{ echo "Lo que ve el OTRO peer (B) dentro del túnel, ya descifrado (primeras líneas):"; grep -a -m6 -E "ICMP|LAB18" $E/wg0-dentro-del-tunel.txt; } | tee -a $E/wg-captura-resumen.txt

# 7) Comprobación: ninguna clave privada terminó en evidence/.
PRIVA=$(docker exec lab18-wg-a cat /tmp/private); PRIVB=$(docker exec lab18-wg-b cat /tmp/private)
if grep -rqaF -e "$PRIVA" -e "$PRIVB" $E; then echo "!!! ALERTA: una private key aparece en evidence/"; else echo ">> OK: ninguna private key en evidence/"; fi

# 8) Bajar el túnel.
docker exec lab18-wg-a ip link del wg0; docker exec lab18-wg-b ip link del wg0
echo ">> Túnel bajado (wg0 eliminado en ambos peers). Se borran contenedores y red."
