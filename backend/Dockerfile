# backend/Dockerfile

# Step 1: Start from a Node image (e.g., node:20)
FROM node:20.11.1

# Step 2: Create the working directory for the app
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy source code
COPY . .

# Step 6: Expose the app's port (e.g., 5000)
EXPOSE 5000

# Step 7: Start the app
CMD ["sh", "-c", "sleep 5 && node seed.js && npm run dev"]
