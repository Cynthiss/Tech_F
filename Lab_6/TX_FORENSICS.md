# Lab 06 --- Forense Taproot vs Ethereum

## Objetivo

Comparar con datos reales cómo se representa un patrón tipo HTLC en
Ethereum/EVM y en Bitcoin/Taproot. Primero se documentan los datos
observados directamente en cadena y luego se realiza la comparación.

## Cumplimiento del entregable

  -----------------------------------------------------------------------
  Requisito                           Evidencia
  ----------------------------------- -----------------------------------
  1 TX ETH del patrón HTLC            Sí --- `lock` de EtherSwap

  Selector ETH                        Sí --- `0x0899146b`

  Parámetros ETH                      Sí --- hash, amount, refund y
                                      timelock

  Calldata crudo y tamaño             Sí --- `100 bytes` en `lock`;
                                      `132 bytes` en `claim`

  Todas las funciones del contrato    Sí --- 5 funciones del ABI

  1 TX BTC Taproot                    Sí --- gasto de un UTXO `V1_P2TR`

  Tipo de gasto BTC                   Sí --- `key-path`

  Witness crudo                       Sí --- 1 elemento

  Script de hoja                      No aplica: el gasto fue key-path y
                                      no reveló tapscript

  vbytes                              Sí --- `111 vB`

  Otras condiciones del árbol         No determinables desde este
                                      key-path spend

  Segunda verificación ETH            Sí --- segundo par lock/claim

  Segunda verificación BTC            Sí --- TX que crea el UTXO P2TR
                                      consumido por la TX principal

  Comparación                         Sí --- visibilidad antes/después,
                                      costo de condición y superficie de
                                      auditoría

  Criterio explícito                  Sí --- privacidad, costo, auditoría
                                      y flexibilidad
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 1. Ethereum --- EtherSwap

## 1.1 Contrato analizado

-   **Contrato:** EtherSwap
-   **Dirección:** `0x9f6FEa1C76FC1961eED97c00124eF7D7a7b3d9Ea`
-   **Red:** Ethereum Mainnet
-   **Código fuente:** verificado en Etherscan
-   **Solidity observado:** `0.7.1`

## 1.2 Transacción principal --- Lock

-   **TX hash completo:**
    `0x3061cd37ce12acbaa816a6ce1e8779ecbf26e27c5980d5d3b9acf40d517c3748`
-   **Bloque:** `12063470`
-   **Estado:** `Success`
-   **Función:**
    `lock(bytes32 preimageHash,address claimAddress,uint256 timelock)`
-   **Selector / MethodID:** `0x0899146b`
-   **Valor:** `0.02213081 ETH`
-   **Valor:** `22130810000000000 wei`
-   **Calldata:** `100 bytes`

### Calldata crudo completo

``` text
0x0899146b712071d518bf6c5407f5e606c32cfe654541c72a3879dbc5edf293e8934aad5400000000000000000000000089adc1d19ccf3e5e74550cdb831594013cfdd83c00000000000000000000000000000000000000000000000000000000000b815b7
```

### División ABI

``` text
0899146b
712071d518bf6c5407f5e606c32cfe654541c72a3879dbc5edf293e8934aad54
00000000000000000000000089adc1d19ccf3e5e74550cdb831594013cfdd83c
00000000000000000000000000000000000000000000000000000000000b815b7
```

  ----------------------------------------------------------------------------------------------------------
  Campo                               Dato
  ----------------------------------- ----------------------------------------------------------------------
  Selector                            `0x0899146b`

  preimageHash                        `0x712071d518bf6c5407f5e606c32cfe654541c72a3879dbc5edf293e8934aad54`

  claimAddress                        `0x89adc1d19ccf3e5e74550cdb831594013cfdd83c`

  timelock                            `12064183`

  amount                              `22130810000000000 wei`

  refundAddress                       `0xB34817A34a965E426BBcbBFFaD085Aa7B6a09426`
  ----------------------------------------------------------------------------------------------------------

El `amount` no es un parámetro del calldata porque `lock()` es
`payable`; proviene de `msg.value`. El `refundAddress` tampoco es
argumento de `lock()`: el código utiliza `msg.sender`.

### Tamaño

