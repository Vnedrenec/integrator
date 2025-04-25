# Примеры CRM-коннекторов

В этом документе представлены примеры реализации коннекторов для CRM-систем в рамках проекта "BPM Centr".

## Обзор CRM-коннекторов

CRM-коннекторы обеспечивают интеграцию между платформой Make и различными CRM-системами, такими как Creatio, KommoCRM, KeyCRM и другие. Эти коннекторы позволяют автоматизировать работу с контактами, сделками, задачами и другими сущностями CRM-систем.

## Пример коннектора для Creatio

### Структура коннектора

Коннектор для Creatio CRM состоит из следующих основных файлов:

```
creatio-connector/
├── app/
│   ├── app.json              # Основная конфигурация приложения
│   ├── base.json             # Базовая конфигурация (URL, авторизация)
│   ├── common.json           # Общие данные для всего приложения
│   ├── connections/          # Конфигурации подключений
│   │   ├── oauth2.json       # Конфигурация OAuth 2.0
│   │   └── ...
│   ├── modules/              # Модули коннектора
│   │   ├── actions/          # Модули действий
│   │   │   ├── get-contact.json   # Получение контакта
│   │   │   ├── create-contact.json # Создание контакта
│   │   │   └── ...
│   │   ├── searches/         # Модули поиска
│   │   │   ├── list-contacts.json # Получение списка контактов
│   │   │   └── ...
│   │   ├── triggers/         # Модули триггеров
│   │   │   ├── new-contact.json # Триггер новых контактов
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

### Основная конфигурация приложения (app.json)

```json
{
  "name": "creatio",
  "label": "Creatio CRM",
  "version": "1.0.0",
  "description": "Коннектор для Creatio CRM",
  "language": "ru",
  "categories": ["crm", "sales"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/creatio"
}
```

### Базовая конфигурация (base.json)

```json
{
  "url": "https://{connection.instance}.creatio.com/0/ServiceModel/EntityDataService.svc",
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

### Конфигурация OAuth 2.0 (connections/oauth2.json)

```json
{
  "name": "oauth2",
  "type": "oauth2",
  "label": "OAuth 2.0",
  "oauth2Config": {
    "authorizationUrl": "https://{instance}.creatio.com/0/ServiceModel/AuthService.svc/Login",
    "tokenUrl": "https://{instance}.creatio.com/0/ServiceModel/AuthService.svc/Token",
    "scope": ["General"],
    "pkce": false
  },
  "fields": [
    {
      "name": "instance",
      "type": "text",
      "label": "Creatio Instance",
      "required": true,
      "help": "Ваш поддомен Creatio (например, company.creatio.com)"
    },
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
      "url": "/Contact?$top=1",
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

### Модуль действия для получения контакта (modules/actions/get-contact.json)

```json
{
  "name": "getContact",
  "label": "Получить контакт",
  "description": "Получает информацию о контакте по ID",
  "connection": "oauth2",

  "parameters": [
    {
      "name": "contactId",
      "type": "text",
      "label": "ID контакта",
      "required": true
    }
  ],

  "communication": {
    "url": "/Contact(guid'{{parameters.contactId}}')",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{connection.access_token}}"
    },
    "response": {
      "output": {
        "Id": "{{body.Id}}",
        "Name": "{{body.Name}}",
        "Email": "{{body.Email}}",
        "MobilePhone": "{{body.MobilePhone}}",
        "CreatedOn": "{{formatDate(body.CreatedOn, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'creatio')}}"
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
      "name": "Id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "Name",
      "type": "text",
      "label": "Полное имя"
    },
    {
      "name": "Email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "MobilePhone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "CreatedOn",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": {
    "Id": "00000000-0000-0000-0000-000000000000",
    "Name": "Иван Петров",
    "Email": "ivan@example.com",
    "MobilePhone": "+7 (999) 123-45-67",
    "CreatedOn": "2023-01-15"
  }
}
```

### Модуль поиска для получения списка контактов (modules/searches/list-contacts.json)

```json
{
  "name": "listContacts",
  "label": "Список контактов",
  "description": "Получает список контактов с возможностью фильтрации",
  "connection": "oauth2",

  "parameters": [
    {
      "name": "query",
      "type": "text",
      "label": "Поисковый запрос",
      "required": false
    },
    {
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "communication": {
    "url": "/Contact",
    "method": "GET",
    "params": {
      "$filter": "{{parameters.query ? 'contains(Name, \\'' + parameters.query + '\\')' : ''}}",
      "$top": "{{parameters.maxResults}}",
      "$orderby": "CreatedOn desc"
    },
    "headers": {
      "Authorization": "Bearer {{connection.access_token}}"
    },
    "response": {
      "iterate": "{{body.value}}",
      "output": {
        "Id": "{{item.Id}}",
        "Name": "{{item.Name}}",
        "Email": "{{item.Email}}",
        "MobilePhone": "{{item.MobilePhone}}",
        "CreatedOn": "{{formatDate(item.CreatedOn, 'YYYY-MM-DD')}}"
      }
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
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "interface": [
    {
      "name": "Id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "Name",
      "type": "text",
      "label": "Полное имя"
    },
    {
      "name": "Email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "MobilePhone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "CreatedOn",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": [
    {
      "Id": "00000000-0000-0000-0000-000000000000",
      "Name": "Иван Петров",
      "Email": "ivan@example.com",
      "MobilePhone": "+7 (999) 123-45-67",
      "CreatedOn": "2023-01-15"
    },
    {
      "Id": "00000000-0000-0000-0000-000000000001",
      "Name": "Мария Сидорова",
      "Email": "maria@example.com",
      "MobilePhone": "+7 (999) 765-43-21",
      "CreatedOn": "2023-02-20"
    }
  ]
}
```

### Модуль триггера для новых контактов (modules/triggers/new-contact.json)

```json
{
  "name": "newContact",
  "label": "Новый контакт",
  "description": "Срабатывает при создании нового контакта",
  "connection": "oauth2",
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
    "url": "/Contact",
    "method": "GET",
    "params": {
      "$filter": "{{state.lastPollTime ? 'CreatedOn gt datetime\\'' + formatDate(state.lastPollTime, 'YYYY-MM-DDTHH:mm:ss') + '\\'' : ''}}",
      "$top": "{{parameters.maxResults}}",
      "$orderby": "CreatedOn asc"
    },
    "headers": {
      "Authorization": "Bearer {{connection.access_token}}"
    },
    "response": {
      "iterate": "{{body.value}}",
      "output": {
        "Id": "{{item.Id}}",
        "Name": "{{item.Name}}",
        "Email": "{{item.Email}}",
        "MobilePhone": "{{item.MobilePhone}}",
        "CreatedOn": "{{formatDate(item.CreatedOn, 'YYYY-MM-DD')}}"
      },
      "state": {
        "lastPollTime": "{{iterate.container.last.CreatedOn}}"
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
      "name": "Id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "Name",
      "type": "text",
      "label": "Полное имя"
    },
    {
      "name": "Email",
      "type": "email",
      "label": "Email"
    },
    {
      "name": "MobilePhone",
      "type": "text",
      "label": "Телефон"
    },
    {
      "name": "CreatedOn",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": [
    {
      "Id": "00000000-0000-0000-0000-000000000000",
      "Name": "Иван Петров",
      "Email": "ivan@example.com",
      "MobilePhone": "+7 (999) 123-45-67",
      "CreatedOn": "2023-01-15"
    }
  ]
}
```

### Функция проверки подписки (functions/subscription.js)

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

## Рекомендации по разработке CRM-коннекторов

### Общие рекомендации

1. **Стандартизация интерфейсов** — используйте единый подход к именованию операций и полей.
2. **Обработка ошибок API** — корректно обрабатывайте ошибки API CRM-систем.
3. **Оптимизация запросов** — минимизируйте количество запросов к API.
4. **Используйте возможности фильтрации и пагинации Creatio OData API для повышения производительности.**

### Типовые операции

1. **Контакты**:
   - Получение контакта по ID
   - Создание контакта
   - Обновление контакта
   - Поиск контактов
   - Удаление контакта

2. **Сделки/Лиды**:
   - Получение сделки по ID
   - Создание сделки
   - Обновление сделки
   - Изменение стадии сделки
   - Поиск сделок

3. **Компании**:
   - Получение компании по ID
   - Создание компании
   - Обновление компании
   - Поиск компаний

4. **Задачи**:
   - Получение задачи по ID
   - Создание задачи
   - Обновление задачи
   - Завершение задачи
   - Поиск задач

### Типичные триггеры CRM-коннекторов

1. **Новый контакт** — срабатывает при создании нового контакта
2. **Обновление контакта** — срабатывает при обновлении контакта
3. **Новая сделка** — срабатывает при создании новой сделки
4. **Обновление сделки** — срабатывает при обновлении сделки
5. **Новая задача** — срабатывает при создании новой задачи
6. **Завершение задачи** — срабатывает при завершении задачи

## Связанные разделы

- [Обзор коннекторов](../overview.md)
- [Структура коннекторов](../structure.md)
- [Разработка коннекторов](../development.md)
- [Тестирование коннекторов](../testing.md)
- [Примеры маркетплейс-коннекторов](marketplace.md)
- [Примеры платежных коннекторов](payment.md)
