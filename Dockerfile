FROM oven/bun:1.2-alpine AS builder

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

FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# 複製 standalone 建置檔案
COPY --from=builder /app/.next/standalone ./
# 複製靜態資料
COPY --from=builder /app/.next/static ./.next/static
# 只在 public 目錄存在時複製（目前此專案沒有 public 目錄）
# COPY --from=builder /app/public ./public

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]