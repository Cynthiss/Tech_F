# THREAT.md — Lab 17: threat model de un flow del venture

**Cynthia Santos · Carnet 20230493** · CS031 Technology & Freedom

> Supuesto PSAV, el mismo de [STORAGE.md](../Lab_15/STORAGE.md): mientras counsel no diga lo contrario, asumimos que el venture podría ser Persona Obligada bajo el Decreto 15-2026, porque maneja KYC, transacciones y registros AML.

## 1. El flow

**Onboarding con KYC:** el usuario inicia sesión en la app web del venture y sube una foto de su DPI y una selfie. La app manda un `POST /kyc` por HTTPS con las imágenes y el JSON `{nombre, DPI, teléfono}`. El backend lo guarda en la base cifrada y borrable (nunca en IPFS) y lo pasa a revisión.

- **Payload:** las imágenes del DPI, la selfie, nombre, número de DPI, teléfono, el token de sesión.
- **Metadata:** desde qué IP y red se conecta, que se conectó a nuestro dominio, a qué hora, cuántas veces lo intentó y cuántos MB subió. Aun sin leer nada, "alguien desde esta casa subió ~3 MB a un exchange de cripto a las 11 p.m." ya dice que esa persona está abriendo una cuenta de activos virtuales.

## 2. Tabla: Solo HTTPS vs Tor vs I2P

| Pregunta | Solo HTTPS | Tor (clearnet vía exit) | I2P (in-net) |
|---|---|---|---|
| **¿Quién aprende la IP del usuario?** | Su ISP o red local, todos los routers del camino, nuestro CDN/hosting y nuestro backend (queda en logs). | Su ISP y el guard. El venture solo ve la IP de un exit, que cambia. | Su ISP y el primer router de su outbound tunnel (y el último de su inbound). Nuestro servicio ve un destino I2P (una llave), no una IP. |
| **¿Quién aprende el destino?** | El ISP y la red local (DNS, SNI y la IP del servidor dicen "va a app.venture.com"). | El exit (y el sitio, obviamente). El ISP solo ve "usa Tor". | Ningún router intermedio sabe que el destino es el venture: el usuario busca nuestro leaseSet en la netDb y el mensaje va por tunnels. El ISP solo ve "usa I2P". |
| **¿Quién puede leer el payload?** | Solo el usuario y nosotros (TLS termina en nuestro servidor; también nuestro CDN si termina TLS ahí). | Igual que HTTPS: Tor no quita TLS. Los relays ven bytes cifrados. | Solo el usuario y nosotros (cifrado de extremo a extremo hasta el destino I2P). |
| **¿Qué se rompe si el exit / un relay es malicioso?** | No hay relays. El riesgo equivalente es un ISP o Wi-Fi malicioso: ve el destino, pero con TLS no lee ni altera el DPI. | El exit ve que alguien sube MB a nuestro dominio y a qué hora; podría bloquear o hacer lento el tráfico. No lee el DPI ni puede alterarlo sin romper TLS. Si alguna parte fuera HTTP, lo leería todo. | No hay exit. Un router malicioso de un tunnel ve solo a sus vecinos y bytes cifrados. Si controla el inicio de un tunnel y del otro lado, puede intentar correlacionar tiempos. |
| **¿Qué se rompe si el usuario inicia sesión?** | Nada nuevo: ya sabíamos su IP y ahora también su cuenta. | **El anonimato frente a nosotros se acaba.** El login y luego el DPI lo identifican con nombre y apellido. Tor sigue escondiendo del ISP que usa nuestro servicio, pero no de nosotros. | Igual que Tor: frente al venture el usuario queda identificado; I2P solo esconde la relación a los observadores de red. |
| **Costo para el usuario** | Ninguno. | Subidas de varios MB más lentas; CAPTCHAs; nuestro antifraude, la pasarela de pagos o el proveedor de KYC pueden bloquear IPs de exits (lo vimos en el kickoff: `www.ufm.edu` responde 403 por Tor y carga normal sin Tor); la geolocalización por IP falla (parece que está en otro país). | El más alto: instalar un router I2P, esperar a que se integre a la red, no hay app móvil común; solo sirve si el venture publica un servicio dentro de I2P, cosa que no haríamos. |
| **¿Qué sigue viendo el venture (y debe ver si es Persona Obligada)?** | Todo: identidad, DPI, IP, dispositivo, horario. | Identidad completa por KYC, la cuenta, las transacciones, el dispositivo y el horario. Pierde la IP real y su geolocalización. Lo que debe ver como PO (identificar al cliente, registrar y reportar) **no cambia** por la IP. | Lo mismo que con Tor: KYC completo, sin IP. Las obligaciones de PO tampoco cambian. |

