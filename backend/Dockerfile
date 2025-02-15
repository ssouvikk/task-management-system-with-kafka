# backend/Dockerfile

# Step 1: Node image থেকে শুরু (উদাহরণস্বরূপ, node:20)
FROM node:20.11.1

# Step 2: অ্যাপের কাজের ডিরেক্টরি তৈরি করুন
WORKDIR /usr/src/app

# Step 3: package.json ও package-lock.json (অথবা yarn.lock) কপি করুন
COPY package*.json ./

# Step 4: ডিপেনডেন্সি ইনস্টল করুন
RUN npm install

# Step 5: সোর্স কোড কপি করুন
COPY . .

# Step 6: অ্যাপের পোর্ট (উদাহরণস্বরূপ, 5000) এক্সপোজ করুন
EXPOSE 5000

# Step 7: অ্যাপ চালু করুন
CMD ["npm", "run", "dev"]
