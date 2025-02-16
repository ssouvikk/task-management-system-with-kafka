# client/Dockerfile
FROM node:20.11.1

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# For development, if source code is mounted as volume, this copy step may be done during build,
# but after container start volume mapping will override host code.
COPY . .

EXPOSE 3000

# For production build: RUN npm run build
# Run dev server directly in development mode:
CMD ["npm", "run", "dev"]
