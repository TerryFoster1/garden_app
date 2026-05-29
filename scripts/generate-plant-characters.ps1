Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\assets\plants\characters"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Canvas {
  param([string]$bg1, [string]$bg2)
  $bitmap = New-Object System.Drawing.Bitmap 900, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $rect = New-Object System.Drawing.Rectangle 0, 0, 900, 900
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.ColorTranslator]::FromHtml($bg1)), ([System.Drawing.ColorTranslator]::FromHtml($bg2)), 45
  $graphics.FillRectangle($brush, $rect)
  $brush.Dispose()
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Add-Shadow {
  param($g)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(46, 22, 32, 23))
  $g.FillEllipse($brush, 220, 695, 460, 70)
  $brush.Dispose()
}

function Fill-Ellipse {
  param($g, [string]$color, [float]$x, [float]$y, [float]$w, [float]$h)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))
  $g.FillEllipse($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Fill-RectRound {
  param($g, [string]$color, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc(($x + $w - $r), $y, $r, $r, 270, 90)
  $path.AddArc(($x + $w - $r), ($y + $h - $r), $r, $r, 0, 90)
  $path.AddArc($x, ($y + $h - $r), $r, $r, 90, 90)
  $path.CloseFigure()
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))
  $g.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Stem {
  param($g, [int]$x1, [int]$y1, [int]$x2, [int]$y2, [int]$width = 18)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#2f7d47")), $width
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($pen, $x1, $y1, $x2, $y2)
  $pen.Dispose()
}

function Draw-Leaf {
  param($g, [string]$color, [int]$cx, [int]$cy, [int]$w, [int]$h, [float]$angle)
  $state = $g.Save()
  $g.TranslateTransform($cx, $cy)
  $g.RotateTransform($angle)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier(0, (-$h / 2), ($w / 2), (-$h / 3), ($w / 2), ($h / 3), 0, ($h / 2))
  $path.AddBezier(0, ($h / 2), (-$w / 2), ($h / 3), (-$w / 2), (-$h / 3), 0, (-$h / 2))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))
  $g.FillPath($brush, $path)
  $vein = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 255, 253, 243)), 5
  $vein.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $vein.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($vein, 0, (-$h / 2 + 16), 0, ($h / 2 - 16))
  $brush.Dispose()
  $vein.Dispose()
  $path.Dispose()
  $g.Restore($state)
}

function Draw-Pot {
  param($g, [string]$body = "#c8793f")
  Fill-RectRound $g "#8b5a3d" 275 610 350 54 24
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddPolygon(@(
    (New-Object System.Drawing.Point 315, 652),
    (New-Object System.Drawing.Point 585, 652),
    (New-Object System.Drawing.Point 545, 760),
    (New-Object System.Drawing.Point 355, 760)
  ))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($body))
  $g.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Face {
  param($g, [int]$cx, [int]$cy)
  Fill-Ellipse $g "#183a26" ($cx - 36) ($cy - 8) 16 20
  Fill-Ellipse $g "#183a26" ($cx + 20) ($cy - 8) 16 20
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#183a26")), 7
  $g.DrawArc($pen, ($cx - 28), ($cy + 16), 56, 38, 16, 148)
  $pen.Dispose()
}

function Save-Character {
  param([string]$name, [scriptblock]$draw)
  $canvas = New-Canvas "#f8f0d8" "#d7ebd0"
  $g = $canvas.Graphics
  Add-Shadow $g
  & $draw $g
  $path = Join-Path $outDir "$name.png"
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $canvas.Bitmap.Dispose()
}

Save-Character "tomato" {
  param($g)
  Draw-Stem $g 450 640 450 345 20
  Draw-Leaf $g "#4f9d58" 360 410 140 210 -42
  Draw-Leaf $g "#77b95d" 540 410 150 215 42
  Fill-Ellipse $g "#d94d38" 330 460 210 210
  Fill-Ellipse $g "#f06b4c" 455 450 185 185
  Draw-Leaf $g "#2f7d47" 420 445 78 108 -78
  Draw-Leaf $g "#2f7d47" 515 430 78 108 68
  Draw-Face $g 445 552
  Draw-Pot $g "#b96b3a"
}

Save-Character "basil" {
  param($g)
  Draw-Stem $g 450 660 450 340 16
  foreach ($leaf in @(@(370,560,128,190,-55),@(530,560,128,190,55),@(380,445,145,210,-52),@(520,445,145,210,52),@(450,325,130,190,0))) {
    Draw-Leaf $g "#58a85e" $leaf[0] $leaf[1] $leaf[2] $leaf[3] $leaf[4]
  }
  Draw-Face $g 450 520
  Draw-Pot $g "#c9824d"
}

