# Структура коннекторов для Make

В этом документе описывается структура коннекторов для платформы Make в рамках проекта "BPM Centr".

## Общая структура коннектора Make

### Компоненты коннектора

Коннектор для Make состоит из следующих основных компонентов:

1. **Метаданные приложения** - информация о коннекторе (название, описание, версия, иконка)
2. **Базовая конфигурация** - определяет базовый URL и общие настройки для API
3. **Конфигурация подключений** - определяет способы аутентификации в API внешнего сервиса
4. **Модули** - функциональные компоненты коннектора (действия, поиск, триггеры)
5. **Удаленные вызовы процедур (RPC)** - компоненты для динамического контента
6. **Пользовательские функции** - JavaScript функции для сложной логики
7. **Механизм проверки подписки** - компонент, который проверяет статус подписки пользователя через API BPM Centr

### Формат определения коннектора

Коннектор для Make определяется в формате JSON-конфигурации, разделенной на несколько файлов:

```
my-connector/
├── app/
│   ├── app.json              # Основная конфигурация приложения
│   ├── base.json             # Базовая конфигурация (URL, авторизация)
│   ├── common.json           # Общие данные для всего приложения
│   ├── connections/          # Конфигурации подключений
│   │   ├── oauth2.json       # Конфигурация OAuth 2.0
│   │   └── ...
│   ├── modules/              # Модули коннектора
│   │   ├── actions/          # Модули действий
│   │   │   ├── create.json   # Модуль создания ресурса
│   │   │   └── ...
│   │   ├── searches/         # Модули поиска
│   │   │   ├── list.json     # Модуль получения списка ресурсов
│   │   │   └── ...
│   │   ├── triggers/         # Модули триггеров
│   │   │   ├── new.json      # Триггер новых ресурсов
│   │   │   └── ...
│   │   └── ...
│   ├── rpcs/                 # Удаленные вызовы процедур
│   │   ├── dynamic-fields.json  # Динамические поля
│   │   └── ...
│   └── functions/            # Пользовательские IML функции
│       ├── subscription.js   # Функция проверки подписки
│       └── ...
└── assets/                   # Ресурсы
    └── icon.png              # Иконка коннектора
```

## Метаданные приложения (app.json)

Метаданные содержат основную информацию о коннекторе:

```json
{
  "name": "myconnector",
  "label": "My Connector",
  "version": "1.0.0",
  "description": "Connector for My Service",
  "language": "ru",
  "categories": ["crm", "sales"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/my-connector"
}
```

### Требования к иконке

- Формат: PNG или SVG
- Размер: 64x64 пикселя
- Фон: прозрачный
- Стиль: плоский дизайн, соответствующий стилю Make

## Базовая конфигурация (base.json)

Базовая конфигурация определяет общие настройки для API:

```json
{
  "url": "https://api.example.com/v1",
  "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  "error": {
    "message": "{{body.error.message}}",
    "type": "{{body.error.type}}",
    "status": "{{statusCode}}"
  }
}
```

- `url` - базовый URL для API
- `headers` - общие заголовки для всех запросов
- `error` - конфигурация обработки ошибок

## Конфигурация подключений

Конфигурация подключений определяет способы аутентификации в API внешнего сервиса.

### Типы подключений

Make поддерживает следующие типы подключений:

1. **API Key** - аутентификация с использованием API-ключа
2. **Basic Auth** - базовая HTTP-аутентификация (логин/пароль)
3. **OAuth 2.0** - аутентификация по протоколу OAuth 2.0
4. **Custom Auth** - пользовательская аутентификация

### Примеры конфигурации подключений

#### API Key (connections/api_key.json)

```json
{
  "name": "api_key",
  "type": "api_key",
  "label": "API Key",
  "fields": [
    {
      "name": "apiKey",
      "type": "text",
      "label": "API Key",
      "required": true,
      "sensitive": true
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
      "url": "/test",
      "method": "GET",
      "headers": {
        "X-API-Key": "{{connection.apiKey}}"
      }
    },
    "response": {
      "status": 200
    }
  }
}
```

#### OAuth 2.0 (connections/oauth2.json)