``` text
4 bytes   selector
32 bytes  preimageHash
32 bytes  claimAddress
32 bytes  timelock
----------------------
100 bytes total
```

## 1.3 Claim correspondiente

-   **Bloque:** `12063476`
-   **Selector:** `0xc3c37fbc`
-   **preimage:**
    `0xbd512a8b7207d4d04ee7ddc7224961cfeb55f06641b2446fa8a86a3b115ee78b`
-   **amount:** `22130810000000000 wei`
-   **refundAddress:** `0xB34817A34a965E426BBcbBFFaD085Aa7B6a09426`
-   **timelock:** `12064183`
-   **Calldata:** `132 bytes`

### Tamaño del calldata de claim

``` text
4 bytes   selector
32 bytes  preimage
32 bytes  amount
32 bytes  refundAddress
32 bytes  timelock
----------------------
132 bytes total
```

### Verificación criptográfica

``` text
preimage:
bd512a8b7207d4d04ee7ddc7224961cfeb55f06641b2446fa8a86a3b115ee78b

SHA256(preimage):
712071d518bf6c5407f5e606c32cfe654541c72a3879dbc5edf293e8934aad54

preimageHash del lock:
712071d518bf6c5407f5e606c32cfe654541c72a3879dbc5edf293e8934aad54
```

**Resultado:** coincide.

También coinciden `amount`, `refundAddress` y `timelock`.

------------------------------------------------------------------------

# 2. Todas las funciones de EtherSwap

Según el ABI verificado, el contrato expone exactamente estas cinco
funciones:

1.  `claim(bytes32 preimage,uint256 amount,address refundAddress,uint256 timelock)`
2.  `lock(bytes32 preimageHash,address claimAddress,uint256 timelock)`
3.  `refund(bytes32 preimageHash,uint256 amount,address claimAddress,uint256 timelock)`
4.  `swaps(bytes32)`
5.  `version()`

Eventos del ABI, registrados por separado:

-   `Claim`
-   `Lockup`
-   `Refund`

## Lógica observada

### lock

``` solidity
function lock(bytes32 preimageHash, address claimAddress, uint timelock) external payable {
    require(msg.value > 0, "EtherSwap: amount must not be zero");

    bytes32 hash = hashValues(
        preimageHash,
        msg.value,
        claimAddress,
        msg.sender,
        timelock
    );

    require(swaps[hash] == false, "EtherSwap: swap exists already");
    swaps[hash] = true;

    emit Lockup(preimageHash, msg.value, claimAddress, msg.sender, timelock);
}
```

### claim

``` solidity
function claim(
    bytes32 preimage,
    uint amount,
    address refundAddress,
    uint timelock
) external {
    bytes32 preimageHash = sha256(abi.encodePacked(preimage));
    bytes32 hash = hashValues(
        preimageHash,
        amount,
        msg.sender,
        refundAddress,
        timelock
    );

    checkSwapExists(hash);
    delete swaps[hash];

    emit Claim(preimageHash, preimage);

    transferEtherToSender(amount);
}
```

### refund

``` solidity
function refund(
    bytes32 preimageHash,
    uint amount,
    address claimAddress,
    uint timelock
) external {
    require(timelock <= block.number, "EtherSwap: swap has not timed out yet");

    bytes32 hash = hashValues(
        preimageHash,
        amount,
        claimAddress,
        msg.sender,
        timelock
    );

    checkSwapExists(hash);
    delete swaps[hash];

    emit Refund(preimageHash);

    transferEtherToSender(amount);
}
```

------------------------------------------------------------------------

# 3. Segunda verificación Ethereum

Se utilizó un segundo par histórico `lock` / `claim`.

> **Nota de integridad:** durante la inspección se conservaron completos
> los datos decodificados, pero Etherscan se capturó con los TX hashes
> abreviados en la lista. No se inventan los caracteres faltantes. Se
> reportan los prefijos observados y los bloques, que permiten volver a
> localizar las transacciones.

## Lock de chequeo

-   **TX mostrado por Etherscan:** `0x7c1eb3a628...`
-   **Bloque:** `12045020`
-   **Valor:** `0.99951404 ETH`
-   **Valor:** `999514040000000000 wei`
-   **preimageHash:**
    `0x7464c458482fa76ed849b14a14449f20277a584a00df2203b4f4b779290bab2d`
