# LIBERTAD_Y_FIRMAS

## Pregunta 1: ¿Cómo funcionan las firmas criptográficas?

Las firmas criptográficas permiten demostrar que una persona autorizó un mensaje o una transacción utilizando su clave privada, sin necesidad de revelar dicha clave. En este laboratorio se generó un par de claves: una clave privada, que únicamente conoce el propietario y se utiliza para firmar, y una clave pública, que cualquier persona puede usar para verificar que la firma es auténtica. De esta manera, cualquiera puede comprobar que el mensaje fue firmado por el propietario de la clave privada sin necesidad de conocerla.

En el primer script también se observó que al modificar un solo byte de la firma, la verificación falla inmediatamente. Esto demuestra que las firmas digitales son muy sensibles a cualquier alteración y garantizan la integridad de la información. En el segundo script se utilizó el estándar ERC-712, que además de firmar un mensaje, incorpora información estructurada como el dominio de la aplicación, la versión, el identificador de la cadena (chainId) y los datos específicos del mensaje. Esto hace que la firma tenga un contexto determinado y no pueda reutilizarse fácilmente en otra aplicación.

---

## Pregunta 2: ¿Por qué esto importa para la libertad?

Las firmas criptográficas permiten que una persona pueda demostrar su identidad de forma matemática, sin depender de una autoridad central como un banco, una empresa o un gobierno. La verificación se realiza mediante criptografía y no por la confianza depositada en un tercero. Esto reduce la necesidad de intermediarios y permite que los usuarios tengan un mayor control sobre sus activos y sus acciones dentro de una red blockchain.

Además, las firmas proporcionan no repudiación, ya que únicamente quien posee la clave privada puede generar una firma válida. También fortalecen la resistencia a la censura, porque una firma correcta siempre será válida independientemente de quién la emita. Estos principios se relacionan con la filosofía discutida en clase sobre confianza minimizada y poder individual, donde las matemáticas reemplazan la necesidad de confiar en una autoridad central para validar las acciones de los usuarios.

---

## Pregunta 3: Viem vs. ethers.js

Viem es una biblioteca más moderna para el desarrollo sobre Ethereum. Está diseñada con TypeScript desde su origen, ofrece una mayor seguridad de tipos y una API más clara y modular. Además, tiene un menor tamaño y un mejor rendimiento en comparación con ethers.js, lo que facilita el desarrollo de aplicaciones más eficientes.

Otra ventaja importante es que Viem es la base sobre la que se construye Wagmi, una de las librerías más utilizadas actualmente para desarrollar aplicaciones descentralizadas. Por estas razones, muchos desarrolladores modernos prefieren utilizar Viem en nuevos proyectos relacionados con Ethereum.

---

## Pregunta 4: Comparación de seguridad

Si un atacante intentara falsificar una firma ERC-712 sin conocer la clave privada del propietario, no podría generar una firma válida. La seguridad del algoritmo ECDSA hace que sea computacionalmente inviable producir una firma correcta sin poseer la clave privada correspondiente.

El componente **v** es importante porque permite recuperar correctamente la clave pública del firmante durante el proceso de verificación utilizando `ecrecover` en Solidity. Por otro lado, el dominio EIP-712, compuesto por el nombre de la aplicación, la versión y el chainId, evita que una firma válida pueda reutilizarse en otra aplicación o en otra red blockchain. Esto protege al usuario frente a ataques de repetición (replay attacks) y garantiza que la firma únicamente sea válida dentro del contexto para el que fue creada.