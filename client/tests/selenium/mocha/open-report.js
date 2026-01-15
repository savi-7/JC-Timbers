const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const reportPath = path.join(__dirname, 'reports', 'index.html');

if (!fs.existsSync(reportPath)) {
	console.error('Report not found:', reportPath);
	process.exit(1);
}

const openCmd = process.platform === 'win32' ? `start "" "${reportPath}"` : process.platform === 'darwin' ? `open "${reportPath}"` : `xdg-open "${reportPath}"`;
exec(openCmd);
console.log('Opening report:', reportPath);



