'use client'

import React, { ChangeEvent, useEffect, useState } from 'react';
import Trophet from "../../public/assets/trophet.jpg"
import Image from "next/legacy/image"
import { getCookie } from 'cookies-next';
import { Tournament, GameData } from "@/types/types"
import { parseISO, format } from 'date-fns';
import trophet from "../../public/assets/trophet2.jpg"
import Avatar from "@/components/avatar"
import TourSocket from '@/components/toursocket';
import AxiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';
import { UseAppContext } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface DateTimePickerProps {
    setDate: React.Dispatch<React.SetStateAction<Date | null>>;
}


interface IDate {
    name: string,
    end_date: Date | null,
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ setDate }) => {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    // const [hours, setHours] = useState(selectedDate.getHours());
    // const [minutes, setMinutes] = useState(selectedDate.getMinutes());
    // const [seconds, setSeconds] = useState(selectedDate.getSeconds());

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; 
    const currentYear = today.getFullYear();

    const days = Array.from({ length: 31 - currentDay + 1 }, (_, i) => currentDay + i);
    const months = Array.from({ length: 12 - currentMonth + 1 }, (_, i) => currentMonth + i);
    const years = Array.from({ length: 1 }, (_, i) => currentYear + i);

    const handleDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newDate = new Date(selectedDate);

        if (name === "day") newDate.setDate(Number(value));
        if (name === "month") newDate.setMonth(Number(value) - 1);
        if (name === "year") newDate.setFullYear(Number(value));

        setSelectedDate(newDate);
        setDate(newDate);
    };

    return (
        <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">{t('selectdate')}</h2>
                <div className="grid grid-cols-3 gap-4">
                    <select name="day" value={selectedDate.getDate()} onChange={handleDateChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                    <select name="month" value={selectedDate.getMonth() + 1} onChange={handleDateChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <select name="year" value={selectedDate.getFullYear()} onChange={handleDateChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>


            {/* <div>
                <h2 className="text-lg font-semibold mb-2">{t('selecttime')}</h2>
                <div className="grid grid-cols-3 gap-4">
                    <select name="hours" value={hours} onChange={handleTimeChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                        ))}
                    </select>
                    <select name="minutes" value={minutes} onChange={handleTimeChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                        ))}
                    </select>
                    <select name="seconds" value={seconds} onChange={handleTimeChange} className="p-3 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>
            </div> */}
        </div>
    );
};
const DialogModal: React.FC<any> = ({ hide, setHide }) => {

    const { t } = useTranslation()
    const [date, setDate] = useState<Date | null>(null)

    const [name, setName] = useState('')
    const [disable, setDisabled] = useState<boolean>(true)

    const HandleValues = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget

        if (name === 'name') {
            setName(value)
        }
    }

    const create = async (e: React.MouseEvent<HTMLButtonElement>) => {

        e.preventDefault()

        const access = getCookie('access')

        const data: IDate = {
            name,
            end_date: date
        }


        if (data.end_date === null) {
            const now = new Date();
            data.end_date = now;
        }

        try {
            const response = await AxiosInstance(`/api/v1/Create_Retrieve`, {
                method: "POST",
                data: data,
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            })

            if (response.statusText === 'Created' && response.status === 201) {
                location.reload()
                setHide(!hide)
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    useEffect(() => {
        if (name.length > 5) {
            setDisabled(false)
        }
        else {
            setDisabled(true)
        }
    }, [name])

    return (
        <>
            {!hide && (

                <div className='fixed inset-0 flex lg:items-center items-start justify-center  bg-black bg-opacity-50 z-10'>
                    <div className='w-full max-w-md p-6 bg-[#020617] rounded-lg shadow-lg mt-8'>
                        <input name='name' onChange={HandleValues} value={name} placeholder={t('tourname')} className={`mb-4  text-sm w-full outline-none p-2 rounded-md bg-transparent`}></input>

                        <DateTimePicker setDate={setDate}></DateTimePicker>
                        <button onClick={create} disabled={disable} className={`w-full py-[16px]  border-none rounded-md text-sm font-extrabold  mt-4 bg-[#5b21b6]  ${disable ? "opacity-50" : ""}`}>{t('addtour')}</button>
                    </div>
                </div>
            )}
        </>
    )
}

interface PropsInterface {
    setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>,
    tournaments: Tournament[],
    id: number;
    setSHowNickname: React.Dispatch<React.SetStateAction<boolean>>
}

const Nickname: React.FC<PropsInterface> = ({ setTournaments, tournaments, id, setSHowNickname }) => {
    const [disable, setDisabled] = useState<boolean>(true)
    const [nickname, setNickname] = useState<string>('')

    const { t } = useTranslation()

    const access = getCookie('access')

    const tour = async () => {
        try {
            await AxiosInstance(`/api/v1/Create_Retrieve`, {
                method: "GET",
                headers:
                {
                    'Authorization': `Bearer ${access}`
                }
            })
              
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

   


    const HandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.currentTarget.value)
    }

    useEffect(() => {
        if (nickname.length > 0) {
            setDisabled(false)
        }
    }, [nickname])

    const join = async () => {

        tour();

        const access = getCookie('access')
        try {
            const response = await AxiosInstance("/api/v1/join", {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json',
                    "authorization": `Bearer ${access}`
                },
                data: {
                    tournament_id: id,
                    nickname: nickname
                }
            })

            if (response.statusText === 'OK') {
                const data = await response.data;
                setTournaments(tournaments.map(tournament => {
                    if (tournament.id === data.success.id) {
                        return {
                            ...tournament,
                            player_count: data.success.player_count,
                            is_player_joined: data.success.is_player_joined
                        };
                    }
                    return tournament;
                }));
                setSHowNickname(false);
            }
            // if (response.status === 400) {
            //     toast.error(t('tournamentfull'))
            //     window.location.reload();
            // }
        }
        catch (e) {
            toast.error(t('tournamentfull'))
        }
        window.location.reload();
    }

    return <div className='fixed inset-0 flex lg:items-center items-start justify-center  bg-black bg-opacity-50 z-10'>
        <div className='w-full max-w-md p-6 bg-[#020617] rounded-lg shadow-lg mt-8'>
            <input value={nickname} onChange={HandleChange} name={t('n')} placeholder={t('enternickname')} className={`mb-4  text-sm w-full outline-none p-2 rounded-md bg-transparent`}></input>
            <button onClick={join} className={`w-full py-[10px] border-none rounded-md text-sm font-light mt-4 bg-gradient-to-r from-cyan-500 to-blue-500  ${disable ? "opacity-50" : ""}`}>{t('jointournament')}</button>
        </div>
    </div>
}

interface propsTournament {
    tournaments: Tournament[],
    setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>,
    HanldeClick: (e: React.MouseEvent<HTMLButtonElement>, id: string, event: string) => void,
}


const ParseTime = (date: string): string => {
    const parse = new Date(date);

    const options: any = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    const humanReadableDate = parse.toLocaleDateString('en-US', options);

    return humanReadableDate
}

const Grid: React.FC<propsTournament> = ({ tournaments, HanldeClick }) => {

    const { t } = useTranslation()

    return (
        <div className='flex flex-col sm:grid sm:grid-cols-2  md:grid-cols-3  2xl:grid-cols-4  gap-4 mt-8'>
            {
                tournaments.map((tournament) =>

                (<div key={tournament.id}>
                    <section className='rounded-md  border-[0.1px] border-[#cccccc26]'>
                        <section className='img  min-h-[12rem] w-full relative rounded-md'>

                            <Image
                                src={trophet}
                                alt='trophet'
                                layout='fill'
                                objectFit='cover'
                                className='rounded-md'
                            />
                            <section className='backdrop-blur-xl bg-white/30 w-full  p-2 rounded-md absolute bottom-0 '>
                                <section className='flex flex-col gap-2 '>
                                    <h6 className='text-xs'>{t('orginzer')}</h6>
                                    <Link href={`/profile/${tournament.organizer}`} className='flex flex-row items-center gap-2'>
                                        <Avatar
                                            src={`${tournament?.organizer_info?.image ? tournament.organizer_info.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`}
                                            width='w-[40px]'
                                            height='h-[40px]'
                                            alt='orginzer'
                                        />
                                        <h1 className='font-extrabold'>{tournament.organizer_info.username.length > 13 ? `${tournament.organizer_info.username.slice(0, 13)}...` : tournament.organizer_info.username}</h1>
                                    </Link>
                                </section>
                            </section>

                        </section>
                        <section className='p-4'>
                            <h1 className='text-xl font-extrabold mb-2'>{tournament.name.length > 26 ? tournament.name.substring(0, 26) : tournament.name}</h1>
                            <h6 className='text-xs  text-slate-400 mb-4 flex flex-row gap-2 items-center'>
                                <svg className='text-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} fill={"none"}>
                                    <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {ParseTime(tournament.end_date)}
                            </h6>
                            <section className='flex flex-row justify-between items-center border-t py-4'>
                                {/* <button disabled={tournament.player_count === 4 ? true : tournament.is_end ? true : ((tournament.max_players === tournament.player_count || tournament.is_expired) && !tournament.is_player_joined) ? true : false} className={`px-[16px]  bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-[8px] rounded-md ${tournament.is_end || tournament.player_count === 4 ? 'opacity-10' : (tournament.max_players === tournament.player_count || tournament.is_expired) && !tournament.is_player_joined ? " opacity-5" : "text-sm font-extrabold   "}`} onClick={(e) => HanldeClick(e, tournament.id, `${!tournament.is_player_joined ? "join" : ""}`)}>{tournament.is_player_joined ? t('Unregister') : t('register')}</button> */}
                                <button disabled={tournament.is_player_joined ? true : tournament.player_count === 4 ? true : tournament.is_end ? true : ((tournament.max_players === tournament.player_count || tournament.is_expired) && !tournament.is_player_joined) ? true : false} className={`px-[16px]  bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-[8px] rounded-md ${tournament.is_end || tournament.player_count === 4 || tournament.is_player_joined ? 'opacity-10' : (tournament.max_players === tournament.player_count || tournament.is_expired) && !tournament.is_player_joined ? " opacity-5" : "text-sm font-extrabold   "}`} onClick={(e) => HanldeClick(e, tournament.id, `${!tournament.is_player_joined ? "join" : ""}`)}>{t('register')}</button>
                                <section className='flex flex-col'>
                                    <span className='text-slate-400 text-[14px]'>{t('playersjoined')}</span>
                                    <h6 className='font-extrabold text-xs'>{tournament.player_count} / {tournament.max_players}</h6>
                                </section>
                            </section>

                        </section>
                    </section>
                </div>)
                )
            }
        </div>
    )
}


interface IPagination {
    count: number,
    next: string,
    previous: string,
}

const TourPage = () => {

    const { socket, userLoggedIn } = UseAppContext();
    const { setToggleBox } = UseAppContext()
    const [id_tou, setIdTour] = useState<number | null>(null)
    const [showNickname, setSHowNickname] = useState<boolean>(false)
    const { t } = useTranslation()

    const [isGrid, setisGrid] = useState<boolean>(true)

    const [pagination, setPagination] = useState<IPagination>({
        'count': 0,
        'next': '',
        'previous': ''
    })

    const [matches, setMatches] = useState<GameData[]>([])
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    const seeMore = async () => {
        try {
            const response = await AxiosInstance(pagination.next === null ? pagination.previous : pagination.next, {
                method: "GET",
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('access')}`
                }
            })

            const data = await response.data
            if (response.status === 200 && response.statusText === 'OK') {
                if (pagination.next === null) {
                    setTournaments(data.results)
                    setPagination({
                        'count': data.count,
                        'next': data.next,
                        'previous': data.previous
                    })
                }
                else {
                    setTournaments([...tournaments, ...data.results])
                }
                setPagination({
                    'count': data.count,
                    'next': data.next,
                    'previous': data.previous
                })
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    const [hide, setHide] = useState(true)
    const create = () => {
        setHide(!hide)
    }

    const formatDate = (date: string): string => {
        const parse = parseISO(date);

        const formattedDate = format(parse, "MMMM do, yyyy h:mm:ss");

        return formattedDate
    }

    const searchTournament = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const access = getCookie('access')
        try {
            const response = await AxiosInstance(`/api/v1/Create_Retrieve?qname=${e.currentTarget.value}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`,
                }
            })

            if (response.statusText === 'OK' && response.status === 200) {
                const data = await response.data
                setPagination({
                    'count': data.cout,
                    'next': data.next,
                    'previous': data.previous
                })
                setTournaments(data.results)
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    const unjoin = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        const access = getCookie('access')
        try {
            await AxiosInstance("/api/v1/unjoin", {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json',
                    "authorization": `Bearer ${access}`
                },
                data: {
                    tournament_id: id,
                }
            })

            setTournaments(tournaments.map(tournament => tournament.id === id ? { ...tournament, player_count: tournament.player_count - 1, is_player_joined: !tournament.is_player_joined } : tournament))
            e.preventDefault()
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    const HanldeClick = (e: React.MouseEvent<HTMLButtonElement>, id: string, event: string) => {
        if (event === "join") {
            setSHowNickname(true)
            setIdTour(Number(id))
        }
        else {
            unjoin(e, id)
        }
    }

    const handleGrid = (e: React.MouseEvent<HTMLElement>, event: string) => {

        if (event === "grid") {
            setisGrid(true)
        }
        else if (event === "list") {
            setisGrid(false)

        }
        e.preventDefault()
    }

    useEffect(() => {

        const access = getCookie('access')

        const retieveTour = async () => {
            try {
                const response = await AxiosInstance(`/api/v1/Create_Retrieve`, {
                    method: "GET",
                    headers:
                    {
                        'Authorization': `Bearer ${access}`
                    }
                })

                const data = await response.data
                setPagination({
                    'count': data.count,
                    'next': data.next,
                    'previous': data.previous
                })
                setTournaments(data.results)
                return data.results;
            }
            catch (e) {
                toast.error(t('erroroccurred'))
            }
        }

        retieveTour()

    }, [])

    const getMatches = async () => {
        const access = getCookie('access')
        try {
            const response = await AxiosInstance("/api/v1/matches",
                {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${access}`
                    }
                }
            )

            const data = await response.data
            if (response.status === 200 && response.statusText === 'OK') {
                setMatches(data.data)
            }
            return data.data;

        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    useEffect(() => {
        getMatches()
    }, [])

    const [ids, setId] = useState<any>({})
    const [start, setStart] = useState<boolean>(false)
    const [joined, setJoined] = useState(false)

    useEffect(() => {
        if (start)
            setJoined(true);
    }, [start]);

    const StartGame = async (e: any, p1: String, p2: String, matchid: number, match: any) => {

        const tmp_matches = await getMatches();

        const matchToCheck = tmp_matches.find((m: { id: number; }) => m.id === matchid);
        if (matchToCheck && matchToCheck.is_played) {
            window.location.reload();
        }


        if (socket != null)
            socket.send(JSON.stringify({ "type": "match_ready", "from": userLoggedIn, "to": p1 === String(userLoggedIn) ? p2 : p1 }));

        setId({
            id1: String(p1),
            id2: String(p2),
            match_id: matchid,
            match: match
        })
        e.preventDefault()
        setStart(true)
    }

    useEffect(() => {
        setToggleBox(false)
    }, [])

    if (joined)
        return <TourSocket {...ids} />;

    return (
        <div>
            <DialogModal hide={hide} setHide={setHide} tournaments={tournaments} setTournaments={setTournaments}></DialogModal>
            {showNickname && (id_tou && <Nickname setTournaments={setTournaments} tournaments={tournaments} id={id_tou} setSHowNickname={setSHowNickname}></Nickname>)}
            <div className='w-full min-h-[14rem]  relative mb-0 rounded-md'>
                <section className="w-full h-full">
                    <Image
                        className="rounded-lg"
                        objectPosition="center"
                        objectFit="cover"
                        layout="fill"
                        src={Trophet}
                        alt="cover"
                    />
                </section>
            </div>
            <div className=''>
                <h1 className='text-xl font-extrabold  flex flex-col mt-6'>{t('games')}</h1>
                <div className='flex flex-col sm:grid sm:grid-cols-1  md:grid-cols-2  2xl:grid-cols-3  gap-4'>
                    {matches.length > 0 && matches.map((match => (
                        <div key={match.id}>
                            <section className='mt-4 flex flex-col bg-[#050C9C]  justify-center rounded-md px-4 py-[8px]  shadow-lg relative' >

                                <section className='avatars mt-2 flex flex-row  justify-between  rounded-lg'>
                                    <section className='flex flex-row items-center gap-2'>
                                        <Avatar width='w-[50px]' height='h-[50px]' src={`${match.p1.image === null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${match.p1.image}`}`} alt={`${match.p1.username}`}></Avatar>
                                        <section>
                                            <h1>{match.p1.username && match.p1.username?.length < 12 ? match.p1.username : `${match.p1.username?.substring(0, 12)}...`}</h1>
                                            <h1 className='text-xs text-gray-500'>{match.p1.nickname && match.p1.nickname?.length < 12 ? match.p1.nickname : `${match.p1.nickname?.substring(0, 12)}...`}</h1>
                                        </section>
                                    </section>
                                    <span className='font-extrabold text-xl flex jus items-center'>
                                        vs
                                    </span>
                                    <section className='flex flex-row items-center gap-2'>
                                        <section className='flex flex-col items-end'>
                                            <h1>{match.p2.username && match.p2.username?.length < 12 ? match.p2.username : `${match.p2.username?.substring(0, 12)}...`}</h1>
                                            <h1 className='text-xs text-gray-500'>{match.p2.nickname && match.p2.nickname?.length < 6 ? match.p2.nickname : `${match.p2.nickname?.substring(0, 12)}...`}</h1>
                                        </section>
                                        <Avatar width='w-[50px]' height='h-[50px]' src={`${match.p2.image === null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${match.p2.image}`}`} alt={`${match.p2.username}`}></Avatar>
                                    </section>
                                </section>
                                <section className='flex justify-between items-center'>
                                    <section>
                                        <h1 className='text-xs text-slate-300 mt-4'>{match.name_tournament}</h1>
                                        <h6 className='font-extrabold'>{t('round')} - {match.round_number}</h6>
                                    </section>
                                    <section className='player flex flex-row mt-4 -space-x-4'>
                                        <Avatar width='w-[36px]' height='h-[36px]' src={`${match.p1.image === null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${match.p1.image}`}`} alt={`${match.p1.username}`}></Avatar>
                                        <Avatar width='w-[36px]' height='h-[36px]' src={`${match.p2.image == null ? `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${match.p2.image}`}`} alt={`${match.p2.username}`}></Avatar>
                                    </section>
                                </section>
                                {!match.is_played ?
                                    <section>
                                        <button className='bg-gradient-to-r px-[20px] py-[8px] ] bg-[#1d4ed8]  h-9 text-white mt-3 rounded-md flex items-center' onClick={(e) => StartGame(e, match.p1.id, match.p2.id, match.id, match)}>{t('start')}</button>
                                    </section>
                                
                                : match.is_played && <button style={{ marginBottom: '30px' }}></button>}
                            </section>
                        </div>
                    )))}

                </div>
            </div>
            <section className='flex justify-between items-center'>
                <h1 className='text-xl font-extrabold  flex flex-col mt-6'>{t('tours')}</h1>
                <section className='icons flex flex-row gap-2 mt-6'>
                    {isGrid ? (<section className='border-[0.1px] border-slate-600 p-2 rounded-md cursor-pointer' onClick={(e) => handleGrid(e, "list")}>
                        <svg className='' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} fill={"none"}>
                            <path d="M4 5L20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 19L20 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </section>) : (<section className='border-[0.1px] border-slate-600 p-2 rounded-md cursor-pointer' onClick={(e) => handleGrid(e, "grid")}>
                        <svg className='' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} fill={"none"}>
                            <path d="M2 18C2 16.4596 2 15.6893 2.34673 15.1235C2.54074 14.8069 2.80693 14.5407 3.12353 14.3467C3.68934 14 4.45956 14 6 14C7.54044 14 8.31066 14 8.87647 14.3467C9.19307 14.5407 9.45926 14.8069 9.65327 15.1235C10 15.6893 10 16.4596 10 18C10 19.5404 10 20.3107 9.65327 20.8765C9.45926 21.1931 9.19307 21.4593 8.87647 21.6533C8.31066 22 7.54044 22 6 22C4.45956 22 3.68934 22 3.12353 21.6533C2.80693 21.4593 2.54074 21.1931 2.34673 20.8765C2 20.3107 2 19.5404 2 18Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M14 18C14 16.4596 14 15.6893 14.3467 15.1235C14.5407 14.8069 14.8069 14.5407 15.1235 14.3467C15.6893 14 16.4596 14 18 14C19.5404 14 20.3107 14 20.8765 14.3467C21.1931 14.5407 21.4593 14.8069 21.6533 15.1235C22 15.6893 22 16.4596 22 18C22 19.5404 22 20.3107 21.6533 20.8765C21.4593 21.1931 21.1931 21.4593 20.8765 21.6533C20.3107 22 19.5404 22 18 22C16.4596 22 15.6893 22 15.1235 21.6533C14.8069 21.4593 14.5407 21.1931 14.3467 20.8765C14 20.3107 14 19.5404 14 18Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 6C2 4.45956 2 3.68934 2.34673 3.12353C2.54074 2.80693 2.80693 2.54074 3.12353 2.34673C3.68934 2 4.45956 2 6 2C7.54044 2 8.31066 2 8.87647 2.34673C9.19307 2.54074 9.45926 2.80693 9.65327 3.12353C10 3.68934 10 4.45956 10 6C10 7.54044 10 8.31066 9.65327 8.87647C9.45926 9.19307 9.19307 9.45926 8.87647 9.65327C8.31066 10 7.54044 10 6 10C4.45956 10 3.68934 10 3.12353 9.65327C2.80693 9.45926 2.54074 9.19307 2.34673 8.87647C2 8.31066 2 7.54044 2 6Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M14 6C14 4.45956 14 3.68934 14.3467 3.12353C14.5407 2.80693 14.8069 2.54074 15.1235 2.34673C15.6893 2 16.4596 2 18 2C19.5404 2 20.3107 2 20.8765 2.34673C21.1931 2.54074 21.4593 2.80693 21.6533 3.12353C22 3.68934 22 4.45956 22 6C22 7.54044 22 8.31066 21.6533 8.87647C21.4593 9.19307 21.1931 9.45926 20.8765 9.65327C20.3107 10 19.5404 10 18 10C16.4596 10 15.6893 10 15.1235 9.65327C14.8069 9.45926 14.5407 9.19307 14.3467 8.87647C14 8.31066 14 7.54044 14 6Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </section>)}
                </section>
            </section>
            <p className='text-[14px] text-slate-600  mt-4'>{t('createsearchtour')}</p>
            <section className='serach_add flex flex-row justify-between gap-6 mt-4'>
                <div className='relative w-[28rem]'>
                    <input onChange={searchTournament} type="text" className={'text-xs font-bold w-full p-2 rounded-md bg-transparent border-[0.1px] border-slate-800 outline-none'} placeholder={t('searchtournament')} />
                </div>
                <button onClick={create} className='bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-[12px] border-none rounded-md text-sm font-light'>{t('createtournament')}</button>
            </section>

            {isGrid ? <Grid tournaments={tournaments} setTournaments={setTournaments} HanldeClick={HanldeClick}></Grid> : (
                <section className='mt-8  w-full h-full relative p-4 rounded-md shadow-[rgba(0,0,0,0.25)_0px_54px_55px,rgba(0,0,0,0.12)_0px_-12px_20px,rgba(0,0,0,0.12)_0px_4px_6px,rgba(0,0,0,0.17)_0px_12px_13px,rgba(0,0,0,0.09)_0px_-3px_5px] border-[0.1px] border-solid border-[#8b5df787];'>
                    <ul className='flex flex-row items-center text-xs text-white bg-[#8b5df70a] p-4 rounded-lg justify-between'>
                        <li className='flex-1 flex justify-center'>{t('n')}</li>
                        <li className='flex-1 flex justify-center'>{t('t')}</li>
                        <li className='flex-1 flex justify-center'>{t('pl')}</li>
                        <li className='flex-1 flex justify-center'>{t('st')}</li>
                        <li className='flex-1 flex justify-center'>{t('w')}</li>
                    </ul>
                    {tournaments !== undefined && tournaments.map((tournament: Tournament) => (
                        <ul key={tournament.id} className={`flex flex-row items-center mt-2 p-4 font-medium text-sm text-white ${(tournament.is_expired || tournament.is_end || (tournament.max_players === tournament.player_count && !tournament.is_player_joined)) ? "opacity-10 rounded-lg bg-[#8b5cf7]" : ""}`}>
                            <li className='flex-1 flex justify-center'>{tournament.name}</li>
                            <li className='flex-1 flex justify-center items-center'>
                                <svg className='text-slate-500 mr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill={"none"}>
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M9.5 9.5L12.9999 12.9996M16 8L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {formatDate(tournament.start_date)}
                            </li>
                            <li className='flex-1 flex justify-center items-center'>
                                <svg className='text-slate-500 mr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill={"none"}>
                                    <path d="M20.774 18C21.5233 18 22.1193 17.5285 22.6545 16.8691C23.7499 15.5194 21.9513 14.4408 21.2654 13.9126C20.568 13.3756 19.7894 13.0714 19 13M18 11C19.3807 11 20.5 9.88071 20.5 8.5C20.5 7.11929 19.3807 6 18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M3.22596 18C2.47666 18 1.88067 17.5285 1.34555 16.8691C0.250089 15.5194 2.04867 14.4408 2.73465 13.9126C3.43197 13.3756 4.21058 13.0714 5 13M5.5 11C4.11929 11 3 9.88071 3 8.5C3 7.11929 4.11929 6 5.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M8.0838 15.1112C7.06203 15.743 4.38299 17.0331 6.0147 18.6474C6.81178 19.436 7.69952 20 8.81563 20H15.1844C16.3005 20 17.1882 19.436 17.9853 18.6474C19.617 17.0331 16.938 15.743 15.9162 15.1112C13.5201 13.6296 10.4799 13.6296 8.0838 15.1112Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15.5 7.5C15.5 9.433 13.933 11 12 11C10.067 11 8.5 9.433 8.5 7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5Z" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                {tournament.player_count < 0 ? "0" : tournament.player_count} / {tournament.max_players}
                            </li>
                            <li className='flex-1 flex justify-center'>
                                <button disabled={(tournament.max_players === tournament.player_count || tournament.is_expired || tournament.is_end) ? true : false} className={`flex flex-row items-center gap-1 ${(tournament.max_players === tournament.player_count || tournament.is_expired || tournament.is_end) ? 'opacity-10' : ''}`} onClick={(e) => HanldeClick(e, tournament.id, `${!tournament.is_player_joined ? "join" : ""}`)}>
                                    {tournament.is_player_joined ? (
                                        <svg className='text-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                            <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            <path d="M16 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg className='text-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill={"none"}>
                                            <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            <path d="M12 8V16M16 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                            <li className='flex-1 flex justify-center'>-</li>
                        </ul>
                    ))}

                </section>

            )}

            {pagination.count > 8 && <section className='mt-4 flex justify-center items-center'>
                <button onClick={seeMore} className='flex flex-row items-center justify-center cursor-pointer text-xs gap-2  px-[12px] py-[8px] border-slate-600 border-[0.1px] rounded-md'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} fill={"none"}>
                        <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M11.992 12H12.001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.9959 12H16.0049" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.9959 12H8.00488" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {pagination.next != null ? t('seemore') : t('seeless')}
                </button>
            </section>}
        </div>
    )
}

export default TourPage;
