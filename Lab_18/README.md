# Lab 18 — Signal + Safety Number y túnel WireGuard (Sesión 21)

Verificar un Safety Number con un compañero, escribir qué sabe y qué no lee el servidor de Signal, levantar un túnel WireGuard entre dos peers que controlamos y cerrar con [E2EE.md](E2EE.md).

## Estado contra la rúbrica

| Criterio | Peso | Estado |
|---|---|---|
| Safety Number verificado + screenshot tachado | 20% | **Hecho.** Conversación con Jona marcada como verificada en Signal oficial; captura tachada en [evidence/safety-number-tachado.png](evidence/safety-number-tachado.png). Detalle en [SIGNAL.md](SIGNAL.md) |
| Tabla servidor-sabe / no-lee razonada | 20% | **Hecha** en [SIGNAL.md](SIGNAL.md), con fuente por fila y contraste con signal.org/bigbrother |
| Túnel WireGuard arriba (`wg show` + ping) | 25% | **Hecho, con dos contenedores Docker** (no compañero ni VPS). Handshake reciente, bytes > 0, ping 5/5 y captura UDP 51820. Ver [WIREGUARD.md](WIREGUARD.md) |
| E2EE.md (FS/PCS + acceso excepcional + contraste, Keys Under Doormats) | 25% | **Hecho:** 442 palabras |
| Comentarios de aprendizaje | 10% | **Redactados** abajo |
| Penalización | — | Sin private keys en el repo (verificado por el script y por `.gitignore`); sin tráfico ajeno; Signal solo oficial |

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `SIGNAL.md` | Parte A (pasos y qué ataque detecta un Safety Number) y Parte B (tabla) |
| `WIREGUARD.md` | Topología, evidencia (`wg show`, ping, captura), frase ISP/peer y cómo repetirlo con un compañero o VPS |
| `E2EE.md` | Forward secrecy y PCS, acceso excepcional contra Signal y contra WireGuard, Tor contra Signal contra WireGuard |
| `scripts/wireguard-docker.sh` | Levanta el túnel entre dos contenedores, captura, comprueba y lo baja |
| `scripts/analizar-pcap.py` | Clasifica los paquetes de WireGuard de una captura |
| `docker/Dockerfile` | Imagen con `wireguard-tools`, `tcpdump` y `ping` |
| `wg0.conf.example` | Configuración de ejemplo **sin keys** |
| `evidence/` | `wg show` (keys públicas recortadas), pings, captura `.pcap` y resumen |

## Lo que falta de tu parte

1. **Chat del lab:** `safety number verified: sí` y `el servidor no puede leer el texto de los mensajes pero sí sabe que la cuenta existe y cuándo se conectó` (también está al final de [SIGNAL.md](SIGNAL.md)).
2. **Confirmar** que la verificación se hizo **comparando los números con Jona en persona** (el lab lo pide así). Si fue por otro medio, decirlo en el carnet.
3. **Opcional, mejor evidencia del túnel:** repetirlo con un compañero o con un VPS propio (pasos en [WIREGUARD.md](WIREGUARD.md)); esa prueba reemplaza a la de contenedores.
4. **Ajustar** la oración Tor/Signal/WireGuard de `E2EE.md` al venture de su equipo.
5. **Carnet y commit con push.**

## Reproducir el túnel

```bash
bash scripts/wireguard-docker.sh
```

Requiere Docker. Genera las keys dentro de los contenedores (nunca salen), levanta el túnel con `AllowedIPs` de solo la IP del otro peer, captura, verifica que no quedó ninguna private key en `evidence/` y baja todo.

## Entrega en el carnet

```markdown
## LAB # 18

[Safety Number verificado (tachado)](https://github.com/Cynthiss/Tech_F/blob/main/Lab_18/evidence/safety-number-tachado.png) · [Tabla servidor-sabe / no-lee](https://github.com/Cynthiss/Tech_F/blob/main/Lab_18/SIGNAL.md) · [Evidencia WireGuard](https://github.com/Cynthiss/Tech_F/blob/main/Lab_18/WIREGUARD.md) · [E2EE.md](https://github.com/Cynthiss/Tech_F/blob/main/Lab_18/E2EE.md)

### Comentarios de Aprendizaje
Cifrar el contenido no es esconder la conversación. En la captura de la red se ve quién habla con quién (IPs, puerto 51820), el tamaño y los tiempos de los paquetes, aunque no se pueda leer nada: el texto "LAB18SECRET" que mandé por el túnel no aparece en la red, pero el otro peer lo ve completo. En Signal pasa algo parecido: el servidor no lee los mensajes, pero sabe que la cuenta existe y cuándo se conecta, y por eso lo único que Signal dice haber entregado a una autoridad es la fecha de registro y la última conexión. Entendí también que el operador de un túnel ve los destinos, y que un mandato de acceso excepcional tendría que quitar la forward secrecy, que borra las keys por diseño.
```

## Seguridad

- Nunca subir una `PrivateKey`: el `.gitignore` excluye `privatekey`, `*.key` y `wg0.conf`.
- Solo se captura el tráfico del túnel de laboratorio propio; nada de terceros.
- No evadir bloqueos de red: si algo bloquea UDP, se documenta.
- Signal solo desde el sitio oficial.
