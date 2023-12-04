import findNodeModules from 'find-node-modules';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { loadPackageJson } from './load-package-json';

const processDirectory = (directory: string) => {
  if (!existsSync(directory)) return;

  const subDirectory = readdirSync(directory);

  const packageDirectories: string[] = [];

  for (const dir of subDirectory) {
    if (existsSync(join(directory, dir, 'package.json'))) {
      packageDirectories.push(join(directory, dir));
    } else {
      if (
        [
          '.bin',
          '.package-lock.json',
          '.DS_Store',
          '.cache',
          '.modules.yaml',
          '.pnpm',
          '.yarn-integrity',
        ].includes(dir)
      )
        continue;

      const packages = processDirectory(join(directory, dir));

      if (!packages) continue;
      packageDirectories.push(...packages);
    }
  }

  return packageDirectories;
};

const loadDefaultPaths = () => {
  const nodeModulesPaths = findNodeModules({ relative: false });

  if (require.main) {
    nodeModulesPaths.push(...require.main.paths);
  }

  return [...new Set(nodeModulesPaths)];
};

export const findNodeModulesMatchingRegex = (regex: RegExp) => {
  const nodeModules = loadDefaultPaths();

  const loadedPackages: string[] = [];

  for (const nodeModule of nodeModules) {
    const directories = processDirectory(nodeModule);

    if (!directories) continue;
    loadedPackages.push(...directories);
  }

  const dedupedPackages = [
    ...new Set(loadedPackages.filter((pack) => pack.match(regex))),
  ];

  const packages = dedupedPackages.map((p) => {
    const packageJson = loadPackageJson(p);

    return {
      path: p,
      packageJson,
    };
  });

  return packages;
};
