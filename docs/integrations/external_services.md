# Интеграция с внешними сервисами

В этом документе описываются интеграции платформы "BPM Centr" с внешними сервисами для MVP.

## Интеграция со Stripe

### Обзор интеграции

Stripe используется для обработки платежей и управления подписками. Интеграция со Stripe позволяет:

1. Создавать клиентов в Stripe
2. Сохранять платежные методы
3. Создавать и управлять подписками
4. Обрабатывать платежи
5. Получать уведомления о событиях через webhooks

### Настройка Stripe

#### Создание аккаунта и получение ключей API

1. Зарегистрируйтесь на [Stripe](https://stripe.com/)
2. Перейдите в раздел "Developers" -> "API keys"
3. Скопируйте "Publishable key" и "Secret key"
4. Для разработки используйте тестовые ключи (начинаются с `pk_test_` и `sk_test_`)
5. Для продакшена используйте боевые ключи (начинаются с `pk_live_` и `sk_live_`)

#### Настройка продуктов и цен

1. Перейдите в раздел "Products" -> "Add Product"
2. Создайте продукты для каждого типа коннектора
3. Для каждого продукта создайте цены (Prices):
   - Тип: повторяющийся (recurring)
   - Период: месячный (monthly) или годовой (yearly)
   - Валюта: USD

#### Настройка налогов

1. Перейдите в раздел "Tax" -> "Settings"
2. Настройте автоматическое начисление налогов
3. Для международных платежей подключите Stripe Tax

#### Настройка webhook

1. Перейдите в раздел "Developers" -> "Webhooks"
2. Нажмите "Add endpoint"
3. Укажите URL вашего API для обработки webhook (например, `https://api.bpmcentr.ru/webhooks/stripe`)
4. Выберите события для отслеживания:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
5. Скопируйте "Webhook signing secret" для проверки подписи webhook

### Интеграция на стороне бэкенда

#### Установка библиотеки Stripe

```bash
npm install stripe
```

#### Инициализация клиента Stripe

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});
```

#### Создание клиента в Stripe

```typescript
async function createStripeCustomer(user: User): Promise<string> {
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      userId: user.id
    }
  });

  return customer.id;
}
```

#### Создание подписки

```typescript
async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string,
  trialDays: number = 0
): Promise<Stripe.Subscription> {
  // Прикрепление платежного метода к клиенту
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Установка платежного метода по умолчанию
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Параметры подписки
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: customerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      connectorId: 'connector-123',
      makeAccountId: 'make-account-456',
      plan: 'monthly'
    }
  };

  // Добавление пробного периода, если указан
  if (trialDays > 0) {
    subscriptionParams.trial_period_days = trialDays;
  }

  // Создание подписки
  const subscription = await stripe.subscriptions.create(subscriptionParams);

  return subscription;
}
```

#### Отмена подписки

```typescript
async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}
```

#### Возобновление подписки

```typescript
async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}
```

#### Получение информации о подписке

```typescript
async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'default_payment_method', 'items.data.price.product']
  });

  return subscription;
}
```

#### Получение списка подписок пользователя

```typescript
async function getUserSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.items.data.price.product']
  });

  return subscriptions.data;
}
```

#### Обработка webhook

```typescript
import { Request, Response } from 'express';

async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      // Обработка других событий
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
```

### Интеграция на стороне фронтенда

#### Установка библиотеки Stripe

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Инициализация Stripe в React

```jsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

