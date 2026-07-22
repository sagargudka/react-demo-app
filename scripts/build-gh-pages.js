const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoName = 'react-demo-app';
const rootDir = '/home/sagar/rebase/react-demo-app';

function build() {
  try {
    console.log('--- Starting Production Build for GitHub Pages ---');

    // 1. Build Host Shell with base /react-demo-app/
    console.log('Building host shell...');
    execSync('npm run build -w host', {
      cwd: rootDir,
      env: { ...process.env, VITE_BASE_PATH: `/${repoName}/` },
      stdio: 'inherit'
    });

    // 2. Build React Remote with base /react-demo-app/mfe-react/
    console.log('Building mfe-react remote...');
    execSync('npm run build -w mfe-react', {
      cwd: rootDir,
      env: { ...process.env, VITE_BASE_PATH: `/${repoName}/mfe-react/` },
      stdio: 'inherit'
    });

    // 3. Build Vue Remote with base /react-demo-app/mfe-vue/
    console.log('Building mfe-vue remote...');
    execSync('npm run build -w mfe-vue', {
      cwd: rootDir,
      env: { ...process.env, VITE_BASE_PATH: `/${repoName}/mfe-vue/` },
      stdio: 'inherit'
    });

    // 4. Consolidate distributions
    const hostDist = path.join(rootDir, 'apps/host/dist');
    const reactDist = path.join(rootDir, 'apps/mfe-react/dist');
    const vueDist = path.join(rootDir, 'apps/mfe-vue/dist');

    console.log('Consolidating remote bundles into host build...');
    fs.cpSync(reactDist, path.join(hostDist, 'mfe-react'), { recursive: true });
    fs.cpSync(vueDist, path.join(hostDist, 'mfe-vue'), { recursive: true });

    // 5. Detect compiled javascript entry filenames (with hashes) dynamically
    const reactAssetsDir = path.join(hostDist, 'mfe-react/assets');
    const vueAssetsDir = path.join(hostDist, 'mfe-vue/assets');

    const findEntryJsFile = (dir) => {
      const files = fs.readdirSync(dir);
      const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
      if (!jsFile) throw new Error(`Could not find compiled index-*.js file in ${dir}`);
      return jsFile;
    };

    const reactEntry = findEntryJsFile(reactAssetsDir);
    const vueEntry = findEntryJsFile(vueAssetsDir);

    console.log(`Detected React remote entry: ${reactEntry}`);
    console.log(`Detected Vue remote entry: ${vueEntry}`);

    // 6. Write custom import-map.json pointing to production subfolders
    const importMap = {
      remotes: {
        "mfe-react": `/${repoName}/mfe-react/assets/${reactEntry}`,
        "mfe-vue": `/${repoName}/mfe-vue/assets/${vueEntry}`
      }
    };

    const importMapPath = path.join(hostDist, 'import-map.json');
    fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
    console.log(`Generated production import map at: ${importMapPath}`);

    // 7. Duplicate index.html to 404.html to resolve SPA router reloads on GitHub Pages
    const indexHtml = path.join(hostDist, 'index.html');
    const fallbackHtml = path.join(hostDist, '404.html');
    fs.copyFileSync(indexHtml, fallbackHtml);
    console.log('Duplicated index.html as 404.html for routing fallback.');

    console.log('--- Consolidation Complete! ---');
    console.log(`Ready for deployment. Target directory: ${hostDist}`);
  } catch (error) {
    console.error('Build consolidation failed:', error);
    process.exit(1);
  }
}

build();
