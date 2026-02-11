#!/bin/bash

# 1. 拉取最新代码
echo "📦 Pulling latest code..."
git pull

# 2. 重新构建并启动容器
# --build: 强制重新构建镜像（应用代码变更）
# -d: 后台运行
# --remove-orphans: 清理掉 docker-compose.yml 中已删除服务的容器
echo "🚀 Rebuilding and restarting containers..."
# 把 docker-compose 改为 docker compose
docker compose up -d --build --remove-orphans

# 3. 清理未使用的旧镜像（释放磁盘空间）
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
