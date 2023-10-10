'use client'

import { useSession } from "next-auth/react"

export default function page() {
    const session = useSession();

    return (
        <div>
            <div className="mb-4">Hello this is sheets. Authorization is not working currently</div>
            {session.status == "loading" ? <>loading...</> : <>{JSON.stringify(session, null, 2)}</>}
        </div>
    )
}