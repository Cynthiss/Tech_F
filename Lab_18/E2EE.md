# E2EE.md — Signal, WireGuard y acceso excepcional

## 1. Forward secrecy y post-compromise security

Supongamos que el teléfono de uno de los dos se compromete a mitad del chat y el atacante copia el estado **una sola vez**.

- **Mensajes pasados:** quedan protegidos. En el Double Ratchet cada mensaje usó su propia message key, derivada de una cadena y borrada después de usarse. Desde el estado actual no se pueden recalcular las keys viejas: eso es forward secrecy.
- **Excepción importante:** si el historial está guardado en texto plano en el teléfono, el atacante lo lee directamente. La forward secrecy protege el tránsito y el servidor, no el dispositivo, que tiene que mostrar los mensajes ya descifrados.
- **Mensajes futuros:** mientras el atacante solo copió el estado una vez, la conversación se "cura": en cuanto entra un Diffie-Hellman nuevo con keys efímeras que él no tiene, las cadenas se re-siembran con un secreto fresco. Eso es post-compromise security. Si el atacante sigue dentro del dispositivo (malware persistente), la curación no sirve, porque lee los mensajes en pantalla.

## 2. Qué tendría que romper un acceso excepcional

**Contra Signal.** Las keys viven solo en los dispositivos y se borran por diseño, así que el servidor no tiene nada que entregar. Un mandato tendría que forzar que alguien guarde una copia de keys que hoy se destruyen (revertir forward secrecy) o agregar una key de acceso a cada conversación. Además, el Safety Number existe justamente para detectar una key sustituida, de modo que un acceso silencioso tendría que esconderlo o eliminarlo. El punto de acceso sería el dispositivo o el proveedor de la app, que controla las actualizaciones. *Keys Under Doormats* (Abelson et al., MIT CSAIL, 2015; versión en *Journal of Cybersecurity*) sostiene que ese tipo de acceso exige abandonar forward secrecy y crea una vulnerabilidad que no funciona "solo para los autorizados".

**Contra WireGuard.** En un túnel entre dos peers que controlamos no hay proveedor ni servidor intermedio que entregue algo. Las keys de sesión se renuevan cada pocos minutos, de modo que también hay forward secrecy. El punto de acceso serían los propios peers (quien tenga las private keys) o el operador del túnel, que ya ve el tráfico al salir de él. Un mandato tendría que apuntar a quien opera el túnel o debilitar el protocolo para todos.

## 3. Tor, Signal y WireGuard para nuestro venture

Tor esconde quién habla con quién frente a la red y al servidor, pero no el contenido ni lo que el usuario revele al iniciar sesión; Signal esconde el contenido de los mensajes frente al servidor de mensajería, pero ese servidor sigue sabiendo que existe la cuenta y cuándo se conecta; y WireGuard cifra el camino entre nuestros dos peers frente al ISP y la red local, pero el otro extremo del túnel ve los destinos.


