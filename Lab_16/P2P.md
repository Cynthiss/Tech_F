# P2P.md — Lab 16: P2P sin servidor con Hyperswarm y Hypercore

> Las pruebas de este documento son reales pero **no son con un compañero**: no hubo uno disponible. Los peers corrieron en la misma máquina o en contenedores Docker (ver secciones 4 y 8).

## 1. Qué hicimos

Quitamos al provider de en medio. Con Node.js y Hyperswarm (fallback permitido, sin Pear), dos peers se descubrieron por un topic de 32 bytes, se pasaron un mensaje, replicaron un archivo de 280,088 bytes con Hypercore, y probamos qué pasa al matar al seeder a mitad de la transferencia. Los scripts y los logs están en esta carpeta.

## 2. Diagrama: del topic al intercambio

```text
 "cs031-lab16-prueba-local-..."            (string acordado)
            │ SHA-256
            ▼
   topic de 32 bytes (3e367a87…)           (un nombre de enjambre, no un servidor)
            │ join(topic, server+client)
            ▼
   HyperDHT (estilo Kademlia): announce + lookup del topic
            │   nodos de bootstrap → tabla de ruteo (63 nodos conocidos)
            ▼
   peer encontrado (clave pública, p. ej. d0b877d1)
            │ handshake cifrado (Noise) + holepunch
            ▼
   conexión directa cifrada peer ↔ peer
            │
            ├─ mensajes: "ping desde 20230493" ⇄ "ping desde prueba-local-B"
            └─ Hypercore: log append-only firmado, replicado por bloques
```

## 3. Infraestructura que sí usamos aunque "no hubiera servidor"

- **Bootstrap nodes de HyperDHT:** `node1.hyperdht.org` (88.99.3.86), `node2.hyperdht.org` (142.93.90.113) y `node3.hyperdht.org` (138.68.147.8), todos en el puerto 49737. Salen de `constants.js` de la librería. Sin al menos uno alcanzable, un peer no entra a la DHT. Nuestro diagnóstico (`npm run diagnose`) hizo bootstrap en 4.6 s y llegó a 63 nodos conocidos.
- **NAT:** el diagnóstico dijo `firewalled=true`, lo normal detrás de un router doméstico. Por eso hace falta holepunch para conectar directo. En nuestra prueba local los dos peers estaban en la misma máquina y la conexión fue por la red local, así que **no probamos un holepunch real entre redes distintas**.
- **Relays:** el holepunch se coordina a través de nodos del DHT. Hyperswarm trae una opción `relayThrough` para pasar datos por un relay, pero viene apagada por defecto y no la usamos: si el holepunch falla, la conexión falla. El "sin servidor" real es "sin servidor de aplicación propio".
- **Seeder:** en la transferencia, el peer que seedeaba era el servidor de facto de los datos. Cuando lo matamos, la descarga dependió de si quedaba otro.

## 4. Resultados de los experimentos

**Mensaje P2P (kickoff local).** Dos peers en el topic de prueba `3e367a87…`. A tardó 4 s en anunciarse en el DHT, conectó con B a los 0.85 s siguientes y el intercambio fue casi instantáneo: ambos enviaron y recibieron su `ping` con 1 ms de diferencia. Logs: [kickoff-local-A.log](logs/kickoff-local-A.log) y [kickoff-local-B.log](logs/kickoff-local-B.log).

**Dos peers en contenedores Docker (sin compañero).** El script `scripts/prueba-docker.sh` corre dos escenarios. En el segundo, dos contenedores en la misma red de Docker se descubrieron por el DHT y conectaron 3.5 s después de arrancar el segundo; ambos enviaron y recibieron su `ping` con 7 ms de diferencia ([contenedor 1](logs/kickoff-contenedores-1.log), [contenedor 2](logs/kickoff-contenedores-2.log)). Cada uno vio la clave pública de la contraparte (8 caracteres), el topic y la **dirección remota del socket** (`172.x.x.x:49737`, IP de la red de Docker).

**Fallo documentado: tu máquina ↔ contenedor** ([A](logs/kickoff-docker-A.log), [B](logs/kickoff-docker-B.log)). El peer A descubrió a B por el DHT (`peers descubiertos: 1`) pero los 4 intentos de conexión terminaron en `HOLEPUNCH_ABORTED` y ninguna se abrió; B nunca descubrió a A. Diagnóstico: el DHT sirvió para **presentar** a los peers, pero el camino directo de datos necesita atravesar el NAT, y aquí hay dos NAT encadenados (la red virtual de Docker y el router). Como no configuramos `relayThrough`, no hay plan B y la conexión simplemente no ocurre. Es la causa más probable; no la confirmamos con otra prueba. Lección: descubrir un peer no es lo mismo que poder conectarse.

