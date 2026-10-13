# Lab 16 — Pear · Hyperswarm · Hypercore: P2P sin servidor (Sesión 19)

Dos peers se descubren por un topic de Hyperswarm, se pasan un mensaje, transfieren un archivo corto con Hypercore y se hace el experimento de "matar al seeder". El análisis de liability está en [P2P.md](P2P.md).

Stack usado: Node.js + Hyperswarm + Hypercore (el fallback permitido por el lab; no se instaló Pear).

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `scripts/peer.mjs` | Kickoff: hace `join(topic)` en modo server+client, registra la conexión y manda `ping desde <carnet>` |
| `scripts/topic.mjs` | Calcula el topic de 32 bytes (SHA-256 de un string) y su id corto |
| `scripts/diagnose.mjs` | Diagnóstico de red: alcance de los bootstrap nodes por UDP, NAT, nodos conocidos |
| `scripts/seed.mjs` | Seeder: publica un archivo (≤1 MB) como un Hypercore y lo sirve |
| `scripts/fetch.mjs` | Downloader: baja el archivo por su key, verifica el SHA-256 y detecta atascos |
| `scripts/experimento-kill-seeder.sh` | Corre el experimento kill-seeder en local (dos escenarios) |
| `scripts/prueba-docker.sh` | Segundo peer sin compañero: usa contenedores Docker (tu máquina ↔ contenedor, y contenedor ↔ contenedor) |
| `sample/lab16-sample.txt` | Archivo de prueba de 280,088 bytes, sin PII ni copyright |
| `logs/` | Logs reales de las pruebas (IPs enmascaradas) |
| `P2P.md` | Diagrama, infraestructura, resultados, liability, Grokster y 15-2026 |

## Requisitos

- Node.js 20 o más y `npm install` (ya hecho en esta carpeta).
- Una red que deje pasar **UDP**. Si el aula tiene captive portal o bloquea UDP, `npm run diagnose` lo muestra, y ese fallo documentado también cuenta como dato del lab.

## Kickoff con un compañero (Partes A y B)

1. Usen **exactamente el mismo string de topic** que el instructor escriba en el pizarrón (por ejemplo `cs031-s19-YYYYMMDD`). Un carácter distinto da otro topic y no se van a encontrar. Para ver su id corto:
   ```bash
   npm run topic -- "cs031-s19-YYYYMMDD"
   ```
2. Cada quien corre, con su carnet:
   ```bash
   npm run peer -- "cs031-s19-YYYYMMDD" 20230493
   ```
   Imprime su id corto, el `connection` con el id truncado del compañero, su dirección remota y los mensajes enviados y recibidos. Todo queda en `logs/kickoff.log` (la IP se enmascara en el archivo; en pantalla aparece completa).
3. Si dice `fallo: sin peers tras el tiempo de espera`, corran `npm run diagnose` y guarden `logs/diagnose.log`.
4. Al cierre, en el chat de lab: `connected: sí/no` y el id corto del topic. No peguen claves completas ni IPs en canales públicos.

## Homework

**(a) Transferir un archivo.** En la máquina que seedea:
```bash
npm run seed
```
Imprime una línea `KEY=<64 caracteres>`. En la otra máquina:
```bash
npm run fetch -- <KEY> --out downloads/received.txt
```
Verifica el SHA-256 y escribe `COMPLETO ... COINCIDE`.

**(b) Matar al seeder.** Con el downloader lento para tener ventana (`--delay-ms 200`), mata el proceso del seeder a mitad:
```bash
npm run fetch -- <KEY> --delay-ms 200 --stall-timeout-s 15
```
Anoten si completó, si quedó otro seeder y qué vio el downloader. Para probar con un segundo seeder, corran en una tercera máquina `npm run fetch -- <KEY> --keep-seeding` antes de matar al primero. La versión local automatizada es:
```bash
npm run experimento
```

## Resultados de las pruebas locales

No hubo un compañero disponible. Los peers corrieron en esta máquina o en contenedores Docker, y están marcados así.

