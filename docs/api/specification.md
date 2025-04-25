# Спецификация API BPM Centr

В этом документе описывается спецификация API платформы "BPM Centr" для MVP.

## Базовая информация

- **Базовый URL**: `https://api.bpmcentr.ru/v1`
- **Формат данных**: JSON
- **Аутентификация**: JWT Token
- **Версия API**: v1

## Аутентификация

Все запросы к API (кроме публичных эндпоинтов) должны содержать заголовок авторизации:

```
Authorization: Bearer {jwt_token}
```

### Получение токена

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

**Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Обновление токена

**Endpoint**: `POST /auth/refresh`

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

## Регистрация пользователей

### Регистрация нового пользователя

**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Inc."
}
```

**Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Inc.",
  "status": "unverified",
  "createdAt": "2023-04-22T12:00:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too weak"],
  "error": "Bad Request"
}
```

### Подтверждение email

**Endpoint**: `GET /auth/verify-email?token={verification_token}`

**Response** (200 OK):
```json
{
  "message": "Email successfully verified"
}
```

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid or expired token",
  "error": "Bad Request"
}
```

### Запрос на сброс пароля

**Endpoint**: `POST /auth/forgot-password`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset instructions sent to your email"
}
```

### Сброс пароля

**Endpoint**: `POST /auth/reset-password`

**Request**:
```json
{
  "token": "reset_token_from_email",
  "password": "new_password123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password successfully reset"
}
```

## Управление пользователями

### Получение профиля пользователя

**Endpoint**: `GET /users/me`

**Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Inc.",
  "status": "active",
  "createdAt": "2023-04-22T12:00:00Z",
  "subscriptions": [
    {
      "id": "456e4567-e89b-12d3-a456-426614174000",
      "connector": "crm-connector",
      "category": "Расширенный",
      "make_account_id": "make_account_1",
      "status": "active",
      "startDate": "2023-04-22T12:00:00Z",
      "endDate": "2023-05-22T12:00:00Z"
    }
  ]
}
```

### Обновление профиля пользователя

**Endpoint**: `PATCH /users/me`

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company Inc."
}
```

**Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company Inc.",
  "status": "active",
  "createdAt": "2023-04-22T12:00:00Z",
  "updatedAt": "2023-04-23T10:00:00Z"
}
```

## Управление подписками

### Получение доступных коннекторов

**Endpoint**: `GET /connectors`

**Response** (200 OK):
```json
{
  "connectors": [
    {
      "id": "conn_standard_1",
      "name": "CMS Коннектор",
      "description": "Коннектор для популярной CMS",
      "category": "Стандартный",
      "price": 15,
      "currency": "USD",
      "interval": "month",
      "trial_period_days": 7,
      "features": {
        "feature1": true,
        "feature2": true,
        "feature3": false
      }
    },
    {
      "id": "conn_advanced_1",
      "name": "CRM Коннектор",
      "description": "Коннектор для CRM-системы",
      "category": "Расширенный",
      "price": 30,
      "currency": "USD",
      "interval": "month",
      "trial_period_days": 7,
      "features": {
        "feature1": true,
        "feature2": true,
        "feature3": true
      }
    },
    {
      "id": "conn_premium_1",
      "name": "ERP Коннектор",
      "description": "Коннектор для корпоративной ERP-системы",
      "category": "Премиум",
      "price": 50,
      "currency": "USD",
      "interval": "month",
      "trial_period_days": 14,
      "features": {
        "feature1": true,
        "feature2": true,
        "feature3": true,
        "feature4": true
      }
    }
  ]
}
```

### Создание подписки

**Endpoint**: `POST /subscriptions`

**Request**:
```json
{
  "connectorId": "conn_advanced_1",
  "makeAccountId": "make_account_1",
  "interval": "month",
  "paymentMethodId": "pm_card_visa"
}
```

**Response** (201 Created):
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "connectorId": "conn_advanced_1",
  "makeAccountId": "make_account_1",
  "status": "active",
  "startDate": "2023-04-22T12:00:00Z",
  "endDate": "2023-05-22T12:00:00Z",
  "autoRenew": true,
  "paymentMethod": {
    "id": "pm_card_visa",
    "type": "card",
    "last4": "4242",
    "brand": "visa",
    "expMonth": 12,
    "expYear": 2025
  }
}
```

