import { getAccount, safeJson } from '../lib/wallet.js';

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

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      error: 'Method not allowed'
    });
  }

  try {

    const {
      bolt11,
      maxFeeSats
    } = req.body || {};

    // -----------------------------------------
    // VALIDAR BOLT11
    // -----------------------------------------

    if (
      typeof bolt11 !== 'string' ||
      !bolt11.trim()
    ) {
      return sendJson(res, 400, {
        error: 'Falta una factura BOLT11 válida.'
      });
    }

    const invoice = bolt11.trim();

    // -----------------------------------------
    // VALIDAR FEE MÁXIMO
    // -----------------------------------------

    const feeLimit =
      maxFeeSats === undefined
        ? 100
        : Number(maxFeeSats);

    if (
      !Number.isInteger(feeLimit) ||
      feeLimit < 0
    ) {
      return sendJson(res, 400, {
        error:
          'maxFeeSats debe ser un entero mayor o igual a 0.'
      });
    }

    // -----------------------------------------
    // OBTENER WALLET WDK
    // -----------------------------------------

    const account = await getAccount();

    const balanceBefore =
      await account.getBalance();

    // -----------------------------------------
    // COTIZAR FEE
    // -----------------------------------------

    const estimatedFee =
      await account.quotePayLightningInvoice({
        encodedInvoice: invoice
      });

    const estimatedFeeSats =
      Number(estimatedFee);

    console.log(
      `Estimated Lightning fee: ${estimatedFeeSats} sats`
    );

    // -----------------------------------------
    // VALIDAR FEE
    // -----------------------------------------

    if (estimatedFeeSats > feeLimit) {

      return sendJson(res, 400, {
        error:
          `El fee estimado (${estimatedFeeSats} sats) ` +
          `supera el máximo permitido (${feeLimit} sats).`,

        estimatedFeeSats,
        maxFeeSats: feeLimit
      });

    }

    // -----------------------------------------
    // PAGAR
    // -----------------------------------------
    //
    // IMPORTANTE:
    //
    // En WDK Spark beta.22:
    //
    // quotePayLightningInvoice usa:
    // encodedInvoice
    //
    // payLightningInvoice funciona con:
    // invoice
    //
    // Esto fue comprobado directamente
    // contra MAINNET.
    // -----------------------------------------

    const payment =
      await account.payLightningInvoice({
        invoice: invoice,
        maxFeeSats: feeLimit
      });

    // -----------------------------------------
    // BALANCE DESPUÉS
    // -----------------------------------------

    const balanceAfter =
      await account.getBalance();

    // -----------------------------------------
    // RESPUESTA
    // -----------------------------------------

    return sendJson(res, 200, {

      ok: true,

      status:
        payment?.status ??
        'UNKNOWN',

      estimatedFeeSats,

      maxFeeSats:
        feeLimit,

      balanceBeforeSats:
        balanceBefore.toString(),

      balanceAfterSats:
        balanceAfter.toString(),

      payment:
        safeJson(payment)

    });

  } catch (error) {

    console.error(
      'Pay error:',
      error
    );

    return sendJson(res, 500, {
      error:
        error?.message ||
        'Unable to pay Lightning invoice.'
    });

  }

}