import React from 'react'
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <header>
            <nav>
            <Link href="/" className="logo">
            <Image width={24} height={24} src='/icons/logo.png' alt="logo"/>
                <p>DevEvent</p>
            </Link>
            <ul>
                <Link href="/">About
                Home
            </Link><Link href="/">Events
                Home
            </Link><Link href="/">Create
                Home
            </Link>
            </ul>
            </nav>
        </header>
    )
}
export default Navbar
