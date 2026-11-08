#!/usr/bin/env python3
"""Simulación por computadora de la cueva (NO es la actividad en papel del lab).
Cada ronda: el probador "escribe" A o B y el verificador lanza una moneda (A/B), ambos al azar con `secrets`.
- Probador que SÍ sabe la palabra: sale siempre por donde le piden.
- Probador que NO sabe: solo sale bien si lo que escribió coincide con la moneda.
Se detiene en el primer fallo."""
import secrets, collections, datetime

def lado(): return "AB"[secrets.randbelow(2)]

def probador(sabe, rondas=10):
    marcas = []
    for _ in range(rondas):
        escribio, moneda = lado(), lado()
        ok = True if sabe else (escribio == moneda)
        marcas.append("✓" if ok else "✗")
        if not ok: break
    return marcas

if __name__ == "__main__":
    out = []
    out.append(f"Simulación por computadora de la cueva, generada el {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}.")
    out.append("NO es la actividad en papel con moneda: números aleatorios de `secrets`.\n")
    out.append("| Probador | ¿SÍ o NO sabe? | " + " | ".join(f"R{i}" for i in range(1, 11)) + " | Cayó en la ronda | Rondas pasadas | ½ⁿ |")
    out.append("|---|---|" + "---|" * 10 + "---|---|---|")
    filas = [("A", True), ("B", False), ("C", False), ("D", True), ("E", False), ("F", False), ("G", False), ("H", False)]
    for nombre, sabe in filas:
        m = probador(sabe)
        cayo = (m.index("✗") + 1) if "✗" in m else "—"
        pasadas = (m.index("✗")) if "✗" in m else 10
        celdas = m + [""] * (10 - len(m))
        out.append(f"| {nombre} | {'SÍ' if sabe else 'NO'} | " + " | ".join(celdas) + f" | {cayo} | {pasadas} | 1/{2**pasadas} |")
    # estadística grande para comprobar la teoría
    N = 100_000
    caidas = collections.Counter()
    for _ in range(N):
        m = probador(False)
        caidas[(m.index("✗") + 1) if "✗" in m else 11] += 1
    out.append(f"\nComprobación con {N:,} tramposos simulados (ronda en que cayeron):\n")
    out.append("| Ronda | Cayeron | % simulado | % teórico (1/2^r) |")
    out.append("|---|---|---|---|")
    for r in range(1, 11):
        out.append(f"| {r} | {caidas[r]:,} | {caidas[r]/N*100:.2f} % | {100/2**r:.2f} % |")
    out.append(f"| Pasaron las 10 | {caidas[11]:,} | {caidas[11]/N*100:.3f} % | {100/2**10:.3f} % |")
    antes5 = sum(caidas[r] for r in range(1, 5))
    out.append(f"\nCayeron en las primeras 4 rondas: {antes5/N*100:.2f} % (teórico: 93.75 %).")
    print("\n".join(out))
