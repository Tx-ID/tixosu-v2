'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function callback() {
    const [err, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            setLoaded(true);
            window.location.href = "/";
        } else {
            setError(true);
            setLoaded(true);
        }
    }, []);

    return (
        <div className="flex flex-col items-center">
            <p className={"min-w-screen text-center " + (loaded && err ? "text-neutral-800" : "")}>{!loaded ? "" : err ? "You shouldn't be here." : "Redirecting you back..."}</p>
            <img src="https://media.discordapp.net/attachments/844037994343170068/1114555395730591744/cat.gif" className="w-16"></img>
        </div>
    );
}
