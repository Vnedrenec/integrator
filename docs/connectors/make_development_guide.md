# Руководство по разработке коннекторов для Make

В этом документе представлены рекомендации и лучшие практики по разработке коннекторов для платформы Make в рамках проекта "BPM Centr".

## Введение

Коннекторы для Make разрабатываются на платформе Make Developer Hub и должны соответствовать требованиям и стандартам как Make, так и BPM Centr. Это руководство поможет вам создавать качественные коннекторы, которые будут успешно интегрироваться с API BPM Centr и предоставлять пользователям удобный доступ к различным системам.

## Подготовка к разработке

### Необходимые аккаунты и доступы

1. **Аккаунт Make** - Зарегистрируйтесь на [Make](https://www.make.com/)
2. **Доступ к Make Developer Hub** - Запросите доступ к [Make Developer Hub](https://www.make.com/en/developer-platform)
3. **Аккаунт BPM Centr** - Зарегистрируйтесь на [BPM Centr](https://bpmcentr.ru/)
4. **API-ключ BPM Centr** - Создайте API-ключ в личном кабинете BPM Centr
5. **Доступ к целевой системе** - Получите доступ к API системы, для которой разрабатывается коннектор

### Изучение документации

Перед началом разработки рекомендуется изучить следующую документацию:

1. [Документация Make Developer Hub](https://www.make.com/en/developer-docs)
2. [Спецификация API BPM Centr](../api/specification.md)
3. [Интеграция с Make API](../integrations/make_integration.md)
4. [Примеры использования API BPM Centr](../integrations/make_api_examples.md)
5. Документация API целевой системы

## Структура коннектора

Коннектор для Make должен иметь следующую структуру:

1. **Метаданные коннектора** - Основная информация о коннекторе (название, описание, иконка)
2. **Конфигурация аутентификации** - Настройки для аутентификации в целевой системе и BPM Centr
3. **Модули** - Логические группы функциональности
4. **Операции** - Действия, которые может выполнять коннектор
5. **Триггеры** - События, на которые может реагировать коннектор

## Требования к коннекторам

### Общие требования

1. **Соответствие стандартам Make** - Коннектор должен соответствовать всем требованиям и рекомендациям Make Developer Hub
2. **Интеграция с API BPM Centr** - Коннектор должен проверять статус подписки и регистрировать использование через API BPM Centr
3. **Автоматическое определение аккаунта Make** - Коннектор должен корректно определять идентификатор аккаунта Make и проверять привязку
4. **Безопасность** - Коннектор должен обеспечивать безопасную обработку данных и не хранить чувствительную информацию
5. **Производительность** - Коннектор должен быть оптимизирован для минимизации количества запросов и использования ресурсов
6. **Локализация** - Коннектор должен поддерживать русский и английский языки

### Требования к аутентификации

1. **Поддержка API-ключа BPM Centr** - Коннектор должен включать поле для API-ключа BPM Centr в настройках аутентификации
2. **Безопасное хранение учетных данных** - Все чувствительные данные должны быть помечены как `sensitive`
3. **Тестирование аутентификации** - Коннектор должен проверять валидность учетных данных при настройке

### Работа с аккаунтами Make

#### Получение идентификатора аккаунта Make

Для корректной работы системы подписок необходимо получить идентификатор аккаунта Make, в котором используется коннектор. Make предоставляет эту информацию через контекст выполнения операций и триггеров.

```javascript
// Получение идентификатора аккаунта Make из контекста
function getMakeAccountId(context) {
  // Идентификатор аккаунта доступен в контексте операций Make
  const makeAccountId = context.makeAccountId;

  // Проверка наличия идентификатора
  if (!makeAccountId) {
    throw new Error('Не удалось определить идентификатор аккаунта Make. Убедитесь, что коннектор используется в сценарии Make.');
  }

  return makeAccountId;
}
```

**Важно:** Идентификатор аккаунта Make доступен только в контексте выполнения операций и триггеров. Он не доступен на этапе настройки коннектора или в тестовом режиме Make Developer Hub.

#### Проверка привязки коннектора к аккаунту

После получения идентификатора аккаунта Make необходимо проверить, привязан ли коннектор к этому аккаунту. Это важно для соблюдения модели "один коннектор = один аккаунт Make".

```javascript
// Функция для проверки привязки коннектора к аккаунту Make
async function checkAccountBinding(bpmCentrApiKey, connectorName, makeAccountId, context) {
  try {
    // Запрос к API BPM Centr для проверки подписки
    const subscriptionUrl = new URL('https://api.bpmcentr.ru/v1/subscription/check');
    subscriptionUrl.searchParams.append('connector', connectorName);
    subscriptionUrl.searchParams.append('accountId', makeAccountId);

    const subscriptionResponse = await context.fetch({
      url: subscriptionUrl.toString(),
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      }
    });

    // Обработка ответа
    if (subscriptionResponse.status !== 200) {
      const errorData = await subscriptionResponse.json();
      throw new Error(errorData.message || 'Ошибка проверки подписки');
    }

    const subscriptionData = await subscriptionResponse.json();

    // Проверка привязки к аккаунту Make
    if (subscriptionData.accountId && subscriptionData.accountId !== makeAccountId) {
      throw new Error(`Этот коннектор привязан к другому аккаунту Make (${subscriptionData.accountId}). Пожалуйста, смените привязку в личном кабинете BPM Centr или приобретите отдельную подписку для текущего аккаунта.`);
    }

    // Проверка, была ли создана новая привязка
    if (subscriptionData.isNewBinding) {
      console.log(`Коннектор успешно привязан к аккаунту Make: ${makeAccountId}`);
    }

    return subscriptionData;
  } catch (error) {
    throw new Error(`Ошибка проверки привязки к аккаунту: ${error.message}`);
  }
}
```

При первом использовании коннектора в новом аккаунте Make, API BPM Centr автоматически привязывает коннектор к этому аккаунту, если:

1. У пользователя есть активная подписка на данный коннектор
2. Коннектор еще не привязан к другому аккаунту Make
3. Пользователь имеет право на использование коннектора

После привязки коннектор будет работать только в этом аккаунте Make. Для использования в другом аккаунте необходимо либо сменить привязку через личный кабинет BPM Centr, либо приобрести отдельную подписку.

#### Обработка ошибок привязки к аккаунту

При проверке привязки коннектора к аккаунту Make могут возникать различные ошибки, которые необходимо корректно обрабатывать и предоставлять пользователю понятные сообщения с рекомендациями по их устранению.

```javascript
// Функция для обработки ошибок привязки к аккаунту
function handleAccountBindingErrors(error) {
  let userFriendlyMessage;

  // Определение типа ошибки и формирование понятного сообщения
  if (error.message.includes('привязан к другому аккаунту')) {
    userFriendlyMessage = 'Этот коннектор привязан к другому аккаунту Make. Вы можете:\n' +
      '1. Сменить привязку в личном кабинете BPM Centr (раздел "Подписки")\n' +
      '2. Приобрести отдельную подписку для текущего аккаунта';
  } else if (error.message.includes('Не удалось определить идентификатор')) {
    userFriendlyMessage = 'Не удалось определить идентификатор аккаунта Make. Убедитесь, что:\n' +
      '1. Коннектор используется в сценарии Make, а не в тестовом режиме\n' +
      '2. Вы запускаете сценарий, а не просто настраиваете коннектор';
  } else if (error.message.includes('подписка неактивна')) {
    userFriendlyMessage = 'Ваша подписка неактивна или истекла. Пожалуйста, обновите подписку в личном кабинете BPM Centr.';
  } else if (error.message.includes('нет доступа к этому коннектору')) {
    userFriendlyMessage = 'У вас нет доступа к этому коннектору. Пожалуйста, оформите подписку в личном кабинете BPM Centr.';
  } else {
    userFriendlyMessage = `Ошибка: ${error.message}`;
  }

  throw new Error(userFriendlyMessage);
}
```

Пример использования в операции коннектора:

```javascript
async function getContactOperation(params, context) {
  try {
    // Получение параметров
    const { contactId } = params;
    const { apiKey, bpmCentrApiKey } = context.auth;

    // Получение идентификатора аккаунта Make
    const makeAccountId = getMakeAccountId(context);

    // Проверка привязки к аккаунту
    await checkAccountBinding(bpmCentrApiKey, 'crm-connector', makeAccountId, context);

    // Выполнение основной логики операции
    // ...

    return result;
  } catch (error) {
    // Обработка ошибок привязки к аккаунту
    handleAccountBindingErrors(error);
  }
}
```

Основные типы ошибок привязки к аккаунту:

1. **Коннектор привязан к другому аккаунту** - Возникает, когда пользователь пытается использовать коннектор в аккаунте, отличном от того, к которому он привязан
2. **Не удалось определить идентификатор аккаунта** - Возникает, когда коннектор используется в тестовом режиме или на этапе настройки
3. **Неактивная подписка** - Возникает, когда подписка пользователя истекла или была отменена
4. **Нет доступа к коннектору** - Возникает, когда у пользователя нет подписки на данный коннектор

### Требования к операциям и триггерам

1. **Проверка подписки** - Каждая операция и триггер должны проверять статус подписки и привязку к текущему аккаунту Make перед выполнением
2. **Регистрация использования** - Каждая операция и триггер должны регистрировать использование после успешного выполнения
3. **Обработка ошибок** - Операции и триггеры должны корректно обрабатывать ошибки и предоставлять понятные сообщения
4. **Документация** - Каждая операция и триггер должны иметь подробное описание и документацию

## Процесс разработки

### 1. Планирование коннектора

1. **Определение целевой системы** - Выберите систему, для которой будет разрабатываться коннектор
2. **Анализ API** - Изучите API целевой системы и определите доступные операции
3. **Определение модулей** - Разделите функциональность на логические модули
4. **Определение операций и триггеров** - Определите, какие операции и триггеры будут реализованы

### 2. Создание проекта в Make Developer Hub

1. **Создание нового проекта** - Создайте новый проект коннектора в Make Developer Hub
2. **Настройка метаданных** - Укажите название, описание и другие метаданные коннектора
3. **Загрузка иконки** - Загрузите иконку коннектора в формате PNG размером 64x64 пикселя

### 3. Настройка аутентификации

1. **Определение типа аутентификации** - Выберите подходящий тип аутентификации для целевой системы
2. **Добавление полей аутентификации** - Добавьте необходимые поля для аутентификации
3. **Добавление поля для API-ключа BPM Centr** - Добавьте поле для API-ключа BPM Centr
4. **Настройка тестирования аутентификации** - Настройте тестирование аутентификации

Пример настройки аутентификации:

```json
{
  "type": "api_key",
  "fields": {
    "apiKey": {
      "type": "text",
      "label": "API Key",
      "required": true,
      "sensitive": true,
      "help": "API key for the target system"
    },
    "apiUrl": {
      "type": "text",
      "label": "API URL",
      "required": true,
      "default": "https://api.example.com/v1",
      "help": "API URL for the target system"
    },
    "bpmCentrApiKey": {
      "type": "text",
      "label": "BPM Centr API Key",
      "required": true,
      "sensitive": true,
      "help": "API key from your BPM Centr account to verify subscription"
    }
  },
  "test": {
    "request": {
      "url": "{{apiUrl}}/test",
      "method": "GET",
      "headers": {
        "X-API-Key": "{{apiKey}}"
      }
    },
    "response": {
      "status": 200
    }
  }
}
```

### 4. Реализация операций

1. **Создание операции** - Создайте новую операцию в Make Developer Hub
2. **Настройка входных параметров** - Определите входные параметры операции
3. **Настройка выходных параметров** - Определите выходные параметры операции
4. **Реализация логики операции** - Реализуйте логику операции с проверкой подписки и регистрацией использования

Пример реализации операции:

```javascript
// Определение операции
const getItemOperation = {
  name: 'getItem',
  label: 'Get Item',
  description: 'Retrieves an item by ID',

  // Входные параметры
  input: {
    itemId: {
      type: 'text',
      label: 'Item ID',
      required: true
    }
  },

  // Выходные параметры
  output: ['id', 'name', 'description', 'price', 'createdAt'],

  // Выполнение операции
  async run({ input, auth }) {
    // Получение параметров
    const { itemId } = input;
    const { apiKey, apiUrl, bpmCentrApiKey } = auth;

    try {
      // Получение идентификатора аккаунта Make
      const makeAccountId = this.makeAccountId; // Получаем из контекста Make

      // Проверка подписки
      const subscriptionUrl = new URL('https://api.bpmcentr.ru/v1/subscription/check');
      subscriptionUrl.searchParams.append('connector', 'example-connector');
      subscriptionUrl.searchParams.append('accountId', makeAccountId);

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

      if (subscriptionData.accountId !== makeAccountId) {
        throw new Error('This connector is linked to a different Make account. Please purchase a subscription for this account at BPM Centr.');
      }

      // Выполнение запроса к API целевой системы
      const itemResponse = await this.fetch({
        url: `${apiUrl}/items/${itemId}`,
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (itemResponse.status !== 200) {
        throw new Error(`Failed to get item: ${itemResponse.statusText}`);
      }

      const item = await itemResponse.json();

      // Регистрация использования
      const usageResponse = await this.fetch({
        url: 'https://api.bpmcentr.ru/v1/connector/usage',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bpmCentrApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connector: 'example-connector',
          operation: 'getItem',
          timestamp: new Date().toISOString()
        })
      });

      if (usageResponse.status !== 201) {
        console.warn('Failed to register usage, but operation was successful');
      }

      // Возврат результата
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        createdAt: item.createdAt
      };
    } catch (error) {
      throw new Error(`Error getting item: ${error.message}`);
    }
  }
};
```

### 5. Реализация триггеров

1. **Создание триггера** - Создайте новый триггер в Make Developer Hub
2. **Настройка входных параметров** - Определите входные параметры триггера
3. **Настройка выходных параметров** - Определите выходные параметры триггера
4. **Реализация логики триггера** - Реализуйте логику триггера с проверкой подписки и регистрацией использования

Пример реализации триггера:

```javascript
// Определение триггера
const newItemTrigger = {
  name: 'newItem',
  label: 'New Item',
  description: 'Triggers when a new item is created',

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
  output: ['id', 'name', 'description', 'price', 'createdAt'],

  // Выполнение триггера
  async run({ input, auth, store }) {
    // Получение параметров
    const { maxResults } = input;
    const { apiKey, apiUrl, bpmCentrApiKey } = auth;

    try {
      // Получение идентификатора аккаунта Make
      const makeAccountId = this.makeAccountId; // Получаем из контекста Make

      // Проверка подписки
      const subscriptionUrl = new URL('https://api.bpmcentr.ru/v1/subscription/check');
      subscriptionUrl.searchParams.append('connector', 'example-connector');
      subscriptionUrl.searchParams.append('accountId', makeAccountId);

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

      if (subscriptionData.accountId !== makeAccountId) {
        throw new Error('This connector is linked to a different Make account. Please purchase a subscription for this account at BPM Centr.');
      }

      // Получение времени последнего запроса
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();

      // Выполнение запроса к API целевой системы
      const itemsResponse = await this.fetch({
        url: `${apiUrl}/items`,
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        },
        params: {
          createdAfter: lastPollTime,
          limit: maxResults
        }
      });

      if (itemsResponse.status !== 200) {
        throw new Error(`Failed to get items: ${itemsResponse.statusText}`);
      }

      const items = await itemsResponse.json();

      // Сохранение времени последнего запроса
      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        store.set('lastPollTime', lastItem.createdAt);
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
          connector: 'example-connector',
          operation: 'newItem',
          timestamp: new Date().toISOString()
        })
      });

      if (usageResponse.status !== 201) {
        console.warn('Failed to register usage, but operation was successful');
      }

      // Возврат результатов
      return items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        createdAt: item.createdAt
      }));
    } catch (error) {
      throw new Error(`Error getting new items: ${error.message}`);
    }
  }
};
```

### 6. Тестирование коннектора

1. **Локальное тестирование** - Протестируйте коннектор в локальной среде Make Developer Hub
2. **Тестирование аутентификации** - Проверьте корректность работы аутентификации
3. **Тестирование операций и триггеров** - Проверьте корректность работы операций и триггеров
4. **Тестирование интеграции с API BPM Centr** - Проверьте корректность проверки подписки и регистрации использования
5. **Тестирование обработки ошибок** - Проверьте корректность обработки различных ошибок

### 7. Документирование коннектора

1. **Создание документации** - Создайте подробную документацию по использованию коннектора
2. **Описание операций и триггеров** - Опишите все операции и триггеры, их параметры и результаты
3. **Примеры использования** - Приведите примеры использования коннектора в различных сценариях
4. **Рекомендации по устранению ошибок** - Опишите возможные ошибки и способы их устранения

### 8. Публикация коннектора

1. **Подготовка к публикации** - Убедитесь, что коннектор соответствует всем требованиям
2. **Отправка на проверку** - Отправьте коннектор на проверку в BPM Centr
3. **Исправление замечаний** - Исправьте замечания, полученные в результате проверки
4. **Публикация** - После одобрения опубликуйте коннектор в Make

## Лучшие практики

### Оптимизация производительности

1. **Минимизация количества запросов** - Старайтесь минимизировать количество запросов к API
2. **Кэширование результатов** - Используйте кэширование для уменьшения количества запросов
3. **Пакетная обработка** - Используйте пакетную обработку для операций, которые могут быть выполнены одним запросом
4. **Оптимизация размера данных** - Запрашивайте только необходимые данные

### Обработка ошибок

1. **Детальные сообщения об ошибках** - Предоставляйте понятные и информативные сообщения об ошибках
2. **Рекомендации по устранению ошибок** - Включайте рекомендации по устранению ошибок в сообщения
3. **Логирование ошибок** - Логируйте ошибки для отладки и анализа
4. **Обработка различных типов ошибок** - Корректно обрабатывайте различные типы ошибок (сетевые, аутентификации, доступа)

### Безопасность

1. **Безопасная обработка учетных данных** - Не храните учетные данные в открытом виде
2. **Использование HTTPS** - Всегда используйте HTTPS для запросов
3. **Минимальные привилегии** - Запрашивайте только необходимые привилегии
4. **Валидация входных данных** - Проверяйте и валидируйте все входные данные

### Локализация

1. **Поддержка нескольких языков** - Обеспечьте поддержку русского и английского языков
2. **Локализация сообщений об ошибках** - Локализуйте сообщения об ошибках
3. **Локализация документации** - Предоставляйте документацию на нескольких языках

## Часто задаваемые вопросы

### Как получить доступ к Make Developer Hub?

Для получения доступа к Make Developer Hub необходимо зарегистрироваться на [Make](https://www.make.com/) и запросить доступ к Developer Hub через форму на сайте.

### Как получить API-ключ BPM Centr?

API-ключ BPM Centr можно получить в личном кабинете BPM Centr в разделе "API-ключи". Для создания нового ключа нажмите кнопку "Создать API-ключ" и укажите его название.

### Как тестировать коннектор?

Для тестирования коннектора можно использовать локальную среду Make Developer Hub. Создайте тестовый сценарий, добавьте в него ваш коннектор и выполните операции или триггеры.

### Как обрабатывать ошибки API BPM Centr?

При обработке ошибок API BPM Centr рекомендуется проверять статус ответа и предоставлять понятные сообщения об ошибках. Для различных статусов ответа могут быть предоставлены различные рекомендации по устранению ошибок.

Особое внимание следует уделить обработке ошибок, связанных с привязкой коннектора к аккаунту Make. Если пользователь пытается использовать коннектор в аккаунте, к которому он не привязан, необходимо предоставить понятное сообщение о необходимости приобретения подписки для этого аккаунта.

### Как оптимизировать количество запросов к API BPM Centr?

Для оптимизации количества запросов к API BPM Centr рекомендуется использовать кэширование результатов проверки подписки и пакетную регистрацию использования операций.

## Заключение

Разработка коннекторов для Make в рамках проекта "BPM Centr" требует соблюдения определенных требований и стандартов. Следуя рекомендациям и лучшим практикам, описанным в этом руководстве, вы сможете создавать качественные коннекторы, которые будут успешно интегрироваться с API BPM Centr и предоставлять пользователям удобный доступ к различным системам.

Для получения дополнительной информации обратитесь к документации по [интеграции с Make API](../integrations/make_integration.md), [примерам использования API BPM Centr](../integrations/make_api_examples.md) и [спецификации API](../api/specification.md).
