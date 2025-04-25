# Примеры использования API BPM Centr в коннекторах Make

В этом документе представлены конкретные примеры использования API BPM Centr в коннекторах Make для различных сценариев.

## Пример 1: Базовая проверка подписки

Этот пример демонстрирует базовую проверку подписки перед выполнением операции коннектора.

```javascript
// Функция для проверки подписки
async function checkSubscription(bpmCentrApiKey, connectorName) {
  // Формирование URL с параметрами запроса
  const url = new URL('https://api.bpmcentr.ru/v1/subscription/check');
  url.searchParams.append('connector', connectorName);

  // Выполнение запроса
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bpmCentrApiKey}`
    }
  });

  // Проверка статуса ответа
  if (response.status !== 200) {
    const data = await response.json();
    throw new Error(data.message || 'Subscription check failed');
  }

  // Парсинг ответа
  const data = await response.json();

  // Проверка активности подписки
  if (!data.active) {
    throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
  }

  // Проверка доступа к коннектору
  if (!data.hasAccess) {
    throw new Error('You do not have access to this connector. Please subscribe to this connector at BPM Centr.');
  }

  return data;
}

// Использование в операции коннектора
async function getContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки
    await checkSubscription(bpmCentrApiKey, 'crm-connector');

    // Выполнение основной логики операции
    // ...

    // Регистрация использования
    // ...

    return result;
  } catch (error) {
    throw new Error(`Error in getContact operation: ${error.message}`);
  }
}
```

## Пример 2: Регистрация использования операции

Этот пример демонстрирует регистрацию использования операции после её успешного выполнения.

```javascript
// Функция для регистрации использования
async function registerUsage(bpmCentrApiKey, connectorName, operationName) {
  // Выполнение запроса
  const response = await fetch('https://api.bpmcentr.ru/v1/connector/usage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bpmCentrApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      connector: connectorName,
      operation: operationName,
      timestamp: new Date().toISOString()
    })
  });

  // Проверка статуса ответа
  if (response.status !== 201) {
    const data = await response.json();
    throw new Error(data.message || 'Usage registration failed');
  }

  return true;
}

