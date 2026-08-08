#!/bin/bash
# 部署脚本 - 在服务器上执行
# 用法: bash deploy.sh

set -e

PROJECT_DIR="/var/www/seasir"
APP_NAME="seasir"
PORT=3000

echo "===== 部署 seasir 博客 ====="

# 进入项目目录
cd "$PROJECT_DIR"

# 安装依赖
echo "[1/4] 安装依赖..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# 构建
echo "[2/4] 构建生产版本..."
pnpm build

# 重启 PM2
echo "[3/4] 重启 PM2 进程..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME"
else
    PORT=$PORT pm2 start "pnpm start" --name "$APP_NAME"
fi

pm2 save

# 重载 Nginx
echo "[4/4] 重载 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "===== 部署完成 ====="
echo "访问: http://localhost:$PORT (本机)"
echo "域名: http://airestart.indevs.in (配置 DNS 后)"
echo ""
echo "查看日志: pm2 logs $APP_NAME"
