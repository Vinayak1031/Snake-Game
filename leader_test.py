from app import app

def test_leaderboard():
    client = app.test_client()

    response = client.get("/leaderboard/testuser")

    assert response.status_code == 200
