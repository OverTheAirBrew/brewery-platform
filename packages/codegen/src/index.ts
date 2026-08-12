import { readdirSync, readFileSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { generateTypescriptFiles } from './ts-gen';
import { SchemaConfig } from './abstractions';
import { generatePythonFiles } from './python-gen';

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
      const match = trimmedLine.match(/^-\s*([^\/]+\/\*)$/);

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

const getPackageCodegenConfig = async (
  dir: string,
): Promise<
  | {
      source: { schemas: string[] };
      output: { dir: string; type: 'typescript' | 'python' };
    }
  | undefined
> => {
  try {
    return JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8'))
      .codegen;
  } catch {
    return undefined;
  }
};

const loadConfigs = async (
  directory: string,
): Promise<
  | {
      sources: string[];
      output: { dir: string; type: 'typescript' | 'python' | '' };
    }
  | undefined
> => {
  const codegenConfig = await getPackageCodegenConfig(directory);

  if (!codegenConfig) return undefined;

  return {
    sources:
      codegenConfig.source?.schemas?.map((s) => join(directory, s)) ||
      undefined,
    output: {
      dir: join(directory, codegenConfig.output.dir),
      type: codegenConfig.output.type,
    },
  };
};

async function main() {
  const directories = await discoverPackageDirs();
  const today = new Date().toISOString().split('T')[0];

  const configs = (
    await Promise.all(
      directories.map(async (directory) => {
        return await loadConfigs(directory);
      }),
    )
  ).filter((cfg) => !!cfg);

  const sources = configs
    .reduce((acc, cfg) => [...acc, ...(cfg?.sources || [])], [] as string[])
    .map((s) => JSON.parse(readFileSync(s, 'utf-8')) as SchemaConfig);

  const outDirs = [
    ...new Set(
      configs
        .map((cfg) => `${cfg?.output?.dir}::${cfg?.output?.type}`)
        .filter((d) => !!d),
    ),
  ];

  const generateFiles = async (
    files: Record<string, string>,
    ourDirs: string[],
    type: 'typescript' | 'python',
  ) => {
    for (const dir of ourDirs) {
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });

      for (const [name, content] of Object.entries(files)) {
        const out = join(dir, `${name}.${type === 'typescript' ? 'ts' : 'py'}`);
        await writeFile(out, content, 'utf-8');
        console.log(`[codegen] Generated ${out}`);
      }
    }
  };

  if (outDirs.some((d) => d.endsWith('::typescript'))) {
    const typescriptOutputs = generateTypescriptFiles(sources, today);
    await generateFiles(
      typescriptOutputs,
      outDirs
        .filter((d) => d.endsWith('::typescript'))
        .map((d) => d.split('::')[0]),
      'typescript',
    );
  } else {
    console.log(
      'No TypeScript output directories found. Skipping TypeScript generation.',
    );
  }

  if (outDirs.some((d) => d.endsWith('::python'))) {
    const pythonOutputs = generatePythonFiles(sources, today);
    await generateFiles(
      pythonOutputs,
      outDirs
        .filter((d) => d.endsWith('::python'))
        .map((d) => d.split('::')[0]),
      'python',
    );
  } else {
    console.log(
      'No Python output directories found. Skipping Python generation.',
    );
  }

  // const plugins: { dir: string; config: unknown; outDir: string }[] = [];

  // for (const dir of directories) {
  //   const codegenConfig = await getPackageCodegenConfig(dir);
  //   if (!codegenConfig?.source?.schemas) continue;

  //   // await rm(join(dir, codegenConfig.outputDir), {
  //   //   recursive: true,
  //   //   force: true,
  //   // });
  //   // await mkdir(join(dir, codegenConfig.outputDir), { recursive: true });

  //   const pluginBase = join(dir, codegenConfig.source.schemas);

  //   for (const entry of readdirSync(pluginBase, { withFileTypes: true })) {
  //     if (!entry.isDirectory()) continue;
  //     const pluginDir = join(pluginBase, entry.name);
  //     const pluginConfig = await readPluginConfig(pluginDir);
  //     if (pluginConfig)
  //       plugins.push({
  //         dir: pluginDir,
  //         config: pluginConfig,
  //         outDir: join(dir, codegenConfig.outputDir),
  //       });
  //   }
  // }

  // if (!plugins.length) {
  //   console.error('[codegen] No plugins found for code generation.');
  //   process.exit(0);
  // }

  // for (const { config, dir, outDir } of plugins as {
  //   dir: string;
  //   config: { schemas: string[]; outDir: string };
  //   outDir: string;
  // }[]) {
  //   const pluginSchemas = (
  //     config as { schemas: string[]; outDir: string }
  //   ).schemas
  //     .filter((s: string) => s.endsWith('.json'))
  //     .map(
  //       (s) => JSON.parse(readFileSync(join(dir, s), 'utf-8')) as SchemaConfig,
  //     )
  //     .sort((a, b) => a.title.localeCompare(b.title));

  //   // const outDir = join(dir, config.outDir);

  //   for (const [name, content] of Object.entries(
  //     generateTypescriptFiles(pluginSchemas, today),
  //   )) {
  //     const out = join(outDir, `${name}.ts`);
  //     await writeFile(out, content, 'utf-8');
  //     console.log(`[codegen] Generated ${out}`);
  //   }

  //   // same for python but lets get ts working first
  // }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
