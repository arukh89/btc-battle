import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./styles/globals.css";

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
  const [chatInput, setChatInput] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [isAppReady, setIsAppReady] = useState(false);

  // -------------------------
  // Splash Control
  // -------------------------
  async function hideSplashAndShowGame() {
    if (isAppReady) return;
    setIsAppReady(true);

    await initializeFarcasterSDK();

    const readySuccess = await callSDKReady();
    if (readySuccess) {
      setStatus("Farcaster SDK Ready ✅");
    } else {
      setStatus("App Ready ✅");
    }
    console.log("✅ App fully loaded and ready");
  }

  // -------------------------
  // Game Logic
  // -------------------------
  function joinGame() {
    const fidInput = prompt("Masukkan FID Farcaster kamu:");
    if (fidInput) {
      socket.emit("join", { fid: fidInput });
    }
  }

  function submitPrediction() {
    if (prediction.trim()) {
      socket.emit("prediction", { value: prediction.trim() });
      setPrediction("");
    }
  }

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit("chat_message", chatInput.trim());
      setChatInput("");
    }
  }

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
  // Socket Bindings
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
  if (!isAppReady) {
    return (
      <div id="splashScreen">
        <h1>🚀 TX Battle Royale</h1>
        <p className="subtitle">Loading... Please wait</p>
        <p>{status}</p>
      </div>
    );
  }

  return (
    <div id="gameScreen">
      <div className="wrap">
        {/* Header */}
        <header>
          <div>
            <h1>TX Battle Royale</h1>
            <p className="subtitle">Predict & Compete on Bitcoin Blocks</p>
          </div>
          <button onClick={connectFarcaster} className="wallet-btn">
            Connect Farcaster
          </button>
        </header>

        {/* Main game area */}
        <main className="card">
          <h2>Controls</h2>
          <div className="controls">
            <button onClick={joinGame} className="btn">Join Game</button>
            <button onClick={shareLink} className="btn">Share</button>
            <button onClick={prevBlock} className="btn">Prev Block</button>
            <button onClick={currBlock} className="btn">Curr Block</button>
          </div>

          <h3>Prediction</h3>
          <input
            type="text"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Enter prediction..."
          />
          <button onClick={submitPrediction} className="btn">Submit</button>

          <h3>Players ({players.length})</h3>
          <ul className="players-list">
            {players.map((p, idx) => (
              <li key={idx} className="player-item">
                <img
                  src={p.pfp_url}
                  alt={p.username}
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%" }}
                />{" "}
                @{p.username} ({p.display_name})
              </li>
            ))}
          </ul>
        </main>

        {/* Sidebar */}
        <aside>
          <div className="card">
            <h2>Chat</h2>
            <div className="chat-list">
              {messages.map((m, i) => (
                <div key={i} className="chat-item">{m}</div>
              ))}
            </div>
            <form onSubmit={sendChat}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
              />
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
        </aside>

        {/* Footer */}
        <footer>
          <p>TX Battle Royale © 2025 - Powered by Farcaster Mini App</p>
        </footer>
      </div>
    </div>
  );
          }
