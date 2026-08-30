# Lab 05 — Billetera Lightning con WDK

Este proyecto implementa el flujo pedido por el laboratorio usando `@tetherto/wdk-wallet-spark`:

- billetera WDK persistente mediante una mnemonic guardada solo en variables de entorno;
- `POST /api/invoice` para crear una invoice Lightning;
- `GET /api/check/:invoiceId` para consultar si una invoice quedó `SETTLED`;
- `POST /api/pay` para cotizar y pagar una factura BOLT11;
- UI para recibir (QR + BOLT11) y pagar (pegar BOLT11);
- `/api/info` para mostrar red, Spark address, identity key/node ID y balance.

WDK Spark documenta `MAINNET`, `SIGNET` y `REGTEST` como redes disponibles; este proyecto usa `MAINNET` por defecto porque el ejercicio debe poder recibir pagos reales. La misma API expone `createLightningInvoice`, `getLightningReceiveRequest`, `quotePayLightningInvoice` y `payLightningInvoice`.

## Seguridad

No guardes una mnemonic en el código ni la subas a GitHub. El proyecto usa `WDK_MNEMONIC` desde variables de entorno y `.gitignore` excluye `.env`.

**Antes de usar MAINNET, prueba primero con una cantidad pequeña. Los pagos Lightning pueden ser irreversibles.**

## Instalación

```bash
npm install
```

## Configuración local

Copia `.env.example` como `.env` y coloca una mnemonic BIP-39 que controles:

```env
WDK_MNEMONIC=TU_MNEMONIC
WDK_NETWORK=MAINNET
MAX_PAYMENT_SATS=20000
MAX_LIGHTNING_FEE_SATS=100
```

No pegues la mnemonic en `README.md`, `index.html`, capturas ni código.

## Desarrollo

```bash
npm run dev
```

Después abre la URL local que muestre Vercel.

## Flujo del laboratorio

1. Abrir la aplicación.
2. Generar una invoice de prueba con un monto pequeño.
3. Copiar el BOLT11 o escanear el QR con otra wallet Lightning.
4. Verificar que `/api/check/:invoiceId` cambia a `SETTLED`.
5. Para la prueba cruzada, hacer compañero → tu WDK y luego tu WDK → compañero.
6. Guardar la evidencia para `DEPLOY.md`.
