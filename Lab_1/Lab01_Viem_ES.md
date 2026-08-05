# 🔬 Lab 01 — Firmas Criptográficas Node.js & ERC-712 con Viem

**Stack:** Node.js 20 · Viem · @wdk/wallet

---

## Acerca de este lab

Las firmas criptográficas son el mecanismo detrás de cada transacción blockchain, login de wallet y autenticación de aplicación. ERC-712 es el estándar para firmar datos estructurados (tipificados) usado por MetaMask, Uniswap y prácticamente todas las aplicaciones modernas.

En este lab construirás dos scripts:
1. **Script 1:** Demuestra firmas ECDSA brutas (criptografía pura)
2. **Script 2:** Demuestra firmas ERC-712 (datos estructurados + dominio)

Ambas firmas pueden ser verificadas más tarde en una blockchain usando el opcode `ecrecover` en Solidity.

**¿Por qué Viem?** Viem es la biblioteca moderna de Ethereum: type-safe, minimalista, y construida desde cero en TypeScript. Es lo que impulsa Wagmi y es una alternativa superior a ethers.js.

---

## ⚡ Kickoff en clase (~30 minutos)

### Configuración inicial

```bash
mkdir lab01 && cd lab01
npm init -y
npm install viem @wdk/wallet
```

---

## Script 1: Firmas ECDSA Brutas con Viem

**Archivo:** `sign-raw.js`

Este script genera un par de claves ECDSA secp256k1, firma un mensaje, y demuestra cómo una firma corrupta falla la verificación.

```javascript
/**
 * sign-raw.js
 * Demuestra firmas ECDSA secp256k1 brutas con Viem y generación de wallet WDK
 */

const { privateKeyToAccount, signMessage } = require('viem/accounts');
const { Wallet } = require('@wdk/wallet');
const crypto = require('crypto');

console.log('=== Script 1: Firmas ECDSA Brutas con Viem ===\n');

// Paso 1: Genera un par de claves EC secp256k1 (Node.js crypto)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('✓ Par de claves secp256k1 generado\n');

// Paso 2: Firma el mensaje "Hello UFM" usando Node.js crypto
const message = 'Hello UFM';
const signer = crypto.createSign('SHA256');
signer.update(message);
const signatureHex = signer.sign(privateKey, 'hex');

console.log(`📝 Mensaje: "${message}"`);
console.log(`📄 Firma (hexadecimal):\n${signatureHex}\n`);

// Paso 3: Verifica la firma válida
const verifier = crypto.createVerify('SHA256');
verifier.update(message);
const isValid = verifier.verify(publicKey, Buffer.from(signatureHex, 'hex'));
console.log(`✓ Firma válida verificada: ${isValid}\n`);

// Paso 4: Corrompe un byte y verifica que falla
const corruptedSig = signatureHex.substring(0, 2) + 
  (parseInt(signatureHex.substring(2, 4), 16) ^ 0xFF).toString(16).padStart(2, '0') + 
  signatureHex.substring(4);

const verifier2 = crypto.createVerify('SHA256');
verifier2.update(message);
const isValidCorrupted = verifier2.verify(publicKey, Buffer.from(corruptedSig, 'hex'));

console.log(`🔴 Firma corrupta verificada: ${isValidCorrupted}`);
console.log('❌ Firma inválida\n');

// Paso 5: Genera un wallet WDK
const wdkWallet = Wallet.generate();
console.log(`✓ Wallet WDK generado`);
console.log(`📍 Dirección Ethereum: ${wdkWallet.address}\n`);
console.log(`🔐 Clave privada (GUARDAR PARA SCRIPT 2):`);
console.log(`${wdkWallet.privateKey}\n`);

console.log('=== Script 1 Completado ===');
```

### Qué guardar del Script 1

- [ ] La **firma válida** (cadena hexadecimal completa)
- [ ] Confirmación de que **la firma corrupta falla**
- [ ] La **dirección del wallet WDK**
- [ ] La **clave privada del wallet** (la necesitarás en Script 2)

---

## Script 2: Firmas ERC-712 con Datos Tipificados (Viem)

**Archivo:** `sign-erc712.js`

Este script demuestra cómo firmar datos estructurados (tipificados) siguiendo el estándar ERC-712 usando **Viem**. Esto es lo que MetaMask hace cuando aparece una ventana de "Sign Message" en una aplicación.

