param(
    [Parameter(Position = 0)]
    [string]$InputDirectory = 'D:\Project Biostation\tests\fixtures\employee-faces',

    [Parameter(Position = 1)]
    [string]$OutputDirectory = 'D:\Project Biostation\tests\fixtures\employee-faces-base64'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$resolvedInputDirectory = (Resolve-Path -LiteralPath $InputDirectory).Path
if (-not (Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

Get-ChildItem -LiteralPath $OutputDirectory -Filter '*.txt' -File -ErrorAction SilentlyContinue | Remove-Item -Force

$imageFiles = Get-ChildItem -LiteralPath $resolvedInputDirectory -File |
    Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp' }

foreach ($imageFile in $imageFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($imageFile.FullName)
    $base64 = [System.Convert]::ToBase64String($bytes)
    $outputPath = Join-Path $OutputDirectory ($imageFile.BaseName + '.txt')
    [System.IO.File]::WriteAllText($outputPath, $base64)
    Write-Output "Converted: $($imageFile.Name) -> $outputPath"
}

Write-Output "Done. Total converted: $($imageFiles.Count)"
