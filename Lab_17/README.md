# Lab 17 — Tor Browser: circuit display + THREAT.md (Sesión 20)

**Cynthia Santos · Carnet 20230493** · CS031 Technology & Freedom

Lab de observación y análisis, no de operación de red. Se observa un circuito real de Tor Browser oficial (guard → middle → exit → sitio), se convierte en una tabla de quién-ve-qué y se escribe el threat model de un data flow del venture en [THREAT.md](THREAT.md).

Stack: Tor Browser oficial (https://www.torproject.org/download/) en configuración por defecto · navegador normal para contraste · lectura de la intro oficial de I2P (sin instalarlo).

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| [index.html](index.html) | Página del lab para el carnet: circuito, tabla quién-ve-qué, resumen de THREAT.md |
| [KICKOFF.md](KICKOFF.md) | Notas de las Partes A y B: circuito observado, cambio con "New Tor Circuit", tabla quién-ve-qué, contraste con navegador normal |
| [THREAT.md](THREAT.md) | Homework: threat model de un flow del venture, Solo HTTPS vs Tor vs I2P |
| `evidence/` | Capturas del circuit display, con las IPs tapadas |

## Pasos del kickoff

1. Descargar Tor Browser **solo** desde https://www.torproject.org/download/ (macOS: abrir el `.dmg` y arrastrarlo a Aplicaciones). No mirrors ni links de chats.
2. Abrirlo y dar **Connect** con la configuración por defecto. Si la red del aula bloquea Tor, anotar el mensaje de error en [KICKOFF.md](KICKOFF.md) y esperar la red que autorice el instructor. No usar bridges.
3. Visitar el sitio HTTPS del pizarrón (p. ej. `https://www.torproject.org/`).
4. Clic en el ícono a la izquierda de la URL (candado / info del sitio) → aparece **Tor circuit**: `This browser` → guard (país) → relay (país) → relay (país) → dominio.
5. Captura de pantalla (`Cmd + Shift + 4`) y guardarla en `evidence/circuit-1.png`. **Tapar las IPs** antes de subirla (Vista Previa → Herramientas → Anotar → rectángulo relleno).
6. Clic en **New Tor circuit for this site**, abrir otra vez el circuit display, captura en `evidence/circuit-2.png` y anotar qué cambió.
7. Abrir el mismo sitio en el navegador normal y llenar la Parte B de [KICKOFF.md](KICKOFF.md).
8. En el chat de lab: `connected: sí` + `el exit ve: el destino (www.ufm.edu) y el volumen/tiempos, pero no mi IP ni el contenido (HTTPS)`.

## Entrega en el carnet

```markdown
## LAB # 17

[THREAT.md](https://github.com/Cynthiss/Tech_F/blob/main/Lab_17/THREAT.md) · [Notas del kickoff](https://github.com/Cynthiss/Tech_F/blob/main/Lab_17/KICKOFF.md) · ![Circuit display](https://github.com/Cynthiss/Tech_F/blob/main/Lab_17/evidence/circuit-1.png?raw=true)

### Comentarios de Aprendizaje
HTTPS cifra el payload pero no esconde quién habla con quién: sin Tor, la red local ve el destino y el sitio ve mi IP. En mi circuito real hacia www.ufm.edu el guard estaba en Estados Unidos, el middle en Finlandia y el exit en Alemania; al pedir un circuito nuevo cambiaron el middle y el exit, y el guard volvió al mismo relay de Reino Unido que había usado horas antes: el guard no se sortea en cada circuito, se mantiene por meses (de una lista corta de primary guards) para reducir el riesgo de caer en uno malicioso. La UFM respondió 403 por Tor y cargó normal sin Tor: el sitio no sabe quién soy, pero sí que vengo de un exit, y eso tiene un costo de acceso. Ningún relay conoce a la vez mi IP y el destino, pero Tor no me protege si inicio sesión, si un adversario ve ambos extremos (correlation) o si la app sale por fuera de Tor Browser. Y si el venture es Persona Obligada, que el usuario llegue por Tor no cambia nada de su KYC: el venture sigue viendo quién es, aunque no vea su IP.
```

## Límites respetados

Solo Tor Browser oficial en modo default; solo sitios clearnet HTTPS públicos; sin onion services, eepsites, relays ni bridges; sin reconfigurar la selección de nodos; sin evadir controles de red de ninguna institución.
