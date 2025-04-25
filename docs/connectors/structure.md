# Структура коннекторов для Make

В этом документе описывается структура коннекторов для платформы Make (ранее Integromat) в рамках проекта "BPM Centr".

## Общая структура коннектора Make

### Компоненты коннектора

Коннектор для Make состоит из следующих основных компонентов:

1. **Метаданные коннектора** - информация о коннекторе (название, описание, версия, иконка)
2. **Конфигурация аутентификации** - определяет способ аутентификации в API внешнего сервиса
3. **Модули** - логические группы функциональности
4. **Операции** - действия, которые может выполнять коннектор
5. **Триггеры** - события, на которые может реагировать коннектор
6. **Механизм проверки подписки** - компонент, который проверяет статус подписки пользователя через API BPM Centr

### Формат определения коннектора

Коннектор для Make определяется в формате JSON или JavaScript объекта:

```javascript
module.exports = {
  name: 'MyConnector',
  label: 'My Connector',
  description: 'Connector for My Service',
  icon: './assets/icon.png',
  version: '1.0.0',
  authentication: {
    // Конфигурация аутентификации
  },
  modules: [
    // Определение модулей
  ]
};
```

## Метаданные коннектора

Метаданные содержат основную информацию о коннекторе:

```javascript
{
  name: 'MyConnector', // Уникальный идентификатор коннектора
  label: 'My Connector', // Отображаемое имя коннектора
  description: 'Connector for My Service', // Описание коннектора
  icon: './assets/icon.png', // Путь к иконке коннектора
  version: '1.0.0', // Версия коннектора
  language: 'ru', // Язык коннектора (опционально)
  categories: ['CRM', 'Marketing'], // Категории коннектора (опционально)
  pricing: 'premium', // Тип доступа: free, premium, enterprise (опционально)
  author: 'BPM Centr', // Автор коннектора (опционально)
  website: 'https://bpmcentr.ru', // Веб-сайт коннектора (опционально)
  docs: 'https://docs.bpmcentr.ru/connectors/my-connector' // Документация коннектора (опционально)
}
```

### Требования к иконке

- Формат: PNG или SVG
- Размер: 64x64 пикселя
- Фон: прозрачный
- Стиль: плоский дизайн, соответствующий стилю Make

## Аутентификация

### Типы аутентификации

Make поддерживает следующие типы аутентификации:

1. **API Key** - аутентификация с использованием API-ключа
2. **Basic Auth** - базовая HTTP-аутентификация (логин/пароль)
3. **OAuth 2.0** - аутентификация по протоколу OAuth 2.0
4. **Custom Auth** - пользовательская аутентификация

### Примеры конфигурации аутентификации

#### API Key

```javascript
authentication: {
  type: 'api_key',
  fields: {
    apiKey: {
      type: 'string',
      label: 'API Key',
      required: true,
      sensitive: true
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
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: {
        'X-API-Key': '{{apiKey}}'
      }
    },
    response: {
      status: 200
    }
  }
}
```

#### OAuth 2.0

```javascript
authentication: {
  type: 'oauth2',
  oauth2Config: {
    authorizationUrl: 'https://api.example.com/oauth/authorize',
    tokenUrl: 'https://api.example.com/oauth/token',
    scope: ['read', 'write'],
    pkce: true // Использовать PKCE (опционально)
  },
  fields: {
    clientId: {
      type: 'string',
      label: 'Client ID',
      required: true
    },
    clientSecret: {
      type: 'password',
      label: 'Client Secret',
      required: true,
      sensitive: true
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
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {{access_token}}'
      }
    },
    response: {
      status: 200
    }
  }
}
```

## Модули

Модули группируют функциональность коннектора по логическим разделам:

```javascript
modules: [
  {
    name: 'contacts',
    label: 'Contacts',
    description: 'Work with contacts in the CRM',
    operations: [
      // Операции для работы с контактами
    ],
    triggers: [
      // Триггеры для контактов
    ]
  },
  {
    name: 'deals',
    label: 'Deals',
    description: 'Work with deals in the CRM',
    operations: [
      // Операции для работы со сделками
    ],
    triggers: [
      // Триггеры для сделок
    ]
  }
]
```

## Операции

Операции определяют действия, которые может выполнять коннектор:

