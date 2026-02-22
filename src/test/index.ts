import * as path from 'path';
import * as fs from 'fs';

// Simple test runner that works with VS Code extension testing
export function run(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            // Dynamically import Mocha to avoid compilation issues
            const Mocha = require('mocha');
            
            const mocha = new Mocha({
                ui: 'tdd',
                color: true,
                timeout: 100000
            });

            const testsRoot = __dirname;
            
            // Simple file discovery - look for .test.js files
            const testFiles = fs.readdirSync(testsRoot)
                .filter(file => file.endsWith('.test.js'))
                .map(file => path.join(testsRoot, file));
            
            // Add test files to mocha
            testFiles.forEach(file => mocha.addFile(file));

            try {
                // Run the mocha test
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        } catch (error) {
            console.error('Error setting up tests:', error);
            reject(error);
        }
    });
}