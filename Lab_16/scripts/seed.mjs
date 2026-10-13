import Hyperswarm from 'hyperswarm';
import Hypercore from 'hypercore';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { shortKey, maskHost, makeLogger } from './lib.mjs';

const file = process.argv[2];
const storage = process.argv[3] ?? '.storage/seed';
const blockSize = Number(process.env.BLOCK_SIZE ?? 4096);
const runSeconds = Number(process.env.RUN_S ?? 600);
const log = makeLogger(process.env.LOG_FILE ?? 'logs/seed.log');

if (!file) {
  console.error('Uso: node scripts/seed.mjs <archivo<=1MB> [carpeta-storage]');
  process.exit(1);
}

const data = readFileSync(file);
if (data.length > 1024 * 1024) {
  console.error('El archivo pasa de 1 MB.');
  process.exit(1);
}

const core = new Hypercore(storage);
await core.ready();

if (core.length === 0) {
  const header = { name: basename(file), size: data.length, sha256: createHash('sha256').update(data).digest('hex'), blockSize };
  await core.append(Buffer.from(JSON.stringify(header)));
  const blocks = [];
  for (let i = 0; i < data.length; i += blockSize) blocks.push(data.subarray(i, i + blockSize));
  await core.append(blocks);
}

const header = JSON.parse((await core.get(0)).toString());
log('seed', `archivo ${header.name} · ${header.size} bytes · ${core.length - 1} bloques de ${header.blockSize} B · sha256 ${header.sha256.slice(0, 12)}…`);
log('seed', `KEY=${core.key.toString('hex')}`);

const swarm = new Hyperswarm();
swarm.on('connection', (conn) => {
  const peer = shortKey(conn.remotePublicKey);
  log('connection', `peer ${peer} · ${maskHost(conn.rawStream?.remoteHost)}:${conn.rawStream?.remotePort} · replicando`);
  core.replicate(conn);
  conn.on('error', (e) => log('error', `peer ${peer} · ${e.code ?? e.message}`));
  conn.on('close', () => log('close', `peer ${peer} se desconectó`));
});
await swarm.join(core.discoveryKey, { server: true, client: false }).flushed();
log('seed', `sirviendo (discovery ${shortKey(core.discoveryKey)}…). Ctrl+C o kill para detener.`);

setTimeout(async () => { await swarm.destroy(); process.exit(0); }, runSeconds * 1000).unref?.();
