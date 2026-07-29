# D1 数据库迁移 - 添加跳过配置功能

如果您已经有一个运行中的 D1 数据库，需要执行以下 SQL 语句来添加跳过配置支持。

## 🗄️ 新增表结构

### skip_configs 表

这个表用于存储用户的跳过片头片尾配置：

```sql
-- 创建跳过配置表
CREATE TABLE IF NOT EXISTS skip_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  key TEXT NOT NULL,
  source TEXT NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  segments TEXT NOT NULL,
  updated_time INTEGER NOT NULL,
  UNIQUE(username, key)
);

-- 为跳过配置添加索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_skip_configs_username ON skip_configs(username);
CREATE INDEX IF NOT EXISTS idx_skip_configs_username_key ON skip_configs(username, key);
CREATE INDEX IF NOT EXISTS idx_skip_configs_username_updated_time ON skip_configs(username, updated_time DESC);
```

## 🚀 执行迁移的方法

### 方法一：使用 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入您的账户，找到 **D1** 服务
3. 选择您的数据库实例
4. 点击 **Console** 标签页
5. 在 SQL 查询界面中粘贴上面的 SQL 代码
6. 点击 **Execute** 执行

### 方法二：使用 Wrangler CLI

如果您有 Wrangler CLI，可以在本地执行：

```bash
# 首先登录 Cloudflare
wrangler auth login

# 执行数据库迁移
wrangler d1 execute your-database-name --file=migration.sql
```

其中 `migration.sql` 包含上面的 SQL 代码。

### 方法三：通过 Pages 函数执行（高级）

也可以创建一个临时的迁移函数，部署后访问来执行迁移。

## 📋 字段说明

| 字段名         | 类型    | 说明                            |
| -------------- | ------- | ------------------------------- |
| `id`           | INTEGER | 主键，自动递增                  |
| `username`     | TEXT    | 用户名，关联到用户              |
| `key`          | TEXT    | 配置键，格式：`source+video_id` |
| `source`       | TEXT    | 视频源标识                      |
| `video_id`     | TEXT    | 视频 ID                         |
| `title`        | TEXT    | 视频标题                        |
| `segments`     | TEXT    | 跳过片段数据（JSON 格式）       |
| `updated_time` | INTEGER | 更新时间戳                      |

## ✅ 迁移验证

执行迁移后，可以通过以下 SQL 验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT name FROM sqlite_master WHERE type='table' AND name='skip_configs';

-- 检查表结构
PRAGMA table_info(skip_configs);

-- 检查索引是否创建
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='skip_configs';
```

## ⚠️ 重要提示

1. **备份数据**：执行迁移前建议备份数据库
2. **测试环境**：建议先在测试环境执行迁移
3. **版本兼容**：这个迁移向后兼容，不会影响现有功能
4. **只需执行一次**：这个迁移脚本可以安全地重复执行（使用了 `IF NOT EXISTS`）

## 🔄 如果您是新部署

如果您是新部署的 D1 数据库，直接使用更新后的 `D1初始化.md` 中的完整 SQL 即可，无需单独执行迁移。

---

执行完迁移后，跳过功能就可以在您的 D1 部署中正常使用了！🎉
