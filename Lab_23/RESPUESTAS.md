# Respuestas y ejemplo resuelto (Lab 23)

## A.4 Inventario post-cuántico de Remesas Volcán Prueba

Razonado con §4.4 del session doc. Los años son **supuestos del ejercicio** (la venture es ficticia); donde la ley podría fijar un plazo, no lo inventamos: "por confirmar con asesoría legal".

| # | ¿Qué protege? | ¿Cuántos años debe durar? | Riesgo y tipo | Prioridad | Acción |
|---|---|---|---|---|---|
| 1 | La conexión cifrada (web) entre la app y el servidor, con nombre, monto y destinatario de cada envío | 10 o más (historial financiero de clientes; supuesto) | **Alto: cosechar ahora.** El acuerdo de llaves clásico (X25519 / RSA) lo rompería una computadora cuántica grande | **1** | **Migrar a híbrido** (X25519 + ML-KEM, como ya hace Chrome) |
| 2 | Archivo de fotos de DPI y datos KYC de clientes | Los años que exija conservarlo la ley (por confirmar con asesoría legal); idealmente, ninguno | **Alto: cosechar ahora** (si se transmite o respalda con llaves públicas clásicas, o se roba hoy) | **1** | **Borrar** lo que la ley no exija conservar; lo que deba quedar, con cifrado simétrico y llaves de transporte híbridas |
| 3 | La billetera de tesorería en Bitcoin, con una dirección reutilizada hace 3 años (su llave pública ya está expuesta) | Mientras haya fondos en esa dirección (años) | **Alto: falsificar firma después.** Con la llave pública expuesta, Shor calcularía la llave privada y firmaría un gasto | **2** (o 1) | **Mover los fondos a direcciones nuevas y no reutilizar** |
| 4 | El chat de soporte con clientes, por Signal | Años (puede incluir datos personales) | **Bajo.** Signal ya usa PQXDH al iniciar y SPQR durante la conversación | **3** | Nada por ahora (mantener la app actualizada) |
| 5 | El precio dólar a quetzal que muestra la app (dato público) | 0: no es un secreto | **Bajo.** No hay nada que cosechar | **3** | Nada |
| 6 | Un respaldo de la base de datos cifrado con una contraseña larga (cifrado simétrico) | Años (mientras exista el respaldo) | **Bajo.** El cifrado simétrico con llave larga sale poco debilitado | **3** | Nada por ahora (contraseña larga y bien guardada) |

**Por qué ese orden:** primero lo que **dura años y se puede cosechar hoy** (1 y 2); después lo que se falsifica cuando llegue la cuántica (3); y al final lo que ya está cubierto o no es secreto (4, 5, 6). Sobre cuándo llega una computadora cuántica grande: **desconocido**.

## A.2 Promedio secreto: ejemplo resuelto (solo para aprender el método)

> **No es la tabla de tu trío.** Son tres personas ficticias con salarios de la lista de tarjetas. Tu A.2 tiene que salir de tus propias tarjetas y piezas.

**1. Partir el salario** (cada quien: dos piezas inventadas, la tercera = salario − las otras dos):

| Persona | Salario | Piezas | Revisión |
|---|---|---|---|
| 1 | 4,200 | 1,500 · −700 · 3,400 | 1,500 − 700 + 3,400 = 4,200 ✓ |
| 2 | 6,700 | 3,100 · 2,200 · 1,400 | 3,100 + 2,200 + 1,400 = 6,700 ✓ |
| 3 | 8,900 | −900 · 5,000 · 4,800 | −900 + 5,000 + 4,800 = 8,900 ✓ |

**2. Repartir:** cada quien se queda la primera pieza, da la segunda a la persona de al lado y la tercera a la otra.

**3. Sumar y anunciar** (tabla A.2):

| Integrante | Pieza que se quedó | Recibida 1 | Recibida 2 | Suma parcial anunciada |
|---|---|---|---|---|
| Persona 1 | 1,500 | 1,400 (de P2) | 5,000 (de P3) | **7,900** |
| Persona 2 | 3,100 | −700 (de P1) | 4,800 (de P3) | **7,200** |
| Persona 3 | −900 | 3,400 (de P1) | 2,200 (de P2) | **4,700** |

Total = 7,900 + 7,200 + 4,700 = **19,800** · Promedio = 19,800 ÷ 3 = **6,600** · Al voltear las tarjetas: 4,200 + 6,700 + 8,900 = 19,800 ✓ (coincide).

Nadie aprendió ningún salario: cada pieza recibida sola es un número al azar.

**4. Colusión:** si las Personas 1 y 2 se juntan sin la 3, **juntan sus propios salarios (4,200 y 6,700) y el total (19,800)**, y restan: 19,800 − 4,200 − 6,700 = **8,900** = el salario de la Persona 3 ✓. Con 2 de 3 coludidos, el secreto del tercero cae.

## Reflexión (3 líneas)

- **(a)** En el promedio secreto tuve que confiar en que los otros dos no se pusieran de acuerdo (y en que anunciaran su suma parcial verdadera). Se rompió cuando dos se juntaron: con sus salarios y el total restaron y sacaron el del tercero.
- **(b)** El que más urge es el **#1 (la conexión cifrada)**: lo que un atacante graba hoy se abre cuando exista una computadora cuántica, así que "más adelante" no sirve; migrar después no protege lo que ya se grabó.
- **(c)** *(ajústala a tu venture)* Calcularía un promedio de ingresos de mis clientes repartido entre varias partes (MPC) en lugar de juntar los datos, y migraría primero a híbrido el acuerdo de llaves de la conexión con los clientes, porque es lo que se puede "cosechar ahora, descifrar después".
