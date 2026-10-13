import DHT from 'hyperdht';
import { makeLogger } from './lib.mjs';

const log = makeLogger(process.env.LOG_FILE ?? 'logs/diagnose.log');
const dht = new DHT();
const t0 = Date.now();
log('diagnóstico', 'probando alcance de los bootstrap nodes de HyperDHT por UDP…');

try {
  await Promise.race([
    dht.fullyBootstrapped(),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout de 20 s')), 20000)),
  ]);
  log('bootstrap', `ok en ${Date.now() - t0} ms · bootstrapped=${dht.bootstrapped}`);
} catch (e) {
  log('bootstrap', `FALLÓ: ${e.message}. Posibles causas: red que bloquea UDP, captive portal o firewall.`);
}
log('nat', `firewalled=${dht.firewalled} · randomized=${dht.randomized} · puerto local=${dht.port}`);
log('nodos', `nodos conocidos en la tabla de ruteo: ${dht.nodes.length}`);
await dht.destroy();
