# Referencia rápida del Lab 21

Material de estudio. Son **definiciones generales**, no hechos de ningún caso: lo que sea de un caso concreto (UE, Zcash, World ID o un zk-rollup) sale de §4 y §9 del session doc, y si no está, se escribe "no verificado".

## Tabla de ½ⁿ (cuevas con moneda)

Un tramposo que no sabe la palabra pasa cada ronda solo si lo que escribió coincide con lo que pidió la moneda: probabilidad ½ por ronda.

| Rondas (n) | Pasar las n rondas (½ⁿ) | En % | Caer antes o en la ronda n |
|---|---|---|---|
| 1 | 1/2 | 50 % | 50 % |
| 2 | 1/4 | 25 % | 75 % |
| 3 | 1/8 | 12.5 % | 87.5 % |
| 4 | 1/16 | 6.25 % | 93.75 % |
| 5 | 1/32 | 3.125 % | 96.875 % |
| 6 | 1/64 | 1.5625 % | 98.4375 % |
| 7 | 1/128 | 0.78125 % | 99.21875 % |
| 8 | 1/256 | 0.390625 % | 99.609375 % |
| 9 | 1/512 | 0.1953125 % | 99.8046875 % |
| 10 | 1/1024 | 0.09765625 % | 99.90234375 % |

Por eso "los que NO saben caen casi siempre antes de la ronda 5": la probabilidad de caer en las primeras 4 rondas es 93.75 %. Quien sí sabe la palabra sale bien siempre.

## Cómo entender la cueva (para la reflexión a)

- Cada ronda, el verificador elige el camino **al azar y después** de que el probador ya entró. Un tramposo solo acierta si adivinó el lado.
- Una ronda sola no prueba nada (un tramposo la pasa la mitad de las veces). Diez rondas seguidas sí convencen: la probabilidad de que un tramposo las pase todas es 1/1024.
- El verificador **no oye la palabra**: solo ve que el probador sale por donde le piden. Se convence por la **probabilidad**, no por el dato.
- Una foto de las anotaciones no convence a otro trío: otra persona no vio que la moneda se lanzara *después* de que el probador escribiera, así que las anotaciones podrían estar armadas de antemano.

## Vocabulario general

| Término | Qué es |
|---|---|
| Prueba de conocimiento cero (ZKP) | Probar que algo es cierto sin revelar el dato secreto que lo hace cierto |
| Probador / Verificador | Quien demuestra la afirmación / quien la comprueba |
| Interactiva | Hay ida y vuelta de retos entre el verificador y el probador (como la cueva con la moneda) |
| No interactiva | El probador genera una sola prueba que cualquiera puede comprobar después, sin retos en vivo |
| SNARK | Prueba corta y rápida de verificar. Muchas versiones necesitan una configuración confiable |
| STARK | Prueba que no necesita configuración confiable ("transparente"), normalmente más grande que un SNARK |
| Configuración confiable (trusted setup) | Ceremonia que genera unos parámetros públicos una sola vez; si quien los generó guarda el secreto con el que se crearon, podría fabricar pruebas falsas |
| Circuito | La regla matemática que se prueba (por ejemplo, "mayor de 18"). Si el circuito está mal escrito, la prueba puede ser válida y aun así probar algo falso |
| Emisor | Quien afirma el dato original (por ejemplo, quien firma que alguien cumple años). La prueba solo es tan buena como su emisor |

## Dónde se rompe una ZKP (para la reflexión b)

Una prueba válida solo garantiza que *se cumple la regla del circuito con los datos que se le dieron*. Puede probar algo falso si: el **dato de entrada era falso** (el emisor se equivocó o mintió), el **circuito está mal** (la regla no dice lo que se cree), la **configuración confiable** se comprometió, o el **operador** que controla el sistema actúa mal.
