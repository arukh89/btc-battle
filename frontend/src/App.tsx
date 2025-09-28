import React, { useState } from "react";

function App() {
  const [players, setPlayers] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [prediction, setPrediction] = useState("");
  const [connected, setConnected] = useState(false);

  const handleJoin = () => {
    setConnected(true);
    setPlayers([...players, "You"]);
  };

  const handlePrediction = () => {
    if (prediction.trim() !== "") {
      setMessages([...messages, `Your prediction: ${prediction}`]);
      setPrediction("");
    }
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("chat") as HTMLInputElement;
    if (input.value.trim() !== "") {
      setMessages([...messages, `You: ${input.value}`]);
      input.value = "";
    }
  };

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>TX Battle Royale</h1>
          <p className="subtitle">Real-time Bitcoin transaction prediction game</p>
          <p id="status" className="muted">
            {connected ? "✅ Connected" : "🔴 Not Connected"}
          </p>
        </div>
        <div className="muted">Live • Realtime</div>
      </header>

      <main className="card" style={{ minHeight: "420px" }}>
        <section>
          <h2>Current Block</h2>
          <div id="currentBlock" className="card" style={{ margin: "10px 0", padding: "12px" }}>
            #123456
          </div>
        </section>

        <section style={{ marginTop: "14px" }}>
          <h3>Controls</h3>
          <div className="controls" style={{ marginTop: "8px" }}>
            <button className="btn" onClick={handleJoin}>Join Game</button>
            <button className="btn">Share</button>
            <button className="btn">Prev Block</button>
            <button className="btn">Current Block</button>
          </div>
        </section>

        <section style={{ marginTop: "14px" }}>
          <h3>Prediction</h3>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
            />
            <button className="btn" onClick={handlePrediction}>Submit</button>
          </div>
        </section>

        <section style={{ marginTop: "14px" }}>
          <h3>
            Players <span className="muted">({players.length})</span>
          </h3>
          <ul className="players-list">
            {players.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: "14px" }}>
          <h3>Chat</h3>
          <div
            id="messagesList"
            className="chat-list card"
            style={{ minHeight: "120px", maxHeight: "320px", overflow: "auto", padding: "8px" }}
          >
            {messages.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
          <form onSubmit={handleChat} style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input type="text" name="chat" placeholder="Say something..." />
            <button className="btn" type="submit">Send</button>
          </form>
        </section>
      </main>

      <aside className="card">
        <section>
          <h3>Leaderboard</h3>
          <ul className="leaderboard-list">
            <li>Player1 - 1200 pts</li>
            <li>Player2 - 950 pts</li>
          </ul>
        </section>

        <section style={{ marginTop: "12px" }}>
          <h3>Farcaster</h3>
          <p className="muted">Miniapp integration</p>
          <button className="btn">Connect Farcaster Wallet</button>
        </section>
      </aside>

      <footer>
        Frontend: <a href="https://testtx.netlify.app/" target="_blank">testtx.netlify.app</a> •
        Backend: <a href="https://3ffe2d34-7fa9-4492-bdc8-68e9a2b9f021-00-3hy09jgnwmhu3.sisko.replit.dev/" target="_blank">Backend</a>
      </footer>
    </div>
  );
}

export default App;
