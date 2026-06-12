param(
    [int]$Port = 8787,
    [string]$Root = "",
    [switch]$SmokeTest
)

if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = Join-Path (Split-Path -Parent $PSScriptRoot) "web"
}

$Root = [System.IO.Path]::GetFullPath($Root)
$indexPath = Join-Path $Root "index.html"

if (-not (Test-Path -LiteralPath $indexPath)) {
    throw "Cannot find web app at $indexPath"
}

if ($SmokeTest) {
    "Web app smoke test OK: $indexPath"
    return
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg" = "image/svg+xml"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico" = "image/x-icon"
}

function Resolve-WebPath {
    param([string]$UrlPath)

    $relativePath = [Uri]::UnescapeDataString($UrlPath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
    }

    $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $relativePath))
    if (-not $candidate.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }

    if (Test-Path -LiteralPath $candidate -PathType Container) {
        $candidate = Join-Path $candidate "index.html"
    }

    return $candidate
}

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$Reason,
        [string]$ContentType,
        [byte[]]$Body
    )

    $header = "HTTP/1.1 $StatusCode $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    $Stream.Write($Body, 0, $Body.Length)
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
    Write-Host "Serving $Root"
    Write-Host "URL: http://localhost:$Port/"
    Write-Host "Press Ctrl+C to stop."

    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()

            while ($reader.Peek() -gt -1) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) {
                    break
                }
            }

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                Send-Response $stream 400 "Bad Request" "text/plain; charset=utf-8" $body
                continue
            }

            $parts = $requestLine.Split(" ")
            $urlPath = $parts[1].Split("?")[0]
            $filePath = Resolve-WebPath $urlPath

            if ($null -eq $filePath -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" $body
                continue
            }

            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $contentType = $mimeTypes[$extension]
            if ([string]::IsNullOrWhiteSpace($contentType)) {
                $contentType = "application/octet-stream"
            }

            $body = [System.IO.File]::ReadAllBytes($filePath)
            Send-Response $stream 200 "OK" $contentType $body
        }
        catch {
            if ($null -ne $stream) {
                $body = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
                Send-Response $stream 500 "Internal Server Error" "text/plain; charset=utf-8" $body
            }
        }
        finally {
            if ($null -ne $reader) {
                $reader.Dispose()
            }
            if ($null -ne $client) {
                $client.Close()
            }
        }
    }
}
finally {
    $listener.Stop()
}