-   **claimAddress:** `0x89aDC1d19ccF3e5E74550CDB831594013CFDD83c`
-   **refundAddress:** `0x32BB8b6898831D051996A610347c1eD99C68607A`
-   **timelock:** `12045732`

## Claim de chequeo

-   **TX mostrado por Etherscan:** `0x3db884ec1c...`
-   **Bloque:** `12045227`
-   **preimage:**
    `0x632d7dd65c0a9e0b7c6799c264e88920d3e36014a3e8f2e53200ba23e4ebb088`
-   **amount:** `999514040000000000 wei`
-   **refundAddress:** `0x32BB8b6898831D051996A610347c1eD99C68607A`
-   **timelock:** `12045732`

### Comprobación

``` text
SHA256(
632d7dd65c0a9e0b7c6799c264e88920d3e36014a3e8f2e53200ba23e4ebb088
)

=

7464c458482fa76ed849b14a14449f20277a584a00df2203b4f4b779290bab2d
```

Coincide con el `preimageHash` del lock. También coinciden `amount`,
`refundAddress` y `timelock`.

------------------------------------------------------------------------

# 4. Bitcoin --- Taproot

## 4.1 Criterio de evidencia

La atribución histórica del rastro a Boltz proviene de evidencia
secundaria. Esa atribución se mantiene separada de los datos
verificables directamente en Bitcoin.

Los siguientes datos sí fueron comprobados directamente en
mempool.space:

-   TXIDs;
-   relación entre output e input;
-   `V1_P2TR`;
-   witness;
-   tamaño;
-   vbytes;
-   peso;
-   fee;
-   clasificación key-path.

## 4.2 TX de verificación que crea el output P2TR

-   **TXID completo:**
    `fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7`
-   **Fecha:** `2024-07-13 09:27:18`
-   **Características:** SegWit, Taproot, RBF
-   **Fee:** `1725 sats`
-   **Fee rate:** `13.0 sat/vB`
-   **Tamaño:** `248 B`
-   **Tamaño virtual:** `132.5 vB`
-   **Peso:** `530 WU`
-   **Versión:** `2`

Salida seguida:

-   **Tipo:** `V1_P2TR`
-   **Dirección mostrada:** `bc1pdgsv3w62mpsm67979c5vm...rs7sxyxn`
-   **Valor:** `0.00188260 BTC`

La entrada de esta TX provenía de una dirección `bc1q...`; mempool.space
mostró la etiqueta `Lightning Force Close`. Esta TX se utiliza como
chequeo porque crea el UTXO P2TR que posteriormente consume la TX
principal.

------------------------------------------------------------------------

# 5. Bitcoin --- TX principal de gasto Taproot

-   **TXID completo:**
    `1979ed127443fd2259a05ab240d1c60b5d66cc0303fea122443ebe332209b80f`
-   **Fecha:** `2024-07-13 13:08:44`
-   **Características:** SegWit, Taproot, RBF
-   **Fee:** `666 sats`
-   **Fee rate:** `6.00 sat/vB`
-   **Tamaño:** `162 B`
-   **Tamaño virtual:** `111 vB`
-   **Peso:** `444 WU`
-   **Versión:** `2`
-   **nLockTime:** `0`
-   **Sigops:** `0`

## 5.1 Output anterior consumido

La entrada consume el output de `0.00188260 BTC` creado por:

``` text
fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7
```

mempool.space identifica el output anterior como:

``` text
V1_P2TR
```

## 5.2 Witness crudo

``` text
fff222b9f26d0d40b526f8992f06cf7a0bef1499e0be622d14ca10c94d39d0f8b0754ad40de40622acb5f3e5d464e8d836cdb71c96fc4eaa8ba6ab9b5db328c7
```

Datos:

-   **Elementos del witness:** `1`
-   **Clasificación:** `key-path spend`
-   **Tapscript revelado:** `N/A — ninguno`
-   **Control block:** `N/A — ninguno`

La clasificación se basa en el UTXO `V1_P2TR` y en el witness de un solo
elemento correspondiente al gasto por clave.

