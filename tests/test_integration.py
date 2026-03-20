"""
test_integration.py — Tests d'intégration DevOpsCorp
=====================================================
Ces tests vérifient que les services tournent ensemble correctement.
Ils nécessitent que docker-compose soit lancé AVANT de les exécuter :

    docker compose up -d
    pytest tests/test_integration.py -v

Les tests sont skippés automatiquement si les services ne répondent pas,
donc ils ne cassent pas la CI classique (qui utilise des tests unitaires).
"""

import os
import pytest
import requests

# ── Configuration ─────────────────────────────────────────────────────────────
AUTH_API_URL = os.environ.get("AUTH_API_URL", "http://localhost:8080")
PRODUCT_API_URL = os.environ.get("PRODUCT_API_URL", "http://localhost:5000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

TIMEOUT = 5  # secondes


def service_available(url: str) -> bool:
    """Retourne True si le service répond en moins de TIMEOUT secondes."""
    try:
        requests.get(url, timeout=TIMEOUT)
        return True
    except requests.exceptions.ConnectionError:
        return False


# ── Markers pytest ────────────────────────────────────────────────────────────
requires_auth_api = pytest.mark.skipif(
    not service_available(AUTH_API_URL),
    reason=f"Auth API non disponible sur {AUTH_API_URL}",
)

requires_product_api = pytest.mark.skipif(
    not service_available(PRODUCT_API_URL),
    reason=f"Product API non disponible sur {PRODUCT_API_URL}",
)

requires_all_services = pytest.mark.skipif(
    not (service_available(AUTH_API_URL) and service_available(PRODUCT_API_URL)),
    reason="Un ou plusieurs services sont indisponibles",
)


# ── Fixtures ──────────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def admin_token():
    """
    Crée un compte admin de test et retourne son JWT.
    Utilisé par les tests qui nécessitent une authentification.
    """
    # Tentative de création du compte (peut échouer si déjà existant)
    requests.post(
        f"{AUTH_API_URL}/api/register",
        json={
            "username": "integration_admin",
            "email": "integration_admin@test.com",
            "password": "IntegrationTest123!",
        },
        timeout=TIMEOUT,
    )
    # Connexion
    resp = requests.post(
        f"{AUTH_API_URL}/api/login",
        json={"email": "integration_admin@test.com", "password": "IntegrationTest123!"},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200, f"Login échoué : {resp.text}"
    return resp.json()["token"]


@pytest.fixture(scope="module")
def user_token():
    """Crée un compte user de test et retourne son JWT."""
    requests.post(
        f"{AUTH_API_URL}/api/register",
        json={
            "username": "integration_user",
            "email": "integration_user@test.com",
            "password": "IntegrationTest123!",
        },
        timeout=TIMEOUT,
    )
    resp = requests.post(
        f"{AUTH_API_URL}/api/login",
        json={"email": "integration_user@test.com", "password": "IntegrationTest123!"},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200
    return resp.json()["token"]


# ── Tests Auth API ────────────────────────────────────────────────────────────
class TestAuthAPI:
    @requires_auth_api
    def test_health_check(self):
        resp = requests.get(f"{AUTH_API_URL}/health", timeout=TIMEOUT)
        assert resp.status_code == 200

    @requires_auth_api
    def test_register_new_user(self):
        import time
        unique = int(time.time())
        resp = requests.post(
            f"{AUTH_API_URL}/api/register",
            json={
                "username": f"user_{unique}",
                "email": f"user_{unique}@test.com",
                "password": "TestPassword123!",
            },
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data.get("success") is True

    @requires_auth_api
    def test_register_duplicate_email_fails(self):
        # Premier register
        requests.post(
            f"{AUTH_API_URL}/api/register",
            json={"username": "dup", "email": "dup@test.com", "password": "Test123!"},
            timeout=TIMEOUT,
        )
        # Deuxième avec le même email
        resp = requests.post(
            f"{AUTH_API_URL}/api/register",
            json={"username": "dup2", "email": "dup@test.com", "password": "Test123!"},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 409, 422)

    @requires_auth_api
    def test_login_bad_password(self):
        resp = requests.post(
            f"{AUTH_API_URL}/api/login",
            json={"email": "integration_admin@test.com", "password": "wrong"},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 401, 403)

    @requires_auth_api
    def test_me_with_valid_token(self, admin_token):
        resp = requests.get(
            f"{AUTH_API_URL}/api/me",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "user" in data

    @requires_auth_api
    def test_me_without_token(self):
        resp = requests.get(f"{AUTH_API_URL}/api/me", timeout=TIMEOUT)
        assert resp.status_code in (401, 403)


# ── Tests Product API ─────────────────────────────────────────────────────────
class TestProductAPI:
    @requires_product_api
    def test_health_check(self):
        resp = requests.get(f"{PRODUCT_API_URL}/health", timeout=TIMEOUT)
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    @requires_product_api
    def test_list_products_requires_auth(self):
        resp = requests.get(f"{PRODUCT_API_URL}/products", timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

    @requires_all_services
    def test_list_products_with_token(self, user_token):
        resp = requests.get(
            f"{PRODUCT_API_URL}/products",
            headers={"Authorization": f"Bearer {user_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @requires_all_services
    def test_create_product_as_user_forbidden(self, user_token):
        resp = requests.post(
            f"{PRODUCT_API_URL}/products",
            json={"name": "Test", "price": 9.99},
            headers={"Authorization": f"Bearer {user_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 403


# ── Test flux complet (E2E simplifié) ─────────────────────────────────────────
class TestEndToEnd:
    @requires_all_services
    def test_flux_complet_auth_puis_produits(self, user_token):
        """
        Scénario complet :
        1. L'utilisateur est déjà connecté (fixture user_token)
        2. Il consulte la liste des produits
        3. Il reçoit une réponse valide
        """
        resp = requests.get(
            f"{PRODUCT_API_URL}/products",
            headers={"Authorization": f"Bearer {user_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        products = resp.json()
        assert isinstance(products, list)

    @requires_all_services
    def test_token_auth_accepte_par_product_api(self, admin_token):
        """
        Le token émis par l'Auth API PHP doit être accepté par la Product API Python.
        Vérifie que les deux services partagent bien le même JWT_SECRET.
        """
        resp = requests.get(
            f"{PRODUCT_API_URL}/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, (
            f"Le token Auth API n'est pas reconnu par Product API. "
            f"Vérifiez que JWT_SECRET est identique dans les deux services. "
            f"Réponse : {resp.text}"
        )
