# Memo comparativo: fair-launch (PEPE) vs emisión regulada (MMLTI1)

CS031 · Lab 13 · Token due diligence · Datos consultados el 2026-10-05

## 1. Resumen

Auditamos dos tokens en extremos opuestos del espectro. **PEPE** es un meme coin ERC-20 en Ethereum lanzado sin permiso en abril de 2023 (fair-launch), con ownership renunciada. **MMLTI1** es un token de deuda ERC-3643 en Polygon emitido por MultiMoney a través de la plataforma TOHKN, bajo la ley LEAD de El Salvador y supervisado por la CNAD. La diferencia central es de **dónde vive la confianza**: en PEPE vive en el código, porque nadie puede intervenir; en MMLTI1 vive en un conjunto de actores identificados (emisor, plataforma, regulador) que sí pueden intervenir.

## 2. Qué verificamos

| | PEPE | MMLTI1 |
|---|---|---|
| Contrato | `0x6982…1933` (Ethereum) | `0x6682…0329` (Polygon, proxy) |
| Estándar | ERC-20 | ERC-3643 (T-REX 4.1.1), ERC-20 con compliance |
| Código fuente | Verificado en Etherscan | **No verificado** (proxy e implementación) |
| Owner | `0x000…000` (renunciado, `owner()` on-chain) | Contrato propiedad de `0x0921…af46`, con rol agent |
| Supply | 420.69 billones, fijo | 11,916 tokens (~$1.19 M), crece con cada mint hasta un tope on-chain de 20,000 |
| Mint | Sin función de mint | `mint`/`batchMint` disponibles al agent, limitados por `SupplyLimitModule` |
| Pausa / congelar | No | `pause`, `setAddressFrozen`, `freezePartialTokens` |
| Transferencias forzadas | No | `forcedTransfer`, `recoveryAddress` |
| Quién puede cambiar el token | Nadie con privilegios (sin owner) | El contrato de autoridad puede cambiar la implementación |
| Holders | 593,254 | 240 mints a 213 direcciones; el índice de Blockscout es incompleto |

## 3. Fair-launch: ventajas y riesgos

**Lo que da el diseño.** Con owner en la dirección cero, nadie puede mintear más supply ni congelar cuentas. Quien compra sabe que las reglas no cambiarán por decisión de un tercero. Cualquiera puede comprar o vender en Uniswap, Binance u otros venues sin permiso ni KYC; la liquidez es profunda (más de $32 M en el par principal de Uniswap) y el supply, los holders y las transferencias son públicos.

**Lo que no da.** PEPE no representa ningún derecho: no hay emisor, ni flujo de pagos, ni documento que describa qué se compra. El precio depende solo de la demanda. No hay a quién reclamar si el precio cae a cero. El volumen reportado también es dudoso: según CoinGecko, FameEX concentra $121.9 M de $287.6 M en 24 h, más que Binance, lo que sugiere volumen inflado. En los tres pares de Uniswap contamos 700 ventas en 24 h hechas por 255 wallets, y la mayor concentró el 17.7% del PEPE vendido (lista en `pepe_sellers_24h.csv`). Esto muestra una ventaja de la transparencia on-chain: cualquiera puede ver quién vendió, algo que en un exchange centralizado no se puede.

## 4. Emisión regulada: ventajas y riesgos

**Lo que da el diseño.** MMLTI1 sí representa un derecho: un crédito contra Sociedad de Ahorro y Crédito Multimoney, con tasa fija de 6.20%, intereses mensuales y 24 meses de plazo. Hay un DIR de más de 300 páginas con estados financieros auditados del emisor, registro ante la CNAD (programa AD-00252) y restricciones de elegibilidad con KYC/KYB/AML. Los controles del contrato (pausa, congelamiento, recuperación de wallets) permiten reaccionar ante un hackeo o una orden judicial, algo imposible en PEPE.

**Lo que cuesta.** Esos mismos controles son poder centralizado. Verificamos que el agent puede mintear (hasta el tope del módulo), forzar transferencias, y que el emisor puede cambiar la lógica del token. El DIR describe la pausa y el congelamiento (págs. 50 y 54), pero nuestra búsqueda de texto no encontró mención de transferencias forzadas, recuperación de wallets ni cambio de implementación. En cambio, el tope de $2 M del primer tramo sí está impuesto on-chain por un `SupplyLimitModule` de 20,000 tokens, aunque el owner del compliance puede modificarlo. El DIR afirma que los contratos fueron auditados por firmas independientes (pág. 54), pero no encontramos un reporte público. Además hay concentración: un solo mint de 10,300 tokens (86% del supply) fue a una dirección. La liquidez es limitada: el DIR promete 180 días sin poder negociar, pero el código solo limita a 20,000 tokens por identidad cada 180 días, más que cualquier saldo actual, así que el bloqueo parece operativo (de la plataforma) y no impuesto por el contrato; además el mercado secundario no está garantizado.

## 5. Comparación

- **Transparencia de código vs. transparencia de información.** PEPE es transparente en el código (verificado, sin owner) pero opaco en lo económico. MMLTI1 es lo contrario: abundante información legal y financiera, pero el código no está verificado públicamente.
- **Riesgo de contraparte.** PEPE no tiene contraparte: el riesgo es de mercado. MMLTI1 tiene tres: el emisor (crédito), MIO3 (custodia, mint, plataforma) y quien controla las llaves del agent.
- **Protección del inversionista.** En PEPE es nula. En MMLTI1 existe por marco legal y recurso contra el emisor, pero depende de que el contrato haga lo que dice el DIR, y eso solo se verificó en parte.
- **Libertad vs. control.** El fair-launch maximiza la libertad de transacción y elimina el control de terceros; la emisión regulada sacrifica ambos a cambio de cumplimiento legal.

## 6. Conclusión

Ninguno de los dos modelos elimina el riesgo; lo reubican. PEPE traslada todo el riesgo al comprador y le da a cambio reglas inmutables y acceso libre. MMLTI1 reduce el riesgo informativo y legal, pero concentra poder en el agent y el emisor, y ese poder es mayor de lo que el DIR revela. Si tuviéramos que mejorar MMLTI1, pediríamos tres cosas: verificar el código fuente, publicar el reporte de auditoría, y declarar en el DIR las funciones de transferencia forzada, recuperación y cambio de implementación junto con quién las controla.

## Limitaciones

El análisis de MMLTI1 es de caja gris: basado en llamadas on-chain, selectores del bytecode y el texto del DIR, no en el código fuente. No leímos el parámetro de `MaxBalanceModule` ni sabemos quién ejecuta los mints. La lista de vendedores de PEPE cubre solo los pares de Uniswap, no los exchanges centralizados.

## Fuentes

Etherscan y Polygonscan/Blockscout; CoinGecko y DexScreener; consultas `cast` a RPC públicos de Ethereum y Polygon; DIR de MMLTI1 en inglés (tohkn.com); página de la emisión en tohkn.com. Detalle en [README.md](README.md).
