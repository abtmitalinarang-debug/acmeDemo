#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT_DIR, "apps");

// ANSI color helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function printBanner() {
  console.log(`
${colors.cyan}${colors.bold}====================================================${colors.reset}
${colors.cyan}${colors.bold}   Acme Monorepo - Next.js App Creator Wizard       ${colors.reset}
${colors.cyan}${colors.bold}====================================================${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`${colors.bold}USAGE:${colors.reset}
  pnpm create-app [app-name] [options]
  pnpm new-app [app-name] [options]
  node scripts/create-app.mjs [app-name] [options]

${colors.bold}ARGUMENTS:${colors.reset}
  [app-name]               Name of the new application folder inside apps/

${colors.bold}OPTIONS:${colors.reset}
  --package-name, -p <name>  Custom package.json name (default: same as app-name)
  --from, -f <source-app>    Existing Next.js app to clone configuration from (e.g. "product", "website")
  --port <number>            Port for dev server (default: automatically finds next available port)
  --yes, -y                  Non-interactive mode (skips questions and accepts defaults/flags)
  --no-install, --skip-install Skip running 'pnpm install' after generating the app
  --dry-run                  Simulate generation without writing files
  --help, -h                 Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  ${colors.dim}# Interactive prompt (asks for name, port, template, etc.):${colors.reset}
  pnpm create-app

  ${colors.dim}# Prompt starting with prefilled name:${colors.reset}
  pnpm create-app dashboard

  ${colors.dim}# Non-interactive quick creation (skips questions):${colors.reset}
  pnpm create-app admin --port 3005 -y
`);
}

/**
 * Scan apps directory and find all existing Next.js apps and their ports.
 */
function scanExistingApps() {
  if (!fs.existsSync(APPS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  const apps = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const appDir = path.join(APPS_DIR, entry.name);
    const pkgPath = path.join(appDir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const isNextApp =
        (pkg.dependencies && pkg.dependencies.next) ||
        (pkg.devDependencies && pkg.devDependencies.next) ||
        fs.existsSync(path.join(appDir, "next.config.js")) ||
        fs.existsSync(path.join(appDir, "next.config.mjs")) ||
        fs.existsSync(path.join(appDir, "next.config.ts"));

      if (isNextApp) {
        let devPort = null;
        if (pkg.scripts && pkg.scripts.dev) {
          const match = pkg.scripts.dev.match(/--port\s+(\d+)/);
          if (match) {
            devPort = parseInt(match[1], 10);
          }
        }

        apps.push({
          folderName: entry.name,
          dirPath: appDir,
          packageName: pkg.name,
          port: devPort,
          packageJson: pkg,
        });
      }
    } catch {
      // Ignore corrupted or unreadable package.json
    }
  }

  return apps;
}

/**
 * Parse CLI flags and positional arguments.
 */
function parseArgs(args) {
  const options = {
    appName: null,
    packageName: null,
    fromApp: null,
    port: null,
    install: true,
    yes: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--no-install" || arg === "--skip-install") {
      options.install = false;
    } else if (arg === "--package-name" || arg === "-p") {
      options.packageName = args[++i];
    } else if (arg === "--from" || arg === "-f") {
      options.fromApp = args[++i];
    } else if (arg === "--port") {
      options.port = parseInt(args[++i], 10);
    } else if (!arg.startsWith("-") && !options.appName) {
      options.appName = arg;
    }
  }

  return options;
}

/**
 * Calculate the next available port by scanning existing apps.
 */
function getNextAvailablePort(existingApps) {
  const ports = existingApps
    .map((app) => app.port)
    .filter((port) => typeof port === "number" && !isNaN(port));

  if (ports.length === 0) return 3000;
  return Math.max(...ports) + 1;
}

/**
 * Helper to recursively copy a directory.
 */
function copyDirSync(src, dest, filterFn = null) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (filterFn && !filterFn(srcPath, entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, filterFn);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Capitalize/Format app name for page display.
 */
function formatTitle(name) {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Main command flow.
 */
async function main() {
  const cliArgs = process.argv.slice(2);
  const options = parseArgs(cliArgs);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  printBanner();

  const existingApps = scanExistingApps();

  if (existingApps.length === 0) {
    console.error(
      `${colors.red}Error: No existing Next.js apps found in "apps/" to use as a configuration template.${colors.reset}`,
    );
    process.exit(1);
  }

  console.log(
    `${colors.dim}Discovered ${existingApps.length} existing Next.js app(s) in workspace:${colors.reset}`,
  );
  existingApps.forEach((app, idx) => {
    console.log(
      `  ${colors.dim}[${idx + 1}]${colors.reset} ${colors.bold}${app.folderName}${colors.reset} (package: ${colors.cyan}${app.packageName}${colors.reset}${
        app.port ? `, port: ${colors.yellow}${app.port}${colors.reset}` : ""
      })`,
    );
  });
  console.log();

  let appName = options.appName;
  let packageName = options.packageName;
  let fromAppName = options.fromApp;
  let port = options.port;
  let shouldInstall = options.install;

  const isInteractive = !options.yes;

  if (isInteractive) {
    const rl = readline.createInterface({ input, output });

    try {
      // 1. App Folder Name
      while (true) {
        const defaultPrompt = appName
          ? ` ${colors.dim}[default: ${appName}]${colors.reset}`
          : "";
        const rawName = await rl.question(
          `${colors.cyan}${colors.bold}[1/5] App folder name${colors.reset} (under apps/)${defaultPrompt}: `,
        );
        const chosen = rawName.trim() || appName;

        if (!chosen) {
          console.log(
            `${colors.yellow}Please provide a valid app name.${colors.reset}`,
          );
          continue;
        }

        if (!/^[a-zA-Z0-9-_]+$/.test(chosen)) {
          console.log(
            `${colors.red}App name can only contain letters, numbers, hyphens, and underscores.${colors.reset}`,
          );
          continue;
        }

        const candidateDir = path.join(APPS_DIR, chosen.toLowerCase());
        if (fs.existsSync(candidateDir)) {
          console.log(
            `${colors.red}Directory "apps/${chosen}" already exists! Please choose another name.${colors.reset}`,
          );
          appName = null;
          continue;
        }

        appName = chosen.toLowerCase();
        break;
      }

      // 2. Package Name
      const defaultPkg = packageName || appName;
      const rawPkg = await rl.question(
        `${colors.cyan}${colors.bold}[2/5] Package name${colors.reset} in package.json ${colors.dim}[default: ${defaultPkg}]${colors.reset}: `,
      );
      packageName = rawPkg.trim() || defaultPkg;

      // 3. Source App Template
      const defaultFrom =
        fromAppName ||
        (existingApps.find((a) => a.folderName === "product")
          ? "product"
          : existingApps[0].folderName);

      while (true) {
        const optionsList = existingApps
          .map((a, i) => `${i + 1}=${a.folderName}`)
          .join(", ");
        const rawFrom = await rl.question(
          `${colors.cyan}${colors.bold}[3/5] Base app configuration${colors.reset} (${optionsList}) ${colors.dim}[default: ${defaultFrom}]${colors.reset}: `,
        );
        const chosenFrom = rawFrom.trim() || defaultFrom;

        // Check if user entered a number (e.g. "1")
        const numIndex = parseInt(chosenFrom, 10);
        if (
          !isNaN(numIndex) &&
          numIndex >= 1 &&
          numIndex <= existingApps.length
        ) {
          fromAppName = existingApps[numIndex - 1].folderName;
          break;
        }

        // Check if user entered folder name or package name
        const match = existingApps.find(
          (a) => a.folderName === chosenFrom || a.packageName === chosenFrom,
        );
        if (match) {
          fromAppName = match.folderName;
          break;
        }

        console.log(
          `${colors.red}Invalid selection. Please choose one of: ${existingApps
            .map((a) => a.folderName)
            .join(", ")}${colors.reset}`,
        );
      }

      // 4. Dev Server Port
      const defaultPort = port || getNextAvailablePort(existingApps);
      while (true) {
        const rawPort = await rl.question(
          `${colors.cyan}${colors.bold}[4/5] Development server port${colors.reset} ${colors.dim}[default: ${defaultPort}]${colors.reset}: `,
        );
        const chosenPortStr = rawPort.trim();
        const chosenPort = chosenPortStr
          ? parseInt(chosenPortStr, 10)
          : defaultPort;

        if (isNaN(chosenPort) || chosenPort < 1024 || chosenPort > 65535) {
          console.log(
            `${colors.red}Port must be a valid number between 1024 and 65535.${colors.reset}`,
          );
          continue;
        }

        const conflictingApp = existingApps.find((a) => a.port === chosenPort);
        if (conflictingApp) {
          const proceed = await rl.question(
            `${colors.yellow}Warning: Port ${chosenPort} is already used by "${conflictingApp.folderName}". Use it anyway? (y/N): ${colors.reset}`,
          );
          if (!proceed.trim().toLowerCase().startsWith("y")) {
            continue;
          }
        }

        port = chosenPort;
        break;
      }

      // 5. Install Dependencies
      const installAnswer = await rl.question(
        `${colors.cyan}${colors.bold}[5/5] Run "pnpm install"${colors.reset} to link workspace packages? (Y/n) ${colors.dim}[default: Y]${colors.reset}: `,
      );
      shouldInstall = !installAnswer.trim().toLowerCase().startsWith("n");
    } finally {
      rl.close();
    }
  } else {
    // Non-interactive fallbacks
    if (!appName) {
      console.error(
        `${colors.red}Error: Please specify an app name when running in non-interactive mode (-y).${colors.reset}`,
      );
      process.exit(1);
    }
    if (!packageName) {
      packageName = appName;
    }
    if (!fromAppName) {
      fromAppName = existingApps.find((a) => a.folderName === "product")
        ? "product"
        : existingApps[0].folderName;
    }
    if (!port) {
      port = getNextAvailablePort(existingApps);
    }
  }

  // Final validation of source app
  const sourceApp = existingApps.find(
    (a) => a.folderName === fromAppName || a.packageName === fromAppName,
  );
  if (!sourceApp) {
    console.error(
      `${colors.red}Error: Source app "${fromAppName}" not found. Available apps: ${existingApps
        .map((a) => a.folderName)
        .join(", ")}${colors.reset}`,
    );
    process.exit(1);
  }

  // Final validation of target directory
  const targetDir = path.join(APPS_DIR, appName);
  if (fs.existsSync(targetDir)) {
    console.error(
      `${colors.red}Error: Target directory "apps/${appName}" already exists!${colors.reset}`,
    );
    process.exit(1);
  }

  console.log(`\n${colors.bold}Configuration Summary:${colors.reset}`);
  console.log(
    `  • App Folder:      ${colors.green}apps/${appName}${colors.reset}`,
  );
  console.log(
    `  • Package Name:    ${colors.cyan}${packageName}${colors.reset}`,
  );
  console.log(
    `  • Base Config:     ${colors.magenta}${sourceApp.folderName}${colors.reset}`,
  );
  console.log(`  • Dev Server Port: ${colors.yellow}${port}${colors.reset}`);
  console.log(
    `  • Run pnpm install:${colors.bold} ${shouldInstall ? "Yes" : "No"}${colors.reset}`,
  );
  if (options.dryRun) {
    console.log(
      `  • Mode:            ${colors.yellow}DRY RUN (no files will be written)${colors.reset}\n`,
    );
    return;
  }
  console.log();

  // Create target directory
  console.log(`${colors.cyan}▶ Creating app directory...${colors.reset}`);
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Build tailored package.json from sourceApp
  console.log(
    `${colors.cyan}▶ Generating package.json with synced configuration...${colors.reset}`,
  );
  const srcPkg = sourceApp.packageJson;
  const newPkg = {
    name: packageName,
    version: "0.1.0",
    type: srcPkg.type || "module",
    private: true,
    scripts: {
      dev: `next dev --port ${port}`,
      build: "next build",
      start: "next start",
      lint: srcPkg.scripts?.lint || "eslint --max-warnings 0",
      "check-types":
        srcPkg.scripts?.["check-types"] || "next typegen && tsc --noEmit",
    },
    dependencies: {
      ...srcPkg.dependencies,
    },
    devDependencies: {
      ...srcPkg.devDependencies,
    },
  };

  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(newPkg, null, 2) + "\n",
  );

  // 2. Copy configuration files from source app
  const configFiles = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "tsconfig.json",
    "eslint.config.js",
    "eslint.config.mjs",
    "next-env.d.ts",
    ".gitignore",
  ];

  for (const file of configFiles) {
    const srcFile = path.join(sourceApp.dirPath, file);
    if (fs.existsSync(srcFile)) {
      console.log(`${colors.cyan}▶ Copying ${file}...${colors.reset}`);
      fs.copyFileSync(srcFile, path.join(targetDir, file));
    }
  }

  // 3. Copy public/ directory
  const srcPublicDir = path.join(sourceApp.dirPath, "public");
  if (fs.existsSync(srcPublicDir)) {
    console.log(`${colors.cyan}▶ Copying public assets...${colors.reset}`);
    copyDirSync(srcPublicDir, path.join(targetDir, "public"));
  }

  // 4. Create app/ directory
  console.log(
    `${colors.cyan}▶ Scaffolding App Router structure...${colors.reset}`,
  );
  const targetAppDir = path.join(targetDir, "app");
  fs.mkdirSync(targetAppDir, { recursive: true });

  // Copy app/fonts
  const srcFontsDir = path.join(sourceApp.dirPath, "app", "fonts");
  if (fs.existsSync(srcFontsDir)) {
    copyDirSync(srcFontsDir, path.join(targetAppDir, "fonts"));
  }

  // Copy app/favicon.ico
  const srcFavicon = path.join(sourceApp.dirPath, "app", "favicon.ico");
  if (fs.existsSync(srcFavicon)) {
    fs.copyFileSync(srcFavicon, path.join(targetAppDir, "favicon.ico"));
  }

  // Copy app/globals.css & page.module.css
  const srcGlobals = path.join(sourceApp.dirPath, "app", "globals.css");
  if (fs.existsSync(srcGlobals)) {
    fs.copyFileSync(srcGlobals, path.join(targetAppDir, "globals.css"));
  }
  const srcPageModule = path.join(sourceApp.dirPath, "app", "page.module.css");
  if (fs.existsSync(srcPageModule)) {
    fs.copyFileSync(srcPageModule, path.join(targetAppDir, "page.module.css"));
  }

  // Generate app/layout.tsx with custom title and metadata
  const formattedTitle = formatTitle(appName);
  const layoutContent = `import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "${formattedTitle}",
  description: "${formattedTitle} application powered by Next.js in Acme Monorepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={\`\${geistSans.variable} \${geistMono.variable}\`}>
        {children}
      </body>
    </html>
  );
}
`;
  fs.writeFileSync(path.join(targetAppDir, "layout.tsx"), layoutContent);

  // Generate app/page.tsx with starter template showcasing @repo/ui
  const pageContent = `import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0" }}>
            ${formattedTitle}
          </h1>
          <p style={{ color: "var(--gray-alpha-600)", fontSize: "0.95rem" }}>
            Running on port <code>${port}</code> • Package: <code>${packageName}</code>
          </p>
        </div>

        <ol>
          <li>
            Get started by editing <code>apps/${appName}/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Next.js Docs
          </a>
          <a
            href="https://turborepo.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Turborepo Docs
          </a>
        </div>
        <Button appName="${appName}" className={styles.secondary}>
          Open alert from @repo/ui
        </Button>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file-text.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(targetAppDir, "page.tsx"), pageContent);

  // Generate README.md
  const readmeContent = `# ${formattedTitle}

This is a Next.js application in the Acme monorepo, scaffolded using the custom \`create-app\` command mirroring the configuration of \`${sourceApp.folderName}\`.

## Configuration

- **Framework**: Next.js 16 (App Router & Turbopack)
- **React**: React 19
- **Port**: \`${port}\`
- **Monorepo Packages**:
  - \`@repo/ui\`: Shared UI components
  - \`@repo/eslint-config\`: Shared ESLint configuration
  - \`@repo/typescript-config\`: Shared TypeScript configuration

## Scripts

Run from monorepo root:

\`\`\`bash
# Start dev server on port ${port}
pnpm --filter ${packageName} dev

# Build for production
pnpm --filter ${packageName} build

# Type check
pnpm --filter ${packageName} check-types

# Lint
pnpm --filter ${packageName} lint
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, "README.md"), readmeContent);

  console.log(
    `${colors.green}✓ All files generated successfully in apps/${appName}!${colors.reset}\n`,
  );

  // Run pnpm install if requested
  if (shouldInstall) {
    console.log(
      `${colors.cyan}▶ Running "pnpm install" to link workspace packages...${colors.reset}`,
    );
    const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const installResult = spawnSync(pnpmCmd, ["install"], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    if (installResult.status !== 0) {
      console.warn(
        `${colors.yellow}Warning: "pnpm install" exited with code ${installResult.status}. You may need to run "pnpm install" manually.${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.green}✓ Workspace dependencies linked successfully.${colors.reset}`,
      );
    }
  }

  // Print Next Steps
  console.log(`
${colors.green}${colors.bold}🎉 Next.js app "${appName}" created successfully!${colors.reset}

${colors.bold}To get started:${colors.reset}
  ${colors.cyan}pnpm --filter ${packageName} dev${colors.reset}
  ${colors.dim}# Runs ${appName} dev server at http://localhost:${port}${colors.reset}

${colors.bold}Other available commands:${colors.reset}
  ${colors.cyan}pnpm --filter ${packageName} build${colors.reset}        ${colors.dim}# Build app for production${colors.reset}
  ${colors.cyan}pnpm --filter ${packageName} lint${colors.reset}         ${colors.dim}# Run ESLint checks${colors.reset}
  ${colors.cyan}pnpm --filter ${packageName} check-types${colors.reset}   ${colors.dim}# Run TypeScript checks${colors.reset}
  ${colors.cyan}pnpm dev${colors.reset}                                 ${colors.dim}# Run all apps simultaneously${colors.reset}
`);
}

main().catch((err) => {
  console.error(
    `${colors.red}An unexpected error occurred:${colors.reset}`,
    err,
  );
  process.exit(1);
});
