# Xoa cac thu muc API trong (da xoa het file)
# Chay tu thu muc ecobacgiangFE-main:
#   .\scripts\remove-empty-api-folders.ps1
# Hoac: pwsh -File scripts\remove-empty-api-folders.ps1

$root = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path } else { Get-Location }
$base = Join-Path $root "pages\api"
$foldersToRemove = @(
    "address",
    "admin",
    "analyze",
    "banks",
    "cart",
    "check-sepay-status",
    "checkout",
    "coupon",
    "create-momo-payment",
    "create-sepay-payment",
    "create-sepay-payment-simple",
    "debug-payments",
    "favorites",
    "image",
    "momo-callback",
    "orders",
    "payment",
    "posts",
    "products",
    "refresh-sepay-qr",
    "results",
    "sepay-callback",
    "sepay-webhook-real",
    "socket",
    "submit",
    "subscription",
    "test-sepay-callback",
    "user",
    "wishlist"
)

foreach ($name in $foldersToRemove) {
    $path = Join-Path $base $name
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "Removed: $path"
    }
}
Write-Host "Done. Kept: auth, promo-banner, recruitment"
