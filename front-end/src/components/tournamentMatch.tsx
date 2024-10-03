'use client'

import React, { useState, useEffect } from 'react';
import { TourSocketContext } from '@/context/WebSocketContext';
import { useContext } from 'react';
import { getCookie } from "cookies-next";
import AxiosInstance from '@/utils/axiosInstance';
import { UseAppContext } from '@/context/AuthContext';
import  { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

const Player = ({ name = "", nickname = "", imageUrl = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg` }) => {
  return (
    <div className="player flex items-center space-x-4 p-4 bg-gray-800 rounded-lg shadow-lg mt-8">
      <img
        src={imageUrl}
        alt={name}
        className="w-16 h-16 rounded-full border-2 border-gray-700"
        />
      <div className="player-info flex flex-col">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="text font-bold text-gray-600">@{nickname}</p>
      </div>
    </div>
  );
};

const EndOverlay = ({leftscore, rightscore, result}: {leftscore: string, rightscore: string, result: string}) => {
  const {t} = useTranslation();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
    <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
      <a className="text-3xl font-press-start">{leftscore} - {rightscore}</a>
      <a className="text-2xl font-bold mb-4">{result}</a>
      <button className="text-2xl mb-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={() => {window.location.reload()}}>{t('leave')}</button>
    </div>
  </div>
  );
};

const TournamentMatch:React.FC<any> = ( {playerID, ...ids}) => {

  const { userLoggedIn } = UseAppContext();
  const {t} = useTranslation();

  const update = async () =>
    {
      try{
          await AxiosInstance(`/api/v1/updateWinner/${ids.match_id}`,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${getCookie('access')}`
                },
                data: {
                    winner_id: win_id
                }
            })
      }
      catch(e)
      {
          toast.error(t('erroroccurred'));
      }
      //maybe add this
      // if (gameEnded)
        updateHistory();
    }

    const updateHistory = async () => {
        try {
              await AxiosInstance(`/api/v1/update_history`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${getCookie('access')}`
                },
                data: {
                    //for local send same id for both players
                    player: String(userLoggedIn),
                    opponent: String(userLoggedIn) === String(ids.id1) ? String(ids.id2) : String(ids.id1),
                    Winner_scr: scores.win_score,
                    Loser_scr: scores.lose_score,
                    mode: "remote",
                    type_game: "tournament",
                    winner_id: win_id,
                    loser_id: String(ids.id1) === win_id ? String(ids.id2) : String(ids.id1),
                }
            })
        }
        catch(e) {
            toast.error(t('erroroccurred'));
        }
    }

    let leftData = 40;
    let rightData = 40;
    let leftScoreData = 0;
    let rightScoreData = 0;
    let dummyParam = '';
    
    const [gameEnded, setGameEnded] = useState(false);
    const [forfeit, setForfeit] = useState(false);
    
    const { messages } = useContext(TourSocketContext); 
    const { socket } = useContext(TourSocketContext);
    
    const [leftScore, setLeftScore] = useState(0);
    const [rightScore, setRightScore] = useState(0);

    const [scores, setScores] = useState({ win_score: 0, lose_score: 0 });

    const [win_id, setWin_id] = useState('');
    
    const [leftBarPosition, setLeftBarPosition] = useState(40);
    const [rightBarPosition, setRightBarPosition] = useState(40);
    
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });

    const [leftPlayer, setLeftPlayer] = useState({ first_name: '', last_name: '', nickname: '', image: ''});
    const [rightPlayer, setRightPlayer] = useState({ first_name: '', last_name: '', nickname: '', image: ''});

    useEffect(() => {
        setLeftPlayer({
          first_name: ids.match.p1.first_name,
          last_name: ids.match.p1.last_name,
          nickname: ids.match.p1.nickname,
          image: ids.match.p1.image
        });
        setRightPlayer({
          first_name: ids.match.p2.first_name,
          last_name: ids.match.p2.last_name,
          nickname: ids.match.p2.nickname,
          image: ids.match.p2.image
        });
      }, []);
      
      
      useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        
        if (!latestMessage) return;
        [dummyParam, leftData, rightData, leftScoreData, rightScoreData] = latestMessage.split(',');
        
        if (latestMessage === 'forf') {
          if (socket && socket.readyState === WebSocket.OPEN)
            socket.close();
          if (playerID == String(ids.id1)) {
            setWin_id(String(ids.id1));
            setScores({ win_score: leftScore, lose_score: rightScore });
          }
          else {
            setWin_id(String(ids.id2));
            setScores({ win_score: rightScore, lose_score: leftScore });
          }
          if (socket && socket.readyState === WebSocket.OPEN)
            socket.close();
        setForfeit(true);
      }
      if (dummyParam === 'won') {
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.close();
        setLeftScore(leftData);
        setRightScore(rightData);
  
        if (leftData >= 6) {
          setWin_id(String(ids.id2));
          setScores({ win_score: leftData, lose_score: rightData });
        }
        else if (rightData >= 6) {
          setWin_id(String(ids.id1));
          setScores({ win_score: rightData, lose_score: leftData });
        }
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.close();
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
  
    const [leftBarMoving, setLeftBarMoving] = useState<string>('');
    const [rightBarMoving, setRightBarMoving] = useState<string>('');

    useEffect(() => {
      const interval = setInterval(() => {
        if (gameEnded || forfeit) return ;

        if (leftBarMoving === 'up') socket.send('leftUp');
        if (leftBarMoving === 'down') socket.send('leftDown');
        if (rightBarMoving === 'up') socket.send('rightUp');
        if (rightBarMoving === 'down') socket.send('rightDown');
      }, 50);
    
      return () => clearInterval(interval);
    }, [leftBarMoving, rightBarMoving]);
    
    useEffect(() => {
  
      if (gameEnded || forfeit) return;

      const handleKeyDown = (event:KeyboardEvent) => {
        if (gameEnded || forfeit) return ;

        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key))
          event.preventDefault();

        if (event.key === 'ArrowUp'   && playerID == String(ids.id2)) setRightBarMoving('up');
        if (event.key === 'ArrowDown' && playerID == String(ids.id2)) setRightBarMoving('down');
        if (event.key === 'ArrowUp'   && playerID == String(ids.id1)) setLeftBarMoving('up');
        if (event.key === 'ArrowDown' && playerID == String(ids.id1)) setLeftBarMoving('down');
      };
    
      const handleKeyUp = (event:KeyboardEvent) => {
        if (gameEnded || forfeit) return ;

        if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && playerID == String(ids.id2)) setRightBarMoving('');
        if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && playerID == String(ids.id1)) setLeftBarMoving('');
      };
    
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    useEffect(() => {
      if (gameEnded && String(playerID) === win_id) {
        if (socket && socket.readyState === WebSocket.OPEN)
          socket.close();
        // socket.send('done');
        update();
      }
  }, [gameEnded]);

  useEffect(() => {
    if (forfeit) {
      if (socket && socket.readyState === WebSocket.OPEN)
        socket.close();
      update();
    }
}, [forfeit]);

    //bug:register and unregister fucks the matches

  return (
      <div className='flex flex-col'>
        <section className='flex justify-around items-center'>
          <Player imageUrl={leftPlayer.image ? leftPlayer.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} name={`${leftPlayer.first_name} ${leftPlayer.last_name.substring(0, 14)}...`} nickname={leftPlayer.nickname} ></Player>
          <h1 className='text-3xl font-extrabold'>VS</h1>
          <Player imageUrl={rightPlayer.image ? rightPlayer.image : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/default.jpg`} name={`${rightPlayer.first_name} ${rightPlayer.last_name.substring(0, 14)}...`} nickname={rightPlayer.nickname} ></Player>
        </section>
        <div className='flex justify-start mb-20'>
        <div className="Table text-white shadow-2xl  shadow-[#5b21b6]/50 border-2 border-[#5b21b6] ">
          <div className="middleLine"></div>
          <div className="middleCircle"></div>
          <div className="leftBar bg-gradient-to-r from-cyan-500 to-blue-500" style={{ top: `${leftBarPosition < 2 ? 2 : leftBarPosition > 76 ? 76 : leftBarPosition}%`}}></div>
          <div className="rightBar bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${rightBarPosition < 2 ? 2 : rightBarPosition > 76 ?76 : rightBarPosition}%`}}></div>
          <div className="Ball" style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}></div>
          <div className="leftScore">{leftScore}</div>
          <div className="rightScore">{rightScore}</div>
          {gameEnded && <EndOverlay rightscore={(rightScore.toString())} leftscore={leftScore.toString()} result={playerID === win_id ? t('youwon') : t('youlost')}/>}
          {forfeit && <EndOverlay rightscore={(rightScore.toString())} leftscore={leftScore.toString()} result='Game Over'/>}
        </div>
      </div>
    </div>
  );
};

export default TournamentMatch;
