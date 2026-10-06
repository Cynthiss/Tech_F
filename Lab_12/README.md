# Lab 12 — Vesting de clase (Sesión 14)

CS031 · Technology & Freedom · UFM

Un solo deploy de clase: un ERC-20 fixed-supply de **7_000** tokens y un contrato
`ClassVesting` multi-beneficiary donde **cada una de las 7 wallets** tiene una
allocation de **1_000** tokens (100 al cliff + 900 lineales en 1 día). Cada
wallet solo puede `claim()` su propio monto — nunca el de otra persona.

> ⚠️ **Los timestamps del lab ya vencieron.** El cliff (mié 23 sep 2026, 12:00
> GT → `1790186400`) y el fin del vesting (jue 24 sep 2026, 12:00 GT →
> `1790272800`) ya pasaron. Si el deploy real se hace después de esa fecha,
> ambos quedan desbloqueados de inmediato (`releasable()` = 1_000 tokens desde
> el primer bloque). Confirmen con el instructor/Semi si hay timestamps nuevos
> antes de desplegar en una red real — el código de abajo usa los valores
> originales del handbook porque el lab dice explícitamente "no inventar
> otros".

## Contratos

- [`src/ClassToken.sol`](src/ClassToken.sol) — ERC-20 (`CS031`), `totalSupply = 7_000 * 1e18`, minteado completo al deployer.
- [`src/ClassVesting.sol`](src/ClassVesting.sol) — registra el roster de 7 beneficiaries (inmutable, fijado en el constructor). `vestedAmount(addr)` = 0 antes del cliff, `100 + 900 * (t - cliff) / (end - cliff)` durante el día post-cliff, `1_000` desde `end`. `claim()` no recibe parámetros: siempre paga a `msg.sender`.

## Setup

```bash
forge install   # ya corrido — deja este paso si lib/ ya existe
forge build
forge test -vv
```

Los 13 tests en [`test/ClassVesting.t.sol`](test/ClassVesting.t.sol) cubren la
rúbrica del lab, incluyendo los 5 casos sugeridos por el instructor:

| Test | Qué verifica |
|---|---|
| `test_NothingBeforeCliff` | `releasable == 0` y `claim()` revierte antes del cliff |
| `test_CliffUnlocks100` | se desbloquean exactamente 100 tokens en el cliff |
| `test_LinearDuringDay` | el vesting lineal post-cliff acumula correctamente (probado a mitad y a 3/4 del día) |
| `test_FullAtEnd` | balance final = 1_000 al llegar (o pasar) `endTimestamp`, y un segundo claim no revierte con monto 0 |
| `test_CannotClaimOthers` | el claim de Bob no toca el balance de Alice; una wallet no registrada revierte con `NotBeneficiary` |

Más tests de invariantes: supply total, funding del vesting, allocation por
wallet, direcciones duplicadas/cero en el roster, timestamps inválidos, y un
fuzz test de que `vestedAmount` nunca excede la allocation.

## Deploy de clase (una sola vez)

1. Recolectar las 7 wallet addresses reales y pegarlas en
   [`script/Beneficiaries.s.sol`](script/Beneficiaries.s.sol) (reemplazar los
   7 placeholders `address(uint160(0x01..0x07))`).
2. Confirmar con el instructor si los timestamps siguen siendo
   `1790186400` / `1790272800` o si hay que actualizar
   [`script/DeployClassVesting.s.sol`](script/DeployClassVesting.s.sol) con
   nuevos valores absolutos GT.
3. Desplegar (ejemplo con anvil local; para testnet cambiar `--rpc-url`):

```bash
anvil # en otra terminal

forge script script/DeployClassVesting.s.sol:DeployClassVesting \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast --private-key $PRIVATE_KEY
```

El script despliega `ClassToken`, despliega `ClassVesting` con el roster y
los timestamps, y transfiere los 7_000 tokens al vesting en la misma
transacción de broadcast. Anota las dos direcciones que imprime (`ClassToken`
y `ClassVesting`) — son las que necesita todo el mundo para el homework.

4. Verificar on-chain (o con los tests) antes de avisar a la clase:

```bash
cast call $TOKEN "totalSupply()(uint256)" --rpc-url $RPC_URL      # 7000000000000000000000
cast call $VESTING "isBeneficiary(address)(bool)" $ALGUNA_WALLET --rpc-url $RPC_URL
cast call $VESTING "releasable(address)(uint256)" $ALGUNA_WALLET --rpc-url $RPC_URL
```

## Homework individual (claim)

Cada estudiante, desde su propia wallet, después del cliff:

```bash
VESTING=0x... BENEFICIARY=0xTuWallet forge script script/Claim.s.sol:Claim \
  --rpc-url $RPC_URL --broadcast --private-key $TU_PRIVATE_KEY
```

O directamente con `cast`:

```bash
cast send $VESTING "claim()" --rpc-url $RPC_URL --private-key $TU_PRIVATE_KEY
cast call $TOKEN "balanceOf(address)(uint256)" $TU_WALLET --rpc-url $RPC_URL
```

`claim()` no acepta ninguna dirección como argumento — siempre paga al
`msg.sender` de la transacción, así que es físicamente imposible reclamar el
vesting de otra persona.

Evidencia a guardar para el carnet: tx hash(es) del/los claim(s) y balance
final (1_000, o el parcial si el claim fue antes del final).

## Entregable en el carnet

```markdown
## LAB # 12

[View lab result](https://link-explorer-o-readme-clase)

### Comentarios de Aprendizaje
<qué aprendieron — cliff vs linear, claim-only-own, supply 7k>
```

Incluir: address del token, address del vesting, su wallet, tx(s) de claim, balance final claimed.
