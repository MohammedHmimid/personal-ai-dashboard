def test_create_and_list_notes(client, auth_headers):
    response = client.post(
        "/api/notes",
        json={"title": "Ma première note", "content": "Contenu **markdown**", "tags": ["idée"]},
        headers=auth_headers,
    )
    assert response.status_code == 201
    note = response.json()
    assert note["title"] == "Ma première note"
    assert note["tags"][0]["name"] == "idée"

    response = client.get("/api/notes", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_and_delete_note(client, auth_headers):
    create = client.post("/api/notes", json={"title": "À modifier"}, headers=auth_headers)
    note_id = create.json()["id"]

    update = client.put(
        f"/api/notes/{note_id}", json={"is_favorite": True}, headers=auth_headers
    )
    assert update.status_code == 200
    assert update.json()["is_favorite"] is True

    delete = client.delete(f"/api/notes/{note_id}", headers=auth_headers)
    assert delete.status_code == 204

    get_after = client.get(f"/api/notes/{note_id}", headers=auth_headers)
    assert get_after.status_code == 404


def test_notes_are_isolated_between_users(client):
    client.post(
        "/api/auth/register",
        json={"name": "User A", "email": "a@example.com", "password": "password123"},
    )
    token_a = client.post(
        "/api/auth/login", json={"email": "a@example.com", "password": "password123"}
    ).json()["access_token"]

    client.post(
        "/api/auth/register",
        json={"name": "User B", "email": "b@example.com", "password": "password123"},
    )
    token_b = client.post(
        "/api/auth/login", json={"email": "b@example.com", "password": "password123"}
    ).json()["access_token"]

    client.post(
        "/api/notes",
        json={"title": "Note privée de A"},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    response_b = client.get("/api/notes", headers={"Authorization": f"Bearer {token_b}"})
    assert response_b.status_code == 200
    assert response_b.json() == []
