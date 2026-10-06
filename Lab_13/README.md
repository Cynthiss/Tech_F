# Lab 13 — Token due diligence (Sesión 15)

Datos consultados el 2026-10-05.

## Parte 1 — Kickoff: meme coin PEPE (20%)

| Campo | Dato | Fuente |
|---|---|---|
| Ticker / nombre | PEPE / Pepe | Etherscan |
| Chain / estándar | Ethereum, ERC-20 | Etherscan |
| Contrato | `0x6982508145454Ce325dDbE47a25d4ec3d2311933` | Etherscan, CoinGecko |
| Código verificado | Sí, exact match, Solidity 0.8.0, MIT | Etherscan |
| Lanzamiento | 14 abril 2023, stealth launch (fair-launch) | CoinGecko |
| Supply total / máximo | 420,689,899,645,071.69 PEPE (18 decimales); circulante = total | `totalSupply()` on-chain, CoinGecko |
| Owner | `0x000...000` (ownership renunciada, verificado con `owner()` on-chain) | `cast call` a Ethereum |
| Holders | 593,254 | Etherscan |
| Precio / market cap | ~$0.0000044 / ~$1.85 B | CoinGecko |
| Volumen 24h | ~$287.6 M (agregado en exchanges) | CoinGecko |

**Venues (CoinGecko, por volumen 24h):** FameEX PEPE/USDT $121.9 M, Binance PEPE/USDT $31.2 M, BitDelta $21.9 M, BloFin $18.0 M, BTCC $15.6 M. Que FameEX lidere sobre Binance es una señal de posible volumen inflado (wash trading); conviene mencionarlo como riesgo.

**Venues on-chain (DexScreener, Uniswap v2/v3 en Ethereum):**

| Par | Liquidez | Compras 24h | Ventas 24h | Volumen 24h |
|---|---|---|---|---|
| `0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f` | $32.1 M | 292 | 453 | $1.65 M |
| `0x11950d141EcB863F01007AdD7D1A342041227b58` | $2.56 M | 216 | 231 | $0.11 M |
| `0xF239009A101B6B930A527DEaaB6961b6E7deC8a6` | $0.05 M | 10 | 7 | $0.0004 M |

**Caps / controles:** no hay mint ni owner activo (owner = dirección cero), por lo tanto el supply es fijo. El contrato conserva la función de transferencia de ownership, pero sin owner no puede usarse.

**Sellers 24h:** lista completa en [pepe_sellers_24h.csv](pepe_sellers_24h.csv) (255 wallets, ordenadas por PEPE vendido).

Método: con `eth_getLogs` a un RPC público de Ethereum tomamos los eventos `Transfer` de PEPE hacia los 3 pares de Uniswap en los últimos 7,200 bloques (ventana 2026-10-04 19:41 a 2026-10-05 19:46 UTC), y nos quedamos solo con los que ocurrieron en una transacción con evento `Swap` del mismo par (así se excluye agregar liquidez). Cada venta se atribuye a `tx.from`, la wallet que firmó la transacción, porque muchas pasan por routers y bots.

| Dato | Resultado |
|---|---|
| Ventas (swaps PEPE → par) | 700 en 672 transacciones (459 + 234 + 7 por par; DexScreener reportaba 691) |
| PEPE vendido | ~183.3 mil millones |
| Wallets vendedoras distintas | 255 (222 EOA y 33 contratos) |
| Concentración | La wallet #1 vendió el 17.7% del volumen; el top 5 suma ~36% |

Top 5 (dirección completa en el CSV): `0x5b43453f…edefd1` (46 tx, 32.4 mil millones PEPE), `0x4337001f…888084` (12 tx, 10.7 mil millones), `0x7194f393…281e` (4 tx, 8.2 mil millones), `0x458f33b4…0285` (2 tx, 7.6 mil millones), `0x5c4b1c03…f1ff` (3 tx, 7.5 mil millones).

Limitaciones: no cubre ventas en exchanges centralizados (Binance, FameEX, etc.), que no dejan rastro on-chain por usuario. Una misma persona puede controlar varias wallets, y no sabemos quién está detrás de cada dirección.

## Parte 2 — Emisión Tohkn: MMLTI1 (30%)

