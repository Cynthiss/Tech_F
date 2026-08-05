const crypto = require('crypto');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');

console.log('=== Script 1: Firmas ECDSA Brutas con Viem ===\n');

// Paso 1: Genera un par de claves EC secp256k1
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

console.log('✓ Par de claves secp256k1 generado\n');

// Paso 2: Firma el mensaje
const message = 'Hello UFM';
const signer = crypto.createSign('SHA256');
signer.update(message);
signer.end();
const signatureHex = signer.sign(privateKey, 'hex');

console.log(`📝 Mensaje: "${message}"`);
console.log(`📄 Firma (hexadecimal):\n${signatureHex}\n`);

// Paso 3: Verifica la firma válida
const verifier = crypto.createVerify('SHA256');
verifier.update(message);
verifier.end();
const isValid = verifier.verify(publicKey, Buffer.from(signatureHex, 'hex'));
console.log(`✓ Firma válida verificada: ${isValid}\n`);

// Paso 4: Corrompe un byte y verifica que falla
const corruptedSig =
  signatureHex.substring(0, 2) +
  (parseInt(signatureHex.substring(2, 4), 16) ^ 0xff).toString(16).padStart(2, '0') +
  signatureHex.substring(4);

const verifier2 = crypto.createVerify('SHA256');
verifier2.update(message);
verifier2.end();
const isValidCorrupted = verifier2.verify(publicKey, Buffer.from(corruptedSig, 'hex'));

console.log(`🔴 Firma corrupta verificada: ${isValidCorrupted}`);
console.log('❌ Firma inválida\n');

// Paso 5: Genera una wallet Ethereum usando viem
const walletPrivateKey = generatePrivateKey();
const account = privateKeyToAccount(walletPrivateKey);

console.log('✓ Wallet Ethereum generado');
console.log(`📍 Dirección Ethereum: ${account.address}\n`);
console.log('🔐 Clave privada (GUARDAR PARA SCRIPT 2):');
console.log(`${walletPrivateKey}\n`);

console.log('=== Script 1 Completado ===');