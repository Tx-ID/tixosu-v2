'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

export default function notFound() {
    return (
        <div className="ml-2 mt-2">
            Page is not implemented yet or missing.
        </div>
    )
}