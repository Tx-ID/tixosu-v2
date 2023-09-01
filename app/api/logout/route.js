
import { redirect } from 'next/navigation';

export async function GET(request) {
    const response = new Response();
    response.headers.set("Set-Cookie", "osuAccessToken=; path=/; HttpOnly; expires=" + (new Date(1).toUTCString()));
    response.response = redirect("/")
    return response;
}