| Campo | Dato | Fuente |
|---|---|---|
| Emisor | Sociedad de Ahorro y Crédito Multimoney, S.A. (registro EAD-0046) | tohkn.com/es/issuances/mmlti1 |
| Programa | AD-00252 | idem |
| PSAD | MIO3, S.A. de C.V. (PSAD-0016) | idem |
| Marco legal | Ley de Emisión de Activos Digitales (LEAD), supervisa CNAD, El Salvador | idem |
| Tipo | Token de deuda, valor de referencia $100 por token | idem |
| Monto | Primer tramo hasta $2 M; programa autorizado hasta $10 M | idem |
| Términos | Tasa fija 6.20% anual, intereses mensuales vencidos, plazo 24 meses, capital al vencimiento | idem |
| Inversión mínima / moneda | $100 (1 token), en USDT o USDC | idem |
| Restricciones | Periodo de 180 días sin comercialización; transferencias sujetas a elegibilidad, KYC, KYB, KYT y AML; liquidez secundaria no garantizada | idem |
| Chain / estándar | Polygon, ERC-3643 (según la página) | idem |
| **Dirección del contrato** | `0x6682b57FA1148b3831aE8610cd6Cbe961d610329` (no aparece en la página web; está en el DIR en inglés, p. 36, sección "Smart Contract for the First Tranche") | DIR EN p. 36 |
| Chain / explorer | Polygon (chain id 137, confirmado on-chain). Explorer: https://polygonscan.com/address/0x6682b57FA1148b3831aE8610cd6Cbe961d610329 | RPC público + Blockscout |
| Nombre / símbolo | "MIO3 MM Tokenized Senior Debt Note Tranch 1" / `MMLTI1`, 18 decimales, versión T-REX `4.1.1` | `name()`, `symbol()`, `version()` |

**Documentos oficiales (rutas en tohkn.com):**
- DIR ES: `/assets/documents/issuances/mmlti1/dir-es-mmlti1-annexes.pdf` (~35 MB)
- DIR EN: `/assets/documents/issuances/mmlti1/dir-en-mmlti1-annexes.pdf`
- Términos ES / EN: `/assets/documents/issuances/mmlti1/terms-es-mmlti1.pdf` y `terms-en-mmlti1.pdf`

### Funcionalidad on-chain (consultada el 2026-10-05 con `cast` a un RPC público de Polygon)

| Elemento | Hallazgo |
|---|---|
| Arquitectura | El token es un **proxy** (no verificado en Blockscout). La lógica vive en `0x1ba05496EC2bf932D522D0E2820428ca78F7a317`, que se resuelve vía el contrato de autoridad `0x387b9CED9a3E638168dBd4992d06A0B5ba6eCe18` (`getTokenImplementation()`). Ni el proxy ni la implementación tienen código fuente verificado, así que el análisis se basa en llamadas y en los selectores del bytecode. |
| Owner del token | `0xC7369964D6151fc0c095d5781B30eb3b80562a59` (un contrato, no una wallet). Su propietario final es `0x0921785A4B0F184141A9afFf0F8b3B37E50cAf46`, que también es owner de la autoridad de implementación. |
| Agent | `isAgent(owner)` devuelve `true`. En ERC-3643 los agents pueden mintear, quemar, pausar, congelar y forzar transferencias. |
| Funciones de control en el bytecode | `mint`, `batchMint`, `burn`, `batchBurn`, `forcedTransfer`, `batchForcedTransfer`, `pause`/`unpause`, `setAddressFrozen`, `freezePartialTokens`, `recoveryAddress`, `setCompliance`, `setIdentityRegistry`, `addAgent`/`removeAgent`, `setName`/`setSymbol`. |
| Pausa | `paused()` = `false` (el token no está pausado). |
| Registro de identidades | `identityRegistry()` = `0x303CD7C8003964165a292736a26A61229a4AAF2F`. |
| Compliance | `compliance()` = `0xC4Cab86ad00E0f1c46B5A44202120DFAb120B059` (su owner es otro contrato, `0xc898099C…36c7`), con 4 módulos identificados con `name()`: |
| ↳ `SupplyLimitModule` | `0x3A933C02…283e`. `getSupplyLimit` = **20,000 tokens** ($2 M). El tope del primer tramo **sí está impuesto en el código**. |
| ↳ `TimeTransfersLimitsModule` | `0x0226eFBF…E555`. Un límite de **20,000 tokens por ventana de 15,552,000 s (180 días)** por identidad. Es un tope de monto, no un bloqueo total. |
| ↳ `CountryRestrictModule` | `0x9fA0a387…D0d7`. Restringe por país; no hay restricción activa para El Salvador (222) ni EE. UU. (840). |
| ↳ `MaxBalanceModule` | `0xDdEeaEe0…F3E5`. Está vinculado al compliance, pero no logramos leer su parámetro con las firmas probadas. |
| Supply | 11,916 MMLTI1 = $1,191,600 a $100 por token, el 59.6% del tramo de $2 M (20,000 tokens). |
| Historial | 240 eventos de mint, 0 burns, 0 transferencias. 213 direcciones receptoras distintas. Primer mint 2026-09-16, último 2026-10-05. |
| Concentración | Un solo mint de 10,300 tokens ($1.03 M, 86% del supply) el 2026-10-02 a `0xC24e55aeA81149D6F71483EFB7b76653981bC58e` (tx `0x322d80f8…2ae03`). El monto exacto es 10300.000000000002, lo que sugiere un redondeo de punto flotante al calcular el mint. |
| Holders en Blockscout | Reporta 3 holders con 5 tokens en total, que no cuadra con 11,916 de supply ni con 213 receptores. El índice parece incompleto; el dato confiable es `totalSupply()`. |

