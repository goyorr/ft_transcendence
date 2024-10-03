'use client'

import { useContext, useEffect, useState } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';
import Table from './gameTableRemote'; 
import { UseAppContext } from "@/context/AuthContext"
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from "sonner";

let gameID = '';

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

const MatchMaking = () => {

    const router = useRouter();

    const {t} = useTranslation();

    const { userLoggedIn } = UseAppContext();
    const { messages } = useContext(WebSocketContext);
    const { socket } = useContext(WebSocketContext);
    const [gameStarted, setGameStarted] = useState(false);

    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        window.addEventListener("popstate", () => {
            
            if (socket)  {
                socket.close();
            }
        });
      }), [];

    // useEffect(() => {
    //     const handleBeforeUnload = (event) => {
    //       // Custom message for browsers that support it
    //       const message = "Are you sure you want to leave this page?";
    //       event.returnValue = message; // For most browsers
    //       return message; // For some older browsers
    //     };
    
    //     // Add the event listener
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    
    //     // Cleanup the event listener on component unmount
    //     return () => {
    //       window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    //   }, []);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage === 'start')
            setGameStarted(true);
        else if (latestMessage && latestMessage.split(',')[0] === 'joined') {
            gameID = latestMessage.split(',')[1];
            setWaiting(true);
        }
        else if (latestMessage === 'connected')
            socket.send(`join,${userLoggedIn}`);
        else if (latestMessage === 'reject') {
            socket.close();
            toast.info(t('inque'));
            router.push('/game');
        }
    }, [messages]);

    if (gameStarted)
        return <Table gameId={gameID} />;
    if (waiting)
        return (<WaitingOverlay />);
    else
        return (
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          );
};

export default MatchMaking;
