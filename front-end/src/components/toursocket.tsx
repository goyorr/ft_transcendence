"use client"

import TournamentMatch from "@/components/tournamentMatch";
import React, {useState, useEffect, useRef } from 'react';
import {TourSocketContext} from "@/context/WebSocketContext"
import { getCookie } from "cookies-next";
import AxiosInstance from "@/utils/axiosInstance";
import { UseAppContext } from "@/context/AuthContext"
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

// const WaitingOverlay = () => {
    
//     const {t} = useTranslation()

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
//             <div className="bg-black  p-8 rounded-lg shadow-lg text-center">
//                 <h2 className="text-2xl font-bold mb-4">{t('waitingplayer')}</h2>
//                 <p className="text-gray-600">{t('paragraphwiting')}</p>

//                 <div className='flex flex-row justify-evenly items-center mt-4'>
//                     <section className='player'>
//                         <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
//                     </section>
//                     {/* <h1 className='text-xl font-extrabold'>VS</h1> */}
//                     <h1 className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500'></h1>
//                     <section className='player'>
//                         <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
//                     </section>
//                 </div>
//             </div>
//         </div>
//     );
// };

const WaitingOverlay = () => {
    const {t} = useTranslation()
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50 -mt-20">
            <div className="p-8 rounded-lg shadow-lg text-center">
                <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">{t('playerwaiting')}</h2>
                    <p className="text-gray-600">{t('paragraphwiting')}</p>
                </div>
                <div className='flex flex-row justify-evenly items-center mt-4'>
                    <div className="waitninganimation">
                        <div className="waitninganimationball"></div>
                        <div className="waitninganimationball"></div>
                        <div className="waitninganimationball"></div>
                        <div className="waitninganimationball"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const TourSocket:React.FC<any> = ( {...ids} ) => {

    const { userLoggedIn } = UseAppContext();

    const updatePlayed = async () =>
        {
          try{
                await AxiosInstance(`/api/v1/update_is_played/${ids.match_id}`,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${getCookie('access')}`
                    },
                    data: {
                        is_played: true
                    }
                })
          }
          catch(e)
          {
          }
        }

    const [messages, setMessages] = useState<any>([]);
    const [socket, setSocket] = useState<any>(null);
    
    const [gameStart, setGameStart] = useState(false);
    
    const [playerID, setPlayerID] = useState('');
    

    // useEffect(() => {
        //     if (typeof window !== "undefined" && !ws.current) {
    //         const createSocket = () => {
    //             ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URI}tournament/`) as WebSocket;
    //             const socketWs = ws.current as  WebSocket;

    //             socketWs.onopen = () => {
    //                 setSocket(ws.current);
    //             };
    //             socketWs.onmessage = (event) => {
    //                 setMessages((prevMessages: any) => [...prevMessages, event.data]);
    //             };
    //         };
    //         createSocket();
    //     }
    // }, [])

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && !ws.current) {
                ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URI}tournament/`) as WebSocket;
                const socketWs = ws.current as  WebSocket;

                socketWs.onopen = () => {
                    setSocket(ws.current);
                };
                socketWs.onmessage = (event) => {
                    setMessages((prevMessages: any) => [...prevMessages, event.data]);
                };
        }
        return undefined
    },[])

    useEffect(() => {
        if (socket === null) return;
        if (messages) {
            let msg = messages[messages.length - 1];

            if (msg === "connect") {
                let msg = `join,${String(ids.match_id)},${String(ids.id1)},${String(ids.id2)},${String(userLoggedIn)}`;
                socket.send(msg);
            }
            else if (msg.split(",")[0] === "start") {
                updatePlayed();
                // setTimeout(() => {
                    setGameStart(true);
                // }, 1500);
            }
            else if (msg === 'reject') {
                toast.info('You\'re already in game/waiting for opponent');
                if (socket && socket.readyState === 1) {
                    socket.close();
                }
                window.location.reload();
            }
        }
    }, [messages])

    useEffect(() => {
        if (userLoggedIn !== null)
            setPlayerID(userLoggedIn);
    }, [userLoggedIn])

    if (gameStart) {
        return (
                <TourSocketContext.Provider value={{ messages, socket }}>
                    <TournamentMatch playerID={playerID} {...ids}  />
                </TourSocketContext.Provider>
        );
    }
    else
        return (
            <WaitingOverlay />
        );
}

export default TourSocket;
