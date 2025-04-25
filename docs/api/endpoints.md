# API Endpoints

Этот файл содержит полный перечень и описание API-эндпоинтов системы "BPM Centr".

## API Versioning
Base URL: `/api/v1`
Все эндпоинты доступны по пути `/api/v1/...`

## Аутентификация
### POST /api/v1/auth/register
**Описание**: Регистрация нового пользователя

**Метод**: POST
**URL**: `/api/v1/auth/register`

**Body Parameters**:
| Поле      | Тип     | Обязательный | Описание                    | Валидатор        |
|-----------|---------|--------------|-----------------------------|------------------|
| email     | string  | да           | Email пользователя          | format: email    |
| password  | string  | да           | Пароль (мин. 8 символов)    | minLength: 8     |
| firstName | string  | да           | Имя                         | не пустая строка |
| lastName  | string  | да           | Фамилия                     | не пустая строка |

**Пример запроса**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Иван",
  "lastName": "Иванов"
}
```

**Успешный ответ** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "createdAt": "2025-04-17T00:00:00Z"
}
```

**Коды ошибок**:
- 400 Bad Request — Ошибка валидации

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

- 409 Conflict — Пользователь с таким email уже существует

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### POST /api/v1/auth/login
**Описание**: Вход пользователя в систему

**Метод**: POST
**URL**: `/api/v1/auth/login`

**Body Parameters**:
| Поле     | Тип     | Обязательный | Описание             |
|----------|---------|--------------|----------------------|
| email    | string  | да           | Email пользователя   |
| password | string  | да           | Пароль               |

**Пример запроса**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Успешный ответ** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTY4MjYwOTYwMCwiZXhwIjoxNjgyNjEwNTAwfQ.signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJqdGkiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjgyNjA5NjAwLCJleHAiOjE2ODMyMTQ0MDB9.signature",
  "expiresIn": 900
}
```

**Коды ошибок**:
- 400 Bad Request — Ошибка валидации

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

- 401 Unauthorized — Неверные учетные данные

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### POST /api/v1/auth/logout
**Описание**: Выход пользователя из системы

**Метод**: POST
**URL**: `/api/v1/auth/logout`

### POST /api/v1/auth/forgot-password
**Описание**: Запрос на восстановление пароля

**Метод**: POST
**URL**: `/api/v1/auth/forgot-password`

### POST /api/v1/auth/reset-password
**Описание**: Сброс пароля

**Метод**: POST
**URL**: `/api/v1/auth/reset-password`

### GET /api/v1/auth/verify-email/:token
**Описание**: Подтверждение email

**Метод**: GET
**URL**: `/api/v1/auth/verify-email/:token`

## Пользователи

### GET /api/v1/users/me
**Описание**: Получение информации о текущем пользователе

**Метод**: GET
**URL**: `/api/v1/users/me`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Успешный ответ** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Имя",
  "lastName": "Фамилия",
  "company": "Компания",
  "phone": "+7..."
}
```

**Коды ошибок**:
- 401 Unauthorized — Токен не передан или недействителен

### PUT /api/v1/users/me
**Описание**: Обновление профиля текущего пользователя

**Метод**: PUT
**URL**: `/api/v1/users/me`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Body Parameters**:
| Поле       | Тип    | Обязательный | Описание           |
|------------|--------|--------------|--------------------|
| firstName  | string | нет          | Имя                |
| lastName   | string | нет          | Фамилия            |
| company    | string | нет          | Компания           |
| phone      | string | нет          | Телефон            |

**Успешный ответ** (200):
```json
{ "message": "Профиль обновлен" }
```

**Коды ошибок**:
- 400 Bad Request — Ошибка валидации
- 401 Unauthorized — Токен недействителен

### GET /api/v1/users/{id}
**Описание**: Получение данных пользователя по ID (только для админов)

**Метод**: GET
**URL**: `/api/v1/users/{id}`

**Headers**:
| Имя           | Обязательный | Описание      |
|---------------|--------------|---------------|
| Authorization | да           | Bearer {token}|

**Путь**:
| Параметр | Тип   | Описание    |
|----------|-------|-------------|
| id       | uuid  | ID пользователя |

**Успешный ответ** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  ...
}
```

### PUT /api/v1/users/{id}
**Описание**: Обновление данных пользователя (только для админов)

### DELETE /api/v1/users/{id}
**Описание**: Удаление пользователя (только для админов)

## Подписки

### GET /api/v1/subscriptions/me
**Описание**: Получение информации о подписке текущего пользователя

**Метод**: GET
**URL**: `/api/v1/subscriptions/me`

**Headers**:
| Имя           | Обязательный | Описание       |
|---------------|--------------|----------------|
| Authorization | да           | Bearer {token} |

**Успешный ответ** (200):
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "status": "active",
      "connectorId": "conn_standard_1",
      "makeAccountId": "make_account_1",
      "startDate": "2025-04-01T00:00:00Z",
      "endDate": "2025-05-01T00:00:00Z"
    }
  ]
}
```

