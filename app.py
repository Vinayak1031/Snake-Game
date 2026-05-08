from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

# ---------------- DB CONNECTION ----------------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    conn = psycopg2.connect(DATABASE_URL)
else:
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
        return jsonify({
            "message": "Username already exist"
        })

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
        DELETE FROM scores WHERE id IN (
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


#________user leaderboard_________#
@app.route("/my_score/<username>")
def my_score(username):
    conn = psycopg2.connect(
        database="gameproject",
        user="postgres",
        password="newpassword",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()

    cur.execute("""
        SELECT username, score, high_score
        FROM users
        WHERE username=%s
    """, (username,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        return jsonify({
            "leaderboard": [{
                "username": row[0],
                "score": row[1],
                "high_score": row[2]
            }]
        })

    return jsonify({"leaderboard": []})


#####leaderboard#######


@app.route("/leaderboard/<username>")
def leaderboard(username):
    conn = psycopg2.connect(
    database="gameproject",
    user="postgres",
    password="newpassword",
    host="localhost",
    port="5432"
)
    cur = conn.cursor()

    # get friends
    cur.execute("""
        SELECT user1, user2 FROM friends
        WHERE user1=%s OR user2=%s
    """, (username, username))

    rows = cur.fetchall()

    friends = set()

    for u1, u2 in rows:
        if u1 == username:
            friends.add(u2)
        else:
            friends.add(u1)

    # include self
    friends.add(username)

    # convert to tuple for SQL
    friends_tuple = tuple(friends)

    # handle single value tuple edge case
    if len(friends_tuple) == 1:
        query = """
            SELECT username, score, high_score
            FROM users
            WHERE username=%s
        """
        cur.execute(query, (username,))
    else:
        query = f"""
            SELECT username, score, high_score
            FROM users
            WHERE username IN %s
            ORDER BY high_score DESC
        """
        cur.execute(query, (friends_tuple,))

    rows = cur.fetchall()

    result = []
    for r in rows:
        result.append({
            "username": r[0],
            "score": r[1],
            "high_score": r[2]
        })

    cur.close()
    conn.close()

    return jsonify({"leaderboard": result})


# ---------------- SCORE HISTORY ----------------
@app.route("/score_history/<username>")
def score_history(username):
    cur = conn.cursor()

    cur.execute(
        """
        SELECT score FROM scores
        WHERE username=%s
        ORDER BY id DESC
        LIMIT 10
        """,
        (username,)
    )

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

    sender = data["sender"]
    receiver = data["receiver"]

    conn = psycopg2.connect(
        database="gameproject",
        user="postgres",
        password="newpassword",
        host="localhost",
        port="5432"
    )

    cur = conn.cursor()

    # cannot add yourself
    if sender == receiver:
        return jsonify({"message": "Cannot add yourself"})

    # already friends?
    cur.execute("""
        SELECT * FROM friends
        WHERE (user1=%s AND user2=%s)
        OR (user1=%s AND user2=%s)
    """, (sender, receiver, receiver, sender))

    existing_friend = cur.fetchone()

    if existing_friend:
        return jsonify({"message": "Already friends"})

    # delete OLD requests between both users
    cur.execute("""
        DELETE FROM friend_requests
        WHERE (sender=%s AND receiver=%s)
        OR (sender=%s AND receiver=%s)
    """, (sender, receiver, receiver, sender))

    # insert fresh request
    cur.execute("""
        INSERT INTO friend_requests (sender, receiver, status)
        VALUES (%s, %s, 'pending')
    """, (sender, receiver))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Friend request sent"})


# ---------------- VIEW REQUESTS ----------------
@app.route("/requests/<username>")
def requests(username):
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, sender FROM friend_requests
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

    return jsonify({
        "requests": requests_data
    })


# ---------------- ACCEPT REQUEST ----------------
@app.route("/accept_request", methods=["POST"])
def accept_request():
    data = request.json
    cur = conn.cursor()

    request_id = data["request_id"]
    sender = data["sender"]
    receiver = data["receiver"]

    # mark request accepted
    cur.execute(
        "UPDATE friend_requests SET status='accepted' WHERE id=%s",
        (request_id,)
    )

    # 🔴 CHECK if already friends (both directions)
    cur.execute("""
        SELECT * FROM friends
        WHERE (user1=%s AND user2=%s)
        OR (user1=%s AND user2=%s)
    """, (sender, receiver, receiver, sender))

    existing = cur.fetchone()

    if not existing:
        cur.execute(
            "INSERT INTO friends (user1, user2) VALUES (%s, %s)",
            (sender, receiver)
        )

    conn.commit()
    return jsonify({"message": "Friend request accepted"})


# ---------------- REJECT REQUEST ----------------
@app.route("/reject_request", methods=["POST"])
def reject_request():
    data = request.json
    cur = conn.cursor()

    cur.execute(
        "UPDATE friend_requests SET status='rejected' WHERE id=%s",
        (data["request_id"],)
    )

    conn.commit()
    return jsonify({"message": "Friend request rejected"})


# ---------------- GET FRIENDS ----------------
@app.route("/friends/<username>")
def get_friends(username):
    cur = conn.cursor()

    cur.execute("""
        SELECT user1, user2 FROM friends
        WHERE user1=%s OR user2=%s
    """, (username, username))

    rows = cur.fetchall()

    friends = []
    for u1, u2 in rows:
        friends.append(u2 if u1 == username else u1)

    return jsonify({"friends": friends})


# ----------------Remove friend---------

@app.route("/remove_friend", methods=["POST"])
def remove_friend():
    data = request.json
    user1 = data["user1"]
    user2 = data["user2"]

    conn = psycopg2.connect(
        database="gameproject",
        user="postgres",
        password="newpassword",
        host="localhost",
        port="5432"
    )

    cur = conn.cursor()

    # remove friendship
    cur.execute("""
        DELETE FROM friends
        WHERE (user1=%s AND user2=%s)
        OR (user1=%s AND user2=%s)
    """, (user1, user2, user2, user1))

    # remove old requests
    cur.execute("""
        DELETE FROM friend_requests
        WHERE (sender=%s AND receiver=%s)
        OR (sender=%s AND receiver=%s)
    """, (user1, user2, user2, user1))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Friend removed"})

@app.route("/test")
def test():
    return "test route works"
# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
