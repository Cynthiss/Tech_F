# STORAGE.md — Política de datos del venture

> Ajustar las filas de la tabla al mapa de datos real del venture y revisar la oración PSAV contra la conclusión de S16–S17.

## 1. Clasificación de datos

Clasificamos los datos por **sensibilidad** y **durabilidad**; de esa combinación sale el destino. Regla base: lo que algún día deba poder borrarse no entra a redes públicas content-addressed.

| Dato | Sensibilidad | Durabilidad | Destino |
|---|---|---|---|
| Landing, imágenes y assets de marketing | Público | Meses | Location-addressed (hosting/CDN, p. ej. Vercel) |
| Documentos públicos que no cambian (términos publicados, whitepaper, metadata) | Público | Años | IPFS + pin (Pinata) |
| Artefacto del lab `venture-hello.json` | Público | Efímero | IPFS + pin, solo como evidencia temporal |
| Notas y borradores de operación | Interno | Meses | Location-addressed |
| Logs y analítica | Interno | Efímero | Location-addressed con retención corta |
| Llaves, API keys y JWT | Interno (crítico) | Efímero | Never-permanent: gestor de secretos, se rotan, jamás en git |
| Datos de clientes (nombre, correo, teléfono) | PII | Años | Never-permanent: base cifrada con borrado |
| KYC, documentos de identidad y registros AML | Regulated | Años (según ley) | Never-permanent: sistema auditable y borrable, nunca IPFS |
| Hash (sello) de un acta firmada, no el documento | Público | Permanente | Raro permanence candidate: solo un hash sin PII, útil para probar integridad años después |

## 2. CID del laboratorio

- **CID:** `bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u`
- **Gateway:** https://black-adjacent-mackerel-93.mypinata.cloud/ipfs/bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u (gateway dedicado de Pinata)
- **Provider:** Pinata
- **Fecha:** 2026-10-08
- **Quién paga el pin:** el equipo, con la cuenta de Pinata de una integrante (plan gratuito).

Si unpinneamos, esperamos que el CID deje de resolver en nuestro gateway y, con el tiempo, en los gateways públicos cuando se les venza el caché, pero no podemos garantizar que otro peer no guarde una copia.

## 3. Availability, borrado y permanence

Necesitamos **availability vía pin** para los documentos públicos que no cambian, **deletion policy** para todo lo que contenga PII, datos internos o regulados, y **permanence** solo para un hash de integridad, nunca para el contenido. IPFS nombra el qué, no el dónde: un pin da disponibilidad mientras alguien lo pague, no permanencia, y quitarlo no borra la copia de otros peers. Por eso "dejar de servir en nuestro gateway" solo equivale a borrar si el CID nunca salió de nuestro control, y en IPFS público no es el caso. El CID de un documento publicado aporta provenance, porque prueba que no cambió; pinnear PII o KYC en público sería negligencia de diseño.

## 4. Perímetro PSAV / Decreto 15-2026

Esta elección de storage interactúa con nuestro perímetro así: mientras counsel no confirme lo contrario, asumimos que podríamos ser Persona Obligada (PSAV) bajo el Decreto 15-2026, por lo que los datos del flujo regulado (KYC, transacciones, registros AML) viven en sistemas que podemos borrar, exportar y auditar, y nunca en IPFS público ni en permanence. Usar IPFS o un pinning service no sustituye KYC, registro ni conservación. Qué conservar y por cuánto tiempo depende del reglamento del art. 127, aún pendiente de emisión.

## 5. Promesas

**Tres promesas que NO haremos:**

1. "Borramos todo cuando cierras la cuenta" para contenido que ya publicamos con un CID público.
2. "Si editas el documento publicado, la versión vieja desaparece": el CID viejo sigue existiendo mientras alguien lo pinnee.
3. "Cumplimos el derecho al olvido" o "retiramos el contenido de internet" tras un reporte de abuso: solo podemos dejar de servirlo o hacer unpin, no borrarlo de otros peers.

**Una promesa que SÍ haremos:** que cada documento público lleve un CID verificable que prueba que no cambió, y mantenerlo pinneado mientras el venture opere, avisando antes de quitar el pin.

## 6. Nota opcional: Arweave

Pagar una sola vez (endowment) apunta a permanencia sin renovar un pin cada mes. No lo usamos en este lab; si algún día lo consideráramos sería solo para un hash público sin PII, porque tras replicarse ya no se puede borrar de verdad.
