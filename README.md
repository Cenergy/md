# MD-Test2 Project

## 开发指南 (Development)

### 启动项目 (Start)

```bash
npm run dev
```
此命令会同时启动后端服务（端口 3001）并挂载 Vite 中间件，实现单端口全栈开发。

### 数据库管理 (Prisma)

本项目使用 Prisma ORM + SQLite。Schema 文件位于 `server/prisma/schema.prisma`。
已在 `package.json` 中配置了 schema 路径，因此无需手动指定 `--schema` 参数。

- **同步数据库结构 (开发常用)**
  快速将 Schema 变更同步到数据库，不生成迁移文件：
  ```bash
  npx prisma db push
  ```

- **生成 Prisma Client**
  当 Schema 变更后，需要重新生成 Client 以获得最新的类型提示：
  ```bash
  npx prisma generate
  ```

- **创建迁移文件**
  用于生产环境或版本控制的数据库结构变更：
  ```bash
  npx prisma migrate dev
  ```

- **可视化管理数据库**
  启动 Prisma Studio 在浏览器中查看和编辑数据：
  ```bash
  npx prisma studio
  ```
