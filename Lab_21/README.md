# Lab 21 — La cueva con monedas y reporte de un caso ZK real (Sesión 24)

Dos partes: (1) sentir con una moneda por qué repetir retos vuelve casi imposible hacer trampa, y (2) analizar un caso real de pruebas de conocimiento cero (ZKP): qué prueba, qué esconde, quién verifica y qué confianza queda.

**Formato:** solo en clase, ~30 minutos, **sin computadora**, sin instalar nada, sin código. Todo es papel. En tríos (Probador, Verificador y Anotador, que rotan en la Parte A). **Lo que se entrega es una foto de las tablas llenas a mano**, así que esta carpeta no puede contener la entrega: contiene la preparación.

## Qué llevar

- **Papel y una moneda.** Nada más. Ni computadora ni celular para resolver el lab.

## Plan de los 30 minutos

| Tiempo | Qué se hace | Dónde se anota |
|---|---|---|
| 2 min | Dibujar la cueva: un anillo con dos caminos A y B y una puerta al fondo. El instructor reparte en secreto "SÍ sabe la palabra" o "NO sabe" | La hoja |
| 8 min | 10 rondas: el probador escribe A o B boca abajo; el verificador lanza la moneda (cara = A, sello = B); el anotador marca ✓ o ✗ y **para en el primer ✗**. Rotan roles | Tabla de rondas (A.1) |
| 3 min | Anotar en qué ronda cayó cada tramposo y calcular la probabilidad de pasar n rondas (½ⁿ). Responder: ¿el verificador aprendió la palabra? ¿una foto de las anotaciones convencería a otro trío? | A.1 |
| 15 min | El instructor asigna un caso de §4.9 (UE, Zcash, World ID o un zk-rollup). Llenan la ficha de 7 filas usando **solo** §4 y las fuentes de §9 | Ficha (A.2) |
| 2 min | Foto de la tabla de rondas y de la ficha, y súbanla al PR | `## LAB # 21` |

## Reglas

- Nada de computadoras, código, apps ni instalaciones.
- **Cero datos personales reales** (DPI, fecha de nacimiento, carnet real, caras en la foto). Cualquier PII real = 0 en todo el lab.
- **No inventen datos del caso:** si algo no está en §4 o §9 del session doc, escriban **"no verificado"**.
- No citen leyes extranjeras (UE) como si fueran guatemaltecas.

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| [PLANTILLA.md](PLANTILLA.md) | La tabla de rondas (A.1), la ficha de caso de 7 filas (A.2) y la reflexión, en blanco, para copiar a mano |
| [REFERENCIA.md](REFERENCIA.md) | La tabla de ½ⁿ ya calculada y el vocabulario general de ZK |
| `diagramas/` | 4 diagramas en SVG: [la cueva](diagramas/cueva.svg), [una ronda](diagramas/ronda.svg), [½ⁿ](diagramas/probabilidad.svg) y [dónde queda la confianza](diagramas/confianza.svg) |
| `index.html` | Página del lab (estado) |

## Lo que falta

Todo lo que ocurre en clase: la cueva con la moneda, las anotaciones reales, el caso asignado y las fotos. Cuando te asignen el caso, pásame el texto de §4 y §9 del session doc y te preparo una hoja de **hechos verificados con su fuente** para esa ficha, como la de `FUENTES.md` del Lab 20.
