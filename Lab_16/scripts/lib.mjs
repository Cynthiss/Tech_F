import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const topicFromString = (s) => createHash('sha256').update(s).digest();
export const shortKey = (key) => Buffer.from(key).toString('hex').slice(0, 8);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// En archivos de log no guardamos la IP completa de otras personas (repo público):
// se enmascaran los dos últimos octetos (en red local, los tres últimos) salvo que FULL_ADDR=1.
export function maskHost(host) {
  if (process.env.FULL_ADDR === '1' || !host) return host;
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(host);
  if (!m) return host.split(':').slice(0, 2).join(':') + ':x:x';
  const [a, b] = [Number(m[1]), Number(m[2])];
  const isLocal = a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
  return isLocal ? `${m[1]}.x.x.x (red local)` : `${m[1]}.${m[2]}.x.x`;
}

export function makeLogger(file) {
  if (file) mkdirSync(dirname(file), { recursive: true });
  return (event, msg) => {
    const line = `${new Date().toISOString()} [${event}] ${msg}`;
    console.log(line);
    if (file) appendFileSync(file, line + '\n');
  };
}
