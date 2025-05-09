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

## Структура проекта коннектора в Make

В Make коннекторы разрабатываются с использованием JSON-конфигурации, которая определяет все аспекты коннектора. Разработка может вестись как в веб-интерфейсе Make, так и с использованием расширения для Visual Studio Code.

### Структура проекта при использовании VS Code

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
│   │   │   ├── update.json   # Модуль обновления ресурса
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
│   │   ├── dynamic-options.json # Динамические опции
│   │   └── ...
│   └── functions/            # Пользовательские IML функции
│       ├── subscription.js   # Функция проверки подписки
│       └── ...
├── assets/                   # Ресурсы
│   └── icon.png              # Иконка коннектора
└── package.json              # Метаданные проекта
```

### Основные компоненты коннектора

1. **app.json** - Основной файл с метаданными приложения (имя, описание, версия)
2. **base.json** - Базовая конфигурация для API (базовый URL, обработка ошибок)
3. **connections/** - Конфигурации для различных типов подключений (OAuth, API Key и т.д.)
4. **modules/** - Модули коннектора, разделенные по типам (actions, searches, triggers)
5. **rpcs/** - Удаленные вызовы процедур для динамического контента
6. **functions/** - Пользовательские JavaScript функции для сложной логики

## Примеры реализации коннектора в Make

В Make коннекторы разрабатываются с использованием JSON-конфигурации. Ниже приведены примеры основных компонентов коннектора.

### Основная конфигурация приложения (app.json)

```json
{
  "name": "mycrm",
  "label": "MyCRM",
  "version": "1.0.0",
  "description": "Интеграция с MyCRM для управления контактами и сделками",
  "language": "ru",
  "categories": ["crm", "sales"],
  "icon": "app.png"
}
```

### Базовая конфигурация (base.json)

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

### Конфигурация OAuth 2.0 (connections/oauth2.json)

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

### Модуль действия (modules/actions/get-contact.json)

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
    "url": "/contacts/{{parameters.contactId}}",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{connection.access_token}}"
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
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'mycrm')}}"
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

### Модуль поиска (modules/searches/list-contacts.json)

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
      "Authorization": "Bearer {{connection.access_token}}"
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

### Модуль триггера (modules/triggers/new-contact.json)

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
    "url": "/contacts",
    "method": "GET",
    "params": {
      "created_after": "{{formatDate(state.lastPollTime, 'YYYY-MM-DDTHH:mm:ss')}}",
      "limit": "{{parameters.maxResults}}",
      "sort": "created_at",
      "order": "asc"
    },
    "headers": {
      "Authorization": "Bearer {{connection.access_token}}"
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

### Пользовательская IML функция для проверки подписки (functions/subscription.js)

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