### Получение текущей подписки

**Endpoint**: `GET /subscriptions/current`

**Response** (200 OK):
```json
{
  "subscriptions": [
    {
      "id": "456e4567-e89b-12d3-a456-426614174000",
      "connectorId": "conn_advanced_1",
      "connector": {
        "name": "CRM Коннектор",
        "category": "Расширенный"
      },
      "makeAccountId": "make_account_1",
      "status": "active",
      "startDate": "2023-04-22T12:00:00Z",
      "endDate": "2023-05-22T12:00:00Z",
      "autoRenew": true,
      "paymentMethod": {
        "id": "pm_card_visa",
        "type": "card",
        "last4": "4242",
        "brand": "visa",
        "expMonth": 12,
        "expYear": 2025
      }
    }
  ]
}
```

### Отмена подписки

**Endpoint**: `POST /subscriptions/{subscriptionId}/cancel`

**Response** (200 OK):
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "connectorId": "conn_advanced_1",
  "makeAccountId": "make_account_1",
  "status": "canceled",
  "startDate": "2023-04-22T12:00:00Z",
  "endDate": "2023-05-22T12:00:00Z",
  "autoRenew": false,
  "canceledAt": "2023-04-23T10:00:00Z"
}
```

### Возобновление подписки

**Endpoint**: `POST /subscriptions/{subscriptionId}/reactivate`

**Response** (200 OK):
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "connectorId": "conn_advanced_1",
  "makeAccountId": "make_account_1",
  "status": "active",
  "startDate": "2023-04-22T12:00:00Z",
  "endDate": "2023-05-22T12:00:00Z",
  "autoRenew": true,
  "reactivatedAt": "2023-04-23T11:00:00Z"
}
```

## Управление API-ключами

### Получение списка API-ключей

**Endpoint**: `GET /api-keys`

**Response** (200 OK):
```json
{
  "apiKeys": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "name": "Production Key",
      "prefix": "bpm_prod_",
      "createdAt": "2023-04-22T12:00:00Z",
      "lastUsed": "2023-04-23T10:00:00Z"
    },
    {
      "id": "789e4567-e89b-12d3-a456-426614174001",
      "name": "Development Key",
      "prefix": "bpm_dev_",
      "createdAt": "2023-04-22T12:30:00Z",
      "lastUsed": null
    }
  ]
}
```

### Создание API-ключа

**Endpoint**: `POST /api-keys`

**Request**:
```json
{
  "name": "New API Key"
}
```

**Response** (201 Created):
```json
{
  "id": "789e4567-e89b-12d3-a456-426614174002",
  "name": "New API Key",
  "key": "bpm_test_a1b2c3d4e5f6g7h8i9j0...",
  "prefix": "bpm_test_",
  "createdAt": "2023-04-23T11:00:00Z",
  "lastUsed": null
}
```

**Важно**: Полный API-ключ возвращается только один раз при создании. В дальнейшем будет доступен только префикс ключа.

### Удаление API-ключа

**Endpoint**: `DELETE /api-keys/{apiKeyId}`

**Response** (204 No Content)

## API для коннекторов

### Проверка подписки

**Endpoint**: `GET /subscription/check`

**Описание**: Проверяет статус подписки на коннектор и привязку к аккаунту Make. Если коннектор еще не привязан к аккаунту Make, автоматически привязывает его к указанному аккаунту.

**Headers**:
```
Authorization: Bearer {api_key}
```

**Query Parameters**:
```
connector: string (required) - Идентификатор коннектора
accountId: string (required) - Идентификатор аккаунта Make
```

**Response** (200 OK):
```json
{
  "active": true,
  "hasAccess": true,
  "accountId": "make_account_1",
  "category": "Расширенный",
  "expiresAt": "2023-05-22T12:00:00Z",
  "isNewBinding": false
}
```

