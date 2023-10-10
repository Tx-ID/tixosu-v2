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
            <div className="flex-wrap hidden md:flex">
                {pages.map((pageData, index) => (
                    <Link onClick={() => { goToPage(pageData[1]) }} href={pageData[1]} key={index} className={'ml-3 transition-colors duration-150 ' + (pageData[1] == page ? "text-primary" : "hover:text-primary")}><p>{pageData[0]}</p></Link>
                ))}
            </div>
            <div className='md:hidden'>
                <details className="dropdown dropdown-end">
                    <summary tabIndex={0} className="btn bg-transparent border-0 hover:bg-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </summary>
                    <ul tabIndex={0} className="dropdown-content mt-2 z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52">
                        {pages.map((pageData, index) => (
                            <li key={index}><Link onClick={() => { goToPage(pageData[1]) }} href={pageData[1]} key={index} className='hover:text-primary'><p className={'' + (pageData[1] == page ? "text-primary hover:text-primary" : "")}>{pageData[0]}</p></Link></li>
                        ))}
                    </ul>
                </details>
            </div>
        </div>
    )
}