```json
{
  "name": "oauth2",
  "type": "oauth2",
  "label": "OAuth 2.0",
  "oauth2Config": {
    "authorizationUrl": "https://api.example.com/oauth/authorize",
    "tokenUrl": "https://api.example.com/oauth/token",
    "scope": ["read", "write"],
    "pkce": true
  },
  "fields": [
    {
      "name": "clientId",
      "type": "text",
      "label": "Client ID",
      "required": true
    },
    {
      "name": "clientSecret",
      "type": "password",
      "label": "Client Secret",
      "required": true,
      "sensitive": true
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
      "url": "/test",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{connection.access_token}}"
      }
    },
    "response": {
      "status": 200
    }
  }
}
```

## Модули

Модули - это функциональные компоненты коннектора, которые определяют действия, поиск и триггеры. В Make модули разделены на следующие типы:

1. **Actions (Действия)** - выполняют операции с данными (создание, обновление, удаление)
2. **Searches (Поиск)** - получают данные из системы
3. **Triggers (Триггеры)** - реагируют на события в системе через периодический опрос
4. **Instant Triggers (Мгновенные триггеры)** - реагируют на события в системе через webhook
5. **Universal (Универсальные)** - позволяют выполнять произвольные API-запросы (REST или GraphQL)
6. **Responders (Ответчики)** - отправляют обработанные данные обратно в webhook

### Структура модулей

Модули размещаются в соответствующих директориях:

```
modules/
├── actions/              # Модули действий
│   ├── create.json       # Модуль создания ресурса
│   └── ...
├── searches/             # Модули поиска
│   ├── list.json         # Модуль получения списка ресурсов
│   └── ...
├── triggers/             # Модули триггеров (опрос)
│   ├── new.json          # Триггер новых ресурсов
│   └── ...
├── instant_triggers/     # Модули мгновенных триггеров (webhook)
│   ├── webhook.json      # Триггер webhook-событий
│   └── ...
├── universal/            # Универсальные модули
│   ├── api-call.json     # Модуль произвольного API-запроса
│   └── ...
└── responders/           # Модули ответчиков
    ├── response.json     # Модуль ответа на webhook
    └── ...
```

## Модули действий (Actions)

Модули действий выполняют операции с данными, такие как создание, обновление или удаление ресурсов.

### Пример модуля действия (modules/actions/get-contact.json)

```json
{
  "name": "getContact",
  "label": "Получить контакт",
  "description": "Получает информацию о контакте по ID",
  "connection": "api_key",

  "parameters": [
    {
      "name": "contactId",
      "type": "text",
      "label": "ID контакта",
      "required": true
    }
  ],

  "communication": {
    "url": "/contacts/{{parameters.contactId}}",
    "method": "GET",
    "headers": {
      "X-API-Key": "{{connection.apiKey}}"
    },
    "response": {
      "output": {
        "id": "{{body.id}}",
        "name": "{{body.name}}",
        "email": "{{body.email}}",
        "phone": "{{body.phone}}",
        "createdAt": "{{formatDate(body.created_at, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'myconnector')}}"
      }
    }
  },

  "expect": [
    {
      "name": "contactId",
      "type": "text",
      "label": "ID контакта",
      "required": true
    }
  ],

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "name",
      "type": "text",
      "label": "Имя"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "phone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "createdAt",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": {
    "id": "12345",
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+7 (999) 123-45-67",
    "createdAt": "2023-01-15"
  }
}
```

### Компоненты модуля действия

- **name** - уникальный идентификатор модуля
- **label** - отображаемое имя модуля
- **description** - описание модуля
- **connection** - тип подключения, используемый модулем
- **parameters** - входные параметры модуля
- **communication** - конфигурация запроса к API
- **expect** - ожидаемые входные параметры (для валидации)
- **interface** - описание выходных полей
- **samples** - примеры выходных данных

### Типы полей

Make поддерживает следующие типы полей:

- **text** - строка
- **number** - число
- **boolean** - логическое значение
- **date** - дата и время
- **textarea** - многострочный текст
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

## Модули поиска (Searches)

Модули поиска получают данные из системы, например, список контактов или информацию о сделке.

### Пример модуля поиска (modules/searches/list-contacts.json)