```javascript
operations: [
  {
    name: 'getContact',
    label: 'Get Contact',
    description: 'Retrieve a contact by ID',
    input: {
      fields: [
        {
          name: 'contactId',
          type: 'string',
          label: 'Contact ID',
          required: true
        }
      ]
    },
    output: {
      fields: [
        {
          name: 'id',
          type: 'string',
          label: 'ID'
        },
        {
          name: 'name',
          type: 'string',
          label: 'Name'
        },
        {
          name: 'email',
          type: 'string',
          label: 'Email'
        },
        {
          name: 'phone',
          type: 'string',
          label: 'Phone'
        },
        {
          name: 'createdAt',
          type: 'date',
          label: 'Created At'
        }
      ]
    },
    execute: async function(params, context) {
      // Проверка подписки в BPM Centr
      try {
        const bpmCentrApiKey = context.auth.bpmCentrApiKey;
        
        // Проверка статуса подписки
        const subscriptionResponse = await context.http.get({
          url: 'https://api.bpmcentr.ru/subscription/check',
          headers: {
            'Authorization': `Bearer ${bpmCentrApiKey}`
          },
          params: {
            connector: 'my-connector'
          }
        });
        
        if (subscriptionResponse.statusCode !== 200 || !subscriptionResponse.body.active) {
          throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
        }
        
        // Логика выполнения операции
        const { contactId } = params;
        const { apiKey } = context.auth;
        
        // Выполнение запроса к API
        const response = await context.http.get({
          url: `https://api.example.com/contacts/${contactId}`,
          headers: {
            'X-API-Key': apiKey
          }
        });
        
        // Обработка ответа
        if (response.statusCode !== 200) {
          throw new Error(`Failed to get contact: ${response.body.error}`);
        }
        
        // Возврат результата
        return response.body;
      } catch (error) {
        throw new Error(`Error getting contact: ${error.message}`);
      }
    }
  }
]
```

### Типы полей

Make поддерживает следующие типы полей:

- **string** - строка
- **number** - число
- **boolean** - логическое значение
- **date** - дата и время
- **text** - многострочный текст
- **file** - файл
- **collection** - коллекция (массив объектов)
- **object** - объект
- **select** - выбор из списка
- **multiselect** - множественный выбор из списка
- **password** - пароль (скрытое поле)
- **uinteger** - целое положительное число
- **url** - URL
- **email** - email
- **phone** - телефон

## Триггеры

Триггеры определяют события, на которые может реагировать коннектор:

```javascript
triggers: [
  {
    name: 'newContact',
    label: 'New Contact',
    description: 'Triggers when a new contact is created',
    type: 'polling', // polling или webhook
    input: {
      fields: [
        {
          name: 'maxResults',
          type: 'uinteger',
          label: 'Max Results',
          required: false,
          default: 10
        }
      ]
    },
    output: {
      fields: [
        {
          name: 'id',
          type: 'string',
          label: 'ID'
        },
        {
          name: 'name',
          type: 'string',
          label: 'Name'
        },
        {
          name: 'email',
          type: 'string',
          label: 'Email'
        },
        {
          name: 'phone',
          type: 'string',
          label: 'Phone'
        },
        {
          name: 'createdAt',
          type: 'date',
          label: 'Created At'
        }
      ]
    },
    poll: async function(params, context) {
      // Проверка подписки в BPM Centr
      try {
        const bpmCentrApiKey = context.auth.bpmCentrApiKey;
        
        // Проверка статуса подписки
        const subscriptionResponse = await context.http.get({
          url: 'https://api.bpmcentr.ru/subscription/check',
          headers: {
            'Authorization': `Bearer ${bpmCentrApiKey}`
          },
          params: {
            connector: 'my-connector'
          }
        });
        
        if (subscriptionResponse.statusCode !== 200 || !subscriptionResponse.body.active) {
          throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
        }
        
        // Логика выполнения триггера
        const { maxResults } = params;
        const { apiKey } = context.auth;
        const { lastPollTime } = context.state;
        
        // Выполнение запроса к API
        const response = await context.http.get({
          url: 'https://api.example.com/contacts',
          headers: {
            'X-API-Key': apiKey
          },
          params: {
            created_after: lastPollTime,
            limit: maxResults,
            sort: 'created_at',
            order: 'asc'
          }
        });
        
        // Обработка ответа
        if (response.statusCode !== 200) {
          throw new Error(`Failed to get contacts: ${response.body.error}`);
        }
        
        // Сохранение времени последнего опроса
        if (response.body.contacts.length > 0) {
          const lastContact = response.body.contacts[response.body.contacts.length - 1];
          context.state.lastPollTime = lastContact.createdAt;
        }
        
        // Возврат результатов
        return response.body.contacts;
      } catch (error) {
        throw new Error(`Error polling for new contacts: ${error.message}`);
      }
    }
  }
]
```

### Типы триггеров

Make поддерживает два типа триггеров:

1. **Polling** - периодический опрос API для проверки новых событий
2. **Webhook** - получение уведомлений через вебхуки

## Механизм проверки подписки

Каждый коннектор BPM Centr включает механизм проверки подписки, который выполняет следующие функции:

1. **Проверка статуса подписки** - перед выполнением операций коннектор проверяет активность подписки пользователя
2. **Ограничение доступа** - если подписка неактивна или истекла, коннектор блокирует выполнение операций
3. **Учет использования** - коннектор может отправлять статистику использования для биллинга и аналитики

### Пример функции проверки подписки

```javascript
async function checkSubscription(bpmCentrApiKey, connectorName, context) {
  try {
    // Запрос к API BPM Centr для проверки подписки
    const response = await context.http.get({
      url: 'https://api.bpmcentr.ru/subscription/check',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      },
      params: {
        connector: connectorName
      }
    });
    
    // Проверка результата
    if (response.statusCode !== 200 || !response.body.active) {
      throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
    }
    
    return true;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
}
```

## Связанные разделы

- [Обзор коннекторов](overview.md)
- [Разработка коннекторов](development.md)
- [Тестирование коннекторов](testing.md)
- [Управление подписками](../subscription/overview.md)
