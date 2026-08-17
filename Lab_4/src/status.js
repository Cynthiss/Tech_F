import 'dotenv/config';
import WalletManagerBtc from '@tetherto/wdk-wallet-btc';
import * as fs from 'node:fs/promises';

const NETWORK = process.env.NETWORK || 'testnet';

const HOST =
  process.env.ELECTRUM_HOST ||
  'electrum.blockstream.info';

const PORT = Number(
  process.env.ELECTRUM_PORT || '60002'
);

const PROTOCOL =
  process.env.ELECTRUM_PROTOCOL || 'tls';

const SENDER_MNEMONIC_FILE = '.sender-mnemonic';
const RECEIVER_MNEMONIC_FILE = '.receiver-mnemonic';

const LAST_TXID =
  '24b7b3b394d03193851426f3d1beb0235d41c7bbe3b1f85f0c338a8fb6e5a668';

async function readMnemonic(file) {
  const mnemonic = (await fs.readFile(file, 'utf8')).trim();

  if (!mnemonic || !bip39Validate(mnemonic)) {
    throw new Error(`Mnemonic inválida en ${file}`);
  }

  return mnemonic;
}

function bip39Validate(mnemonic) {
  const words = mnemonic.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

function createWallet(mnemonic) {
  return new WalletManagerBtc(mnemonic, {
    network: NETWORK,
    bip: 84,
    client: {
      type: 'electrum',
      clientConfig: {
        host: HOST,
        port: PORT,
        protocol: PROTOCOL
      }
    },
    transactionMaxFee: 1000000n
  });
}

async function getUtxos(address) {
  const response = await fetch(
    `https://blockstream.info/testnet/api/address/${address}/utxo`
  );

  if (!response.ok) {
    throw new Error(
      `No se pudieron consultar los UTXOs. HTTP ${response.status}`
    );
  }

  return response.json();
}

async function main() {
  const senderMnemonic =
    await readMnemonic(SENDER_MNEMONIC_FILE);

  const receiverMnemonic =
    await readMnemonic(RECEIVER_MNEMONIC_FILE);

  const senderWallet = createWallet(senderMnemonic);
  const receiverWallet = createWallet(receiverMnemonic);

  const sender = await senderWallet.getAccount(0);
  const receiver = await receiverWallet.getAccount(0);

  try {
    const senderAddress = await sender.getAddress();
    const receiverAddress = await receiver.getAddress();

    const senderBalance = await sender.getBalance();
    const receiverBalance = await receiver.getBalance();

    const senderUtxos = await getUtxos(senderAddress);
    const receiverUtxos = await getUtxos(receiverAddress);

    console.log('\n========================================');
    console.log('       LAB 04 - ESTADO FINAL');
    console.log('========================================\n');

    console.log(`Network: ${NETWORK}\n`);

    console.log('--- WALLET A / SENDER ---');
    console.log(`Address: ${senderAddress}`);
    console.log(`Balance final: ${senderBalance} sats`);

    console.log('\nUTXOs de Wallet A:');

    if (senderUtxos.length === 0) {
      console.log('  No hay UTXOs.');
    } else {
      senderUtxos.forEach((utxo, index) => {
        console.log(`  UTXO #${index + 1}`);
        console.log(`    TXID: ${utxo.txid}`);
        console.log(`    vout: ${utxo.vout}`);
        console.log(`    value: ${utxo.value} sats`);
        console.log(
          `    confirmed: ${
            utxo.status.confirmed ? 'sí' : 'no'
          }`
        );
        console.log(
          `    block: ${
            utxo.status.block_height ?? 'pendiente'
          }`
        );
      });
    }

    console.log('\n--- WALLET B / RECEIVER ---');
    console.log(`Address: ${receiverAddress}`);
    console.log(`Balance final: ${receiverBalance} sats`);

    console.log('\nUTXOs de Wallet B:');

    if (receiverUtxos.length === 0) {
      console.log('  No hay UTXOs.');
    } else {
      receiverUtxos.forEach((utxo, index) => {
        console.log(`  UTXO #${index + 1}`);
        console.log(`    TXID: ${utxo.txid}`);
        console.log(`    vout: ${utxo.vout}`);
        console.log(`    value: ${utxo.value} sats`);
        console.log(
          `    confirmed: ${
            utxo.status.confirmed ? 'sí' : 'no'
          }`
        );
        console.log(
          `    block: ${
            utxo.status.block_height ?? 'pendiente'
          }`
        );
      });
    }

    console.log('\n--- TRANSACCIÓN ---');
    console.log(`TXID: ${LAST_TXID}`);
    console.log(
      'Explorer:',
      `https://blockstream.info/testnet/tx/${LAST_TXID}`
    );

    const report = {
      timestamp: new Date().toISOString(),
      network: NETWORK,

      sender: {
        address: senderAddress,
        balanceFinal: senderBalance.toString(),
        utxos: senderUtxos
      },

      receiver: {
        address: receiverAddress,
        balanceFinal: receiverBalance.toString(),
        utxos: receiverUtxos
      },

      transaction: {
        txid: LAST_TXID,
        explorer:
          `https://blockstream.info/testnet/tx/${LAST_TXID}`
      }
    };

    await fs.writeFile(
      'lab04-status.json',
      JSON.stringify(report, null, 2)
    );

    console.log(
      '\nReporte guardado en: lab04-status.json'
    );
  } finally {
    sender.dispose();
    receiver.dispose();
    senderWallet.dispose();
    receiverWallet.dispose();
  }
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exitCode = 1;
});