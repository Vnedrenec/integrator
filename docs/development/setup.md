# Руководство по настройке среды разработки

## Требования к системе
- Node.js v18+ (рекомендуется LTS версия)
- PostgreSQL 14+
- Redis 6+
- Docker и Docker Compose
- Git

## Установка зависимостей

### macOS
```bash
# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Node.js
brew install node@18

# Установка PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Установка Redis
brew install redis
brew services start redis

# Установка Docker
brew install --cask docker
```

### Linux (Ubuntu/Debian)
```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt-get install -y postgresql-14 postgresql-contrib-14
sudo systemctl start postgresql

# Установка Redis
sudo apt-get install -y redis-server
sudo systemctl start redis-server

# Установка Docker
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### Windows
- Установите [Node.js](https://nodejs.org/) (LTS версия)
- Установите [PostgreSQL](https://www.postgresql.org/download/windows/)
- Установите [Redis](https://github.com/microsoftarchive/redis/releases)
- Установите [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Клонирование репозитория
```bash
git clone https://github.com/your-organization/bpm-centr.git
cd bpm-centr
```

## Настройка переменных окружения
1. Скопируйте файл `.env.example` в `.env.development`:
```bash
cp .env.example .env.development
```

2. Отредактируйте файл `.env.development` и заполните необходимые переменные:
```
# Основные настройки
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# База данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bpm_centr_dev
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5432/bpm_centr_test

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# SendPulse
SENDPULSE_API_USER_ID=your_sendpulse_user_id
SENDPULSE_API_SECRET=your_sendpulse_secret
SENDPULSE_TOKEN_STORAGE=redis

# Make API
MAKE_API_URL=https://api.make.com/v2
MAKE_API_KEY=your_make_api_key
```

## Создание базы данных
```bash
# Вход в PostgreSQL
psql -U postgres

# Создание баз данных для разработки и тестирования
CREATE DATABASE bpm_centr_dev;
CREATE DATABASE bpm_centr_test;

# Выход из PostgreSQL
\q
```

## Установка зависимостей проекта
```bash
# Установка зависимостей для бэкенда
cd backend
npm install

# Установка зависимостей для фронтенда
cd ../frontend
npm install
```

## Запуск миграций
```bash
cd backend
npm run migration:run
```

## Запуск проекта в режиме разработки
```bash
# Запуск бэкенда
cd backend
npm run start:dev

# В отдельном терминале запуск фронтенда
cd frontend
npm run dev
```

## Запуск с использованием Docker Compose
```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

## Доступ к приложению
- Фронтенд: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger документация: http://localhost:3001/api/docs

## Настройка IDE

### VS Code
Рекомендуемые расширения:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Docker
- PostgreSQL

Настройки для VS Code (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "vue"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm/IntelliJ IDEA
- Включите ESLint и Prettier в настройках
- Настройте автоформатирование при сохранении

## Отладка

### Бэкенд
1. В VS Code создайте файл `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/backend/.env.development",
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

2. Запустите отладку через меню Debug в VS Code

### Фронтенд
1. Откройте Chrome DevTools
2. Перейдите на вкладку Sources
3. Найдите исходные файлы в разделе webpack://

## Решение проблем

### Проблемы с подключением к базе данных
- Проверьте, что PostgreSQL запущен: `pg_isready`
- Проверьте правильность URL подключения в `.env.development`
- Проверьте права доступа пользователя PostgreSQL

### Проблемы с Redis
- Проверьте, что Redis запущен: `redis-cli ping`
- Проверьте правильность URL подключения в `.env.development`

### Проблемы с Docker
- Проверьте, что Docker демон запущен: `docker info`
- Проверьте логи контейнеров: `docker-compose logs`
- Перезапустите контейнеры: `docker-compose down && docker-compose up -d`
