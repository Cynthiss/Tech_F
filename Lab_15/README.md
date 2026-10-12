# Lab 15 — IPFS + Pinata: CID + pin + resolve (Sesión 18)

Ciclo content-addressed completo: producir un CID, pinnearlo en Pinata, resolverlo por un gateway HTTP y documentar la política de datos en [STORAGE.md](STORAGE.md).

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `venture-hello.json` | Archivo de prueba sin PII que se sube a IPFS |
| `scripts/cid-local.mjs` | Calcula el CID esperado del archivo, sin internet ni cuenta |
| `scripts/pin.mjs` | Sube el archivo a Pinata (rechaza correos, números largos, JWT y llaves privadas) |
| `scripts/list-pins.mjs` | Lista los pins activos para la evidencia |
| `scripts/resolve.mjs` | Abre el CID en varios gateways y compara los bytes con el archivo local |
| `STORAGE.md` | Política de datos del venture (borrador) |

Los scripts no necesitan instalar nada (Node 22 o más). El JWT se lee solo desde `.env`, que está en `.gitignore`.

## Pasos

Los pasos 1 y 2 los hace una persona del equipo con su propia cuenta; el JWT nunca se pega en el chat ni en git.

1. **Cuenta de Pinata** en https://app.pinata.cloud y una **API key con scope mínimo** (solo subir y listar archivos). Opcional: crear un gateway dedicado.
2. `cp .env.example .env` y pegar el JWT en `PINATA_JWT` (solo en tu máquina).
3. Ver el CID esperado, que se calcula sin cuenta:
   ```bash
   npm run cid
   ```
4. Subir y pinnear:
   ```bash
   npm run pin
   ```
5. Confirmar el pin activo (para la captura del dashboard o la salida de la lista):
   ```bash
   npm run list
   ```
6. Resolver por gateway:
   ```bash
   npm run resolve -- <CID>
   ```
   Cada paso queda anotado en `lab-log.txt` (solo fecha, acción y CID, sin llaves).
7. Pegar CID, gateway y fecha en [STORAGE.md](STORAGE.md) y en el chat de lab: `CID: bafkrei…` y `resolve: sí/no`.

## Registro del lab

| Dato | Valor |
|---|---|
| CID esperado (cálculo local) | `bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u` |
| CID devuelto por Pinata | `bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u` (coincide con el esperado) |
| Provider | Pinata |
| Pin activo | Sí: `npm run list` muestra `venture-hello.json`, 119 bytes, 2026-10-08 (ver `lab-log.txt`) |
| Gateway que resuelve | https://black-adjacent-mackerel-93.mypinata.cloud/ipfs/bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u (gateway dedicado de Pinata) |
| Fecha | 2026-10-08 |
| Resolve | sí: el gateway dedicado devolvió 200 con los mismos 119 bytes (SHA-256 igual al archivo local). El gateway público `gateway.pinata.cloud` también devolvió 200 el 2026-10-08; `ipfs.io` y `dweb.link` respondieron 429 por límite de uso |

## Evidencia

- **Pin activo:** [evidence/pinata-files.webp](evidence/pinata-files.webp), captura de Pinata → Files (pestaña Public) con `venture-hello.json`, CID `bafkr…icb5u`, 119 B, 10/8/2026. También `npm run list`.
- **Resolve:** salida de `curl` contra el gateway dedicado (sin llaves):

```text
$ curl -si https://black-adjacent-mackerel-93.mypinata.cloud/ipfs/bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u
HTTP/2 200
content-type: application/json
content-length: 119

{
  "lab": "CS031 Lab 15",
  "message": "hello from the venture",
  "contains_pii": false,
  "created": "2026-10-06"
}
```

- **Lab log:** [lab-log.txt](lab-log.txt) registra el pin y los resolve con su fecha y hora, sin llaves.

## Entrega en el carnet

```markdown
## LAB # 15

[STORAGE.md](https://github.com/Cynthiss/Tech_F/blob/main/Lab_15/STORAGE.md) · [Gateway que resuelve el CID](https://black-adjacent-mackerel-93.mypinata.cloud/ipfs/bafkreigprxyihupukgjjjnrkurd3qq66ys5tm52xxn76apwsxymxticb5u)

### Comentarios de Aprendizaje
Un CID identifica el contenido por su hash, no su ubicación; por eso cambia si cambia un solo byte. Subir un archivo no lo hace disponible para siempre: sigue vivo mientras alguien lo pinnee. Si unpinneamos, el CID deja de resolver en nuestro gateway, pero no podemos asegurar que otros nodos no guardaron una copia, así que nada que deba borrarse (PII, llaves) va a IPFS público. Aprendimos también que un gateway es solo una puerta HTTP hacia la red, no el protocolo: el mismo CID se puede pedir desde cualquier gateway.
```

## Seguridad

- No commitear `.env`, el JWT ni ninguna API key. Si se filtra una, se revoca y se crea otra.
- No subir PII ni KYC: lo pinneado en IPFS público no se puede borrar de la red.
