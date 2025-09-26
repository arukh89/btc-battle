import React from 'react';
const PlayersList: React.FC<{players:string[]}> = ({players}) => (
  <section className="players-section card">
    <h2>Players</h2>
    <p id="playerCount">{players.length} players joined</p>
    <div id="playersContainer" className="players-container">
      {players.map((p,i)=><div key={i} className="player-item">{p}</div>)}
    </div>
  </section>
);
export default PlayersList;
