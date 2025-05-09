# Безопасность

Этот файл описывает меры безопасности проекта "BPM Centr": аутентификацию, защиту данных и API.

## Аутентификация и авторизация
### JWT Token Schema
- **Access Token** (JWT, HS256): заголовок {alg, typ}, payload {sub, roles, iat, exp(15m)}.
- **Refresh Token** (JWT, HS256): payload {sub, jti, iat, exp(7d)} или случайная строка.

### Flow аутентификации
1. POST `/api/v1/auth/login` → `{accessToken, refreshToken}`
2. Для защищённых запросов передавать Access Token в заголовке `Authorization: Bearer {token}`
3. При истечении Access Token вызвать POST `/api/v1/auth/refresh` с Refresh Token → новые токены

### Роли и права доступа (RBAC)
| Роль  | Описание                 | Примеры эндпоинтов          |
|-------|--------------------------|-----------------------------|
| user  | Обычный пользователь     | `/subscriptions/me`, `/payments/me` |
| admin | Администратор системы    | все CRUD-эндпоинты          |

### Хранение и защита сессий
- Refresh Token хранить в `HttpOnly Secure Cookie` (SameSite=strict) или в Redis с TTL.
- Access Token хранить в памяти клиента.

### Защита от брутфорс-атак
- Ограничение `/api/v1/auth/login`: не более 5 попыток за минуту по IP+аккаунту.
- Блокировка аккаунта на 15 минут после 10 неудачных попыток.

### Двухфакторная аутентификация (TOTP)
- Обязательна для админов при первом входе.
- POST `/api/v1/auth/2fa/verify` для проверки кода.

### Аудит и мониторинг
- Логирование всех попыток входа (успешных/неуспешных) с IP и User-Agent.
- Уведомления об аномалиях по email.

## Защита данных
### Шифрование данных на уровне БД
- Все чувствительные поля (например, email, платежные реквизиты) шифруются AES-256 при записи в БД.
- Управление ключами через AWS KMS/HashiCorp Vault с ротацией каждые 90 дней.

### TLS и HTTPS
- Принудительное HTTPS с редиректом HTTP → HTTPS.
- HSTS: max-age=31536000; includeSubDomains; preload.
- Поддержка только TLS 1.2+ с современными cipher suites.

### Соответствие PCI DSS
- Карточные данные не хранятся на серверах приложения.
- Использование PCI-совместимых провайдеров (Stripe/PayPal).
- Ежегодная проверка соответствия и сканирование уязвимостей.

### Резервное копирование и восстановление
- Суточные бэкапы с шифрованием AES-256.
- Хранение бэкапов 30 дней, ключи бэкапов в HSM.
- Регулярное тестирование восстановления (раз в квартал).

### Политика хранения данных и GDPR
- Хранение персональных данных не более 3 лет.
- Удаление данных по запросу пользователя (right to be forgotten).
- Подписанное Data Processing Agreement (DPA).

### Аудит доступа к данным
- Логи доступа к критическим данным сохраняются в WORM-хранилище.
- Интеграция с SIEM для корреляции и оповещений.
- Хранение логов не менее 90 дней.

### Политика доступа сотрудников
- Принцип наименьших привилегий (least privilege).
- Регулярный аудит ролей и прав (раз в полгода).
- MFA для доступа в админ-консоли.

### Удаление неиспользуемых данных
- Автоматическая очистка временных и устаревших записей (TTL).
- Ручная очистка по запросам пользователей.

### NDA и соглашения с партнёрами
- Подписание NDA с третьими сторонами перед передачей данных.
- Регулярная проверка контрагентов на соответствие требованиям безопасности.

## Защита API

### Валидация входящих данных
- JSON Schema валидация на уровне контроллеров (ajv, Joi и др.)
- Санитизация строк и проверка типов DTO
- Ограничение размера payload и depth вложенности

### Защита от CSRF
- Для cookie-based сессий использовать CSRF-токен в заголовке или форме
- Установка cookie с SameSite=strict, HttpOnly, Secure
- Проверка Origin/Referrer для критичных запросов

### Защита от XSS
- Content Security Policy (CSP): `default-src 'self'; script-src 'self';` и др.
- HTML-экранирование всех динамических данных
- Проверка и очистка пользовательского ввода при отображении

