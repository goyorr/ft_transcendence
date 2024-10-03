'use client'

import { useEffect, useState } from 'react';
import { MultiSocketContext } from '@/context/WebSocketContext';
import TableMulti from './gameMultiplayer'; 
import { useRouter } from 'next/navigation'
import Avatar from '@/components/avatar';
import { UseAppContext } from '@/context/AuthContext';
import AxiosInstance from '@/utils/axiosInstance';
import { getCookie } from 'cookies-next';
import { MultiPLayerData } from '@/types/types';
import { useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

const WaitingOverlay = () => {

    const { t } = useTranslation();

    const {setToggleBox} = UseAppContext()

    useEffect(() =>
    {
        setToggleBox(false)
    },[])
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-black  p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">{t('playerwaiting')}</h2>
                <p className="text-gray-600">{t('playerjoinmulti')}</p>

                <div className='flex flex-row justify-evenly items-center mt-4 gap-8'>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/1.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                    <h1 className='text-xl font-extrabold'>VS</h1>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/2.jpeg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                    <h1 className='text-xl font-extrabold'>VS</h1>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/3.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                    <h1 className='text-xl font-extrabold'>VS</h1>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/4.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                </div>
            </div>
        </div>
    );
};

const MultiMatchMaking = () => {

    const { userLoggedIn } = UseAppContext();
    const { t } = useTranslation();
    const [game, setGame] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [messages, setMessages] = useState<any>([]);
    const [socket, setSocket] = useState<any>(null);
    const router = useRouter();
    const access = getCookie('access')

    const [gameInfo, setGameInfo] = useState<MultiPLayerData>();

    //if resposne is 202 "You are already in a game" redirect to /game.
    const joinMatchMaking = async () => {
        try {
            const response = await AxiosInstance(`/api/v1/Create_join_multiplayer`, {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            })
            if (response.status === 202) {
                // router.push('/game/')
            }
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }
    const clean_up = async () => {
        try {
            await AxiosInstance(`/api/v1/clean_multiplayer`, {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            })
        }
        catch (e) {
            toast.error(t('erroroccurred'))
        }
    }
        
    useEffect(() => {
        joinMatchMaking();
    }, [])

    const [waiting, setWating] = useState(true);

    const retieveTour = async () => {
        try {
            const response = await AxiosInstance(`/api/v1/start_game`, {
                method: "GET",
                headers:
                {
                    'Authorization': `Bearer ${access}`
                }
            })
            if (response.status === 200) {
                const data = await response.data
                setGameInfo(data.game)
                setWating(false);
            }
        }
        catch (e) {
           toast.error(t('erroroccurred'))
        }
    }

    const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      intervalId.current = setInterval(() => {
        if (!waiting) {
          clearInterval(intervalId.current as NodeJS.Timeout);
          setGame(true);
        } else if (waiting) {
          retieveTour();
        }
      }, 1500);
    
      return () => {
        clearInterval(intervalId.current as NodeJS.Timeout);
      };
    }, [waiting]);

    useEffect(() => {
    if (game) {

        clean_up();
        setTimeout(() => {
        }, 200);

        if (typeof window !== "undefined") {
            const createSocket = () => {
                const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URI}multi/`);

                socket.onopen = () => {
                    if (socket && socket.readyState === WebSocket.OPEN)
                        setSocket(socket);
                };  
                socket.onmessage = (event) => {
                    setMessages((prevMessages:any) => [...prevMessages, event.data]);
                };
            };
            createSocket();
        }
        }
    },[game])

    useEffect(() => {
        const latestMessage = messages[messages.length - 1];

        if (latestMessage != undefined) {
        if (latestMessage === 'connect') {
            let msg = `join,${gameInfo?.game_id},${userLoggedIn}`;
            socket.send(msg);
        }
        else if (latestMessage === 'leave') {
            router.push('./');
            setGameStarted(false);
        }
        else if (latestMessage && latestMessage.split(',')[0] === 'start')
            setGameStarted(true);
        else if (latestMessage && latestMessage === 'missing') {
            if (socket)
                socket.close();
            setSocket(null);
            setGame(false);
            setWating(true);
            joinMatchMaking();
        }
    }
            
        }, [messages]);

        if (gameStarted && gameInfo) {
            return (
                <MultiSocketContext.Provider value={{ messages, socket }}>
                    <TableMulti gameInfo={gameInfo} />;
                </MultiSocketContext.Provider>
            );
        }
        else
            return <WaitingOverlay />;
};

export default MultiMatchMaking;
