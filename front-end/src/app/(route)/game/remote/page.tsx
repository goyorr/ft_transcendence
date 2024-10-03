"use client"

import MatchMaking from "@/components/matchMaking";
import React, {useState, useEffect, useRef } from 'react';
import {WebSocketContext} from "@/context/WebSocketContext"
import { UseAppContext } from "@/context/AuthContext";


function Mode() {

    const [messages, setMessages] = useState<any>([]);
    const [socket, setSocket] = useState<any>(null);

    const {setToggleBox} = UseAppContext()
    
    const ws = useRef<WebSocket | null>(null);
    useEffect(() =>
    {
        if (typeof window !== "undefined" && !ws.current)
        {
                ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URI}remote/`) as WebSocket;
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

    useEffect(() =>
    {
        setToggleBox(false)
    },[])
    return (
        <>
            <WebSocketContext.Provider value={{ messages, socket }}>
                 <MatchMaking />
             </WebSocketContext.Provider>
        </>
    );
}

export default Mode;
