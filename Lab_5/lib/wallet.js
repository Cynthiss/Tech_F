import 'dotenv/config';
import WalletManagerSpark from '@tetherto/wdk-wallet-spark';

let wallet = null;
let account = null;

export function safeJson(value) {
  return JSON.parse(
    JSON.stringify(value, (_, item) =>
      typeof item === 'bigint'
        ? item.toString()
        : item
    )
  );
}

export async function getAccount() {
  if (account) {
    return account;
  }

  const mnemonic = process.env.WDK_MNEMONIC;

  if (!mnemonic) {
    throw new Error(
      'Falta WDK_MNEMONIC en las variables de entorno.'
    );
  }

  const network =
    process.env.NETWORK || 'MAINNET';

  wallet = new WalletManagerSpark(
    mnemonic,
    {
      network
    }
  );

  account = await wallet.getAccount(0);

  return account;
}

export async function getWalletInfo() {
  const currentAccount =
    await getAccount();

  return {
    network:
      process.env.NETWORK || 'MAINNET',

    address:
      await currentAccount.getAddress(),

    identityKey:
      await currentAccount.getIdentityKey(),

    balanceSats:
      (
        await currentAccount.getBalance()
      ).toString()
  };
}