```json
{
  "name": "listContacts",
  "label": "Список контактов",
  "description": "Получает список контактов с возможностью фильтрации",
  "connection": "api_key",

  "parameters": [
    {
      "name": "query",
      "type": "text",
      "label": "Поисковый запрос",
      "required": false
    },
    {
      "name": "limit",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "communication": {
    "url": "/contacts",
    "method": "GET",
    "params": {
      "q": "{{parameters.query}}",
      "limit": "{{parameters.limit}}"
    },
    "headers": {
      "X-API-Key": "{{connection.apiKey}}"
    },
    "response": {
      "iterate": "{{body.contacts}}",
      "output": {
        "id": "{{item.id}}",
        "name": "{{item.name}}",
        "email": "{{item.email}}",
        "phone": "{{item.phone}}",
        "createdAt": "{{formatDate(item.created_at, 'YYYY-MM-DD')}}"
      }
    },
    "pagination": {
      "mergeWithParent": true,
      "rel": "next",
      "type": "link",
      "url": "{{headers.link}}"
    }
  },

  "expect": [
    {
      "name": "query",
      "type": "text",
      "label": "Поисковый запрос",
      "required": false
    },
    {
      "name": "limit",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "name",
      "type": "text",
      "label": "Имя"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "phone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "createdAt",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": [
    {
      "id": "12345",
      "name": "Иван Петров",
      "email": "ivan@example.com",
      "phone": "+7 (999) 123-45-67",
      "createdAt": "2023-01-15"
    },
    {
      "id": "12346",
      "name": "Мария Сидорова",
      "email": "maria@example.com",
      "phone": "+7 (999) 765-43-21",
      "createdAt": "2023-02-20"
    }
  ]
}

```

## Модули триггеров (Triggers)

Модули триггеров реагируют на события в системе, например, создание нового контакта или изменение статуса сделки.

### Пример модуля триггера (modules/triggers/new-contact.json)

```json
{
  "name": "newContact",
  "label": "Новый контакт",
  "description": "Срабатывает при создании нового контакта",
  "connection": "api_key",
  "type": "polling",

  "parameters": [
    {
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "communication": {
    "url": "/contacts",
    "method": "GET",
    "params": {
      "created_after": "{{formatDate(state.lastPollTime, 'YYYY-MM-DDTHH:mm:ss')}}",
      "limit": "{{parameters.maxResults}}",
      "sort": "created_at",
      "order": "asc"
    },
    "headers": {
      "X-API-Key": "{{connection.apiKey}}"
    },
    "response": {
      "iterate": "{{body.contacts}}",
      "output": {
        "id": "{{item.id}}",
        "name": "{{item.name}}",
        "email": "{{item.email}}",
        "phone": "{{item.phone}}",
        "createdAt": "{{formatDate(item.created_at, 'YYYY-MM-DD')}}"
      },
      "state": {
        "lastPollTime": "{{iterate.container.last.created_at}}"
      }
    }
  },

  "expect": [
    {
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "name",
      "type": "text",
      "label": "Имя"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "phone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "createdAt",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": [
    {
      "id": "12345",
      "name": "Иван Петров",
      "email": "ivan@example.com",
      "phone": "+7 (999) 123-45-67",
      "createdAt": "2023-01-15"
    }
  ]
}
```

### Типы триггеров

Make поддерживает следующие типы триггеров:

1. **Polling (Опрос)** - периодический опрос API для проверки новых событий
2. **Webhook (Вебхук)** - получение уведомлений через вебхуки
   - **Shared (Общие)** - один вебхук для всех пользователей
   - **Dedicated (Выделенные)** - отдельный вебхук для каждого пользователя
     - **Attached (Прикрепленные)** - вебхук привязан к конкретному ресурсу
     - **Not attached (Не прикрепленные)** - вебхук не привязан к конкретному ресурсу

## Механизм проверки подписки

Каждый коннектор BPM Centr включает механизм проверки подписки, который выполняет следующие функции:

1. **Проверка статуса подписки** - перед выполнением операций коннектор проверяет активность подписки пользователя
2. **Ограничение доступа** - если подписка неактивна или истекла, коннектор блокирует выполнение операций
3. **Учет использования** - коннектор может отправлять статистику использования для биллинга и аналитики

### Пример функции проверки подписки (functions/subscription.js)

```javascript
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

### Ограничения IML функций

При разработке IML функций необходимо учитывать следующие ограничения:

1. **Максимальное время выполнения** - 10 секунд
2. **Максимальное количество символов в числе** - 5000
3. **Доступные объекты** - Только встроенные объекты JavaScript и Buffer
4. **Доступные функции** - Все встроенные IML функции доступны через пространство имен `iml`, например `iml.parseDate()`

Для использования пользовательских IML функций может потребоваться связаться с поддержкой Make Developer Hub.

## Связанные разделы

- [Обзор коннекторов](overview.md)
- [Разработка коннекторов](development.md)
- [Тестирование коннекторов](testing.md)
- [Управление подписками](../subscription/overview.md)