// Использование в операции коннектора
async function createContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки
    await checkSubscription(bpmCentrApiKey, 'crm-connector');

    // Выполнение основной логики операции
    // ...

    // Регистрация использования
    await registerUsage(bpmCentrApiKey, 'crm-connector', 'createContact');

    return result;
  } catch (error) {
    throw new Error(`Error in createContact operation: ${error.message}`);
  }
}
```

## Пример 3: Полная интеграция в операции коннектора

Этот пример демонстрирует полную интеграцию API BPM Centr в операцию коннектора Make.

```javascript
// Определение операции
const getContactOperation = {
  name: 'getContact',
  label: 'Get Contact',
  description: 'Retrieves a contact by ID',

  // Входные параметры
  input: {
    contactId: {
      type: 'text',
      label: 'Contact ID',
      required: true
    }
  },

  // Выходные параметры
  output: ['id', 'name', 'email', 'phone', 'createdAt'],

  // Выполнение операции
  async run({ input, auth }) {
    // Получение параметров
    const { contactId } = input;
    const { apiKey, bpmCentrApiKey } = auth;

    try {
      // Проверка подписки
      const subscriptionUrl = new URL('https://api.bpmcentr.ru/v1/subscription/check');
      subscriptionUrl.searchParams.append('connector', 'crm-connector');

      const subscriptionResponse = await this.fetch({
        url: subscriptionUrl.toString(),
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bpmCentrApiKey}`
        }
      });

      if (subscriptionResponse.status !== 200) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.message || 'Subscription check failed');
      }

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionData.active) {
        throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
      }

      if (!subscriptionData.hasAccess) {
        throw new Error('You do not have access to this connector. Please subscribe to this connector at BPM Centr.');
      }

      // Выполнение запроса к CRM API
      const crmResponse = await this.fetch({
        url: `https://api.crm-system.com/v1/contacts/${contactId}`,
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (crmResponse.status !== 200) {
        throw new Error(`Failed to get contact: ${crmResponse.statusText}`);
      }

      const contact = await crmResponse.json();

      // Регистрация использования
      const usageResponse = await this.fetch({
        url: 'https://api.bpmcentr.ru/v1/connector/usage',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bpmCentrApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connector: 'crm-connector',
          operation: 'getContact',
          timestamp: new Date().toISOString()
        })
      });

      if (usageResponse.status !== 201) {
        console.warn('Failed to register usage, but operation was successful');
      }

      // Возврат результата
      return {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        createdAt: contact.createdAt
      };
    } catch (error) {
      throw new Error(`Error getting contact: ${error.message}`);
    }
  }
};
```

## Пример 4: Интеграция в триггер коннектора

Этот пример демонстрирует интеграцию API BPM Centr в триггер коннектора Make.

```javascript
// Определение триггера
const newContactTrigger = {
  name: 'newContact',
  label: 'New Contact',
  description: 'Triggers when a new contact is created',

  // Входные параметры
  input: {
    maxResults: {
      type: 'number',
      label: 'Max Results',
      required: false,
      default: 10
    }
  },

  // Выходные параметры
  output: ['id', 'name', 'email', 'phone', 'createdAt'],

  // Выполнение триггера
  async run({ input, auth, store }) {
    // Получение параметров
    const { maxResults } = input;
    const { apiKey, bpmCentrApiKey } = auth;

    try {
      // Проверка подписки
      const subscriptionUrl = new URL('https://api.bpmcentr.ru/v1/subscription/check');
      subscriptionUrl.searchParams.append('connector', 'crm-connector');

      const subscriptionResponse = await this.fetch({
        url: subscriptionUrl.toString(),
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bpmCentrApiKey}`
        }
      });

      if (subscriptionResponse.status !== 200) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.message || 'Subscription check failed');
      }

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionData.active) {
        throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
      }

      // Получение времени последнего запроса
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();

      // Выполнение запроса к CRM API
      const crmResponse = await this.fetch({
        url: 'https://api.crm-system.com/v1/contacts',
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        },
        params: {
          createdAfter: lastPollTime,
          limit: maxResults
        }
      });

      if (crmResponse.status !== 200) {
        throw new Error(`Failed to get contacts: ${crmResponse.statusText}`);
      }

      const contacts = await crmResponse.json();

      // Сохранение времени последнего запроса
      if (contacts.length > 0) {
        const lastContact = contacts[contacts.length - 1];
        store.set('lastPollTime', lastContact.createdAt);
      }

      // Регистрация использования
      const usageResponse = await this.fetch({
        url: 'https://api.bpmcentr.ru/v1/connector/usage',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bpmCentrApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connector: 'crm-connector',
          operation: 'newContact',
          timestamp: new Date().toISOString()
        })
      });

      if (usageResponse.status !== 201) {
        console.warn('Failed to register usage, but operation was successful');
      }

      // Возврат результатов
      return contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        createdAt: contact.createdAt
      }));
    } catch (error) {
      throw new Error(`Error getting new contacts: ${error.message}`);
    }
  }
};
```

## Пример 5: Обработка различных ошибок

Этот пример демонстрирует обработку различных ошибок при интеграции с API BPM Centr.

```javascript
// Функция для проверки подписки с обработкой ошибок
async function checkSubscriptionWithErrorHandling(bpmCentrApiKey, connectorName) {
  try {
    // Формирование URL с параметрами запроса
    const url = new URL('https://api.bpmcentr.ru/v1/subscription/check');
    url.searchParams.append('connector', connectorName);

    // Выполнение запроса
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      }
    });

    // Обработка различных статусов ответа
    switch (response.status) {
      case 200:
        // Успешный ответ
        const data = await response.json();

        if (!data.active) {
          throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
        }

        if (!data.hasAccess) {
          throw new Error('You do not have access to this connector. Please subscribe to this connector at BPM Centr.');
        }

        return data;

      case 401:
        // Ошибка аутентификации
        throw new Error('Invalid BPM Centr API key. Please check the key in connector settings.');

      case 403:
        // Ошибка доступа
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access denied. Please check your subscription status.');

      case 429:
        // Превышение лимита запросов
        throw new Error('Too many requests. Please try again later.');

      case 500:
      case 502:
      case 503:
      case 504:
        // Ошибки сервера
        throw new Error('BPM Centr server error. Please try again later or contact support.');

      default:
        // Другие ошибки
        throw new Error(`Unexpected error (${response.status}). Please contact support.`);
    }
  } catch (error) {
    // Обработка ошибок сети
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    // Пробрасывание других ошибок
    throw error;
  }
}

// Использование в операции коннектора
async function getContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки с обработкой ошибок
    await checkSubscriptionWithErrorHandling(bpmCentrApiKey, 'crm-connector');

    // Выполнение основной логики операции
    // ...

    // Регистрация использования
    // ...

    return result;
  } catch (error) {
    // Форматирование сообщения об ошибке для пользователя
    let userFriendlyMessage = `Error in getContact operation: ${error.message}`;

    // Добавление рекомендаций по устранению ошибки
    if (error.message.includes('Invalid BPM Centr API key')) {
      userFriendlyMessage += ' Please check your API key in the connector settings.';
    } else if (error.message.includes('subscription is inactive')) {
      userFriendlyMessage += ' You can renew your subscription in your BPM Centr account.';
    } else if (error.message.includes('Operations limit exceeded')) {
      userFriendlyMessage += ' You can purchase additional connectors in your BPM Centr account.';
    }

    throw new Error(userFriendlyMessage);
  }
}
```

## Пример 6: Оптимизация проверки подписки

Этот пример демонстрирует оптимизацию проверки подписки для уменьшения количества запросов к API BPM Centr.

```javascript
// Кэш для хранения результатов проверки подписки
const subscriptionCache = new Map();

// Функция для проверки подписки с кэшированием
async function checkSubscriptionWithCaching(bpmCentrApiKey, connectorName) {
  // Генерация ключа кэша
  const cacheKey = `${bpmCentrApiKey}:${connectorName}`;

  // Проверка наличия данных в кэше
  const cachedData = subscriptionCache.get(cacheKey);

  if (cachedData) {
    // Проверка времени жизни кэша (5 минут)
    const cacheAge = Date.now() - cachedData.timestamp;

    if (cacheAge < 5 * 60 * 1000) {
      // Использование данных из кэша
      const { data } = cachedData;

      // Проверка активности подписки
      if (!data.active) {
        throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
      }

      // Проверка лимита операций
      if (data.operationsUsed >= data.operationsLimit) {
        throw new Error('Operations limit exceeded. Please purchase additional connectors at BPM Centr.');
      }

      return data;
    }
  }

  // Формирование URL с параметрами запроса
  const url = new URL('https://api.bpmcentr.ru/v1/subscription/check');
  url.searchParams.append('connector', connectorName);

  // Выполнение запроса
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bpmCentrApiKey}`
    }
  });

  // Проверка статуса ответа
  if (response.status !== 200) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Subscription check failed');
  }

  // Парсинг ответа
  const data = await response.json();

  // Сохранение данных в кэше
  subscriptionCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  // Проверка активности подписки
  if (!data.active) {
    throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
  }

  // Проверка лимита операций
  if (data.operationsUsed >= data.operationsLimit) {
    throw new Error('Operations limit exceeded. Please purchase additional connectors at BPM Centr.');
  }

  return data;
}

