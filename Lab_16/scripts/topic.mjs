import { topicFromString } from './lib.mjs';

const s = process.argv[2];
if (!s) {
  console.error('Uso: node scripts/topic.mjs "cs031-s19-YYYYMMDD"');
  process.exit(1);
}
const hex = topicFromString(s).toString('hex');
console.log(`string : ${s}`);
console.log(`topic  : ${hex} (32 bytes)`);
console.log(`id corto: ${hex.slice(0, 8)}`);
