# Fichas de caso preparadas (Parte B, Apéndice A.2)

Notas de preparación para las 7 filas de los **cuatro casos** de §4.9. Cada celda sale de §4 o §2 del session doc (se indica cuál) o de una fuente de §9 (con su enlace). Lo que ninguna fuente dice aparece como **"no verificado"**, como pide el lab. Copia a mano **los casos que te toque entregar** (en tu caso, los cuatro), con tus palabras, y cita en cada uno una fuente de §9.

## Caso 1: Verificación de edad de la UE (extranjero)

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Qué afirmación se prueba? | "Tengo una atestación de edad válida, vigente, con mayor de 18 = sí" (§4.9) |
| 2 | ¿Cuál es el dato secreto? | La credencial con la fecha de nacimiento, el nombre y la identidad, y su firma ECDSA (§4.6, §4.9, glosario ECDSA) |
| 3 | ¿Quién es probador y quién verificador? | Probador: la persona usuaria con su app (holder). Verificador: el sitio web (§4.9) |
| 4 | ¿Qué ve el verificador (y qué no)? | Solo que la afirmación es cierta, más datos públicos (lista de emisores, nonce). No ve nombre, fecha de nacimiento ni identidad, y las pruebas no son vinculables (§4.9, §4.10) |
| 5 | ¿Interactiva o no? ¿SNARK o STARK? ¿Configuración confiable? | **No interactiva** (las apps usan pruebas no interactivas, §4.5; el anexo no lo dice expresamente). **SNARK:** el anexo habla de un "zkSNARK prover" (Anexo B, §9). **Sin configuración confiable:** "This solution does not require a trusted setup phase" (Anexo B, §9) |
| 6 | ¿Qué confianza queda? | **El emisor** de la atestación (pasaporte, banco, oficina postal), **el circuito** (en 2025 se encontró un error en el circuito mdoc de Longfellow, corregido en la v0.8.4, §4.6) y **la app del Estado** (§4.9). El anexo avisa que es "experimental" y "has not been peer-reviewed" |
| 7 | Fuente de §9 | [Anexo B de ageverification.dev](https://ageverification.dev/Technical%20Specification/annexes/annex-B/annex-B-zkp/) · [Google, Longfellow](https://blog.google/innovation-and-ai/technology/safety-security/opening-up-zero-knowledge-proof-technology-to-promote-privacy-in-age-assurance/) |

**Para la reflexión (b), este caso:** si el emisor firmó una fecha de nacimiento falsa, la prueba "mayor de 18" sale perfecta y falsa (§4.2); o si al circuito le falta una revisión (circuito sub-restringido, §4.6), un tramposo mete un dato falso y la prueba pasa.

## Caso 2: Zcash (pagos blindados)

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Qué afirmación se prueba? | "Esta transacción no crea ni destruye dinero y quien gasta es dueño" (§4.9) |
| 2 | ¿Cuál es el dato secreto? | El remitente, el destinatario y el monto de un pago blindado (§4.9, glosario "Pago blindado") |
| 3 | ¿Quién es probador y quién verificador? | Probador: quien hace el pago. Verificador: todos los nodos de la red (§4.9) |
| 4 | ¿Qué ve el verificador (y qué no)? | Solo la prueba de que la transacción cuadra. No ve remitente, destinatario ni monto en los pagos blindados (§4.9) |
| 5 | ¿Interactiva o no? ¿SNARK o STARK? ¿Configuración confiable? | **No interactiva** y **SNARK** (los zk-SNARK son "Non-interactive", §2.2; Zcash aparece como SNARK en §4.7). **Configuración confiable:** sí hasta 2022 (una ceremonia antes del lanzamiento de 2016 y otra con más de cien participantes para Sapling en 2018). Desde NU5 (31 may 2022), Orchard usa **Halo 2, sin configuración confiable** (§4.7) |
| 6 | ¿Qué confianza queda? | **El circuito y el sistema de pruebas:** en 2019 se reveló un fallo en BCTV14 que en teoría permitía falsificar monedas (ECC dice que lo corrigió con Sapling y que no cree que se explotara). **La ceremonia:** si todos hubieran guardado su secreto, habrían podido crear monedas de la nada. Además, muchos usuarios no usan la parte blindada (§4.7, §4.9) |
| 7 | Fuente de §9 | [Zcash, conceptos básicos](https://zcash.readthedocs.io/en/latest/rtd_pages/basics.html) · [ECC, NU5 en mainnet](https://electriccoin.co/blog/nu5-activates-on-mainnet-eliminating-trusted-setup-and-launching-a-new-era-for-zcash/) |

**Para la reflexión (b), este caso:** si el circuito o el sistema de pruebas tienen un fallo, se podrían aceptar pruebas falsas y crear dinero de la nada sin que se note (el caso BCTV14, 2019).

## Caso 3: World ID

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Qué afirmación se prueba? | "Soy una persona verificada y no he hecho esta acción antes" (§4.9) |
| 2 | ¿Cuál es el dato secreto? | El secreto de la persona, cuyo compromiso (sobre cerrado) está en un registro público; no se revela cuál persona es (§4.8) |
| 3 | ¿Quién es probador y quién verificador? | Probador: la persona, con la app que calcula la prueba en el teléfono (§4.8). Verificador: la app (o un contrato) (§4.9) |
| 4 | ¿Qué ve el verificador (y qué no)? | La prueba y un **nullifier** por app y acción. No ve cuál persona es y no puede vincular el nullifier con otros ni con la identidad (§4.8, §4.9) |
| 5 | ¿Interactiva o no? ¿SNARK o STARK? ¿Configuración confiable? | **No interactiva** y **SNARK** (World ID aparece como SNARK en §2.2). **Groth16**, que tiene configuración confiable por circuito y "lo usa World ID" (§2.2): sí hay configuración confiable |
| 6 | ¿Qué confianza queda? | **El registro biométrico (el Orb)**, **la empresa** y **los nodos del nullifier** (World ID 4.0) (§4.9). La ZKP protege el uso, pero el registro depende del escaneo de iris (§4.8) |
| 7 | Fuente de §9 | [World, Privacy at World: deep dive](https://world.org/blog/developers/privacy-deep-dive) (fuente primaria interesada) · [Conceptos de World ID](https://docs.world.org/world-id/concepts) |

**Para la reflexión (b), este caso:** la prueba solo garantiza que "estoy en el registro"; si el registro biométrico acepta a alguien que no debería o duplica a una persona, la ZKP prueba "persona única" sobre algo falso.

## Caso 4: zk-rollups (Starknet, ZKsync Era, Linea, Scroll)

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Qué afirmación se prueba? | "Estos miles de transacciones se ejecutaron correctamente" (§4.9) |
| 2 | ¿Cuál es el dato secreto? | **No hay un dato secreto importante:** los datos se publican. Aquí ZK se usa por concisión, no por privacidad (§4.9) |
| 3 | ¿Quién es probador y quién verificador? | Probador: el operador del rollup, que procesa las transacciones y genera la prueba (§4.9, D7). Verificador: un contrato en Ethereum (§4.9) |
| 4 | ¿Qué ve el verificador (y qué no)? | La prueba de validez junto al resumen nuevo; Ethereum comprueba solo la prueba, mucho más barato que rehacer el trabajo. Los datos son públicos (§4.9, D7) |
| 5 | ¿Interactiva o no? ¿SNARK o STARK? ¿Configuración confiable? | **No interactiva** (§4.5). **Starknet usa STARK** (sin configuración confiable); **ZKsync, Linea y Scroll usan SNARK de tipo PLONK**, con configuración confiable reutilizable (§2.2, §4.7, §4.9) |
| 6 | ¿Qué confianza queda? | **Quién opera el probador:** L2BEAT marca a los cuatro como "permissioned". **Las configuraciones confiables** en las variantes SNARK (§4.9) |
| 7 | Fuente de §9 | [L2BEAT, resumen de redes L2](https://l2beat.com/layer2s/summary) · [Catálogo ZK de L2BEAT](https://l2beat.com/zk-catalog) |

**Para la reflexión (b), este caso:** si el circuito está mal escrito o, en las variantes SNARK, alguien guardó el secreto de la configuración confiable, se podrían probar transacciones falsas (§4.6, §4.7). Que el operador sea "permissioned" es otro punto de confianza (control del sistema), pero no hace falsa la prueba por sí solo.

## Para la reflexión (a) y (c)

- **(a)** Lo que convenció al verificador sin oír la palabra fue la repetición: un tramposo solo acierta la mitad de las veces, así que pasar 10 rondas seguidas por suerte tiene probabilidad 1/1024 (§4.3).
- **(c)** Es tuya: piensa **una regla sobre tu cliente que hoy compruebas guardando un dato** (por ejemplo "mayor de 18", "reside en Guatemala") y que podrías comprobar con una prueba en lugar de guardar el dato (§7). Si la regla es un deber legal (KYC), escríbelo como pregunta para asesoría legal.

## Sobre la tabla de rondas oficial (Apéndice A.1)

La plantilla oficial tiene **4 columnas**: Probador (nombre ficticio), Papel secreto (SÍ / NO), Ronda en que falló (o 10/10) y Probabilidad de llegar ahí siendo tramposo (½ⁿ), más dos preguntas debajo (¿el verificador aprendió la palabra? y ¿una foto convencería a otro trío?). La tabla que dibujaste con R1 a R10 sirve si **incluye esas 4 cosas** y las dos preguntas.
