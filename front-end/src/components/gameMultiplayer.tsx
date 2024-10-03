'use client'

import React, { useState, useEffect } from 'react';
import { MultiSocketContext } from '@/context/WebSocketContext';
import { useContext } from 'react';
import { UseAppContext } from '@/context/AuthContext';
import { MultiPLayerData } from '@/types/types';
import { useTranslation } from '@/hooks/useTranslation';
import Link from "next/link";

const Player = ({ name = "", username = "", imageUrl = "" }) => {
  return (
    <div className="player flex items-center space-x-4 p-4 bg-gray-800 rounded-lg shadow-lg mt-8">
      <img
        src={imageUrl}
        alt={name}
        className="w-16 h-16 rounded-full border-2 border-gray-700"
      />
      <div className="player-info flex flex-col">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="text font-bold text-gray-600">@{username}</p>
      </div>
    </div>
  );
};

const EndOverlay = ({ leftscore, rightscore, result }: { leftscore: number, rightscore: number, result: string }) => {
  const {t} = useTranslation()

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
      <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
        <a className="text-3xl font-press-start">{rightscore} - {leftscore}</a>
        <a className="text-2xl font-bold mb-4">{result}</a>
        <Link href='/game' className="text-2xl mb-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">{t('leave')}</Link>
      </div>
    </div>
  );
};

interface Player {
  id: number;
  first_name: string;
  username: string;
  image?: string;
}

interface GameInfo {
  game_id: string;
  player_1: Player;
  player_2: Player;
  player_3: Player;
  player_4: Player;
}

