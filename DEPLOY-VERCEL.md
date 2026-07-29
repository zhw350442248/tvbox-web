# 部署到 Vercel（网页版 TVBox / KatelyaTV）

本项目是 **KatelyaTV**（真·TVBox 网页移植版，Next.js 14）。它自带 API 路由代理 TVBox 源（解决 CORS），支持导入你自己的 TVBox 接口配置，可一键部署到 Vercel 拿到 HTTPS 地址，iPhone Safari「添加到主屏幕」即当作 App 用。

> 仓库里已自带 `vercel.json`，且 `package.json` 声明了 `packageManager: pnpm@10.12.4` + `pnpm-lock.yaml`，Vercel 会自动用 pnpm 构建，无需额外配置。

---

## 一、本地先跑通（可选，验证用）

```bash
cd TV-main
npm install --legacy-peer-deps     # 本地用 npm；Vercel 上用 pnpm，互不影响
npm run dev                        # 开发模式，访问 http://localhost:3000
# 或生产构建 + 启动：
npm run build && npm run start
```

> 注意：仓库根目录 `.npmrc` 已写 `legacy-peer-deps=true`，因为 `@cloudflare/next-on-pages`（Cloudflare 专用）与 `next@14.2.x` 有 peer 冲突，Vercel 用不到该包，故本地用 legacy 模式绕过。Vercel 用 pnpm 不受影响。

---

## 二、部署到 Vercel（两种方式，任选）

### 方式 A：GitHub 导入（你选的，最省事）

1. 把本目录推到你的 GitHub（Vercel 需要从一个 Git 仓库导入）：
   ```bash
   cd TV-main
   git init
   git add .
   git commit -m "TVBox web (KatelyaTV)"
   # 在 GitHub 新建一个空仓库，然后：
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
   > 提示：推送前确认 `.gitignore` 已忽略 `node_modules`、`.next`、`src/lib/runtime.ts`（构建自动生成）。仓库里已有 `.gitignore`，一般已覆盖。

2. 打开 https://vercel.com → 用 GitHub 登录 → **Add New → Project** → 选中该仓库 → 点 **Deploy**。
3. Vercel 会自动识别 Next.js，用 pnpm 安装并构建。

### 方式 B：Vercel CLI 本地直传（不用 GitHub）

```bash
npm i -g vercel
cd TV-main
vercel            # 首次会弹浏览器登录，之后按提示选默认配置
vercel --prod     # 部署到生产环境
```

---

## 三、Vercel 环境变量（必填）

在 Vercel 项目 **Settings → Environment Variables** 里添加（构建前就要设好，因为 `NEXT_PUBLIC_*` 是编译期变量）：

| 变量 | 值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_STORAGE_TYPE` | `localstorage` | 单用户、无数据库，配置存在浏览器，免费版即可 |
| `PASSWORD` | 你自己设的密码，如 `admin123` | 后台管理密码（必填） |
| `NEXT_PUBLIC_ENABLE_REGISTER` | `false` | 关闭公开注册 |
| `NEXT_PUBLIC_SEARCH_MAX_PAGE` | `5` | 搜索最大翻页数 |

> 其他变量（REDIS/D1/UPSTASH 等）在 `localstorage` 模式下**不用填**。

部署完成后，Vercel 会给一个 `https://xxxx.vercel.app` 地址。

---

## 四、添加你自己的 TVBox 配置源

1. 浏览器打开你的 Vercel 地址，首次访问会要求输入密码（上面设的 `PASSWORD`）。
2. 进入后台管理（通常 `/admin` 或页面里的「设置/源管理」），把你自己的 TVBox 接口地址（一个 `https://...json`）填进去并保存。
3. 也可直接编辑仓库里的 `config.json`（把 `api_site` 换成你的源），重新部署生效。

> 没有源 = 没有任何频道。TVBox 的所有内容都来自你提供的接口地址。

---

## 五、iPhone 上使用

1. iPhone Safari 打开你的 `https://xxxx.vercel.app` 地址。
2. 点底部「分享」→「添加到主屏幕」。
3. 以后主屏图标点开就是全屏 App 体验（项目已带 PWA / next-pwa）。

---

## 六、已知说明

- 默认 `config.json` 里的源是示例占位（`example.com`），需替换成你自己的 TVBox 接口。
- 爬虫 jar 类源（`type=0`）在网页端通过代理 `api` 字段访问，与原 TVBox App 体验接近；部分纯 jar 脚本源网页端可能不完全等价。
- Vercel 免费版 Serverless 有调用次数/时长限制，个人轻度使用足够。
