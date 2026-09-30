FROM node:24-bookworm-slim AS frontend
WORKDIR /app
RUN npm install --global pnpm@10.0.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html tsconfig.json vite.config.ts ./
COPY src/ src/
COPY public/ public/
RUN pnpm build

FROM python:3.12-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    STUDYLAB_PUBLIC=1 \
    STUDYLAB_HOST=0.0.0.0
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY server/ server/
COPY --from=frontend /app/dist/ dist/
USER 10001
EXPOSE 10000
CMD ["python", "server/app.py"]
