# Publish guide

GitHub user: **clawk2026** · repo: **dsh-precheck**

## 1. Create / upload the public repo

Target: `https://github.com/clawk2026/dsh-precheck`

### Website upload

1. [github.com/new](https://github.com/new) → name **`dsh-precheck`** → Public → Create  
2. Upload this folder’s contents (`src/`, `dist/`, `package.json`, `README.md`, `LICENSE`, …)  
3. **Do not** upload `node_modules/`

### git CLI

```bash
cd dsh-precheck
git init
git add .
git commit -m "feat: dsh-precheck CLI 0.1"
git remote add origin git@github.com:clawk2026/dsh-precheck.git
git branch -M main
git push -u origin main
```

### Topics

`deepseek-harness` · `dsh` · `security` · `supply-chain` · `precheck`

### Users install with

```bash
npx github:clawk2026/dsh-precheck check github:owner/repo
```

Link the repo from [dshprecheck.com](https://dshprecheck.com) for discovery.

---

## 2. Optional: npm

1. [npmjs.com/signup](https://www.npmjs.com/signup)  
2. `npm login`  
3. `npm view dsh-precheck` (rename in package.json if taken)  
4. `npm run build && npm publish --access public`  
5. Users: `npm i -g dsh-precheck`
