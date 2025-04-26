# Примеры платежных коннекторов

В этом документе представлены примеры реализации коннекторов для платежных систем в рамках проекта "BPM Centr".

## Обзор платежных коннекторов

Платежные коннекторы обеспечивают интеграцию между платформой Make и различными платежными системами, такими как Wayforpay и другие. Эти коннекторы позволяют автоматизировать работу с платежами, выписками, возвратами и другими финансовыми операциями.

## Пример коннектора для Stripe

### Структура коннектора

```json
// app.json
{
  "name": "stripe",
  "label": "Stripe Payments",
  "version": "1.0.0",
  "description": "Коннектор для Stripe Payments API",
  "language": "ru",
  "categories": ["payments", "finance"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/stripe"
}
```

### Конфигурация аутентификации

```json
// connections/api_key.json
{
  "name": "api_key",
  "type": "api_key",
  "label": "API Key",
  "fields": [
    {
      "name": "apiKey",
      "type": "password",
      "label": "API Key",
      "required": true,
      "sensitive": true,
      "help": "Ваш Stripe Secret API Key"
    },
    {
      "name": "bpmCentrApiKey",
      "type": "text",
      "label": "BPM Centr API Key",
      "required": true,
      "sensitive": true,
      "help": "API ключ из вашего аккаунта BPM Centr для проверки подписки"
    }
  ],
  "test": {
    "request": {
      "url": "https://api.stripe.com/v1/customers",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{connection.apiKey}}",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "params": {
        "limit": "1"
      }
    },
    "response": {
      "status": 200
    }
  }
}
```

### Модуль для работы с платежами

