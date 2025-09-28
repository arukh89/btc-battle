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
  const [fid, setFid] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [prediction, setPrediction] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [isAppReady, setIsAppReady] = useState(false);

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
    const fidInput = prompt("Masukkan FID Farcaster kamu:") || fid;
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
    <div className="app">
      <div id="splashScreen">
        <h1>Loading...</h1>
        <p>{status}</p>
      </div>

      <div id="gameScreen" style={{ display: "none" }}>
        <h1>TX Battle Royale</h1>
        <p>Status: {status}</p>

        <button onClick={joinGame}>Join Game</button>
        <button onClick={connectFarcaster}>Connect Farcaster Wallet</button>
        <button onClick={shareLink}>Share</button>
        <button onClick={prevBlock}>Prev Block</button>
        <button onClick={currBlock}>Curr Block</button>

        <h2>Players ({players.length})</h2>
        <ul>
          {players.map((p, idx) => (
            <li key={idx}>
              <img src={p.pfp_url} alt={p.username} width={32} height={32} style={{ borderRadius: "50%" }} /> @
              {p.username} ({p.display_name})
            </li>
          ))}
        </ul>

        <h2>Chat</h2>
        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "5px" }}>
          {messages.map((m, i) => (
            <div key={i} className="chat-line">
              {m}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (messages.length) {
              socket.emit("chat_message", messages[messages.length - 1]);
            }
          }}
        >
          <input value={prediction} onChange={(e) => setPrediction(e.target.value)} placeholder="Enter message or prediction" />
          <button type="submit">Send</button>
        </form>

        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, idx) => (
            <li key={idx}>
              @{entry.username}: {entry.score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
              }
