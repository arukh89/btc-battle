import React, { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../utils/socket';
import PredictionSection from './PredictionSection';
import PlayersList from './PlayersList';
import ChatBox from './ChatBox';
import Leaderboard from './Leaderboard';
import WalletButton from './WalletButton';

const GameUI: React.FC = () => {
  const [status,setStatus]=useState('Waiting for players...');
  const [players,setPlayers]=useState<string[]>([]);
  const [playerName,setPlayerName]=useState('');

  useEffect(()=>{
    const socket = connectSocket();
    socket.on('connect',()=> setStatus('Connected to server ✅'));
    socket.on('disconnect',()=> setStatus('Disconnected ❌'));
    socket.on('playerList', (list:string[]) => setPlayers(list));
    return ()=>{ socket.off('connect'); socket.off('disconnect'); socket.off('playerList'); };
  },[]);

  const handleJoin = ()=>{ const name = `Player-${Math.floor(Math.random()*1000)}`; setPlayerName(name); getSocket().emit('join', name); setStatus(`Joined as ${name}`); };

  return (
    <div id="gameScreen" className="game-screen">
      <header className="app-header card"><img src="/icons/icon-192.svg" alt="App Icon" className="app-icon" /><h1 className="app-title">TX Battle Royale</h1></header>
      <main className="app-main wrap">
        <section className="status-section card"><p id="statusMessage">{status}</p></section>
        <section className="controls-section card controls">
          <button id="joinBtn" className="btn" onClick={handleJoin}>Join Game</button>
          <button id="shareBtn" className="btn" onClick={()=>navigator.share?.({url:window.location.href})}>Share</button>
        </section>
        <PredictionSection playerName={playerName} setStatus={setStatus} />
        <PlayersList players={players} />
        <ChatBox playerName={playerName} />
        <Leaderboard />
        <WalletButton setStatus={setStatus} />
      </main>
      <footer className="app-footer card"><p>Frontend: <a href="https://testtx.netlify.app/" target="_blank" rel="noreferrer">https://testtx.netlify.app/</a></p><p>Backend: <a href="https://3ffe2d34-7fa9-4492-bdc8-68e9a2b9f021-00-3hy09jgnwmhu3.sisko.replit.dev/" target="_blank" rel="noreferrer">Backend API</a></p></footer>
    </div>
  );
};
export default GameUI;
