#!/usr/bin/env bash
# Lab 19: nota firmada en varios relays, con un relay PROPIO (nostr-rs-relay en Docker) que hace de "relay de clase".
# - La llave de test se genera en memoria: nunca se imprime ni se escribe en disco.
# - Publica como máximo 2 notas en relays públicos. Por eso exige PUBLICAR=si (no lo corras dos veces).
# - El "ban" lo hacemos nosotros como operadores del relay propio: dejamos la llave fuera de pubkey_whitelist.
set -u
cd "$(dirname "$0")/.."
[ "${PUBLICAR:-}" = "si" ] || { echo "Este script publica 2 notas en relays públicos. Corre: PUBLICAR=si bash scripts/ejecutar-lab19.sh"; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo."; exit 1; }
command -v nak >/dev/null || { echo "Falta nak (brew install nak)."; exit 1; }

R=registro; mkdir -p $R; rm -f $R/*.json $R/*.txt
WORK=$(mktemp -d); trap 'docker rm -f lab19-relay >/dev/null 2>&1; rm -rf "$WORK"; unset NOSTR_SECRET_KEY SK' EXIT
LOCAL=ws://127.0.0.1:8080
PUBLICOS="relay.damus.io nos.lol nostr.wine"
to() { perl -e 'alarm shift; exec @ARGV' "$@"; }   # timeout portable en macOS

# --- 1. Llave de test (en memoria) ---
SK=$(nak key generate); export NOSTR_SECRET_KEY=$SK
PK=$(nak key public "$SK"); NPUB=$(nak encode npub "$PK")
OTRA=$(nak key public "$(nak key generate)")          # una llave cualquiera, solo para la lista del "ban"
echo "npub de test: $NPUB" | tee $R/identidad.txt

# --- 2. Relay propio, con solo nuestra llave autorizada ---
mkdir -p "$WORK/data"
cfg() { cat > "$WORK/config.toml" <<CFG
[info]
relay_url = "ws://127.0.0.1:8080/"
name = "Relay de practica Lab 19"
[network]
address = "0.0.0.0"
port = 8080
[authorization]
pubkey_whitelist = ["$1"]
CFG
}
cfg "$PK"
docker rm -f lab19-relay >/dev/null 2>&1
docker run -d --name lab19-relay -p 127.0.0.1:8080:8080 \
  --mount type=bind,src="$WORK/config.toml",target=/usr/src/app/config.toml \
  --mount type=bind,src="$WORK/data",target=/usr/src/app/db scsibug/nostr-rs-relay:latest >/dev/null || { echo "no pudo arrancar el relay"; exit 1; }
for i in $(seq 1 30); do curl -s -m 2 -H 'Accept: application/nostr+json' http://127.0.0.1:8080 >/dev/null && break; sleep 1; done
echo "relay propio arriba en $LOCAL (whitelist: solo la llave de test)" | tee -a $R/identidad.txt

# --- 3. Firmar y comprobar, sin internet ---
nak event -c 'CS031 Lab 19 · nota de prueba' -t t=cs031lab19 > $R/nota1.json 2>/dev/null
ID1=$(python3 -c "import json;print(json.load(open('$R/nota1.json'))['id'])")
echo "id de la nota 1: $ID1" | tee -a $R/identidad.txt
{ echo "== verify del original =="; cat $R/nota1.json | nak verify; echo "código de salida: $?"; } > $R/verificacion.txt 2>&1
sed 's/nota de prueba/nota de pruebb/' $R/nota1.json > $R/nota1-alterada.json
{ echo; echo "== verify de la copia con una letra cambiada =="; cat $R/nota1-alterada.json | nak verify; echo "código de salida: $?"; } >> $R/verificacion.txt 2>&1
cat $R/verificacion.txt

# --- 4. Publicar la nota 1 en 4 relays y pedirla de vuelta ---
echo "== Publicación de la nota 1 ($(date -u +%FT%TZ)) ==" | tee $R/respuestas-nota1.txt
for r in $PUBLICOS $LOCAL; do
  echo "--- $r ---" | tee -a $R/respuestas-nota1.txt
  cat $R/nota1.json | to 40 nak event "$r" 2>&1 | grep -v '^{' | tee -a $R/respuestas-nota1.txt
done
echo "== Pedida de vuelta (nak req -i) ==" | tee $R/devuelta-nota1.txt
for r in $PUBLICOS $LOCAL; do
  echo "--- $r ---" | tee -a $R/devuelta-nota1.txt
  to 25 nak req -i "$ID1" "$r" 2>&1 | python3 -c "
import sys,json
n=0
for l in sys.stdin:
    l=l.strip()
    if l.startswith('{'):
        try:
            e=json.loads(l); n+=1; print('  DEVUELTA: id',e.get('id','')[:16]+'…','| contenido:',e.get('content'))
        except Exception: print(' ',l[:150])
    elif l: print(' ',l[:150])
if n==0: print('  (no devolvió la nota)')
" | tee -a $R/devuelta-nota1.txt
done

# --- 5. El ban: ahora nuestra llave ya no está autorizada en el relay propio ---
cfg "$OTRA"; docker restart lab19-relay >/dev/null
for i in $(seq 1 30); do curl -s -m 2 -H 'Accept: application/nostr+json' http://127.0.0.1:8080 >/dev/null && break; sleep 1; done
echo "BAN aplicado ($(date -u +%FT%TZ)): la llave de test salió de la whitelist del relay propio" | tee $R/ban.txt

# --- 6. Nota #2 ---
nak event -c 'CS031 Lab 19 · nota de prueba #2' -t t=cs031lab19 > $R/nota2.json 2>/dev/null
ID2=$(python3 -c "import json;print(json.load(open('$R/nota2.json'))['id'])")
echo "id de la nota 2: $ID2" | tee -a $R/identidad.txt
echo "== Publicación de la nota #2 ($(date -u +%FT%TZ)) ==" | tee $R/respuestas-nota2.txt
for r in relay.damus.io nos.lol $LOCAL; do
  echo "--- $r ---" | tee -a $R/respuestas-nota2.txt
  cat $R/nota2.json | to 40 nak event "$r" 2>&1 | grep -v '^{' | tee -a $R/respuestas-nota2.txt
done
echo "== Nota #2 pedida de vuelta ==" | tee $R/devuelta-nota2.txt
for r in relay.damus.io nos.lol $LOCAL; do
  echo "--- $r ---" | tee -a $R/devuelta-nota2.txt
  to 25 nak req -i "$ID2" "$r" 2>&1 | python3 -c "
import sys,json
n=0
for l in sys.stdin:
    l=l.strip()
    if l.startswith('{'):
        try:
            e=json.loads(l); n+=1; print('  DEVUELTA: id',e.get('id','')[:16]+'…','| contenido:',e.get('content'))
        except Exception: print(' ',l[:150])
    elif l: print(' ',l[:150])
if n==0: print('  (no devolvió la nota)')
" | tee -a $R/devuelta-nota2.txt
done

# --- 7. Higiene ---
if grep -rqF "$SK" $R; then echo "!!! ALERTA: la llave privada aparece en registro/"; else echo "OK: la llave privada no está en registro/"; fi
echo "Relay propio detenido y llave descartada al salir."
