'use client'

import { UseAppContext } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import React from 'react'
import Link from 'next/link'


const NotFound = () => {
    const {t} = useTranslation()
    const {userLoggedIn} = UseAppContext()
    return (
        <>
            <div className="flex justify-center items-center h-screen ">
                <div className="p-6 max-w-lg mx-auto  rounded-lg  flex flex-col items-center space-y-4">
                    <h1 className="text-[6rem] font-extrabold mb-8">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold text-white">{t('oops')}</h2>
                    <p className="text-gray-600 text-center">{t('dontexists')}</p>
                    <Link href={userLoggedIn != null ? `/profile/${userLoggedIn}` : '/login'}>Go Back</Link> 
                </div>
            </div>
        </>
    )
}

export default NotFound