**Коды ошибок**:
- 401 Unauthorized — Токен не передан или недействителен

### POST /api/v1/subscriptions/cancel
**Описание**: Отмена текущей подписки (удержание доступа до конца оплаченного периода)

**Метод**: POST
**URL**: `/api/v1/subscriptions/cancel`

**Headers**:
| Имя           | Обязательный | Описание       |
|---------------|--------------|----------------|
| Authorization | да           | Bearer {token} |

**Успешный ответ** (200):
```json
{ "message": "Подписка отменена" }
```

**Коды ошибок**:
- 400 Bad Request — Нет активной подписки
- 401 Unauthorized — Токен недействителен

### POST /api/v1/subscriptions/resume
**Описание**: Возобновление отменённой подписки

**Метод**: POST
**URL**: `/api/v1/subscriptions/resume`

**Headers**:
| Имя           | Обязательный | Описание       |
|---------------|--------------|----------------|
| Authorization | да           | Bearer {token} |

**Успешный ответ** (200):
```json
{ "message": "Подписка возобновлена" }
```

### GET /api/v1/subscriptions
**Описание**: Список подписок (только для админов)

**Метод**: GET
**URL**: `/api/v1/subscriptions`

**Headers**:
| Имя           | Обязательный | Описание       |
|---------------|--------------|----------------|
| Authorization | да           | Bearer {token} |

**Успешный ответ** (200):
```json
[
  { "id": "uuid", "userId": "uuid", "status": "active" },
  ...
]
```

### GET /api/v1/subscriptions/{id}
**Описание**: Детали подписки по ID (только для админов)

**Метод**: GET
**URL**: `/api/v1/subscriptions/{id}`

**Путь**:
| Параметр | Тип   | Описание       |
|----------|-------|----------------|
| id       | uuid  | ID подписки    |

