<?php

/**
 * DevOpsCorp - Auth API
 * Point d'entrée principal de l'API
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Router;
use App\Core\Database;
use Dotenv\Dotenv;

// Charger les variables d'environnement
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Configuration des headers CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_ENV['CORS_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialiser la base de données
Database::initialize();

// Initialiser le routeur
$router = new Router();

// Routes publiques
$router->post('/api/register', 'AuthController@register');
$router->post('/api/login', 'AuthController@login');

// Routes protégées (nécessitent un token JWT)
$router->get('/api/me', 'AuthController@me');
$router->post('/api/logout', 'AuthController@logout');

// Route de health check
$router->get('/health', function() {
    return [
        'status' => 'ok',
        'service' => 'auth-api',
        'timestamp' => date('Y-m-d H:i:s')
    ];
});

// Route 404
$router->notFound(function() {
    http_response_code(404);
    return [
        'success' => false,
        'error' => 'Route not found'
    ];
});

// Exécuter le routeur
try {
    $router->run();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : 'Internal server error'
    ]);
}
