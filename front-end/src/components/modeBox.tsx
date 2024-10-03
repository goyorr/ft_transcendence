'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

const ModeBox = () => {

    const { t } = useTranslation()

    const [choose, setChoose] = useState<boolean>(false)

    const hanldeEnter = () => {
        setChoose(true)
    }
    const hanldeLeave = () => {
        setChoose(false)
    }

    return (
        <div className={`w-[100%] justify-center items-center flex flex-col relative right-0 z-10 h-full p-6 parent overflow-hidden`}>
            <section className="mt-8 flex flex-col backdrop-blur-xl bg-[#5b21b6]/30 p-6 rounded-md">
                <div className="mt-8">
                    <h1 className="text-2xl font-bold">{t('games')}</h1>
                    <h2 className="text-xl  mb-8">{t('choose')}</h2>
                    <div className=" flex flex-col sm:grid sm:grid-cols-2 gap-4 pb-6">
                        <button onClick={() => setChoose(true)}>
                            <div onMouseLeave={hanldeLeave} onMouseEnter={hanldeEnter} className="relative bg-cover bg-center h-72 md:h-[12rem] rounded-lg overflow-hidden  hover:shadow-xl transition-shadow duration-300" style={{ backgroundImage: "url('/assets/Abstract/abstract.jpeg')" }}>
                                <div className="absolute inset-0 h-full bg-gradient-to-b from-black"></div>
                                <div className="relative z-10 p-6 text-white">
                                    <div className="text-3xl font-extrabold text-start">{t('Local')}</div>
                                    <div className="mt-2 text-gray-300 text-start">{t('localdescription')}</div>
                                </div>


                                {choose && (
                                    <div className='bg-black/80 absolute z-50 w-full h-16 top-[105px] animation-slideInDown'>
                                        <div className="flex  justify-center items-center gap-4 p-4 -mt-2">

                                            <Link href="/game/local" className="flex flex-col text-xs   items-center    border-solid   font-bold p-4 w-full  b rounded-lg bg-[#5b21b6]">{t('startlocal')}</Link>
                                            <Link href="/game/local/tournament" className="flex text-xs flex-col     items-center  border-solid   font-bold   p-4 w-full rounded-lg bg-[#5b21b6]">{t('createtour')}</Link>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </button>
                        <Link href="/game/remote">
                            <div className="relative bg-cover bg-center h-72 md:h-[12rem] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 " style={{ backgroundImage: "url('/assets/pong.jpg')" }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]"></div>
                                <div className="relative z-10 p-6 text-white">
                                    <div className="text-3xl font-extrabold">{t('remote')}</div>
                                    <div className="mt-2 text-gray-300">{t('remotedescription')}</div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/game/tournament">
                            <div className="relative bg-cover bg-center h-72 md:h-[12rem] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundImage: "url('/assets/trophy.jpeg')" }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]"></div>
                                <div className="relative z-10 p-6 text-white">
                                    <div className="text-3xl font-extrabold">{t('tours')}</div>
                                    <div className="mt-2 text-gray-300">{t('tourdescription')}</div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/game/multiplayer">
                            <div className="relative bg-cover bg-center h-72 md:h-[12rem] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundImage: "url('/assets/team.jpg')" }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]"></div>
                                <div className="relative z-10 p-6 text-white">
                                    <div className="text-3xl font-extrabold">{t('multiplayer')}</div>
                                    <div className="mt-2 text-gray-300">{t('against')}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ModeBox;
