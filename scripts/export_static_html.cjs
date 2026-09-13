const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const serverScript = path.join(rootDir, '.output/server/index.mjs');
const outputPublic = path.join(rootDir, '.output/public');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(serverScript)) {
  console.error('Server script not found at', serverScript, '- Please run `npm run build` first.');
  process.exit(1);
}

const PORT = 3099;
const server = spawn('node', [serverScript], {
  env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverReady = false;

server.stdout.on('data', (d) => {
  const str = d.toString();
  if (str.includes('Listening') || str.includes('3099')) {
    serverReady = true;
    captureHtml();
  }
});

server.stderr.on('data', (d) => {
  console.error('[server err]', d.toString());
});

setTimeout(() => {
  if (!serverReady) {
    captureHtml();
  }
}, 2500);

function captureHtml() {
  http.get(`http://127.0.0.1:${PORT}/`, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => {
      server.kill();
      if (res.statusCode !== 200 || !body.includes('<html')) {
        console.error('Failed to capture HTML, status:', res.statusCode);
        process.exit(1);
      }

      // Write index.html to .output/public/
      const indexPath = path.join(outputPublic, 'index.html');
      fs.writeFileSync(indexPath, body, 'utf8');
      console.log('✓ Generated static index.html in .output/public/ (' + (body.length / 1024).toFixed(2) + ' KB)');

      // Also ensure dist/ exists and contains everything from .output/public/
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      fs.cpSync(outputPublic, distDir, { recursive: true });
      console.log('✓ Synced static assets to dist/ directory for Capacitor webDir');
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Error requesting HTML:', err.message);
    server.kill();
    process.exit(1);
  });
}