**Поля ответа**:
- `active` (boolean) - Активна ли подписка
- `hasAccess` (boolean) - Имеет ли пользователь доступ к данному коннектору
- `accountId` (string) - Идентификатор аккаунта Make, к которому привязан коннектор
- `category` (string) - Категория коннектора
- `expiresAt` (string) - Дата и время истечения подписки в формате ISO 8601
- `isNewBinding` (boolean) - Указывает, была ли создана новая привязка к аккаунту Make в рамках этого запроса

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Missing required parameter: accountId",
  "error": "Bad Request"
}
```

**Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

**Response** (403 Forbidden - Неактивная подписка):**
```json
{
  "statusCode": 403,
  "message": "Subscription inactive or expired",
  "error": "Forbidden"
}
```

**Response** (403 Forbidden - Нет доступа к коннектору):**
```json
{
  "statusCode": 403,
  "message": "No access to this connector",
  "error": "Forbidden"
}
```

**Response** (403 Forbidden - Коннектор привязан к другому аккаунту):**
```json
{
  "statusCode": 403,
  "message": "Connector is linked to a different Make account: make_account_2",
  "error": "Forbidden"
}
```

### Смена привязки коннектора к аккаунту Make

**Endpoint**: `POST /subscription/{subscriptionId}/change-account`

**Описание**: Меняет привязку коннектора с одного аккаунта Make на другой. При этом коннектор автоматически отключается в предыдущем аккаунте.

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Path Parameters**:
```
subscriptionId: string (required) - Идентификатор подписки
```

**Request Body**:
```json
{
  "makeAccountId": "make_account_2"
}
```

**Response** (200 OK):
```json
{
  "id": "456e4567-e89b-12d3-a456-426614174000",
  "connectorId": "conn_advanced_1",
  "makeAccountId": "make_account_2",
  "status": "active",
  "startDate": "2023-04-22T12:00:00Z",
  "endDate": "2023-05-22T12:00:00Z",
  "autoRenew": true,
  "previousAccountId": "make_account_1",
  "accountChangedAt": "2023-04-23T15:30:00Z"
}
```

**Поля ответа**:
- `id` (string) - Идентификатор подписки
- `connectorId` (string) - Идентификатор коннектора
- `makeAccountId` (string) - Новый идентификатор аккаунта Make
- `status` (string) - Статус подписки
- `startDate` (string) - Дата начала подписки
- `endDate` (string) - Дата окончания подписки
- `autoRenew` (boolean) - Включено ли автоматическое продление
- `previousAccountId` (string) - Предыдущий идентификатор аккаунта Make
- `accountChangedAt` (string) - Дата и время смены аккаунта

**Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Missing required parameter: makeAccountId",
  "error": "Bad Request"
}
```

**Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Response** (403 Forbidden):
```json
{
  "statusCode": 403,
  "message": "You do not have permission to change this subscription",
  "error": "Forbidden"
}
```

**Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Subscription not found",
  "error": "Not Found"
}
```

### Регистрация использования коннектора

**Endpoint**: `POST /connector/usage`

**Headers**:
```
Authorization: Bearer {api_key}
```

**Request**:
```json
{
  "connector": "crm-connector",
  "make_account_id": "make_account_1",
  "operation": "getContact",
  "timestamp": "2023-04-23T11:30:00Z"
}
```

**Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174123",
  "connector": "crm-connector",
  "operation": "getContact",
  "timestamp": "2023-04-23T11:30:00Z",
  "status": "recorded",
  "operationsUsed": 2501,
  "operationsLimit": 10000
}
```

## Ошибки API

Все ошибки API возвращаются в следующем формате:

```json
{
  "statusCode": 400,
  "message": "Описание ошибки",
  "error": "Тип ошибки"
}
```

### Коды ошибок

- **400 Bad Request** - Некорректные данные запроса
- **401 Unauthorized** - Ошибка аутентификации
- **403 Forbidden** - Недостаточно прав для выполнения операции
- **404 Not Found** - Ресурс не найден
- **409 Conflict** - Конфликт данных
- **422 Unprocessable Entity** - Ошибка валидации данных
- **429 Too Many Requests** - Превышен лимит запросов
- **500 Internal Server Error** - Внутренняя ошибка сервера

## Пагинация

Для эндпоинтов, возвращающих списки объектов, используется пагинация:

**Query Parameters**:
```
page: number (default: 1) - Номер страницы
limit: number (default: 10, max: 100) - Количество элементов на странице
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

## Фильтрация и сортировка

Для эндпоинтов, поддерживающих фильтрацию и сортировку:

**Query Parameters**:
```
sort: string - Поле для сортировки (префикс "-" для сортировки по убыванию)
filter[field]: string - Фильтрация по полю
```

**Пример**:
```
GET /api-keys?sort=-createdAt&filter[name]=Production
```
