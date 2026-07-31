const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dargs = require('dargs');

function getPythonVersion(pythonPath) {
  try {
    const result = spawnSync(pythonPath, ['--version'], { encoding: 'utf8', timeout: 5000 });
    if (result.error || result.status !== 0) return null;
    const match = (result.stdout || result.stderr || '').match(/Python (\d+)\.(\d+)/);
    if (!match) return null;
    return { major: parseInt(match[1], 10), minor: parseInt(match[2], 10) };
  } catch {
    return null;
  }
}

function findPython() {
  if (process.env.YOUTUBE_DL_PYTHON) {
    const version = getPythonVersion(process.env.YOUTUBE_DL_PYTHON);
    if (version && version.major >= 3 && version.minor >= 10) {
      return process.env.YOUTUBE_DL_PYTHON;
    }
  }

  const names = ['python3.12', 'python3.11', 'python3.10', 'python3.9', 'python3', 'python'];
  const searchPaths = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const common = [
    '/usr/bin',
    '/usr/local/bin',
    '/opt/alt/python312/bin',
    '/opt/alt/python311/bin',
    '/opt/alt/python310/bin',
    '/opt/alt/python39/bin',
    '/opt/alt/python38/bin',
    '/opt/python3/bin',
    '/usr/local/cpanel/3rdparty/bin',
    '/opt/cpanel/3rdparty/bin',
  ];

  for (const name of names) {
    for (const dir of [...new Set([...searchPaths, ...common])]) {
      const full = path.join(dir, name);
      if (fs.existsSync(full) && !fs.lstatSync(full).isDirectory()) {
        const version = getPythonVersion(full);
        if (version && version.major >= 3 && version.minor >= 10) {
          return full;
        }
      }
    }
  }

  return null;
}

function ensurePythonPath() {
  const python = findPython();
  if (python) {
    const dir = path.dirname(python);
    const paths = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
    if (!paths.includes(dir)) {
      process.env.PATH = [dir, ...paths].join(path.delimiter);
    }
  }
  return python;
}

function isShebangScript(filePath) {
  try {
    const firstLine = fs.readFileSync(filePath, 'utf8').split('\n', 1)[0];
    return firstLine.startsWith('#!');
  } catch {
    return false;
  }
}

function parseOutput(stdout) {
  const s = stdout.trim();
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      return JSON.parse(s);
    } catch {}
  }
  return s;
}

function createYtdl(binaryPath) {
  const python = ensurePythonPath();
  const usePython = isShebangScript(binaryPath) && python;
  const cmd = usePython ? python : binaryPath;
  const baseArgs = usePython ? [binaryPath] : [];

  return (url, flags = {}, opts = {}) => {
    return new Promise((resolve, reject) => {
      const args = [...baseArgs, url, ...dargs(flags, { useEquals: false }).filter(Boolean)];
      const child = spawn(cmd, args, {
        cwd: opts.cwd,
        env: { ...process.env, ...(opts.env || {}) },
        timeout: opts.timeout || 180000,
        killSignal: 'SIGKILL',
      });

      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) {
          const err = new Error(stderr || `yt-dlp exited with code ${code}`);
          err.stdout = stdout;
          err.stderr = stderr;
          err.exitCode = code;
          return reject(err);
        }
        resolve(parseOutput(stdout));
      });
    });
  };
}

module.exports = { createYtdl, findPython };
