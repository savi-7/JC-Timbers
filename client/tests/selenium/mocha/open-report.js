const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const reportArg = process.argv[2];
const reportPath = reportArg
	? path.isAbsolute(reportArg)
		? reportArg
		: path.join(__dirname, reportArg)
	: path.join(__dirname, 'reports', 'index.html');

if (!fs.existsSync(reportPath)) {
	console.error('Report not found:', reportPath);
	process.exit(1);
}

const commands = process.platform === 'win32'
	? [
		`start "" chrome "${reportPath}"`,
		`start "" "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" "${reportPath}"`,
		`start "" "${reportPath}"`
	]
	: process.platform === 'darwin'
		? [`open -a "Google Chrome" "${reportPath}"`, `open "${reportPath}"`]
		: [`google-chrome "${reportPath}"`, `xdg-open "${reportPath}"`];

function tryOpen(index = 0) {
	if (index >= commands.length) {
		console.error('Unable to open report automatically:', reportPath);
		process.exit(1);
	}

	exec(commands[index], (error) => {
		if (!error) {
			console.log('Opening report:', reportPath);
			return;
		}
		tryOpen(index + 1);
	});
}

tryOpen();



