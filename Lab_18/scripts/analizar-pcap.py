#!/usr/bin/env python3
"""Clasifica los paquetes UDP/51820 de un .pcap por tipo de mensaje de WireGuard y comprueba que el payload no es legible."""
import struct, sys, collections

TIPOS = {1: "Handshake Initiation", 2: "Handshake Response", 3: "Cookie Reply", 4: "Transport Data"}

def leer(path):
    data = open(path, "rb").read()
    magic = struct.unpack("<I", data[:4])[0]
    endian = "<" if magic in (0xA1B2C3D4, 0xA1B23C4D) else ">"
    link = struct.unpack(endian + "I", data[20:24])[0]
    off = 24
    while off + 16 <= len(data):
        _, _, incl, _ = struct.unpack(endian + "IIII", data[off:off + 16])
        yield link, data[off + 16: off + 16 + incl]
        off += 16 + incl

def main(path, secreto):
    cuenta, ejemplos, total = collections.Counter(), {}, 0
    for link, pkt in leer(path):
        eth = 14 if link == 1 else 0
        if link == 113: eth = 16
        ip = pkt[eth:]
        if len(ip) < 28 or ip[0] >> 4 != 4 or ip[9] != 17:
            continue
        ihl = (ip[0] & 15) * 4
        sport, dport = struct.unpack("!HH", ip[ihl:ihl + 4])
        if 51820 not in (sport, dport):
            continue
        payload = ip[ihl + 8:]
        total += 1
        tipo = payload[0]
        cuenta[(tipo, len(payload))] += 1
        ejemplos.setdefault(tipo, payload)
    print(f"Paquetes UDP con puerto 51820: {total}\n")
    print(f"{'Tipo de mensaje':<24}{'Bytes':>8}{'Paquetes':>10}")
    for (tipo, n), c in sorted(cuenta.items()):
        print(f"{TIPOS.get(tipo, 'desconocido (%d)' % tipo):<24}{n:>8}{c:>10}")
    t4 = ejemplos.get(4)
    if t4:
        print("\nEjemplo de Transport Data (primeros 48 bytes en hexadecimal):")
        print(" ".join(f"{b:02x}" for b in t4[:48]))
    crudo = open(path, "rb").read()
    print(f"\nTexto '{secreto}' dentro de la captura de la red: {'SÍ aparece' if secreto.encode() in crudo else 'NO aparece (el payload es ilegible)'}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "LAB18SECRET")
