# Lab 04 — Transacciones de Bitcoin con WDK

Proyecto base para automatizar una transacción de Bitcoin usando `@tetherto/wdk-wallet-btc`.

## Requisitos

- Node.js 18+
- npm
- Para Testnet: acceso a Internet y un faucet de Testnet.
- Para Regtest: Bitcoin Core + Electrum/Fulcrum compatible con Regtest.

## Instalación

```bash
npm install
cp .env.example .env
```

## Opción A — Testnet con faucet

1. Ejecuta:

```bash
npm run testnet
```

2. Copia la dirección `Sender` mostrada por el script.
3. Solicita BTC Testnet en:
   https://coinfaucet.eu/en/btc-testnet/
4. Espera a que el UTXO aparezca.
5. Ejecuta de nuevo:

```bash
npm run testnet
```

6. El script crea una segunda cuenta, calcula el fee, envía `AMOUNT_SATS`, muestra el TXID y genera `lab04-report.json`.
7. Verifica la transacción en:
   https://blockstream.info/testnet/tx/<TXID>

## Opción B — Regtest local

Regtest es una cadena local independiente de Testnet. Los fondos del faucet de Testnet no funcionan en Regtest.

Debes tener Bitcoin Core y un Electrum/Fulcrum que indexe tu Regtest. Después configura `.env` con el host y puerto de ese servidor y ejecuta:

```bash
npm run regtest
```

Ejemplo de minería local en Bitcoin Core:

```bash
bitcoin-cli -regtest createwallet lab04
bitcoin-cli -regtest getnewaddress
bitcoin-cli -regtest generatetoaddress 101 <DIRECCION>
```

## Qué hace el script

1. Genera una semilla BIP-39.
2. Crea dos cuentas WDK con BIP-84.
3. Obtiene las direcciones del emisor y receptor.
4. Consulta balance y transferencias antes de enviar.
5. Cotiza la comisión con `quoteSendTransaction()`.
6. Envía BTC con `sendTransaction()`.
7. Consulta balance y transferencias después.
8. Guarda toda la evidencia estructurada en `lab04-report.json`.

## Entregable

Sube a GitHub:

- `src/lab04.js`
- `index.html`
- `package.json`
- `.env.example`
- `README.md`
- `lab04-report.json` después de una ejecución real (sin subir `.env` ni la semilla)

## Referencias

- WDK Bitcoin: https://docs.wdk.tether.io/sdk/wallet-modules/wallet-btc/
- API de WDK Bitcoin: https://docs.wdk.tether.io/sdk/wallet-modules/wallet-btc/api-reference/
- Bitcoin Testnet Explorer: https://blockstream.info/testnet/
- Faucet usado por el laboratorio: https://coinfaucet.eu/en/btc-testnet/
