'use client'

import { useSession } from "next-auth/react"

export default function page() {
    const session = useSession();

    return (
        <div>
            <div className="mb-4">This is authorization.</div>
            {session.status == "loading" ? <>loading...</> : <>{JSON.stringify(session, null, 2)}</>}
        </div>
    )
}