// Использование в операции коннектора
async function getContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки с кэшированием
    await checkSubscriptionWithCaching(bpmCentrApiKey, 'crm-connector');

    // Выполнение основной логики операции
    // ...

    // Регистрация использования
    // ...

    return result;
  } catch (error) {
    throw new Error(`Error in getContact operation: ${error.message}`);
  }
}
```

## Пример 7: Автоматическое определение и проверка аккаунта Make

Этот пример демонстрирует автоматическое определение идентификатора аккаунта Make и проверку привязки коннектора к аккаунту.

```javascript
// Функция для получения идентификатора аккаунта Make
function getMakeAccountId(context) {
  // Получение идентификатора аккаунта из контекста Make
  const makeAccountId = context.makeAccountId;

  // Проверка наличия идентификатора
  if (!makeAccountId) {
    throw new Error('Не удалось определить идентификатор аккаунта Make. Убедитесь, что коннектор используется в сценарии Make.');
  }

  return makeAccountId;
}

// Функция для проверки подписки с учетом аккаунта Make
async function checkSubscriptionWithAccount(bpmCentrApiKey, connectorName, context) {
  try {
    // Получение идентификатора аккаунта Make
    const makeAccountId = getMakeAccountId(context);

    // Формирование URL с параметрами запроса
    const url = new URL('https://api.bpmcentr.ru/v1/subscription/check');
    url.searchParams.append('connector', connectorName);
    url.searchParams.append('accountId', makeAccountId);

    // Выполнение запроса
    const response = await context.fetch({
      url: url.toString(),
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      }
    });

    // Обработка ответа
    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка проверки подписки');
    }

    const subscriptionData = await response.json();

    // Проверка активности подписки
    if (!subscriptionData.active) {
      throw new Error('Ваша подписка неактивна или истекла. Пожалуйста, обновите подписку в личном кабинете BPM Centr.');
    }

    // Проверка доступа к коннектору
    if (!subscriptionData.hasAccess) {
      throw new Error('У вас нет доступа к этому коннектору. Пожалуйста, оформите подписку в личном кабинете BPM Centr.');
    }

    // Проверка привязки к аккаунту Make
    if (subscriptionData.accountId && subscriptionData.accountId !== makeAccountId) {
      throw new Error(`Этот коннектор привязан к другому аккаунту Make (${subscriptionData.accountId}). Пожалуйста, смените привязку в личном кабинете BPM Centr или приобретите отдельную подписку для текущего аккаунта.`);
    }

    return {
      ...subscriptionData,
      makeAccountId
    };
  } catch (error) {
    // Обработка ошибок сети
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу BPM Centr. Пожалуйста, проверьте подключение к интернету и повторите попытку.');
    }

    throw error;
  }
}

