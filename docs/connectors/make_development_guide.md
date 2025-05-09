# Руководство по разработке коннекторов для Make

В этом документе представлены рекомендации и лучшие практики по разработке коннекторов для платформы Make в рамках проекта "BPM Centr".

## Введение

Коннекторы для Make разрабатываются с использованием Make Developer Hub и должны соответствовать требованиям и стандартам как Make, так и BPM Centr. Это руководство поможет вам создавать качественные коннекторы, которые будут успешно интегрироваться с API BPM Centr и предоставлять пользователям удобный доступ к различным системам.

## Подготовка к разработке

### Необходимые аккаунты и доступы

1. **Аккаунт Make** - Зарегистрируйтесь на [Make](https://www.make.com/)
2. **Доступ к Make Developer Hub** - Запросите доступ к [Make Developer Hub](https://developers.make.com/)
3. **Аккаунт BPM Centr** - Зарегистрируйтесь на [BPM Centr](https://bpmcentr.com/)
4. **API-ключ BPM Centr** - Создайте API-ключ в личном кабинете BPM Centr
5. **Доступ к целевой системе** - Получите доступ к API системы, для которой разрабатывается коннектор

### Изучение документации

Перед началом разработки рекомендуется изучить следующую документацию:

1. [Документация Make Developer Hub](https://developers.make.com/custom-apps-documentation/)
2. [Спецификация API BPM Centr](../api/specification.md)
3. [Интеграция с Make API](../integrations/make_integration.md)
4. [Примеры использования API BPM Centr](../integrations/make_api_examples.md)
5. Документация API целевой системы

## Структура коннектора

Коннектор для Make должен иметь следующую структуру файлов:

```
my-connector/
├── app/
│   ├── app.json              # Основная конфигурация приложения
│   ├── base.json             # Базовая конфигурация (URL, авторизация)
│   ├── common.json           # Общие данные для всего приложения
│   ├── connections/          # Конфигурации подключений
│   │   ├── api_key.json      # Конфигурация API Key
│   │   ├── oauth2.json       # Конфигурация OAuth 2.0
│   │   └── ...
│   ├── modules/              # Модули коннектора
│   │   ├── actions/          # Модули действий
│   │   │   ├── get-item.json # Получение элемента
│   │   │   └── ...
│   │   ├── searches/         # Модули поиска
│   │   │   ├── list-items.json # Получение списка элементов
│   │   │   └── ...
│   │   ├── triggers/         # Модули триггеров
│   │   │   ├── new-item.json # Триггер новых элементов
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

Основные компоненты коннектора:

1. **Метаданные коннектора** (app.json) - Основная информация о коннекторе (название, описание, иконка)
2. **Конфигурация подключений** (connections/*.json) - Настройки для аутентификации в целевой системе и BPM Centr
3. **Модули** - Логические группы функциональности:
   - **Действия** (actions) - Операции, которые выполняют действия в целевой системе
   - **Поиск** (searches) - Операции для поиска и получения данных
   - **Триггеры** (triggers) - События, на которые может реагировать коннектор

## Требования к коннекторам

### Общие требования

1. **Соответствие стандартам Make** - Коннектор должен соответствовать всем требованиям и рекомендациям Make Developer Hub
2. **Интеграция с API BPM Centr** - Коннектор должен проверять статус подписки через API BPM Centr
3. **Безопасность** - Коннектор должен обеспечивать безопасную обработку данных и не хранить чувствительную информацию
4. **Производительность** - Коннектор должен быть оптимизирован для минимизации количества запросов и использования ресурсов
5. **Локализация** - Коннектор должен поддерживать русский и английский языки
6. **Документация** - Коннектор должен иметь подробную документацию и примеры использования

### Требования к конфигурации приложения (app.json)

```json
{
  "name": "my-connector",
  "label": "My Connector",
  "version": "1.0.0",
  "description": "Коннектор для My Service API",
  "language": "ru",
  "categories": ["crm", "marketing"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/my-connector"
}
```

### Требования к подключениям

1. **Поддержка API-ключа BPM Centr** - Коннектор должен включать поле для API-ключа BPM Centr в настройках подключения
2. **Безопасное хранение учетных данных** - Все чувствительные данные должны быть помечены как `sensitive`
3. **Тестирование подключения** - Коннектор должен проверять валидность учетных данных при настройке

Пример конфигурации подключения (connections/api_key.json):

```json
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
      "help": "Ваш API ключ для доступа к сервису"
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
      "url": "https://api.example.com/v1/test",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{connection.apiKey}}"
      }
    },
    "response": {
      "status": 200
    }
  }
}

### Функция проверки подписки

Для проверки статуса подписки в коннекторе необходимо создать IML функцию, которая будет вызываться при выполнении операций и триггеров. Обратите внимание, что для использования пользовательских IML функций может потребоваться связаться с поддержкой Make Developer Hub.

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

