import Hyperswarm from 'hyperswarm';
import Hypercore from 'hypercore';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { shortKey, maskHost, sleep, makeLogger } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const keyHex = args.find((a) => /^[0-9a-f]{64}$/i.test(a));
const storage = opt('storage', '.storage/fetch');
const out = opt('out', 'downloads/received.txt');
const delayMs = Number(opt('delay-ms', 0));
const stallS = Number(opt('stall-timeout-s', 20));
const keepSeeding = args.includes('--keep-seeding');
const holdS = Number(opt('hold-s', 60));
const log = makeLogger(process.env.LOG_FILE ?? 'logs/fetch.log');

if (!keyHex) {
  console.error('Uso: node scripts/fetch.mjs <KEY-64-hex> [--storage dir] [--out archivo] [--delay-ms N] [--stall-timeout-s N] [--keep-seeding] [--hold-s N]');
  process.exit(1);
}

const core = new Hypercore(storage, Buffer.from(keyHex, 'hex'));
await core.ready();

const swarm = new Hyperswarm();
let peers = 0;
swarm.on('connection', (conn) => {
  peers++;
  const peer = shortKey(conn.remotePublicKey);
  log('connection', `peer ${peer} · ${maskHost(conn.rawStream?.remoteHost)}:${conn.rawStream?.remotePort} (peers activos: ${peers})`);
  core.replicate(conn);
  conn.on('error', (e) => log('error', `peer ${peer} · ${e.code ?? e.message}`));
  conn.on('close', () => { peers--; log('close', `peer ${peer} se desconectó (peers activos: ${peers}) · bloques locales ${core.contiguousLength}/${core.length}`); });
});
swarm.join(core.discoveryKey, { server: keepSeeding, client: true });
log('fetch', `buscando el core ${keyHex.slice(0, 8)}… (discovery ${shortKey(core.discoveryKey)}…)`);

const stall = async (i, msg) => {
  log('STALL', `${msg} · descargados ${Math.max(0, core.contiguousLength - 1)} de ${Math.max(0, core.length - 1)} bloques · peers activos ${peers}`);
  await swarm.destroy();
  process.exit(3);
};

try {
  await core.update({ wait: true });
} catch { /* se maneja con el timeout del primer bloque */ }

let header;
try {
  header = JSON.parse((await core.get(0, { timeout: stallS * 1000 })).toString());
} catch {
  await stall(0, `sin peers que sirvan el core tras ${stallS} s`);
}
const total = core.length - 1;
log('fetch', `archivo ${header.name} · ${header.size} bytes · ${total} bloques · delay ${delayMs} ms por bloque`);

const chunks = [];
for (let i = 1; i <= total; i++) {
  let block;
  try {
    block = await core.get(i, { timeout: stallS * 1000 });
  } catch {
    await stall(i, `el bloque ${i}/${total} no llegó en ${stallS} s (el seeder se cayó y no hay otro)`);
  }
  chunks.push(block);
  if (i % 10 === 0 || i === total) log('progreso', `${i}/${total} bloques`);
  if (delayMs) await sleep(delayMs);
}

const data = Buffer.concat(chunks);
const sha = createHash('sha256').update(data).digest('hex');
mkdirSync(out.includes('/') ? out.slice(0, out.lastIndexOf('/')) : '.', { recursive: true });
writeFileSync(out, data);
log('COMPLETO', `${data.length} bytes · sha256 ${sha === header.sha256 ? 'COINCIDE' : 'NO COINCIDE'} con el del seeder · guardado en ${out}`);

if (keepSeeding) {
  log('seed', `sigo sirviendo el archivo como seeder durante ${holdS} s`);
  setTimeout(async () => { await swarm.destroy(); process.exit(0); }, holdS * 1000);
} else {
  await swarm.destroy();
  process.exit(0);
}
