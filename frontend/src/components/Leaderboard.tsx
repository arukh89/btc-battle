import React, { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
const Leaderboard: React.FC = ()=>{
  const [board,setBoard]=useState<{player:string,score:number}[]>([]);
  useEffect(()=>{ const s=getSocket(); s.on('leaderboard',d=>setBoard(d)); return ()=>s.off('leaderboard'); },[]);
  return (<section className="leaderboard-section card"><h2>Leaderboard</h2><ul id="leaderboardList" className="leaderboard-list">{board.map((b,i)=>(<li key={i} className="leader-item">{b.player} - {b.score}</li>))}</ul></section>);
};
export default Leaderboard;