**Qué vio cada peer de la contraparte:** su clave pública (de la que mostramos 8 caracteres), el topic que ambos anunciaron y la **dirección remota del socket** (IP y puerto). En la prueba entre máquinas locales fue una IP de red local (`10.x.x.x`) y entre contenedores una de la red de Docker (`172.x.x.x`). Con un compañero en otra red sería su IP pública: P2P no da anonimato.

**Transferencia con Hypercore.** Archivo `sample/lab16-sample.txt`, 280,088 bytes (menos de 1 MB, texto generado sin PII ni copyright), dividido en 69 bloques de 4,096 bytes más un bloque de cabecera con el SHA-256. El downloader verificó el hash y coincidió con el original.

**Kill-seeder** (`scripts/experimento-kill-seeder.sh`; el downloader pide un bloque cada 200 ms para tener una ventana visible):

| | Escenario 1: un solo seeder | Escenario 2: hay otro seeder |
|---|---|---|
| Qué se hizo | `kill -9` al seeder A tras 20 de 69 bloques | `kill -9` al seeder A con ~22 bloques; C ya tenía todo y seguía sirviendo |
| Qué vio el downloader | Siguió "conectado" al peer muerto; el bloque 21 nunca llegó | La conexión con A dio `ETIMEDOUT` 13.25 s después del kill |
| Resultado | **Incompleto:** se atascó a los 12 s con 20/69 bloques (29%) | **Completo:** retomó con C y terminó 22.8 s después del kill, SHA-256 idéntico |
| Logs | [exp1-downloader.log](logs/exp1-downloader.log) | [exp2-downloader.log](logs/exp2-downloader.log) |

Hallazgos: (1) matar un proceso no avisa al otro lado; el downloader tarda unos 13 s en enterarse. (2) Los bloques ya descargados se conservan localmente. (3) La disponibilidad no depende de un nodo especial, sino de cuántos seeders quedan: cuando el último desaparece, la red "olvida" el contenido, igual que un pin que se quita en IPFS.

## 5. Liability: host centralizado vs peers (hipótesis, no consejo legal)

| | Host centralizado | Usuarios que seedean / corren el runtime |
|---|---|---|
| Quién recibe takedowns | La empresa que hostea | Quien sirve el archivo; no hay un único destinatario |
| Requerimientos de una autoridad (p. ej. IVE) | A la empresa, que tiene domicilio y registros | A quien opere el servicio visible: el desarrollador, un nodo propio o quien seedea |
| Demandas | Una sola parte con recursos | Dispersas o contra individuos con IP visible |
| Kill switch | Sí, se apaga el servidor | No hay uno; hay que apagar cada seeder |

Con la arquitectura P2P la liability no desaparece: cambia de lugar y de visibilidad. Y como cada peer ve la IP del otro, quien seedea es identificable.

## 6. Grokster, y Napster contra BitTorrent

- **MGM v. Grokster (2005):** según la ficha de [Oyez](https://www.oyez.org/cases/2004/04-480), la decisión fue unánime (opinión de Souter) y sostuvo que quien distribuye software con el objeto de promover su uso para infringir, mostrado por expresión clara u otros pasos afirmativos, puede ser responsable por la infracción de terceros (inducement). Como perseguir a cada infractor era "immensely difficult", la "only practical alternative" fue la responsabilidad secundaria del distribuidor. Lección de diseño: que la arquitectura sea descentralizada no protege si el README o el marketing promueven un uso infractor.
- **Napster contra BitTorrent:** Napster tenía un índice central, así que apagarlo apagaba la red y apuntaba la demanda a la empresa. En BitTorrent (tracker o DHT) no hay un solo índice que apagar, y el enforcement se desplaza hacia operadores de trackers, desarrolladores con inducement y usuarios que seedean, cuyas IPs son visibles en el swarm. No es "BitTorrent es legal o ilegal": es cómo la arquitectura mueve a quién se puede demandar.

## 7. Oración Decreto 15-2026

Si nuestro venture es Persona Obligada (PSAV) bajo el Decreto 15-2026, "no hay servidor" no borra las obligaciones de KYC, registro y reportes: seguirían aplicando aunque el intercambio fuera P2P, y mover una función a peers solo vuelve más difícil cumplirlas. Qué conservar y por cuánto tiempo depende del reglamento del art. 127, aún pendiente de emisión. (La iniciativa 6538 no es ley.) Esta es una hipótesis condicional; ajustarla a la conclusión de S16–S17 del equipo.

## 8. Limitaciones

- Falta el log del kickoff **con un compañero de la clase**. Lo más cercano a otra red fue un contenedor Docker, y ahí el holepunch **falló** (sección 4); el único camino que sí conectó fue contenedor ↔ contenedor dentro de la misma red de Docker. No hay una prueba de dos redes reales distintas.
- No usamos Pear; usamos el fallback de Node.js con Hyperswarm que permite el lab.
- Las pruebas de transferencia y de kill-seeder fueron locales (todo en la misma máquina); en una red real los tiempos de detección pueden diferir.
