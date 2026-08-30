import { getWalletInfo } from '../lib/wallet.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const info = await getWalletInfo();

    return res.status(200).json(info);
  } catch (error) {
    console.error('Info error:', error);

    return res.status(500).json({
      error: error.message
    });
  }
}