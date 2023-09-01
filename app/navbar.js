'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function navbar() {
    return (
        <div className="flex flex-wrap w-max-screen p-4 justify-between bg-neutral-900
                        md:mt-4 md:rounded-lg">
            <p className="font-bold">Rest of Indonesia Tournament</p>
            <div className="flex flex-wrap">
                <Link href="/" className='ml-3'><p>Home</p></Link>
                <Link href="/about" className='ml-3'><p>About</p></Link>
            </div>
        </div>
    )
}