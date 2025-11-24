# Script to create project archive excluding large folders
$sourcePath = "."
$destinationPath = "projet_endobio_analysis.zip"

# Delete existing archive if it exists
if (Test-Path $destinationPath) {
    Remove-Item $destinationPath -Force
}

# Get all files excluding specific directories
$files = Get-ChildItem -Path $sourcePath -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\.next\\' -and
    $_.FullName -notmatch '\\.git\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.Name -notmatch '\.env' -and
    $_.Name -ne 'nul' -and
    $_.Name -ne 'projet_endobio_analysis.zip'
}

# Create archive
$files | Compress-Archive -DestinationPath $destinationPath -CompressionLevel Optimal

Write-Host "Archive created successfully: $destinationPath"
Write-Host "Total files archived: $($files.Count)"
