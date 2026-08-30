import { getAccount } from '../../lib/wallet.js';

function sendJson(res, status, payload) {
  res
    .status(status)
    .setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );

  return res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, {
      error: 'Method not allowed'
    });
  }

  const invoiceId = req.query?.invoiceId;

  if (
    !invoiceId ||
    typeof invoiceId !== 'string'
  ) {
    return sendJson(res, 400, {
      error: 'Missing invoiceId.'
    });
  }

  try {
    const account = await getAccount();

    const invoice =
      await account.getLightningReceiveRequest(
        invoiceId
      );

    if (!invoice) {
      return sendJson(res, 404, {
        error: 'Invoice not found.'
      });
    }

    return sendJson(res, 200, {
      ok: true,
      invoiceId: invoice.id ?? invoiceId,
      bolt11:
        invoice.invoice?.encodedInvoice ??
        invoice.encodedInvoice ??
        null,
      amountSats:
        invoice.invoice?.amount?.originalValue
          ? Number(
              invoice.invoice.amount.originalValue
            ) / 1000
          : null,
      memo: invoice.invoice?.memo ?? '',
      status: invoice.status ?? 'UNKNOWN'
    });

  } catch (error) {
    console.error(
      'Check invoice error:',
      error
    );

    return sendJson(res, 500, {
      error:
        error?.message ||
        'Unable to check invoice status.'
    });
  }
}