#!/usr/bin/sh

# Stop an remove all containers
docker stop x2b-test-1 
docker rm x2b-test-1

# Delete image
#docker rmi x2b

# Build image based on Dockerfile
docker build -t x2b .

# Run container based on image
docker run --name x2b-test-1 -d -p 8000:80 x2b
