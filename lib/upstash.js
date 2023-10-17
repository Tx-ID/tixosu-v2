import { Redis } from "@upstash/redis";

const config = {
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
};

export default function get() {
    const client = new Redis(config);
    return client;
}