// Использование в операции коннектора
async function getContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки с учетом аккаунта Make
    const subscription = await checkSubscriptionWithAccount(bpmCentrApiKey, 'crm-connector', context);

    // Вывод информации о подписке и аккаунте (для отладки)
    console.log(`Коннектор используется в аккаунте Make: ${subscription.makeAccountId}`);
    console.log(`Подписка активна до: ${subscription.expiresAt}`);

    // Выполнение основной логики операции
    // ...

    // Регистрация использования
    await registerUsage(bpmCentrApiKey, 'crm-connector', 'getContact', context);

    return result;
  } catch (error) {
    // Форматирование сообщения об ошибке для пользователя
    let userFriendlyMessage;

    if (error.message.includes('привязан к другому аккаунту')) {
      userFriendlyMessage = 'Коннектор привязан к другому аккаунту Make. Смените привязку в личном кабинете BPM Centr или приобретите отдельную подписку.';
    } else if (error.message.includes('подписка неактивна')) {
      userFriendlyMessage = 'Ваша подписка неактивна. Обновите подписку в личном кабинете BPM Centr.';
    } else if (error.message.includes('Не удалось определить идентификатор')) {
      userFriendlyMessage = 'Не удалось определить аккаунт Make. Убедитесь, что коннектор используется в сценарии Make.';
    } else {
      userFriendlyMessage = `Ошибка: ${error.message}`;
    }

    throw new Error(userFriendlyMessage);
  }
}
```

## Пример 8: Пакетная регистрация использования

Этот пример демонстрирует пакетную регистрацию использования операций для уменьшения количества запросов к API BPM Centr.

```javascript
// Очередь операций для пакетной регистрации
const usageQueue = [];

// Флаг, указывающий, запущен ли процесс отправки
let isSending = false;

// Функция для добавления операции в очередь
function queueUsage(bpmCentrApiKey, connectorName, operationName) {
  // Добавление операции в очередь
  usageQueue.push({
    bpmCentrApiKey,
    connectorName,
    operationName,
    timestamp: new Date().toISOString()
  });

  // Запуск процесса отправки, если он еще не запущен
  if (!isSending) {
    sendQueuedUsage();
  }
}

// Функция для отправки операций из очереди
async function sendQueuedUsage() {
  // Установка флага отправки
  isSending = true;

  try {
    // Обработка операций, пока очередь не пуста
    while (usageQueue.length > 0) {
      // Извлечение операции из очереди
      const { bpmCentrApiKey, connectorName, operationName, timestamp } = usageQueue.shift();

      try {
        // Выполнение запроса
        const response = await fetch('https://api.bpmcentr.ru/v1/connector/usage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bpmCentrApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            connector: connectorName,
            operation: operationName,
            timestamp
          })
        });

        // Проверка статуса ответа
        if (response.status !== 201) {
          console.warn(`Failed to register usage for ${operationName}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Error registering usage for ${operationName}: ${error.message}`);
      }

      // Пауза между запросами для предотвращения превышения лимита
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } finally {
    // Сброс флага отправки
    isSending = false;
  }
}

// Использование в операции коннектора
async function getContactOperation(params, context) {
  try {
    // Получение API-ключа BPM Centr из параметров аутентификации
    const bpmCentrApiKey = context.auth.bpmCentrApiKey;

    // Проверка подписки
    await checkSubscription(bpmCentrApiKey, 'crm-connector');

    // Выполнение основной логики операции
    // ...

    // Регистрация использования через очередь
    queueUsage(bpmCentrApiKey, 'crm-connector', 'getContact');

    return result;
  } catch (error) {
    throw new Error(`Error in getContact operation: ${error.message}`);
  }
}
```

## Заключение

Приведенные примеры демонстрируют различные аспекты интеграции API BPM Centr в коннекторы Make. При разработке коннекторов рекомендуется:

1. Всегда проверять статус подписки перед выполнением операции
2. Регистрировать использование операций после их успешного выполнения
3. Корректно обрабатывать возможные ошибки
4. Оптимизировать количество запросов к API BPM Centr
5. Предоставлять понятные сообщения об ошибках для пользователей

Для получения дополнительной информации обратитесь к документации по [интеграции с Make API](./make_integration.md) и [спецификации API](../api/specification.md).
