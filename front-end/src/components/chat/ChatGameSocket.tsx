"use client"

import ChatGameTable from "@/components/chat/ChatGameMatch";
import React, { useState, useEffect, useRef } from 'react';
import { WebSocketContext } from "@/context/WebSocketContext"
import Avatar from "@/components/avatar"
import { UseAppContext } from "@/context/AuthContext"
import { useTranslation } from "@/hooks/useTranslation";

interface WaitingOverlayProps {
    setCancelGame: React.Dispatch<React.SetStateAction<boolean>>;
}

const LeaveOverlay: React.FC<any> = () => {

    const { t } = useTranslation()

    const handleClick = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-black  p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-2">{t('cant')}</h2>
                <p className="text-gray-600 mb-4">{t('alreadyin')}</p>
                <button className="text-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded mb-6" onClick={handleClick} >{t('back')}</button>
            </div>
        </div>
    );
};

function WaitingOverlay({ setCancelGame }: WaitingOverlayProps) {
    const handleClick = () => {
        setCancelGame(true);
    };
    const { t } = useTranslation()
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="bg-black  p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">{t('creatingam')}</h2>
                <p className="text-gray-600">{t('gamestart')}</p>
                <div className='flex flex-row justify-evenly items-center mt-4 space-x-8'>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                    <h1 className='text-xl font-extrabold'>VS</h1>
                    <section className='player'>
                        <Avatar alt='player' src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} width='w-[90px]' height='h-[90px]'   ></Avatar>
                    </section>
                </div>
                <button className="text-2xl  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded mt-12" onClick={handleClick}>{t('cancelgame')}</button>
            </div>
        </div>
    );
};

const ChatGameSocket: React.FC<any> = ({ id1, id2, gameId }) => {

    const { userLoggedIn } = UseAppContext();

    const [messages, setMessages] = useState<any>([]);
    const [socket, setSocket] = useState<any>(null);

    const [gameStart, setGameStart] = useState(false);

    const [playerID, setPlayerID] = useState('');

    const [newIds, setNewIds] = useState({ id1: '', id2: '' });

    const [cancelGame, setCancelGame] = useState(false);

    const [rejected, setRejected] = useState(false);

    useEffect(() => {
        window.addEventListener("popstate", () => {
            if (socket)  {
                socket.close();
            }
        });
      }), [];
      const ws = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (typeof window !== "undefined" && !ws.current) {
            const createSocket = () => {
                ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URI}remote/`) as WebSocket;
                const socketWs = ws.current as  WebSocket;

                socketWs.onopen = () => {
                    setSocket(ws.current);
                };
                socketWs.onmessage = (event) => {
                    setMessages((prevMessages: any) => [...prevMessages, event.data]);
                };
            };
            createSocket();
        }
    }, [])

    useEffect(() => {
        if (cancelGame) {
            if (socket) {
                socket.send("forf");
                socket.close();
                window.location.reload();
            }
        }
    }, [cancelGame])

    useEffect(() => {
        if (socket === null) return;
        if (messages) {
            let msg = messages[messages.length - 1];

            if (msg === "connected") {
                let send_msg = `chat,${gameId},${id1},${id2},${userLoggedIn}`;
                socket.send(send_msg);
            }
            else if (msg === "reject") {
                socket.close();
                setRejected(true);
            }
            else if (msg.split(",")[0] === "start") {
                setTimeout(() => {
                    setGameStart(true);
                }, 200);
            }
        }
    }, [messages])

    useEffect(() => {
        if (userLoggedIn != null)
            setPlayerID(String(userLoggedIn))
        id1 > id2 ? setNewIds({id1: id1, id2: id2}) : setNewIds({id1: id2, id2: id1});
    }, [userLoggedIn])

    if (gameStart) {
        return (
            <WebSocketContext.Provider value={{ messages, socket }}>
                <ChatGameTable playerID={playerID} gameId={gameId} newID1={newIds.id1} newID2={newIds.id2} />
            </WebSocketContext.Provider>
        );
    }
    else if (rejected) {
        return (<LeaveOverlay />)
    }
    else
        return (<WaitingOverlay setCancelGame={setCancelGame} />);
}

export default ChatGameSocket;
