<?php

namespace App\Controllers;

use App\Models\User;
use App\Core\JWT;

/**
 * Contrôleur d'authentification
 */
class AuthController
{
    /**
     * Inscription d'un nouvel utilisateur
     * POST /api/register
     */
    public function register(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $errorResponse = $this->buildValidationError($data);
        if ($errorResponse !== null) {
            return $errorResponse;
        }

        $user = User::create($data['username'], $data['email'], $data['password']);
        if (!$user) {
            http_response_code(500);
            return ['success' => false, 'error' => 'Failed to create user'];
        }

        http_response_code(201);
        return ['success' => true, 'message' => 'User registered successfully', 'user' => $user];
    }

    /**
     * Valide les données et vérifie les conflits d'unicité.
     * Retourne un tableau de réponse d'erreur, ou null si tout est valide.
     */
    private function buildValidationError(array $data): ?array
    {
        $errors = $this->validateRegistration($data);
        if (!empty($errors)) {
            http_response_code(400);
            return ['success' => false, 'errors' => $errors];
        }

        $conflictMessage = $this->findConflict($data);
        if ($conflictMessage !== null) {
            http_response_code(409);
            return ['success' => false, 'error' => $conflictMessage];
        }

        return null;
    }

    private function findConflict(array $data): ?string
    {
        if (User::emailExists($data['email'])) {
            return 'Email already exists';
        }
        if (User::usernameExists($data['username'])) {
            return 'Username already exists';
        }
        return null;
    }

    /**
     * Connexion d'un utilisateur
     * POST /api/login
     */
    public function login(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return [
                'success' => false,
                'error' => 'Email and password are required'
            ];
        }

        // Trouver l'utilisateur
        $user = User::findByEmail($data['email']);

        if (!$user || !User::verifyPassword($data['password'], $user['password'])) {
            http_response_code(401);
            return [
                'success' => false,
                'error' => 'Invalid credentials'
            ];
        }

        // Générer le token JWT
        $token = JWT::generate([
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
    }

    /**
     * Récupère les informations de l'utilisateur connecté
     * GET /api/me
     */
    public function me(): array
    {
        $userData = JWT::requireAuth();

        $user = User::findById($userData['id']);

        if (!$user) {
            http_response_code(404);
            return [
                'success' => false,
                'error' => 'User not found'
            ];
        }

        return [
            'success' => true,
            'user' => $user
        ];
    }

    /**
     * Déconnexion (invalide le token côté client)
     * POST /api/logout
     */
    public function logout(): array
    {
        // La déconnexion est gérée côté client en supprimant le token
        // On pourrait ajouter une blacklist de tokens ici si nécessaire
        
        return [
            'success' => true,
            'message' => 'Logged out successfully'
        ];
    }

    /**
     * Valide les données d'inscription
     */
    private function validateRegistration(array $data): array
    {
        $errors = [];

        if (empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } elseif (strlen($data['username']) < 3) {
            $errors['username'] = 'Username must be at least 3 characters';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        return $errors;
    }
}
