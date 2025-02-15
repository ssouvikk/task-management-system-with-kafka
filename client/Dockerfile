# client/Dockerfile

FROM node:20.11.1

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Development-এর জন্য, সোর্স কোড volume-এ মাউন্ট করা থাকলে এই কপি স্টেপটি বিল্ডের সময় করা যেতে পারে,
# কিন্তু container চালু হওয়ার পরে volume mapping host কোডকে ওভাররাইড করবে।
COPY . .

EXPOSE 3000

# Production build-এর জন্য: RUN npm run build
# Development mode এ সরাসরি dev server চালান:
CMD ["npm", "run", "dev"]
