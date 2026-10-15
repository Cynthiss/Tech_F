# WIREGUARD.md — Túnel entre dos peers que controlamos

## Topología (dicha tal cual fue)

Dos **contenedores Docker** (`lab18-wg-a` y `lab18-wg-b`) en una misma computadora, conectados por una red virtual de Docker, con el kernel de Linux de Docker Desktop. **No** fue compañero ↔ compañero ni laptop ↔ VPS: son dos peers que controlo, en un entorno aislado. Las direcciones son privadas de laboratorio: red de Docker `172.21.0.0/24` (puerto UDP 51820) y túnel `10.18.0.1/24` ↔ `10.18.0.2/24`. No hubo ninguna red institucional de por medio.

Se reproduce con `bash scripts/wireguard-docker.sh` (requiere Docker).

## Qué se hizo

1. Cada peer genera su par de keys **dentro de su contenedor** (`wg genkey | wg pubkey`); la private key no sale de ahí. Solo se intercambian las públicas.
2. Se configura `wg0` en ambos con `AllowedIPs` de **solo la IP del otro peer** (`/32`): no se rutea todo el tráfico por el túnel.
3. Se captura el UDP 51820 en la red entre los peers, se hace ping por el túnel con un patrón reconocible (`LAB18SECRET!`) y se comprueba qué ve la red y qué ve el otro peer.
4. Se baja el túnel (`ip link del wg0`) y se borran contenedores y red. El script verifica que ninguna private key terminó en `evidence/`.

Equivalente en archivo de configuración: [wg0.conf.example](wg0.conf.example) (sin keys).

## Evidencia

**`wg show` del peer A** ([wg-show-a.txt](evidence/wg-show-a.txt), keys públicas recortadas; `wg show` nunca imprime la private key):

```text
interface: wg0
  public key: WR0ufKJn…
  private key: (hidden)
  listening port: 51820

peer: Gky6+el9…
  endpoint: 172.21.0.3:51820
  allowed ips: 10.18.0.2/32
  latest handshake: 10 seconds ago
  transfer: 988 B received, 1.02 KiB sent
```

El peer B muestra lo simétrico ([wg-show-b.txt](evidence/wg-show-b.txt)): handshake reciente y `1.02 KiB received, 988 B sent`. Handshake reciente y bytes mayores que 0 en ambos lados.

**Ping por el túnel** ([ping-A-a-B.txt](evidence/ping-A-a-B.txt)): 5 enviados, 5 recibidos, 0% de pérdida, promedio 0.67 ms. También de B hacia A ([ping-B-a-A.txt](evidence/ping-B-a-A.txt)): 2 de 2.

**Captura del UDP 51820** en la red entre los peers ([wg-51820.pcap](evidence/wg-51820.pcap), resumen en [wg-captura-resumen.txt](evidence/wg-captura-resumen.txt)):

| Tipo de mensaje | Bytes | Paquetes |
|---|---|---|
| Handshake Initiation | 148 | 1 |
| Handshake Response | 92 | 1 |
| Transport Data | 128 | 12 |

Un paquete de Transport Data empieza por `04 00 00 00` (tipo 4) seguido de bytes sin estructura: el payload es ilegible. El texto `LAB18SECRET` que se mandó por el ping **no aparece** en la captura de la red, pero sí aparece en lo que ve el otro peer dentro del túnel ([wg0-dentro-del-tunel.txt](evidence/wg0-dentro-del-tunel.txt)), ya descifrado.

## Mi ISP / la red ve ___; el otro peer del túnel ve ___

**La red (y el ISP) ve** que hay paquetes UDP entre dos IPs por el puerto 51820, sus tamaños (148, 92 y 128 bytes), sus tiempos y su volumen, pero no el contenido ni qué se pidió dentro del túnel. **El otro peer del túnel ve** los paquetes IP completos y descifrados (`10.18.0.1 → 10.18.0.2`, incluido el contenido del ping); si el tráfico saliera del túnel hacia internet, ese extremo vería también los destinos.

## Cómo repetirlo con un compañero o con un VPS propio

Es la topología que pide el lab; con ella la evidencia es de dos redes reales. En cada peer, con WireGuard oficial de https://www.wireguard.com/install/:

```bash
umask 077
wg genkey | tee privatekey | wg pubkey > publickey      # intercambiar SOLO publickey
```

Cada peer crea su `wg0.conf` a partir de [wg0.conf.example](wg0.conf.example) (con su propia private key y la IP real del otro peer), y luego:

```bash
sudo wg-quick up wg0
sudo wg show
ping 10.18.0.2
sudo tcpdump -i <interfaz-física> -nn udp port 51820     # captura opcional, solo su tráfico de lab
sudo wg-quick down wg0                                    # al terminar
```

Reglas: `AllowedIPs` solo con la IP del otro peer; no subir `privatekey` ni `wg0.conf` al repo (el `.gitignore` ya los excluye); en capturas, tachar IPs públicas completas; si la red bloquea UDP, documentar el bloqueo y cambiar de red, no evadirlo.

## Limitaciones

- Los dos peers están en la misma máquina, así que no se probó el paso por un NAT, un router real ni el ISP.
- La captura se hizo en la red virtual de Docker entre los peers, que es el equivalente de "la red" en este montaje.
