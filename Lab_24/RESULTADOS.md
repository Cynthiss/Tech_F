## LAB # 24

### A.1 Ficha del equipo

| Dato | Equipo 1 |
|---|---|
| Tipo (laptop / teléfono) y modelo del equipo | Laptop HP Victus 15-fb3xxx |
| Sistema | Windows |
| Memoria total (RAM, GB) | 16 GB |
| L1: nombre exacto en la app y tamaño (B) | Qwen3.5-2B (2B) |
| L1: memoria a 4 bits (§4.4) | 2 × 4 ÷ 8 = 1 GB |
| L2: nombre exacto en la app y tamaño (B) | Qwen3.5-4B (4B) |
| L2: memoria a 4 bits (§4.4) | 4 × 4 ÷ 8 = 2 GB |
| ¿Caben? | Sí |
| Chat en la nube usado (N) | ChatGPT |

**Predicción:** Creo que Qwen3.5-2B (L1) será el más rápido porque tiene menos parámetros y requiere menos recursos. Además, creo que ChatGPT (N) dará las respuestas de mayor calidad por usar un modelo más avanzado en la nube.

### A.3 Tabla de medición (con calidad de A.4)

| Config. | Instr. | Primera palabra (s) | Total (s) | Tokens/s | Calidad (1–5) | Nota |
|---|---|---|---|---|---|---|
| L1 | 1 | 2.43 | 4.81 | no muestra | 2 | No respetó las tres viñetas, interpretó mal el cambio de fecha e inventó un detalle. |
| L1 | 2 | 6.88 | 7.96 | no muestra | 2 | Calculó bien 4 GB, pero añadió estimaciones sin fundamento y explicó mal la conversión de bits a bytes. |
| L1 | 3 | 3.54 | 4.92 | no muestra | 4 | Respeta el límite de palabras, pero añade explicaciones y una lista de verificación innecesarias, y cuenta mal sus palabras. |
| L2 | 1 | 26.41 | 30.79 | no muestra | 3 | Respetó las tres viñetas, pero interpretó mal el cambio de fecha. |
| L2 | 2 | 54.36 | 56.97 | no muestra | 1 | Calculó 256 GB en lugar de 4 GB (confundió los bits por parámetro). Además intentó buscar en internet y ejecutar comandos. |
| L2 | 3 | 22.54 | 25.81 | no muestra | 2 | Información principal correcta, pero redacción confusa, contenido repetido y detalles no pedidos. |
| N | 1 | 3.23 | 4.44 | no muestra | 5 | Resumen correcto en tres viñetas, con toda la información. |
| N | 2 | 3.76 | 4.54 | no muestra | 5 | Calculó 4 GB, explicó en dos líneas y respetó la instrucción. |
| N | 3 | 2.33 | 2.98 | no muestra | 5 | Mensaje claro y amable, dentro del límite de palabras y sin datos inventados. |

**Promedios (3 instrucciones):**

| Configuración | Primera palabra | Total | Calidad |
|---|---|---|---|
| L1 · Qwen3.5-2B | 4.28 s | 5.90 s | 2.67 / 5 |
| L2 · Qwen3.5-4B | 34.44 s | 37.86 s | 2.00 / 5 |
| N · ChatGPT | 3.11 s | 3.99 s | 5.00 / 5 |

**Ganador en velocidad:** ChatGPT (3.99 s de total promedio; L1 5.90 s, L2 37.86 s).
**Ganador en calidad:** ChatGPT (5.00 de promedio; L1 2.67, L2 2.00).
**¿Acertó la predicción?** Parcialmente: en calidad sí (ChatGPT). En velocidad no: pensé que L1 sería el más rápido de todos, y solo lo fue entre los dos locales.

**Condiciones de la prueba:**

| Condición | Dato real |
|---|---|
| Wi-Fi apagado o modo avión en L1 y L2 | Sí |
| Internet encendido solo para N (ChatGPT) | Sí |
| Batería al medir y si estaba conectada | 55 %, sin conectar al cargador |
| Otras apps abiertas | Word, Visual, navegador, Git y WhatsApp |
| Cada instrucción en una conversación nueva | Sí |
| QV.AC instalada desde la fuente oficial | Sí, desde https://qv.ac |
| Solo las tres instrucciones impresas de A.2, sin datos personales | Sí |

### Reflexión (3 líneas)

- **(a)** ChatGPT ganó en velocidad y en calidad: 3.99 s de total promedio contra 5.90 s de Qwen3.5-2B (≈1.5 veces más rápido) y 37.86 s de Qwen3.5-4B (≈9.5 veces), y 5.00 de calidad contra 2.67 y 2.00. Mi predicción acertó en calidad pero falló en velocidad.
- **(b)** En UniPuntos bastaría el modelo pequeño (Qwen3.5-2B) para redactar recordatorios y mensajes cortos al estudiante, como avisarle que tiene puntos para canjear (la instrucción 3 salió 4/5 en 4.92 s); corriendo local, su saldo y su situación de pago no salen del celular. No bastaría para fechas, reglas ni cuentas: en la instrucción 1 falló la fecha e inventó un detalle y en la 2 explicó mal la cuenta, y un error en una fecha de canje o en un monto le costaría un beneficio al estudiante. Eso lo debe calcular el programa con sus reglas, no el modelo.
- **(c)** Sin internet, solo mi laptop vio las instrucciones (el modelo corre en el dispositivo; "local" se refiere a dónde corre el modelo, §4.2). En la nube, vio las instrucciones la empresa que corre ChatGPT, que puede guardarlas según sus términos (§4.6).
