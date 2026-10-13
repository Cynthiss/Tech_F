#!/usr/bin/env bash
# Segundo peer sin compañero: usa contenedores Docker como peers en redes distintas.
# Escenario 1: tu máquina (peer A) <-> un contenedor (peer B).
# Escenario 2: dos contenedores (1 y 2) en una misma red de Docker.
# Requiere Docker corriendo. Cada escenario usa un topic único para no cruzarse con otras personas.
set -u
cd "$(dirname "$0")/.."
docker info >/dev/null 2>&1 || { echo "Docker no está corriendo. Abre Docker Desktop y vuelve a intentar."; exit 1; }

IMG=node:22-slim
SUF=$(node -e 'console.log(Math.random().toString(36).slice(2, 6))')
DAY=$(date +%Y%m%d)
cleanup() { docker rm -f lab16-peerB lab16-c1 lab16-c2 >/dev/null 2>&1; docker network rm lab16net >/dev/null 2>&1; }
trap cleanup EXIT
cleanup
rm -f logs/kickoff-docker-*.log logs/kickoff-contenedores-*.log

run_container() { # nombre archivo-log carnet topic segundos [red]
  local net=(); [ -n "${6:-}" ] && net=(--network "$6")
  docker run -d --name "$1" ${net[@]+"${net[@]}"} -v "$PWD":/src:ro -v "$PWD/logs":/out "$IMG" sh -c \
    "mkdir -p /w && cp -r /src/package.json /src/package-lock.json /src/scripts /w/ && cd /w && npm ci --silent && LOG_FILE=/out/$2 RUN_S=$5 node scripts/peer.mjs '$4' $3" >/dev/null
}
wait_for() { local f=$1 p=$2 t=$3 i=0; while [ $i -lt $((t*2)) ]; do grep -q "$p" "$f" 2>/dev/null && return 0; sleep 0.5; i=$((i+1)); done; return 1; }

echo "=== ESCENARIO 1: tu máquina (A) <-> contenedor (B) ==="
T1="cs031-lab16-docker-$DAY-$SUF"
run_container lab16-peerB kickoff-docker-B.log contenedor-docker-B "$T1" 100
wait_for logs/kickoff-docker-B.log "joined" 120 || echo "(aviso) el contenedor tardó en anunciarse"
LOG_FILE=logs/kickoff-docker-A.log RUN_S=70 node scripts/peer.mjs "$T1" 20230493 > /dev/null 2>&1
docker rm -f lab16-peerB >/dev/null 2>&1
echo "Resultado A (host):"; grep -E "connection|recv|intento-fallido|fallo" logs/kickoff-docker-A.log | tail -6

echo; echo "=== ESCENARIO 2: contenedor 1 <-> contenedor 2 (misma red Docker) ==="
docker network create lab16net >/dev/null
T2="cs031-lab16-contenedores-$DAY-$SUF"
run_container lab16-c1 kickoff-contenedores-1.log contenedor-1 "$T2" 60 lab16net
run_container lab16-c2 kickoff-contenedores-2.log contenedor-2 "$T2" 60 lab16net
wait_for logs/kickoff-contenedores-1.log "fin\|fallo" 100
wait_for logs/kickoff-contenedores-2.log "fin\|fallo" 20
echo "Contenedor 1:"; grep -v estado logs/kickoff-contenedores-1.log
echo "Contenedor 2:"; grep -v estado logs/kickoff-contenedores-2.log
