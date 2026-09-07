def test_register_and_login(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    assert response.json()["user"]["email"] == "alice@example.com"

    response = client.post(
        "/api/auth/login", json={"email": "alice@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login", json={"email": "bob@example.com", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_with_token(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