```javascript
// modules/payments.js
const { checkSubscription } = require('../utils/subscription');
const paymentsApi = require('../api/payments-api');
const { generateToken } = require('../utils/token');

module.exports = {
  name: 'payments',
  label: 'Payments',
  description: 'Work with payments in WayForPay',

  operations: [
    {
      name: 'createPayment',
      label: 'Create Payment',
      description: 'Create a new payment',
      parameters: [
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          required: true,
          help: 'Payment amount in cents (e.g. 1000 for 10 USD)'
        },
        {
          name: 'orderId',
          type: 'string',
          label: 'Order ID',
          required: true,
          help: 'Unique order identifier in your system'
        },
        {
          name: 'description',
          type: 'string',
          label: 'Description',
          required: false,
          help: 'Payment description'
        },
        {
          name: 'email',
          type: 'string',
          label: 'Email',
          required: false,
          help: 'Customer email'
        },
        {
          name: 'phone',
          type: 'string',
          label: 'Phone',
          required: false,
          help: 'Customer phone'
        },
        {
          name: 'successUrl',
          type: 'string',
          label: 'Success URL',
          required: false,
          help: 'URL to redirect after successful payment'
        },
        {
          name: 'failUrl',
          type: 'string',
          label: 'Fail URL',
          required: false,
          help: 'URL to redirect after failed payment'
        }
      ],
      outputFields: [
        {
          name: 'Success',
          type: 'boolean',
          label: 'Success'
        },
        {
          name: 'ErrorCode',
          type: 'string',
          label: 'Error Code'
        },
        {
          name: 'TerminalKey',
          type: 'string',
          label: 'Terminal Key'
        },
        {
          name: 'Status',
          type: 'string',
          label: 'Status'
        },
        {
          name: 'PaymentId',
          type: 'string',
          label: 'Payment ID'
        },
        {
          name: 'OrderId',
          type: 'string',
          label: 'Order ID'
        },
        {
          name: 'Amount',
          type: 'number',
          label: 'Amount'
        },
        {
          name: 'PaymentURL',
          type: 'string',
          label: 'Payment URL'
        }
      ],
      execute: async function(params, { auth }) {
        try {
          // Проверка подписки через middleware
          // Middleware проверки подписки должен быть настроен на уровне коннектора

          // Выполнение операции
          const { amount, orderId, description, email, phone, successUrl, failUrl } = params;
          const { terminalKey, password } = auth;

          const paymentData = {
            Amount: amount,
            OrderId: orderId,
            Description: description,
            DATA: {
              Email: email,
              Phone: phone
            },
            SuccessURL: successUrl,
            FailURL: failUrl
          };

          return await paymentsApi.createPayment(terminalKey, password, paymentData, this);
        } catch (error) {
          if (error.response) {
            throw new Error(`API Error: ${error.response.statusCode} - ${error.response.body?.message || 'Unknown error'}`);
          }
          throw new Error(`Error creating payment: ${error.message}`);
        }
      }
    },
    {
      name: 'getPaymentState',
      label: 'Get Payment State',
      description: 'Get payment state by ID',
      input: {
        fields: [
          {
            name: 'paymentId',
            type: 'string',
            label: 'Payment ID',
            required: true,
            help: 'WayForPay Payment ID'
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'Success',
            type: 'boolean',
            label: 'Success'
          },
          {
            name: 'ErrorCode',
            type: 'string',
            label: 'Error Code'
          },
          {
            name: 'TerminalKey',
            type: 'string',
            label: 'Terminal Key'
          },
          {
            name: 'Status',
            type: 'string',
            label: 'Status'
          },
          {
            name: 'PaymentId',
            type: 'string',
            label: 'Payment ID'
          },
          {
            name: 'OrderId',
            type: 'string',
            label: 'Order ID'
          },
          {
            name: 'Amount',
            type: 'number',
            label: 'Amount'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'wayforpay', context);

          // Выполнение операции
          const { paymentId } = params;
          const { terminalKey, password } = context.auth;

          const paymentState = await paymentsApi.getPaymentState(terminalKey, password, paymentId, context);

          return paymentState;
        } catch (error) {
          throw new Error(`Error getting payment state: ${error.message}`);
        }
      }
    },
    {
      name: 'cancelPayment',
      label: 'Cancel Payment',
      description: 'Cancel payment by ID',
      input: {
        fields: [
          {
            name: 'paymentId',
            type: 'string',
            label: 'Payment ID',
            required: true,
            help: 'WayForPay Payment ID'
          },
          {
            name: 'amount',
            type: 'number',
            label: 'Amount',
            required: false,
            help: 'Amount to cancel in kopecks. If not specified, the entire payment will be canceled.'
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'Success',
            type: 'boolean',
            label: 'Success'
          },
          {
            name: 'ErrorCode',
            type: 'string',
            label: 'Error Code'
          },
          {
            name: 'TerminalKey',
            type: 'string',
            label: 'Terminal Key'
          },
          {
            name: 'Status',
            type: 'string',
            label: 'Status'
          },
          {
            name: 'PaymentId',
            type: 'string',
            label: 'Payment ID'
          },
          {
            name: 'OrderId',
            type: 'string',
            label: 'Order ID'
          },
          {
            name: 'OriginalAmount',
            type: 'number',
            label: 'Original Amount'
          },
          {
            name: 'NewAmount',
            type: 'number',
            label: 'New Amount'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'wayforpay', context);

          // Выполнение операции
          const { paymentId, amount } = params;
          const { terminalKey, password } = context.auth;

          const cancelResult = await paymentsApi.cancelPayment(terminalKey, password, paymentId, amount, context);

          return cancelResult;
        } catch (error) {
          throw new Error(`Error canceling payment: ${error.message}`);
        }
      }
    }
  ],

  triggers: [
    {
      name: 'newPayments',
      label: 'New Payments',
      description: 'Triggers when new payments are received',
      type: 'polling',
      parameters: [
        {
          name: 'maxResults',
          type: 'uinteger',
          label: 'Max Results',
          required: false,
          default: 10
        },
        {
          name: 'status',
          type: 'select',
          label: 'Status',
          required: false,
          options: [
            { label: 'New', value: 'NEW' },
            { label: 'Authorized', value: 'AUTHORIZED' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Refunded', value: 'REFUNDED' },
            { label: 'Partial Refunded', value: 'PARTIAL_REFUNDED' }
          ],
          default: 'CONFIRMED'
        }
      ],
      outputFields: [
        {
          name: 'PaymentId',
          type: 'string',
          label: 'Payment ID'
        },
        {
          name: 'OrderId',
          type: 'string',
          label: 'Order ID'
        },
        {
          name: 'Status',
          type: 'string',
          label: 'Status'
        },
        {
          name: 'Amount',
          type: 'number',
          label: 'Amount'
        },
        {
          name: 'CreatedDate',
          type: 'date',
          label: 'Created Date'
        }
      ],
      run: async function({ params, state }) {
        try {
          // Проверка подписки через middleware
          // Middleware проверки подписки должен быть настроен на уровне коннектора

          // Выполнение операции
          const { maxResults, status } = params;
          const { terminalKey, password } = this.auth;
          const lastPollTime = state?.lastPollTime;

          const payments = await paymentsApi.getNewPayments(terminalKey, password, status, lastPollTime, maxResults, this);

          // Возвращаем новое состояние и данные
          return {
            state: {
              lastPollTime: new Date().toISOString()
            },
            data: payments
          };
        } catch (error) {
          if (error.response) {
            throw new Error(`API Error: ${error.response.statusCode} - ${error.response.body?.message || 'Unknown error'}`);
          }
          throw new Error(`Error polling for new payments: ${error.message}`);
        }
      }
    }
  ]
};
```

