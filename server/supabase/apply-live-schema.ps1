param(
  [string]$DbUrl = $env:SUPABASE_DB_URL,
  [switch]$UseLinked
)

$schemaFile = "server/supabase/live_schema.sql"

if (!(Test-Path $schemaFile)) {
  throw "Schema file not found: $schemaFile"
}

if ($UseLinked) {
  npx --yes supabase db query --linked -f $schemaFile
  exit $LASTEXITCODE
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
  throw "Set SUPABASE_DB_URL or pass -DbUrl, or use -UseLinked with a logged-in Supabase CLI session."
}

npx --yes supabase db query --db-url $DbUrl -f $schemaFile
exit $LASTEXITCODE
