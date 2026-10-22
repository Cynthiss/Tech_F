# Fuentes verificadas del caso (revisadas el 2026-10-21)

Notas de investigación para **citar bien**: dónde está cada dato y con qué frase. No es el reporte ni el análisis: separar hecho de promesa, mapear el triángulo y decidir qué se rompe lo haces tú. Las citas son frases cortas (en inglés, como en la fuente); cítenlas donde las usen y no las copien como análisis propio.

**Fuentes abiertas y leídas:** [whitepaper (PDF, 16 págs.)](https://algorand.co/hubfs/Website-2024/PDFs/Algorand-Whitepaper-Identity%20and%20Verifiable%20Credential%20System%20for%20Chess-4.pdf) · [página del caso](https://algorand.co/universal-chess-passport) · [nota de prensa, 24 abr 2025](https://algorand.co/blog/world-chess-and-the-algorand-foundation-propose-leveling-the-playing-field-with-a-chess-passport) · [blog de Bruno Martins, 24 abr 2025](https://algorand.co/blog/why-im-excited-about-a-decentralized-identity-system-for-chess) · [renovación, 21 oct 2025](https://algorand.co/blog/algorand-and-world-chess-renewed-strategic-partnership-features-an-innovative-web3-business-model) · [anuncio regulatorio de World Chess, 20 oct 2025](https://www.investegate.co.uk/announcement/rns/world-chess--chss/two-year-partnership-with-algorand-foundation-ltd-/9181839) · [repo de demo](https://github.com/algorandfoundation/chess-passport).

## Qué se puede afirmar y con qué fuente

| Tema | Qué dice la fuente (cita corta) | Dónde | Cómo clasificarlo |
|---|---|---|---|
| Estado | "currently in development on a small scale to test its feasibility" | Whitepaper §3 y página del caso | Propuesta + piloto pequeño, no producto lanzado |
| Estado (2025) | World Chess "plans to launch" el pasaporte; el anuncio regulatorio lo llama "upcoming" y no da fechas, usuarios ni adopción de la FIDE | Renovación (21 oct 2025) y anuncio regulatorio (20 oct 2025) | Promesa |
| Autoría | Autor: Bruno Martins (Principal Architect, Algorand Foundation). Contribuyentes: World Chess y el GM Evgenij Miroshnichenko | Portada del whitepaper | Hecho |
| Revisión | Se agradece a Kim Hamilton Duffy (Executive Director, DIF) "for reviewing the proposal" | Whitepaper §3 | Hecho (está en el whitepaper, no en la nota de prensa) |
| Emisores | "the issuer could be a chess platform, such as World Chess, Chess.com, Lichess, FIDE, etc." | Whitepaper §4a | Posibilidad ("could be"), no compromiso. La página y el blog solo hablan de "chess clubs, platforms, entities" |
| Divulgación selectiva | "Tools like Zero Knowledge Proofs or selective disclosure techniques should be used where possible" | Whitepaper, principios del sistema | Aspiración ("should"); no nombra ningún formato. El blog de Martins solo dice que el jugador puede compartir "its verified title or ranking" |
| Revocación | "If a player is banned for cheating… their credentials can be revoked in a transparent manner" y "should ensure due process, establishing appeal mechanisms" | Whitepaper, objetivos | Intención. **No especifica el mecanismo** (ni lista de estado ni cómo consulta un verificador). Ni la página, ni el blog, ni la renovación lo dicen |
| Varias DIDs | "A user could decide to have multiple DIDs, and choose which one to use for different purposes" | Whitepaper, principios del sistema | Posibilidad. Ojo: el blog de Martins habla de "one secure digital identity" |
| Vinculación a identidad real | El sistema "should allow" elegir una de las DIDs para ligarla a la identidad real con KYC, "resulting in a VC" | Whitepaper, principios del sistema | Aspiración |
| Qué va on-chain | Datos personales fuera de la cadena: "storing personal information off-chain" (tensión con el derecho al olvido del GDPR). Hay un "verifiable data registry" para metadatos o pruebas | Whitepaper, principios del sistema y §4a | Hecho en el diseño; **no precisa exactamente qué se publica** |
| Frase de 24 palabras | "the 24-word seed phrase, used to backup and recover their wallet's keys" y, con las llaves, el acceso a identificadores y credenciales | Whitepaper §4 | Hecho en el diseño. Que perderla sin respaldo implique perder la identidad es una **inferencia**, márquenla como tal |
| Passkeys | Sección "Passkeys for authentication & authorization" | Whitepaper §4b.II | Hecho en el diseño |
| Comisiones | Encabezado "No fees for onboarding" | Whitepaper §4 | Solo verifiqué el encabezado, no el detalle |
| Demo (repo) | Licencia Apache-2.0; es un fork creado el 2026-03-31; el onboarding genera "the 24-word recovery phrase and initial DID keys"; el panel "contains placeholder data… as a mock" | GitHub (API y README) | Hecho: es una demo con datos de ejemplo |

## Qué las fuentes NO dicen (para "no se sabe")

- El **mecanismo de revocación** (qué lista o registro, quién lo hospeda, cómo se entera el verificador).
- El **formato de las credenciales** (el whitepaper no nombra `did:key`, `did:web`, SD-JWT, BBS ni ZK concreto).
- Qué ve exactamente la **cadena pública** más allá de "registro de metadatos o pruebas".
- Emisores **comprometidos**: solo "podrían ser" los nombrados.
- Adopción: ni cifras de usuarios ni adopción de la FIDE en ninguna fuente.

## Diferencias con el session doc: verifiquen antes de citar

1. **Último commit del repo:** el doc dice 4 may 2026; la API de GitHub muestra commits el 20 y 21 may 2026 (último push 2026-05-21).
2. **`did:key` en el demo:** en el README aparece solo como ejemplo (`did:key:z…`) dentro de "Suggested Extensions (New)", como extensión **sugerida**; el README no confirma que el demo ya lo use. Lo que sí confirma: frase de 24 palabras y "initial DID keys".
3. **Check-in por QR y subir pruebas de un evento:** no aparecen en el README; no los pude confirmar.
4. **Revisión de la DIF:** consta en el whitepaper, no en la nota de prensa.
5. **Fechas de octubre de 2025:** el anuncio regulatorio es del **20 oct** y la entrada del blog es del **21 oct**.
6. **Comisiones agrupadas por Algorand:** solo confirmé el encabezado "No fees for onboarding", no el detalle de la agrupación.
7. **ASA y NFT:** no verifiqué su ausencia en las fuentes; el doc dice que no se mencionan.

## Cómo citar

Cada afirmación sobre el caso lleva su fuente donde se usa. Si no hay fuente, se escribe "no se sabe" y se dice por qué; inventar un dato (fecha, cifra de usuarios, "la FIDE lo adoptó") es 0 en "Hecho vs promesa".
