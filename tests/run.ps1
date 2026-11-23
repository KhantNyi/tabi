# Runs Tabi's tests in a headless browser (Edge, or Chrome) and prints the results.
#   tests\run.ps1                      every suite
#   tests\run.ps1 -only maps,stations  just these
# Exits 1 if any check fails, so it can gate a commit or a CI step.
param([string]$only = "", [int]$minutes = 20)
$ErrorActionPreference = "Stop"
$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { Write-Error "Edge or Chrome is needed to run the tests." }

$page = (Join-Path $PSScriptRoot "index.html") -replace '\\', '/'
$url = "file:///$page" + ($(if ($only) { "?only=$only" } else { "" }))
$tmp = Join-Path $env:TEMP ("tabi-tests-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
$out = "$tmp.html"
$started = Get-Date
Write-Host "running $(if ($only) { $only } else { 'every suite' }) in $(Split-Path $browser -Leaf)..."
$p = Start-Process -FilePath $browser -PassThru -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError "$tmp.err" -ArgumentList @(
  "--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--no-first-run", "--user-data-dir=`"$tmp`"",
  "--virtual-time-budget=3600000", "--dump-dom", "`"$url`"")
if (-not $p.WaitForExit($minutes * 60 * 1000)) { try { $p.Kill() } catch {} ; Write-Host "TIMED OUT after $minutes minutes"; exit 2 }

$dom = Get-Content $out -Raw -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $tmp, $out, "$tmp.err" -ErrorAction SilentlyContinue
$m = [regex]::Match([string]$dom, '<pre id="o">([\s\S]*?)</pre>')
if (-not $m.Success) { Write-Host "the test page did not run"; exit 2 }
$text = [System.Net.WebUtility]::HtmlDecode(($m.Groups[1].Value -replace '<[^>]*>', '')).TrimEnd()
foreach ($l in $text -split "`n") {
  $c = if ($l -match '^\s*FAIL|^FAILED') { "Red" } elseif ($l -match '^PASS|^ALL PASSED') { "Green" } else { "Gray" }
  Write-Host $l -ForegroundColor $c
}
Write-Host ("took {0:n0}s" -f ((Get-Date) - $started).TotalSeconds)
if ($text -notmatch 'DONE\s*$') { Write-Host "the run did not finish"; exit 2 }
if ($text -match 'FAILED:') { exit 1 }
exit 0