### API-адаптер для работы с платежами

```javascript
// api/payments-api.js
const { generateToken } = require('../utils/token');

async function createPayment(terminalKey, password, paymentData, context) {
  try {
    const requestData = {
      TerminalKey: terminalKey,
      Amount: paymentData.Amount,
      OrderId: paymentData.OrderId,
      Description: paymentData.Description,
      DATA: paymentData.DATA,
      SuccessURL: paymentData.SuccessURL,
      FailURL: paymentData.FailURL
    };

    // Генерация токена
    requestData.Token = generateToken(requestData, password);

    const response = await context.http.post({
      url: 'https://api.wayforpay.com/api/payment/create',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestData
    });

    if (response.statusCode >= 400) {
      const errorMessage = response.body?.Message || response.body?.Details || 'Unknown error';
      const errorCode = response.statusCode;
      throw {
        response: {
          statusCode: errorCode,
          body: response.body
        },
        message: `API returned error ${errorCode}: ${errorMessage}`
      };
    }

    if (!response.body.Success) {
      throw {
        response: {
          statusCode: 200,
          body: response.body
        },
        message: `Payment API error: ${response.body.Message || response.body.Details || 'Unknown error'}`
      };
    }

    return response.body;
  } catch (error) {
    // Если ошибка уже структурирована, пробрасываем её
    if (error.response) {
      throw error;
    }
    // Иначе оборачиваем в стандартный формат ошибки
    throw {
      message: `Error in createPayment: ${error.message}`,
      originalError: error
    };
  }
}

async function getPaymentState(terminalKey, password, paymentId, context) {
  try {
    const requestData = {
      TerminalKey: terminalKey,
      PaymentId: paymentId
    };

    // Генерация токена
    requestData.Token = generateToken(requestData, password);

    const response = await context.http.post({
      url: 'https://api.wayforpay.com/api/payment/state',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestData
    });

    if (response.statusCode !== 200 || !response.body.Success) {
      throw new Error(response.body.Message || response.body.Details || 'Failed to get payment state');
    }

    return response.body;
  } catch (error) {
    throw new Error(`Error in getPaymentState: ${error.message}`);
  }
}

async function cancelPayment(terminalKey, password, paymentId, amount, context) {
  try {
    const requestData = {
      TerminalKey: terminalKey,
      PaymentId: paymentId
    };

    if (amount) {
      requestData.Amount = amount;
    }

    // Генерация токена
    requestData.Token = generateToken(requestData, password);

    const response = await context.http.post({
      url: 'https://api.wayforpay.com/api/payment/refund',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestData
    });

    if (response.statusCode !== 200 || !response.body.Success) {
      throw new Error(response.body.Message || response.body.Details || 'Failed to cancel payment');
    }

    return response.body;
  } catch (error) {
    throw new Error(`Error in cancelPayment: ${error.message}`);
  }
}

async function getNewPayments(terminalKey, password, status, lastPollTime, maxResults, context) {
  try {
    // К сожалению, WayForPay API не предоставляет удобный метод для получения списка платежей
    // Поэтому здесь представлена имитация такого метода

    // В реальном коннекторе здесь может быть реализация с использованием
    // партнерского API или другого метода получения списка платежей

    // Для демонстрации возвращаем пустой массив
    return [];
  } catch (error) {
    throw new Error(`Error in getNewPayments: ${error.message}`);
  }
}

module.exports = {
  createPayment,
  getPaymentState,
  cancelPayment,
  getNewPayments
};
```

