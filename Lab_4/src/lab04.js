import 'dotenv/config';
import WalletManagerBtc from '@tetherto/wdk-wallet-btc';
import * as bip39 from 'bip39';
import fs from 'node:fs/promises';

const NETWORK = process.env.NETWORK || 'testnet';
const AMOUNT_SATS = BigInt(process.env.AMOUNT_SATS || '50000');
const FEE_RATE = process.env.FEE_RATE
  ? BigInt(process.env.FEE_RATE)
  : undefined;

const HOST =
  process.env.ELECTRUM_HOST ||
  (NETWORK === 'testnet'
    ? 'electrum.blockstream.info'
    : '127.0.0.1');

const PORT = Number(
  process.env.ELECTRUM_PORT ||
    (NETWORK === 'testnet' ? '60002' : '50001')
);

const PROTOCOL =
  process.env.ELECTRUM_PROTOCOL ||
  (NETWORK === 'testnet' ? 'tls' : 'tcp');

const REPORT = 'lab04-report.json';

const SENDER_MNEMONIC_FILE = '.sender-mnemonic';
const RECEIVER_MNEMONIC_FILE = '.receiver-mnemonic';

function jsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    )
  );
}

async function getOrCreateMnemonic(file) {
  try {
    const mnemonic = (await fs.readFile(file, 'utf8')).trim();

    if (bip39.validateMnemonic(mnemonic)) {
      return mnemonic;
    }
  } catch {
    // File does not exist yet.
  }

  const mnemonic = bip39.generateMnemonic(128);

  await fs.writeFile(file, mnemonic, {
    encoding: 'utf8',
    mode: 0o600
  });

  return mnemonic;
}

async function createWallet(mnemonic) {
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

async function main() {
  if (!['testnet', 'regtest'].includes(NETWORK)) {
    throw new Error('NETWORK debe ser testnet o regtest.');
  }

  const senderMnemonic = await getOrCreateMnemonic(
    SENDER_MNEMONIC_FILE
  );

  const receiverMnemonic = await getOrCreateMnemonic(
    RECEIVER_MNEMONIC_FILE
  );

  const senderWallet = await createWallet(senderMnemonic);
  const receiverWallet = await createWallet(receiverMnemonic);

  const sender = await senderWallet.getAccount(0);
  const receiver = await receiverWallet.getAccount(0);

  try {
    const senderAddress = await sender.getAddress();
    const receiverAddress = await receiver.getAddress();

    const balanceBefore = await sender.getBalance();

    const transfersBefore = await sender.getTransfers({
      direction: 'all',
      limit: 20
    });

    console.log(`Network: ${NETWORK}`);
    console.log(`Sender: ${senderAddress}`);
    console.log(`Receiver: ${receiverAddress}`);
    console.log(`Balance before: ${balanceBefore} sats`);
    console.log(`Transfers before: ${transfersBefore.length}`);

    if (balanceBefore < AMOUNT_SATS) {
      throw new Error(
        `Fondos insuficientes. Balance=${balanceBefore} sats, requerido>=${AMOUNT_SATS} sats. ` +
        `Usa el faucet de Testnet o mina bloques en Regtest.`
      );
    }

    const quoteOptions = {
      to: receiverAddress,
      value: AMOUNT_SATS,
      ...(FEE_RATE ? { feeRate: FEE_RATE } : {})
    };

    const quote = await sender.quoteSendTransaction(
      quoteOptions
    );

    console.log(
      `Estimated fee: ${quote.fee} sats`
    );

    const result = await sender.sendTransaction(
      {
        ...quoteOptions,
        confirmationTarget: 1
      },
      15000
    );

    console.log(`TXID: ${result.hash}`);
    console.log(`Actual fee: ${result.fee} sats`);

    const balanceAfter = await sender.getBalance();

    const receiverBalance =
      await receiver.getBalance();

    const transfersAfter = await sender.getTransfers({
      direction: 'all',
      limit: 20
    });

    const report = jsonSafe({
      timestamp: new Date().toISOString(),
      network: NETWORK,

      electrum: {
        host: HOST,
        port: PORT,
        protocol: PROTOCOL
      },

      sender: {
        address: senderAddress,
        balanceBefore,
        balanceAfter,
        transfersBefore,
        transfersAfter
      },

      receiver: {
        address: receiverAddress,
        balanceAfter: receiverBalance
      },

      transaction: {
        amountSats: AMOUNT_SATS,
        feeEstimateSats: quote.fee,
        feePaidSats: result.fee,
        txid: result.hash
      },

      explorer:
        NETWORK === 'testnet'
          ? `https://blockstream.info/testnet/tx/${result.hash}`
          : null
    });

    await fs.writeFile(
      REPORT,
      JSON.stringify(report, null, 2)
    );

    console.log(`Report written to ${REPORT}`);
  } finally {
    sender.dispose();
    receiver.dispose();
    senderWallet.dispose();
    receiverWallet.dispose();
  }
}

main().catch((err) => {
  console.error('\nLab 04 failed:', err.message);
  process.exitCode = 1;
});