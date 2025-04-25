# Интеграция с Make API

В этом документе описывается процесс интеграции коннекторов Make с API платформы "BPM Centr".

## Обзор интеграции

Интеграция между коннекторами Make и платформой BPM Centr основана на следующих принципах:

1. Коннекторы разрабатываются на платформе Make согласно их официальной документации
2. Каждый коннектор должен проверять статус подписки пользователя через API BPM Centr
3. Коннектор должен регистрировать использование операций через API BPM Centr
4. Данные передаются напрямую между Make и целевыми системами без прохождения через серверы BPM Centr

## Процесс разработки коннектора

### 1. Регистрация в Make Developer Hub

1. Зарегистрируйтесь на [Make Developer Hub](https://www.make.com/en/developer-platform)
2. Создайте новый проект коннектора
3. Настройте базовую информацию о коннекторе (название, описание, иконка)

### 2. Настройка аутентификации

В настройках аутентификации коннектора необходимо добавить поле для API-ключа BPM Centr:

```json
{
  "name": "bpmCentrApiKey",
  "type": "text",
  "label": "BPM Centr API Key",
  "required": true,
  "help": "API key from your BPM Centr account to verify subscription"
}
```

### 3. Создание модулей и операций

При создании модулей и операций коннектора следуйте стандартной документации Make, но обязательно включите проверку подписки и регистрацию использования.

## Интеграция с API BPM Centr

### Проверка статуса подписки

Каждая операция коннектора должна начинаться с проверки статуса подписки пользователя. Для этого используется следующий эндпоинт:

**Endpoint**: `GET https://api.bpmcentr.ru/v1/subscription/check`

**Headers**:
```
Authorization: Bearer {bpmCentrApiKey}
```

**Query Parameters**:
```
connector: string (required) - Идентификатор коннектора
accountId: string (required) - Идентификатор аккаунта Make
```

**Пример запроса в Make**:

```javascript
// Функция для проверки подписки
async function checkSubscription(bpmCentrApiKey, connectorName, makeAccountId, context) {
  try {
    // Запрос к API BPM Centr для проверки подписки
    const response = await context.fetch({
      url: 'https://api.bpmcentr.ru/v1/subscription/check',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      },
      params: {
        connector: connectorName,
        accountId: makeAccountId
      }
    });

    // Проверка статуса ответа
    if (response.status !== 200) {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Subscription check failed');
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

    // Проверка привязки к аккаунту Make
    if (data.accountId !== makeAccountId) {
      throw new Error('This connector is linked to a different Make account. Please purchase a subscription for this account at BPM Centr.');
    }

    return data;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
}
```

### Регистрация использования операций

После успешного выполнения операции необходимо зарегистрировать её использование. Для этого используется следующий эндпоинт:

**Endpoint**: `POST https://api.bpmcentr.ru/v1/connector/usage`

**Headers**:
```
Authorization: Bearer {bpmCentrApiKey}
Content-Type: application/json
```

**Request Body**:
```json
{
  "connector": "connector-name",
  "operation": "operation-name",
  "timestamp": "2023-04-23T11:30:00Z"
}
```

**Пример запроса в Make**:

```javascript
// Функция для регистрации использования
async function registerUsage(bpmCentrApiKey, connectorName, operationName, context) {
  try {
    // Запрос к API BPM Centr для регистрации использования
    const response = await context.fetch({
      url: 'https://api.bpmcentr.ru/v1/connector/usage',
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
      const responseData = await response.json();
      throw new Error(responseData.message || 'Usage registration failed');
    }

    return true;
  } catch (error) {
    throw new Error(`Usage registration failed: ${error.message}`);
  }
}
```

## Пример реализации операции в Make

Ниже приведен пример реализации операции в Make с интеграцией API BPM Centr:

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

    // Получение идентификатора аккаунта Make
    const makeAccountId = this.makeAccountId; // Получаем из контекста Make

    try {
      // Проверка подписки
      await checkSubscription(bpmCentrApiKey, 'crm-connector', makeAccountId, this);

      // Выполнение запроса к CRM API
      const response = await this.fetch({
        url: `https://api.crm-system.com/v1/contacts/${contactId}`,
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      });

      // Проверка статуса ответа
      if (response.status !== 200) {
        throw new Error(`Failed to get contact: ${response.statusText}`);
      }

      // Парсинг ответа
      const contact = await response.json();

      // Регистрация использования
      await registerUsage(bpmCentrApiKey, 'crm-connector', 'getContact', this);

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

## Пример реализации триггера в Make

Ниже приведен пример реализации триггера в Make с интеграцией API BPM Centr:

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

    // Получение идентификатора аккаунта Make
    const makeAccountId = this.makeAccountId; // Получаем из контекста Make

    try {
      // Проверка подписки
      await checkSubscription(bpmCentrApiKey, 'crm-connector', makeAccountId, this);

      // Получение времени последнего запроса
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();

      // Выполнение запроса к CRM API
      const response = await this.fetch({
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

      // Проверка статуса ответа
      if (response.status !== 200) {
        throw new Error(`Failed to get contacts: ${response.statusText}`);
      }

      // Парсинг ответа
      const contacts = await response.json();

      // Сохранение времени последнего запроса
      if (contacts.length > 0) {
        const lastContact = contacts[contacts.length - 1];
        store.set('lastPollTime', lastContact.createdAt);
      }

      // Регистрация использования
      await registerUsage(bpmCentrApiKey, 'crm-connector', 'newContact', this);

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

## Автоматическое определение и привязка аккаунта Make

Для корректной работы системы подписок необходимо определять и привязывать коннекторы к конкретным аккаунтам Make. Это обеспечивает соблюдение модели "один коннектор = один аккаунт Make".

### Получение идентификатора аккаунта Make

Make предоставляет информацию об аккаунте через контекст выполнения операций. Для получения идентификатора аккаунта используйте следующий подход:

```javascript
// Получение идентификатора аккаунта Make из контекста
const makeAccountId = this.makeAccountId; // Доступно в контексте операций Make
```

Важно: Идентификатор аккаунта Make доступен только в контексте выполнения операций и триггеров. Он не доступен на этапе настройки коннектора.

### Процесс привязки коннектора к аккаунту Make

Привязка коннектора к аккаунту Make происходит автоматически при первом использовании:

1. При первом запросе к API BPM Centr для проверки подписки, если аккаунт Make еще не привязан, система автоматически привязывает коннектор к текущему аккаунту
2. Все последующие запросы проверяют соответствие текущего аккаунта Make тому, к которому привязан коннектор
3. Если коннектор используется в другом аккаунте Make, API возвращает ошибку с соответствующим сообщением

```javascript
// Пример проверки подписки с привязкой к аккаунту Make
async function checkSubscription(bpmCentrApiKey, connectorName, makeAccountId, context) {
  try {
    // Запрос к API BPM Centr для проверки подписки
    const response = await context.fetch({
      url: 'https://api.bpmcentr.ru/v1/subscription/check',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bpmCentrApiKey}`
      },
      params: {
        connector: connectorName,
        accountId: makeAccountId
      }
    });

    // Обработка ответа
    if (response.status !== 200) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Subscription check failed');
    }

    const subscriptionData = await response.json();

    // Проверка привязки к аккаунту Make
    if (subscriptionData.accountId && subscriptionData.accountId !== makeAccountId) {
      throw new Error('This connector is linked to a different Make account. Please purchase a subscription for this account at BPM Centr.');
    }

    return subscriptionData;
  } catch (error) {
    throw new Error(`Subscription check failed: ${error.message}`);
  }
}
```

### Смена аккаунта Make для коннектора

Если пользователю необходимо использовать коннектор в другом аккаунте Make, он может сменить привязку через личный кабинет BPM Centr:

1. Пользователь заходит в личный кабинет BPM Centr
2. Переходит в раздел "Подписки"
3. Выбирает нужный коннектор
4. Нажимает кнопку "Сменить аккаунт Make"
5. Вводит новый идентификатор аккаунта Make
6. Система автоматически отключает коннектор в предыдущем аккаунте и привязывает его к новому

После смены аккаунта коннектор будет работать только в новом аккаунте Make. Все сценарии в предыдущем аккаунте, использующие этот коннектор, перестанут работать.

## Обработка ошибок

При интеграции с API BPM Centr важно корректно обрабатывать возможные ошибки в соответствии с требованиями Make:

### Ошибки аутентификации и авторизации

1. **Ошибка аутентификации (401)** - Неверный API-ключ BPM Centr
   ```
   "Неверный API-ключ BPM Centr. Пожалуйста, проверьте ключ в настройках коннектора."
   ```
   - Рекомендуемое действие: Предложить пользователю проверить и обновить API-ключ в настройках коннектора

2. **Ошибка доступа (403)** - Неактивная или истекшая подписка
   ```
   "Ваша подписка неактивна или истекла. Пожалуйста, обновите подписку в личном кабинете BPM Centr."
   ```
   - Рекомендуемое действие: Направить пользователя в личный кабинет BPM Centr для обновления подписки

3. **Ошибка доступа к коннектору (403)** - Нет доступа к запрашиваемому коннектору
   ```
   "У вас нет доступа к этому коннектору. Пожалуйста, оформите подписку в личном кабинете BPM Centr."
   ```
   - Рекомендуемое действие: Направить пользователя в личный кабинет BPM Centr для оформления подписки

### Ошибки привязки к аккаунту Make

4. **Ошибка привязки к аккаунту (403)** - Коннектор привязан к другому аккаунту Make
   ```
   "Этот коннектор привязан к другому аккаунту Make. Пожалуйста, приобретите подписку для текущего аккаунта или смените привязку в личном кабинете BPM Centr."
   ```
   - Рекомендуемое действие: Предложить пользователю приобрести отдельную подписку для текущего аккаунта или сменить привязку в личном кабинете

5. **Ошибка определения аккаунта (400)** - Не удалось определить идентификатор аккаунта Make
   ```
   "Не удалось определить идентификатор аккаунта Make. Пожалуйста, убедитесь, что коннектор используется в сценарии Make."
   ```
   - Рекомендуемое действие: Проверить, что коннектор используется в сценарии Make, а не в тестовом режиме

### Ошибки сервера и сети

6. **Ошибка сервера (500)** - Внутренняя ошибка сервера
   ```
   "Произошла ошибка на сервере BPM Centr. Пожалуйста, попробуйте позже или обратитесь в службу поддержки."
   ```
   - Рекомендуемое действие: Предложить пользователю повторить попытку позже или обратиться в службу поддержки

7. **Ошибка сети (Network Error)** - Проблемы с подключением к серверу
   ```
   "Не удалось подключиться к серверу BPM Centr. Пожалуйста, проверьте подключение к интернету и повторите попытку."
   ```
   - Рекомендуемое действие: Предложить пользователю проверить подключение к интернету

8. **Ошибка превышения лимита запросов (429)** - Слишком много запросов
   ```
   "Превышен лимит запросов к API BPM Centr. Пожалуйста, повторите попытку позже."
   ```
   - Рекомендуемое действие: Реализовать механизм повторных попыток с экспоненциальной задержкой

### Рекомендации по обработке ошибок в Make

В соответствии с требованиями Make, сообщения об ошибках должны быть:

1. **Информативными** - Четко объяснять причину ошибки
2. **Действенными** - Предлагать конкретные шаги для решения проблемы
3. **Локализованными** - Доступными на русском и английском языках
4. **Краткими** - Не превышать 200 символов для лучшего отображения в интерфейсе Make

Пример реализации обработки ошибок в операции коннектора:

```javascript
try {
  // Код операции
} catch (error) {
  // Форматирование сообщения об ошибке
  let userFriendlyMessage;

  if (error.message.includes('Invalid API key')) {
    userFriendlyMessage = 'Неверный API-ключ BPM Centr. Проверьте ключ в настройках коннектора.';
  } else if (error.message.includes('subscription is inactive')) {
    userFriendlyMessage = 'Ваша подписка неактивна. Обновите подписку в личном кабинете BPM Centr.';
  } else if (error.message.includes('linked to a different Make account')) {
    userFriendlyMessage = 'Коннектор привязан к другому аккаунту Make. Смените привязку в личном кабинете BPM Centr.';
  } else {
    userFriendlyMessage = `Ошибка: ${error.message}`;
  }

  throw new Error(userFriendlyMessage);
}
```

## Тестирование интеграции

Для тестирования интеграции с API BPM Centr рекомендуется:

1. Создать тестовый API-ключ в личном кабинете BPM Centr
2. Использовать этот ключ при разработке и тестировании коннектора
3. Проверить различные сценарии:
   - Успешная проверка подписки
   - Неверный API-ключ
   - Истекшая подписка
   - Отсутствие доступа к коннектору

## Публикация коннектора

После разработки и тестирования коннектора необходимо:

1. Подготовить документацию по использованию коннектора
2. Отправить коннектор на проверку в BPM Centr
3. После одобрения, опубликовать коннектор в Make

## Часто задаваемые вопросы

### Как получить API-ключ BPM Centr?

API-ключ можно получить в личном кабинете BPM Centr в разделе "API-ключи". Для создания нового ключа нажмите кнопку "Создать API-ключ" и укажите его название.

### Как проверить статус подписки?

Статус подписки можно проверить в личном кабинете BPM Centr в разделе "Подписки". Там же можно увидеть информацию о всех активных коннекторах, датах окончания подписок и статистике использования.

### Как получить доступ к дополнительным коннекторам?

Для получения доступа к дополнительным коннекторам необходимо оформить подписку на нужные коннекторы в личном кабинете BPM Centr. Каждый коннектор оплачивается отдельно и привязывается к одному аккаунту Make.

### Как обновить коннектор?

Для обновления коннектора необходимо внести изменения в его код в Make Developer Hub, протестировать изменения и опубликовать новую версию коннектора.

### Как получить поддержку?

Если у вас возникли вопросы или проблемы с интеграцией, обратитесь в службу поддержки BPM Centr по адресу support@bpmcentr.ru или через форму обратной связи на сайте.
