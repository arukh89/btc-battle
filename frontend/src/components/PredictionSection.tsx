import React, { useState } from 'react';
import { getSocket } from '../utils/socket';
const PredictionSection: React.FC<{playerName:string, setStatus:(s:string)=>void}> = ({playerName,setStatus})=>{
  const [val,setVal]=useState('');
  const submit=()=>{
    const num=parseInt(val,10);
    if(!isNaN(num)){ getSocket().emit('prediction',{player:playerName,value:num}); setStatus(`Prediction submitted: ${num}`); setVal(''); }
  };
  return (
    <section className="prediction-section card">
      <h2>Make Your Prediction</h2>
      <input id="predictionInput" type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder="Enter transaction count" />
      <button id="submitPredictionBtn" className="btn" onClick={submit}>Submit</button>
    </section>
  );
};
export default PredictionSection;
