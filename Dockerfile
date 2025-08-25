FROM node:20-bullseye

WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --legacy-peer-deps

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