## 5.3 Condiciones alternativas del árbol

**Dato observable:** el gasto no revela tapscript ni control block.

**Conclusión limitada a los datos on-chain:** no se puede determinar
cuántas hojas o condiciones alternativas existían en el árbol a partir
de este key-path spend.

No se revelan:

``` text
claim script       NO
refund script      NO
preimage de hoja   NO
timelock de hoja   NO
control block      NO
número de hojas    NO
```

Por tanto, el requisito "script de la hoja si es script-path" queda
como:

``` text
No aplica: la TX analizada es key-path.
```

------------------------------------------------------------------------

# 6. Segunda verificación Bitcoin

La segunda TX es:

``` text
fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7
```

Esta crea el UTXO:

``` text
Tipo:   V1_P2TR
Valor:  0.00188260 BTC
```

La TX:

``` text
1979ed127443fd2259a05ab240d1c60b5d66cc0303fea122443ebe332209b80f
```

consume posteriormente ese output.

``` text
fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7
                              |
                              | crea
                              v
                   V1_P2TR — 0.00188260 BTC
                              |
                              | gastado por
                              v
1979ed127443fd2259a05ab240d1c60b5d66cc0303fea122443ebe332209b80f
                              |
                              v
                    witness = 1 elemento
                              |
                              v
                         KEY-PATH
```

Esto proporciona una segunda comprobación on-chain de la procedencia del
UTXO Taproot analizado.

------------------------------------------------------------------------

# 7. Comparación de las cuatro dimensiones

## 7.1 Visible antes

### Ethereum / EVM

Antes del claim se puede inspeccionar el contrato completo EtherSwap. Su
ABI expone las cinco funciones y el código verificado permite conocer
las rutas `lock`, `claim` y `refund`.

En el lock observado son públicos:

-   `preimageHash`;
-   `claimAddress`;
-   `timelock`;
-   `msg.value`;
-   emisor, que funciona como `refundAddress`.

### Bitcoin / Taproot

Antes del gasto se observa el output `V1_P2TR`.

El output no revela por sí mismo las hojas alternativas comprometidas
detrás de Taproot. En este caso no fue posible determinar desde la
cadena cuántas condiciones existían.

## 7.2 Visible después

### Ethereum / EVM

El claim revela en calldata:

-   `preimage`;
-   `amount`;
-   `refundAddress`;
-   `timelock`.

El SHA-256 del preimage coincide con el `preimageHash` del lock.

El código completo del contrato continúa siendo público.

### Bitcoin / Taproot

El gasto observado es key-path.

Después del gasto se observa un witness de un elemento, pero:

-   no aparece tapscript;
-   no aparece control block;
-   no aparecen las rutas alternativas.

## 7.3 Costo de agregar una condición

### Ethereum / EVM

Agregar comportamiento normalmente requiere ampliar o modificar la
lógica del contrato. Dependiendo de la implementación, puede aumentar
bytecode, costo de deployment y/o gas de ejecución.

### Bitcoin / Taproot

Una condición adicional puede comprometerse como una hoja adicional del
árbol. Cuando se utiliza otra ruta, no necesariamente debe publicarse
esa condición.

En el key-path observado no se publicó ninguna hoja alternativa.

El costo exacto de una condición adicional depende del script y de la
estructura del árbol, por lo que no se inventa un valor numérico.

## 7.4 Superficie de auditoría

### Ethereum / EVM

La superficie pública es amplia. Un auditor puede revisar:

-   bytecode/código verificado;
-   ABI;
-   funciones;
-   estado;
-   calldata.

Esto facilita conocer todas las rutas programadas.

### Bitcoin / Taproot

En el key-path observado la superficie pública es menor. El auditor
puede comprobar el gasto P2TR, pero no reconstruir las rutas
alternativas no reveladas únicamente a partir de la blockchain.

------------------------------------------------------------------------

