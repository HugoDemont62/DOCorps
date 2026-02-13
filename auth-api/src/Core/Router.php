<?php

namespace App\Core;

/**
 * Routeur simple pour gérer les routes de l'API
 */
class Router
{
    private array $routes = [];
    private $notFoundHandler;

    /**
     * Enregistre une route GET
     */
    public function get(string $path, $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    /**
     * Enregistre une route POST
     */
    public function post(string $path, $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    /**
     * Enregistre une route PUT
     */
    public function put(string $path, $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    /**
     * Enregistre une route DELETE
     */
    public function delete(string $path, $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    /**
     * Définit le handler pour les routes non trouvées
     */
    public function notFound($handler): void
    {
        $this->notFoundHandler = $handler;
    }

    /**
     * Ajoute une route
     */
    private function addRoute(string $method, string $path, $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    /**
     * Exécute le routeur
     */
    public function run(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $route['path'] === $path) {
                $this->executeHandler($route['handler']);
                return;
            }
        }

        // Route non trouvée
        if ($this->notFoundHandler) {
            $this->executeHandler($this->notFoundHandler);
        }
    }

    /**
     * Exécute un handler de route
     */
    private function executeHandler($handler): void
    {
        if (is_callable($handler)) {
            $result = $handler();
        } else if (is_string($handler) && strpos($handler, '@') !== false) {
            [$controllerName, $method] = explode('@', $handler);
            $controllerClass = "App\\Controllers\\{$controllerName}";
            
            if (!class_exists($controllerClass)) {
                throw new \Exception("Controller {$controllerClass} not found");
            }
            
            $controller = new $controllerClass();
            
            if (!method_exists($controller, $method)) {
                throw new \Exception("Method {$method} not found in {$controllerClass}");
            }
            
            $result = $controller->$method();
        } else {
            throw new \Exception("Invalid handler");
        }

        if (is_array($result) || is_object($result)) {
            echo json_encode($result);
        } else {
            echo $result;
        }
    }
}