### Funcionalidad vs DIR

| Afirmación del DIR | Página | Qué vimos en el código | Veredicto |
|---|---|---|---|
| Polygon, ERC-3643, un contrato por tramo | 36 | Polygon, T-REX 4.1.1, dirección coincide con el símbolo MMLTI1 | Coincide |
| Módulos Identity Registry, Claim Topics, Modular Compliance y Token | 40 | Existen `identityRegistry()` y `compliance()` con 4 módulos | Coincide (módulos sin identificar) |
| "Pause functions and access control mechanisms" | 54 | Existen `pause()`, `unpause()` y el rol agent | Coincide |
| Congelar y descongelar tokens | 50 | Existen `setAddressFrozen` y `freezePartialTokens` | Coincide |
| MIO3 recibe los fondos y luego mintea los tokens | 58 | 240 mints, sin transferencias | Coincide con lo observable; no se verificó quién llama a `mint` |
| Tramo 1 de hasta $2 M; programa de hasta $10 M | 32, 33 | `SupplyLimitModule` = 20,000 tokens ($2 M) y supply actual $1.19 M | **Coincide:** el tope está impuesto on-chain. Falta ver cómo se amplía para los siguientes tramos (el módulo es configurable por el owner del compliance) |
| 180 días sin poder negociar | 37 | Cero transferencias hasta ahora. El módulo de tiempo permite hasta 20,000 tokens por identidad cada 180 días, más que cualquier saldo actual | **No coincide del todo:** no vemos un bloqueo total en el código; la restricción parece operativa (plataforma) |
| Contratos "auditados por firmas independientes" | 54 | No encontramos un reporte de auditoría público | Sin evidencia; solicitar el reporte |
| Estándar ERC-3643 | 50 | El DIR lo describe como extensión de ERC-20 y ERC-1400, y menciona ERC-1155 | Inconsistencia menor en el texto del DIR |
| Transferencias forzadas, recuperación de wallets y cambio de implementación | no se mencionan (0 coincidencias en la búsqueda de texto) | El bytecode incluye `forcedTransfer`, `recoveryAddress` y el contrato de autoridad puede cambiar la implementación | **El DIR no lo revela**; son poderes de control centralizado relevantes para el inversionista |

**Conclusión provisional:** el contrato existe, está activo y se comporta como el DIR describe en la mayoría de los puntos verificables, incluido el tope de $2 M. Los riesgos para un inversionista son de centralización: el agent puede mintear (hasta el tope), forzar transferencias, congelar y pausar; el emisor puede cambiar la lógica del token y el owner del compliance puede cambiar los límites. El bloqueo de 180 días no se ve impuesto en el código. El código fuente no está verificado, así que esta lectura es de caja gris.

**Pendiente:** el parámetro de `MaxBalanceModule`, quién ejecuta los mints, y pedir el reporte de auditoría.

## Parte 3 — Memo comparativo, fair-launch vs emisión regulada (20%)

Memo completo de unas 2 páginas en [memo.md](memo.md). Resumen:

- **Dónde vive la confianza.** En PEPE vive en el código: owner renunciado, sin mint, sin pausa ni lista negra, nadie puede intervenir. En MMLTI1 vive en actores identificados (emisor Multimoney, plataforma MIO3/TOHKN y regulador CNAD), que sí pueden intervenir.
- **PEPE.** Ventajas: reglas inmutables, código verificado, acceso sin permiso y liquidez profunda. Riesgos: no representa ningún derecho, no hay a quién reclamar y el volumen en algunos exchanges parece inflado (FameEX supera a Binance).
- **MMLTI1.** Ventajas: crédito contra un emisor regulado, DIR de más de 300 páginas, estados financieros auditados, tope de $2 M impuesto on-chain y KYC/AML. Riesgos: el agent puede mintear (hasta el tope), forzar transferencias, congelar y pausar; el emisor puede cambiar la lógica del token; el código no está verificado; no hay reporte de auditoría público.
- **Hallazgos sobre el DIR.** Coincide con el código en el contrato, los módulos, la pausa, el congelamiento y el tope. No menciona las transferencias forzadas, la recuperación de wallets ni el cambio de implementación, y el bloqueo de 180 días no se ve impuesto en el código.
- **Conclusión.** Ningún modelo elimina el riesgo; lo reubica. PEPE lo traslada al comprador a cambio de libertad y reglas inmutables; MMLTI1 reduce el riesgo legal e informativo pero concentra poder de control.

## Parte 4 — Notas de presentación (5%)

Pendiente, si aplica según la dinámica de clase.
