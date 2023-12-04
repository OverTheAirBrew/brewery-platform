import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PackageJSON {
  name: string;
  version: string;
  keywords?: string[];
  exports?: string | Record<string, string | Record<string, string>>;
  main?: string;
  type?: 'module' | 'commonjs';
  engines?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export const loadPackageJson = (packagePath: string) => {
  const packageJsonPath = join(packagePath, 'package.json');
  let packageJson: PackageJSON;

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Package ${packagePath} does not contain a package.json.`);
  }

  try {
    packageJson = JSON.parse(
      readFileSync(packageJsonPath, { encoding: 'utf8' }),
    );
  } catch (err) {
    throw new Error(`Package ${packagePath} contains an invalid package.json.`);
  }

  return packageJson;
};
