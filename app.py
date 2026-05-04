from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

# ---------------- DB CONNECTION ----------------
conn = psycopg2.connect(
    database="gameproject",
    user="postgres",
    password="newpassword",
    host="localhost",
    port="5432"
)

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (data["username"], data["password"])
    )

    user = cur.fetchone()

    if user:
        return jsonify({"success": True, "message": "Login success"})

    return jsonify({"success": False, "message": "Invalid credentials"})


# ---------------- SIGNUP ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE username=%s",
        (data["username"],)
    )

    existing_user = cur.fetchone()

    if existing_user:
        return jsonify({ "message": "Username already exist" })

    cur.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)",
        (data["username"], data["password"])
    )

    conn.commit()

    return jsonify({"message": "User created"})


# ---------------- USERS ----------------
@app.route("/users")
def users():
    cur = conn.cursor()

    cur.execute("SELECT username FROM users")
    rows = cur.fetchall()

    return jsonify({
        "users": [r[0] for r in rows]
    })


# ---------------- DELETE USER ----------------
@app.route("/delete", methods=["POST"])
def delete_user():
    data = request.json
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM users WHERE username=%s",
        (data["username"],)
    )

    conn.commit()

    return jsonify({"message": "User deleted (if existed)"})


# ---------------- SAVE SCORE ----------------
@app.route("/save_score", methods=["POST"])
def save_score():
    data = request.json
    cur = conn.cursor()

    username = data["username"]
    score = data["score"]

    # save score (NO TIME COLUMN)
    cur.execute(
        "INSERT INTO scores (username, score) VALUES (%s, %s)",
        (username, score)
    )

    # keep only last 10 scores
    cur.execute(
        """
        DELETE FROM scores
        WHERE id IN (
            SELECT id FROM scores
            WHERE username=%s
            ORDER BY id DESC
            OFFSET 10
        )
        """,
        (username,)
    )

    # update high score
    cur.execute(
        "SELECT high_score FROM users WHERE username=%s",
        (username,)
    )

    result = cur.fetchone()

    if result:
        current_high = result[0]

        if score > current_high:
            cur.execute(
                "UPDATE users SET high_score=%s WHERE username=%s",
                (score, username)
            )

        cur.execute(
            "UPDATE users SET score=%s WHERE username=%s",
            (score, username)
        )

    conn.commit()

    return jsonify({"message": "Score saved"})


# ---------------- LEADERBOARD ----------------
@app.route("/leaderboard")
def leaderboard():
    cur = conn.cursor()

    cur.execute("""
        SELECT username, score, high_score
        FROM users
        ORDER BY high_score DESC
    """)

    rows = cur.fetchall()

    leaderboard_data = []

    for r in rows:
        leaderboard_data.append({
            "username": r[0],
            "score": r[1],
            "high_score": r[2]
        })

    return jsonify({
        "leaderboard": leaderboard_data
    })


# ---------------- SCORE HISTORY ----------------
@app.route("/score_history/<username>")
def score_history(username):
    cur = conn.cursor()

    cur.execute("""
        SELECT score
        FROM scores
        WHERE username=%s
        ORDER BY id DESC
        LIMIT 10
    """, (username,))

    rows = cur.fetchall()

    history = []

    for r in rows:
        history.append({
            "score": r[0]
        })

    return jsonify({
        "scores": history
    })


# ---------------- SEND FRIEND REQUEST ----------------
@app.route("/send_request", methods=["POST"])
def send_request():
    data = request.json
    cur = conn.cursor()

    sender = data["sender"]
    receiver = data["receiver"]

    cur.execute(
        """
        SELECT * FROM friend_requests
        WHERE sender=%s AND receiver=%s
        """,
        (sender, receiver)
    )

    existing = cur.fetchone()

    if existing:
        return jsonify({"message": "Request already sent"})

    cur.execute(
        """
        INSERT INTO friend_requests (sender, receiver)
        VALUES (%s, %s)
        """,
        (sender, receiver)
    )

    conn.commit()

    return jsonify({"message": "Friend request sent"})


# ---------------- VIEW REQUESTS ----------------
@app.route("/requests/<username>")
def requests(username):
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, sender
        FROM friend_requests
        WHERE receiver=%s AND status='pending'
        """,
        (username,)
    )

    rows = cur.fetchall()

    requests_data = []

    for r in rows:
        requests_data.append({
            "id": r[0],
            "sender": r[1]
        })

    return jsonify({"requests": requests_data})


# ---------------- ACCEPT REQUEST ----------------
@app.route("/accept_request", methods=["POST"])
def accept_request():
    data = request.json
    cur = conn.cursor()

    request_id = data["request_id"]
    sender = data["sender"]
    receiver = data["receiver"]

    cur.execute(
        "UPDATE friend_requests SET status='accepted' WHERE id=%s",
        (request_id,)
    )

    cur.execute(
        "INSERT INTO friends (user1, user2) VALUES (%s, %s)",
        (sender, receiver)
    )

    conn.commit()

    return jsonify({"message": "Friend request accepted"})


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)
