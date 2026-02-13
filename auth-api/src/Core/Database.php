<?php

namespace App\Core;

use PDO;
use PDOException;

/**
 * Gestionnaire de base de données SQLite
 */
class Database
{
    private static ?PDO $connection = null;

    /**
     * Initialise la connexion à la base de données
     */
    public static function initialize(): void
    {
        $dbPath = $_ENV['DB_PATH'] ?? 'database/auth.db';
        $dbDir = dirname($dbPath);

        // Créer le dossier database s'il n'existe pas
        if (!file_exists($dbDir)) {
            mkdir($dbDir, 0755, true);
        }

        try {
            self::$connection = new PDO("sqlite:{$dbPath}");
            self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Créer les tables si elles n'existent pas
            self::createTables();
        } catch (PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    /**
     * Récupère la connexion à la base de données
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::initialize();
        }
        
        return self::$connection;
    }

    /**
     * Crée les tables nécessaires
     */
    private static function createTables(): void
    {
        $sql = "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
        ";

        self::$connection->exec($sql);
    }

    /**
     * Exécute une requête SELECT
     */
    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Exécute une requête SELECT et retourne un seul résultat
     */
    public static function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Exécute une requête INSERT, UPDATE ou DELETE
     */
    public static function execute(string $sql, array $params = []): bool
    {
        $stmt = self::getConnection()->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Récupère l'ID du dernier insert
     */
    public static function lastInsertId(): string
    {
        return self::getConnection()->lastInsertId();
    }
}
