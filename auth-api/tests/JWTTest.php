<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Core\JWT;

class JWTTest extends TestCase
{
    protected function setUp(): void
    {
        $_ENV['JWT_SECRET'] = 'test-secret-key';
        $_ENV['JWT_ALGORITHM'] = 'HS256';
        $_ENV['JWT_EXPIRATION'] = '3600';
    }

    public function testGenerateToken(): void
    {
        $payload = [
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'role' => 'user'
        ];

        $token = JWT::generate($payload);
        
        $this->assertNotEmpty($token);
        $this->assertIsString($token);
    }

    public function testValidateToken(): void
    {
        $payload = [
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'role' => 'user'
        ];

        $token = JWT::generate($payload);
        $decoded = JWT::validate($token);
        
        $this->assertNotNull($decoded);
        $this->assertEquals($payload['id'], $decoded['id']);
        $this->assertEquals($payload['username'], $decoded['username']);
        $this->assertEquals($payload['email'], $decoded['email']);
    }

    public function testInvalidTokenReturnsNull(): void
    {
        $invalidToken = 'invalid.token.here';
        $decoded = JWT::validate($invalidToken);
        
        $this->assertNull($decoded);
    }
}
