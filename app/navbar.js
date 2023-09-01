'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function navbar() {
    const [page, setPage] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const pathname = window.location.pathname;
        setPage(pathname);
    }, [])

    function goToPage(pathname) {
        setPage(pathname);
    }

    const pages = [
        ["Home", "/"],
        ["Rules", "/rules"],
        ["Mappools", "/mappools"],
        ["Teams", "/teams"],
    ]

    return (
        <div className="flex flex-wrap w-max-screen p-2 justify-between items-center
                        md:rounded-0">
            <img className="h-16" src="https://cdn.discordapp.com/attachments/928180368425754674/1147075298131726488/roipro.png" alt="Rest of Indonesia Tournament" />
            <div className="flex flex-wrap">
                {pages.map((pageData, index) => (
                    <Link onClick={() => {goToPage(pageData[1])}} href={pageData[1]} key={index} className={'ml-3 transition-colors duration-150 ' + (pageData[1] == page ? "text-primary" : "hover:text-primary")}><p>{pageData[0]}</p></Link>
                ))}
            </div>
        </div>
    )
}