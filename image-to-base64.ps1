param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$ImagePath,

    [Parameter(Position = 1)]
    [string]$OutputPath
)

$resolvedPath = Resolve-Path -LiteralPath $ImagePath -ErrorAction Stop
$bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
$base64 = [System.Convert]::ToBase64String($bytes)

if ($OutputPath) {
    [System.IO.File]::WriteAllText($OutputPath, $base64)
    Write-Output "Saved Base64 to: $OutputPath"
} else {
    Write-Output $base64
}
