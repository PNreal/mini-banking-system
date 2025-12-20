# Script để chạy test cho các services
# Usage: .\run-tests.ps1 [service-name]
# Example: .\run-tests.ps1 log-service
#          .\run-tests.ps1 account-service

param(
    [string]$Service = "all"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MINI BANKING SYSTEM - TEST RUNNER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tự động detect JAVA_HOME
function Set-JavaHome {
    try {
        $javaPath = (Get-Command java -ErrorAction SilentlyContinue).Source
        if ($javaPath) {
            $javaHome = Split-Path (Split-Path $javaPath)
            $env:JAVA_HOME = $javaHome
            Write-Host "✓ JAVA_HOME auto-detected: $env:JAVA_HOME" -ForegroundColor Green
            return $true
        } else {
            # Thử các đường dẫn phổ biến
            $commonPaths = @(
                "C:\Program Files\Eclipse Adoptium\jdk-17*",
                "C:\Program Files\Java\jdk-17*",
                "C:\Program Files\OpenJDK\jdk-17*",
                "$env:ProgramFiles\Eclipse Adoptium\jdk-17*"
            )
            
            foreach ($pathPattern in $commonPaths) {
                $found = Get-ChildItem -Path $pathPattern -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($found) {
                    $env:JAVA_HOME = $found.FullName
                    Write-Host "✓ JAVA_HOME found: $env:JAVA_HOME" -ForegroundColor Green
                    return $true
                }
            }
            
            Write-Host "✗ Java not found. Please install Java 17 or set JAVA_HOME manually." -ForegroundColor Red
            Write-Host "  Example: `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot'" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "✗ Error detecting Java: $_" -ForegroundColor Red
        return $false
    }
}

# Chạy test cho một service
function Run-Test {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Host ""
    Write-Host "Testing $ServiceName..." -ForegroundColor Yellow
    Write-Host "Path: $ServicePath" -ForegroundColor Gray
    
    Push-Location $ServicePath
    
    try {
        if (Test-Path ".\mvnw.cmd") {
            Write-Host "Running: .\mvnw.cmd test" -ForegroundColor Cyan
            & .\mvnw.cmd test
            $exitCode = $LASTEXITCODE
            
            if ($exitCode -eq 0) {
                Write-Host "✓ $ServiceName tests PASSED" -ForegroundColor Green
            } else {
                Write-Host "✗ $ServiceName tests FAILED (exit code: $exitCode)" -ForegroundColor Red
            }
            
            return $exitCode
        } else {
            Write-Host "✗ mvnw.cmd not found in $ServicePath" -ForegroundColor Red
            return 1
        }
    } catch {
        Write-Host "✗ Error running tests: $_" -ForegroundColor Red
        return 1
    } finally {
        Pop-Location
    }
}

# Main execution
Write-Host "Step 1: Setting up JAVA_HOME..." -ForegroundColor Cyan
if (-not (Set-JavaHome)) {
    Write-Host ""
    Write-Host "Please set JAVA_HOME manually and run again:" -ForegroundColor Yellow
    Write-Host '  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"' -ForegroundColor Yellow
    Write-Host '  .\run-tests.ps1' -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking Java version..." -ForegroundColor Cyan
try {
    $javaVersion = & java -version 2>&1 | Select-Object -First 1
    Write-Host "  $javaVersion" -ForegroundColor Gray
} catch {
    Write-Host "✗ Cannot run java command" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Running tests..." -ForegroundColor Cyan

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$services = @{
    "log-service" = "$rootPath\services\log-service\log-service"
    "account-service" = "$rootPath\services\account-service\account-service"
    "transaction-service" = "$rootPath\services\transaction-service\transaction-service"
    "admin-service" = "$rootPath\services\admin-service\admin-service"
    "user-service" = "$rootPath\services\user-service\user-service"
    "notification-service" = "$rootPath\services\notification-service\notification-service"
}

$results = @{}
$totalTests = 0
$passedTests = 0

if ($Service -eq "all") {
    Write-Host "Running tests for ALL services..." -ForegroundColor Cyan
    foreach ($serviceName in $services.Keys) {
        $servicePath = $services[$serviceName]
        if (Test-Path $servicePath) {
            $result = Run-Test -ServiceName $serviceName -ServicePath $servicePath
            $results[$serviceName] = $result
            $totalTests++
            if ($result -eq 0) {
                $passedTests++
            }
        } else {
            Write-Host "✗ Service path not found: $servicePath" -ForegroundColor Red
            $results[$serviceName] = -1
        }
    }
} else {
    if ($services.ContainsKey($Service)) {
        $servicePath = $services[$Service]
        if (Test-Path $servicePath) {
            $result = Run-Test -ServiceName $Service -ServicePath $servicePath
            $results[$Service] = $result
            $totalTests = 1
            if ($result -eq 0) {
                $passedTests = 1
            }
        } else {
            Write-Host "✗ Service path not found: $servicePath" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ Unknown service: $Service" -ForegroundColor Red
        Write-Host "Available services: $($services.Keys -join ', ')" -ForegroundColor Yellow
        exit 1
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($serviceName in $results.Keys) {
    $result = $results[$serviceName]
    if ($result -eq 0) {
        Write-Host "  ✓ $serviceName : PASSED" -ForegroundColor Green
    } elseif ($result -eq -1) {
        Write-Host "  ✗ $serviceName : NOT FOUND" -ForegroundColor Yellow
    } else {
        Write-Host "  ✗ $serviceName : FAILED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total: $passedTests/$totalTests services passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    exit 0
} else {
    exit 1
}

