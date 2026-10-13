import Hyperswarm from 'hyperswarm';
import { topicFromString, shortKey, maskHost, makeLogger } from './lib.mjs';

const topicString = process.argv[2] ?? process.env.TOPIC_STRING;
const carnet = process.argv[3] ?? process.env.CARNET ?? '20230493';
const runSeconds = Number(process.env.RUN_S ?? 120);
const logFile = process.env.LOG_FILE ?? 'logs/kickoff.log';

if (!topicString) {
  console.error('Uso: node scripts/peer.mjs "<string-del-topic>" [carnet]\nEjemplo: node scripts/peer.mjs "cs031-s19-YYYYMMDD" 20230493');
  process.exit(1);
}

const log = makeLogger(logFile);
const topic = topicFromString(topicString);
const swarm = new Hyperswarm();
let connections = 0;

// Diagnóstico: Hyperswarm no avisa cuando un intento de conexión falla; escuchamos el error de cada intento.
const dhtConnect = swarm.dht.connect.bind(swarm.dht);
swarm.dht.connect = (publicKey, opts) => {
  const c = dhtConnect(publicKey, opts);
  log('intento', `intentando conectar con el peer ${shortKey(publicKey)}`);
  c.on('error', (e) => log('intento-fallido', `peer ${shortKey(publicKey)} · error ${e.code ?? e.message}`));
  return c;
};

log('inicio', `mi id ${shortKey(swarm.keyPair.publicKey)} · topic "${topicString}" -> ${topic.toString('hex').slice(0, 8)}…`);

swarm.on('connection', (conn) => {
  connections++;
  const peer = shortKey(conn.remotePublicKey);
  const host = conn.rawStream?.remoteHost;
  const port = conn.rawStream?.remotePort;
  log('connection', `peer ${peer} · dirección remota del socket ${maskHost(host)}:${port}`);
  if (process.env.FULL_ADDR !== '1') console.log(`   (en pantalla, no en el log) dirección remota completa: ${host}:${port}`);

  conn.on('data', (d) => log('recv', `peer ${peer} · payload "${d.toString().slice(0, 200)}"`));
  conn.on('error', (e) => log('error', `peer ${peer} · ${e.code ?? e.message}`));
  conn.on('close', () => log('close', `peer ${peer} cerró la conexión`));

  const msg = `ping desde ${carnet}`;
  conn.write(msg);
  log('send', `peer ${peer} · payload "${msg}"`);
});

const discovery = swarm.join(topic, { server: true, client: true });
await discovery.flushed();
log('joined', `anunciado en el DHT y buscando peers (esperando hasta ${runSeconds} s)`);

const status = setInterval(() => {
  const c = swarm.stats.connects.client;
  log('estado', `peers descubiertos: ${swarm.peers.size} · intentos de conexión: ${c.attempted} (abiertas ${c.opened}) · conexiones activas: ${swarm.connections.size}`);
}, 10000);
status.unref?.();

const timer = setTimeout(async () => {
  if (connections === 0) log('fallo', 'sin peers tras el tiempo de espera (timeout / no peers). Corre: npm run diagnose');
  else log('fin', `conexiones totales: ${connections}`);
  await swarm.destroy();
  process.exit(connections === 0 ? 2 : 0);
}, runSeconds * 1000);
timer.unref?.();