### Функция проверки подписки

```javascript
// functions/subscription.js
/**
 * Проверяет статус подписки через API BPM Centr
 * @param {string} apiKey - API ключ BPM Centr
 * @param {string} connectorName - Имя коннектора
 * @returns {boolean} - Статус подписки
 */
function checkSubscription(apiKey, connectorName) {
  if (!apiKey) {
    throw new Error('API ключ BPM Centr не указан');
  }

  const response = $http.get({
    url: 'https://api.bpmcentr.com/subscription/check',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    params: {
      connector: connectorName
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`Ошибка проверки подписки: ${response.body.error || 'Неизвестная ошибка'}`);
  }

  if (!response.body.active) {
    throw new Error('Ваша подписка неактивна или истекла. Пожалуйста, обновите подписку в BPM Centr.');
  }

  return true;
}
```

## Пример коннектора для PayPal

### Структура коннектора

```json
// app.json
{
  "name": "paypal",
  "label": "PayPal",
  "version": "1.0.0",
  "description": "Коннектор для PayPal API",
  "language": "ru",
  "categories": ["payments", "finance"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/paypal"
}
```

### Конфигурация аутентификации

```javascript
// auth.js
module.exports = {
  type: 'basic_auth',
  fields: {
    publicId: {
      type: 'string',
      label: 'Public ID',
      required: true,
      help: 'Your Fondy Merchant ID'
    },
    apiSecret: {
      type: 'password',
      label: 'API Secret',
      required: true,
      sensitive: true,
      help: 'Your Fondy API Secret'
    },
    bpmCentrApiKey: {
      type: 'string',
      label: 'BPM Centr API Key',
      required: true,
      sensitive: true,
      help: 'API key from your BPM Centr account to verify subscription'
    }
  },
  test: {
    request: {
      url: 'https://api.fondy.eu/api/status',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: '{{publicId}}',
        password: '{{apiSecret}}'
      }
    },
    response: {
      status: 200
    }
  }
};
```

## Рекомендации по разработке платежных коннекторов

### Общие рекомендации

1. **Безопасность** - уделяйте особое внимание безопасности при работе с платежными данными
2. **Обработка ошибок** - корректно обрабатывайте ошибки API платежных систем
3. **Идемпотентность** - обеспечивайте идемпотентность операций для предотвращения дублирования платежей
4. **Документирование особенностей** - документируйте особенности работы с конкретной платежной системой

### Типичные операции платежных коннекторов

1. **Платежи**:
   - Создание платежа
   - Получение статуса платежа
   - Подтверждение платежа
   - Отмена платежа
   - Возврат платежа

2. **Клиенты**:
   - Создание клиента
   - Получение информации о клиенте
   - Обновление данных клиента
   - Привязка карты к клиенту

3. **Подписки**:
   - Создание подписки
   - Получение информации о подписке
   - Отмена подписки
   - Изменение параметров подписки

4. **Выписки и отчеты**:
   - Получение выписки по операциям
   - Получение отчета о платежах
   - Получение статистики

### Типичные триггеры платежных коннекторов

1. **Новый платеж** - срабатывает при получении нового платежа
2. **Изменение статуса платежа** - срабатывает при изменении статуса платежа
3. **Новый возврат** - срабатывает при получении нового возврата
4. **Новая подписка** - срабатывает при создании новой подписки
5. **Отмена подписки** - срабатывает при отмене подписки

### Особенности безопасности

1. **Защита платежных данных**:
   - Не храните полные данные карт
   - Используйте токенизацию
   - Следуйте требованиям PCI DSS

2. **Аутентификация и авторизация**:
   - Используйте надежные методы аутентификации
   - Проверяйте подписи запросов
   - Используйте HTTPS для всех коммуникаций

3. **Обработка чувствительных данных**:
   - Маскируйте номера карт в логах
   - Не передавайте чувствительные данные в открытом виде
   - Используйте параметр `sensitive: true` для конфиденциальных полей

## Связанные разделы

- [Обзор коннекторов](../overview.md)
- [Структура коннекторов](../structure.md)
- [Разработка коннекторов](../development.md)
- [Тестирование коннекторов](../testing.md)
- [Примеры CRM-коннекторов](crm.md)
- [Примеры маркетплейс-коннекторов](marketplace.md)
