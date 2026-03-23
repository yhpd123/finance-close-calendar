import { chmodSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const portableRoot = join(projectRoot, 'portable');
const appDir = join(portableRoot, 'app');
const packageDir = join(portableRoot, 'finance-close-calendar-portable');
const zipPath = join(portableRoot, 'finance-close-calendar-portable.zip');

if (!existsSync(appDir)) {
  throw new Error('Portable app build not found. Run "npm run build:portable" first.');
}

rmSync(packageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(packageDir, { recursive: true });

cpSync(appDir, packageDir, { recursive: true });

writeFileSync(
  join(packageDir, 'Start-Finance-Close-Calendar.command'),
  [
    '#!/bin/bash',
    'set -e',
    'cd "$(dirname "$0")"',
    'PORT=4173',
    'URL="http://127.0.0.1:${PORT}/"',
    'if command -v python3 >/dev/null 2>&1; then',
    '  SERVER_CMD=(python3 -m http.server "$PORT" --bind 127.0.0.1)',
    'elif command -v python >/dev/null 2>&1; then',
    '  SERVER_CMD=(python -m SimpleHTTPServer "$PORT")',
    'elif command -v ruby >/dev/null 2>&1; then',
    '  SERVER_CMD=(ruby -run -e httpd . -p "$PORT" -b 127.0.0.1)',
    'else',
    '  echo "Unable to find python3, python, or ruby to start the portable server."',
    '  echo "Please use the online demo: https://yhpd123.github.io/finance-close-calendar/"',
    '  read -r -p "Press Enter to close..."',
    '  exit 1',
    'fi',
    'if [ "${NO_OPEN:-0}" != "1" ]; then',
    '  sleep 1',
    '  open "$URL" >/dev/null 2>&1 || true',
    'fi',
    'echo "Finance Close Calendar portable server is running at $URL"',
    'echo "Keep this window open while using the app. Press Control+C to stop."',
    '"${SERVER_CMD[@]}"',
    '',
  ].join('\n'),
);
chmodSync(join(packageDir, 'Start-Finance-Close-Calendar.command'), 0o755);

writeFileSync(
  join(packageDir, 'Start-Finance-Close-Calendar.bat'),
  [
    '@echo off',
    'set SCRIPT_DIR=%~dp0',
    'powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%Start-Finance-Close-Calendar.ps1"',
    '',
  ].join('\r\n'),
);

writeFileSync(
  join(packageDir, 'Start-Finance-Close-Calendar.ps1'),
  [
    '$ErrorActionPreference = "Stop"',
    '$port = 4173',
    '$root = Split-Path -Parent $MyInvocation.MyCommand.Path',
    '$listener = [System.Net.HttpListener]::new()',
    '$listener.Prefixes.Add("http://127.0.0.1:$port/")',
    '$listener.Start()',
    'Start-Process "http://127.0.0.1:$port/"',
    'Write-Host "Finance Close Calendar portable server is running at http://127.0.0.1:$port/"',
    'Write-Host "Keep this window open while using the app. Close the window to stop the server."',
    '$contentTypes = @{',
    '  ".html" = "text/html; charset=utf-8"',
    '  ".js" = "text/javascript; charset=utf-8"',
    '  ".css" = "text/css; charset=utf-8"',
    '  ".json" = "application/json; charset=utf-8"',
    '  ".svg" = "image/svg+xml"',
    '  ".png" = "image/png"',
    '  ".webmanifest" = "application/manifest+json; charset=utf-8"',
    '  ".txt" = "text/plain; charset=utf-8"',
    '}',
    'try {',
    '  while ($listener.IsListening) {',
    '    $context = $listener.GetContext()',
    '    $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))',
    '    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }',
    '    $filePath = Join-Path $root $relativePath',
    '    if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {',
    '      $resolvedPath = $filePath',
    '    } else {',
    '      $resolvedPath = Join-Path $root "index.html"',
    '    }',
    '    $extension = [System.IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()',
    '    $contentType = $contentTypes[$extension]',
    '    if (-not $contentType) { $contentType = "application/octet-stream" }',
    '    $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)',
    '    $context.Response.ContentType = $contentType',
    '    $context.Response.ContentLength64 = $bytes.Length',
    '    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)',
    '    $context.Response.OutputStream.Close()',
    '  }',
    '} finally {',
    '  if ($listener.IsListening) { $listener.Stop() }',
    '}',
    '',
  ].join('\r\n'),
);

writeFileSync(
  join(packageDir, 'README-PORTABLE.txt'),
  [
    'Finance Close Calendar Portable',
    '',
    'How to use:',
    '1. Unzip this package.',
    '2. On Windows, double-click "Start-Finance-Close-Calendar.bat".',
    '3. On macOS, double-click "Start-Finance-Close-Calendar.command".',
    '4. Use Chrome or Edge for the best experience.',
    '',
    'Notes:',
    '- This portable package runs fully in the browser.',
    '- Data is stored locally in that browser profile on this device.',
    '- PWA install and service worker features are not used in portable mode.',
    '- For the best experience, you can also use the online demo and click "Install App".',
    '',
    'Online demo:',
    'https://yhpd123.github.io/finance-close-calendar/',
  ].join('\n'),
);

execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', packageDir, zipPath], {
  cwd: portableRoot,
  stdio: 'inherit',
});

console.log(`Portable ZIP created at ${zipPath}`);
