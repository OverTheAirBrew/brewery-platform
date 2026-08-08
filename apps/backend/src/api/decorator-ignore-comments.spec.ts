import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function getTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getTsFiles(fullPath));
      continue;
    }

    if (!entry.name.endsWith('.ts')) {
      continue;
    }

    if (entry.name.endsWith('.spec.ts')) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

describe('API decorator ignore comments', () => {
  it('enforces istanbul ignore block around decorated class declarations', () => {
    const apiRoot = path.join(process.cwd(), 'src', 'api');
    const files = getTsFiles(apiRoot);

    const violations: string[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);
      const expectedStartLines = new Set<number>();
      const expectedStopLines = new Set<number>();
      const relativePath = path.relative(process.cwd(), filePath);

      for (let i = 0; i < lines.length; i++) {
        const classLine = lines[i].trim();
        if (!classLine.startsWith('export class ')) {
          continue;
        }

        let prev = i - 1;
        while (prev >= 0 && lines[prev].trim() === '') {
          prev -= 1;
        }

        if (prev < 0 || !lines[prev].trim().startsWith('@')) {
          continue;
        }

        const stopLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        expectedStopLines.add(i + 2);
        if (stopLine !== '/* istanbul ignore stop */') {
          violations.push(
            `${relativePath}:${i + 1} missing ignore stop immediately after decorated class declaration`,
          );
        }

        let firstDecorator = prev;
        while (
          firstDecorator >= 0 &&
          lines[firstDecorator].trim().startsWith('@')
        ) {
          firstDecorator -= 1;
        }

        const startLine =
          firstDecorator >= 0 ? lines[firstDecorator].trim() : '';
        expectedStartLines.add(firstDecorator + 1);
        if (startLine !== '/* istanbul ignore start */') {
          violations.push(
            `${relativePath}:${i + 1} missing ignore start immediately before decorator block`,
          );
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNumber = i + 1;

        if (
          line === '/* istanbul ignore start */' &&
          !expectedStartLines.has(lineNumber)
        ) {
          violations.push(
            `${relativePath}:${lineNumber} unexpected ignore start; no decorated class requires it here`,
          );
        }

        if (
          line === '/* istanbul ignore stop */' &&
          !expectedStopLines.has(lineNumber)
        ) {
          violations.push(
            `${relativePath}:${lineNumber} unexpected ignore stop; no decorated class requires it here`,
          );
        }
      }
    }

    expect(violations).toStrictEqual([]);
  });
});
