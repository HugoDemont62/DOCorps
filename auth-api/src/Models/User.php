<?php

namespace App\Models;

use App\Core\Database;

/**
 * Modèle User
 */
class User
{
    /**
     * Crée un nouvel utilisateur
     */
    public static function create(string $username, string $email, string $password, string $role = 'user'): ?array
    {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, [
            'cost' => (int)($_ENV['BCRYPT_COST'] ?? 12)
        ]);

        $sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
        
        try {
            Database::execute($sql, [$username, $email, $hashedPassword, $role]);
            $userId = Database::lastInsertId();
            return self::findById($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Trouve un utilisateur par ID
     */
    public static function findById(int $id): ?array
    {
        $sql = "SELECT id, username, email, role, created_at FROM users WHERE id = ?";
        return Database::queryOne($sql, [$id]);
    }

    /**
     * Trouve un utilisateur par email
     */
    public static function findByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = ?";
        return Database::queryOne($sql, [$email]);
    }

    /**
     * Trouve un utilisateur par username
     */
    public static function findByUsername(string $username): ?array
    {
        $sql = "SELECT * FROM users WHERE username = ?";
        return Database::queryOne($sql, [$username]);
    }

    /**
     * Vérifie si un email existe déjà
     */
    public static function emailExists(string $email): bool
    {
        return self::findByEmail($email) !== null;
    }

    /**
     * Vérifie si un username existe déjà
     */
    public static function usernameExists(string $username): bool
    {
        return self::findByUsername($username) !== null;
    }

    /**
     * Vérifie le mot de passe
     */
    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Récupère tous les utilisateurs
     */
    public static function all(): array
    {
        $sql = "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";
        return Database::query($sql);
    }

    /**
     * Supprime un utilisateur
     */
    public static function delete(int $id): bool
    {
        $sql = "DELETE FROM users WHERE id = ?";
        return Database::execute($sql, [$id]);
    }

    /**
     * Met à jour le rôle d'un utilisateur
     */
    public static function updateRole(int $id, string $role): bool
    {
        $sql = "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return Database::execute($sql, [$role, $id]);
    }
}
