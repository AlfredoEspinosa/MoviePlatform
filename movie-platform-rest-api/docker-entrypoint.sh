#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
MAX_RETRIES=10
COUNT=0
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" 2>/dev/null; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Error: PostgreSQL is not available after $MAX_RETRIES attempts."
    exit 1
  fi
  sleep 2
done
echo "PostgreSQL is ready."

echo "Running migrations..."
npm run migrate

echo "Running seeds..."
npm run seed

echo "Starting API server..."
npm start
