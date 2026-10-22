# Entrega Lab 19 (plantilla para llenar en clase)

> Llenar solo con respuestas **reales** de los relays. Nunca la nsec.

## LAB # 19

**npub de test:** `[pendiente: npub de tu llave de test]`
**id de la nota 1:** `[pendiente: id de 64 caracteres]`

### Tabla de relays

| Relay | ¿Aceptó la nota 1? (respuesta OK) | ¿La devolvió al pedirla? | ¿Aceptó la nota #2 después del ban? |
|---|---|---|---|
| relay.damus.io | `[pendiente]` | `[pendiente]` | `[pendiente]` |
| nos.lol | `[pendiente]` | `[pendiente]` | `[pendiente]` |
| nostr.wine (de pago) | `[pendiente: debe rechazarla; copiar el mensaje exacto]` | `[pendiente]` | — (no se publica ahí) |
| Relay de clase | `[pendiente]` | `[pendiente]` | `[pendiente: copiar el mensaje exacto del rechazo]` |

### Comprobación de firma

`[pendiente]` Ejemplo de redacción: "La nota original dio válida; la copia con una letra cambiada dio `invalid .id`, porque cambia la huella (el id) y la firma ya no cuadra con el texto."

### Reflexión (3 líneas, con datos de tu tabla)

1. Mi nota quedó en `___` de 4 relays; `___` la rechazó con `___`.
2. El ban me quitó `___` pero no `___`.
3. Si mi venture tuviera una cuenta Nostr, la nsec la guardaría `___` porque `___`.

Ideas para la línea 3 (elige un lugar real y di por qué): en un **firmador** (extensión del navegador, NIP-07, o firmador remoto, NIP-46) para que ninguna app vea la nsec; **cifrada con contraseña** (NIP-49) en un solo respaldo; o con **una sola persona responsable**, con un plan para cuando esa persona se vaya.

### Higiene

npub sí, nsec nunca; contenido fijo; máximo 2 notas en relays públicos (la nota 1 y la #2).
