# Примеры CRM-коннекторов

В этом документе представлены примеры реализации коннекторов для CRM-систем в рамках проекта "BPM Centr".

## Обзор CRM-коннекторов

CRM-коннекторы обеспечивают интеграцию между платформой Make и различными CRM-системами, такими как Creatio, KommoCRM, KeyCRM и другие. Эти коннекторы позволяют автоматизировать работу с контактами, сделками, задачами и другими сущностями CRM-систем.

## Пример коннектора для Creatio

### Структура коннектора

```javascript
// index.js
const auth = require('./auth');
const contactsModule = require('./modules/contacts');
const dealsModule = require('./modules/deals');
const tasksModule = require('./modules/tasks');
const { checkSubscription } = require('./utils/subscription');

module.exports = {
  name: 'creatio',
  label: 'Creatio CRM',
  description: 'Connector for Creatio CRM',
  icon: './assets/icon.png',
  version: '1.0.0',
  authentication: auth,
  modules: [
    contactsModule,
    dealsModule,
    tasksModule
  ]
};
```

### Конфигурация аутентификации

```javascript
// auth.js
module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizationUrl: 'https://{instance}.creatio.com/0/ServiceModel/AuthService.svc/Login',
    tokenUrl: 'https://{instance}.creatio.com/0/ServiceModel/AuthService.svc/Token',
    scope: ['General'],
    pkce: false
  },
  fields: [
    {
      name: 'instance',
      type: 'string',
      label: 'Creatio Instance',
      required: true,
      help: 'Ваш поддомен Creatio (например, company.creatio.com)'
    },
    {
      name: 'clientId',
      type: 'string',
      label: 'Client ID',
      required: true
    },
    {
      name: 'clientSecret',
      type: 'password',
      label: 'Client Secret',
      required: true,
      sensitive: true
    },
    {
      name: 'bpmCentrApiKey',
      type: 'string',
      label: 'BPM Centr API Key',
      required: true,
      sensitive: true,
      help: 'API key from your BPM Centr account to verify subscription'
    }
  ],
  test: {
    request: {
      url: 'https://{instance}.creatio.com/0/ServiceModel/EntityDataService.svc/Contact?$top=1',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {{access_token}}'
      }
    },
    response: {
      status: 200
    }
  }
};
```

### Модуль для работы с контактами

```javascript
// modules/contacts.js
const { checkSubscription } = require('../utils/subscription');
const contactsApi = require('../api/contacts-api');

module.exports = {
  name: 'contacts',
  label: 'Contacts',
  description: 'Work with contacts in Creatio CRM',
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
            name: 'Id',
            type: 'string',
            label: 'ID'
          },
          {
            name: 'Name',
            type: 'string',
            label: 'Full Name'
          },
          {
            name: 'Email',
            type: 'string',
            label: 'Email'
          },
          {
            name: 'MobilePhone',
            type: 'string',
            label: 'Phone'
          },
          {
            name: 'CreatedOn',
            type: 'date',
            label: 'Created At'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'creatio', context);

          // Выполнение операции
          const { contactId } = params;
          const { instance, access_token } = context.auth;

          const contact = await contactsApi.getContact(instance, access_token, contactId, context);

          return contact;
        } catch (error) {
          throw new Error(`Error getting contact: ${error.message}`);
        }
      }
    },
    {
      name: 'createContact',
      label: 'Create Contact',
      description: 'Create a new contact',
      input: {
        fields: [
          {
            name: 'Name',
            type: 'string',
            label: 'Full Name',
            required: true
          },
          {
            name: 'Email',
            type: 'string',
            label: 'Email',
            required: false
          },
          {
            name: 'MobilePhone',
            type: 'string',
            label: 'Phone',
            required: false
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'Id',
            type: 'string',
            label: 'ID'
          },
          {
            name: 'Name',
            type: 'string',
            label: 'Full Name'
          },
          {
            name: 'Email',
            type: 'string',
            label: 'Email'
          },
          {
            name: 'MobilePhone',
            type: 'string',
            label: 'Phone'
          },
          {
            name: 'CreatedOn',
            type: 'date',
            label: 'Created At'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          await checkSubscription(context.auth.bpmCentrApiKey, 'creatio', context);
          const { instance, access_token } = context.auth;
          const contact = await contactsApi.createContact(instance, access_token, params, context);
          return contact;
        } catch (error) {
          throw new Error(`Error creating contact: ${error.message}`);
        }
      }
    },
    {
      name: 'getNewContacts',
      label: 'Get New Contacts',
      description: 'Get contacts created after a specific date',
      input: {
        fields: [
          {
            name: 'since',
            type: 'date',
            label: 'Created Since',
            required: false
          },
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
            name: 'Id',
            type: 'string',
            label: 'ID'
          },
          {
            name: 'Name',
            type: 'string',
            label: 'Full Name'
          },
          {
            name: 'Email',
            type: 'string',
            label: 'Email'
          },
          {
            name: 'MobilePhone',
            type: 'string',
            label: 'Phone'
          },
          {
            name: 'CreatedOn',
            type: 'date',
            label: 'Created At'
          }
        ]
      },
      poll: async function(params, context) {
        try {
          await checkSubscription(context.auth.bpmCentrApiKey, 'creatio', context);
          const { instance, access_token } = context.auth;
          const { since, maxResults } = params;
          const contacts = await contactsApi.getNewContacts(instance, access_token, since, maxResults, context);
          return contacts;
        } catch (error) {
          throw new Error(`Error polling for new contacts: ${error.message}`);
        }
      }
    }
  ],

  triggers: [
    // Триггеры для Creatio (например, новый контакт, обновление контакта)
  ]
};
```

### API-адаптер для работы с контактами

```javascript
// api/contacts-api.js
async function getContact(instance, accessToken, contactId, context) {
  try {
    const response = await context.http.get({
      url: `https://${instance}.creatio.com/0/ServiceModel/EntityDataService.svc/Contact(guid'${contactId}')`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.statusCode !== 200 || !response.body) {
      throw new Error('Failed to get contact');
    }
    return response.body;
  } catch (error) {
    throw new Error(`Error in getContact: ${error.message}`);
  }
}

async function createContact(instance, accessToken, contactData, context) {
  try {
    const response = await context.http.post({
      url: `https://${instance}.creatio.com/0/ServiceModel/EntityDataService.svc/Contact`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: contactData
    });
    if (response.statusCode !== 201 || !response.body) {
      throw new Error('Failed to create contact');
    }
    return response.body;
  } catch (error) {
    throw new Error(`Error in createContact: ${error.message}`);
  }
}

async function getNewContacts(instance, accessToken, since, maxResults, context) {
  try {
    let filter = '';
    if (since) {
      filter = `$filter=CreatedOn gt ${new Date(since).toISOString()}`;
    }
    const response = await context.http.get({
      url: `https://${instance}.creatio.com/0/ServiceModel/EntityDataService.svc/Contact?${filter}&$top=${maxResults || 10}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.statusCode !== 200 || !response.body) {
      throw new Error('Failed to get contacts');
    }
    return response.body.value;
  } catch (error) {
    throw new Error(`Error in getNewContacts: ${error.message}`);
  }
}

module.exports = {
  getContact,
  createContact,
  getNewContacts
};
```

### Утилита для проверки подписки

```javascript
// utils/subscription.js
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
    if (response.statusCode !== 200 || !response.body.active) {
      throw new Error('Subscription inactive or not found');
    }
    return true;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
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
