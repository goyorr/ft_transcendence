'use client'

import React, { useEffect, useState } from 'react';
import Avatar from "@/components/avatar"
import { UseAppContext } from "@/context/AuthContext"
import NavBar from '@/components/NavBar';
import AxiosInstance from '@/utils/axiosInstance';
import { getCookie } from "cookies-next"
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

const playerMap: { [key: string]: string } = {};

const EndOverlay = ({ round_number, leftscore, rightscore, setPlaying, winn }: { leftscore: number, rightscore: number, setPlaying: React.Dispatch<React.SetStateAction<boolean>>, round_number: number, winn: string }) => {

    const {t} = useTranslation()

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
            <div className="w-[450px] flex flex-col items-center bg-black border-solid border-2 border-sky-500  p-8 rounded-lg">
                <a className="text-4xl font-bold mb-4">{winn} {t('won')}</a>
                <a className="text-3xl mb-4 font-press-start">{rightscore} - {leftscore}</a>
                {round_number === 0 &&
                    <button className="text-2xl  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={() => setPlaying(false)}>{t('leave')}</button>
                }
                {round_number === 1 &&
                    <button onClick={() => location.reload()} className="text-2xl  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">{t('leave')}</button>}
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

const Game = ({ round_number, leftPlayer, rightPlayer, winners, setWinners, setPlaying }: { leftPlayer: string, rightPlayer: string, winners: { winner_1: string; winner_2: string; }, setWinners: React.Dispatch<React.SetStateAction<{ winner_1: string; winner_2: string; }>>, setPlaying: React.Dispatch<React.SetStateAction<boolean>>, round_number: number }) => {
    const {t} = useTranslation()

    const [leftScore, setLeftScore] = useState(0);
    const [rightScore, setRightScore] = useState(0);

    const [gameEnded, setGameEnded] = useState(false);

    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
    const [velocity, setVelocity] = useState({ x: 1, y: 1 });
    const [speed, setSpeed] = useState(1);

    const userLoggedIn = UseAppContext().userLoggedIn;

    const update = async (winnerScore: number, loserScore: number, winner: string, loser: string) => {
        try {
            await AxiosInstance(`/api/v1/update_history`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${getCookie('access')}`
                },
                data: {
                    //for local send same id for both players
                    player: userLoggedIn,
                    opponent: userLoggedIn,
                    Winner_scr: winnerScore,
                    Loser_scr: loserScore,
                    mode: "local",
                    type_game: "tournament",
                    winner_id: userLoggedIn,
                    loser_id: userLoggedIn,
                    winner_alias: winner,
                    loser_alias: loser
                }
            })
        }
        catch(e) {
            toast.error(t('erroroccurred'))
        }
    }

    useEffect(() => {
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

    const [winn, setWinn] = useState<string>('')
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
          x: speed * -Math.cos(bounceAngle),
          y: speed * -Math.sin(bounceAngle)
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
        else if (ballPosition.x > 97) {
            setRightScore(rightScore + 1);
            setVelocity({ x: -1, y: 0.6 });
        }
        else if (ballPosition.x === 94 && ballPosition.y >= rightBarPosition && ballPosition.y <= rightBarPosition + 20 && velocity.x > 0) {
            setVelocity(prevVelocity => ({ ...prevVelocity, x: prevVelocity.x * -1 }));
        }
        setBallPosition({ x: 50, y: 50 });
        setSpeed(1);
    }
    if (ballPosition.y <= 0 || ballPosition.y >= 96)
        setVelocity(prevVelocity => ({ ...prevVelocity, y: prevVelocity.y * -1 }));
    if (leftScore === 6 || rightScore === 6) {
        if (gameEnded) return;
        
        if (rightScore === 6) {
            if (winners.winner_1 === '')
                setWinners({winner_1: leftPlayer, winner_2: ''})
            else
                setWinners({winner_1: winners.winner_1, winner_2: leftPlayer})
            setWinn(leftPlayer)
            update(rightScore, leftScore, leftPlayer, rightPlayer)
        }
        else {
            if (winners.winner_1 === '')
                setWinners({winner_1: rightPlayer, winner_2: ''})
            else
                setWinners({winner_1: winners.winner_1, winner_2: rightPlayer})
            setWinn(rightPlayer)
            update(leftScore, rightScore, rightPlayer, leftPlayer)
        }
        setGameEnded(true);
    }
    }, [ballPosition])
    

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

    return (
        <>
            <div className='flex flex-col'>
                <section className='flex justify-around items-center'>
                    <Player name={leftPlayer} controls={t('wscontrols')} imageUrl={playerMap[leftPlayer]}></Player>
                    <h1 className='text-3xl font-extrabold'>VS</h1>
                    <Player name={rightPlayer} controls={t('arrowscontrols')} imageUrl={playerMap[rightPlayer]}></Player>
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
                        {gameEnded && (<EndOverlay round_number={round_number} leftscore={leftScore} rightscore={rightScore} winn={winn} setPlaying={setPlaying} />)}
                    </div>
                </div>
            </div>
        </>
    );
}

const DialogModal: React.FC<any> = ({ hide, setHide, player1, player2, player3, player4, setPlayer1, setPlayer2, setPlayer3, setPlayer4, setMatches, matches }) => {

    const {t} = useTranslation()

    const [disable, setDisabled] = useState<boolean>(true)

    const HandleValues = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget

        if (name === 'player1')
            setPlayer1(value)
        if (name === 'player2')
            setPlayer2(value)
        if (name === 'player3')
            setPlayer3(value)
        if (name === 'player4')
            setPlayer4(value)
    }

    const create = () => {
        setHide(true);
        const newMatches = [
            ...matches,
            {
                id: 0,
                player1: player1,
                player2: player2,
                isPlayed: false,
                round_number: 0
            },
            {
                id: 1,
                player1: player3,
                player2: player4,
                isPlayed: false,
                round_number: 0
            }
        ];

        playerMap[player1] = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/1.jpg`;
        playerMap[player2] = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/2.jpeg`;
        playerMap[player3] = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/3.jpg`;
        playerMap[player4] = `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/4.jpg`;

        setMatches(newMatches);
    }

    const players = [player1, player2, player3, player4];
    const uniquePlayers = new Set(players);

    useEffect(() => {
        if (player1 != '' && player2 != '' && player3 != '' && player4 != '' && uniquePlayers.size === players.length)
            setDisabled(false)
        else
            setDisabled(true)
    }, [player1, player2, player3, player4])

    return (
        <>
            {!hide && (
                <div className='fixed inset-0 flex lg:items-center items-start justify-center  backdrop-blur-sm bg-black/30  z-50'>
                    <div className='w-full max-w-[36rem] p-6 bg-[#020617] rounded-lg shadow-lg mt-8'>
                        <div className='flex justify-between items-center'>
                            <input name='player1' onChange={HandleValues} value={player1} placeholder='Player 1...' className={`mb-4  text-sm w-full outline-none p-3 border-[0.1px]  rounded-md bg-transparent bg-slate-900`}></input>
                            <input name='player2' onChange={HandleValues} value={player2} placeholder='Player 2...' className={`mb-4  text-sm w-full outline-none p-3 border-[0.1px]  rounded-md bg-transparent bg-slate-900 ml-3`}></input>
                        </div>
                        <div className='flex justify-between items-cent bg-slate-900er'>
                            <input name='player3' onChange={HandleValues} value={player3} placeholder='Player 3...' className={`mb-4  text-sm w-full outline-none p-3 border-[0.1px]  rounded-md bg-transparent bg-slate-900`}></input>
                            <input name='player4' onChange={HandleValues} value={player4} placeholder='Player 4...' className={`mb-4  text-sm w-full outline-none p-3 border-[0.1px]  rounded-md bg-transparent bg-slate-900 ml-3`}></input>
                        </div>
                        <button onClick={create} disabled={disable} className={`w-full py-[10px] border-none rounded-md text-sm font-light mt-4 bg-gradient-to-r from-cyan-500 to-blue-500  ${disable ? "opacity-50" : ""}`}>{t('createtournament')}</button>
                    </div>
                </div>
            )}
        </>
    )
}

const LocalTournament = () => {

    const {t} = useTranslation()

    function StartPlaying(matchId: number, match: LocalMatch) {

        const updatedMatches = matches.map(match => {
            if (match.id === matchId) {
                return { ...match, isPlayed: true };
            } else {
                return match;
            }
        })

        setMatches(updatedMatches);

        setLeft(match.player1.toString());
        setRight(match.player2.toString());
        setRoundNum(match.round_number);
        setPlaying(true);
    }

    interface LocalMatch {
        player1: String,
        player2: String,
        winner: String,
        isPlayed: boolean,
        round_number: number,
        id: number,
    }

    const [player1, setPlayer1] = useState<string>('')
    const [player2, setPlayer2] = useState<string>('')
    const [player3, setPlayer3] = useState<string>('')
    const [player4, setPlayer4] = useState<string>('')

    const [leftPlayer, setLeft] = useState<string>('')
    const [rightPlayer, setRight] = useState<string>('')

    const [round_num, setRoundNum] = useState<number>(-1)

    const [winners, setWinners] = useState({ winner_1: '', winner_2: '' })

    const [playing, setPlaying] = useState(false)
    const [hide, setHide] = useState(false)
    const { setToggleBox } = UseAppContext();
    const [matches, setMatches] = useState<LocalMatch[]>([])

    useEffect(() => {
        if (winners.winner_1 != '' && winners.winner_2 != '') {
            setMatches([
                {
                    id: 2,
                    player1: winners.winner_1,
                    player2: winners.winner_2,
                    winner: '',
                    isPlayed: false,
                    round_number: 1
                }
            ])
        }
    }, [winners])

    useEffect(() => {
        setToggleBox(false)
    }, [])

    return (
        <div className=''>
            <NavBar></NavBar>
            {playing && <Game round_number={round_num} winners={winners} leftPlayer={leftPlayer} rightPlayer={rightPlayer} setWinners={setWinners} setPlaying={setPlaying} /> || (
                <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8 p-4 rounded-lg  ">
                    <DialogModal matches={matches} setMatches={setMatches} player1={player1} player2={player2} player3={player3} player4={player4} setPlayer1={setPlayer1} setPlayer2={setPlayer2} setPlayer3={setPlayer3} setPlayer4={setPlayer4}  hide={hide} setHide={setHide}></DialogModal>
                    <div className='w-full min-h-[22rem] bg-red-300 relative mb-0 rounded-md rel'>
                        <section className="w-full h-full -z-1">
                            {/* <Image
                                className="rounded-lg"
                                objectPosition="center"
                                objectFit="cover"
                                layout="fill"
                                src={Trophet}
                                alt="cover"
                            /> */}
                            <div className="brackets-tournaments backdrop-blur-sm bg-black/30 w-full h-[100%] mt-4 z-10 absolute bottom-0 p-4 rounded-md">
                                {matches.length > 0 && matches && (
                                    <div className="grid grid-cols-3 gap-4 items-center justify-center h-full">
                                        <div className="flex flex-row justify-around h-full mt-52">
                                        <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '100px', maxHeight: '100px'}}>
                                            <img src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/1.jpg`} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        </div>
                                            <section className='flex justify-center mt-10'>
                                                <h1 className='text-3xl font-extrabold'>VS</h1>
                                            </section>
                                            <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '100px', maxHeight: '100px'}}>
                                                <img src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/2.jpeg`} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            </div>
                                            </div>
                                        <div className="flex justify-center items-center ">
                                            <div className="text-center">{
                                                matches.length === 1 && (
                                                <div className='flex flex-row justify-between space-x-3'>
                                                    <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '150px', maxHeight: '150px'}}>
                                                <img src={playerMap[matches[0].player1.toString()]} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                    </div>
                                                    <section className='flex justify-center mt-14'>
                                                        <h1 className='text-3xl font-extrabold'>VS</h1>
                                                    </section>
                                                    <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '150px', maxHeight: '150px'}}>
                                                <img src={playerMap[matches[0].player2.toString()]} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-row justify-around h-full mt-52">
                                        <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '100px', maxHeight: '100px'}}>
                                            <img src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/3.jpg`} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        </div>
                                            <section className='flex justify-center mt-10'>
                                                <h1 className='text-3xl font-extrabold'>VS</h1>
                                            </section>
                                            <div className="player-box bg-white/20 p-2 rounded-md text-center" style={{maxWidth: '100px', maxHeight: '100px'}}>
                                                <img src={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/images/4.jpg`} alt="Description of the image" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                
                            </div>
                        </section>
                    </div>

                    <div className=''>
                        {/* <h1 className='text-xl font-extrabold  flex flex-col mt-6'>{langs.gm}</h1> */}
                        <div className='flex flex-col sm:grid sm:grid-cols-1  md:grid-cols-2  2xl:grid-cols-3  gap-4'>
                            {matches.length > 0 && matches.map((match => (
                                <div key={match.id}>
                                    <section className='mt-4 flex flex-col bg-[#050C9C]  justify-center rounded-md px-4 py-[8px]  shadow-lg relative' >
                                        <section className='avatars mt-2 flex flex-row  justify-between  rounded-lg'>
                                            <section className='flex flex-row items-center gap-2'>
                                                <Avatar width='w-[50px]' height='h-[50px]' src={playerMap[match.player1.toString()]} alt={`${match.player1}`}></Avatar>
                                                <section>
                                                    <h1>{match.player1}</h1>
                                                </section>
                                            </section>
                                            <span className='font-extrabold text-xl flex jus items-center'>
                                                vs
                                            </span>
                                            <section className='flex flex-row items-center gap-2'>
                                                <section className='flex flex-col items-end'>
                                                    <h1>{match.player2}</h1>
                                                </section>
                                                <Avatar width='w-[50px]' height='h-[50px]' src={playerMap[match.player2.toString()]} alt={`${match.player1}`} ></Avatar>
                                            </section>
                                        </section>
                                        <section className='flex justify-between items-center'>
                                            <section>
                                                <h1 className='text-xs text-slate-300 mt-4'>{t('localtournament')}</h1>
                                                <h6 className='font-extrabold'>{t('round')} - {match.round_number}</h6>
                                            </section>
                                            <section className='player flex flex-row mt-4 -space-x-4'>
                                                <Avatar width='w-[36px]' height='h-[36px]' src={playerMap[match.player1.toString()]} alt={`${match.player1}`}></Avatar>
                                                <Avatar width='w-[36px]' height='h-[36px]' src={playerMap[match.player2.toString()]} alt={`${match.player1}`}></Avatar>
                                            </section>
                                        </section>
                                        {!match.isPlayed &&
                                            <section>
                                                <button className='bg-gradient-to-r px-[20px] py-[8px] ] bg-[#1d4ed8]  h-9 text-white mt-3 rounded-md flex items-center' onClick={() => StartPlaying(match.id, match)}>{t('start')}</button>
                                            </section>
                                        }
                                        {match.isPlayed && <section><button style={{ marginBottom: '30px' }}></button></section>}
                                    </section>
                                </div>
                            )))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocalTournament;