**Успешный ответ** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "connectorId": "conn_standard_1",
  "makeAccountId": "make_account_1",
  "status": "active",
  "startDate": "2025-04-01T00:00:00Z",
  "endDate": "2025-05-01T00:00:00Z"
}
```

### PUT /api/v1/subscriptions/{id}
**Описание**: Обновление параметров подписки (только для админов)

### DELETE /api/v1/subscriptions/{id}
**Описание**: Удаление подписки (только для админов)

## Платежи

### GET /api/v1/payments/me
**Описание**: Получение истории платежей текущего пользователя

**Метод**: GET
**URL**: `/api/v1/payments/me`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Успешный ответ** (200):
```json
[
  { "id": "uuid", "subscriptionId": "uuid", "amount": 10.00, "currency": "USD", "status": "success", "createdAt": "2025-04-01T12:00:00Z" },
  ...
]
```

**Коды ошибок**:
- 401 Unauthorized — Токен не передан или недействителен

### POST /api/v1/payments/update-payment-method
**Описание**: Обновление способа оплаты текущего пользователя

**Метод**: POST
**URL**: `/api/v1/payments/update-payment-method`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Body Parameters**:
| Поле          | Тип    | Обязательный | Описание                        |
|---------------|--------|--------------|---------------------------------|
| paymentMethod | string | да           | Новый способ оплаты (Stripe/PayPal) |

**Успешный ответ** (200):
```json
{ "message": "Способ оплаты обновлен" }
```

**Коды ошибок**:
- 400 Bad Request — Ошибка валидации
- 401 Unauthorized — Токен недействителен

### GET /api/v1/payments
**Описание**: Получение списка всех платежей (только для админов)

**Метод**: GET
**URL**: `/api/v1/payments`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Успешный ответ** (200):
```json
[
  { "id": "uuid", "userId": "uuid", "amount": 10.00, "status": "success" },
  ...
]
```

### GET /api/v1/payments/{id}
**Описание**: Получение информации о платеже по ID (только для админов)

**Метод**: GET
**URL**: `/api/v1/payments/{id}`

**Путь**:
| Параметр | Тип   | Описание   |
|----------|-------|------------|
| id       | uuid  | ID платежа |

**Успешный ответ** (200):
```json
{ "id": "uuid", "userId": "uuid", "subscriptionId": "uuid", "amount": 10.00, "currency": "USD", "status": "success", "createdAt": "2025-04-01T12:00:00Z" }
```

## API-ключи

### GET /api/v1/api-keys
**Описание**: Получение списка API-ключей текущего пользователя

**Метод**: GET
**URL**: `/api/v1/api-keys`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Успешный ответ** (200):
```json
[
  { "id": "uuid", "key": "abc123", "name": "Key1", "isActive": true },
  ...
]
```

### POST /api/v1/api-keys
**Описание**: Создание нового API-ключа

**Метод**: POST
**URL**: `/api/v1/api-keys`

**Headers**:
| Имя           | Обязательный | Описание         |
|---------------|--------------|------------------|
| Authorization | да           | Bearer {token}   |

**Body Parameters**:
| Поле | Тип    | Обязательный | Описание      |
|------|--------|--------------|---------------|
| name | string | нет          | Описание ключа |

**Успешный ответ** (201):
```json
{ "id": "uuid", "key": "newkey123", "name": "Key1", "isActive": true }
```

### PUT /api/v1/api-keys/{id}
**Описание**: Обновление API-ключа

**Метод**: PUT
**URL**: `/api/v1/api-keys/{id}`

**Body Parameters**:
| Поле | Тип    | Обязательный | Описание    |
|------|--------|--------------|-------------|
| name | string | нет          | Новое имя   |

**Успешный ответ** (200):
```json
{ "message": "API-ключ обновлен" }
```

### DELETE /api/v1/api-keys/{id}
**Описание**: Удаление API-ключа

**Метод**: DELETE
**URL**: `/api/v1/api-keys/{id}`

**Успешный ответ** (200):
```json
{ "message": "API-ключ удален" }
```

### POST /api/v1/api-keys/{id}/regenerate
**Описание**: Регенирация API-ключа

**Метод**: POST
**URL**: `/api/v1/api-keys/{id}/regenerate`

**Успешный ответ** (200):
```json
{ "id": "uuid", "key": "newKey456" }
```

## Коннекторы

### GET /api/v1/connectors
**Описание**: Получение списка доступных коннекторов

**Метод**: GET
**URL**: `/api/v1/connectors`

**Успешный ответ** (200):
```json
[
  { "id": "uuid", "name": "CRM Connector" },
  ...
]
```

### GET /api/v1/connectors/{id}
**Описание**: Получение информации о коннекторе по ID

**Метод**: GET
**URL**: `/api/v1/connectors/{id}`

**Путь**:
| Параметр | Тип   | Описание        |
|----------|-------|-----------------|
| id       | uuid  | ID коннектора   |

**Успешный ответ** (200):
```json
{ "id": "uuid", "name": "CRM Connector", "config": { ... } }
```

### POST /api/v1/connectors
**Описание**: Создание нового коннектора (только для админов)

**Метод**: POST
**URL**: `/api/v1/connectors`

**Body Parameters**:
| Поле   | Тип     | Обязательный | Описание           |
|--------|---------|--------------|--------------------|
| name   | string  | да           | Название коннектора |
| config | object  | да           | Настройки коннектора |

**Успешный ответ** (201):
```json
{ "id": "uuid", "name": "CRM Connector", "config": { ... } }
```

### PUT /api/v1/connectors/{id}
**Описание**: Обновление коннектора (только для админов)

### DELETE /api/v1/connectors/{id}
**Описание**: Удаление коннектора (только для админов)

## Вебхуки

### POST /api/v1/webhooks/stripe
**Описание**: Вебхук для обработки событий от Stripe

**Метод**: POST
**URL**: `/api/v1/webhooks/stripe`

**Headers**:
| Имя              | Обязательный | Описание                      |
|------------------|--------------|-------------------------------|
| Stripe-Signature | да           | Подпись запроса от Stripe     |

### POST /api/v1/webhooks/paypal
**Описание**: Вебхук для обработки событий от PayPal

**Метод**: POST
**URL**: `/api/v1/webhooks/paypal`

### POST /api/v1/webhooks/make
**Описание**: Вебхук для обработки событий от Make

**Метод**: POST
**URL**: `/api/v1/webhooks/make`

### POST /api/v1/webhooks/sendpulse
**Описание**: Вебхук для обработки событий от SendPulse

**Метод**: POST
**URL**: `/api/v1/webhooks/sendpulse`

## Аналитика (только для админов)

### GET /api/v1/analytics/users
**Описание**: Статистика по пользователям

**Метод**: GET
**URL**: `/api/v1/analytics/users`

**Query Parameters**:
| Параметр | Тип    | Обязательный | Описание              |
|----------|--------|--------------|-----------------------|
| from     | string | нет          | Начальная дата (ISO8601) |
| to       | string | нет          | Конечная дата (ISO8601) |

**Успешный ответ** (200):
```json
{ "totalUsers": 100, "activeUsers": 80 }
```

### GET /api/v1/analytics/subscriptions
**Описание**: Статистика по подпискам

### GET /api/v1/analytics/revenue
**Описание**: Финансовая статистика

### GET /api/v1/analytics/connectors
**Описание**: Статистика использования коннекторов