```javascript
/**
 * sign-erc712.js
 * Demuestra firmado de datos tipificados ERC-712 con Viem
 * 
 * Viem es una biblioteca moderna, type-safe para Ethereum.
 * Superior a ethers.js por su claridad y rendimiento.
 */

const { privateKeyToAccount } = require('viem/accounts');
const { hashTypedData } = require('viem');

console.log('=== Script 2: ERC-712 Datos Tipificados con Viem ===\n');

// Paso 1: Recupera el wallet usando tu clave privada del Script 1
// IMPORTANTE: Reemplaza esto con tu clave privada del Script 1
const PRIVATE_KEY = '0x...'; // REEMPLAZA CON TU CLAVE PRIVADA

// Crear cuenta desde clave privada
const account = privateKeyToAccount(PRIVATE_KEY);

console.log(`✓ Wallet Viem recuperado`);
console.log(`📍 Dirección: ${account.address}\n`);

// Paso 2: Define el dominio EIP-712
// El dominio identifica únicamente esta aplicación, cadena y versión
const domain = {
  name: 'UFM Course',
  version: '1',
  chainId: 31337, // anvil usa chainId 31337
  // verifyingContract se agregará después cuando despleguemos el contrato
};

console.log('📋 Dominio EIP-712:');
console.log(`   Nombre: ${domain.name}`);
console.log(`   Versión: ${domain.version}`);
console.log(`   Chain ID: ${domain.chainId}\n`);

// Paso 3: Define la estructura de datos tipificados
// Esto define exactamente qué campos estamos firmando
const types = {
  Enrollment: [
    { name: 'student', type: 'address' },
    { name: 'course', type: 'string' }
  ]
};

console.log('📝 Tipo Enrollment:');
console.log(`   - student (address)`);
console.log(`   - course (string)\n`);

// Paso 4: Crea el mensaje de inscripción
const message = {
  student: account.address,
  course: 'SE-4XX'
};

console.log('✉️  Mensaje de Inscripción:');
console.log(`   student: ${message.student}`);
console.log(`   course: ${message.course}\n`);

// Paso 5: Calcula el hash EIP-712 usando Viem
// Este es el hash que será firmado
const eip712Hash = hashTypedData({
  account,
  domain,
  types,
  primaryType: 'Enrollment',
  message
});

console.log('🔐 Hash EIP-712 (para firmado):');
console.log(`${eip712Hash}\n`);

// Paso 6: Firma los datos tipificados usando Viem
// account.signTypedData es el método de Viem para firmar ERC-712
const signature = await account.signTypedData({
  domain,
  types,
  primaryType: 'Enrollment',
  message
});

console.log('✍️  Firma ERC-712:');
console.log(`${signature}\n`);

// Paso 7: Decodifica la firma en componentes r, s, v
// Esto es necesario para ecrecover en Solidity
const sig = signature.slice(2); // Remove '0x'
const r = '0x' + sig.slice(0, 64);
const s = '0x' + sig.slice(64, 128);
const v = parseInt(sig.slice(128, 130), 16);

console.log('🔧 Componentes de la firma (para ecrecover):');
console.log(`   r: ${r}`);
console.log(`   s: ${s}`);
console.log(`   v: ${v}\n`);

console.log('📌 SALIDA IMPORTANTE:');
console.log(`   - Dirección del estudiante: ${account.address}`);
console.log(`   - Hash EIP-712: ${eip712Hash}`);
console.log(`   - Firma completa: ${signature}`);
console.log(`   - Componente r: ${r}`);
console.log(`   - Componente s: ${s}`);
console.log(`   - Componente v: ${v}\n`);

console.log('=== Script 2 Completado ===');
```

### Qué guardar del Script 2

- [ ] La **dirección del estudiante** (wallet address)
- [ ] El **hash EIP-712**
- [ ] La **firma completa** (comienza con `0x`)
- [ ] Los **componentes r, s, v** (necesarios para ecrecover)

---

## 📚 Tareas para entregar

### Ejecuta ambos scripts

1. Reemplaza `0x...` en `sign-erc712.js` con tu clave privada del Script 1
2. Ejecuta:
   ```bash
   node sign-raw.js
   node sign-erc712.js
   ```
3. Guarda toda la salida en un archivo `SALIDA.txt`

### Crea un documento de reflexión: `LIBERTAD_Y_FIRMAS.md`

Escribe **2-3 párrafos** (en español) respondiendo a estas preguntas:

