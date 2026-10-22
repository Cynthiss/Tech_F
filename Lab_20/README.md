# Lab 20 — Caso real: el Global Chess Passport de Algorand + World Chess (Sesión 23)

Análisis de una propuesta real que usa el vocabulario de S23 (DID, credencial verificable, emisor, holder, verificador, revocación, divulgación selectiva), separando **hecho** (con fuente) de **promesa**.

**Formato:** solo en clase, ~30 min, **individual**, sin código y sin instalar nada. El reporte (300 a 500 palabras) lo escribes tú con la plantilla del Apéndice A y se entrega antes de salir, bajo `## LAB # 20`, en tu carnet.

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| [PLANTILLA.md](PLANTILLA.md) | El Apéndice A en blanco, para llenar en clase |
| [FUENTES.md](FUENTES.md) | Qué dice cada fuente, con frase corta y dónde está; qué **no** dicen; y las diferencias con el session doc |
| [REPORTE.md](REPORTE.md) | El reporte redactado (406 palabras de texto) con la plantilla completa |
| `index.html` | Página del lab (estado) |

El reporte ya está redactado en `REPORTE.md`, usando solo lo que se verificó en las fuentes (ver `FUENTES.md`); léelo y ajústalo para que sea tuyo antes de entregarlo.

## Plan de los 30 minutos

| # | Tiempo | Qué hacer | Dónde se anota |
|---|---|---|---|
| 1 | 5 min | Leer el caso y las dos tablas del session doc; marcar qué es hecho (con fuente) y qué es promesa | Fila "Estado real" (A.1) |
| 2 | 7 min | Triángulo para 2 credenciales: "rating ≥ 2000" y "buena conducta" | A.2 |
| 3 | 6 min | Tabla de quién ve qué (emisor, jugador, verificador, cadena pública, quien roba la frase) | A.3 |
| 4 | 6 min | Divulgación selectiva, revocación y correlación: sí / no / no se sabe, con cita | A.4 |
| 5 | 6 min | 2 fallas concretas y 1 cambio de diseño; pasar a limpio y entregar | A.5 |

## Qué piden en cada parte (para razonarlo en clase)

- **Triángulo:** usen los términos de §4.5. Pregúntense, para cada credencial, quién afirma, quién la guarda y quién la comprueba, y si coincide lo que dice la fuente con lo que sería un emisor real.
- **Quién ve qué:** coherente con §4.10. Distingan lo que ve la cadena pública de lo que queda fuera de ella, y qué cambia si alguien roba la frase de 24 palabras.
- **Divulgación selectiva, revocación y correlación:** la respuesta es "sí", "no" o "no se sabe", con la **cita de la fuente**. Para revocación, nombren que **el mecanismo no está especificado** si es lo que ven.
- **Qué se rompe:** dos fallas concretas y plausibles (ver ejemplos en el session doc) y un cambio de diseño que ataque al menos una, conectado con §4.7 a §4.9.

## Reglas duras

- **Cero datos personales reales:** nada de DPI, CUI, fecha de nacimiento, fotos, correos ni ratings o cuentas reales de ustedes o de jugadores. Cualquier PII real = 0 en todo el lab.
- **Toda afirmación sobre el caso lleva su fuente de §9.** Inventar un dato (fecha, cifra de usuarios, "la FIDE lo adoptó") = 0 en "Hecho vs promesa".
- No crear cuentas, no instalar la app de demo, no comprar ni mover tokens, no escribir a las empresas.

## Lo que falta

Entregar el reporte en clase, bajo `## LAB # 20` en tu carnet. Antes, léelo completo y verifica que cada dato tenga su fuente (todas están en `FUENTES.md`).