function App() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
```

#### Форма оплаты

```jsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    // Получение платежного метода
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
      return;
    }

    // Отправка paymentMethod.id на сервер для создания подписки
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        connectorId: 'conn_advanced_1',
        makeAccountId: 'make_account_1',
      }),
    });

    const subscription = await response.json();

    setProcessing(false);

    // Обработка результата
    if (subscription.status === 'active') {
      // Подписка успешно создана
    } else {
      // Обработка ошибки
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div>{error}</div>}
      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Обработка...' : 'Оформить подписку'}
      </button>
    </form>
  );
}
```

### Тестирование интеграции со Stripe

#### Тестовые карты

| Номер карты | Описание |
|-------------|----------|
| 4242 4242 4242 4242 | Успешный платеж |
| 4000 0000 0000 0002 | Отклоненный платеж (недостаточно средств) |
| 4000 0000 0000 9995 | Отклоненный платеж (платеж требует аутентификации) |
| 4000 0000 0000 3220 | Успешный платеж (требует 3D Secure) |
| 4000 0000 0000 0341 | Ошибка обработки карты |

#### Тестирование webhook

1. Установите [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Запустите прослушивание webhook:
   ```bash
   stripe listen --forward-to http://localhost:3001/webhooks/stripe
   ```
3. Используйте полученный webhook signing secret для проверки подписи
4. Запустите тестовое событие:
   ```bash
   stripe trigger customer.subscription.created
   ```

## Интеграция с Make (Integromat)

### Обзор интеграции

Интеграция с Make позволяет:

1. Проверять статус подписки пользователя
2. Регистрировать использование коннекторов
3. Ограничивать доступ к коннекторам на основе подписки

### API для коннекторов

#### Проверка статуса подписки

**Endpoint**: `GET /subscription/check`

**Headers**:
```
Authorization: Bearer {api_key}
```

**Query Parameters**:
```
connector: string (required) - Идентификатор коннектора
accountId: string (required) - Идентификатор аккаунта Make
```

**Response** (200 OK):
```json
{
  "active": true,
  "hasAccess": true,
  "accountId": "make_account_1",
  "category": "Расширенный",
  "expiresAt": "2023-05-22T12:00:00Z"
}
```

#### Регистрация использования коннектора

**Endpoint**: `POST /connector/usage`

**Headers**:
```
Authorization: Bearer {api_key}
```

**Request**:
```json
{
  "connector": "crm-connector",
  "make_account_id": "make_account_1",
  "operation": "getContact",
  "timestamp": "2023-04-23T11:30:00Z"
}
```

**Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174123",
  "connector": "crm-connector",
  "operation": "getContact",
  "timestamp": "2023-04-23T11:30:00Z",
  "status": "recorded",
  "make_account_id": "make_account_1"
}
```

### Реализация проверки подписки в коннекторе

```javascript
async function checkSubscription(bpmCentrApiKey, connectorName, makeAccountId, context) {
  try {
    // Запрос к API BPM Centr для проверки подписки
    const response = await context.http.get({
      url: 'https://api.bpmcentr.ru/v1/subscription/check',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      },
      params: {
        connector: connectorName,
        accountId: makeAccountId
      }
    });

    // Проверка результата
    if (response.statusCode !== 200) {
      throw new Error(`Subscription check failed: ${response.body.message || 'Unknown error'}`);
    }

    if (!response.body.active) {
      throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
    }

    if (!response.body.hasAccess) {
      throw new Error('This connector is not available for your subscription. Please purchase access to this connector at BPM Centr.');
    }

    if (response.body.accountId !== makeAccountId) {
      throw new Error('This connector is linked to a different Make account. Please purchase a subscription for this account at BPM Centr.');
    }

    return true;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
}
```

### Реализация регистрации использования в коннекторе

```javascript
async function registerUsage(bpmCentrApiKey, connectorName, operationName, makeAccountId, context) {
  try {
    // Запрос к API BPM Centr для регистрации использования
    const response = await context.http.post({
      url: 'https://api.bpmcentr.ru/v1/connector/usage',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        connector: connectorName,
        operation: operationName,
        make_account_id: makeAccountId,
        timestamp: new Date().toISOString()
      }
    });

    // Проверка результата
    if (response.statusCode !== 201) {
      throw new Error(`Failed to register usage: ${response.body.message || 'Unknown error'}`);
    }

    return true;
  } catch (error) {
    throw new Error(`Usage registration failed: ${error.message}`);
  }
}
```

### Пример использования в операции коннектора

