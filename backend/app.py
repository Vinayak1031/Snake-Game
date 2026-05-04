from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Fake database
users = {
    "vinayak": "1234"
}


# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username in users and users[username] == password:

        return jsonify({
            "success": True,
            "message": "Login Successful"
        })

    return jsonify({
        "success": False,
        "message": "Invalid Username or Password"
    }), 401


# ---------------- SIGNUP ----------------
@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username in users:

        return jsonify({
            "success": False,
            "message": "Username already exists"
        }), 400

    users[username] = password

    return jsonify({
        "success": True,
        "message": "Account Created Successfully"
    })


# ---------------- USERS ----------------
@app.route("/users", methods=["GET"])
def get_users():

    user_list = list(users.keys())

    return jsonify({
        "users": user_list
    })


if __name__ == "__main__":
    app.run(debug=True)