### Защита от SQL-инъекций
- Параметризованные запросы/ORM (knex, Sequelize, Hibernate и др.)
- Никогда не конкатенировать SQL вручную

### Защита API-ключей

#### Генерация и хранение API-ключей
- Генерация ключей с использованием криптостойкого генератора случайных чисел (crypto.randomBytes)
- Минимальная длина ключа - 32 символа для обеспечения достаточной энтропии
- Хранение хеша ключа в БД с использованием bcrypt с фактором стоимости 10+
- Полный ключ показывается пользователю только один раз при создании
- Использование префиксов для различных типов ключей (bpm_prod_, bpm_dev_)

#### Управление доступом к API
- Проверка ключа на каждый запрос с использованием механизма constant-time comparison для предотвращения timing-атак
- Проверка статуса подписки пользователя при каждом запросе с кэшированием результатов
- Ограничение частоты запросов (rate limiting) на уровне ключа с использованием Redis или аналогичных решений
- Мониторинг использования ключей для выявления подозрительной активности
- Блокировка ключа при обнаружении подозрительной активности с уведомлением владельца

#### Ротация и отзыв ключей
- Возможность регенерации ключа пользователем в любой момент через личный кабинет
- Плавный переход на новый ключ с периодом одновременной работы старого и нового ключей
- Автоматическая деактивация ключей, не использовавшихся более 90 дней, с предварительным уведомлением
- Немедленный отзыв ключей при подозрении на компрометацию с автоматическим созданием нового ключа
- Автоматический отзыв всех ключей при истечении подписки с грейс-периодом 3 дня

#### Рекомендации для пользователей
- Хранить API-ключи в защищенном месте (не в публичных репозиториях, не в коде)
- Использовать переменные окружения или специализированные хранилища секретов
- Использовать отдельные ключи для разных окружений (разработка, тестирование, продакшн)
- Регулярно менять ключи (рекомендуется каждые 90 дней) для минимизации рисков
- Немедленно сообщать о подозрении на компрометацию ключа через форму в личном кабинете
- Не передавать API-ключи третьим лицам и не использовать их в недоверенных средах

### Rate limiting и DoS
- Ограничение запросов на endpoint (например, 100 req/min/IP)
- Блокировка или задержки при превышении порога
- Использование WAF на уровне инфраструктуры

### Заголовки безопасности HTTP
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY или SAMEORIGIN
- Referrer-Policy: no-referrer
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

### Мониторинг и логирование
- Prometheus метрики: http_request_duration_seconds, http_requests_total, error_rate
- Alertmanager для алёртов (например, превышение latency >500ms, error_rate >1%)
- Sentry для отслеживания исключений и трассировки транзакций

## Аудит безопасности

### Внутренний аудит

#### Регулярные проверки кода
- Автоматический статический анализ кода с использованием SonarQube
- Проверка зависимостей на уязвимости с использованием Snyk
- Обязательный код-ревью для всех изменений в критичных компонентах

#### Тестирование на проникновение
- Регулярное сканирование уязвимостей с использованием OWASP ZAP
- Ежеквартальное тестирование на проникновение внутренней командой безопасности
- Ежегодное тестирование на проникновение внешними экспертами

#### Мониторинг инцидентов
- Централизованный сбор и анализ логов с использованием ELK Stack
- Автоматическое обнаружение аномалий и подозрительной активности
- Процедуры реагирования на инциденты безопасности

### Внешний аудит

#### Регулярные внешние проверки
- Ежегодный аудит безопасности внешними экспертами
- Проверка соответствия стандартам (PCI DSS, GDPR, ISO 27001)
- Тестирование на проникновение специализированными компаниями

#### Программа Bug Bounty
- Программа вознаграждения за обнаружение уязвимостей
- Четкие правила и области действия программы
- Процесс обработки и устранения обнаруженных уязвимостей

### Документация и отчетность

- Детальная документация всех проведенных аудитов и их результатов
- Отчеты о выявленных уязвимостях и принятых мерах
- Планы по устранению выявленных проблем с указанием сроков
- Регулярные отчеты для руководства о состоянии безопасности
