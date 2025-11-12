import * as fs from 'fs';
import { loadPackageJson } from './load-package-json';

jest.mock('fs');

const mockFs = jest.mocked(fs, { shallow: true });

describe('lib/utilities/load-package-json', () => {
  it('should throw an error when the package path does not contain a package.json', async () => {
    mockFs.existsSync.mockReturnValue(false);

    try {
      loadPackageJson('/unknown/path');
      fail('expected a failure');
    } catch (err) {
      expect(err.message).toBe(
        `Package /unknown/path does not contain a package.json.`,
      );
    }
  });

  it('should throw an error if the package.json is not valid json', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('INVALID JSON');

    try {
      loadPackageJson('/unknown/path');
      fail('expected a failure');
    } catch (err) {
      expect(err.message).toBe(
        'Package /unknown/path contains an invalid package.json.',
      );
    }
  });

  it('should correctly return a package.json if its valid', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
      }),
    );

    const packageJson = loadPackageJson('/package/path');
    expect(packageJson.name).toBe('test-package');
    expect(packageJson.version).toBe('1.0.0');
  });
});
