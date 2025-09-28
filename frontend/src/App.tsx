import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io((window as any).BACKEND_URL || "http://localhost:3000");

interface Player {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

let farcasterSdk: any = null;

async function initializeFarcasterSDK() {
  try {
    if ((window as any).farcasterSdk) {
      farcasterSdk = (window as any).farcasterSdk;
      console.log("✅ Farcaster SDK initialized");
      return true;
    }
  } catch (err) {
    console.warn("Farcaster SDK not available:", err);
  }
  return false;
}

async function callSDKReady() {
  try {
    if (farcasterSdk && farcasterSdk.actions && farcasterSdk.actions.ready) {
      await farcasterSdk.actions.ready();
      console.log("✅ Called sdk.actions.ready() - splash should be hidden");
      return true;
    }
  } catch (err) {
    console.warn("Failed to call sdk.actions.ready():", err);
  }
  return false;
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [prediction, setPrediction] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [isAppReady, setIsAppReady] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // -------------------------
  // Splash Control
  // -------------------------
  async function hideSplashAndShowGame() {
    if (isAppReady) return;
    setIsAppReady(true);

    await initializeFarcasterSDK();

    const splash = document.getElementById("splashScreen");
    const game = document.getElementById("gameScreen");
    if (splash && game) {
      splash.style.display = "none";
      game.style.display = "block";
    }

    const readySuccess = await callSDKReady();
    if (readySuccess) {
      setStatus("Farcaster SDK Ready ✅");
    } else {
      setStatus("App Ready ✅");
    }
    console.log("✅ App fully loaded and ready");
  }

  // -------------------------
  // Join game
  // -------------------------
  function joinGame() {
    const fidInput = prompt("Masukkan FID Farcaster kamu:");
    if (fidInput) {
      socket.emit("join", { fid: fidInput });
    }
  }

  // -------------------------
  // Prediction
  // -------------------------
  function submitPrediction() {
    if (prediction.trim()) {
      socket.emit("prediction", { value: prediction.trim() });
      setPrediction("");
    }
  }

  // -------------------------
  // Controls
  // -------------------------
  function shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  }

  function prevBlock() {
    socket.emit("prev_block");
  }

  function currBlock() {
    socket.emit("curr_block");
  }

  // -------------------------
  // Farcaster Connect
  // -------------------------
  async function connectFarcaster() {
    try {
      if (!farcasterSdk) {
        await initializeFarcasterSDK();
      }
      if (!farcasterSdk || !farcasterSdk.actions) {
        alert("❌ Farcaster SDK not available. This app works best in Farcaster client.");
        return;
      }

      const res = await farcasterSdk.actions.connect();
      const { fid, username, custodyAddress } = res.user;

      alert(`✅ Connected as @${username}\nFID: ${fid}\nWallet: ${custodyAddress}`);

      socket.emit("join", { fid });

      const message = `Welcome to ${(window as any).APP_NAME || "TxBattle"}!\nTime: ${new Date().toISOString()}`;
      const signed = await farcasterSdk.actions.signMessage(message);

      alert(`✅ Signed!\nMessage: ${message}\n\nSignature: ${signed}`);
    } catch (err) {
      console.error("Farcaster connect error:", err);
      alert("❌ Failed to connect Farcaster wallet");
    }
  }

  // -------------------------
  // Chat
  // -------------------------
  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit("chat_message", chatInput.trim());
      setChatInput("");
    }
  }

  // -------------------------
  // Socket bindings
  // -------------------------
  useEffect(() => {
    socket.on("connect", async () => {
      setStatus("Socket Connected");
      await hideSplashAndShowGame();
    });

    socket.on("disconnect", () => {
      setStatus("Socket Disconnected ❌");
    });

    socket.on("user_data", (user: Player) => {
      setPlayers((prev) => [...prev, user]);
    });

    socket.on("players", (players: Player[]) => {
      setPlayers(players);
    });

    socket.on("chat_message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("leaderboard", (data: LeaderboardEntry[]) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user_data");
      socket.off("players");
      socket.off("chat_message");
      socket.off("leaderboard");
    };
  }, []);

  // -------------------------
  // Fallback timeouts
  // -------------------------
  useEffect(() => {
    setTimeout(async () => {
      if (!isAppReady) {
        setStatus("Loading complete");
        await hideSplashAndShowGame();
      }
    }, 2000);

    setTimeout(async () => {
      if (!isAppReady) {
        setStatus("Loaded (fallback)");
        await hideSplashAndShowGame();
      }
    }, 5000);
  }, [isAppReady]);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="wrap">
      {/* Splash screen */}
      <div id="splashScreen" className="card">
        <h1>Loading...</h1>
        <p>{status}</p>
      </div>

      {/* Game screen */}
      <div id="gameScreen" style={{ display: "none" }}>
        <header>
          <h1>TX Battle Royale</h1>
          <button className="wallet-btn" onClick={connectFarcaster}>
            Connect Farcaster
          </button>
        </header>

        <div className="card">
          <h2>Controls</h2>
          <div className="controls">
            <button className="btn" onClick={joinGame}>Join Game</button>
            <button className="btn" onClick={shareLink}>Share</button>
            <button className="btn" onClick={prevBlock}>Prev Block</button>
            <button className="btn" onClick={currBlock}>Current Block</button>
          </div>
        </div>

        <div className="card">
          <h2>Prediction</h2>
          <input
            type="text"
            placeholder="e.g. 2500"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          />
          <button className="btn" onClick={submitPrediction}>Submit</button>
        </div>

        <div className="card">
          <h2>Players ({players.length})</h2>
          <ul className="players-list">
            {players.map((p, idx) => (
              <li key={idx} className="player-item">
                <img src={p.pfp_url} alt={p.username} width={32} height={32} style={{ borderRadius: "50%" }} /> @
                {p.username} ({p.display_name})
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Chat</h2>
          <div className="chat-list" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} className="chat-item">{m}</div>
            ))}
          </div>
          <form onSubmit={sendChat} className="controls">
            <input
              type="text"
              placeholder="Say something..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button className="btn" type="submit">Send</button>
          </form>
        </div>

        <div className="card">
          <h2>Leaderboard</h2>
          <ul className="leaderboard-list">
            {leaderboard.map((entry, idx) => (
              <li key={idx} className="leader-item">
                @{entry.username}: {entry.score}
              </li>
            ))}
          </ul>
        </div>

        <footer>
          <p className="muted">© 2025 TX Battle Royale</p>
          <p>Status: {status}</p>
        </footer>
      </div>
    </div>
  );
    }