## 3. Adversarios

**Solo HTTPS** defiende contra quien está en el camino y quiere leer o alterar el contenido: el Wi-Fi de un café, la red de la universidad, el ISP. No defiende contra que esos mismos actores sepan *que* el usuario usa el venture, cuándo y cuánto. **Tor** agrega defensa contra la red local, el ISP y un gobierno con visibilidad parcial (que vea, por ejemplo, la red nacional pero no nuestro servidor): ven "usa Tor", no "usa el exchange". También esconde la IP real del sitio, o sea de nosotros mismos, de un tracker de terceros en la página o de quien robe nuestros logs. **I2P** defiende contra los mismos observadores, sin depender de un exit, pero solo para servicios dentro de su red. **Ninguna de las tres** defiende contra un adversario que ve ambos extremos a la vez: si un gobierno o un ISP grande observa la conexión del usuario hacia el guard y también la llegada a nuestro servidor (o nos pide los logs), puede correlacionar horarios y tamaños: "subió 3.1 MB a las 23:04:12 y nos llegaron 3.1 MB a las 23:04:13". Tor lo declara fuera de su threat model. Y ninguna defiende contra el venture mismo: el usuario nos da su identidad a propósito.

## 4. Tres cosas que Tor NO protege en este flow

1. **El login y el KYC.** Es lo primero que hace el flow: el usuario se identifica en la capa de aplicación. Tor esconde la IP, pero el venture (y quien acceda a nuestra base o nos pida datos) sabe exactamente quién es. Si además entra a la misma cuenta a veces con Tor y a veces sin Tor, las dos sesiones quedan ligadas.
2. **La correlación end-to-end.** Un adversario que ve el tráfico del usuario entrando a Tor y el tráfico llegando a nuestro servidor (o que tiene nuestros logs con hora y tamaño de cada `POST /kyc`) puede emparejarlos por tiempos y volumen. Una subida de varios MB es una huella fácil.
3. **Lo que sale por fuera de Tor Browser.** Si el usuario usa nuestra app móvil, un archivo descargado (p. ej. el PDF del contrato) que abre en otro programa, o si toma la selfie con una app que sube a otro servicio, ese tráfico sale con su IP real. Las fotos además pueden traer metadata EXIF (modelo del teléfono, a veces GPS) que Tor no limpia. Y el fingerprinting: si cambia el tamaño de la ventana o instala extensiones, deja de verse igual que los demás usuarios de Tor Browser.

## 5. I2P (conceptual, a partir de la intro oficial)

I2P no está diseñado para lo que hace este flow. Es una red de mensajes donde cada router arma **tunnels unidireccionales**: uno outbound para enviar y otro inbound para recibir, así que la petición y la respuesta van por caminos distintos (en Tor es un solo circuito de ida y vuelta). Para hablar con un servicio, el cliente busca su **leaseSet** en la **netDb** (una base distribuida, sin directory authorities como Tor), manda el mensaje por su outbound tunnel hasta un gateway del inbound tunnel del servicio, y con **garlic encryption** puede empaquetar varios mensajes ("cloves") en uno para que los intermedios no sepan cuántos van ni a dónde va cada uno. La consecuencia para nosotros: para usar I2P tendríamos que publicar el onboarding *dentro* de I2P, porque no hay exit al clearnet como caso por defecto, y eso queda fuera de lo que haríamos (y de este lab). Gana en que no existe un exit que vea el destino; pierde en usabilidad, en adopción y en que nuestra pasarela de pagos y el proveedor de KYC viven en el clearnet.

## 6. Conclusión para el producto

Este flow necesita **confidencialidad del payload** (HTTPS bien hecho, base cifrada) y no anonimato frente al venture, que es imposible por diseño: el flow existe para identificar al usuario. Aceptar conexiones por Tor sí tiene sentido para proteger a un usuario de su red local o de su ISP (que no sepan que tiene cuenta en un exchange). Lo honesto que podemos prometer: "aceptamos conexiones por Tor y no guardamos la IP más tiempo del que exija la ley". Lo que no prometeremos: "anonimato", "nadie sabe que usas la app" ni "protegido contra gobiernos". Si somos Persona Obligada bajo el Decreto 15-2026, aceptar Tor no cambia el deber de identificar al cliente, registrar y reportar; qué datos técnicos (como IPs) conservar y por cuánto tiempo depende del reglamento del art. 127, aún pendiente. (La Iniciativa 6538 no es ley.) Hipótesis para counsel, no opinión legal.

## 7. Payload vs metadata, en una línea

HTTPS esconde el qué (el DPI); Tor esconde el quién ↔ con quién frente a la red; ninguno esconde al usuario del venture al que le entrega su identidad.
