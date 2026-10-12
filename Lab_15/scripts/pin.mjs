import { readFileSync, appendFileSync } from 'node:fs';
import { basename } from 'node:path';

const file = process.argv[2] ?? 'venture-hello.json';
const jwt = process.env.PINATA_JWT;

if (!jwt) {
  console.error('Falta PINATA_JWT. Crea .env a partir de .env.example y llénalo solo en tu máquina.');
  process.exit(1);
}

const bytes = readFileSync(file);
const text = bytes.toString('utf8');

// Guarda básica anti-PII/secretos: lo pinneado en IPFS público no se puede borrar de la red.
const checks = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/, 'parece un correo electrónico'],
  [/\d{8,}/, 'tiene una secuencia larga de dígitos (teléfono, DPI, tarjeta...)'],
  [/eyJ[\w-]{10,}\.[\w-]{10,}\./, 'parece un JWT'],
  [/BEGIN [A-Z ]*PRIVATE KEY/, 'parece una llave privada'],
  [/0x[0-9a-fA-F]{64}\b/, 'parece una llave privada hexadecimal'],
];
for (const [re, why] of checks) {
  if (re.test(text)) {
    console.error(`Abortado: ${file} ${why}. No se sube PII ni secretos a IPFS público.`);
    process.exit(1);
  }
}

const form = new FormData();
form.append('network', 'public');
form.append('name', basename(file));
form.append('file', new Blob([bytes]), basename(file));

const res = await fetch('https://uploads.pinata.cloud/v3/files', {
  method: 'POST',
  headers: { Authorization: `Bearer ${jwt}` },
  body: form,
});
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Pinata respondió ${res.status}:`, JSON.stringify(body).slice(0, 300));
  process.exit(1);
}

const { cid, id, size } = body.data;
const date = new Date().toISOString();
console.log(`Pin creado. CID: ${cid}`);
console.log(`id: ${id} · tamaño: ${size} bytes · ${date}`);
console.log(`Gateway público : https://ipfs.io/ipfs/${cid}`);
if (process.env.PINATA_GATEWAY) console.log(`Gateway dedicado: ${process.env.PINATA_GATEWAY}/ipfs/${cid}`);
appendFileSync('lab-log.txt', `${date}\tpin\t${basename(file)}\t${cid}\n`);
