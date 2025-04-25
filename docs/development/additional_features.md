# Дополнительные функции

## Аналитическая панель для пользователей
**Описание**: предоставляет пользователям метрики и отчеты по использованию коннекторов.

**Функциональность**:
- Визуализация основных метрик: количество вызовов API, процент ошибок, среднее время ответа.
- Исторические графики (daily/weekly/monthly).
- Экспорт отчетов в CSV и PDF.
- Настройка пользовательских алертов по метрикам.

**API**:
- GET /api/v1/analytics/usage?from={from}&to={to}&connectorId={id}
- GET /api/v1/analytics/errors?from={from}&to={to}
- GET /api/v1/analytics/performance?from={from}&to={to}

**Модель данных**:
- AnalyticsRecord (timestamp, connectorId, userId, metricType, value)
- AlertConfig (userId, metricType, threshold, channel, isActive)

## Маркетплейс коннекторов
**Описание**: каталог и поиск коннекторов с рейтингами и отзывами.

**Модель данных**:
- Connector (id, name, description, category, logoUrl, pricingPlan)
- Review (id, connectorId, userId, rating, comment, createdAt)
- Category (id, name)

**API**:
- GET /api/v1/marketplace/connectors
- GET /api/v1/marketplace/connectors/{id}
- POST /api/v1/marketplace/connectors/{id}/reviews
- GET /api/v1/marketplace/connectors/{id}/reviews

**Процесс**:
- Пользователь выбирает новый коннектор → отправляет заявку POST /api/v1/marketplace/requests.
- Администратор одобряет или отклоняет заявку.

## Система уведомлений
**Описание**: централизованная система рассылки уведомлений.

**Модель данных**:
- NotificationTemplate (id, type, title, bodyTemplate)
- Notification (id, userId, templateId, channel, payload, status, createdAt, sentAt)
- ChannelConfig (userId, channelType, address, isEnabled)

**API**:
- GET /api/v1/notifications/templates
- GET /api/v1/notifications/settings
- PUT /api/v1/notifications/settings
- POST /api/v1/notifications/send

**Процесс**:
- Триггер (subscription.expired) → создание Notification → очередь dispatch → отправка по каналам → обновление статуса.

## Многоязычная поддержка
**Описание**: локализация интерфейса и шаблонов сообщений.

**Модель данных**:
- LocalizationKey (key)
- Translation (key, language, text)
- SupportedLanguages (list)

**Инструменты**:
- i18next для фронтенда
- node-polyglot или i18n для backend