### Использование функции проверки подписки в модулях

Функция проверки подписки должна вызываться в каждом модуле коннектора (действия, поиск, триггеры) через секцию `wrapper` в конфигурации ответа.

Пример использования в модуле действия:

```json
// modules/actions/get-item.json
{
  "name": "getItem",
  "label": "Получить элемент",
  "description": "Получает информацию об элементе по ID",
  "connection": "api_key",

  "parameters": [
    {
      "name": "itemId",
      "type": "text",
      "label": "ID элемента",
      "required": true
    }
  ],

  "communication": {
    "url": "https://api.example.com/v1/items/{{parameters.itemId}}",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer {{connection.apiKey}}"
    },
    "response": {
      "output": {
        "id": "{{body.id}}",
        "name": "{{body.name}}",
        "description": "{{body.description}}",
        "price": "{{body.price}}",
        "created_at": "{{formatDate(body.created_at, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'my-connector')}}"
      }
    }
  },

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "name",
      "type": "text",
      "label": "Название"
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Описание"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена"
    },
    {
      "name": "created_at",
      "type": "date",
      "label": "Дата создания"
    }
  ]
}
```

### Обработка ошибок подписки

При проверке подписки могут возникать различные ошибки, которые необходимо корректно обрабатывать и предоставлять пользователю понятные сообщения с рекомендациями по их устранению.

Основные типы ошибок подписки:

1. **Неактивная подписка** - Возникает, когда подписка пользователя истекла или была отменена
2. **Нет доступа к коннектору** - Возникает, когда у пользователя нет подписки на данный коннектор
3. **Ошибка API BPM Centr** - Возникает при проблемах с доступом к API BPM Centr

Функция `checkSubscription` автоматически обрабатывает эти ошибки и возвращает понятные сообщения пользователю.

### Требования к модулям

1. **Проверка подписки** - Каждый модуль должен проверять статус подписки через функцию `checkSubscription`
2. **Обработка ошибок** - Модули должны корректно обрабатывать ошибки и предоставлять понятные сообщения
3. **Документация** - Каждый модуль должен иметь подробное описание, примеры использования и документацию
4. **Локализация** - Все сообщения и описания должны быть на русском языке

#### Требования к модулям действий (actions)

Пример модуля действия:

```json
// modules/actions/create-item.json
{
  "name": "createItem",
  "label": "Создать элемент",
  "description": "Создает новый элемент",
  "connection": "api_key",

  "parameters": [
    {
      "name": "name",
      "type": "text",
      "label": "Название",
      "required": true
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Описание",
      "required": false
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена",
      "required": true
    }
  ],

  "communication": {
    "url": "https://api.example.com/v1/items",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{connection.apiKey}}",
      "Content-Type": "application/json"
    },
    "body": {
      "name": "{{parameters.name}}",
      "description": "{{parameters.description}}",
      "price": "{{parameters.price}}"
    },
    "response": {
      "output": {
        "id": "{{body.id}}",
        "name": "{{body.name}}",
        "description": "{{body.description}}",
        "price": "{{body.price}}",
        "created_at": "{{formatDate(body.created_at, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'my-connector')}}"
      }
    }
  }
}
```

#### Требования к модулям поиска (searches)

Пример модуля поиска:

```json
// modules/searches/list-items.json
{
  "name": "listItems",
  "label": "Список элементов",
  "description": "Получает список элементов с возможностью фильтрации",
  "connection": "api_key",

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
    "url": "https://api.example.com/v1/items",
    "method": "GET",
    "params": {
      "q": "{{parameters.query}}",
      "limit": "{{parameters.maxResults}}"
    },
    "headers": {
      "Authorization": "Bearer {{connection.apiKey}}"
    },
    "response": {
      "iterate": "{{body.items}}",
      "output": {
        "id": "{{item.id}}",
        "name": "{{item.name}}",
        "description": "{{item.description}}",
        "price": "{{item.price}}",
        "created_at": "{{formatDate(item.created_at, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'my-connector')}}"
      }
    }
  }
}
```

#### Требования к модулям триггеров (triggers)

Пример модуля триггера:

```json
// modules/triggers/new-item.json
{
  "name": "newItem",
  "label": "Новый элемент",
  "description": "Срабатывает при создании нового элемента",
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
    "url": "https://api.example.com/v1/items",
    "method": "GET",
    "params": {
      "created_after": "{{state.lastPollTime}}",
      "limit": "{{parameters.maxResults}}",
      "sort": "created_at:asc"
    },
    "headers": {
      "Authorization": "Bearer {{connection.apiKey}}"
    },
    "response": {
      "iterate": "{{body.items}}",
      "output": {
        "id": "{{item.id}}",
        "name": "{{item.name}}",
        "description": "{{item.description}}",
        "price": "{{item.price}}",
        "created_at": "{{formatDate(item.created_at, 'YYYY-MM-DD')}}"
      },
      "state": {
        "lastPollTime": "{{formatDate(now(), 'YYYY-MM-DDTHH:mm:ss')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'my-connector')}}"
      }
    }
  }
}
```

