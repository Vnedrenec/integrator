# Настройка тестовой среды

В этом документе описаны шаги по настройке тестовой среды для разработки и тестирования проекта "BPM Centr".

## Содержание
- [Локальная среда разработки](#локальная-среда-разработки)
- [Тестовая среда (Staging)](#тестовая-среда-staging)
- [Настройка тестовых аккаунтов внешних сервисов](#настройка-тестовых-аккаунтов-внешних-сервисов)
- [Автоматизация тестирования](#автоматизация-тестирования)

## Локальная среда разработки

### Настройка базы данных

1. Создайте тестовую базу данных:
   ```sql
   CREATE DATABASE bpm_centr_test;
   ```

2. Запустите миграции для создания схемы:
   ```bash
   npm run migration:run -- --config=typeorm.config.test.ts
   ```

3. Заполните базу тестовыми данными:
   ```bash
   npm run seed:test
   ```

### Настройка переменных окружения

Создайте файл `.env.test` со следующими параметрами:

```
# Основные настройки
NODE_ENV=test
PORT=3001
API_PREFIX=/api/v1

# База данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bpm_centr_test

# Redis
REDIS_URL=redis://localhost:6379/1

# JWT
JWT_SECRET=test_jwt_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# SendPulse
SENDPULSE_API_USER_ID=test_user_id
SENDPULSE_API_SECRET=test_secret
SENDPULSE_TOKEN_STORAGE=memory

# Make API
MAKE_API_URL=https://api.make.com/v2
MAKE_API_KEY=test_make_api_key
```

### Запуск тестов

Команды запуска тестов описаны в [общем обзоре стратегии тестирования](overview.md).

Дополнительные команды для запуска тестов в разных режимах:

```bash
# Запуск с покрытием кода
npm run test:cov

# Запуск в режиме отладки
npm run test:debug
```

## Тестовая среда (Staging)

### Настройка инфраструктуры

1. Создайте отдельный кластер в AWS ECS для тестовой среды:
   ```bash
   terraform apply -var-file=staging.tfvars
   ```

2. Настройте CI/CD для автоматического деплоя в тестовую среду:
   ```yaml
   # .github/workflows/staging.yml
   name: Deploy to Staging

   on:
     push:
       branches:
         - develop

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v1
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: eu-central-1
         - name: Build and push Docker image
           run: |
             docker build -t bpm-centr:staging .
             aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
             docker tag bpm-centr:staging $ECR_REGISTRY/bpm-centr:staging
             docker push $ECR_REGISTRY/bpm-centr:staging
         - name: Deploy to ECS
           run: |
             aws ecs update-service --cluster bpm-centr-staging --service bpm-centr-service --force-new-deployment
   ```

### Настройка базы данных

1. Создайте отдельную базу данных для тестовой среды:
   ```sql
   CREATE DATABASE bpm_centr_staging;
   ```

2. Настройте резервное копирование:
   ```bash
   aws rds create-db-snapshot --db-instance-identifier bpm-centr-staging --db-snapshot-identifier bpm-centr-staging-snapshot
   ```

### Настройка мониторинга

1. Настройте Prometheus и Grafana для мониторинга тестовой среды:
   ```bash
   helm install prometheus prometheus-community/prometheus -f prometheus-staging-values.yaml
   helm install grafana grafana/grafana -f grafana-staging-values.yaml
   ```

2. Настройте алерты для критических ошибок:
   ```yaml
   # alertmanager-config.yaml
   receivers:
     - name: 'team-alerts'
       slack_configs:
         - channel: '#staging-alerts'
           send_resolved: true

   route:
     group_by: ['alertname', 'cluster', 'service']
     group_wait: 30s
     group_interval: 5m
     repeat_interval: 3h
     receiver: 'team-alerts'
   ```

## Настройка тестовых аккаунтов внешних сервисов

### Stripe

1. Создайте тестовый аккаунт на [Stripe](https://stripe.com/)
2. Перейдите в раздел "Developers" → "API keys"
3. Скопируйте "Publishable key" и "Secret key" для тестового режима
4. Создайте тестовые продукты и цены:
   ```javascript
   const stripe = require('stripe')('sk_test_...');

   async function createTestProducts() {
     // Создание продукта
     const product = await stripe.products.create({
       name: 'BPM Centr Subscription',
       description: 'Subscription for BPM Centr',
     });

     // Создание цены
     const price = await stripe.prices.create({
       product: product.id,
       unit_amount: 1000, // $10.00
       currency: 'usd',
       recurring: {
         interval: 'month',
       },
     });

     console.log('Product ID:', product.id);
     console.log('Price ID:', price.id);
   }

   createTestProducts();
   ```

5. Настройте вебхуки для тестовой среды:
   - URL: `https://staging-api.bpmcentr.com/api/v1/webhooks/stripe`
   - События: `customer.subscription.created`, `customer.subscription.updated`, `invoice.payment_succeeded`, `invoice.payment_failed`

### SendPulse

1. Создайте тестовый аккаунт на [SendPulse](https://sendpulse.com/)
2. Перейдите в раздел "Настройки" → "API"
3. Создайте новый API-ключ
4. Создайте тестовые шаблоны писем:
   - Подтверждение регистрации
   - Уведомление о скором окончании пробного периода
   - Подтверждение оплаты
   - Уведомление о неудачном платеже

### Make

1. Создайте тестовый аккаунт на [Make](https://www.make.com/)
2. Создайте тестовый коннектор:
   - Название: "BPM Centr Test"
   - Базовый URL: `https://staging-api.bpmcentr.com/api/v1`
   - Аутентификация: API Key (Header)
   - Действия: "Get Data", "Send Data"

## Автоматизация тестирования

### Настройка Jest

1. Создайте файл конфигурации Jest для модульных тестов:
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src'],
     testMatch: ['**/*.spec.ts'],
     collectCoverageFrom: [
       'src/**/*.ts',
       '!src/**/*.d.ts',
       '!src/main.ts',
       '!src/migrations/**',
     ],
     coverageDirectory: 'coverage',
     coverageReporters: ['text', 'lcov', 'clover'],
     moduleFileExtensions: ['ts', 'js', 'json'],
   };
   ```

2. Создайте файл конфигурации Jest для интеграционных тестов:
   ```javascript
   // jest-e2e.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/test'],
     testMatch: ['**/*.e2e-spec.ts'],
     moduleFileExtensions: ['ts', 'js', 'json'],
     setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
   };
   ```

### Настройка Cypress

1. Установите Cypress:
   ```bash
   npm install --save-dev cypress
   ```

2. Создайте файл конфигурации Cypress:
   ```javascript
   // cypress.config.js
   const { defineConfig } = require('cypress');

   module.exports = defineConfig({
     e2e: {
       baseUrl: 'http://localhost:3000',
       specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
       supportFile: 'cypress/support/e2e.js',
     },
   });
   ```

3. Создайте тестовые сценарии для Cypress:
   ```javascript
   // cypress/e2e/auth/login.cy.js
   describe('Login', () => {
     beforeEach(() => {
       cy.visit('/login');
     });

     it('should login successfully with valid credentials', () => {
       cy.get('input[name="email"]').type('user1@example.com');
       cy.get('input[name="password"]').type('password123');
       cy.get('button[type="submit"]').click();

       cy.url().should('include', '/dashboard');
       cy.contains('Welcome back').should('be.visible');
     });

     it('should show error with invalid credentials', () => {
       cy.get('input[name="email"]').type('user1@example.com');
       cy.get('input[name="password"]').type('wrongpassword');
       cy.get('button[type="submit"]').click();

       cy.contains('Invalid credentials').should('be.visible');
       cy.url().should('include', '/login');
     });
   });
   ```

### Настройка нагрузочного тестирования

1. Установите k6:
   ```bash
   npm install --save-dev k6
   ```

2. Создайте сценарий нагрузочного тестирования:
   ```javascript
   // load-tests/api-load-test.js
   import http from 'k6/http';
   import { sleep, check } from 'k6';

   export const options = {
     stages: [
       { duration: '30s', target: 20 },
       { duration: '1m', target: 50 },
       { duration: '30s', target: 0 },
     ],
     thresholds: {
       http_req_duration: ['p(95)<500'],
       http_req_failed: ['rate<0.01'],
     },
   };

   export default function () {
     const apiKey = 'api_key_12345';
     const res = http.get('https://staging-api.bpmcentr.com/api/v1/connectors/data', {
       headers: {
         'Authorization': `Bearer ${apiKey}`,
       },
     });

     check(res, {
       'status is 200': (r) => r.status === 200,
       'response time < 500ms': (r) => r.timings.duration < 500,
     });

     sleep(1);
   }
   ```

3. Запуск нагрузочного тестирования:
   ```bash
   k6 run load-tests/api-load-test.js
   ```

### Настройка CI/CD для тестирования

1. Добавьте шаг тестирования в CI/CD pipeline:
   ```yaml
   # .github/workflows/test.yml
   name: Test

   on:
     pull_request:
       branches:
         - develop
         - main

   jobs:
     test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:14
           env:
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgres
             POSTGRES_DB: bpm_centr_test
           ports:
             - 5432:5432
         redis:
           image: redis:6
           ports:
             - 6379:6379
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm ci
         - name: Lint
           run: npm run lint
         - name: Run migrations
           run: npm run migration:run -- --config=typeorm.config.test.ts
         - name: Run unit tests
           run: npm run test
         - name: Run e2e tests
           run: npm run test:e2e
         - name: Upload coverage
           uses: codecov/codecov-action@v2
           with:
             token: ${{ secrets.CODECOV_TOKEN }}
   ```
