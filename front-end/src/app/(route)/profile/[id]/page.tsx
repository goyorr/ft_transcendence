"use client"

import { ChartData, GameInfo, IChartData } from '@/types/types'
import { GiPingPongBat } from "react-icons/gi";
import Link from "next/link"
import { useEffect, useState } from "react"
import { getCookie } from "cookies-next"
import { UseAppContext } from "@/context/AuthContext"
import AxiosInstance from '@/utils/axiosInstance';
import { Avv, AvatarImage } from "@/components/ui/avatar"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"


import Doughnut from './chart';
import ChartBar from './BarChar';
import { useTranslation } from '@/hooks/useTranslation';

import won from "../../../../../public/icons/won.png"
import unhappy from "../../../../../public/icons/unhappy.png"
import Tournament from "../../../../../public/icons/tournament.png"
import pingpong from "../../../../../public/icons/pingpong.png"
import Image from 'next/image'
import { toast } from "sonner"

const formatDateToHumanReadable = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
}

const RecentGames: React.FC<any> = ({ id }) => {

    const [games, setRecentGames] = useState<GameInfo[]>([])

    const { t } = useTranslation()

    const recentGames = async () => {

        try {
            const token = getCookie('access');
            if (!token) {
                toast.error(t('Authorizationtokenmissing'));
                return;
            }
            const response = await AxiosInstance(`/api/v1/list_game/${id}`,
                {
                    method: "GET",
                    headers:
                    {
                        'Content-Type': 'applications/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status === 200 && response.statusText === 'OK') {
                const data = await response.data
                setRecentGames(data.games)
            }
            else {
                throw new Error('Failed to fetch games');
            }
        }
        catch (e) {
            toast.error(t('unexpectederror'))
        }
    }


    useEffect(() => {
        recentGames()
    }, [])

    return (<>

        {games.length > 0 && <h1 className="text-xl font-bold mt-2 mb-4">{t('recenetgames')} ({games.length}) </h1>}

        {games.length > 0 &&
            <Carousel className="relative ">
                <CarouselContent className="game  max-w   2xl:max-w-[42rem] p-8 ">
                    {games.map((game, index) => (
                        <CarouselItem key={index} className="flex flex-col">
                            <section className="flex flex-col p-4 sm:p-6 rounded-xl border-[0.1px] border-[#cccccc17] backdrop-blur-xl bg-black/40 shadow-md shadow-purple-500/50 transition-all hover:shadow-xl hover:scale-105 transform duration-300 ease-in-out">
                                <section>
                                    <h6 className="text-xs text-slate-300 flex flex-col gap-2">
                                        <section className="w-full p-4 rounded-lg shadow-[#5b21b6]/50 shadow-inner">
                                            <section className="flex flex-row gap-2 items-center justify-between w-full">
                                                <section className="flex flex-col sm:flex-row gap-2 justify-between">
                                                    <h1 className="text-xs sm:text-sm rounded-lg py-1 px-2 sm:px-4 font-extrabold bg-gradient-to-r shadow-md text-white truncate">
                                                        {t('mode')[game.mode]}
                                                    </h1>
                                                    <h1 className="text-xs sm:text-sm rounded-lg py-1 px-2 sm:px-4 font-extrabold bg-gradient-to-r shadow-md text-white truncate">
                                                        {t('typegame')[game.type_game]}
                                                    </h1>
                                                </section>
                                                <section>
                                                    <h1 className="text-xs sm:text-sm font-extrabold truncate">{formatDateToHumanReadable(game.date)}</h1>
                                                </section>
                                            </section>
                                        </section>
                                    </h6>
                                </section>

                                <section className="flex flex-col sm:flex-row justify-between items-center mt-4 rounded-md gap-4 p-2 sm:p-4">
                                    <Link className="flex flex-row items-center gap-2" href={`/profile/${game.player_info.id}`}>
                                        <h1 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                                            {game.type_game === 'tournament' && game.mode === 'local'
                                                ? game.winner_alias?.slice(0, 8) || game.winner_alias
                                                : game.player_info.username?.slice(0, 10) || game.player_info.username}
                                        </h1>
                                        <Avv className="w-[30px] sm:w-[40px] h-[30px] sm:h-[40px] rounded-full">
                                            <AvatarImage
                                                src={game.player_info.image
                                                    ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${game.player_info.image}`
                                                    : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}
                                            />
                                        </Avv>
                                    </Link>

                                    <section className="flex items-center gap-4 sm:gap-12 text-xs sm:text-sm">
                                        <span className="px-2 sm:px-3 py-1 bg-slate-700 rounded-full font-extrabold text-slate-100 shadow-inner xl:text-3xl">
                                            {String(game.winner_id) === game.player_info.id ? game.Winner_scr : game.Loser_scr}
                                        </span>
                                        <GiPingPongBat className="text-purple-400" size={18} />
                                        <span className="px-2 sm:px-3 py-1 bg-slate-700 rounded-full font-extrabold text-slate-100 shadow-inner xl:text-3xl">
                                            {game.mode === 'local'
                                                ? game.Loser_scr
                                                : String(game.winner_id) === game.opponent_info.id
                                                    ? game.Winner_scr
                                                    : game.Loser_scr}
                                        </span>
                                    </section>

                                    <Link className="flex flex-row items-center gap-2" href={`/profile/${game.opponent_info.id}`}>
                                        <Avv className="w-[30px] sm:w-[40px] h-[30px] sm:h-[40px] rounded-full">
                                            <AvatarImage
                                                src={game.opponent_info.image
                                                    ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${game.opponent_info.image}`
                                                    : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}
                                            />
                                        </Avv>
                                        <h1 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                                            {game.type_game === 'tournament' && game.mode === 'local'
                                                ? game.loser_alias?.slice(0, 8) || game.loser_alias
                                                : game.opponent_info.username?.slice(0, 10) || game.opponent_info.username}
                                        </h1>
                                    </Link>
                                </section>
                            </section>
                        </CarouselItem>
                    ))}
                </CarouselContent>

            </Carousel>
        }
        {games.length > 0 && <svg className='text-slate-500 flex justify-center items-center w-full mt-6 mb-8' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
            <path d="M13 4H11C8.64298 4 7.46447 4 6.73223 4.73223C6 5.46447 6 6.64298 6 9V15C6 17.357 6 18.5355 6.73223 19.2678C7.46447 20 8.64298 20 11 20H13C15.357 20 16.5355 20 17.2678 19.2678C18 18.5355 18 17.357 18 15V9C18 6.64298 18 5.46447 17.2678 4.73223C16.5355 4 15.357 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17.5C2.82843 17.5 3.5 16.8284 3.5 16V8C3.5 7.17157 2.82843 6.5 2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 17.5C21.1716 17.5 20.5 16.8284 20.5 16V8C20.5 7.17157 21.1716 6.5 22 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
    </>
    )
}


const Profile = ({ params }: { params: { id: string } }) => {

    const [chartData, setChartData] = useState<ChartData[] | null>(null);
    const [chartDataDoghnut, setchartDataDoghnut] = useState<IChartData[] | null>([]);

    const { t } = useTranslation()
    const { GamesData } = UseAppContext()

    const fetchWinLossData = async () => {
        try {
            const response = await AxiosInstance.get(`/api/v1/get_user_win_loss_data/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${getCookie('access')}`
                }
            });

            if (response.statusText === 'OK') {
                const data = await response.data
                setChartData(data);
            }
            else {
                throw new Error('Failed to fetch games');
            }
        } catch (err) {
            toast.error(t('unexpectederror'))
        }
    };


    const fetchWinLossDataDoghnut = async () => {
        try {
            const response = await AxiosInstance.get(`/api/v1/getDataForDoghnutChart/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${getCookie('access')}`
                }
            });

            if (response.status !== 200) {
                throw new Error("Failed to fetch games")
            }

            const data = await response.data

            if (data.tournaments_won === 0 && data.wins === 0 && data.losses === 0) {
                setchartDataDoghnut([])
            }
            else {
                const updatedChartData = [
                    {
                        results: "Tournaments",
                        visitors: data.tournaments_won,
                        fill: "var(--color-tournaments)"
                    },
                    {
                        results: "Win",
                        visitors: data.wins,
                        fill: "var(--color-wins)"
                    },
                    {
                        results: "Lose",
                        visitors: data.losses,
                        fill: "var(--color-losses)"
                    }
                ];
                setchartDataDoghnut(updatedChartData);
            }


        } catch (err) {
            toast.error(t('unexpectederror'))
        }
    };


    useEffect(() => {

        fetchWinLossData();
        fetchWinLossDataDoghnut();
    }, []);



    return (
        <div className="pl-8 pb-8">
            <section className="mt-8 flex flex-col ">
                <RecentGames {...params}></RecentGames>
                {chartDataDoghnut && chartDataDoghnut.length === 0 || chartData?.length == 0 ? (
                    <div className='flex justify-center items-center h-full text-gray-700 p-6 rounded-lg'>
                        <h1 className='text-2xl font-extrabold'>{t('nostatistic')}</h1>
                    </div>
                ) : (
                    <div className='charts w-full min-h-[20rem] rounded-md grid xl:grid-cols-4 2xl:grid-cols-12 gap-4   shadow-2xl'>
                        <section className='col-span-12 lg:col-span-6  rounded-lg mt-4 text-[#cccccc]'>
                            {chartData && <ChartBar chartData={chartData}></ChartBar>}
                        </section>
                        <section className='col-span-12 lg:col-span-6 p-4 rounded-lg mt-4 grid grid-cols-12 gap-4'>
                            <section className='col-span-12 md:col-span-7 rounded-md'>
                                <section className='flex flex-col justify-center items-center'>
                                    <Doughnut chartDataDoghnut={chartDataDoghnut}></Doughnut>
                                    <div className="flex space-x-4 mt-8 flex-wrap justify-center">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-[#8b5cf6] rounded-sm"></div>
                                            <span>{t('tours')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-[#f43f5e] rounded-sm"></div>
                                            <span>{t('losses')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-[#3b82f6] rounded-sm"></div>
                                            <span>{t('wins')}</span>
                                        </div>
                                    </div>
                                </section>
                            </section>
                            <div className='rounded-lg md:flex md:flex-col grid grid-cols-2 p-4 gap-4 md:col-span-5 justify-between text-xs  min-w-[28rem] md:min-w-0'>
                                <div className='backdrop-blur-xl bg-black/30 shadow-inner shadow-[#6d28d9] p-4 rounded-lg flex flex-row items-center gap-6 '>
                                    <section>
                                        <Image
                                            src={won}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                    </section>
                                    <section>
                                        <h1 className='text-lg font-extrabold text-gray-400'>{t('totalwins')}</h1>
                                        <h6 className='font-extrabold text-3xl'>{GamesData && GamesData.wins}</h6>
                                    </section>
                                </div>
                                <div className='shadow-inner shadow-[#6d28d9] rounded-lg p-4 flex flex-row items-center gap-6 '>
                                    <section>
                                        <Image
                                            src={unhappy}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                    </section>
                                    <section>
                                        <h1 className='text-lg font-extrabold text-gray-400'>{t('totallose')}</h1>
                                        <h6 className='font-extrabold text-3xl'>{GamesData && GamesData.loses}</h6>
                                    </section>
                                </div>
                                <div className='shadow-inner shadow-[#6d28d9] rounded-lg p-4 flex flex-row items-center gap-6' >
                                    <section>
                                        <Image
                                            src={Tournament}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                    </section>
                                    <section>
                                        <h1 className='text-lg font-extrabold text-gray-400'>{t('totaltour')}</h1>
                                        <h6 className='font-extrabold text-3xl'>{GamesData && GamesData.tournaments}</h6>
                                    </section>
                                </div>
                                <div className='shadow-inner shadow-[#6d28d9] rounded-lg p-4 flex flex-row items-center gap-6'>
                                    <section>
                                        <Image
                                            src={pingpong}
                                            width={50}
                                            height={50}
                                            alt="Picture of the author"
                                        />
                                    </section>
                                    <section>
                                        <h1 className='text-lg font-extrabold text-gray-400'>{t('totalgames')}</h1>
                                        <h6 className='font-extrabold text-3xl'>{GamesData && GamesData.totlgames}</h6>
                                    </section>
                                </div>
                            </div>
                        </section>
                    </div>

                )}
            </section>
        </div>
    )
}

export default Profile



