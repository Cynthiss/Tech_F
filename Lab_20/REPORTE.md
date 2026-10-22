## LAB # 20

Mi lectura, en pocas palabras: el Global Chess Passport es todavía una idea con una demostración, no un producto. Cada jugador tendría su propia identidad digital (una DID) y guardaría credenciales firmadas por quien sabe algo de él, como su rating o si hizo trampa. Cuando otra plataforma se lo pide, el jugador la presenta sin que el emisor participe cada vez. Lo importante, como la revocación o cuánto dato se oculta, casi todo está sin definir.

### A.1 Encabezado

| Campo | Respuesta |
|---|---|
| Nombre y carnet | Cynthia Santos · 20230493 |
| Caso | Algorand + World Chess: Global Chess Passport |
| Estado real (hecho vs promesa, con fuente) | **Hecho:** Algorand y World Chess publicaron la propuesta (nota de prensa del 24 abr 2025), y el [whitepaper](https://algorand.co/hubfs/Website-2024/PDFs/Algorand-Whitepaper-Identity%20and%20Verifiable%20Credential%20System%20for%20Chess-4.pdf) dice que el sistema está "currently in development on a small scale to test its feasibility". El [repo de demostración](https://github.com/algorandfoundation/chess-passport) usa datos de ejemplo ("placeholder data… as a mock"). **Promesa:** el pasaporte global es algo "upcoming"; la [renovación de la alianza](https://algorand.co/blog/algorand-and-world-chess-renewed-strategic-partnership-features-an-innovative-web3-business-model) dice que World Chess "plans to launch"; en las fuentes que leí no hay fecha de lanzamiento. En las fuentes que leí no hay cifras de usuarios ni adopción de la FIDE. |

### A.2 Sección 1: Triángulo

| Credencial | Emisor | Holder | Verificador |
|---|---|---|---|
| "Rating ≥ 2000" | La plataforma u organización que lleva el rating | El jugador, en su billetera | Otra plataforma u organizador de torneo |
| "Buena conducta" | La plataforma que detecta y sanciona la trampa | El jugador | Otra plataforma u organizador de torneo |

El emisor firma, el holder guarda y el verificador comprueba (§4.5). El [whitepaper](https://algorand.co/hubfs/Website-2024/PDFs/Algorand-Whitepaper-Identity%20and%20Verifiable%20Credential%20System%20for%20Chess-4.pdf) dice que el emisor "could be" World Chess, Chess.com, Lichess o la FIDE: son posibles, no hay ninguno comprometido. "Buena conducta" me parece más un estado que se puede quitar que un dato fijo; eso es interpretación mía.

### A.3 Sección 2: Quién ve qué

| Actor | ¿Qué ve? | ¿Qué no ve? | Fuente |
|---|---|---|---|
| Emisor (ej. World Chess) | Los datos que él mismo firmó | Dónde ni a quién se presenta la credencial (§4.10), si la revocación se consulta de forma que no lo delate | No se especifica cómo se consulta |
| Jugador (holder) | Todo: sus credenciales y sus llaves | Nada | Whitepaper: la frase de 24 palabras respalda sus llaves |
| Verificador (otra plataforma / torneo) | Lo que el jugador le muestre, más su DID, el emisor y la firma | Lo que el jugador no revele, si hay divulgación selectiva | Whitepaper (la divulgación es solo un deseo) |
| Cadena pública (Algorand) | Un registro de metadatos o pruebas; la DID "anclada" | Los datos personales, que van fuera de la cadena | Whitepaper y [blog de Bruno Martins](https://algorand.co/blog/why-im-excited-about-a-decentralized-identity-system-for-chess) |
| Quien roba la frase de 24 palabras | Todo lo que ve el jugador, y puede firmar como él | Nada | Whitepaper: con la frase se recuperan las llaves y el acceso a identificadores y credenciales |

Lo que queda fuera de la cadena son los datos personales: el whitepaper habla de "storing personal information off-chain". Qué va exactamente en la cadena no se sabe, solo que hay un registro de metadatos o pruebas.

### A.4 Sección 3: Divulgación selectiva, revocación, correlación

| Pregunta | Sí / No / No se sabe | Cita de la fuente | Concepto de §4 |
|---|---|---|---|
| ¿Pueden mostrar solo un dato (ej. el título) y ocultar el resto? | No se sabe | "Tools like Zero Knowledge Proofs or selective disclosure techniques should be used where possible" (whitepaper) | §4.7 |
| ¿Quién puede revocar, y cómo se entera el verificador? | Se puede revocar, pero no se sabe cómo | "their credentials can be revoked in a transparent manner" (whitepaper) | §4.9 |
| ¿Dos plataformas pueden unir su historial? | Sí, si se usa una sola DID | "A user could decide to have multiple DIDs, and choose which one to use" (whitepaper) | §4.10 / D7 |

En divulgación selectiva el texto dice "should", así que es un deseo y no nombra ningún formato. En revocación **el mecanismo no está especificado**: no dice si hay lista de estado, ni dónde, ni cómo la consulta un verificador. En correlación, con una sola DID en todas las plataformas se puede unir el historial; el whitepaper permite varias DIDs, pero el blog habla de una sola identidad, así que no sé cuál sería la normal.

### A.5 Secciones 4 y 5: Qué se rompe y un cambio de diseño

**Falla 1.** Un emisor revoca por error o por un baneo injusto. Como la idea es que la reputación viaje entre plataformas, al jugador lo marcarían en varios lugares a la vez. El whitepaper pide apelación y "transparent criteria for credential reinstatement", pero no dice quién decide ni en cuánto tiempo.

**Falla 2.** El jugador pierde la frase de 24 palabras o se la roban. Si la pierde sin respaldo, no podría recuperar su identidad (inferencia mía, el texto habla de "backup and recover"). Si se la roban, alguien puede presentarse como él hasta que un emisor revoque (§4.10).

**Un cambio de diseño.** Que la revocación no sea global: cada emisor publica su propia lista de estado (§4.9) con un proceso de apelación escrito, y cada verificador decide a cuáles hace caso. Así un error de un emisor no se vuelve un castigo en todos lados. Ataca la falla 1.

**Fuentes:** [whitepaper](https://algorand.co/hubfs/Website-2024/PDFs/Algorand-Whitepaper-Identity%20and%20Verifiable%20Credential%20System%20for%20Chess-4.pdf) · [blog de Bruno Martins](https://algorand.co/blog/why-im-excited-about-a-decentralized-identity-system-for-chess) · [renovación de la alianza](https://algorand.co/blog/algorand-and-world-chess-renewed-strategic-partnership-features-an-innovative-web3-business-model) · [repo de demostración](https://github.com/algorandfoundation/chess-passport)
