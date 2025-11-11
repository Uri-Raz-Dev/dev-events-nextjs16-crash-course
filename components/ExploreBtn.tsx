'use client'


import Image from "next/image";

const ExploreBtn = () => {
    return (
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={()=>console.log('CLICK')}>
            <a href="#events">Explore Events
                <Image width={24} height={24} src='/icons/arrow-down.svg' alt="arrow-down"/>
            </a>
        </button>
    )
}
export default ExploreBtn
