#!/bin/bash
docker-compose down -v --remove-orphans
docker image prune -f
docker-compose build --no-cache
docker-compose up -d

