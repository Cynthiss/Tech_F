# Imagen de laboratorio: Debian 12 con las herramientas de WireGuard y captura.
FROM node:22-slim
RUN apt-get update -qq \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
      wireguard-tools iproute2 iputils-ping tcpdump procps \
 && rm -rf /var/lib/apt/lists/*
