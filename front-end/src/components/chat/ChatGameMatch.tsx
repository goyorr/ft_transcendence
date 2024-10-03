"use client";

import React, { useState, useEffect } from "react";
import { WebSocketContext } from "@/context/WebSocketContext";
import { useContext } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const EndOverlay = ({
  leftscore,
  rightscore,
  result,
}: {
  leftscore: String;
  rightscore: String;
  result: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className=" inset-0  flex  absolute z-[99999999999999999] items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
        <a className="text-3xl font-press-start">
          {rightscore} - {leftscore}
        </a>
        <a className="text-2xl font-bold mb-4">{result}</a>
        <button
          onClick={() => location.reload()}
          className="text-2xl mb-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        >
          {t("leave")}
        </button>
      </div>
    </div>
  );
};

const ChatGameTable = ({
  playerID,
  gameId,
  newID1,
  newID2,
}: {
  playerID: String;
  gameId: string;
  newID1: String;
  newID2: String;
}) => {
  const { messages } = useContext(WebSocketContext);
  const { socket } = useContext(WebSocketContext);
  const { t } = useTranslation();

  let leftData = 40;
  let rightData = 40;
  let leftScoreData = 0;
  let rightScoreData = 0;
  let dummyParam = "";

  const [gameEnded, setGameEnded] = useState(false);
  const [forfeit, setForfeit] = useState(false);

  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  const [leftBarPosition, setLeftBarPosition] = useState(40);
  const [rightBarPosition, setRightBarPosition] = useState(40);

  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });

  const [leftBarMoving, setLeftBarMoving] = useState(null as null | string);
  const [rightBarMoving, setRightBarMoving] = useState(null as null | string);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage) return;

    [dummyParam, leftData, rightData, leftScoreData, rightScoreData] =
      latestMessage.split(",");
    if (latestMessage === "forf") {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
      setForfeit(true);
    }
    if (dummyParam === "won") {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
      setLeftScore(leftData);
      setRightScore(rightData);
      setGameEnded(true);
    }
    if (gameEnded || forfeit) return;
    if (dummyParam === "bars") {
      setLeftBarPosition(Number(leftData));
      setRightBarPosition(Number(rightData));
    } else if (dummyParam === "ball") {
      setBallPosition({
        x: Number(leftData),
        y: Number(rightData),
      });
      setLeftScore(leftScoreData);
      setRightScore(rightScoreData);
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameEnded || forfeit) return;

      if (leftBarMoving === "up") socket.send(gameId + ",leftUp");
      if (leftBarMoving === "down") socket.send(gameId + ",leftDown");
      if (rightBarMoving === "up") socket.send(gameId + ",rightUp");
      if (rightBarMoving === "down") socket.send(gameId + ",rightDown");
    }, 50);

    return () => clearInterval(interval);
  }, [leftBarMoving, rightBarMoving]);

  useEffect(() => {
    if (gameEnded || forfeit) {
      return;
    }

    const handleKeyDown = (event : KeyboardEvent) => {
      if (gameEnded || forfeit) return;

      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key))
        event.preventDefault();

      if (event.key === "ArrowUp" && newID1 === playerID)
        setRightBarMoving("up");
      if (event.key === "ArrowDown" && newID1 === playerID)
        setRightBarMoving("down");
      if (event.key === "ArrowUp" && newID2 === playerID)
        setLeftBarMoving("up");
      if (event.key === "ArrowDown" && newID2 === playerID)
        setLeftBarMoving("down");
    };

    const handleKeyUp = (event : KeyboardEvent) => {
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        newID1 === playerID
      )
        setRightBarMoving(null);
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        newID2 === playerID
      )
        setLeftBarMoving(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function winners() {
    if (leftScore >= 6 && playerID === newID1) return t("youwon");
    else if (rightScore >= 6 && playerID === newID2) return t("youwon");
    else return t("youlost");
  }

  return (
<div className="flex flex-col w-full h-screen absolute z-[99999999999999] backdrop-blur-xl bg-black/30 inset-0">
    <div className="flex justify-start mt-[6rem]">

        <div className="Table text-white shadow-2xl  shadow-[#5b21b6]/50 border-2 border-[#5b21b6] ">
          <div className="middleLine"></div>
          <div className="middleCircle"></div>
          <div
            className="leftBar bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{
              top: `${leftBarPosition < 2 ? 2 : leftBarPosition > 76 ? 76 : leftBarPosition}%`,
            }}
          ></div>
          <div
            className="rightBar bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"
            style={{
              top: `${rightBarPosition < 2 ? 2 : rightBarPosition > 76 ? 76 : rightBarPosition}%`,
            }}
          ></div>
          {!gameEnded && (
            <div
              className="Ball"
              style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
            ></div>
          )}
          <div className="leftScore">{leftScore}</div>
          <div className="rightScore">{rightScore}</div>
          {gameEnded && (
            <EndOverlay
              rightscore={String(rightScore)}
              leftscore={String(leftScore)}
              result={winners()}
            />
          )}
          {forfeit && (
            <EndOverlay rightscore={"-"} leftscore={"-"} result="Game Over" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatGameTable;
