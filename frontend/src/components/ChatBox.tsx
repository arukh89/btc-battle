import React, { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';
const ChatBox: React.FC<{playerName:string}> = ({playerName})=>{
  const [messages,setMessages]=useState<{author:string,message:string}[]>([]);
  const [input,setInput]=useState('');
  useEffect(()=>{ const s=getSocket(); s.on('chatMessage',d=>setMessages(m=>[...m,d])); return ()=>{ s.off('chatMessage'); }; },[]);
  const send=()=>{ if(input.trim()!==''){ getSocket().emit('chatMessage',{author:playerName||'anon', message:input}); setInput(''); } };
  return (
    <section className="chat-section card">
      <h2>Chat</h2>
      <div id="chatMessages" className="chat-messages">{messages.map((m,i)=>(<div key={i} className="chat-item"><strong>{m.author}:</strong> {m.message}</div>))}</div>
      <input id="chatInput" type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." />
      <button id="chatSendBtn" className="btn" onClick={send}>Send</button>
    </section>
  );
};
export default ChatBox;
