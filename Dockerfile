# Stage 1: Build NextJS app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build-time environment variables (NEXT_PUBLIC_* must be baked in at build time)
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAP_API_KEY
ARG NEXT_PUBLIC_TOKEN_PERIOD
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAP_API_KEY=$NEXT_PUBLIC_GOOGLE_MAP_API_KEY
ENV NEXT_PUBLIC_TOKEN_PERIOD=$NEXT_PUBLIC_TOKEN_PERIOD
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

RUN npm run build

# Stage 2: Production execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
