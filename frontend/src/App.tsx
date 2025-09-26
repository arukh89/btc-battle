import React, { useEffect, useState } from 'react';
import Splash from './components/Splash';
import GameUI from './components/GameUI';
import { connectSocket } from './utils/socket';

async function callSDKReady(){ try{ const sdk = (window as any).farcasterSdk || (window as any).FarcasterMiniapp || (window as any).miniapp; if(sdk?.actions?.ready) await sdk.actions.ready(); else if(sdk?.ready) await sdk.ready(); }catch(e){ console.warn('sdk ready failed',e); } }

const App: React.FC = ()=>{
  const [ready,setReady] = useState(false);
  useEffect(()=>{
    callSDKReady().catch(()=>{});
    const s = connectSocket();
    s.on('connect', async ()=>{ try{ await callSDKReady(); }catch{}; setReady(true); });
    const t = setTimeout(()=> setReady(true), 3000);
    return ()=>{ clearTimeout(t); s.off('connect'); };
  },[]);
  return ready ? <GameUI /> : <Splash />;
};
export default App;
