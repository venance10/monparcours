$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot "assets/js/config.js"
if (-not (Test-Path -LiteralPath $configPath)) {
  throw "Impossible de trouver assets/js/config.js"
}

$secure = Read-Host "Nouveau mot de passe admin" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
)

if ([string]::IsNullOrWhiteSpace($plain) -or $plain.Length -lt 8) {
  throw "Choisissez un mot de passe de 8 caracteres minimum."
}

$bytes = [Text.Encoding]::UTF8.GetBytes($plain)
$hashBytes = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
$hash = ([BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()

$content = Get-Content -Raw -LiteralPath $configPath
$content = $content -replace 'export const ADMIN_PASS_HASH = "[a-f0-9]{64}";', "export const ADMIN_PASS_HASH = `"$hash`";"
Set-Content -LiteralPath $configPath -Value $content -Encoding UTF8

Write-Host "Mot de passe admin mis a jour. Rechargez admin.html avec Ctrl+F5." -ForegroundColor Green