## Процесс разработки

### 1. Планирование коннектора

1. **Определение целевой системы** - Выберите систему, для которой будет разрабатываться коннектор
2. **Анализ API** - Изучите API целевой системы и определите доступные операции
3. **Определение модулей** - Разделите функциональность на логические модули (действия, поиск, триггеры)
4. **Определение структуры файлов** - Спланируйте структуру файлов коннектора

### 2. Создание проекта в Make Developer Hub

1. **Создание нового проекта** - Создайте новый проект коннектора в Make Developer Hub
2. **Настройка метаданных** - Создайте файл app.json с метаданными коннектора
3. **Загрузка иконки** - Подготовьте иконку коннектора в формате PNG размером 64x64 пикселя

### 3. Настройка подключений

1. **Определение типа подключения** - Выберите подходящий тип подключения для целевой системы (API Key, OAuth 2.0, Basic Auth)
2. **Создание файла конфигурации подключения** - Создайте файл connections/api_key.json или другой в зависимости от типа подключения
3. **Добавление поля для API-ключа BPM Centr** - Добавьте поле для API-ключа BPM Centr
4. **Настройка тестирования подключения** - Настройте тестирование подключения
### 4. Создание функций

1. **Создание функции проверки подписки** - Создайте файл functions/subscription.js с функцией проверки подписки
2. **Тестирование функции** - Протестируйте функцию проверки подписки

#### Ограничения IML функций

При разработке IML функций необходимо учитывать следующие ограничения:

1. **Максимальное время выполнения** - 10 секунд
2. **Максимальное количество символов в числе** - 5000
3. **Доступные объекты** - Только встроенные объекты JavaScript и Buffer
4. **Доступные функции** - Все встроенные IML функции доступны через пространство имен `iml`, например `iml.parseDate()`

Для использования пользовательских IML функций может потребоваться связаться с поддержкой Make Developer Hub.

### 5. Реализация модулей действий

1. **Определение действий** - Определите, какие действия будут реализованы
2. **Создание файлов модулей** - Создайте файлы для каждого модуля действия в директории modules/actions/
3. **Настройка параметров** - Определите входные параметры для каждого действия
4. **Настройка коммуникации** - Настройте запросы к API целевой системы
5. **Добавление проверки подписки** - Добавьте вызов функции проверки подписки в wrapper

### 6. Реализация модулей поиска

1. **Определение поисковых операций** - Определите, какие поисковые операции будут реализованы
2. **Создание файлов модулей** - Создайте файлы для каждого модуля поиска в директории modules/searches/
3. **Настройка параметров** - Определите входные параметры для каждой поисковой операции
4. **Настройка коммуникации** - Настройте запросы к API целевой системы
5. **Добавление проверки подписки** - Добавьте вызов функции проверки подписки в wrapper

### 7. Реализация модулей триггеров

1. **Определение триггеров** - Определите, какие триггеры будут реализованы
2. **Создание файлов модулей** - Создайте файлы для каждого модуля триггера в директории modules/triggers/
3. **Настройка параметров** - Определите входные параметры для каждого триггера
4. **Настройка коммуникации** - Настройте запросы к API целевой системы
5. **Настройка состояния** - Настройте сохранение состояния для отслеживания новых данных
6. **Добавление проверки подписки** - Добавьте вызов функции проверки подписки в wrapper

### 8. Тестирование коннектора

1. **Локальное тестирование** - Протестируйте коннектор в локальной среде Make Developer Hub
2. **Тестирование подключения** - Проверьте корректность работы подключения
3. **Тестирование модулей** - Проверьте корректность работы всех модулей
4. **Тестирование проверки подписки** - Проверьте корректность проверки подписки
5. **Тестирование обработки ошибок** - Проверьте корректность обработки различных ошибок
6. **Тестирование IML функций** - Используйте инструменты отладки IML функций в Make Developer Hub

#### Отладка IML функций

Make Developer Hub предоставляет инструменты для отладки IML функций:

1. **Отладка в веб-браузере** - Используйте инструменты разработчика в браузере для отладки IML функций
2. **Отладка в VS Code** - Используйте расширение Make для VS Code для отладки IML функций
3. **Логирование** - Используйте `console.log()` для вывода отладочной информации

Для более подробной информации об отладке IML функций обратитесь к документации Make Developer Hub.

### 9. Документирование коннектора