# 8. Resumen de datos reales

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Dato                    Ethereum / EtherSwap                                                   Bitcoin / Taproot
  ----------------------- ---------------------------------------------------------------------- --------------------------------------------------------------------
  TX principal            `0x3061cd37ce12acbaa816a6ce1e8779ecbf26e27c5980d5d3b9acf40d517c3748`   `1979ed127443fd2259a05ab240d1c60b5d66cc0303fea122443ebe332209b80f`

  Patrón                  Lock + Claim                                                           Gasto `V1_P2TR`

  Autorización observada  preimage / SHA-256                                                     witness de 1 elemento

  Tamaño                  Lock calldata `100 B`; Claim `132 B`                                   `111 vB`

  Ruta alternativa        `refund()` es pública                                                  No revelada
  visible                                                                                        

  Condiciones no usadas   Visibles en el contrato                                                No reveladas por el key-path

  Preimage                Revelado en claim                                                      No revelado

  Timelock                Visible                                                                No se reveló una hoja con timelock

  Script de hoja          N/A                                                                    N/A --- key-path

  Control block           N/A                                                                    N/A --- key-path

  TX BTC que crea UTXO    N/A                                                                    `fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7`
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 9. Conclusión --- ¿Taproot o EVM es "mejor"?

"Mejor" depende del criterio.

## Privacidad

**Taproot es mejor para el caso analizado si el criterio es minimizar
información pública.**

La TX key-path no reveló scripts alternativos, control block ni número
de condiciones. Ethereum permitió inspeccionar el contrato completo y el
claim reveló el preimage y los demás parámetros.

## Costo / huella on-chain

**Taproot presenta una huella pequeña en el gasto cooperativo
observado.**

La TX analizada tuvo `111 vB` y no publicó scripts alternativos.

No se compara directamente `111 vB` de Bitcoin con `100 bytes` de
calldata Ethereum como si fueran la misma unidad económica. Bitcoin
cobra según peso/vbytes y Ethereum según gas.

## Auditoría

**EVM es mejor si el criterio es transparencia y facilidad de auditoría
pública.**

EtherSwap permite revisar todas las funciones y rutas del contrato antes
de utilizarlas.

Un auditor puramente on-chain de nuestro key-path Taproot no puede saber
qué ramas no utilizadas existían.

## Flexibilidad

**EVM es más flexible para lógica general.**

Los contratos pueden mantener estado y expresar lógica programable más
compleja. Taproot ofrece un modelo más limitado de condiciones de gasto,
pero permite mantener ocultas las rutas que no se utilizan.

## Criterio explícito final

-   **Privacidad:** Taproot.
-   **Menor revelación on-chain en el caso observado:** Taproot.
-   **Auditoría pública:** EVM.
-   **Flexibilidad:** EVM.

Por tanto, **Taproot es "mejor" si se prioriza privacidad y mínima
revelación; EVM es "mejor" si se priorizan auditoría, transparencia y
flexibilidad.**

------------------------------------------------------------------------

# 10. Fuentes de verificación

-   **Etherscan --- EtherSwap:**
    `0x9f6FEa1C76FC1961eED97c00124eF7D7a7b3d9Ea`
-   **Etherscan --- TX ETH principal:**
    `0x3061cd37ce12acbaa816a6ce1e8779ecbf26e27c5980d5d3b9acf40d517c3748`
-   **mempool.space --- TX que crea el UTXO P2TR:**
    `fa0e3f62dbef141c0e2ef3f095e39c2ffcee3eb95f272eee160cb5a0562c4db7`
-   **mempool.space --- TX P2TR principal:**
    `1979ed127443fd2259a05ab240d1c60b5d66cc0303fea122443ebe332209b80f`
-   **Contrato/ABI:** código verificado de EtherSwap en Etherscan.
-   **Contexto técnico:** documentación pública de Boltz sobre Taproot
    swaps.

## Nota metodológica

Los TXIDs Bitcoin, tipos P2TR, witness, tamaños, pesos, calldata
Ethereum y parámetros marcados como datos on-chain fueron inspeccionados
directamente en Etherscan o mempool.space.

La asociación histórica del rastro Bitcoin con Boltz procede de
evidencia secundaria y no de una etiqueta criptográfica dentro de la
transacción. Por eso la atribución se presenta separadamente de los
datos verificables on-chain.

En la segunda verificación Ethereum no se completan artificialmente los
TX hashes abreviados que se conservaron durante la inspección; se
reportan sus prefijos y bloques en lugar de inventar información.
