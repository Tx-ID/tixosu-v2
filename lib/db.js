import { createClient } from "@libsql/client";

export async function getTursoClient() {
    const client = createClient({
        url: process.env.DB_URL,
        // untested
        authToken: undefined
    });

    return client;
}