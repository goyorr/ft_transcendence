'use client'

import React, { useState, useEffect } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';
import { useContext } from 'react';
import AxiosInstance from '@/utils/axiosInstance';
import { getCookie } from "cookies-next";
import { UseAppContext } from "@/context/AuthContext"
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const EndOverlay = ({leftscore, rightscore, result}: {leftscore: String, rightscore: String, result: string}) => {
  const {t} = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
    <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
      <a className="text-3xl font-press-start">{rightscore} - {leftscore}</a>
      <a className="text-2xl font-bold mb-4">{result}</a>
      <Link className="text-2xl mb-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" href="/game/">{t('leave')}</Link>
    </div>
  </div>
  );
};

const update = async ({player1, player2, winnerScore, loserScore, win_id, lose_id}: {player1: String, player2: String, winnerScore: Number, loserScore: Number, win_id: String, lose_id: String} ) =>
  {
    try{
      await AxiosInstance(`/api/v1/update_history`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${getCookie('access')}`
        },
        data: {
          player: player1,
          opponent: player2,
          Winner_scr: winnerScore,
          Loser_scr: loserScore,
          mode: "remote",
          type_game: "friendly",
          winner_id: win_id,
          loser_id: lose_id
        }
      })
    }
    catch(e)
    {
      
    }
}

const Table = ( {gameId}: {gameId: String} ) => {

  let leftData = 40;
  let rightData = 40;
  let leftScoreData = 0;
  let rightScoreData = 0;
  let dummyParam = '';
  
  const { messages } = useContext(WebSocketContext); 
  const { socket } = useContext(WebSocketContext);``

  const { userLoggedIn } = UseAppContext();
  
  const [scores, setScores] = useState({winnerScore: -1, loserScore: -1})
  const [win_loss, setWinLoss] = useState({win: '', lose: ''})

  const [gameEnded, setGameEnded] = useState(false);
  const [forfeit, setForfeit] = useState(false);

  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  
  const [leftBarPosition, setLeftBarPosition] = useState(40);
  const [rightBarPosition, setRightBarPosition] = useState(40);
  
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });

  const [leftBarMoving, setLeftBarMoving] = useState('');
  const [rightBarMoving, setRightBarMoving] = useState('');

  useEffect(() => {
    if (gameEnded && gameId !== String(userLoggedIn)) {
      update({
        player1: gameId,
        player2: String(userLoggedIn),
        winnerScore: scores.winnerScore,
        loserScore: scores.loserScore,
        win_id: String(win_loss.win),
        lose_id: String( win_loss.lose),
      });
    }
  }, [gameEnded]);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
  
    if (!latestMessage) return;
    if (gameEnded || forfeit) return;

    [dummyParam, leftData, rightData, leftScoreData, rightScoreData] = latestMessage.split(',');
    if (latestMessage === 'forf') {
      if (socket && socket.readyState === WebSocket.OPEN)
        socket.close();
      setForfeit(true);
    }
    if (dummyParam === 'won') {
      if (socket && socket.readyState === WebSocket.OPEN)
        socket.close();
      setLeftScore(leftData);
      setRightScore(rightData);

      if (leftData >= 6 && gameId !== String(userLoggedIn)) {
        setWinLoss({win: String(gameId), lose: String(String(userLoggedIn))});
        setScores({winnerScore: leftData, loserScore: rightData});
      }
      else if (rightData >= 6 && gameId !== String(userLoggedIn)) {
        setWinLoss({win: String(String(userLoggedIn)), lose: String(gameId)});
        setScores({winnerScore: rightData, loserScore: leftData});
      }

      setGameEnded(true);
    }
    else if (dummyParam === 'bars') {
      setLeftBarPosition(Number(leftData));
      setRightBarPosition(Number(rightData));
    }
    else if (dummyParam === 'ball') {
      setBallPosition(({
        x: Number(leftData),
        y: Number(rightData)
      }));
      setLeftScore(leftScoreData);
      setRightScore(rightScoreData);
    }      
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameEnded || forfeit) return;

      if (leftBarMoving === 'up') socket.send(gameId + ',leftUp');
      if (leftBarMoving === 'down') socket.send(gameId + ',leftDown');
      if (rightBarMoving === 'up') socket.send(gameId + ',rightUp');
      if (rightBarMoving === 'down') socket.send(gameId + ',rightDown');
    }, 50);
  
    return () => clearInterval(interval);
  }, [leftBarMoving, rightBarMoving]);
  
  useEffect(() => {

    if (gameEnded || forfeit) {
      return ;
    }

    const handleKeyDown = (event: any) => {
      if (gameEnded || forfeit) return;

      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key))
        event.preventDefault();

      if (event.key === 'ArrowUp'   && String(userLoggedIn) === gameId) setRightBarMoving('up');
      if (event.key === 'ArrowDown' && String(userLoggedIn) === gameId) setRightBarMoving('down');
      if (event.key === 'ArrowUp'   && String(userLoggedIn) !== gameId) setLeftBarMoving('up');
      if (event.key === 'ArrowDown' && String(userLoggedIn) !== gameId) setLeftBarMoving('down');
    };
  
    const handleKeyUp = (event: any) => {
      if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && String(userLoggedIn) === gameId) setRightBarMoving('');
      if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && String(userLoggedIn) !== gameId) setLeftBarMoving('');
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className='flex flex-col'>
      <div className='flex justify-start mt-[6rem]'>
      <div className="Table text-white shadow-2xl  shadow-[#5b21b6]/50 border-2 border-[#5b21b6] ">
        <div className="middleLine"></div>
        <div className="middleCircle"></div>
        <div className="leftBar bg-gradient-to-r from-cyan-500 to-blue-500" style={{ top: `${leftBarPosition < 2 ? 2 : leftBarPosition > 76 ? 76 : leftBarPosition}%`}}></div>
        <div className="rightBar bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${rightBarPosition < 2 ? 2 : rightBarPosition > 76 ?76 : rightBarPosition}%`}}></div>
        {!gameEnded && <div className="Ball" style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}></div>}
        <div className="leftScore">{leftScore}</div>
        <div className="rightScore">{rightScore}</div>
        {gameEnded && <EndOverlay rightscore={String(rightScore)} leftscore={String(leftScore)} result='Game Over'/>}
        {forfeit && <EndOverlay rightscore={String(rightScore)} leftscore={String(leftScore)} result='Game Over'/>}
      </div>
    </div>
  </div>
  );
};

export default Table;
