'use client'

import { Avv } from '@/components/ui/avatar'
import { UseAppContext } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BsPersonLinesFill } from "react-icons/bs";
import { IOnline } from '@/types/types'


const Online = () => {
    const { friendsLoggesUser, hideOnlines,setHideOnlines,friendOnlines } = UseAppContext()

    const { t } = useTranslation()

    const [onlines__,setOnlines__] = useState<IOnline[] | null>(null)

    useEffect(() =>
    {
        if(friendOnlines)
        {
            if(friendsLoggesUser)
            {
                const onlineFriends = friendsLoggesUser.filter(friend => friendOnlines.includes(friend.id));
                setOnlines__(onlineFriends)
            }
        }
    },[friendOnlines])


    const truncateName = (firstName: string, lastName: string, maxLength: number): string => {
        const combinedName = firstName + ' ' + lastName;
        if (combinedName.length > maxLength) {
            return combinedName.slice(0, maxLength) + ' ...';
        }
        return combinedName;
    };

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) =>
        {
            const target = event.target as HTMLElement;
            if (target.classList.contains("overlay"))
            {
                setHideOnlines(false)
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };

    }, [])

    return (
        <div className="relative">
        {hideOnlines && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 overlay 2xl:hidden"></div>
        )}
        <div
            className={`onlines fixed z-40 top-0 2xl:col-span-2  2xl:rounded-xl flex flex-col 2xl:max-h-[32rem] h-full 2xl:relative sm:bg-[#121212] backdrop-blur-sm bg-[#121212]
            transition-transform duration-300 ease-in-out transform ${hideOnlines ? '-translate-x-[2rem] max-w-[20rem] w-full' : '-translate-x-[112%] 2xl:-translate-x-[0%] left-0'
                }`}
        >
            <h1 className="text-lg p-4 text-white  flex flex-row gap-4 items-center"><BsPersonLinesFill size={28}></BsPersonLinesFill> {t('onlines')} ({onlines__ && onlines__.length})</h1>
    
            <section className="flex flex-col gap-4 items-start mt-4 px-2">
                {onlines__ !== null && onlines__.length > 0 ? (
                    onlines__.map((online, index) => (
                        <Link href={`/profile/${online.id}`} key={index} className="flex flex-row items-center gap-3 bg-black/30 w-full p-3 rounded-lg hover:bg-[#222] transition-all duration-200">
                            <section className="relative">
                                <span className="absolute w-3 h-3 rounded-full z-20 right-0 bottom-0 bg-green-500 border-2 border-[#111424]"></span>
                                <Avv className="relative w-[40px] h-[40px]">
                                    <AvatarImage src={`${online.image !== null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${online.image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avv>
                            </section>
                            <section className="truncate w-[70%]">
                                <h1 className="font-semibold text-sm text-white truncate">
                                    {online.first_name && online.last_name && truncateName(online.first_name, online.last_name, 12)}
                                </h1>
                                <h6 className="text-xs text-gray-400 truncate">{online.username}</h6>
                            </section>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-400 p-4 text-center w-full text-xl font-extrabold">{t('nofriendsonlines')}</p>
                )}
            </section>
        </div>
    </div>
    )
}

export default Online