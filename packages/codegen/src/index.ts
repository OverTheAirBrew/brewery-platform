import { readdirSync, readFileSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { generateTypescriptFiles } from './ts-gen';
import { SchemaConfig } from './abstractions';

const ROOT = resolve(__dirname, '../../..'); // monorepo root

const discoverPackageDirs = async () => {
  const yaml = await readFile(join(ROOT, 'pnpm-workspace.yaml'), 'utf-8');
  const dirs: string[] = [];
  let inPackages = false;

  for (const line of yaml.split('\n')) {
    const trimmedLine = line.trim();
    if (trimmedLine === 'packages:') {
      inPackages = true;
    } else if (inPackages && trimmedLine.startsWith('- ')) {
      const match = trimmedLine.match(/['"]([^'"]+)['"]/);

      if (match) {
        const pattern = match[1];

        if (pattern.endsWith('/*')) {
          const base = join(ROOT, pattern.slice(0, -2));
          try {
            dirs.push(
              ...readdirSync(base, { withFileTypes: true })
                .filter((e) => e.isDirectory())
                .map((e) => join(base, e.name)),
            );
          } catch {}
        } else {
          dirs.push(join(ROOT, pattern));
        }
      }
    } else if (
      inPackages &&
      trimmedLine.endsWith(':') &&
      !trimmedLine.startsWith('-')
    ) {
      inPackages = false;
    }
  }

  return dirs;
};

const getPackageCodegenConfig = async (dir: string) => {
  try {
    return JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8'))
      .codegen;
  } catch {
    return undefined;
  }
};

const readPluginConfig = async (pluginDir: string) => {
  try {
    const mod = await import(join(pluginDir, 'schemas.ts'));
    for (const exported of Object.values(mod)) {
      const cfg = exported as Record<string, unknown>;
      if (Array.isArray(cfg.schemas) && typeof cfg.outDir === 'string') {
        return cfg;
      }
    }
  } catch {}
  return undefined;
};

async function main() {
  const directories = await discoverPackageDirs();

  const plugins: { dir: string; config: unknown }[] = [];

  for (const dir of directories) {
    const codegenConfig = await getPackageCodegenConfig(dir);
    if (!codegenConfig?.schemas) continue;

    const pluginBase = join(dir, codegenConfig.schemas);

    for (const entry of readdirSync(pluginBase, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pluginDir = join(pluginBase, entry.name);
      const pluginConfig = await readPluginConfig(pluginDir);
      if (pluginConfig) plugins.push({ dir: pluginDir, config: pluginConfig });
    }
  }

  if (!plugins.length) {
    console.error('[codegen] No plugins found for code generation.');
    process.exit(1);
  }

  for (const { config, dir } of plugins as {
    dir: string;
    config: { schemas: string[]; outDir: string };
  }[]) {
    const pluginSchemas = (
      config as { schemas: string[]; outDir: string }
    ).schemas
      .filter((s: string) => s.endsWith('.json'))
      .map(
        (s) => JSON.parse(readFileSync(join(dir, s), 'utf-8')) as SchemaConfig,
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    const outDir = join(dir, config.outDir);

    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    for (const [name, content] of Object.entries(
      generateTypescriptFiles(pluginSchemas),
    )) {
      const out = join(outDir, `${name}.ts`);
      await writeFile(out, content, 'utf-8');
      console.log(`[codegen] Generated ${out}`);
    }

    // same for python but lets get ts working first
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