| Prueba | Resultado | Log |
|---|---|---|
| Diagnóstico de red | Bootstrap en 4.6 s, 63 nodos, `firewalled=true` | [diagnose.log](logs/diagnose.log) |
| Mensaje entre dos peers (misma máquina) | Conectaron 0.85 s después de anunciarse; ambos recibieron el `ping` | [A](logs/kickoff-local-A.log) · [B](logs/kickoff-local-B.log) |
| Mensaje entre dos contenedores Docker (redes distintas) | Conectaron 3.5 s después de arrancar el segundo; ambos recibieron el `ping` con ≤7 ms de diferencia | [contenedor 1](logs/kickoff-contenedores-1.log) · [contenedor 2](logs/kickoff-contenedores-2.log) |
| Tu máquina ↔ contenedor Docker | **Falló:** A descubrió a B por el DHT pero los 4 intentos de conexión terminaron en `HOLEPUNCH_ABORTED` | [A](logs/kickoff-docker-A.log) · [B](logs/kickoff-docker-B.log) |
| Transferencia de 280,088 bytes (69 bloques) | Completa, SHA-256 idéntico | [exp2-seederC.log](logs/exp2-seederC.log) |
| Kill-seeder, un solo seeder | Incompleta: se atascó con 20/69 bloques | [exp1-downloader.log](logs/exp1-downloader.log) |
| Kill-seeder, con otro seeder | Completa: retomó con el seeder que quedaba, 22.8 s después del kill | [exp2-downloader.log](logs/exp2-downloader.log) |

## Segundo peer sin compañero: Docker

```bash
npm run docker
```

Requiere Docker corriendo. El script corre dos escenarios con topics únicos (para no cruzarse con otras personas) y limpia los contenedores al terminar:

1. **Tu máquina ↔ contenedor:** el contenedor está detrás de la red virtual de Docker, que a su vez está detrás de tu router. El peer A descubrió a B por el DHT, pero no logró conectar: 4 intentos, todos `HOLEPUNCH_ABORTED`, 0 conexiones. Descubrir un peer no garantiza poder conectarse; la causa probable es que el NAT no permite el hole-punch entre ambos lados (no se confirmó la causa exacta).
2. **Contenedor ↔ contenedor** (misma red de Docker): conectaron y se intercambiaron el mensaje, con dirección remota `172.x.x.x:49737`.

Esto no sustituye a un compañero real en otra red. Si consigues uno, esos logs reemplazan a los del contenedor.

## Pendiente

- El log del kickoff **con un compañero de la clase** (opcional si no hay uno disponible; en ese caso, dilo en el carnet).
- Ajustar la oración PSAV / 15-2026 de [P2P.md](P2P.md) a la conclusión de S16–S17.

## Entrega en el carnet

```markdown
## LAB # 16

[P2P.md](https://github.com/Cynthiss/Tech_F/blob/main/Lab_16/P2P.md) · [Logs del kickoff (contenedores Docker)](https://github.com/Cynthiss/Tech_F/blob/main/Lab_16/logs/kickoff-contenedores-1.log) · [Experimento kill-seeder](https://github.com/Cynthiss/Tech_F/blob/main/Lab_16/logs/exp2-downloader.log)

### Comentarios de Aprendizaje
En P2P no hay un servidor que sepa dónde está cada quien: los peers se encuentran por un topic en una DHT y se conectan directo. Aun así hubo infraestructura: los bootstrap nodes de HyperDHT. Sin un compañero usé un segundo peer en un contenedor Docker. Entre dos contenedores conectaron y vieron la clave pública, el topic y la dirección remota del socket (IP y puerto), así que P2P no es anonimato. Entre mi máquina y el contenedor el DHT los descubrió pero la conexión falló con HOLEPUNCH_ABORTED: descubrir no es lo mismo que conectar, y sin un relay no hay plan B. Al matar al seeder sin otro disponible la descarga se atascó, y con un segundo seeder terminó: la disponibilidad depende de cuántos peers sigan sirviendo.
```

## Seguridad y privacidad

- Los logs enmascaran las IPs (`FULL_ADDR=1` las guarda completas; no lo usen en un repo público).
- No suban PII ni contenido con copyright en el archivo que se comparte.
- P2P no promete anonimato: el peer ve la IP de su contraparte.
