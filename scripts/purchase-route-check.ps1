$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000/api'

$wallet = Invoke-RestMethod -Method Post -Uri "$base/auth/wallet" -ContentType 'application/json' -Body '{"walletAddress":"0x2222222222222222222222222222222222222222"}'
$token = $wallet.token
$headers = @{ Authorization = "Bearer $token" }

$before = Invoke-RestMethod -Method Get -Uri "$base/payments/history" -Headers $headers
$direct = Invoke-RestMethod -Method Post -Uri "$base/payments/vt/purchase" -Headers $headers -ContentType 'application/json' -Body '{"usdAmount":5}'
$after = Invoke-RestMethod -Method Get -Uri "$base/payments/history" -Headers $headers
$checkout = Invoke-RestMethod -Method Post -Uri "$base/payments/stripe/checkout" -Headers $headers -ContentType 'application/json' -Body '{"tier":"tier_1","returnUrl":"http://localhost:3000/shop?from=dashboard"}'

[PSCustomObject]@{
  historyBefore = ($before.purchases | Measure-Object).Count
  historyAfter = ($after.purchases | Measure-Object).Count
  historyDelta = (($after.purchases | Measure-Object).Count - ($before.purchases | Measure-Object).Count)
  directVt = $direct.vtAmount
  stripeUrlReturned = [bool]$checkout.url
} | Format-List
