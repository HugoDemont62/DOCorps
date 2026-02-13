# Script PowerShell pour tester l'Auth API

$baseUrl = "http://localhost:8080"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Test Auth API - DevOpsCorp" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health Check OK" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Register
Write-Host "2. Register new user..." -ForegroundColor Yellow
$registerData = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✓ Registration successful" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Registration Failed (peut-être déjà existant): $_" -ForegroundColor Yellow
}

Write-Host ""

# 3. Login
Write-Host "3. Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $response.token
    Write-Host "Token received: $($token.Substring(0,50))..." -ForegroundColor Gray
    
    Write-Host ""
    
    # 4. Get Profile
    Write-Host "4. Get user profile..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/me" -Method Get -Headers $headers
    Write-Host "✓ Profile retrieved" -ForegroundColor Green
    $profile | ConvertTo-Json
    
    Write-Host ""
    
    # 5. Logout
    Write-Host "5. Logout..." -ForegroundColor Yellow
    $logout = Invoke-RestMethod -Uri "$baseUrl/api/logout" -Method Post -Headers $headers
    Write-Host "✓ Logout successful" -ForegroundColor Green
    $logout | ConvertTo-Json
    
} catch {
    Write-Host "✗ Login Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Tests terminés!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
