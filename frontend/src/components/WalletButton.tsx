import React from 'react';
const WalletButton: React.FC<{setStatus:(s:string)=>void}> = ({setStatus})=>{
  const connect=async()=>{
    try{ const sdk:any=(window as any).farcasterSdk||(window as any).FarcasterMiniapp||(window as any).miniapp; if(sdk?.wallet?.connect){ await sdk.wallet.connect(); setStatus('Wallet connected ✅'); } else alert('Wallet connect not available'); }catch(e){ console.error(e); setStatus('Wallet connection failed ❌'); }
  };
  return (<section className="wallet-section card"><button id="connectWalletBtn" className="wallet-btn" onClick={connect}>Connect Wallet</button></section>);
};
export default WalletButton;
