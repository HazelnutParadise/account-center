FROM oven/bun:1.2-alpine

# 設定環境變數
ENV NODE_ENV=production

# 設定工作目錄
WORKDIR /app

# 先複製 package.json 和 bun.lockb (優化快取)
COPY package.json bun.lockb* ./

# 安裝相依套件
RUN bun install --frozen-lockfile

# 複製其餘專案檔案
COPY . .

# 建置專案
RUN bun run build

CMD [ "bun", "start" ]