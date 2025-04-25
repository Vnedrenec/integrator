# Разработка коннекторов для Make

В этом документе описывается процесс разработки коннекторов для платформы Make в рамках проекта "BPM Centr".

## Жизненный цикл разработки коннектора

### 1. Планирование

- **Определение требований к коннектору**
  - Какие функции должен выполнять коннектор
  - Какие модули, операции и триггеры должны быть реализованы
  - Какие данные будут передаваться

- **Изучение API внешнего сервиса**
  - Документация API
  - Методы аутентификации
  - Ограничения и лимиты API
  - Форматы данных

- **Оценка трудозатрат**
  - Сложность реализации
  - Необходимые ресурсы
  - Сроки разработки

### 2. Проектирование

- **Разработка архитектуры коннектора**
  - Определение модулей и их взаимосвязей
  - Проектирование интерфейсов
  - Определение структуры данных

- **Определение структуры модулей, операций и триггеров**
  - Группировка функциональности по модулям
  - Определение входных и выходных параметров операций
  - Определение условий срабатывания триггеров

- **Проектирование интерфейса пользователя**
  - Определение полей ввода и их валидации
  - Проектирование подсказок и описаний
  - Определение порядка полей и их группировки

- **Определение стратегии аутентификации**
  - Выбор метода аутентификации (API Key, OAuth, Basic Auth)
  - Определение необходимых полей для аутентификации
  - Проектирование процесса проверки подписки

### 3. Разработка

- **Настройка окружения разработки**
  - Установка необходимых инструментов
  - Настройка проекта
  - Настройка тестового окружения

- **Реализация адаптера для внешнего API**
  - Разработка функций для взаимодействия с API
  - Реализация аутентификации
  - Обработка ответов API

- **Разработка модулей, операций и триггеров**
  - Реализация логики операций
  - Реализация логики триггеров
  - Интеграция с адаптером API

- **Реализация механизма проверки подписки**
  - Интеграция с API управления подписками BPM Centr
  - Реализация проверки статуса подписки
  - Реализация ограничения доступа при неактивной подписке

- **Реализация обработки ошибок**
  - Обработка ошибок API
  - Обработка ошибок аутентификации
  - Обработка ошибок проверки подписки
  - Предоставление понятных сообщений об ошибках

- **Оптимизация производительности**
  - Минимизация количества запросов к API
  - Оптимизация обработки данных
  - Реализация кэширования

### 4. Тестирование

- **Модульное тестирование**
  - Тестирование отдельных компонентов коннектора
  - Проверка корректности обработки данных
  - Тестирование обработки ошибок

- **Интеграционное тестирование**
  - Тестирование взаимодействия с API BPM Centr
  - Тестирование взаимодействия с внешним API
  - Проверка корректности преобразования данных

- **Функциональное тестирование**
  - Тестирование полного цикла работы коннектора
  - Проверка соответствия требованиям
  - Тестирование пользовательских сценариев

- **Нагрузочное тестирование**
  - Тестирование производительности при высокой нагрузке
  - Определение предельных возможностей
  - Оптимизация производительности

### 5. Документирование

- **Создание документации для разработчиков**
  - Описание архитектуры коннектора
  - Описание API и интерфейсов
  - Инструкции по расширению функциональности

- **Создание руководства пользователя**
  - Инструкции по настройке коннектора
  - Описание операций и триггеров
  - Примеры использования

- **Подготовка примеров использования**
  - Создание типовых сценариев использования
  - Подготовка примеров конфигурации
  - Создание демонстрационных сценариев

### 6. Публикация

- **Подготовка коннектора к публикации**
  - Проверка соответствия требованиям Make Developer Hub
  - Подготовка метаданных коннектора
  - Финальное тестирование

- **Публикация в Make Developer Hub**
  - Создание профиля разработчика
  - Загрузка коннектора
  - Заполнение информации о коннекторе
  - Отправка на проверку

- **Анонс выпуска коннектора**
  - Публикация информации о новом коннекторе
  - Обновление документации
  - Информирование пользователей

## Требования к разработке коннекторов

### Функциональные требования

1. **Поддержка всех основных операций внешнего API**
   - Реализация основных CRUD-операций
   - Поддержка специфических операций API
   - Реализация поиска и фильтрации

2. **Обработка ошибок и исключительных ситуаций**
   - Корректная обработка ошибок API
   - Предоставление понятных сообщений об ошибках
   - Логирование ошибок для отладки

3. **Поддержка пагинации для больших наборов данных**
   - Реализация постраничной загрузки данных
   - Поддержка курсорной пагинации
   - Оптимизация работы с большими объемами данных

4. **Оптимизация запросов для минимизации использования API**
   - Минимизация количества запросов
   - Использование пакетных операций
   - Кэширование результатов

5. **Интеграция с системой управления подписками BPM Centr**
   - Проверка статуса подписки перед выполнением операций
   - Ограничение доступа при неактивной подписке
   - Учет использования для биллинга

### Нефункциональные требования

1. **Производительность**
   - Время отклика не более 1 секунды для стандартных операций
   - Оптимальное использование ресурсов
   - Эффективная обработка больших объемов данных

