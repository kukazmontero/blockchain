docker build -t alpine-node-app .
docker run --volume "$(pwd)/app:/app" -p 3000:3000 alpine-node-app
