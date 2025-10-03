const { execSync } = require('child_process');
const path = require('path');

console.log('Installing client dependencies...');
execSync('npm install', { 
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit' 
});

console.log('Building client...');
execSync('npm run build', { 
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit' 
});

console.log('Build completed successfully!');
