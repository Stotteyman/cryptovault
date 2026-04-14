$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000/api'

$wallet = Invoke-RestMethod -Method Post -Uri "$base/auth/wallet" -ContentType 'application/json' -Body '{"walletAddress":"0x1111111111111111111111111111111111111111"}'
$token = $wallet.token
$headers = @{ Authorization = "Bearer $token" }

$google = Invoke-RestMethod -Method Post -Uri "$base/auth/google" -ContentType 'application/json' -Body '{"profile":{"sub":"google_dev_smoke","email":"google_dev_smoke@vaultcrawler.local"}}'
$apple = Invoke-RestMethod -Method Post -Uri "$base/auth/apple" -ContentType 'application/json' -Body '{"profile":{"sub":"apple_dev_smoke","email":"apple_dev_smoke@vaultcrawler.local"}}'
$discord = Invoke-RestMethod -Method Post -Uri "$base/auth/discord" -ContentType 'application/json' -Body '{"profile":{"id":"discord_dev_smoke","email":"discord_dev_smoke@vaultcrawler.local"}}'
$steam = Invoke-RestMethod -Method Post -Uri "$base/auth/steam" -ContentType 'application/json' -Body '{"steamId":"steam_dev_smoke"}'

$verify = Invoke-RestMethod -Method Post -Uri "$base/auth/verify" -Headers $headers
$tiers = Invoke-RestMethod -Method Get -Uri "$base/payments/tiers" -Headers $headers
$stripe = Invoke-RestMethod -Method Post -Uri "$base/payments/stripe/checkout" -Headers $headers -ContentType 'application/json' -Body '{"tier":"tier_1","returnUrl":"http://localhost:3000/shop"}'
$iapApple = Invoke-RestMethod -Method Post -Uri "$base/payments/apple/verify" -Headers $headers -ContentType 'application/json' -Body '{"receipt":"sandbox_receipt","productId":"com.vaultcrawler.vt_500"}'
$iapGoogle = Invoke-RestMethod -Method Post -Uri "$base/payments/google/verify" -Headers $headers -ContentType 'application/json' -Body '{"packageName":"com.vaultcrawler.game","productId":"vt_500_package","purchaseToken":"sandbox_token"}'
$direct = Invoke-RestMethod -Method Post -Uri "$base/payments/vt/purchase" -Headers $headers -ContentType 'application/json' -Body '{"usdAmount":5}'
$history = Invoke-RestMethod -Method Get -Uri "$base/payments/history" -Headers $headers

[PSCustomObject]@{
  walletProvider = $wallet.user.provider
  googleProvider = $google.user.provider
  appleProvider = $apple.user.provider
  discordProvider = $discord.user.provider
  steamProvider = $steam.user.provider
  verifyValid = [bool]$verify.valid
  stripeUrlReturned = [bool]$stripe.url
  appleIapSuccess = [bool]$iapApple.success
  googleIapSuccess = [bool]$iapGoogle.success
  directVtAmount = $direct.vtAmount
  purchaseHistoryCount = ($history.purchases | Measure-Object).Count
  stripeTierCount = $tiers.tiers.PSObject.Properties.Count
  iapTierCount = $tiers.iapTiers.PSObject.Properties.Count
} | Format-List
