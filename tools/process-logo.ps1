param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new((Resolve-Path $InputPath).Path)
$format = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
$bitmap = [System.Drawing.Bitmap]::new($source.Width, $source.Height, $format)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
$graphics.Dispose()
$source.Dispose()

$rect = [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
$data = $bitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $format)
$bytes = [byte[]]::new([Math]::Abs($data.Stride) * $data.Height)
[Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

$minX = $bitmap.Width
$minY = $bitmap.Height
$maxX = -1
$maxY = -1

for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
        $index = ($y * $data.Stride) + ($x * 4)
        $blue = [int]$bytes[$index]
        $green = [int]$bytes[$index + 1]
        $red = [int]$bytes[$index + 2]
        $dominance = $green - [Math]::Max($red, $blue)

        if ($green -gt 120 -and $dominance -gt 20) {
            if ($dominance -ge 80) {
                $bytes[$index + 3] = 0
            } else {
                $alpha = [Math]::Round(255 * (1 - (($dominance - 20) / 60)))
                $bytes[$index + 3] = [byte][Math]::Max(0, [Math]::Min(255, $alpha))
                $bytes[$index + 1] = [byte][Math]::Min($green, [Math]::Max($red, $blue) + 10)
            }
        }

        if ($bytes[$index + 3] -gt 8) {
            $minX = [Math]::Min($minX, $x)
            $minY = [Math]::Min($minY, $y)
            $maxX = [Math]::Max($maxX, $x)
            $maxY = [Math]::Max($maxY, $y)
        }
    }
}

[Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bitmap.UnlockBits($data)

if ($maxX -lt $minX -or $maxY -lt $minY) {
    $bitmap.Dispose()
    throw "Nenhum pixel visivel encontrado apos remover o fundo."
}

$padding = 12
$contentWidth = $maxX - $minX + 1
$contentHeight = $maxY - $minY + 1
$target = [System.Drawing.Bitmap]::new($contentWidth + ($padding * 2), $contentHeight + ($padding * 2), $format)
$targetGraphics = [System.Drawing.Graphics]::FromImage($target)
$targetGraphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$targetGraphics.Clear([System.Drawing.Color]::Transparent)
$destination = [System.Drawing.Rectangle]::new($padding, $padding, $contentWidth, $contentHeight)
$sourceRect = [System.Drawing.Rectangle]::new($minX, $minY, $contentWidth, $contentHeight)
$targetGraphics.DrawImage($bitmap, $destination, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
$targetGraphics.Dispose()
$bitmap.Dispose()

$absoluteOutput = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$target.Save($absoluteOutput, [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
