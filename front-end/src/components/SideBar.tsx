'use client'

import Link from "next/link"
import { IoTrophySharp } from "react-icons/io5";
import { UseAppContext } from "@/context/AuthContext"
import { usePathname } from 'next/navigation'
import { useState } from "react";
import { RiPingPongFill } from "react-icons/ri";
import { useTranslation } from "@/hooks/useTranslation";

const menuItems = [
    {
        name: 'Dashboard', path: '/dashboard', icon: ((active: boolean) =>
            <svg className={`${active === false ? "text-[#ccc]" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                <path d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V8C10 9.88562 10 10.8284 9.41421 11.4142C8.82843 12 7.88562 12 6 12C4.11438 12 3.17157 12 2.58579 11.4142C2 10.8284 2 9.88562 2 8V6Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 19C2 18.0681 2 17.6022 2.15224 17.2346C2.35523 16.7446 2.74458 16.3552 3.23463 16.1522C3.60218 16 4.06812 16 5 16H7C7.93188 16 8.39782 16 8.76537 16.1522C9.25542 16.3552 9.64477 16.7446 9.84776 17.2346C10 17.6022 10 18.0681 10 19C10 19.9319 10 20.3978 9.84776 20.7654C9.64477 21.2554 9.25542 21.6448 8.76537 21.8478C8.39782 22 7.93188 22 7 22H5C4.06812 22 3.60218 22 3.23463 21.8478C2.74458 21.6448 2.35523 21.2554 2.15224 20.7654C2 20.3978 2 19.9319 2 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 16C14 14.1144 14 13.1716 14.5858 12.5858C15.1716 12 16.1144 12 18 12C19.8856 12 20.8284 12 21.4142 12.5858C22 13.1716 22 14.1144 22 16V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V16Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 5C14 4.06812 14 3.60218 14.1522 3.23463C14.3552 2.74458 14.7446 2.35523 15.2346 2.15224C15.6022 2 16.0681 2 17 2H19C19.9319 2 20.3978 2 20.7654 2.15224C21.2554 2.35523 21.6448 2.74458 21.8478 3.23463C22 3.60218 22 4.06812 22 5C22 5.93188 22 6.39782 21.8478 6.76537C21.6448 7.25542 21.2554 7.64477 20.7654 7.84776C20.3978 8 19.9319 8 19 8H17C16.0681 8 15.6022 8 15.2346 7.84776C14.7446 7.64477 14.3552 7.25542 14.1522 6.76537C14 6.39782 14 5.93188 14 5Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        )
    },
    {
        name: 'Chat', path: '/chat', icon: ((active: boolean) =>
            <svg className={`${active === false ? "text-[#ccc]" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                <path d="M20 9C19.2048 5.01455 15.5128 2 11.0793 2C6.06549 2 2 5.85521 2 10.61C2 12.8946 2.93819 14.9704 4.46855 16.5108C4.80549 16.85 5.03045 17.3134 4.93966 17.7903C4.78982 18.5701 4.45026 19.2975 3.95305 19.9037C5.26123 20.1449 6.62147 19.9277 7.78801 19.3127C8.20039 19.0954 8.40657 18.9867 8.55207 18.9646C8.65392 18.9492 8.78659 18.9636 9 19.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 16.2617C11 19.1674 13.4628 21.5234 16.5 21.5234C16.8571 21.5238 17.2132 21.4908 17.564 21.425C17.8165 21.3775 17.9428 21.3538 18.0309 21.3673C18.119 21.3807 18.244 21.4472 18.4938 21.58C19.2004 21.9558 20.0244 22.0885 20.8169 21.9411C20.5157 21.5707 20.31 21.1262 20.2192 20.6496C20.1642 20.3582 20.3005 20.075 20.5046 19.8677C21.4317 18.9263 22 17.6578 22 16.2617C22 13.356 19.5372 11 16.5 11C13.4628 11 11 13.356 11 16.2617Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>)
    },
    {
        name: 'Profile', path: '/profile', icon: ((active: boolean) =>
            <svg className={`${active === false ? "text-[#ccc]" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                    <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>)
    },
    {
        name: 'Tournament', path: '/game/local/tournament', icon: ((active: boolean) =>
            <IoTrophySharp className={`${active === false ? "text-slate-400" : ""}`} size={24}></IoTrophySharp>

        )
    },
    {
        name: 'Game Modes', path: '/game', icon: ((active: boolean) =>
            <RiPingPongFill className={`${active === false ? "text-slate-400" : ""}`} size={24}></RiPingPongFill>
        )
    },
];

const SideBar: React.FC = () => {

    const pathname = usePathname()

    const { userLoggedIn, setToggleBox } = UseAppContext()
    const [active, setactive] = useState<string | null>(pathname)

    const handleActive = (path: string) => {
        if (path) {
            setactive(path)
        }
    }


    const {t} = useTranslation()

    const HanldeToggle = (name:string) => {     
        if (name === 'Game Modes')
            setToggleBox((prev: boolean) => !prev)
    }

    // useEffect(() =>
    // {
    //     if(userLoggedIn === null)
    //     {
    //         return
    //     }
    // },[userLoggedIn])

    if (userLoggedIn === null)
    {
        return <></>
    }

    return (
        <div >
            {(active !== '/login' && active !== '/Signup' && active?.split('/')[1] !== 'forgot-password') && (
                <>
                    <ul className=" flex flex-row gap-4 sm:flex-col sm:gap-6 rounded-lg p-4 sm:p-8 bg-gray-800 left-40  sm:left-0 sm:bg-transparent shadow-lg fixed bottom-0 z-20">
                        {menuItems.map((item) => (
                            <li
                                key={item.path}
                                className={`p-2 transition-all duration-300 ease-in-out hover:bg-gray-700 rounded-lg ${active === item.path ? 'bg-gray-700' : ''}`}
                                onClick={() => handleActive(item.path)}
                            >
                                {item.path === '/game' ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                        <button className="flex flex-row gap-4" onClick={() => HanldeToggle(item.name)}>
                                            {item.icon(active === item.path)}
                                            <span className="hidden sm:hidden lg:block text-xs sm:text-base text-white">{t(item.name)}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.name === "Profile" || item.name === "Dashboard" ? `/profile/${userLoggedIn}` : item.path}
                                        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
                                    >
                                        {item.icon(active === item.path)}
                                        <span className="hidden sm:hidden lg:block text-xs sm:text-base text-white">{t(item.name)}</span>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );

}

export default SideBar