2. **Надежность**
   - Обработка временных сбоев и повторные попытки
   - Корректная обработка ошибок сети
   - Устойчивость к некорректным входным данным

3. **Безопасность**
   - Защита конфиденциальных данных
   - Безопасное хранение учетных данных
   - Соответствие требованиям безопасности Make

4. **Масштабируемость**
   - Поддержка большого количества запросов
   - Эффективное использование ресурсов
   - Оптимизация для работы с большими объемами данных

### Требования к коду

1. **Соответствие стандартам кодирования**
   - Следование стилю кодирования JavaScript/TypeScript
   - Использование современных языковых возможностей
   - Соблюдение принципов чистого кода

2. **Модульность и переиспользуемость компонентов**
   - Разделение кода на логические модули
   - Использование общих компонентов
   - Минимизация дублирования кода

3. **Покрытие тестами**
   - Покрытие тестами не менее 80%
   - Тестирование основных сценариев использования
   - Тестирование обработки ошибок

4. **Документирование кода**
   - Комментирование сложных участков кода
   - Документирование публичных API
   - Использование JSDoc/TSDoc

## Инструменты разработки

1. **Make Developer Hub** - платформа для разработки и публикации коннекторов
2. **Make SDK** - набор инструментов для разработки коннекторов
3. **Node.js и npm** - среда выполнения и менеджер пакетов
4. **TypeScript** - типизированный JavaScript
5. **Jest** - фреймворк для тестирования JavaScript/TypeScript
6. **Postman** - инструмент для тестирования API
7. **Swagger/OpenAPI** - инструменты для документирования API
8. **Git** - система контроля версий

## Структура проекта коннектора

```
connector-project/
├── src/
│   ├── index.js              # Основной файл коннектора
│   ├── auth.js               # Конфигурация аутентификации
│   ├── modules/              # Модули коннектора
│   │   ├── contacts.js       # Модуль для работы с контактами
│   │   ├── deals.js          # Модуль для работы со сделками
│   │   └── ...
│   ├── api/                  # Адаптеры для внешнего API
│   │   ├── client.js         # Клиент для работы с API
│   │   ├── contacts-api.js   # API для работы с контактами
│   │   ├── deals-api.js      # API для работы со сделками
│   │   └── ...
│   ├── utils/                # Утилиты
│   │   ├── subscription.js   # Утилиты для проверки подписки
│   │   ├── error-handler.js  # Обработка ошибок
│   │   └── ...
│   └── constants.js          # Константы
├── assets/                   # Ресурсы
│   ├── icon.png              # Иконка коннектора
│   └── ...
├── tests/                    # Тесты
│   ├── unit/                 # Модульные тесты
│   │   ├── modules/          # Тесты модулей
│   │   ├── api/              # Тесты API
│   │   └── ...
│   ├── integration/          # Интеграционные тесты
│   └── ...
├── docs/                     # Документация
│   ├── README.md             # Основная документация
│   ├── USAGE.md              # Руководство по использованию
│   └── ...
├── package.json              # Конфигурация npm
├── tsconfig.json             # Конфигурация TypeScript
├── jest.config.js            # Конфигурация Jest
└── README.md                 # Описание проекта
```

## Пример реализации коннектора

### Основной файл коннектора

```javascript
// index.js
const auth = require('./auth');
const contactsModule = require('./modules/contacts');
const dealsModule = require('./modules/deals');

module.exports = {
  name: 'MyConnector',
  label: 'My Connector',
  description: 'Connector for My Service',
  icon: './assets/icon.png',
  version: '1.0.0',
  authentication: auth,
  modules: [
    contactsModule,
    dealsModule,
    // Другие модули
  ]
};
```

### Конфигурация аутентификации

```javascript
// auth.js
module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizationUrl: 'https://api.example.com/oauth/authorize',
    tokenUrl: 'https://api.example.com/oauth/token',
    scope: ['read', 'write'],
    pkce: true
  },
  fields: [
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
};
```

### Модуль коннектора

```javascript
// modules/contacts.js
const { checkSubscription } = require('../utils/subscription');
const contactsApi = require('../api/contacts-api');

module.exports = {
  name: 'contacts',
  label: 'Contacts',
  description: 'Work with contacts in the CRM',
  
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
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'my-connector', context);
          
          // Выполнение операции
          const { contactId } = params;
          const contact = await contactsApi.getContact(contactId, context);
          
          return contact;
        } catch (error) {
          throw new Error(`Error getting contact: ${error.message}`);
        }
      }
    },
    // Другие операции
  ],
  
  triggers: [
    {
      name: 'newContact',
      label: 'New Contact',
      description: 'Triggers when a new contact is created',
      type: 'polling',
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
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'my-connector', context);
          
          // Выполнение операции
          const { maxResults } = params;
          const { lastPollTime } = context.state;
          
          const contacts = await contactsApi.getNewContacts(lastPollTime, maxResults, context);
          
          // Сохранение времени последнего опроса
          if (contacts.length > 0) {
            const lastContact = contacts[contacts.length - 1];
            context.state.lastPollTime = lastContact.createdAt;
          }
          
          return contacts;
        } catch (error) {
          throw new Error(`Error polling for new contacts: ${error.message}`);
        }
      }
    },
    // Другие триггеры
  ]
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
    
    // Проверка результата
    if (response.statusCode !== 200 || !response.body.active) {
      throw new Error('Your subscription is inactive or expired. Please renew your subscription at BPM Centr.');
    }
    
    return true;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
}

module.exports = {
  checkSubscription
};
```

