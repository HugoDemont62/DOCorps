<?php

namespace App\Core;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Exception;

/**
 * Gestionnaire de tokens JWT
 */
class JWT
{
    /**
     * Génère un token JWT pour un utilisateur
     */
    public static function generate(array $payload): string
    {
        $secret = $_ENV['JWT_SECRET'];
        $algorithm = $_ENV['JWT_ALGORITHM'] ?? 'HS256';
        $expiration = $_ENV['JWT_EXPIRATION'] ?? 3600;

        $issuedAt = time();
        $expirationTime = $issuedAt + (int)$expiration;

        $token = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => $payload
        ];

        return FirebaseJWT::encode($token, $secret, $algorithm);
    }

    /**
     * Valide et décode un token JWT
     */
    public static function validate(string $token): ?array
    {
        try {
            $secret = $_ENV['JWT_SECRET'];
            $algorithm = $_ENV['JWT_ALGORITHM'] ?? 'HS256';

            $decoded = FirebaseJWT::decode($token, new Key($secret, $algorithm));
            return (array)$decoded->data;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Extrait le token depuis les headers
     */
    public static function getTokenFromRequest(): ?string
    {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            return null;
        }

        $authHeader = $headers['Authorization'];
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Vérifie si la requête a un token valide
     */
    public static function requireAuth(): ?array
    {
        $token = self::getTokenFromRequest();

        if (!$token) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'No token provided'
            ]);
            exit;
        }

        $payload = self::validate($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid or expired token'
            ]);
            exit;
        }

        return $payload;
    }
}
