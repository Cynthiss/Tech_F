const jwt = process.env.PINATA_JWT;
if (!jwt) {
  console.error('Falta PINATA_JWT en .env');
  process.exit(1);
}
const cid = process.argv[2];
const headers = { Authorization: `Bearer ${jwt}` };

async function get(url) {
  const res = await fetch(url, { headers });
  return { res, body: await res.json().catch(() => ({})) };
}

const q = cid ? `&cid=${encodeURIComponent(cid)}` : '';
let { res, body } = await get(`https://api.pinata.cloud/v3/files/public?limit=20${q}`);
if (res.ok && body?.data?.files) {
  console.log(`Pins activos (API v3): ${body.data.files.length}`);
  for (const f of body.data.files) console.log(`- ${f.name}\t${f.cid}\t${f.size} bytes\t${f.created_at ?? ''}`);
} else {
  ({ res, body } = await get(`https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=20${cid ? `&hashContains=${encodeURIComponent(cid)}` : ''}`));
  if (!res.ok) {
    console.error(`Pinata respondió ${res.status}. Revisa que el JWT tenga permiso de lectura.`);
    process.exit(1);
  }
  console.log(`Pins activos (API legacy): ${body.rows?.length ?? 0}`);
  for (const r of body.rows ?? []) console.log(`- ${r.metadata?.name ?? ''}\t${r.ipfs_pin_hash}\t${r.size} bytes\t${r.date_pinned}`);
}
