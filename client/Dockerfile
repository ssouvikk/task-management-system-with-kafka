# client/Dockerfile

# Step 1: Node image থেকে শুরু (উদাহরণস্বরূপ, node:20)
FROM node:20.11.1

# Step 2: অ্যাপের কাজের ডিরেক্টরি তৈরি করুন
WORKDIR /usr/src/app

# Step 3: package.json ও package-lock.json কপি করুন
COPY package*.json ./

# Step 4: ডিপেনডেন্সি ইনস্টল করুন
RUN npm install --legacy-peer-deps

# Step 5: সোর্স কোড কপি করুন
COPY . .

# Step 6: Next.js build করুন
RUN npm run build

# Step 7: পোর্ট এক্সপোজ করুন (Next.js সাধারণত 3000 পোর্টে চলে)
EXPOSE 3000

# Step 8: Next.js চালু করুন
CMD ["npm", "run", "dev"]