### Адаптер для API

```javascript
// api/contacts-api.js
async function getContact(contactId, context) {
  try {
    const response = await context.http.get({
      url: `https://api.example.com/contacts/${contactId}`,
      headers: {
        'Authorization': `Bearer ${context.auth.access_token}`
      }
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Failed to get contact: ${response.body.error || 'Unknown error'}`);
    }
    
    return mapContactResponse(response.body);
  } catch (error) {
    throw new Error(`Error in getContact: ${error.message}`);
  }
}

async function getNewContacts(lastPollTime, maxResults, context) {
  try {
    const response = await context.http.get({
      url: 'https://api.example.com/contacts',
      headers: {
        'Authorization': `Bearer ${context.auth.access_token}`
      },
      params: {
        created_after: lastPollTime,
        limit: maxResults,
        sort: 'created_at',
        order: 'asc'
      }
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Failed to get contacts: ${response.body.error || 'Unknown error'}`);
    }
    
    return response.body.contacts.map(mapContactResponse);
  } catch (error) {
    throw new Error(`Error in getNewContacts: ${error.message}`);
  }
}

function mapContactResponse(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    createdAt: new Date(data.created_at).toISOString()
  };
}

module.exports = {
  getContact,
  getNewContacts
};
```

## Лучшие практики

### Проектирование API

1. **Следуйте принципам REST API**
   - Используйте стандартные HTTP-методы (GET, POST, PUT, DELETE)
   - Используйте понятные URL-пути
   - Возвращайте соответствующие HTTP-коды ответов

2. **Используйте понятные и консистентные имена**
   - Следуйте единому стилю именования
   - Используйте понятные и описательные имена
   - Будьте консистентны в терминологии

3. **Документируйте API**
   - Используйте OpenAPI/Swagger для документирования
   - Описывайте все параметры и возвращаемые значения
   - Приводите примеры запросов и ответов

4. **Версионируйте API**
   - Используйте семантическое версионирование
   - Обеспечивайте обратную совместимость
   - Документируйте изменения между версиями

### Обработка ошибок

1. **Используйте стандартные HTTP-коды ошибок**
   - 400 Bad Request - некорректные входные данные
   - 401 Unauthorized - ошибка аутентификации
   - 403 Forbidden - недостаточно прав
   - 404 Not Found - ресурс не найден
   - 429 Too Many Requests - превышен лимит запросов
   - 500 Internal Server Error - внутренняя ошибка сервера

2. **Предоставляйте информативные сообщения об ошибках**
   - Включайте описание ошибки
   - Указывайте причину ошибки
   - Предлагайте возможные решения

3. **Логируйте ошибки с контекстом**
   - Записывайте детали ошибок
   - Включайте контекст выполнения
   - Не логируйте чувствительные данные

4. **Реализуйте механизм повторных попыток**
   - Повторяйте запросы при временных ошибках
   - Используйте экспоненциальную задержку
   - Ограничивайте количество попыток

### Производительность

1. **Используйте кэширование**
   - Кэшируйте токены аутентификации
   - Кэшируйте результаты частых запросов
   - Используйте механизмы инвалидации кэша

2. **Оптимизируйте запросы к API**
   - Запрашивайте только необходимые данные
   - Используйте пагинацию для больших наборов данных
   - Минимизируйте количество запросов

3. **Используйте пакетную обработку**
   - Группируйте несколько операций в один запрос
   - Используйте массовые операции, если они поддерживаются API
   - Оптимизируйте обработку больших объемов данных

4. **Мониторьте производительность**
   - Отслеживайте время выполнения операций
   - Выявляйте узкие места
   - Оптимизируйте критические участки

### Безопасность

1. **Используйте HTTPS для всех коммуникаций**
   - Шифруйте все передаваемые данные
   - Проверяйте SSL-сертификаты
   - Не допускайте незащищенных соединений

2. **Не храните секреты в коде**
   - Используйте переменные окружения
   - Используйте хранилища секретов
   - Не коммитьте секреты в репозиторий

3. **Валидируйте все входные данные**
   - Проверяйте типы и форматы данных
   - Экранируйте специальные символы
   - Защищайтесь от инъекций

4. **Следуйте принципу наименьших привилегий**
   - Запрашивайте только необходимые права доступа
   - Ограничивайте доступ к функциональности
   - Используйте токены с ограниченным сроком действия

## Связанные разделы

- [Обзор коннекторов](overview.md)
- [Структура коннекторов](structure.md)
- [Тестирование коннекторов](testing.md)
- [Управление подписками](../subscription/overview.md)