```javascript
{
  name: 'getContact',
  execute: async function(params, context) {
    try {
      // Получение ключа BPM Centr из параметров аутентификации
      const bpmCentrApiKey = context.auth.bpmCentrApiKey;

      // Получение идентификатора аккаунта Make
      const makeAccountId = context.auth.makeAccountId || 'make_account_1';

      // Проверка подписки
      await checkSubscription(bpmCentrApiKey, 'crm-connector', makeAccountId, context);

      // Выполнение операции
      const { contactId } = params;
      const { apiKey } = context.auth;

      // Запрос к внешнему API
      const response = await context.http.get({
        url: `https://api.example.com/contacts/${contactId}`,
        headers: {
          'X-API-Key': apiKey
        }
      });

      // Обработка ответа
      if (response.statusCode !== 200) {
        throw new Error(`Failed to get contact: ${response.body.error || 'Unknown error'}`);
      }

      // Регистрация использования
      await registerUsage(bpmCentrApiKey, 'crm-connector', 'getContact', makeAccountId, context);

      // Возврат результата
      return response.body;
    } catch (error) {
      throw new Error(`Error getting contact: ${error.message}`);
    }
  }
}
```

### Тестирование интеграции с Make

#### Создание тестового коннектора

1. Зарегистрируйтесь на [Make Developer Hub](https://www.make.com/en/developer-platform)
2. Создайте новый коннектор
3. Реализуйте базовую функциональность коннектора
4. Добавьте проверку подписки и регистрацию использования
5. Протестируйте коннектор в Make

#### Тестирование проверки подписки

1. Создайте тестовый API-ключ в BPM Centr
2. Настройте коннектор с этим API-ключом
3. Выполните операцию коннектора
4. Проверьте, что запрос к API для проверки подписки выполняется успешно
5. Проверьте, что использование операции регистрируется в системе

#### Тестирование ограничений

1. Создайте тестовый API-ключ с ограниченным количеством операций
2. Настройте коннектор с этим API-ключом
3. Выполните операции коннектора до достижения лимита
4. Проверьте, что после достижения лимита операции блокируются
5. Проверьте, что пользователь получает понятное сообщение об ошибке

## Интеграция с SendPulse

### Обзор интеграции

SendPulse используется для отправки email-сообщений пользователям. Интеграция с SendPulse позволяет:

1. Отправлять письма для подтверждения email
2. Отправлять письма для сброса пароля
3. Отправлять уведомления о подписках и платежах
4. Отправлять маркетинговые рассылки

### Настройка SendPulse

#### Создание аккаунта и получение ключей API

1. Зарегистрируйтесь на [SendPulse](https://sendpulse.com/)
2. Перейдите в раздел "Настройки" -> "API"
3. Скопируйте "ID пользователя" и "Secret"

#### Настройка шаблонов писем

1. Перейдите в раздел "Email" -> "Шаблоны"
2. Создайте шаблоны для различных типов писем:
   - Подтверждение email
   - Сброс пароля
   - Уведомление о подписке
   - Уведомление о платеже
   - Уведомление об отмене подписки

### Интеграция на стороне бэкенда

#### Установка библиотеки SendPulse

```bash
npm install sendpulse-api
```

#### Инициализация клиента SendPulse

```typescript
import * as sendpulse from 'sendpulse-api';

const sendpulseConfig = {
  userId: process.env.SENDPULSE_USER_ID,
  secret: process.env.SENDPULSE_SECRET,
  tokenStorage: process.env.SENDPULSE_TOKEN_STORAGE || 'memcached',
};

// Инициализация SendPulse
const sendpulseClient = new Promise<any>((resolve, reject) => {
  sendpulse.init(sendpulseConfig.userId, sendpulseConfig.secret, sendpulseConfig.tokenStorage, (token) => {
    if (token && token.is_error) {
      reject(new Error(token.message));
    } else {
      resolve(sendpulse);
    }
  });
});
```

#### Отправка письма для подтверждения email

```typescript
async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const client = await sendpulseClient;

  const emailData = {
    subject: 'Подтверждение email на BPM Centr',
    from: {
      name: 'BPM Centr',
      email: 'noreply@bpmcentr.ru',
    },
    to: [
      {
        name: '',
        email,
      },
    ],
    template: {
      id: 'verification_email_template_id',
      variables: {
        verification_link: `https://bpmcentr.ru/verify-email?token=${token}`,
      },
    },
  };

  return new Promise((resolve, reject) => {
    client.smtpSendMail((data) => {
      if (data && data.is_error) {
        reject(new Error(data.message));
      } else {
        resolve();
      }
    }, emailData);
  });
}
```

#### Отправка письма для сброса пароля

```typescript
async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const client = await sendpulseClient;

  const emailData = {
    subject: 'Сброс пароля на BPM Centr',
    from: {
      name: 'BPM Centr',
      email: 'noreply@bpmcentr.ru',
    },
    to: [
      {
        name: '',
        email,
      },
    ],
    template: {
      id: 'password_reset_template_id',
      variables: {
        reset_link: `https://bpmcentr.ru/reset-password?token=${token}`,
      },
    },
  };

  return new Promise((resolve, reject) => {
    client.smtpSendMail((data) => {
      if (data && data.is_error) {
        reject(new Error(data.message));
      } else {
        resolve();
      }
    }, emailData);
  });
}
```

#### Отправка уведомления о подписке

```typescript
async function sendSubscriptionConfirmationEmail(
  email: string,
  firstName: string,
  connectorName: string,
  category: string,
  endDate: string,
  amount: number
): Promise<void> {
  const client = await sendpulseClient;

  const emailData = {
    subject: 'Подтверждение подписки на BPM Centr',
    from: {
      name: 'BPM Centr',
      email: 'noreply@bpmcentr.ru',
    },
    to: [
      {
        name: firstName,
        email,
      },
    ],
    template: {
      id: 'subscription_confirmation_template_id',
      variables: {
        first_name: firstName,
        connector_name: connectorName,
        category: category,
        end_date: endDate,
        amount: amount,
      },
    },
  };

  return new Promise((resolve, reject) => {
    client.smtpSendMail((data) => {
      if (data && data.is_error) {
        reject(new Error(data.message));
      } else {
        resolve();
      }
    }, emailData);
  });
}
```

### Тестирование интеграции с SendPulse

#### Тестирование отправки писем

1. Настройте SendPulse в тестовом окружении
2. Отправьте тестовые письма на тестовые email-адреса
3. Проверьте, что письма доставляются и отображаются корректно
4. Проверьте, что переменные в шаблонах заменяются корректно
5. Проверьте, что ссылки в письмах работают корректно

## Интеграция с Sentry

### Обзор интеграции

Sentry используется для мониторинга и отслеживания ошибок в приложении. Интеграция с Sentry позволяет:

1. Отслеживать ошибки в реальном времени
2. Получать детальную информацию о контексте ошибок
3. Группировать похожие ошибки для упрощения анализа
4. Получать уведомления о новых ошибках
5. Анализировать производительность приложения

### Настройка Sentry

#### Создание аккаунта и проекта

1. Зарегистрируйтесь на [Sentry](https://sentry.io/)
2. Создайте новую организацию или используйте существующую
3. Создайте новый проект для бэкенда (Node.js) и фронтенда (React)
4. Получите DSN (строка подключения) для каждого проекта

#### Настройка уведомлений

1. Перейдите в раздел "Settings" -> "Alerts"
2. Настройте правила оповещений для разных типов событий
3. Настройте интеграцию с Slack или электронной почтой

### Интеграция с бэкендом

#### Установка библиотеки Sentry

```bash
npm install @sentry/node @sentry/integrations
```

#### Инициализация Sentry в Node.js

```typescript
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import * as path from 'path';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new RewriteFrames({
      root: global.__dirname || process.cwd(),
    }),
  ],
  tracesSampleRate: 1.0, // Для продакшена рекомендуется значение меньше 1.0
});
```

#### Использование Sentry в Express.js

```typescript
import * as Sentry from '@sentry/node';
import express from 'express';