1. **Создание документации** - Создайте подробную документацию по использованию коннектора
2. **Описание модулей** - Опишите все модули, их параметры и результаты
3. **Примеры использования** - Приведите примеры использования коннектора в различных сценариях
4. **Рекомендации по устранению ошибок** - Опишите возможные ошибки и способы их устранения

### 10. Публикация коннектора

1. **Подготовка к публикации** - Убедитесь, что коннектор соответствует всем требованиям
2. **Отправка на проверку** - Отправьте коннектор на проверку в BPM Centr
3. **Исправление замечаний** - Исправьте замечания, полученные в результате проверки
4. **Публикация** - После одобрения опубликуйте коннектор в Make

## Лучшие практики

### Оптимизация производительности

1. **Минимизация количества запросов** - Старайтесь минимизировать количество запросов к API
2. **Использование параметров запросов** - Используйте параметры запросов для фильтрации данных на стороне сервера
3. **Пакетная обработка** - Используйте пакетную обработку для операций, которые могут быть выполнены одним запросом
4. **Оптимизация размера данных** - Запрашивайте только необходимые поля и данные

### Обработка ошибок

1. **Детальные сообщения об ошибках** - Предоставляйте понятные и информативные сообщения об ошибках
2. **Рекомендации по устранению ошибок** - Включайте рекомендации по устранению ошибок в сообщения
3. **Обработка различных типов ошибок** - Корректно обрабатывайте различные типы ошибок (сетевые, аутентификации, доступа)
4. **Проверка входных данных** - Проверяйте корректность входных данных перед отправкой запросов

### Безопасность

1. **Безопасная обработка учетных данных** - Помечайте чувствительные данные как `sensitive`
2. **Использование HTTPS** - Всегда используйте HTTPS для запросов
3. **Минимальные привилегии** - Запрашивайте только необходимые привилегии
4. **Валидация входных данных** - Проверяйте и валидируйте все входные данные

### Локализация

1. **Поддержка русского языка** - Обеспечьте поддержку русского языка для всех сообщений и описаний
2. **Локализация сообщений об ошибках** - Локализуйте сообщения об ошибках
3. **Локализация документации** - Предоставляйте документацию на русском языке

## Часто задаваемые вопросы

### Как получить доступ к Make Developer Hub?

Для получения доступа к Make Developer Hub необходимо зарегистрироваться на [Make](https://www.make.com/) и запросить доступ к [Developer Hub](https://developers.make.com/) через форму на сайте.

### Как получить API-ключ BPM Centr?

API-ключ BPM Centr можно получить в личном кабинете BPM Centr в разделе "API-ключи". Для создания нового ключа нажмите кнопку "Создать API-ключ" и укажите его название.

### Как тестировать коннектор?

Для тестирования коннектора можно использовать локальную среду Make Developer Hub. Создайте тестовый сценарий, добавьте в него ваш коннектор и выполните операции или триггеры.

### Как обрабатывать ошибки API BPM Centr?

При обработке ошибок API BPM Centr рекомендуется проверять статус ответа и предоставлять понятные сообщения об ошибках. Функция `checkSubscription` автоматически обрабатывает ошибки и возвращает понятные сообщения пользователю.

### Как отлаживать IML функции?

Make Developer Hub предоставляет несколько способов отладки IML функций:

1. **Отладка в веб-браузере** - Используйте инструменты разработчика в браузере для отладки IML функций
2. **Отладка в VS Code** - Используйте расширение Make для VS Code для отладки IML функций
3. **Логирование** - Используйте `console.log()` для вывода отладочной информации

Для более подробной информации об отладке IML функций обратитесь к документации Make Developer Hub.

### Какие типы модулей можно создавать в коннекторе?

В коннекторе можно создавать следующие типы модулей:
1. **Действия (actions)** - Операции, которые выполняют действия в целевой системе
2. **Поиск (searches)** - Операции для поиска и получения данных
3. **Триггеры (triggers)** - События, на которые может реагировать коннектор (опрос)
4. **Мгновенные триггеры (instant_triggers)** - События, которые срабатывают мгновенно при получении webhook-запроса
5. **Универсальные модули (universal)** - Модули для выполнения произвольных API-запросов (REST или GraphQL)
6. **Ответчики (responders)** - Модули для отправки обработанных данных обратно в webhook

## Заключение

Разработка коннекторов для Make в рамках проекта "BPM Centr" требует соблюдения определенных требований и стандартов. Следуя рекомендациям и лучшим практикам, описанным в этом руководстве, вы сможете создавать качественные коннекторы, которые будут успешно интегрироваться с API BPM Centr и предоставлять пользователям удобный доступ к различным системам.

Для получения дополнительной информации обратитесь к документации по [интеграции с Make API](../integrations/make_integration.md), [примерам использования API BPM Centr](../integrations/make_api_examples.md) и [спецификации API](../api/specification.md).
