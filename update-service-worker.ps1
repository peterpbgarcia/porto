
$ErrorActionPreference = 'Stop'

try {
    $root = $PSScriptRoot
    $worker = Join-Path $root 'service-worker.js'

    if (-not (Test-Path -LiteralPath $worker)) {
        throw "service-worker.js not found: $worker"
    }

    $content = Get-Content -LiteralPath $worker -Raw

    $pattern = 'const\s+CACHE_NAME\s*=\s*"compendio-v(\d+)\.(\d+)\.(\d+)"\s*;'
    $match = [regex]::Match($content, $pattern)

    if (-not $match.Success) {
        throw 'Could not find CACHE_NAME in the expected format.'
    }

    $major = [int]$match.Groups[1].Value
    $minor = [int]$match.Groups[2].Value
    $patch = [int]$match.Groups[3].Value + 1
    $version = "$major.$minor.$patch"

    $newVersionLine = 'const CACHE_NAME = "compendio-v{0}";' -f $version
    $content = [regex]::Replace(
        $content,
        $pattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            $newVersionLine
        },
        1
    )

    $excludedFolders = @(
        '.git', 'node_modules', 'android', 'ios',
        '.gradle', '.idea', '.vscode'
    )

    $files = @(
        Get-ChildItem -LiteralPath $root -Recurse -File |
        Where-Object {
            $relative = $_.FullName.Substring($root.Length).TrimStart('\', '/')
            $parts = $relative -split '[\\/]'

            ($parts[0] -notin $excludedFolders) -and
            ($_.Name -ne 'service-worker.js') -and
            ($_.Name -ne 'update-service-worker.ps1') -and
            ($_.Extension -notin @('.bat', '.bak', '.ps1'))
        } |
        ForEach-Object {
            '/' + $_.FullName.Substring($root.Length).TrimStart('\', '/').Replace('\', '/')
        } |
        Sort-Object -Unique
    )

    $entries = ($files | ForEach-Object {
        '    "' + $_ + '"'
    }) -join ",`r`n"

    $array = "const APP_FILES = [`r`n$entries`r`n];"

    $arrayPattern = 'const\s+APP_FILES\s*=\s*\[[\s\S]*?\]\s*;'

    if (-not [regex]::IsMatch($content, $arrayPattern)) {
        throw 'Could not find the APP_FILES array.'
    }

    $content = [regex]::Replace(
        $content,
        $arrayPattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            $array
        },
        1
    )

    $backup = "$worker.bak"
    Copy-Item -LiteralPath $worker -Destination $backup -Force

    [System.IO.File]::WriteAllText(
        $worker,
        $content,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host ''
    Write-Host 'SUCCESS!' -ForegroundColor Green
    Write-Host "New cache version: compendio-v$version"
    Write-Host "Files in cache list: $($files.Count)"
    Write-Host "Backup: $backup"
}
catch {
    Write-Host ''
    Write-Host 'ERROR: Update failed.' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Yellow
}

Write-Host ''
Read-Host 'Press ENTER to close'
