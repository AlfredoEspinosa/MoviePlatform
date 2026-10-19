#!/bin/bash

# Check if podman machine is running

STATE=$(podman machine list | awk 'NR==2 {print $7}')

if [ "$STATE" != "running" ]; then
  echo "Podman machine not running. Starting..."
  podman machine start
else
  echo "Podman machine is already running."
fi

# Create directory for logs if it doesn't exist
mkdir -p podman-compose-logs

# Start services in detached mode
podman-compose up -d --build

# Redirect logs for each service into the directory
podman-compose logs -f db > podman-compose-logs/db.log &
podman-compose logs -f api > podman-compose-logs/api.log &
podman-compose logs -f frontend > podman-compose-logs/frontend.log &

# Tail all logs together
tail -f podman-compose-logs/db.log podman-compose-logs/api.log podman-compose-logs/frontend.log


