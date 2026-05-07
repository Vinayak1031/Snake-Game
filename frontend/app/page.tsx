"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  // ---------------- STATE ----------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [playGame, setPlayGame] = useState(false);
  const [paused, setPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [showScoreHistory, setShowScoreHistory] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<any[]>([]);
  const [showFriendsLeaderboard, setShowFriendsLeaderboard] = useState(false);


  // ---------------- AUTH ----------------
  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setLoggedIn(true);
      }
    } catch {
      setMessage("Server Error");
    }
  };

  const handleRemoveFriend = async (friend: string) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/remove_friend",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1: username,
          user2: friend,
        }),
      }
    );

    const data = await response.json();
    setMessage(data.message);

    // refresh friends list
    handleGetFriends();
  } catch {
    setMessage("Server Error");
  }
};

  const handleSignup = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage("Server Error");
    }
  };

  const handleGetUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/users");
      const data = await response.json();
      setUsers(data.users);
    } catch {
      setMessage("Server Error");
    }
  };

  const handleDeleteUser = async (u: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: u,
        }),
      });

      const data = await response.json();
      setMessage(data.message);
      handleGetUsers();
    } catch {
      setMessage("Server Error");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setPlayGame(false);
    setPaused(false);
    setMessage("Logged Out");
  };

  const handleCreateGame = () => {
    setPlayGame(true);
    setPaused(false);
  };

  const backToMenu = () => {
    setPlayGame(false);
    setPaused(false);
  };

  const handleRejectRequest = async (requestId: number) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/reject_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request_id: requestId }),
    });

    const data = await response.json();
    setMessage(data.message);
    handleGetRequests();
  } catch {
    setMessage("Server Error");
  }
};

