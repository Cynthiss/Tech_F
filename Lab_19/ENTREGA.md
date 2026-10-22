# Entrega Lab 19

> Todas las respuestas son reales (ver `registro/`). Nunca la nsec. Nota importante: no usamos el relay de clase del instructor; con permiso para usar otros relays, el "relay de clase" fue un **relay propio** (nostr-rs-relay en Docker) y el **ban lo hicimos nosotros** como operadores, quitando la llave de la lista de autores permitidos.

## LAB # 19

**npub de test:** `npub1xs4cndsw97x8qnzspu7tv6revfpjrc5m8wfhqs943wfxkyga3puq9f60ew`
**id de la nota 1:** `569f0ad921173dd8aacac34026152b021a6f01fae20be1069698eceae3b8b57f`
**id de la nota #2:** `4fb6d75969c9c4c37e86d47151abc33d6fde7fbddd51bfc357a935e45dfcff7b`

### Tabla de relays

| Relay | ¿Aceptó la nota 1? (respuesta OK) | ¿La devolvió al pedirla? | ¿Aceptó la nota #2 después del ban? |
|---|---|---|---|
| relay.damus.io | 1.er intento: `connecting… status 503` (no conectó). Reintento a las 04:24:34Z: `success` | Sí, tras el reintento | No: `status 503` en los dos intentos |
| nos.lol | `success` | Sí | Sí: `success`, y la devolvió |
| nostr.wine (de pago) | `failed: msg: restricted: sign up at https://nostr.wine to write events to this relay` | No | — (no se publica ahí) |
| Relay de clase (propio) | `success` | Sí | No: `failed: msg: blocked: pubkey is not allowed to publish to this relay` |

### Comprobación de firma

La nota original dio **válida** (código de salida 0); la copia con una letra cambiada dio **inválida** (`invalid .id, expected id::af57c0f2…, got id::569f0ad9…`), porque al cambiar el texto cambia la huella (el id) y la firma ya no cuadra con él.

### Reflexión (3 líneas)

1. Mi nota quedó en 3 de 4 relays (nos.lol, relay.damus.io tras un reintento y mi relay propio); nostr.wine la rechazó con `restricted: sign up at https://nostr.wine to write events to this relay`.
2. El ban me quitó poder publicar en mi relay propio (`blocked: pubkey is not allowed to publish to this relay`), pero no la nota #2 en nos.lol ni mi npub: sigo siendo la misma llave y los demás relays siguen aceptándome.
3. Si mi venture tuviera una cuenta Nostr, la nsec la guardaría en un firmador remoto (NIP-46) a cargo de una sola persona responsable, porque así ninguna app ve la llave y hay alguien claro que la cuida.

### Higiene

npub sí, nsec nunca (verificado con `scripts/revisar-secretos.sh`). Contenido fijo. 2 notas en relays públicos: la nota 1 (en nos.lol y relay.damus.io) y la #2 (en nos.lol). Sin pagar nada.
