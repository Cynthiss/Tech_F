import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cid = process.argv[2];
const localFile = process.argv[3] ?? 'venture-hello.json';
if (!cid) {
  console.error('Uso: npm run resolve -- <CID> [archivo-local]');
  process.exit(1);
}

const gateways = [
  process.env.PINATA_GATEWAY,
  'https://ipfs.io',
  'https://dweb.link',
  'https://gateway.pinata.cloud',
].filter(Boolean);

const sha = (b) => createHash('sha256').update(b).digest('hex');
const expected = existsSync(localFile) ? sha(readFileSync(localFile)) : null;
let anyOk = false;

for (const gw of gateways) {
  const url = `${gw.replace(/\/$/, '')}/ipfs/${cid}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const bytes = Buffer.from(await res.arrayBuffer());
    const same = expected ? sha(bytes) === expected : 'n/a';
    console.log(`${res.status}\t${url}\t${bytes.length} bytes\tcontenido idéntico al local: ${same}`);
    if (res.ok && same === true) anyOk = true;
  } catch (e) {
    console.log(`ERR\t${url}\t${e.name}`);
  }
}

console.log(`resolve: ${anyOk ? 'sí' : 'no'}`);
appendFileSync('lab-log.txt', `${new Date().toISOString()}\tresolve\t${cid}\t${anyOk ? 'sí' : 'no'}\n`);
