'use client'

import React, { useEffect, useState } from 'react'
import Image from "next/legacy/image"
import { Button } from "@/components/ui/button"
import { IoMdPersonAdd } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { useRouter } from 'next/navigation'
import { getCookie } from "cookies-next";
import { UseAppContext } from "@/context/AuthContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IProfile, PlayerAchievement } from "@/types/types"
import AxiosInstance from '@/utils/axiosInstance'
import { AvatarImage, Avv } from '@/components/ui/avatar'
import { useTranslation } from '@/hooks/useTranslation'
import Default from "../../../../../public/images/covers/default.jpg"
import { toast } from 'sonner';

const Achievement: React.FC<PlayerAchievement> = ({ date_awarded, achievement_name_display }) => {

    const HmainRedable = (date_awarded: string): string => {
        const date = new Date(date_awarded)
        return date.toLocaleDateString()
    }

    return (
        <>

            <div className="backdrop-blur-xl bg-black/30 p-2 flex flex-row items-center rounded-lg mt-2 gap-4 sm:min-w-[28rem] border-[#6d28d9]  pl-4 shadow-inner shadow-[#6d28d9]/50">
                <section className="bg-[#fde68a] text-[#f59e0b] p-2 rounded-lg">
                    <GiAchievement size={30}></GiAchievement>
                </section>
                <section className="flex flex-col">
                    <p className="text-[12px] font-extrabold text-white ">{achievement_name_display}</p>
                    <h4 className='text-slate-500 text-xs'>{HmainRedable(date_awarded)}</h4>
                </section>
            </div>
        </>
    )

}

