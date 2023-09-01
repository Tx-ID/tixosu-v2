import { NextResponse } from "next/server";

export async function GET(request) {
    const code = request.nextUrl.searchParams.get("code");
    let token;

    try {
        const clientId = '24284';
        const clientSecret = '7C4e7O2dXVunnF9jVaqjuaRKPtxQKhTIAuDNcL69';
        const redirectUri = process.env.URL + '/callback';

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
                code: code,
            })
        };

        const response = await fetch("https://osu.ppy.sh/oauth/token", requestOptions);
        const tokenData = await response.json();

        if (tokenData.access_token != null) {
            token = tokenData;
        } else {
            console.log(tokenData);
            return new NextResponse("Invalid authorization code.", { status: 500 })
        }
    } catch (error) {
        return new NextResponse("Internal server error.", { status: 500 })
    }

    const timeFromNow = new Date();
    timeFromNow.setTime(timeFromNow.getTime() + token.expires_in * 1000);

    const url = request.nextUrl.clone()
    url.pathname = '/'
    const response = NextResponse.redirect(url);

    response.cookies.set("osuAccessToken", token.access_token, {
        httpOnly: true,
        path: "/",
        expires: timeFromNow,
    });

    return response;

    // const response = new Response("Success");
    // response.headers.append("Set-Cookies", `osuAccessToken=${token.access_token}; HttpOnly; Path=/; expires=${timeFromNow.toUTCString()}`)
}
