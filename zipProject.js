const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream('project.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

const exclude = [
  'node_modules',
  '.git',
  '.next',
  '.env',
  '.env.local',
  'project.zip',
  'npm-debug.log',
  'yarn-error.log',
  '.DS_Store',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.vercel',
  '.cache'
];

archive.on('error', (err) => {
  throw err;
});

output.on('close', () => {
  console.log(`✅ Creat zip amb ${archive.pointer()} bytes`);
});

archive.pipe(output);

function isExcluded(relPath) {
  return exclude.some((ex) =>
    relPath === ex || relPath.startsWith(`${ex}/`)
  );
}

function addDir(baseDir) {
  fs.readdirSync(baseDir).forEach((file) => {
    const fullPath = path.join(baseDir, file);
    const relPath = path.relative(process.cwd(), fullPath);

    if (isExcluded(relPath)) return;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addDir(fullPath);
    } else {
      archive.file(fullPath, { name: relPath });
    }
  });
}

addDir(process.cwd());
archive.finalize();