const RenderButtons: React.FC<any> = ({ same_user, alreadySend, acceptFriend, sendRequest, id, user_logged, setalreadySend, setIs_friend, socket, Is_friend, setacceptFriend }) => {

    const router = useRouter()
    const access = getCookie("access")

    const [loading,setLoading] = useState<boolean>(false)

    const { t } = useTranslation()
    const { showSetting, setShowSetting, setShowBlocks } = UseAppContext()

    const remove_request = async () => {
        try {
            setLoading(true)
            const response = await AxiosInstance("/api/v1/requests",
                {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        to_user: id
                    }
                })

            if (response.status !== 400) {
                if (socket !== null) {
                    setLoading(false)
                    socket.send(JSON.stringify({ 'type': 'send_event', 'action': 'cancel_request', 'to_user': id, 'from_user': user_logged }))
                }
                setalreadySend(false)
            }
        }

        catch (e) {
            setLoading(true)
            toast.error(t('erroroccurred'))
        }
    }

    const accept_request = async () => {
        const access = getCookie("access")
        setLoading(false)
        try {
            setLoading(false)
            const response = await AxiosInstance("/api/v1/accept_request", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ from_user_id: id })
            })

            const data = await response.data

            if (response.statusText === 'OK' && data.accept === true) {
                setIs_friend(true)
                setacceptFriend(false)
                const notification = {
                    from_user: user_logged,
                    to_user: id,
                    created_at: new Date(),
                    type_notification: "accept",
                    is_read: false
                }

                if (socket) {
                    setLoading(false)
                    socket.send(JSON.stringify(notification))
                }
            }

        }
        catch (e) {
            setLoading(true)
            toast.error(t('erroroccurred'))
        }
    }


    const unfriend = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.preventDefault()

        try {
            setLoading(true)
            const response = await AxiosInstance("/api/v1/unfriend", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ id })
            })

            const data = await response.data

            if (response.statusText === 'OK' && data.remove === "success") {
                if (socket !== null) {
                    setLoading(false)
                    socket.send(JSON.stringify({ 'type': 'send_event', 'action': 'unfriend', 'to_user': id, 'from_user': user_logged }))
                }
                setIs_friend(false)
            }
        }
        catch (e) {
            setLoading(true)
            toast.error(t('erroroccurred'))
        }
    }

    const block_user = async () => {
        try {
            setLoading(true)
            const response = await AxiosInstance("/api/v1/block", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ profile_id: id })
            })

            const data = await response.data
            if (data.is_block) {
                setLoading(false)
                router.push('/game')
            }
        }
        catch (error: any) {
            setLoading(true)
            if (error.response) {
                const status = error.response.status;

                if (status === 400) {

                    toast.error(t('badrequest'))
                } else if (status === 404) {
                    toast.error(t('userNotFound'))
                } else if (status === 409) {
                    toast.error(t('alreadyblocked'))
                } else if (status === 500) {
                    toast.error(t('servererror'))
                } else {
                    toast.error(t('unexpectederror'))
                }
            } else if (error.request) {
                toast.error(t('networkerror'))
            } else {
                toast.error(t('error'))
            }
        }
    }

    const settings = () => {
        setShowSetting(true)
        setShowSetting(!showSetting)
    }

    const block_list = () => {
        setShowBlocks((prev: boolean) => !prev)
    }

    return <>
        {
            same_user ? (
                <>
                    <Button onClick={settings} className="bg-[#2563eb] flex flex-row items-center text-white gap-2 hover:bg-[#5B21B6]">
                        <svg className='text-white' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"}>
                            <path d="M5.18007 15.2964C3.92249 16.0335 0.625213 17.5386 2.63348 19.422C3.6145 20.342 4.7071 21 6.08077 21H13.9192C15.2929 21 16.3855 20.342 17.3665 19.422C19.3748 17.5386 16.0775 16.0335 14.8199 15.2964C11.8709 13.5679 8.12906 13.5679 5.18007 15.2964Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 7C14 9.20914 12.2091 11 10 11C7.79086 11 6 9.20914 6 7C6 4.79086 7.79086 3 10 3C12.2091 3 14 4.79086 14 7Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M19.6221 4.56564C19.8457 4.32342 19.9574 4.20232 20.0762 4.13168C20.3628 3.96123 20.7157 3.95593 21.0071 4.1177C21.1279 4.18474 21.2431 4.30244 21.4735 4.53783C21.7039 4.77322 21.8192 4.89092 21.8848 5.01428C22.0431 5.31194 22.038 5.67244 21.8711 5.96521C21.8019 6.08655 21.6834 6.20073 21.4463 6.4291L18.6252 9.14629C18.1759 9.57906 17.9512 9.79545 17.6704 9.90512C17.3896 10.0148 17.081 10.0067 16.4636 9.99057L16.3796 9.98838C16.1917 9.98346 16.0977 9.98101 16.0431 9.91901C15.9885 9.85702 15.9959 9.7613 16.0108 9.56985L16.0189 9.4659C16.0609 8.92706 16.0819 8.65765 16.1871 8.41547C16.2923 8.17328 16.4738 7.97664 16.8368 7.58335L19.6221 4.56564Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        {t('editprofile')}
                    </Button>
                    <Button onClick={block_list} className='blocked border-[0.1px] hover:bg-transparent text-[#f87171] bg-transparent font-extrabold'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                            <path d="M4 6H20" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 12H20" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 18H20" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </>
            ) : alreadySend ? (
                <>
                    <Button disabled={loading} onClick={remove_request} className="bg-[#2563eb] flex flex-row items-center text-white gap-2 hover:bg-[#5B21B6]">
                        <svg className='text-white' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                            <path d="M15 9L9 14.9996M15 15L9 9.00039" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        {t('cancelrequest')}
                    </Button>
                    <Button  className='blocked border-[0.1px] hover:bg-transparent text-[#f87171] bg-transparent font-extrabold ' onClick={block_user} >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                            <path d="M13 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.97679 14.053 10.8425 13.6575 13.5 14.2952" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M16.05 16.05L20.95 20.95M22 18.5C22 16.567 20.433 15 18.5 15C16.567 15 15 16.567 15 18.5C15 20.433 16.567 22 18.5 22C20.433 22 22 20.433 22 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </Button>
                </>

            ) : acceptFriend ? (

                <>
                    <Button disabled={loading} onClick={accept_request} className="bg-[#2563eb] flex flex-row items-center text-white gap-2 hover:bg-[#5B21B6]">
                        <IoMdPersonAdd size={22}></IoMdPersonAdd>
                        {t('confirmrequest')}
                    </Button>
                    <Button className='blocked border-[0.1px] hover:bg-transparent text-[#f87171] bg-transparent font-extrabold ' onClick={block_user} >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                            <path d="M13 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.97679 14.053 10.8425 13.6575 13.5 14.2952" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M16.05 16.05L20.95 20.95M22 18.5C22 16.567 20.433 15 18.5 15C16.567 15 15 16.567 15 18.5C15 20.433 16.567 22 18.5 22C20.433 22 22 20.433 22 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </Button>
                </>


            ) : Is_friend ? (
                <>
                    <Button disabled={loading} onClick={(e) => unfriend(e, id)} className="bg-[#2563eb] flex flex-row items-center text-white gap-2 hover:bg-[#5B21B6]">
                        <IoMdPersonAdd size={22}></IoMdPersonAdd>
                        {t('unfriend')}
                    </Button>
                    <Button className='block_user  border-[0.1px] hover:bg-transparent text-[#f87171] bg-transparent font-extrabold ' onClick={block_user} >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                            <path d="M13 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.97679 14.053 10.8425 13.6575 13.5 14.2952" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M16.05 16.05L20.95 20.95M22 18.5C22 16.567 20.433 15 18.5 15C16.567 15 15 16.567 15 18.5C15 20.433 16.567 22 18.5 22C20.433 22 22 20.433 22 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </Button>
                </>
            ) : (<>
                <Button disabled={loading} onClick={(e) => sendRequest(e, id)} className="bg-[#2563eb] flex flex-row items-center text-white gap-2 hover:bg-[#5B21B6]">
                    <IoMdPersonAdd size={22}></IoMdPersonAdd>
                    {t('sendrequest')}
                </Button>
                <Button className='block_user  border-[0.1px] hover:bg-transparent text-[#f87171] bg-transparent font-extrabold ' onClick={block_user} >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"}>
                        <path d="M13 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453365 18.0441 4.1628 16.324 5.57757 15.4816C7.97679 14.053 10.8425 13.6575 13.5 14.2952" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M16.05 16.05L20.95 20.95M22 18.5C22 16.567 20.433 15 18.5 15C16.567 15 15 16.567 15 18.5C15 20.433 16.567 22 18.5 22C20.433 22 22 20.433 22 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </Button>

            </>)
        }
    </>
}


