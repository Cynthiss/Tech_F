import { getAccount } from '../lib/wallet.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { amountSats, memo } = req.body || {};

    const amount = Number(amountSats);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'amountSats debe ser un entero mayor que 0'
      });
    }

    const account = await getAccount();

    const invoice = await account.createLightningInvoice({
      amountSats: amount,
      memo: memo || 'Lab 05 Lightning'
    });

    return res.status(200).json({
      invoiceId: invoice.id,
      bolt11: invoice.invoice.encodedInvoice,
      paymentHash: invoice.invoice.paymentHash,
      amountSats: amount,
      status: invoice.status,
      expiresAt: invoice.invoice.expiresAt
    });
  } catch (error) {
    console.error('Invoice error:', error);

    return res.status(500).json({
      error: error.message
    });
  }
}