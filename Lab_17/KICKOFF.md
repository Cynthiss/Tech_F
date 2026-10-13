# KICKOFF.md — Lab 17, Partes A y B

**Cynthia Santos · Carnet 20230493** · CS031 Technology & Freedom

> Sin IPs completas: solo país y rol de cada hop. Las IPs se compararon en privado y están tapadas en las capturas.

## Parte A — conectar y observar

- **Fecha:** 2026-10-12
- **Red usada:** red de mi casa (ISP residencial), no la red del aula
- **Tor Browser:** versión 15.0.24 (basado en Firefox 140.17.0esr, "Navegador Tor está actualizado"), descargado de torproject.org, configuración por defecto
- **¿Conectó?** Sí, a la primera, con la configuración por defecto (pantalla "Explora. En privado.").
- **Sitio visitado:** `https://www.ufm.edu/` (página de la universidad)

### Dos hallazgos antes del circuito final

1. **Redirección a .onion.** Primero abrí `https://www.torproject.org/` y Tor Browser me llevó solo a su versión `.onion`, porque el sitio anuncia una dirección onion. El circuito mostraba guard (Reino Unido) → Alemania → Reino Unido → "Relays de sitio Onion": **no había exit**, porque el tráfico nunca salió al clearnet. Como los onion services están fuera del alcance del lab, cerré esa pestaña y usé un sitio sin versión onion. Sin cambiar ninguna configuración. Captura: [evidence/circuit-onion-torproject.png](evidence/circuit-onion-torproject.png) (IPs tapadas).
2. **403 Forbidden.** `https://www.ufm.edu/` respondió `403 Forbidden` por Tor, pero **cargó normal en el navegador de siempre**. El circuito sí llegó: el exit se conectó con el servidor y fue el servidor el que rechazó la petición. La lista de exits de Tor es pública, así que el sitio sabe que la petición viene de Tor, aunque no sepa quién la hace. Es el costo "bloqueos de exits por terceros" del THREAT.md, visto en vivo. Captura: [evidence/ufm-403-tor.png](evidence/ufm-403-tor.png).

### Circuito 1 (captura: [evidence/circuit-1.png](evidence/circuit-1.png))

| Hop | Rol | País |
|---|---|---|
| 1 | This browser (yo) | — |
| 2 | Guard | Estados Unidos |
| 3 | Middle | Finlandia |
| 4 | Exit | Alemania |
| 5 | Sitio | `www.ufm.edu` (respondió 403) |

### Circuito 2, después de "Nuevo circuito Tor para este sitio" (captura: [evidence/circuit-2.png](evidence/circuit-2.png))

| Hop | Rol | Circuito 1 | Circuito 2 | ¿Cambió? |
|---|---|---|---|---|
| 2 | Guard | Estados Unidos | Reino Unido | Sí (ver abajo) |
| 3 | Middle | Finlandia | Alemania | Sí |
| 4 | Exit | Alemania | Alemania (otro relay, otra IP) | Sí: mismo país, relay distinto |
| 5 | Sitio | `ufm.edu` (403) | `ufm.edu` (403 otra vez) | No |

**Qué cambió y qué no:** el middle y el exit son relays nuevos (Finlandia → Alemania; el exit sigue en Alemania pero es otro relay). El sitio volvió a responder 403: con cualquier exit, la UFM ve que la conexión viene de Tor. Lo que no esperaba es que el guard **también** apareciera distinto.

### Lo que pasó con el guard (observación honesta)

| Momento | Sitio | Guard |
|---|---|---|
| ~4:57 p.m. | torproject.org (.onion) | Reino Unido, relay **A** |
| Noche, circuito 1 | ufm.edu | Estados Unidos, relay **B** |
| Noche, circuito 2 | ufm.edu | Reino Unido, relay **A** (misma IP que a las 4:57, comparada en privado) |

El relay A apareció en la primera prueba y volvió horas después: **ese es mi guard estable**. Tor no usa un solo guard sino una lista corta de *primary guards* y usa el primero que responda; mi lectura es que el relay B de Estados Unidos fue un guard de respaldo de esa lista mientras A no estaba disponible, y que al armar el circuito nuevo Tor volvió a A. No lo puedo confirmar desde el navegador, así que lo dejo como hipótesis. Lo que sí confirma la observación: el guard **no** se sortea en cada circuito como el middle y el exit (en las tres capturas el panel dice "Tu nodo guard no puede ser cambiado", y el mismo relay A reaparece). Si el guard rotara en cada circuito, tarde o temprano caería en uno malicioso que vería mi IP; por eso Tor lo fija por 2–3 meses.

## Parte B — quién-ve-qué en mi circuito real

Sitio: `https://www.ufm.edu/` · Guard en Estados Unidos · Middle en Finlandia · Exit en Alemania (circuito 1)

| Punto | Qué ve | Qué no ve |
|---|---|---|
| **Red local / ISP** (red de mi casa) | Mi IP; que estoy usando Tor (la IP del guard en Estados Unidos es pública); cuántos bytes mando y cuándo | A qué sitio voy; el contenido |
| **Guard** (Estados Unidos) | Mi IP; la IP del middle; volumen y tiempos de mi tráfico | El destino; el contenido (le llegan 2 capas de cifrado aún puestas) |
| **Middle** (Finlandia) | La IP del guard y la del exit | Mi IP; el destino; el contenido |
| **Exit** (Alemania) | El destino (`www.ufm.edu` y su IP); la IP del middle; como el sitio es HTTPS, solo bytes cifrados con TLS, su tamaño y sus tiempos | Mi IP; el contenido (URL completa, cookies, formularios) |
| **Sitio** (`www.ufm.edu`) | La IP del exit en Alemania (no la mía) y, por eso, **que vengo de Tor**: la usó para responder 403. Además, lo que yo le dé (cookies, login, formularios) y la huella del navegador, igual a la de todos los usuarios de Tor Browser | Mi IP real; quién soy |

### Contraste con el navegador normal

Abrí `https://www.ufm.edu/` en mi navegador normal y **cargó sin problema**.

- **El sitio** me dejó pasar porque vio una IP normal, no un exit de Tor. Ve mi IP pública real (la de mi casa), y con ella mi ubicación aproximada y mi proveedor. También puede ligarme con cookies de visitas anteriores y con una huella de navegador más única.
- **Mi ISP (red de casa)** ve mi IP, la IP del servidor y el hostname (`www.ufm.edu`, por el DNS y el SNI de TLS), además de la hora y el volumen. No ve el contenido porque es HTTPS.
- Con Tor, mi ISP solo ve que hablo con un guard de Tor; el sitio solo ve un exit. La información de "quién ↔ con quién" quedó repartida.

### Frase del exit malicioso

> Si el exit fuera malicioso, con este sitio HTTPS podría ver **el dominio al que me conecto, la IP del servidor, la hora y cuántos bytes van y vienen**, y no podría ver **mi IP, la URL completa ni el contenido de las páginas, cookies o formularios**, porque TLS va de mi navegador al sitio y el exit solo reenvía bytes cifrados.

### Chat de lab

```
connected: sí
el exit ve: el destino (www.ufm.edu) y el volumen/tiempos, pero no mi IP ni el contenido (HTTPS)
```