const app = express();

// Мидлвары Sentry должны быть первыми
app.use(Sentry.Handlers.requestHandler());

// Ваши маршруты
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Обработчик ошибок Sentry должен быть перед другими обработчиками
app.use(Sentry.Handlers.errorHandler());

// Обработчик ошибок
app.use(function (err, req, res, next) {
  res.statusCode = 500;
  res.end('Internal Server Error');
});

app.listen(3000);
```

### Интеграция с фронтендом

#### Установка библиотеки Sentry

```bash
npm install @sentry/react @sentry/tracing
```

#### Инициализация Sentry в React

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0, // Для продакшена рекомендуется значение меньше 1.0
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

#### Использование ErrorBoundary в React

```jsx
import React from 'react';
import * as Sentry from '@sentry/react';

function FallbackComponent() {
  return (
    <div className="error-boundary">
      <h2>Что-то пошло не так</h2>
      <p>Произошла ошибка. Пожалуйста, попробуйте обновить страницу.</p>
      <button onClick={() => window.location.reload()}>Обновить страницу</button>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <YourComponent />
    </Sentry.ErrorBoundary>
  );
}
```

## Общие рекомендации по интеграциям

### Безопасность

1. **Не храните секретные ключи в коде** - используйте переменные окружения или хранилище секретов
2. **Используйте HTTPS для всех запросов** - это обеспечивает шифрование данных при передаче
3. **Проверяйте подписи webhook** - это защищает от подделки запросов
4. **Ограничивайте доступ к API** - используйте аутентификацию и авторизацию
5. **Логируйте все запросы и ответы** - это помогает отладить проблемы и обнаружить атаки

### Обработка ошибок

1. **Обрабатывайте все возможные ошибки** - не допускайте падения приложения
2. **Предоставляйте понятные сообщения об ошибках** - это помогает пользователям понять, что пошло не так
3. **Логируйте ошибки с контекстом** - это помогает отладить проблемы
4. **Реализуйте механизм повторных попыток** - это помогает справиться с временными сбоями

### Мониторинг

1. **Отслеживайте статус интеграций** - это помогает быстро обнаружить проблемы
2. **Настройте оповещения о сбоях** - это помогает быстро реагировать на проблемы
3. **Отслеживайте производительность** - это помогает выявить узкие места
4. **Анализируйте использование** - это помогает оптимизировать интеграции

### Тестирование

1. **Тестируйте в изолированной среде** - это предотвращает влияние на продакшн
2. **Используйте тестовые аккаунты и API-ключи** - это предотвращает списание средств
3. **Автоматизируйте тестирование** - это обеспечивает регулярную проверку
4. **Тестируйте граничные случаи** - это помогает выявить скрытые проблемы
