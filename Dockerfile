FROM oven/bun:1.2-alpine

# 設定工作目錄
WORKDIR /app

# 複製專案檔案
COPY . .

# 安裝相依套件
RUN bun install

# 建置專案
RUN bun run build

CMD [ "bun", "start" ]