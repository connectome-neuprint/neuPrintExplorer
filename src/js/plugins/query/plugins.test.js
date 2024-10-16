const fs = require('fs');
const path = require('path');

// Directory containing the .jsx files
const componentsDir = path.join(__dirname, './');

describe('Test all JSX files for `details` function', () => {
  // Read all files in the directory
  const jsxFiles = fs.readdirSync(componentsDir)
    .filter(file => file.endsWith('.jsx') && !file.endsWith('test.jsx'));

  jsxFiles.forEach((file) => {
    // Import each JSX file dynamically
    const componentPath = path.join(componentsDir, file);
    let component;

    try {
      // eslint-disable-next-line
      component = require(componentPath).default;
    } catch (err) {
      return;
    }

    test(`${file} should have a 'details' function`, () => {
      expect(component.details.name).toBeTruthy();
      expect(component.details.description).toBeTruthy();
    });
  });
});
