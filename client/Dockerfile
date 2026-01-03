# 多階段構建 - 前端 Dockerfile

# 階段 1: 構建階段
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝所有依賴（包含 devDependencies）
RUN npm ci

# 複製源碼
COPY . .

# 設定構建時的環境變數（Zeabur 會自動注入）
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 構建生產版本
RUN npm run build

# 階段 2: 生產階段
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從構建階段複製構建產物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