const Header: React.FC<IProfile> = ({ user_logged, id, username, last_name, first_name, image, friends, same_user, isBlocker, isBlocked, cover_image }) => {

    const { socket, userLoggedIn, typeRequest } = UseAppContext()

    const [loading, setLoading] = useState<boolean>(false)

    const { t } = useTranslation()

    const [achievemenets, setAchievements] = useState<PlayerAchievement[]>([])

    const router = useRouter()


    const getAchievements = async () => {

        try {
            const response = await AxiosInstance(`/api/v1/listachievement/${id}`,
                {
                    method: "GET",
                    headers:
                    {
                        'Authorization': `Bearer ${getCookie('access')}`
                    }
                }
            )

            if (response.statusText === 'OK') {
                const data = await response.data
                setAchievements(data.results)
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }

    useEffect(() => {
        getAchievements()
    }, [])

    const [alreadySend, setalreadySend] = useState<boolean>(false)
    const [acceptFriend, setacceptFriend] = useState<boolean>(false)
    const [Is_friend, setIs_friend] = useState<boolean>(false)

    const sendRequest = async (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        e.preventDefault()

        const access = getCookie("access")

        const notification = {
            from_user: user_logged,
            to_user: id,
        }

        try {
            const response = await AxiosInstance("/api/v1/send_request", {
                method: "POST",
                headers:
                {
                    "Authorization": `Bearer ${access}`,
                    "Content-Type": 'application/json'
                },
                data: notification
            }
            );

            if (response.statusText === 'Created' && response.status === 201) {
                const data = await response.data
                setalreadySend(true)
                const notification = {
                    from_user: data.from_user,
                    to_user: data.to_user,
                    message: '',
                    created_at: new Date(),
                    type_notification: "request",
                    is_read: false
                }
                if (socket) {
                    socket.send(JSON.stringify(notification))
                }
            }
            else {
                toast.error(t('erroroccurred'))
            }

        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status === 400) {
                    toast.error(t('badrequest'))
                } else if (error.response.status === 500) {
                    toast.error(t('servererror'))
                } else {
                    toast.error(t('unexpectederror'))
                }
            } else if (error.request) {
                toast.error(t('networkerror'))
            } else {
                toast.error(t('error'))
            }
        }
    }

    useEffect(() => {
        if (typeRequest !== null) {
            if (typeRequest.type === 'send_event') {
                if (typeRequest.action === 'unfriend') {
                    if (typeRequest.from_user === id && typeRequest.to_user === userLoggedIn) {
                        setIs_friend(false)
                    }
                }
                if (typeRequest.action === 'cancel_request') {
                    if (typeRequest.from_user === id && typeRequest.to_user === userLoggedIn) {
                        setacceptFriend(false)
                        setalreadySend(false)
                    }
                }
            }
            else if (id === typeRequest.to_user) {
                if (typeRequest.type === 'request') {
                    setacceptFriend(true)
                }
                else if (typeRequest.type === 'accept') {
                    setacceptFriend(false)
                    setalreadySend(false)
                    setIs_friend(true)
                }
            }
        }
    }, [typeRequest])

    const fetchRequests = async () => {

        try {
            setLoading(true)
            const respose = await AxiosInstance(`api/v1/getFriendLogic/${id}`, {
                method: "GET",
                headers: {
                    'authorization': `Bearer ${getCookie('access')}`
                }
            })

            if (respose.status === 200) {
                const data = respose.data
                setLoading(false)
                if (data.role === 'receiver') {
                    setalreadySend(false)
                    setIs_friend(false)
                    setacceptFriend(true)
                }
                if (data.role === 'sender') {
                    setalreadySend(true)
                    setacceptFriend(false)
                    setIs_friend(false)
                }
            }
        }
        catch (error: any) {
            setLoading(false)
            if (error.response) {
                const { status } = error.response;
                if (status === 400) {
                    toast.error(t('badrequest'));
                } else if (status === 404) {
                    toast.error(t('Friendrequestsnotfound'));
                } else {
                    toast.error(t('unexpectederror'));
                }
            } else if (error.request) {
                toast.error(t('networkerror'));
            } else {
                toast.error(t('error'));
            }
        }
    }

    useEffect(() => {
        if (friends.length > 0) {
            setIs_friend(friends.map((friend: any) => friend.id).includes(user_logged))
        }
        fetchRequests()
    }, [])

    useEffect(() => {
        if (isBlocker || isBlocked) {
            router.push(`/profile/${userLoggedIn}`);
        }
    }, [isBlocker, isBlocked, userLoggedIn, router]);

    return (
        <div className='header'>
            <div className='w-full min-h-[18rem] absolute bg-gradient-to-b from-[#1d4ed8] left-0 -z-10'>
            </div>
            <section className="flex flex-col w-full h-full  -mt-[1rem]">
                <section className="relative mt-8 flex flex-col lg:flex-row">
                    <section className="w-full min-h-64 rounded-lg ">
                        <section className="w-full h-full">
                            <Image
                                className="rounded-lg"
                                objectPosition="center"
                                objectFit="cover"
                                layout="fill"
                                src={cover_image !== null ? cover_image : Default}
                                alt="cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </section>
                    </section>
                </section>
                <section className="avatar flex lg:flex-row lg:justify-between flex-col gap-2">
                    <section className="flex flex-row px-2 gap-4">
                        <Avv className='w-[120px] h-[120px] relative -mt-[4rem] border-[4px] border-[#020617] rounded-full'>
                            <AvatarImage src={`${image !== null ? `${image}` : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`}`} />
                        </Avv>
                        <section className="mt-4 flex flex-col">
                            <h1 className="text-lg font-extrabold sm:text-2xl">{first_name && first_name[0]?.toUpperCase()}{first_name && first_name.slice(1)} {last_name && last_name[0].toUpperCase()}{last_name && last_name.slice(1)}</h1>
                            <h1 className="text-xs text-slate-500">@{username}</h1>
                            <h1 className="text-md font-extrabold text-[#CCCCCC] mt-2">{friends.length} {t('friends')}</h1>
                            {userLoggedIn != null && loading === false && (
                                <section className="flex flex-row items-center gap-4 mt-4">
                                    <RenderButtons same_user={same_user} alreadySend={alreadySend} acceptFriend={acceptFriend} sendRequest={sendRequest} id={id} user_logged={user_logged} setalreadySend={setalreadySend} setIs_friend={setIs_friend} socket={socket} Is_friend={Is_friend} setacceptFriend={setacceptFriend}></RenderButtons>
                                </section>
                            )}
                        </section>
                    </section>
                    <section>
                        {achievemenets.length > 0 && <>
                            <h1 className="font-medium text-white mt-4 text-[14px]">{t('lastacheiv')}</h1>
                            <ScrollArea className="flex flex-col gap-2 h-[200px]  rounded-md ">
                                {achievemenets.map(((achievement, index) => (
                                    <section key={index}>
                                        <Achievement {...achievement}></Achievement>
                                    </section>
                                )))}
                            </ScrollArea>
                        </>}
                    </section>
                </section>
            </section>
        </div>
    )
}

export default Header
