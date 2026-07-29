# 🚀 部署兼容性说明

## 跳过片头片尾功能部署兼容性

我们的跳过片头片尾功能已经完全兼容各种部署方式，具体如下：

## 📋 功能概述

- ✅ **自动跳过片头片尾** - 智能检测并跳过重复内容
- ✅ **手动配置跳过段** - 用户可自定义跳过时间段
- ✅ **多剧集支持** - 每个剧集独立配置
- ✅ **多存储后端** - 支持 LocalStorage、Redis、D1、Upstash

## 🌐 部署方式兼容性

### 1. Cloudflare Pages ✅

**Runtime**: Edge Runtime  
**配置要求**: 所有 API 路由必须使用 `export const runtime = 'edge';`

```typescript
// ✅ 已正确配置
export const runtime = 'edge';
```

**特性支持**:

- ✅ 跳过配置 API (`/api/skip-configs`)
- ✅ 所有存储后端（D1、Redis、Upstash）
- ✅ 自动缓存优化

### 2. Docker 部署 ✅

**Runtime**: Node.js Runtime (自动转换)  
**自动转换**: Dockerfile 会自动将 Edge Runtime 转换为 Node.js Runtime

```dockerfile
# Dockerfile 中的自动转换逻辑
RUN find ./src -type f -name "route.ts" -print0 \
  | xargs -0 sed -i "s/export const runtime = 'edge';/export const runtime = 'nodejs';/g"
```

**特性支持**:

- ✅ 跳过配置 API
- ✅ 所有存储后端
- ✅ 环境变量配置
- ✅ 健康检查

### 3. Vercel 部署 ✅

**Runtime**: Edge Runtime / Node.js Runtime (自动检测)  
**配置**: 无需特殊配置，自动适配

**特性支持**:

- ✅ 跳过配置 API
- ✅ 所有存储后端
- ✅ Serverless 函数优化

### 4. 其他部署方式 ✅

**Runtime**: Node.js Runtime  
**要求**: Node.js 18+ 环境

**支持的部署方式**:

- ✅ 传统服务器部署
- ✅ PM2 进程管理
- ✅ Nginx 反向代理
- ✅ Kubernetes
- ✅ Railway、Render 等云平台

## 🗄️ 存储后端支持

### LocalStorage (默认)

```bash
# 无需额外配置，适用于单机部署
NEXT_PUBLIC_STORAGE_TYPE=localstorage
```

### Redis

```bash
# 高性能缓存存储
NEXT_PUBLIC_STORAGE_TYPE=redis
REDIS_URL=redis://localhost:6379
```

### Cloudflare D1

```bash
# Cloudflare 原生数据库
NEXT_PUBLIC_STORAGE_TYPE=d1
```

### Upstash Redis

```bash
# 无服务器 Redis
NEXT_PUBLIC_STORAGE_TYPE=upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## 🔧 环境变量配置

### 核心配置

```bash
# 存储类型 (必需)
NEXT_PUBLIC_STORAGE_TYPE=localstorage|redis|d1|upstash

# Docker 环境标识 (Docker 部署时自动设置)
DOCKER_ENV=true
```

### 存储特定配置

```bash
# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional

# Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# D1 (Cloudflare 自动注入)
# 无需手动配置
```

## 🚀 快速部署指南

### Cloudflare Pages

1. 连接 GitHub 仓库
2. 设置构建命令: `npm run build`
3. 设置输出目录: `.next`
4. 配置环境变量 (可选)

### Docker

```bash
# 构建镜像
docker build -t katelyatv .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_STORAGE_TYPE=localstorage \
  katelyatv
```

### Vercel

```bash
# 一键部署
npx vercel

# 或使用 Vercel CLI
vercel --prod
```

## 🧪 兼容性测试

运行兼容性测试脚本：

```bash
# 测试所有部署方式的兼容性
node scripts/test-docker-compatibility.js
```

## ⚠️ 注意事项

1. **Edge Runtime 限制**: 在 Cloudflare Pages 上，所有 API 路由必须使用 Edge Runtime
2. **存储选择**: 根据部署环境选择合适的存储后端
3. **环境变量**: 确保在生产环境中正确配置存储相关环境变量
4. **缓存策略**: LocalStorage 仅适用于单机部署，集群部署请使用 Redis

## 📊 性能建议

### 小型部署 (< 1000 用户)

- **推荐**: LocalStorage
- **优点**: 零配置，性能良好
- **缺点**: 仅支持单机

### 中型部署 (1000-10000 用户)

- **推荐**: Redis
- **优点**: 高性能，支持集群
- **缺点**: 需要 Redis 服务器

### 大型部署 (> 10000 用户)

- **推荐**: Cloudflare D1 + Redis 缓存
- **优点**: 高可用，全球分布
- **缺点**: 依赖 Cloudflare

## 🆘 故障排除

### 常见问题

1. **API 路由 404**

   - 检查 Edge Runtime 配置
   - 确认部署环境支持

2. **跳过配置保存失败**

   - 检查存储后端配置
   - 验证环境变量设置

3. **Docker 构建失败**

   - 确认 Node.js 版本 ≥ 18
   - 检查 pnpm 安装

4. **Cloudflare Pages 部署失败**
   - 确认所有 API 路由有 Edge Runtime 配置
   - 检查构建命令和输出目录

---

🎉 **恭喜！** 您的跳过片头片尾功能已完全兼容所有主流部署方式！