#### Pregunta 1: ¿Cómo funcionan las firmas criptográficas?

Explica en tus propias palabras:
- ¿Cuál es la diferencia entre la clave pública y la clave privada?
- ¿Por qué una firma corrupta (Script 1) falla la verificación?
- ¿Qué información se encuentra dentro de una firma ERC-712?
- ¿Qué hace que ERC-712 sea diferente de una firma "bruta"?

#### Pregunta 2: ¿Por qué esto importa para la libertad?

Reflexiona sobre cómo las firmas criptográficas permiten:
- **Autenticación sin autoridad central** — No necesitas que un banco, gobierno o empresa verifique tu identidad. Tu firma criptográfica es tu prueba.
- **No repudiación** — Quien firma con su clave privada no puede negar después que firmó. La firma es prueba matemática, no opinión.
- **Censura-resistencia** — Una firma es válida o no. No hay "juez" central que pueda invalidarla arbitrariamente.

¿Cómo se conecta esto con lo que aprendiste en clase sobre la filosofía de UFM (confianza minimizada, poder individual)?

#### Pregunta 3: Viem vs. ethers.js

En este lab usamos **Viem** en lugar de ethers.js. Investiga brevemente (1-2 minutos en Google):

- ¿Qué ventajas tiene Viem sobre ethers.js?
- ¿Por qué Viem es más "moderno"?
- ¿Cómo se conecta Viem con Wagmi que vimos en clase?

Escribe 2-3 oraciones explicando por qué un desarrollador moderno podría elegir Viem.

#### Pregunta 4: Comparación de seguridad

En el Script 1, cuando corrompimos un byte de la firma, la verificación falló inmediatamente.

- ¿Qué pasaría si alguien quisiera falsificar tu firma ERC-712 en una aplicación blockchain?
- ¿Por qué el componente `v` (del Script 2) es importante?
- ¿Cómo el dominio EIP-712 (nombre, versión, chainId) previene que tu firma sea reutilizada en una cadena diferente o una aplicación diferente?

---

## Checklist de Entregables

- [ ] **SALIDA.txt** — Salida completa de ambos scripts
- [ ] **LIBERTAD_Y_FIRMAS.md** — Reflexión de 2-3 párrafos respondiendo las cuatro preguntas
- [ ] **sign-raw.js** — Script que demuestra firmas brutas
- [ ] **sign-erc712.js** — Script que demuestra ERC-712 (con tu clave privada reemplazada)

---

## Recursos

- **Viem Docs:** https://viem.sh/
- **Viem ERC-712:** https://viem.sh/docs/actions/wallet/signTypedData
- **EIP-712 Especificación:** https://eips.ethereum.org/EIPS/eip-712
- **Node.js módulo crypto:** https://nodejs.org/api/crypto.html
- **Solidity ecrecover:** https://docs.soliditylang.org/en/latest/units-and-global-variables.html#mathematical-and-cryptographic-functions

---

## ¿Por qué Viem es mejor que ethers.js?

| Aspecto | ethers.js | Viem |
|---------|-----------|------|
| **Type Safety** | Parcial | Completo (TypeScript nativo) |
| **Bundle Size** | ~280KB | ~100KB |
| **API Clarity** | Histórica (muchas convenciones) | Moderna (explícita) |
| **Performance** | Buena | Excelente |
| **Diseño** | Monolítico | Modular |
| **Mantenimiento** | Activo | Muy activo (Wagmi team) |

Viem es la dirección hacia donde se mueve el ecosistema Ethereum en 2025–2026. Aprender Viem ahora te posiciona como un desarrollador moderno.

---

## Resumen

En este lab aprendiste:

1. **Las firmas criptográficas son determinísticas** — el mismo mensaje siempre produce la misma firma si usas la misma clave privada.

2. **Una firma inválida es inmediatamente detectable** — no hay ambigüedad. O es válida, o no lo es.

3. **ERC-712 añade contexto (dominio)** — para que una firma para una aplicación no pueda ser reutilizada en otra aplicación o cadena blockchain.

4. **Viem es la herramienta moderna** — type-safe, minimalista, y la base de Wagmi.

5. **Todo esto sin intermediarios** — no necesitas un servidor, banco, o empresa verificando tu identidad. Las matemáticas verifican por ti.

Esto es el fundamento de por qué la criptografía es libertad: reemplaza la confianza en autoridades por confianza en matemáticas.
