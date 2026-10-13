#!/usr/bin/env bash
# Experimento local "matar al seeder" (todos los procesos en esta máquina).
# Escenario 1: un solo seeder; se mata a mitad de la descarga.
# Escenario 2: hay un segundo seeder (un peer que ya descargó todo y sigue sirviendo); se mata el primero a mitad de otra descarga.
set -u
cd "$(dirname "$0")/.."
SAMPLE=sample/lab16-sample.txt
rm -rf .storage-exp downloads-exp logs/exp1-* logs/exp2-*
mkdir -p logs downloads-exp

wait_for() { # archivo patrón segundos
  local f=$1 p=$2 t=$3 i=0
  while [ $i -lt $((t*2)) ]; do grep -q "$p" "$f" 2>/dev/null && return 0; sleep 0.5; i=$((i+1)); done
  return 1
}
key_of() { grep -o 'KEY=[0-9a-f]\{64\}' "$1" | head -1 | cut -d= -f2; }

echo "=== ESCENARIO 1: un solo seeder (A) ==="
LOG_FILE=logs/exp1-seederA.log node scripts/seed.mjs $SAMPLE .storage-exp/1A > /dev/null 2>&1 & A=$!
wait_for logs/exp1-seederA.log "sirviendo" 40 || { echo "seeder A no arrancó"; kill $A; exit 1; }
KEY1=$(key_of logs/exp1-seederA.log)
LOG_FILE=logs/exp1-downloader.log node scripts/fetch.mjs $KEY1 --storage .storage-exp/1D --out downloads-exp/exp1.txt --delay-ms 200 --stall-timeout-s 12 > /dev/null 2>&1 & D=$!
wait_for logs/exp1-downloader.log "progreso" 40 || echo "(aviso) el downloader aún no reporta progreso"
sleep 2
echo "$(node -e 'console.log(new Date().toISOString())') [KILL] kill -9 al seeder A (pid $A) a mitad de la descarga" | tee -a logs/exp1-downloader.log
kill -9 $A 2>/dev/null
wait $D; echo "downloader terminó con código $? (3 = se atascó / incompleto)"

echo; echo "=== ESCENARIO 2: dos seeders (A y C) ==="
LOG_FILE=logs/exp2-seederA.log node scripts/seed.mjs $SAMPLE .storage-exp/2A > /dev/null 2>&1 & A=$!
wait_for logs/exp2-seederA.log "sirviendo" 40 || { echo "seeder A no arrancó"; kill $A; exit 1; }
KEY2=$(key_of logs/exp2-seederA.log)
LOG_FILE=logs/exp2-seederC.log node scripts/fetch.mjs $KEY2 --storage .storage-exp/2C --out downloads-exp/exp2-C.txt --keep-seeding --hold-s 90 > /dev/null 2>&1 & C=$!
wait_for logs/exp2-seederC.log "sigo sirviendo" 60 || { echo "C no completó"; kill -9 $A $C; exit 1; }
LOG_FILE=logs/exp2-downloader.log node scripts/fetch.mjs $KEY2 --storage .storage-exp/2D --out downloads-exp/exp2-D.txt --delay-ms 200 --stall-timeout-s 15 > /dev/null 2>&1 & D=$!
wait_for logs/exp2-downloader.log "progreso" 40 || echo "(aviso) el downloader aún no reporta progreso"
sleep 2
echo "$(node -e 'console.log(new Date().toISOString())') [KILL] kill -9 al seeder A (pid $A); C sigue vivo como seeder" | tee -a logs/exp2-downloader.log
kill -9 $A 2>/dev/null
wait $D; echo "downloader terminó con código $? (0 = completó)"
kill -9 $C 2>/dev/null
echo; echo "Logs en logs/exp1-*.log y logs/exp2-*.log"
