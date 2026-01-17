const { exec } = require('child_process');
const fs = require('fs');

console.log('Starting build...');

const buildProcess = exec('npm run build', (error, stdout, stderr) => {
    fs.writeFileSync('build_stdout.txt', stdout);
    fs.writeFileSync('build_stderr.txt', stderr);

    if (error) {
        fs.writeFileSync('build_error.txt', error.toString());
        console.error(`Build failed with error: ${error.message}`);
        process.exit(1);
    }
    console.log('Build successful!');
});
