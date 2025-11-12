import findNodeModules from 'find-node-modules';
import * as fs from 'fs';
import { when } from 'jest-when';
import { findNodeModulesMatchingRegex } from './find-node-modules-matching-regex';
import { loadPackageJson } from './load-package-json';

jest.mock('find-node-modules');
jest.mock('fs');
jest.mock('./load-package-json');

const mockedFindNodeModules = jest.mocked(findNodeModules, { shallow: true });
const mockedFs = jest.mocked(fs, { shallow: true });
const mockedLoadPackageJson = jest.mocked(loadPackageJson, { shallow: true });

describe('lib/utilities/find-node-modules-matching-regex', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should load the data', async () => {
    when(mockedFs.existsSync)
      .calledWith('../')
      .mockReturnValueOnce(true)
      .calledWith('../otabmp-test-package/package.json')
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    mockedFindNodeModules.mockReturnValue(['../']);
    mockedFs.readdirSync.mockReturnValue([
      'otabmp-test-package',
      'invalid-package-for-load',
    ] as any);
    mockedLoadPackageJson.mockReturnValue({} as any);

    const packages = findNodeModulesMatchingRegex(
      /((@[\w-]*)\/)?(otabmp-[\w-]*)$/,
    );

    expect(packages).toHaveLength(1);
    expect(packages).toMatchObject([
      {
        packageJson: {},
        path: '../otabmp-test-package',
      },
    ]);
  });

  it('should skip the load if the package meets one of the exclusions', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFindNodeModules.mockReturnValue(['../']);
    mockedFs.readdirSync.mockReturnValue(['.bin'] as any);

    const packages = findNodeModulesMatchingRegex(
      /((@[\w-]*)\/)?(otabmp-[\w-]*)$/,
    );
    expect(packages).toHaveLength(0);
    expect(mockedFs.existsSync).toBeCalledWith('../.bin/package.json');
  });
});
