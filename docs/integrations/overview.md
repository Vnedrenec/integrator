# Интеграции с внешними сервисами

В этом документе описаны детали интеграции с внешними сервисами, используемыми в проекте "BPM Centr".

## Содержание
- [Stripe](#stripe)
- [PayPal](#paypal)
- [SendPulse](#sendpulse)
- [Make](#make)

## Stripe

### Настройка аккаунта Stripe

1. Зарегистрируйтесь на [Stripe](https://stripe.com/) и создайте аккаунт
2. Перейдите в раздел "Developers" → "API keys"
3. Скопируйте "Publishable key" и "Secret key"
4. Добавьте ключи в файл `.env.development`:
   ```
   STRIPE_API_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Настройка вебхуков

1. В панели Stripe перейдите в "Developers" → "Webhooks"
2. Нажмите "Add endpoint"
3. Укажите URL вашего API: `https://your-api.com/api/v1/webhooks/stripe`
4. Выберите события для отслеживания:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Скопируйте "Signing secret" и добавьте в `.env.development`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Создание продуктов и цен

1. В панели Stripe перейдите в "Products"
2. Создайте новый продукт "BPM Centr Subscription"
3. Добавьте цену:
   - Recurring: $10 / month
   - Billing period: Monthly
4. Скопируйте ID цены (price_...) и добавьте в `.env.development`:
   ```
   STRIPE_PRICE_ID=price_...
   ```

### Примеры API-запросов

#### Создание клиента

```javascript
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  name: 'John Doe',
  metadata: {
    userId: 'user-uuid-here'
  }
});

console.log(customer.id); // cus_...
```

#### Создание подписки

```javascript
const subscription = await stripe.subscriptions.create({
  customer: 'cus_...',
  items: [
    { price: 'price_...' },
  ],
  trial_period_days: 7,
  expand: ['latest_invoice.payment_intent'],
});

console.log(subscription.id); // sub_...
```

#### Отмена подписки

```javascript
const subscription = await stripe.subscriptions.update('sub_...', {
  cancel_at_period_end: true,
});
```

#### Возобновление подписки

```javascript
const subscription = await stripe.subscriptions.update('sub_...', {
  cancel_at_period_end: false,
});
```

### Обработка вебхуков

```javascript
// Пример обработчика вебхуков Stripe
app.post('/api/v1/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Важно: нужен raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Обработка различных событий
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Обновление статуса подписки на 'active'
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Обновление статуса подписки на 'payment_pending'
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Обновление статуса подписки на 'expired'
      break;
    // ... другие события
  }

  res.status(200).send({ received: true });
});
```

### Тестирование платежей

Для тестирования используйте следующие тестовые карты:

| Номер карты | Описание |
|-------------|----------|
| 4242 4242 4242 4242 | Успешный платеж |
| 4000 0000 0000 0341 | Неудачный платеж |
| 4000 0000 0000 3220 | Требуется 3D Secure |

Для всех тестовых карт используйте:
- Любую будущую дату истечения срока действия (MM/YY)
- Любой 3-значный CVC код
- Любой 5-значный почтовый индекс

## PayPal

### Настройка аккаунта PayPal

1. Зарегистрируйтесь на [PayPal Developer](https://developer.paypal.com/) и создайте аккаунт
2. Создайте приложение в разделе "My Apps & Credentials"
3. Скопируйте "Client ID" и "Secret" для Sandbox и Live окружений
4. Добавьте ключи в файл `.env.development`:
   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox # или 'live' для продакшена
   ```

### Настройка вебхуков

1. В панели PayPal Developer перейдите в "My Apps & Credentials" → выберите ваше приложение
2. В разделе "Webhooks" нажмите "Add Webhook"
3. Укажите URL вашего API: `https://your-api.com/api/v1/webhooks/paypal`
4. Выберите события для отслеживания:
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
5. Сохраните вебхук и скопируйте "Webhook ID"

### Создание плана подписки

```javascript
const paypal = require('@paypal/checkout-server-sdk');

// Создание окружения
let environment;
if (process.env.PAYPAL_MODE === 'live') {
  environment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const client = new paypal.core.PayPalHttpClient(environment);

// Создание плана подписки
async function createSubscriptionPlan() {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'SUBSCRIPTION',
    application_context: {
      brand_name: 'BPM Centr',
      locale: 'ru-RU',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: 'https://your-site.com/subscription/success',
      cancel_url: 'https://your-site.com/subscription/cancel'
    },
    plan_id: 'P-123456789' // ID вашего плана
  });

  const response = await client.execute(request);
  return response.result;
}
```

### Обработка вебхуков

```javascript
// Пример обработчика вебхуков PayPal
app.post('/api/v1/webhooks/paypal', async (req, res) => {
  // Проверка подписи вебхука
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const requestBody = req.body;
  const headers = req.headers;

  try {
    // Проверка подлинности вебхука
    const isVerified = await verifyPayPalWebhook(webhookId, requestBody, headers);
    
    if (!isVerified) {
      return res.status(400).send('Invalid webhook signature');
    }

    const event = requestBody;
    
    // Обработка различных событий
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        // Обработка создания подписки
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Обработка отмены подписки
        break;
      case 'PAYMENT.SALE.COMPLETED':
        // Обработка успешного платежа
        break;
      // ... другие события
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Функция для проверки подписи вебхука
async function verifyPayPalWebhook(webhookId, requestBody, headers) {
  // Реализация проверки подписи
  // ...
  return true; // или false, если подпись недействительна
}
```

## SendPulse

### Настройка аккаунта SendPulse

1. Зарегистрируйтесь на [SendPulse](https://sendpulse.com/) и создайте аккаунт
2. Перейдите в раздел "Настройки" → "API"
3. Создайте новый API-ключ
4. Скопируйте "ID" и "Secret"
5. Добавьте ключи в файл `.env.development`:
   ```
   SENDPULSE_API_USER_ID=...
   SENDPULSE_API_SECRET=...
   SENDPULSE_TOKEN_STORAGE=redis # или 'file'
   ```

### Создание шаблонов писем

1. В панели SendPulse перейдите в "Email" → "Шаблоны"
2. Создайте следующие шаблоны:
   - Подтверждение регистрации
   - Уведомление о скором окончании пробного периода
   - Подтверждение оплаты
   - Уведомление о неудачном платеже
   - Уведомление об отмене подписки

### Примеры использования API

#### Отправка письма подтверждения регистрации

```javascript
const sendpulse = require('sendpulse-api');

// Инициализация SendPulse
const sendpulseApi = new sendpulse(
  process.env.SENDPULSE_API_USER_ID,
  process.env.SENDPULSE_API_SECRET,
  process.env.SENDPULSE_TOKEN_STORAGE
);

// Функция для отправки письма
function sendEmail(email, name, verificationToken) {
  return new Promise((resolve, reject) => {
    const verificationUrl = `https://your-site.com/verify-email?token=${verificationToken}`;
    
    const emailData = {
      html: `
        <h1>Подтверждение регистрации</h1>
        <p>Здравствуйте, ${name}!</p>
        <p>Для подтверждения вашего email и активации аккаунта, пожалуйста, перейдите по ссылке:</p>
        <p><a href="${verificationUrl}">Подтвердить email</a></p>
        <p>Ссылка действительна в течение 48 часов.</p>
      `,
      text: `Здравствуйте, ${name}! Для подтверждения вашего email и активации аккаунта, пожалуйста, перейдите по ссылке: ${verificationUrl}`,
      subject: 'Подтверждение регистрации в BPM Centr',
      from: {
        name: 'BPM Centr',
        email: 'noreply@bpmcentr.com',
      },
      to: [
        {
          name,
          email,
        },
      ],
    };
    
    sendpulseApi.smtpSendMail((result) => {
      if (result && result.result) {
        resolve(result);
      } else {
        reject(new Error('Failed to send email'));
      }
    }, emailData);
  });
}

// Использование
sendEmail('user@example.com', 'John Doe', 'verification-token-123')
  .then(result => console.log('Email sent:', result))
  .catch(error => console.error('Error sending email:', error));
```

#### Отправка уведомления о скором окончании пробного периода

```javascript
function sendTrialEndingNotification(email, name, daysLeft) {
  return new Promise((resolve, reject) => {
    const subscriptionUrl = `https://your-site.com/dashboard/subscription`;
    
    const emailData = {
      html: `
        <h1>Окончание пробного периода</h1>
        <p>Здравствуйте, ${name}!</p>
        <p>Ваш пробный период заканчивается через ${daysLeft} дней.</p>
        <p>Для продолжения использования сервиса, пожалуйста, оформите подписку:</p>
        <p><a href="${subscriptionUrl}">Управление подпиской</a></p>
      `,
      text: `Здравствуйте, ${name}! Ваш пробный период заканчивается через ${daysLeft} дней. Для продолжения использования сервиса, пожалуйста, оформите подписку: ${subscriptionUrl}`,
      subject: 'Окончание пробного периода в BPM Centr',
      from: {
        name: 'BPM Centr',
        email: 'noreply@bpmcentr.com',
      },
      to: [
        {
          name,
          email,
        },
      ],
    };
    
    sendpulseApi.smtpSendMail((result) => {
      if (result && result.result) {
        resolve(result);
      } else {
        reject(new Error('Failed to send email'));
      }
    }, emailData);
  });
}
```

## Make

### Настройка аккаунта Make

1. Зарегистрируйтесь на [Make](https://www.make.com/) и создайте аккаунт
2. Перейдите в раздел "Developer" → "API keys"
3. Создайте новый API-ключ с необходимыми разрешениями
4. Скопируйте ключ и добавьте в файл `.env.development`:
   ```
   MAKE_API_URL=https://api.make.com/v2
   MAKE_API_KEY=...
   ```

### Создание коннектора в Make

1. Перейдите в раздел "Developer" → "Custom apps"
2. Создайте новое приложение "BPM Centr Connector"
3. Настройте аутентификацию через API-ключ
4. Определите модули и действия коннектора

### Примеры API-запросов

#### Проверка валидности API-ключа

```javascript
const axios = require('axios');

async function validateApiKey(apiKey) {
  try {
    const response = await axios.get('https://your-api.com/api/v1/validate-key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      isValid: response.data.isValid,
      userId: response.data.userId,
      subscriptionStatus: response.data.subscriptionStatus
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      isValid: false,
      error: error.response?.data?.message || 'Failed to validate API key'
    };
  }
}
```

#### Логирование использования API

```javascript
async function logApiUsage(apiKey, action, parameters) {
  try {
    const response = await axios.post('https://your-api.com/api/v1/log-usage', {
      action,
      parameters
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      logId: response.data.logId
    };
  } catch (error) {
    console.error('Error logging API usage:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to log API usage'
    };
  }
}
```

### Интеграция с Make Developer Hub

#### Регистрация коннектора в Make Developer Hub

1. Перейдите в [Make Developer Hub](https://www.make.com/en/developer)
2. Зарегистрируйте новый коннектор
3. Укажите базовый URL вашего API
4. Настройте аутентификацию через API-ключ
5. Определите модули и действия коннектора

#### Пример конфигурации коннектора

```json
{
  "name": "BPM Centr",
  "description": "Коннектор для интеграции с BPM Centr",
  "version": "1.0.0",
  "auth": {
    "type": "api_key",
    "name": "API Key",
    "location": "header",
    "headerName": "Authorization",
    "headerPrefix": "Bearer "
  },
  "modules": [
    {
      "name": "crm",
      "label": "CRM",
      "description": "Работа с CRM системами",
      "operations": [
        {
          "name": "getContacts",
          "label": "Get Contacts",
          "description": "Получение списка контактов из CRM",
          "input": {
            "fields": [
              {
                "name": "limit",
                "type": "number",
                "label": "Limit",
                "required": false,
                "default": 10
              },
              {
                "name": "offset",
                "type": "number",
                "label": "Offset",
                "required": false,
                "default": 0
              }
            ]
          },
          "output": {
            "fields": [
              {
                "name": "contacts",
                "type": "array",
                "label": "Contacts",
                "description": "List of contacts"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Тестирование интеграции

1. Создайте тестовый сценарий в Make
2. Добавьте модуль вашего коннектора
3. Настройте действие и параметры
4. Запустите сценарий и проверьте результаты
5. Проверьте логи использования API в вашей системе
