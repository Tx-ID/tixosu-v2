import { createClient } from "@libsql/client"

const config = {
  url: process.env.DB_URL,
  authToken: process.env.DB_TOKEN
};

export default function get() {
  const db = createClient(config)
  return db;
}