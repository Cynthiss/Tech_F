const { privateKeyToAccount } = require('viem/accounts');
const { hashTypedData } = require('viem');

// Reemplaza esto con la clave privada que te imprimió sign-raw.js
const PRIVATE_KEY = '0x4b228e3953d34d971c35bbe58824afbc950e12c9fe6e1580e4f028533913ca2b';

async function main() {
  console.log('=== Script 2: ERC-712 Datos Tipificados con Viem ===\n');

  // Crear cuenta desde clave privada
  const account = privateKeyToAccount(PRIVATE_KEY);

  console.log('✓ Wallet Viem recuperado');
  console.log(`📍 Dirección: ${account.address}\n`);

  const domain = {
    name: 'UFM Course',
    version: '1',
    chainId: 31337,
  };

  console.log('📋 Dominio EIP-712:');
  console.log(`   Nombre: ${domain.name}`);
  console.log(`   Versión: ${domain.version}`);
  console.log(`   Chain ID: ${domain.chainId}\n`);

  const types = {
    Enrollment: [
      { name: 'student', type: 'address' },
      { name: 'course', type: 'string' },
    ],
  };

  console.log('📝 Tipo Enrollment:');
  console.log('   - student (address)');
  console.log('   - course (string)\n');

  const message = {
    student: account.address,
    course: 'SE-4XX',
  };

  console.log('✉️  Mensaje de Inscripción:');
  console.log(`   student: ${message.student}`);
  console.log(`   course: ${message.course}\n`);

  const eip712Hash = hashTypedData({
    domain,
    types,
    primaryType: 'Enrollment',
    message,
  });

  console.log('🔐 Hash EIP-712 (para firmado):');
  console.log(`${eip712Hash}\n`);

  const signature = await account.signTypedData({
    domain,
    types,
    primaryType: 'Enrollment',
    message,
  });

  console.log('✍️  Firma ERC-712:');
  console.log(`${signature}\n`);

  const sig = signature.slice(2);
  const r = '0x' + sig.slice(0, 64);
  const s = '0x' + sig.slice(64, 128);
  const v = parseInt(sig.slice(128, 130), 16);

  console.log('🔧 Componentes de la firma (para ecrecover):');
  console.log(`   r: ${r}`);
  console.log(`   s: ${s}`);
  console.log(`   v: ${v}\n`);

  console.log('📌 SALIDA IMPORTANTE:');
  console.log(`   - Dirección del estudiante: ${account.address}`);
  console.log(`   - Hash EIP-712: ${eip712Hash}`);
  console.log(`   - Firma completa: ${signature}`);
  console.log(`   - Componente r: ${r}`);
  console.log(`   - Componente s: ${s}`);
  console.log(`   - Componente v: ${v}\n`);

  console.log('=== Script 2 Completado ===');
}

main().catch((err) => {
  console.error('Error ejecutando sign-erc712.js:', err);
  process.exit(1);
});