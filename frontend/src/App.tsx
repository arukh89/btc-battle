import React, { useEffect } from "react";
import "./styles/globals.css";

declare global {
  interface Window {
    APP_NAME: string;
    BACKEND_URL: string;
    farcasterSdk?: any;
  }
}

const App: React.FC = () => {
  useEffect(() => {
    // Set default configs if not injected
    if (!window.APP_NAME) window.APP_NAME = "TX Battle Royale";
    if (!window.BACKEND_URL) window.BACKEND_URL = "https://your-backend-replit-url";
  }, []);

  return (
    <>
      {/* ================= SPLASH ================= */}
      <div id="splashScreen">
        <h1>🚀 TX Battle Royale</h1>
        <p className="subtitle">Loading... Please wait</p>
        <p id="status">Initializing...</p>
      </div>

      {/* ================= GAME ================= */}
      <div id="gameScreen" style={{ display: "none" }}>
        <div className="wrap">
          {/* Header */}
          <header>
            <div>
              <h1>TX Battle Royale</h1>
              <p className="subtitle">Predict & Compete on Bitcoin Blocks</p>
            </div>
            <button id="connectWalletBtn" className="wallet-btn">
              Connect Farcaster
            </button>
          </header>

          {/* Left side (main game) */}
          <div className="card">
            <h2>Controls</h2>
            <div className="controls">
              <button id="joinBtn" className="btn">
                Join Game
              </button>
              <button id="shareBtn" className="btn">
                Share
              </button>
              <button id="prevBlockBtn" className="btn">
                Prev Block
              </button>
              <button id="currBlockBtn" className="btn">
                Curr Block
              </button>
            </div>

            <h3>Prediction</h3>
            <input
              type="text"
              id="predictionInput"
              placeholder="Enter prediction..."
            />
            <button id="submitPredictionBtn" className="btn">
              Submit
            </button>

            <h3>
              Players <span id="playerCount">(0)</span>
            </h3>
            <ul id="playersContainer" className="players-list"></ul>
          </div>

          {/* Right side (chat + leaderboard) */}
          <div>
            <div className="card">
              <h2>Chat</h2>
              <div id="messagesList" className="chat-list"></div>
              <form id="chatForm">
                <input
                  id="chatInput"
                  type="text"
                  placeholder="Type a message..."
                />
              </form>
            </div>

            <div className="card">
              <h2>Leaderboard</h2>
              <ul id="leaderboardContainer" className="leaderboard-list"></ul>
            </div>
          </div>

          {/* Footer */}
          <footer>
            <p>TX Battle Royale © 2025 - Powered by Farcaster Mini App</p>
          </footer>
        </div>
      </div>

      {/* ================= SCRIPTS ================= */}
      <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
      <script src="/app.js"></script>
    </>
  );
};

export default App;
