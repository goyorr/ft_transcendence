'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UseAppContext } from "@/context/AuthContext"
import { useTranslation } from '@/hooks/useTranslation';

const EndOverlay = ({ leftscore, rightscore, reset }: { leftscore: number, rightscore: number, reset: () => void }) => {
  const {t} = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
      <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
        <a className="text-4xl font-bold mb-4">Game Over</a>
        <a className="text-3xl mb-4 font-press-start">{leftscore} - {rightscore}</a>
        <Link className="text-2xl mb-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" href="/game/">{t('leave')}</Link>
        <button className="text-2xl  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={() => reset()}>{t('Playagain')}</button>
      </div>
    </div>
  );
};

const Player = ({ name = "Player", controls = "", imageUrl = "" }) => {
  return (
    <div className="player flex items-start p-4 w-80 bg-[#121212] rounded-xl shadow-lg mt-8 flex-col">
      <section className='flex flex-row items-center justify-center gap-4'>
        <img
          src={imageUrl}
          alt={name}
          className="w-12 h-12 rounded-full border-2 border-gray-700"
        />
        <div className="player-info flex flex-col">
          <h3 className="text-xl font-semibold text-white">{name}</h3>
        </div>
      </section>
      <div className="flex flex-col ml-16">
        <p className="text-xm font-bold text-gray-300">{controls}</p>
      </div>
    </div>
  );
};