const TableMulti: React.FC<{ gameInfo: GameInfo | MultiPLayerData }> = ({ gameInfo }) => {

  const { userLoggedIn } = UseAppContext();
  const {t} = useTranslation()

  let topLeftData = 20;
  let topRightData = 20;
  let botLeftData = 60;
  let botRightData = 60;
  let action = '';
  
  const [gameEnded, setGameEnded] = useState(false);

  const { messages } = useContext(MultiSocketContext);
  const { socket } = useContext(MultiSocketContext);

  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  const [topLeftBarPosition, setTopLeftBarPosition] = useState(10);
  const [topRightBarPosition, setTopRightBarPosition] = useState(10);
  const [botLeftBarPosition, setBotLeftBarPosition] = useState(70);
  const [botRightBarPosition, setBotRightBarPosition] = useState(70);

  const [ballPosition, setBallPosition] = useState({ x: 49, y: 49 });

  useEffect(() => {
    if (messages) {

      const latestMessage = messages[messages.length - 1];

      if (!latestMessage) return;
      if (gameEnded) return;

      [action, topLeftData, topRightData, botLeftData, botRightData] = latestMessage.split(',');

      // if (latestMessage === 'forf') {
      //   if (socket && socket.readyState === WebSocket.OPEN)
      //     socket.close();
      //   // setForfeit(true);
      // }
      if (action === 'won') {
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.close();
        setLeftScore(topLeftData);
        setRightScore(topRightData);
        setGameEnded(true);
      }
      else if (action === 'bars') {
        setBotLeftBarPosition(Number(botLeftData));
        setBotRightBarPosition(Number(botRightData));

        setTopLeftBarPosition(Number(topLeftData));
        setTopRightBarPosition(Number(topRightData));
      }
      else if (action === 'ball') {
        setBallPosition(({
          x: Number(topLeftData),
          y: Number(topRightData)
        }));
        setLeftScore(botLeftData);
        setRightScore(botRightData);
      }    
    }
  }, [messages]);

  // useEffect(() => {
  //   if (
  //     (ballPosition.x === 3 && ballPosition.y >= topLeftBarPosition && ballPosition.y <= topLeftBarPosition + 20 && velocity.x < 0) ||
  //     (ballPosition.x === 94 && ballPosition.y >= topRightBarPosition && ballPosition.y <= topRightBarPosition + 20 && velocity.x > 0) ||
  //     (ballPosition.x === 3 && ballPosition.y >= botLeftBarPosition && ballPosition.y <= botLeftBarPosition + 20 && velocity.x < 0) ||
  //     (ballPosition.x === 94 && ballPosition.y >= botRightBarPosition && ballPosition.y <= botRightBarPosition + 20 && velocity.x > 0)
  //   )

  const [topLeftBarMoving, setTopLeftBarMoving] = useState<string | null>(null);
  const [topRightBarMoving, setTopRightBarMoving] = useState<string | null>(null);

  const [botLeftBarMoving, setBotLeftBarMoving] = useState<string | null>(null);
  const [botRightBarMoving, setBotRightBarMoving] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameEnded) return;

      if (topLeftBarMoving === 'up') socket.send(gameInfo.game_id + ',topleftUp');
      if (topLeftBarMoving === 'down') socket.send(gameInfo.game_id + ',topleftDown');

      if (topRightBarMoving === 'up') socket.send(gameInfo.game_id + ',toprightUp');
      if (topRightBarMoving === 'down') socket.send(gameInfo.game_id + ',toprightDown');

      if (botLeftBarMoving === 'up') socket.send(gameInfo.game_id + ',botleftUp');
      if (botLeftBarMoving === 'down') socket.send(gameInfo.game_id + ',botleftDown');

      if (botRightBarMoving === 'up') socket.send(gameInfo.game_id + ',botrightUp');
      if (botRightBarMoving === 'down') socket.send(gameInfo.game_id + ',botrightDown');
    }, 50);

    return () => clearInterval(interval);
  }, [topLeftBarMoving, topRightBarMoving, botLeftBarMoving, botRightBarMoving]);

  useEffect(() => {

    if (gameEnded)
      return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameEnded) return;

      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key))
        event.preventDefault();

      if (event.key === 'ArrowUp' && (gameInfo.player_1.id === String(userLoggedIn))) setTopLeftBarMoving('up');
      if (event.key === 'ArrowDown' && (gameInfo.player_1.id === String(userLoggedIn))) setTopLeftBarMoving('down');

      if (event.key === 'ArrowUp' && (gameInfo.player_2.id === String(userLoggedIn))) setTopRightBarMoving('up');
      if (event.key === 'ArrowDown' && (gameInfo.player_2.id === String(userLoggedIn))) setTopRightBarMoving('down');

      if (event.key === 'ArrowUp' && (gameInfo.player_3.id === String(userLoggedIn))) setBotLeftBarMoving('up');
      if (event.key === 'ArrowDown' && (gameInfo.player_3.id === String(userLoggedIn))) setBotLeftBarMoving('down');

      if (event.key === 'ArrowUp' && (gameInfo.player_4.id === String(userLoggedIn))) setBotRightBarMoving('up');
      if (event.key === 'ArrowDown' && (gameInfo.player_4.id === String(userLoggedIn))) setBotRightBarMoving('down');
    };

    const handleKeyUp = (event: KeyboardEvent) => {

      if (gameEnded) return;

      if (event.key === 'ArrowUp' || 'ArrowDown') {

        if (gameInfo.player_1.id == String(userLoggedIn)) setTopLeftBarMoving(null);
        if (gameInfo.player_1.id == String(userLoggedIn)) setTopLeftBarMoving(null);

        if (gameInfo.player_2.id === String(userLoggedIn)) setTopRightBarMoving(null);
        if (gameInfo.player_2.id === String(userLoggedIn)) setTopRightBarMoving(null);

        if (gameInfo.player_3.id === String(userLoggedIn)) setBotLeftBarMoving(null);
        if (gameInfo.player_3.id === String(userLoggedIn)) setBotLeftBarMoving(null);

        if (gameInfo.player_4.id === String(userLoggedIn)) setBotRightBarMoving(null);
        if (gameInfo.player_4.id === String(userLoggedIn)) setBotRightBarMoving(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


  function winners() {
    if (rightScore == 6 && (String(userLoggedIn) === String(gameInfo.player_1.id) || String(userLoggedIn) === String(gameInfo.player_3.id)))
      return t('youwon');
    else if (leftScore == 6 && (String(userLoggedIn) === String(gameInfo.player_2.id) || String(userLoggedIn) === String(gameInfo.player_4.id)))
      return t('youwon');
    else
      return t('youlost');
  }

  return (
    <>
      <div className='flex flex-col'>
        <section className='flex justify-around items-center'>
          <Player name={gameInfo.player_1.first_name} username={gameInfo.player_1.username} imageUrl={gameInfo.player_1.image ? gameInfo.player_1.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/1.jpg`}></Player>
          <h1 className='text-3xl font-extrabold'>VS</h1>
          <Player name={gameInfo.player_2.first_name} username={gameInfo.player_2.username} imageUrl={gameInfo.player_2.image ? gameInfo.player_2.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/2.jpeg`}></Player>
        </section>
        <div className='flex justify-start -mt-36'>
          <div className="Table text-white shadow-2xl  shadow-[#5b21b6]/50 border-2 border-[#5b21b6] ">
            <div className="middleLine"></div>
            <div className="middleCircle"></div>
            <div className="leftBar bg-gradient-to-r from-cyan-500 to-blue-500" style={{ top: `${topLeftBarPosition < 1.5 ? 1.5 : topLeftBarPosition > 25 ? 25 : topLeftBarPosition}%` }}></div>
            <div className="rightBar bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${topRightBarPosition < 1.5 ? 1.5 : topRightBarPosition > 30 ? 30 : topRightBarPosition}%` }}></div>
            <div className="leftBar1 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${botLeftBarPosition < 48 ? 48 : botLeftBarPosition > 76 ? 76 : botLeftBarPosition}%` }}></div>
            <div className="rightBar1 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${botRightBarPosition < 55 ? 55 : botRightBarPosition > 76 ? 76 : botRightBarPosition}%` }}></div>
            <div className="Ball" style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}></div>
            <div className="leftScore">{leftScore}</div>
            <div className="rightScore">{rightScore}</div>
            {gameEnded && (gameEnded && (<EndOverlay leftscore={leftScore} rightscore={rightScore} result={winners()} />))}
          </div>
        </div>
        <section className='flex justify-around items-center mt-[10rem]'>
          <Player name={gameInfo.player_3.first_name} username={gameInfo.player_3.username} imageUrl={gameInfo.player_3.image ? gameInfo.player_3.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/3.jpg`}></Player>
          <h1 className='text-3xl font-extrabold'>VS</h1>
          <Player name={gameInfo.player_4.first_name} username={gameInfo.player_4.username} imageUrl={gameInfo.player_4.image ? gameInfo.player_4.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/4.jpg`}></Player>
        </section>
      </div>
    </>
  );
}

export default TableMulti;
