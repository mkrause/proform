
const path = require('path');

module.exports = {
  verbose: true,
  
  testTimeout: 30_000,
  
  //testEnvironment: 'jsdom', // Use JSDOM to fake a browser environment
  
  //transform: ..., // Note: babel transform is set up automatically
  
  setupFiles: [path.join(__dirname, 'tests/setup_global.js')],
  setupFilesAfterEnv: [path.join(__dirname, 'tests/setup_test.js')],
  
  /*
  // Webpack module loading stubs
  moduleNameMapper: {
    '^[./a-zA-Z0-9$_-]+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/jest/stub_image.js',
    '^[./a-zA-Z0-9$_-]+\\.(css|scss)$': '<rootDir>/tests/jest/stub_css.js',
  },
  */
};
