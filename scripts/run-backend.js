const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pythonPath = process.platform === 'win32'
  ? path.join(rootDir, '.venv', 'Scripts', 'python.exe')
  : path.join(rootDir, '.venv', 'bin', 'python');

if (!fs.existsSync(pythonPath)) {
  console.error(`Could not find the virtualenv Python at ${pythonPath}`);
  console.error('Run the setup script first, then try again.');
  process.exit(1);
}

const args = [
  '-m',
  'uvicorn',
  'src.api.app:app',
  '--host',
  '127.0.0.1',
  '--port',
  '8000',
  ...process.argv.slice(2),
];

const child = spawn(pythonPath, args, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