const LocalTable = () => {
  const {  setToggleBox } = UseAppContext();
  const {t} = useTranslation();

  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  const [gameEnded, setGameEnded] = useState(false);

  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: 1, y: 0.5 });

  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (gameEnded) return;
  
    const interval = setInterval(() => {
      if (gameEnded) return;

      setBallPosition(prevPosition => ({
        x: prevPosition.x + velocity.x,
        y: prevPosition.y + velocity.y
      }));
    }, 18);
  
    return () => {
      clearInterval(interval);
    };
  }, [velocity]);
  
  useEffect(() => {
    const barHeight = 25;
  
    if ( ballPosition.x <= 3 && ballPosition.y  + 5 >= leftBarPosition && ballPosition.y  + 5 <= leftBarPosition + barHeight) {
      const relativeIntersectY = (leftBarPosition + barHeight / 2) - ballPosition.y;
      const IntersectionY = (relativeIntersectY / (barHeight / 2));
      const bounceAngle = IntersectionY * Math.PI / 4;
  
      setVelocity({
        x: speed * Math.cos(bounceAngle),
        y: speed * -Math.sin(bounceAngle)
      });
      setSpeed(speed + 0.2);
    } 

    if ( ballPosition.x >= 94 && ballPosition.y >= rightBarPosition && ballPosition.y <= rightBarPosition + barHeight) {
      const relativeIntersectY = (rightBarPosition + barHeight / 2) - ballPosition.y;
      const IntersectionY = (relativeIntersectY / (barHeight / 2));
      const bounceAngle = IntersectionY * Math.PI / 4;
  
      setVelocity({
        x:  speed * -Math.cos(bounceAngle),
        y:  speed * -Math.sin(bounceAngle)
      });
      setSpeed(speed + 0.2);
    } 

    else if (ballPosition.x < 0 || ballPosition.x > 97) {
      if (gameEnded) {
        setVelocity({ x: 0, y: 0 });
        return;
      }

      if (ballPosition.x < 0) {
        setVelocity({ x: 1, y: -0.4 });
        setLeftScore(leftScore + 1);
      }
      else {
        setRightScore(rightScore + 1);
        setVelocity({ x: -1, y: 0.6 });
      }
      setSpeed(1);
      setBallPosition({ x: 50, y: 50 });
    }

    if (ballPosition.y <= 0 || ballPosition.y >= 96) {
      if (gameEnded) return;

      setVelocity(prevVelocity => ({ ...prevVelocity, y: prevVelocity.y * -1 }));
    }
  
    if (leftScore === 6 || rightScore === 6)
      setGameEnded(true);
  }, [ballPosition]);

  const [leftBarPosition, setLeftBarPosition] = useState(40);
  const [rightBarPosition, setRightBarPosition] = useState(40);

  useEffect(() => {
    if (gameEnded) return;

    rightBarPosition < 0 && setRightBarPosition(0);
    rightBarPosition > 80 && setRightBarPosition(80);

    leftBarPosition < 0 && setLeftBarPosition(0);
    leftBarPosition > 80 && setLeftBarPosition(80);
  }, [leftBarPosition, rightBarPosition]);

  const moveRightBarUp = () => {
    setRightBarPosition(position => position - 4);
  };

  const moveRightBarDown = () => {
    setRightBarPosition(position => position + 4);
  };

  const moveLeftBarUp = () => {
    setLeftBarPosition(position => position - 4);
  };

  const moveLeftBarDown = () => {
    setLeftBarPosition(position => position + 4);
  };

  const [leftBarMoving, setLeftBarMoving] = useState<string | null>(null);
  const [rightBarMoving, setRightBarMoving] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameEnded) return;

      if (leftBarMoving === 'up') moveLeftBarUp();
      if (leftBarMoving === 'down') moveLeftBarDown();
      if (rightBarMoving === 'up') moveRightBarUp();
      if (rightBarMoving === 'down') moveRightBarDown();
    }, 30);

    return () => clearInterval(interval);
  }, [leftBarMoving, rightBarMoving]);

  useEffect(() => {
    const handleKeyDown = (event:KeyboardEvent) => {
      if (gameEnded) return;

      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key))
        event.preventDefault();

      if (event.key === 'w') setLeftBarMoving('up');
      if (event.key === 's') setLeftBarMoving('down');
      if (event.key === 'ArrowUp') setRightBarMoving('up');
      if (event.key === 'ArrowDown') setRightBarMoving('down');
    };

    const handleKeyUp = (event:KeyboardEvent) => {
      if (gameEnded) return;

      if (event.key === 'w' || event.key === 's') setLeftBarMoving(null);
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') setRightBarMoving(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


  function reset() {
    setGameEnded(false);
    setLeftScore(0);
    setRightScore(0);
    setBallPosition({ x: 50, y: 50 });
    setVelocity({ x: 1, y: 1 });
    setLeftBarPosition(40);
    setRightBarPosition(40);
  }

  useEffect(() => {
    setToggleBox(false)
  }, [])

  return (
    <>
      <div className='flex flex-col'>
        <section className='flex justify-center items-center gap-[24.5rem]'>
          <Player name="Anonymous" controls={t('wscontrols')} imageUrl={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/1.jpg`}></Player>
          <h1 className='text-3xl font-extrabold'>VS</h1>
          <Player name='Anonymous' controls={t('arrowscontrols')} imageUrl={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/4.jpg`}></Player>
        </section>
        <div className='flex justify-start mb-20'>
          <div className="Table text-white shadow-2xl  shadow-[#5b21b6]/50 border-2 border-[#5b21b6] ">
            <div className="middleLine"></div>
            <div className="middleCircle"></div>
            <div className="leftBar bg-gradient-to-r from-cyan-500 to-blue-500" style={{ top: `${leftBarPosition < 2 ? 2 : leftBarPosition > 76 ? 76 : leftBarPosition}%` }}></div>
            <div className="rightBar bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" style={{ top: `${rightBarPosition < 2 ? 2 : rightBarPosition > 76 ? 76 : rightBarPosition}%` }}></div>
            <div className="Ball" style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}></div>
            <div className="leftScore">{leftScore}</div>
            <div className="rightScore">{rightScore}</div>
            {gameEnded && (<EndOverlay leftscore={leftScore} rightscore={rightScore} reset={reset} />)}
          </div>
        </div>
      </div>
    </>
  );
}
export default LocalTable;
