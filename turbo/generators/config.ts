import type { PlopTypes } from "@turbo/gen";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function getNextAvailablePort(rootDir: string): number {
  const appsDir = path.join(rootDir, "apps");
  if (!fs.existsSync(appsDir)) return 3000;

  const entries = fs.readdirSync(appsDir, { withFileTypes: true });
  const ports: number[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(appsDir, entry.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.scripts && pkg.scripts.dev) {
        const match = pkg.scripts.dev.match(/--port\s+(\d+)/);
        if (match) {
          ports.push(parseInt(match[1], 10));
        }
      }
    } catch {
      // ignore
    }
  }

  if (ports.length === 0) return 3000;
  return Math.max(...ports) + 1;
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // plop.getPlopfilePath() returns the path to config.ts (turbo/generators/config.ts)
  // Go up two directories to reach the monorepo root
  const rootDir = path.resolve(plop.getPlopfilePath(), "..", "..");

  // Custom helper for title casing: "my-app" -> "My App"
  plop.setHelper("titleCase", (text: string) => {
    if (!text) return "";
    return text
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  });

  // 1. Generator for new Next.js Apps
  plop.setGenerator("app", {
    description: "Adds a new Next.js app under apps/ with current monorepo config",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the new application name? (e.g. dashboard, admin, store)",
        validate: (input: string) => {
          if (!input) return "Application name is required";
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return "Application name can only contain alphanumeric characters, hyphens, and underscores";
          }
          const targetPath = path.join(rootDir, "apps", input.toLowerCase());
          if (fs.existsSync(targetPath)) {
            return `Directory "apps/${input.toLowerCase()}" already exists!`;
          }
          return true;
        },
      },
      {
        type: "input",
        name: "port",
        message: "What port should the dev server run on?",
        default: () => getNextAvailablePort(rootDir),
        validate: (input: any) => {
          const portNum = parseInt(String(input), 10);
          if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
            return "Port must be a valid number between 1024 and 65535";
          }
          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/package.json",
        templateFile: "templates/app/package.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/next.config.js",
        templateFile: "templates/app/next.config.js",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/tsconfig.json",
        templateFile: "templates/app/tsconfig.json",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/eslint.config.js",
        templateFile: "templates/app/eslint.config.js",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/next-env.d.ts",
        templateFile: "templates/app/next-env.d.ts",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/.gitignore",
        templateFile: "templates/app/.gitignore",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/README.md",
        templateFile: "templates/app/README.md.hbs",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/app/layout.tsx",
        templateFile: "templates/app/app/layout.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/app/page.tsx",
        templateFile: "templates/app/app/page.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/app/globals.css",
        templateFile: "templates/app/app/globals.css",
      },
      {
        type: "add",
        path: "apps/{{ kebabCase name }}/app/page.module.css",
        templateFile: "templates/app/app/page.module.css",
      },
      // Copy binary assets and link workspace
      async (answers: any) => {
        const appName = answers.name.toLowerCase();
        const targetDir = path.join(rootDir, "apps", appName);
        const sourceDir = fs.existsSync(path.join(rootDir, "apps/product"))
          ? path.join(rootDir, "apps/product")
          : path.join(rootDir, "apps/website");

        // Copy public directory
        const srcPublic = path.join(sourceDir, "public");
        if (fs.existsSync(srcPublic)) {
          copyDirRecursive(srcPublic, path.join(targetDir, "public"));
        }

        // Copy fonts directory
        const srcFonts = path.join(sourceDir, "app", "fonts");
        if (fs.existsSync(srcFonts)) {
          copyDirRecursive(srcFonts, path.join(targetDir, "app", "fonts"));
        }

        // Copy favicon.ico
        const srcFavicon = path.join(sourceDir, "app", "favicon.ico");
        if (fs.existsSync(srcFavicon)) {
          fs.copyFileSync(srcFavicon, path.join(targetDir, "app", "favicon.ico"));
        }

        // Run pnpm install to link workspace dependencies
        const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
        spawnSync(pnpmCmd, ["install", "--no-frozen-lockfile"], {
          cwd: rootDir,
          stdio: "inherit",
        });

        return `App "${appName}" created at apps/${appName} and linked via pnpm install!`;
      },
    ],
  });

  // 2. Generator for new UI Components / Packages
  plop.setGenerator("component", {
    description: "Adds a new component package under packages/",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the component name? (e.g. modal, button)",
        validate: (input: string) => {
          if (!input) return "Component name is required";
          if (input.includes(" ")) return "Component name cannot contain spaces";
          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/ui-{{ kebabCase name }}/src/index.tsx",
        templateFile: "templates/component/component.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/ui-{{ kebabCase name }}/package.json",
        templateFile: "templates/component/package.json.hbs",
      },
      async (answers: any) => {
        const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
        spawnSync(pnpmCmd, ["install"], {
          cwd: rootDir,
          stdio: "inherit",
        });
        return `Package @repo/ui-${answers.name} created and linked!`;
      },
    ],
  });
}
