
import { parse } from 'cookie';

export async function GET(req, res) {
    const clientId = '24284';
    const clientSecret = '7C4e7O2dXVunnF9jVaqjuaRKPtxQKhTIAuDNcL69';
    const redirectUri = process.env.URL + '/api/callback';

    const authUrl = `https://osu.ppy.sh/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=public`;
    return Response.redirect(authUrl);
}