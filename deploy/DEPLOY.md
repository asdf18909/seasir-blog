# Next.js 博客部署到 VPS 完整指南

> 目标域名：`airestart.indevs.in`
> 服务器：Linux (Ubuntu/Debian/CentOS 均可)

---

## 整体流程

```
本地代码 → 上传到服务器 → npm install + build → PM2 守护进程 → Nginx 反向代理 → DNS 解析 → HTTPS 证书
```

---

## 第一步：上传代码到服务器

### 方式 A：通过 Git（推荐）

如果你有 GitHub 仓库：

```bash
# 在服务器上
cd /var/www
git clone https://github.com/你的用户名/你的仓库.git seasir
```

### 方式 B：通过 SCP 直接上传

```bash
# 在本地（Windows Git Bash）
# 先排除不需要的文件
cd /c/Users/Administrator/Desktop/seasir

# 打包（排除 node_modules 和 .next）
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf /tmp/seasir.tar.gz .

# 上传到服务器（替换为你的服务器 IP 和用户名）
scp /tmp/seasir.tar.gz root@你的服务器IP:/var/www/seasir/

# SSH 登录服务器
ssh root@你的服务器IP

# 解压
cd /var/www/seasir
tar -xzf seasir.tar.gz
rm seasir.tar.gz
```

---

## 第二步：安装服务器环境

```bash
# === 安装 Node.js 22.x ===
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs    # Debian/Ubuntu
# CentOS: sudo yum install -y nodejs

# 验证
node -v   # 应显示 v22.x.x
npm -v

# === 安装 pnpm ===
npm install -g pnpm

# === 安装 PM2（进程守护） ===
npm install -g pm2

# === 安装 Nginx ===
sudo apt-get install -y nginx      # Debian/Ubuntu
# CentOS: sudo yum install -y nginx
```

---

## 第三步：安装依赖并构建

```bash
cd /var/www/seasir

# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 测试启动（Ctrl+C 退出）
pnpm start
# 应该能看到 "Ready on http://localhost:3000"
```

---

## 第四步：用 PM2 守护进程

```bash
cd /var/www/seasir

# 启动（端口设为 3000）
pm2 start "pnpm start" --name seasir

# 查看状态
pm2 status

# 查看日志
pm2 logs seasir

# 设置开机自启
pm2 save
pm2 startup
# 按提示执行返回的那条命令
```

常用 PM2 命令：
```bash
pm2 restart seasir   # 重启
pm2 stop seasir      # 停止
pm2 delete seasir    # 删除
pm2 logs seasir      # 查看日志
```

---

## 第五步：配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/conf.d/seasir.conf
```

粘贴以下内容（也在本地 deploy/nginx.conf 中）：

```nginx
server {
    listen 80;
    server_name airestart.indevs.in;

    # 上传文件大小限制（视频上传需要）
    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

测试并重载 Nginx：

```bash
sudo nginx -t          # 测试配置
sudo systemctl reload nginx   # 重载
sudo systemctl enable nginx   # 开机自启
```

---

## 第六步：配置 DNS 解析

到管理 `indevs.in` 域名的后台（域名注册商或 DNS 服务商），添加一条记录：

### 如果 airestart 是子域名（CNAME 到服务器域名）：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | airestart | 你的服务器IP地址 |

或者

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | airestart | 你的服务器域名 |

**注意：** `airestart.indevs.in` 中，`indevs.in` 是主域名，`airestart` 是子域名前缀。
所以主机记录填 `airestart`，记录值填你服务器的 IP。

---

## 第七步：配置 HTTPS 证书（Let's Encrypt 免费）

```bash
# 安装 certbot
sudo apt-get install -y certbot python3-certbot-nginx   # Debian/Ubuntu
# CentOS: sudo yum install -y certbot python3-certbot-nginx

# 自动获取并配置 SSL 证书
sudo certbot --nginx -d airestart.indevs.in

# 按提示操作：
# 1. 输入邮箱
# 2. 同意条款
# 3. 选择是否重定向 HTTP → HTTPS（选是）

# 自动续期（certbot 会自动设置定时任务）
sudo certbot renew --dry-run   # 测试续期
```

---

## 第八步：验证

浏览器访问 `https://airestart.indevs.in`，应该能看到你的博客。

### 常见问题排查

```bash
# 1. 检查 Next.js 是否运行
pm2 status
curl http://localhost:3000

# 2. 检查 Nginx 配置
sudo nginx -t
sudo systemctl status nginx

# 3. 检查端口监听
sudo netstat -tlnp | grep -E '80|443|3000'

# 4. 检查 DNS 是否生效
dig airestart.indevs.in
# 或在线工具: https://dnschecker.org

# 5. 查看错误日志
pm2 logs seasir --lines 50
sudo tail -50 /var/log/nginx/error.log
```

---

## 后续更新代码

每次更新代码后：

```bash
cd /var/www/seasir
git pull                    # 或重新上传文件
pnpm install                # 如果依赖有变化
pnpm build                  # 重新构建
pm2 restart seasir          # 重启应用
```

---

## 备注

- `data/` 目录（articles.json、stats.json 等）在服务器上生成，**不要覆盖**
- `public/uploads/`、`public/videos/`、`public/music/` 也是用户上传的文件，部署时注意保留
- 如果服务器内存 < 1GB，构建时可能 OOM，可以加 swap：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