const handleGetFriends = async () => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/friends/${username}`
    );
    const data = await response.json();
    setFriends(data.friends);
  } catch {
    setMessage("Server Error");
  }
};

  // ---------------- LEADERBOARD ----------------
  const handleGetLeaderboard = async () => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/my_score/${username}`
    );

    const data = await response.json();
    setLeaderboard(data.leaderboard);
  } catch {
    setMessage("Server Error");
  }
};

  const handleGetFriendsLeaderboard = async () => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/leaderboard/${username}`
    );

    const data = await response.json();
    setFriendsLeaderboard(data.leaderboard);
  } catch {
    setMessage("Server Error");
  }
};



  // ---------------- SCORE HISTORY ----------------
  const handleGetScoreHistory = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/score_history/${username}`
      );
      const data = await response.json();
      setScoreHistory(data.scores);
    } catch {
      setMessage("Server Error");
    }
  };

  // ---------------- FRIEND REQUESTS ----------------
  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/send_request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: username,
            receiver: friendUsername,
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage("Server Error");
    }
  };

  const handleGetRequests = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/requests/${username}`
      );
      const data = await response.json();
      setRequests(data.requests);
    } catch {
      setMessage("Server Error");
    }
  };

  const handleAcceptRequest = async (
    requestId: number,
    sender: string
  ) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/accept_request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: requestId,
            sender,
            receiver: username,
          }),
        }
      );
    

      const data = await response.json();
      setMessage(data.message);
      handleGetRequests();
    } catch {
      setMessage("Server Error");
    }
  };

  // ---------------- GAME ----------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const head = useRef({
    x: 0,
    y: 0,
    dir: "stop",
  });

  const food = useRef({
    x: 0,
    y: 100,
  });

  const segments = useRef<{ x: number; y: number }[]>([]);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);

  useEffect(() => {
    if (!playGame) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BOX = 20;
    const SIZE = 600;

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && head.current.dir !== "down") head.current.dir = "up";
      if (e.key === "ArrowDown" && head.current.dir !== "up") head.current.dir = "down";
      if (e.key === "ArrowLeft" && head.current.dir !== "right") head.current.dir = "left";
      if (e.key === "ArrowRight" && head.current.dir !== "left") head.current.dir = "right";
    };

    window.addEventListener("keydown", keyHandler);

    const move = () => {
      if (head.current.dir === "up") head.current.y += BOX;
      if (head.current.dir === "down") head.current.y -= BOX;
      if (head.current.dir === "left") head.current.x -= BOX;
      if (head.current.dir === "right") head.current.x += BOX;
    };

    let timer: any;

    const loop = async () => {
      if (paused) {
        timer = setTimeout(loop, 100);
        return;
      }

      ctx.fillStyle = "pink";
      ctx.fillRect(0, 0, SIZE, SIZE);

      const cx = (x: number) => x + SIZE / 2;
      const cy = (y: number) => SIZE / 2 - y;

      // food
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(cx(food.current.x), cy(food.current.y), 10, 0, Math.PI * 2);
      ctx.fill();

      // body follow
      for (let i = segments.current.length - 1; i > 0; i--) {
        segments.current[i] = { ...segments.current[i - 1] };
      }

      if (segments.current.length) {
        segments.current[0] = { ...head.current };
      }

      move();

      // food collision
      const dx = head.current.x - food.current.x;
      const dy = head.current.y - food.current.y;

      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        food.current.x = Math.floor(Math.random() * 29 - 14) * 20;
        food.current.y = Math.floor(Math.random() * 29 - 14) * 20;
        segments.current.push({ x: 1000, y: 1000 });
        scoreRef.current++;

        if (scoreRef.current > highScoreRef.current) {
          highScoreRef.current = scoreRef.current;
        }
      }

      // border collision
      if (
        head.current.x > 290 ||
        head.current.x < -290 ||
        head.current.y > 290 ||
        head.current.y < -290
      ) {
        try {
          await fetch("http://127.0.0.1:5000/save_score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              score: scoreRef.current,
            }),
          });
        } catch {
          console.log("Score save failed");
        }

        head.current = { x: 0, y: 0, dir: "stop" };
        segments.current = [];
        scoreRef.current = 0;
        food.current = { x: 0, y: 100 };
      }

      // body collision
      for (let s of segments.current) {
        const dist = Math.sqrt(
          (head.current.x - s.x) ** 2 +
          (head.current.y - s.y) ** 2
        );

        if (dist < 20) {
          try {
            await fetch("http://127.0.0.1:5000/save_score", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username,
                score: scoreRef.current,
              }),
            });
          } catch {
            console.log("Score save failed");
          }

          head.current = { x: 0, y: 0, dir: "stop" };
          segments.current = [];
          scoreRef.current = 0;
        }
      }

      // snake body
      ctx.fillStyle = "grey";
      segments.current.forEach((s) => {
        ctx.fillRect(cx(s.x) - 10, cy(s.y) - 10, 20, 20);
      });

      // snake head
      ctx.fillStyle = "black";
      ctx.fillRect(
        cx(head.current.x) - 10,
        cy(head.current.y) - 10,
        20,
        20
      );

      // score (FIXED)
      ctx.fillStyle = "black";
      ctx.font = "20px Courier";
      ctx.fillText(
        `Score: ${scoreRef.current} High Score: ${highScoreRef.current}`,
        100,
        30
      );

      timer = setTimeout(loop, 100);
    };

    loop();

    return () => {
      window.removeEventListener("keydown", keyHandler);
      clearTimeout(timer);
    };
  }, [playGame, paused]);

  // ---------------- UI ----------------
  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-[350px] rounded-2xl bg-zinc-900 p-8 shadow-2xl">

        {/* LOGIN */}
        {!loggedIn && (
          <>
            <h1 className="mb-6 text-center text-3xl font-bold text-white">
              Game Login
            </h1>

            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 p-3 text-white"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="mb-4 w-full rounded-lg bg-zinc-800 p-3 text-white"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="mb-3 w-full rounded-lg bg-blue-600 p-3 text-white"
            >
              Login
            </button>

            <button
              onClick={handleSignup}
              className="mb-3 w-full rounded-lg bg-green-600 p-3 text-white"
            >
              Create Account
            </button>

            <button
              onClick={() => {
                handleGetUsers();
                setShowUsers(!showUsers);
              }}
              className="w-full rounded-lg bg-purple-600 p-3 text-white"
            >
              {showUsers ? "Hide Users" : "Show Users"}
            </button>
          </>
        )}

        {/* DASHBOARD */}
        {loggedIn && !playGame && (
          <>
            <h1 className="mb-6 text-center text-3xl font-bold text-white">
              Game Menu
            </h1>
        

            <button
              onClick={handleCreateGame}
              className="mb-3 w-full rounded-lg bg-green-600 p-3 text-white"
            >
              Create New Game
            </button>

            <button
              onClick={() => {
                handleGetLeaderboard();
                setShowLeaderboard(!showLeaderboard);
              }}
              className="mb-3 w-full rounded-lg bg-yellow-500 p-3 font-bold text-black"
            >
              {showLeaderboard ? "Hide Leaderboard" : "Leaderboard"}
            </button>

            <button
              onClick={() => {
                handleGetFriendsLeaderboard();
                setShowFriendsLeaderboard(!showFriendsLeaderboard);
              }}
              className="mb-3 w-full rounded-lg bg-cyan-500 p-3 font-bold text-black"
            >
              {showFriendsLeaderboard
                ? "Hide Friends Leaderboard"
                : "Friends Leaderboard"}
            </button>

            <button
              onClick={() => {
                handleGetScoreHistory();
                setShowScoreHistory(!showScoreHistory);
              }}
              className="mb-3 w-full rounded-lg bg-orange-500 p-3 text-white"
            >
              {showScoreHistory ? "Hide Score History" : "Score History"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-600 p-3 text-white"
            >
              Logout
            </button>

            {/* FRIEND SYSTEM */}
        <div className="mt-6">

          {/* ADD FRIEND */}
          <div className="mb-4 rounded-xl bg-zinc-800 p-4">
            <h2 className="mb-3 text-lg font-bold text-white">Add Friend</h2>

            <input
              className="mb-3 w-full rounded-lg bg-zinc-700 p-2 text-white"
              placeholder="Enter username"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
            />

            <button
              onClick={handleSendFriendRequest}
              className="w-full rounded-lg bg-cyan-600 p-2 text-white"
            >
              Send Request
            </button>
          </div>

          {/* FRIEND REQUESTS */}
          <div className="mb-4 rounded-xl bg-zinc-800 p-4">
            <div className="mb-3 flex justify-between">
              <h2 className="text-lg font-bold text-white">Requests</h2>
              <button
                onClick={handleGetRequests}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white"
              >
                Refresh
              </button>
            </div>

            {requests.length === 0 && (
              <p className="text-gray-400 text-sm">No requests</p>
            )}

            {requests.map((r, i) => (
              <div
                key={i}
                className="mb-2 flex items-center justify-between rounded-lg bg-zinc-700 p-2 text-white"
              >
                <span>{r.sender}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(r.id, r.sender)}
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleRejectRequest(r.id)}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FRIEND LIST */}
          <div className="rounded-xl bg-zinc-800 p-4">
            <div className="mb-3 flex justify-between">
              <h2 className="text-lg font-bold text-white">Friends</h2>
              <button
                onClick={handleGetFriends}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
              >
                Refresh
              </button>
            </div>

            {friends.length === 0 && (
              <p className="text-gray-400 text-sm">No friends yet</p>
            )}

            {friends.map((f, i) => (
              <div
                key={i}
                className="mb-2 flex items-center justify-between rounded-lg bg-zinc-700 p-2 text-white"
              >
                <span>👤 {f}</span>

                <button
                  onClick={() => handleRemoveFriend(f)}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* GAME */}
        {playGame && (
          <>
            <button
              onClick={backToMenu}
              className="mb-2 w-full rounded-lg bg-gray-500 p-2 text-white"
            >
              ⬅ Back to Menu
            </button>

            <button
              onClick={() => setPaused(!paused)}
              className="mb-2 w-full rounded-lg bg-yellow-500 p-2 font-bold text-black"
            >
              {paused ? "Resume Game" : "Pause Game"}
            </button>

            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="border-4 border-white"
            />
          </>
        )}

        {/* MESSAGE */}
        <p className="mt-4 text-center text-white">{message}</p>

        {/* USERS */}
        {showUsers && (
          <div className="mt-6">
            {users.map((u, i) => (
              <div
                key={i}
                className="mb-2 flex items-center justify-between rounded-lg bg-zinc-800 p-2 text-white"
              >
                <span>{u}</span>
                <button
                  onClick={() => handleDeleteUser(u)}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        

        {/* LEADERBOARD */}
        {showLeaderboard && (
          <div className="mt-6">
            {leaderboard.map((u, i) => (
              <div
                key={i}
                className="mb-2 rounded-lg bg-yellow-700 p-3 text-white"
              >
                <div>👤 {u.username}</div>
                <div>Score: {u.score}</div>
                <div>High Score: {u.high_score}</div>
              </div>
            ))}
          </div>
        )}


          {/* FRIENDS LEADERBOARD */}
          {showFriendsLeaderboard && (
            <div className="mt-6">
              {friendsLeaderboard.length === 0 && (
                <p className="text-gray-400 text-center">
                  No friends data available
                </p>
              )}

              {friendsLeaderboard.map((u, i) => (
                <div
                  key={i}
                  className="mb-2 rounded-lg bg-cyan-700 p-3 text-white"
                >
                  <div>👤 {u.username}</div>
                  <div>Score: {u.score}</div>
                  <div>High Score: {u.high_score}</div>
                </div>
              ))}
            </div>
          )}


          
        {/* SCORE HISTORY */}
        {showScoreHistory && (
          <div className="mt-6">
            {scoreHistory.map((s, i) => (
              <div
                key={i}
                className="mb-2 rounded-lg bg-orange-700 p-3 text-white"
              >
                <div>Score: {s.score}</div>
                <div>{s.played_at || ""}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}