param(
    [Parameter(Position = 0)]
    [string]$WorkbookPath,

    [Parameter(Position = 1)]
    [string]$OutputDirectory = 'D:\Project Biostation\tests\fixtures\employee-faces'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Remove-Diacritics {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }

    $Value = $Value.Replace([string][char]0x0111, 'd').Replace([string][char]0x0110, 'D')
    $normalized = $Value.Normalize([Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder

    foreach ($char in $normalized.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }

    return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function ConvertTo-FileSlug {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }

    $normalized = Remove-Diacritics $Value
    $normalized = $normalized.ToLowerInvariant()
    $normalized = $normalized -replace '[^a-z0-9]+', '-'
    $normalized = $normalized -replace '^-+', ''
    $normalized = $normalized -replace '-+$', ''

    return $normalized
}

function Get-CellText {
    param(
        $Worksheet,
        [int]$Row,
        [int]$Column
    )

    return [string]$Worksheet.Cells.Item($Row, $Column).Text
}

function Get-SttPart {
    param([string]$Value)

    $trimmed = $Value.Trim()
    $number = 0

    if ([int]::TryParse($trimmed, [ref]$number)) {
        return $number.ToString('000')
    }

    $slug = ConvertTo-FileSlug $trimmed
    if ($slug) {
        return $slug
    }

    return 'na'
}

function New-WorkbookXlsxExport {
    param($Workbook)

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $root = Join-Path ([IO.Path]::GetTempPath()) ("faceid-xlsx-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $root | Out-Null
    $xlsxPath = Join-Path $root 'workbook.xlsx'
    $extractPath = Join-Path $root 'unzipped'

    $Workbook.SaveAs($xlsxPath, 51)
    $Workbook.Close($false)
    Start-Sleep -Milliseconds 300
    [System.IO.Compression.ZipFile]::ExtractToDirectory($xlsxPath, $extractPath)

    return [pscustomobject]@{
        Root = $root
        ExtractPath = $extractPath
        SheetRelsPath = Join-Path $extractPath 'xl\worksheets\_rels\sheet1.xml.rels'
        MediaDirectory = Join-Path $extractPath 'xl\media'
    }
}

function Get-ShapeImageMap {
    param(
        [string]$SheetRelsPath,
        [string]$ExtractPath
    )

    [xml]$sheetRelsXml = Get-Content -LiteralPath $SheetRelsPath
    $drawingRelationship = @($sheetRelsXml.Relationships.Relationship | Where-Object { $_.Type -like '*/drawing' })[0]
    if (-not $drawingRelationship) {
        throw 'Could not find drawing relationship for sheet1.'
    }

    $worksheetDirectory = Join-Path $ExtractPath 'xl\worksheets'
    $drawingPath = [IO.Path]::GetFullPath((Join-Path $worksheetDirectory ([string]$drawingRelationship.Target)))
    $drawingRelsPath = Join-Path (Join-Path (Split-Path $drawingPath -Parent) '_rels') ((Split-Path $drawingPath -Leaf) + '.rels')

    [xml]$drawingXml = Get-Content -LiteralPath $drawingPath
    [xml]$relsXml = Get-Content -LiteralPath $drawingRelsPath

    $relationshipMap = @{}
    foreach ($relationship in $relsXml.Relationships.Relationship) {
        $relationshipMap[$relationship.Id] = [string]$relationship.Target
    }

    $namespaceManager = New-Object System.Xml.XmlNamespaceManager($drawingXml.NameTable)
    $namespaceManager.AddNamespace('xdr', 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing')
    $namespaceManager.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
    $namespaceManager.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

    $anchors = $drawingXml.SelectNodes('//xdr:twoCellAnchor | //xdr:oneCellAnchor', $namespaceManager)
    $map = @{}

    foreach ($anchor in $anchors) {
        $row = [int]$anchor.from.row + 1
        $column = [int]$anchor.from.col + 1
        $embedId = [string]$anchor.pic.blipFill.blip.embed

        if ($column -ne 10 -or -not $embedId -or -not $relationshipMap.ContainsKey($embedId)) {
            continue
        }

        $target = $relationshipMap[$embedId] -replace '^\.\./media/', ''
        if (-not $map.ContainsKey($row)) {
            $map[$row] = $target
        }
    }

    return $map
}

function Resolve-WorkbookPath {
    param([string]$CandidatePath)

    if ($CandidatePath) {
        return (Resolve-Path -LiteralPath $CandidatePath).Path
    }

    $match = Get-ChildItem -LiteralPath 'C:\Users\ADMIN\Downloads' -Filter '*.xls' -File |
        Where-Object { $_.Name -like 'DS CC*FaceID*.xls' } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $match) {
        throw 'Could not locate the FaceID workbook in Downloads. Pass WorkbookPath explicitly.'
    }

    return $match.FullName
}

$resolvedWorkbookPath = Resolve-WorkbookPath $WorkbookPath
if (-not (Test-Path -LiteralPath $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

Get-ChildItem -LiteralPath $OutputDirectory -Filter 'emp-*' -File -ErrorAction SilentlyContinue | Remove-Item -Force
$manifestPath = Join-Path $OutputDirectory 'employee-faces.manifest.json'
if (Test-Path -LiteralPath $manifestPath) {
    Remove-Item -LiteralPath $manifestPath -Force
}

$excel = $null
$workbook = $null
$worksheet = $null
$manifest = New-Object System.Collections.Generic.List[object]
$shapeRecords = New-Object System.Collections.Generic.List[object]
$fileNameCounts = @{}
$exportedCount = 0
$skippedCount = 0
$pictureShapeCount = 0
$xlsxExport = $null

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $workbook = $excel.Workbooks.Open($resolvedWorkbookPath)
    $worksheet = $workbook.Worksheets.Item(1)
    $shapeCount = $worksheet.Shapes.Count

    for ($index = 1; $index -le $shapeCount; $index++) {
        $shape = $worksheet.Shapes.Item($index)

        try {
            $column = $shape.TopLeftCell.Column
            if ($column -ne 10) {
                continue
            }

            $pictureShapeCount++
            $row = $shape.TopLeftCell.Row
            $stt = (Get-CellText -Worksheet $worksheet -Row $row -Column 1).Trim()
            $name = (Get-CellText -Worksheet $worksheet -Row $row -Column 3).Trim()

            if (-not $stt -and -not $name) {
                $skippedCount++
                continue
            }

            $shapeRecords.Add([pscustomobject]@{
                Row = $row
                Stt = $stt
                Name = $name
                Sheet = [string]$worksheet.Name
            })
        }
        finally {
            if ($shape) {
                [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($shape)
            }
        }
    }

    $xlsxExport = New-WorkbookXlsxExport $workbook
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook)
    $workbook = $null
    $shapeImageMap = Get-ShapeImageMap -SheetRelsPath $xlsxExport.SheetRelsPath -ExtractPath $xlsxExport.ExtractPath

    foreach ($record in $shapeRecords) {
        if (-not $shapeImageMap.ContainsKey($record.Row)) {
            $skippedCount++
            continue
        }

        $sttPart = Get-SttPart $record.Stt
        $namePart = ConvertTo-FileSlug $record.Name
        if ($namePart) {
            $baseName = "emp-$sttPart-$namePart"
        } else {
            $baseName = "emp-$sttPart-row-$($record.Row)"
        }

        $extension = [IO.Path]::GetExtension($shapeImageMap[$record.Row])
        if (-not $extension) {
            $extension = '.png'
        }

        if ($fileNameCounts.ContainsKey($baseName)) {
            $fileNameCounts[$baseName]++
            $fileName = "$baseName-$($fileNameCounts[$baseName])$extension"
        } else {
            $fileNameCounts[$baseName] = 1
            $fileName = "$baseName$extension"
        }

        $sourceFile = Join-Path $xlsxExport.MediaDirectory $shapeImageMap[$record.Row]
        $outputPath = Join-Path $OutputDirectory $fileName
        Copy-Item -LiteralPath $sourceFile -Destination $outputPath -Force

        $manifest.Add([pscustomobject]@{
            stt = $record.Stt
            name = $record.Name
            row = $record.Row
            sheet = $record.Sheet
            fileName = $fileName
        })

        $exportedCount++
    }

    $manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

    Write-Output "Workbook: $resolvedWorkbookPath"
    Write-Output "OutputDirectory: $OutputDirectory"
    Write-Output "PictureShapesInColumnJ: $pictureShapeCount"
    Write-Output "Exported: $exportedCount"
    Write-Output "Skipped: $skippedCount"
    Write-Output "Manifest: $manifestPath"
}
finally {
    if ($workbook) {
        $workbook.Close($false)
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook)
    }

    if ($worksheet) {
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($worksheet)
    }

    if ($excel) {
        $excel.Quit()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
    }

    if ($xlsxExport -and (Test-Path -LiteralPath $xlsxExport.Root)) {
        Remove-Item -LiteralPath $xlsxExport.Root -Recurse -Force
    }

    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
