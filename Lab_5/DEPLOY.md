# DEPLOY — Lab 05

## URL pública

Completar después del deploy de Vercel:

`https://TU-PROYECTO.vercel.app`

## Red

`MAINNET`

## Node ID / identity key

Se obtiene desde `/api/info` como `nodeId`.

## Evidencia de pago cruzado

### 1. Compañero → mi WDK

- Monto: _____ sats
- Invoice ID: _____
- Estado final: `SETTLED`
- BOLT11: registrar solo como evidencia necesaria; no contiene la mnemonic, pero evitar publicar más información de la necesaria.
- Fecha/hora: _____
- Captura: agregar aquí en GitHub / entrega

### 2. Mi WDK → compañero

- Monto: _____ sats
- Invoice del compañero: _____
- Estado final: `SETTLED` / `COMPLETED`
- Payment reference: _____
- Fecha/hora: _____
- Captura: agregar aquí en GitHub / entrega

## Variables de Vercel

Configurar en Project Settings → Environment Variables:

- `WDK_MNEMONIC`
- `WDK_NETWORK=MAINNET`
- `MAX_PAYMENT_SATS`
- `MAX_LIGHTNING_FEE_SATS`

La mnemonic no debe aparecer en GitHub.