Save-Character "snake-plant" {
  param($g)
  foreach ($leaf in @(@(370,520,90,390,-16),@(450,480,100,460,0),@(535,520,90,390,16),@(415,565,80,320,-6),@(495,565,80,320,8))) {
    Draw-Leaf $g "#376f45" $leaf[0] $leaf[1] $leaf[2] $leaf[3] $leaf[4]
  }
  Draw-Face $g 450 575
  Draw-Pot $g "#d08a50"
}

Save-Character "pepper" {
  param($g)
  Draw-Stem $g 450 645 450 345 18
  Draw-Leaf $g "#4f9855" 365 440 145 210 -48
  Draw-Leaf $g "#79b85d" 535 440 145 210 48
  Fill-Ellipse $g "#e64f3e" 335 505 150 190
  Fill-Ellipse $g "#f2b84e" 465 495 150 195
  Draw-Face $g 450 585
  Draw-Pot $g "#b96b3a"
}

Save-Character "fern" {
  param($g)
  foreach ($angle in @(-62,-38,-16,0,16,38,62)) {
    Draw-Stem $g 450 650 ([int](450 + [Math]::Sin($angle / 57.3) * 210)) ([int](360 + [Math]::Abs($angle) * 1.1)) 10
  }
  foreach ($leaf in @(@(315,515,74,170,-62),@(370,445,70,170,-38),@(425,390,68,170,-16),@(475,390,68,170,16),@(530,445,70,170,38),@(585,515,74,170,62))) {
    Draw-Leaf $g "#4f9d58" $leaf[0] $leaf[1] $leaf[2] $leaf[3] $leaf[4]
  }
  Draw-Face $g 450 590
  Draw-Pot $g "#c8793f"
}

Save-Character "succulent" {
  param($g)
  foreach ($leaf in @(@(450,548,132,280,0),@(390,570,126,250,-38),@(510,570,126,250,38),@(350,610,112,210,-68),@(550,610,112,210,68),@(450,620,118,220,0))) {
    Draw-Leaf $g "#7fb6a2" $leaf[0] $leaf[1] $leaf[2] $leaf[3] $leaf[4]
  }
  Draw-Face $g 450 605
  Draw-Pot $g "#d99b5f"
}

Save-Character "marigold" {
  param($g)
  Draw-Stem $g 450 660 450 430 14
  for ($i = 0; $i -lt 12; $i++) {
    $angle = $i * 30
    $x = 450 + [Math]::Cos($angle / 57.3) * 85
    $y = 385 + [Math]::Sin($angle / 57.3) * 85
    Fill-Ellipse $g "#f29b2e" ($x - 48) ($y - 48) 96 96
  }
  Fill-Ellipse $g "#f6c85f" 385 320 130 130
  Draw-Face $g 450 390
  Draw-Pot $g "#b96b3a"
}

Save-Character "herb" {
  param($g)
  Draw-Stem $g 450 660 450 355 14
  foreach ($leaf in @(@(370,520,92,165,-50),@(530,520,92,165,50),@(390,430,92,165,-42),@(510,430,92,165,42),@(450,360,84,148,0))) {
    Draw-Leaf $g "#75ad62" $leaf[0] $leaf[1] $leaf[2] $leaf[3] $leaf[4]
  }
  Fill-Ellipse $g "#f4c85f" 535 370 54 54
  Draw-Face $g 450 545
  Draw-Pot $g "#c8793f"
}

Save-Character "seedling" {
  param($g)
  Draw-Stem $g 450 675 450 470 13
  Draw-Leaf $g "#62ad58" 385 485 115 170 -55
  Draw-Leaf $g "#82bd62" 515 485 115 170 55
  Draw-Face $g 450 585
  Draw-Pot $g "#d09a5d"
}

Save-Character "unknown-plant" {
  param($g)
  Draw-Stem $g 450 665 450 370 15
  Draw-Leaf $g "#5b9a66" 360 520 118 185 -52
  Draw-Leaf $g "#8bbb72" 540 520 118 185 52
  Draw-Leaf $g "#6aa464" 450 405 110 170 0
  Fill-Ellipse $g "#f4c85f" 515 345 48 48
  Draw-Face $g 450 560
  Draw-Pot $g "#bd7a46"
}
