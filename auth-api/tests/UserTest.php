<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Models\User;
use App\Core\Database;

class UserTest extends TestCase
{
    protected function setUp(): void
    {
        // Utiliser une base de données de test en mémoire
        $_ENV['DB_PATH'] = ':memory:';
        Database::initialize();
    }

    public function testCreateUser(): void
    {
        $user = User::create('testuser', 'test@example.com', 'password123');
        
        $this->assertNotNull($user);
        $this->assertEquals('testuser', $user['username']);
        $this->assertEquals('test@example.com', $user['email']);
        $this->assertEquals('user', $user['role']);
    }

    public function testFindUserByEmail(): void
    {
        User::create('testuser', 'test@example.com', 'password123');
        
        $user = User::findByEmail('test@example.com');
        
        $this->assertNotNull($user);
        $this->assertEquals('testuser', $user['username']);
    }

    public function testEmailExists(): void
    {
        User::create('testuser', 'test@example.com', 'password123');
        
        $this->assertTrue(User::emailExists('test@example.com'));
        $this->assertFalse(User::emailExists('nonexistent@example.com'));
    }

    public function testVerifyPassword(): void
    {
        $password = 'password123';
        $hash = password_hash($password, PASSWORD_BCRYPT);
        
        $this->assertTrue(User::verifyPassword($password, $hash));
        $this->assertFalse(User::verifyPassword('wrongpassword', $hash));
    }

    public function testDuplicateEmailFails(): void
    {
        User::create('user1', 'test@example.com', 'password123');
        $user2 = User::create('user2', 'test@example.com', 'password456');
        
        $this->assertNull($user2);
    }
}
