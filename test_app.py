from app import app
def test_login():
    client = app.test_client()

    response = client.post('/login', json={
        "username": "vinayak",
        "password": "carry"
    })

    assert response.status_code == 200
