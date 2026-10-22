# Lab 19 — Nostr: una nota firmada en varios relays (Sesión 22)

Firmar una nota con una llave de test, comprobar la firma (y ver que falla si se altera una letra), publicar la misma nota en 4 relays, ver a uno rechazarla y comprobar que, tras un ban en el relay de clase, la nota sigue en los demás.

**Este lab se hace y se entrega en clase** (~30 min, sin homework). El relay de clase y el ban los corre el instructor, así que la tabla de relays solo se puede llenar con respuestas reales durante la clase.

## Estado

| Parte | Estado |
|---|---|
| `nak` instalado desde el repositorio oficial (Homebrew, versión 0.21.2) | Hecho |
| Ensayo de firmar y comprobar sin internet (original válido, copia alterada inválida) | Hecho, con una llave **de ensayo** (no es la de la entrega) |
| Llave de test de la clase, nota 1, publicar en 4 relays, pedirla de vuelta | **En clase** |
| El ban y la nota #2 | **En clase** |
| Entrega en el carnet ([ENTREGA.md](ENTREGA.md)) | **En clase,** con los datos reales |

## Límites (no negociables)

- Solo llaves de test generadas en clase. **Nunca** pegar, commitear, fotografiar ni subir una nsec, ni siquiera la de test.
- Máximo 2 notas por persona en relays públicos, sin loops.
- Contenido fijo: `CS031 Lab 19 · nota de prueba` (y `#2`) con la etiqueta `t=cs031lab19`. Nada personal ni sobre otras personas.
- No scrapear: solo pedir tu propia nota por su id.
- Respetar los ToS de cada relay, no pagar nada y no evadir bans fuera del relay de clase.

## Paso a paso (en clase)

Guarda las respuestas reales en `registro/` con `tee`: esos archivos tienen la nota y las respuestas de los relays, pero **nunca la llave privada**.

**1. Llave de test (3 min)**
```bash
export NOSTR_SECRET_KEY=$(nak key generate)
nak key public $NOSTR_SECRET_KEY
nak encode npub <llave-pública-hex-del-paso-anterior>
```
Anota tu `npub` (esa sí se comparte). No imprimas ni copies `$NOSTR_SECRET_KEY`.

**2. Firmar y comprobar, sin internet (7 min)**
```bash
nak event -c 'CS031 Lab 19 · nota de prueba' -t t=cs031lab19 > registro/nota1.json
cat registro/nota1.json | nak verify
sed 's/nota de prueba/nota de pruebb/' registro/nota1.json > registro/nota1-alterada.json
cat registro/nota1-alterada.json | nak verify
```
Abre `nota1.json`, ubica los 7 campos (`id`, `pubkey`, `created_at`, `kind`, `tags`, `content`, `sig`) y anota el `id`.

**3. Publicar en 4 relays (8 min)**
```bash
cat registro/nota1.json | nak event relay.damus.io nos.lol nostr.wine <relay-de-clase> 2>&1 | tee registro/respuestas-nota1.txt
```
Anota la respuesta de cada relay (aceptada, o rechazada y con qué razón). `nostr.wine` debe rechazarla; **no pagues**. Luego pídela de vuelta, relay por relay:
```bash
nak req -i <id> relay.damus.io 2>&1 | tee -a registro/devuelta-nota1.txt
nak req -i <id> nos.lol 2>&1 | tee -a registro/devuelta-nota1.txt
nak req -i <id> nostr.wine 2>&1 | tee -a registro/devuelta-nota1.txt
nak req -i <id> <relay-de-clase> 2>&1 | tee -a registro/devuelta-nota1.txt
```

**4. El ban (7 min).** Cuando el instructor avise (banea las llaves de test en el relay de clase):
```bash
nak event -c 'CS031 Lab 19 · nota de prueba #2' -t t=cs031lab19 relay.damus.io nos.lol <relay-de-clase> 2>&1 | tee registro/respuestas-nota2.txt
```
Anota qué respondió el relay de clase y si la #2 quedó en los abiertos (`nak req -i <id-de-la-#2> relay.damus.io`). Respuesta corta: ¿cambió tu npub? ¿alguien que te sigue puede seguir encontrándote?

**5. Entregar (5 min).** Revisa que no hay secretos, **cierra la terminal** (la llave de test se va con ella) y entrega:
```bash
bash scripts/revisar-secretos.sh
```

## Ensayo previo (con una llave distinta a la de clase)

Se verificó que los comandos del paso 2 funcionan. Resultados, para saber qué esperar:

| Prueba | Resultado |
|---|---|
| `cat nota1.json \| nak verify` (original) | Sin error, código de salida 0: **válida** |
| `cat nota1-alterada.json \| nak verify` (una letra cambiada) | `invalid .id, expected id::ae1a9d83…, got id::0ae09ba6…`, código de salida 123: **inválida** |

**Por qué falla:** el `id` es la huella (SHA-256) del evento. Al cambiar una letra del texto, la huella que se recalcula es otra y ya no coincide con el `id` firmado, así que la firma deja de cuadrar y la nota se descarta.

## Qué no se puede hacer fuera de clase

La tabla de relays y la evidencia del ban necesitan el relay de clase y el ban del instructor. No se pueden reconstruir después ni inventar: si no se hacen en clase, no hay datos reales que reportar.
