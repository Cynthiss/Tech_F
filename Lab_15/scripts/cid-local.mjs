import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

function base32(buf) {
  let bits = 0;
  let val = 0;
  let out = '';
  for (const byte of buf) {
    val = (val << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
    val &= (1 << bits) - 1;
  }
  if (bits > 0) out += ALPHABET[(val << (5 - bits)) & 31];
  return out;
}

// CIDv1, codec raw (0x55), sha2-256. Solo aplica a archivos de un solo bloque (<= 256 KiB).
export function rawCidV1(bytes) {
  const digest = createHash('sha256').update(bytes).digest();
  return 'b' + base32(Buffer.concat([Buffer.from([0x01, 0x55, 0x12, 0x20]), digest]));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/cid-local.mjs <archivo>');
    process.exit(1);
  }
  const bytes = readFileSync(file);
  if (statSync(file).size > 262144) console.warn('Aviso: el archivo pasa de 256 KiB; este CID local no aplica.');
  console.log(`archivo : ${file} (${bytes.length} bytes)`);
  console.log(`sha256  : ${createHash('sha256').update(bytes).digest('hex')}`);
  console.log(`CID esperado (CIDv1 raw): ${rawCidV1(bytes)}`);
  console.log('Compáralo con el CID que devuelve Pinata. Si difiere, Pinata empaquetó el archivo distinto; lo que importa es que el gateway sirva los mismos bytes (npm run resolve).');
}
