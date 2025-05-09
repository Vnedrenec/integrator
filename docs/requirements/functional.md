# Функциональные требования

### Регистрация и аутентификация

#### Регистрация пользователей
- Регистрация с использованием email и пароля
- Подтверждение email через отправку ссылки активации
- Возможность регистрации через OAuth (Google, GitHub)
- Сбор необходимой информации для выставления счетов

#### Аутентификация
- Вход по email и паролю
- Двухфакторная аутентификация (опционально)
- Восстановление пароля
- Управление сессиями пользователя
- Автоматический выход при длительном отсутствии активности

### Управление подписками

#### Бесплатный пробный период
- Автоматическая активация 7-дневного пробного периода при регистрации
- Полный доступ ко всем функциям коннектора
- Уведомления о скором окончании пробного периода (за 2 дня)
- Возможность отказаться от перехода на платную подписку

#### Платная подписка
- Автоматическое списание средств автоматически после окончания пробного периода
- Уведомления о предстоящих списаниях
- История платежей в личном кабинете
- Возможность изменения платежных данных

#### Отмена подписки
- Возможность отмены подписки в любой момент
- Сохранение доступа до конца оплаченного периода
- Опрос о причинах отмены подписки
- Возможность возобновления подписки

### Интеграция с платежными системами

#### Stripe
- Интеграция с API Stripe для обработки платежей
- Использование Stripe Subscriptions для управления подписками
- Обработка вебхуков от Stripe для отслеживания статуса платежей
- Хранение платежной информации на стороне Stripe

#### PayPal
- Интеграция с PayPal для альтернативного способа оплаты
- Поддержка подписок через PayPal Billing
- Обработка IPN (Instant Payment Notification) для отслеживания платежей
- Автоматическая синхронизация статуса подписки

#### SendPulse
- Интеграция с SendPulse для отправки email-уведомлений
- Автоматическая отправка уведомлений о статусе подписки
- Отправка маркетинговых рассылок (опционально)
- Шаблоны писем для различных типов уведомлений

#### Обработка платежей
- Безопасное хранение платежной информации
- Обработка успешных и неуспешных платежей
- Автоматические повторные попытки при неудачных платежах
- Уведомления пользователей о статусе платежей

### API для взаимодействия с Make

#### Генерация API-ключей
- Создание уникальных API-ключей для каждого пользователя
- Возможность регенерации ключей
- Отслеживание использования ключей

#### Управление доступом
- Проверка валидности подписки при запросах к API
- Ограничение доступа по истечении подписки
- Мониторинг использования API

#### Интеграция с Make Developer Hub
- API для проверки статуса подписки пользователя
- Механизм обновления прав доступа в Make
- Логирование всех взаимодействий с Make API

### Панель администратора

#### Управление пользователями
- Просмотр списка всех пользователей
- Фильтрация и поиск пользователей
- Редактирование информации о пользователях
- Блокировка/разблокировка пользователей

#### Управление подписками
- Мониторинг активных подписок
- Ручное управление статусом подписок
- Просмотр истории платежей
- Генерация отчетов по доходам

#### Аналитика
- Статистика регистраций
- Конверсия из пробного периода в платную подписку
- Показатели удержания пользователей
- Финансовые отчеты

### Дополнительные функции

#### Аналитическая панель для пользователей
- Визуализация использования коннекторов в реальном времени
- Просмотр исторических метрик: запросы, ошибки, время выполнения
- Экспорт данных в CSV и PDF

#### Маркетплейс коннекторов
- Каталог доступных коннекторов с фильтрацией и поиском
- Система рейтингов и отзывов пользователей
- Возможность отправить запрос на новый коннектор
- Управление партнерскими программами для разработчиков

#### Система уведомлений
- Рассылка уведомлений о событиях (конец пробного периода, сбой платежа)
- Каналы: email, SMS, push-уведомления
- Интеграция с Telegram и Slack для оперативных оповещений

#### Многоязычная поддержка
- Интерфейс на русском и английском
- Локализация шаблонов писем и уведомлений

## Пользовательские персоны

### Персона 1: Александр - Бизнес-аналитик
**Демография**: 32 года, высшее образование, работает в среднем бизнесе
**Технические навыки**: Средние, использует Make для автоматизации бизнес-процессов
**Цели**:
- Автоматизировать сбор данных из CRM и маркетплейсов
- Создать автоматические отчеты для руководства
**Болевые точки**:
- Недостаток готовых коннекторов для нужных ему сервисов
- Сложность настройки интеграций
**Ожидания от продукта**:
- Простой доступ к коннекторам для популярных российских CRM
- Понятная документация и примеры использования

### Персона 2: Екатерина - Маркетолог
**Демография**: 28 лет, высшее образование, работает в digital-агентстве
**Технические навыки**: Выше среднего, активно использует различные MarTech-инструменты
**Цели**:
- Автоматизировать маркетинговые кампании и сбор данных
- Интегрировать различные маркетинговые платформы
**Болевые точки**:
- Высокая стоимость интеграционных решений
- Необходимость постоянно обновлять интеграции
**Ожидания от продукта**:
- Надежные коннекторы для популярных маркетинговых платформ
- Гибкая ценовая политика

### Персона 3: Дмитрий - Разработчик
**Демография**: 35 лет, высшее техническое образование, работает в IT-компании
**Технические навыки**: Высокие, профессиональный разработчик
**Цели**:
- Интегрировать различные сервисы в собственные приложения
- Автоматизировать рутинные задачи разработки
**Болевые точки**:
- Ограничения API существующих решений
- Недостаточная документация API
**Ожидания от продукта**:
- Четкая документация API
- Высокая надежность и стабильность API

## Use Cases и сценарии

### Регистрация пользователя
**Актор**: Гость
**Предусловия**: Нет аккаунта
**Основной сценарий**:
1. Пользователь отправляет POST `/api/v1/auth/register` с {email, password}.
2. Система создаёт запись user, статус `unverified` и отправляет email.
3. Пользователь кликает ссылку в письме (GET `/api/v1/auth/verify?token`).
4. Система меняет статус на `active` и перенаправляет на страницу входа.
**Постусловия**: Пользователь верифицирован, статус `active`.

### Аутентификация и получение токенов
**Актор**: Регулярный пользователь
**Предусловия**: Email подтверждён
**Основной сценарий**:
1. POST `/api/v1/auth/login` с {email, password}.
2. Система проверяет учетные данные, возвращает {accessToken, refreshToken}.
3. Клиент сохраняет refreshToken в Secure Cookie, accessToken в памяти.
**Постусловия**: Пользователь авторизован, tokens valid.

### Управление подпиской
**Актор**: Пользователь
**Предусловия**: Аккаунт активен
**Основной сценарий**:
1. Пользователь выбирает план и отправляет POST `/api/v1/subscriptions`.
2. Система инициирует платеж через Stripe/PayPal.
3. По успешному платежу система меняет `status=active`, задаёт даты.
4. Система отправляет webhook и обновляет статус.
**Постусловия**: Подписка активна.

### Использование коннектора
**Актор**: Make-Connector
**Предусловия**: Активная подписка, валидный API-ключ
**Основной сценарий**:
1. Make-приложение посылает запрос к `/api/v1/connectors/{id}/action` с ключом.
2. Система проверяет статус подписки и ключ.
3. При успехе выполняет действие и возвращает данные.
**Постусловия**: Логирование запроса, ответ с данными.

### Администрирование системы
**Актор**: Администратор
**Предусловия**: Роль `admin`
**Основной сценарий**:
1. GET `/api/v1/users` для списка пользователей.
2. PUT/DELETE для управления user/subscription.
3. GET `/api/v1/analytics/*` для аналитики и отчетности.
**Постусловия**: Выполненные админ-операции, логи действий.

### Сценарии для технической поддержки
**Актор**: Специалист технической поддержки
**Предусловия**: Роль `support`
**Основной сценарий**:
1. Получение обращения от пользователя через тикет-систему
2. Поиск пользователя по email/ID в админ-панели
3. Просмотр информации о подписке и платежах
4. Выполнение действий по запросу (сброс пароля, продление trial)
5. Логирование выполненных действий
**Постусловия**: Проблема пользователя решена, действия залогированы

### Сценарии для суперадмина
**Актор**: Суперадминистратор
**Предусловия**: Роль `superadmin`
**Основной сценарий**:
1. Мониторинг общей статистики системы через дашборд
2. Управление ролями администраторов и поддержки
3. Настройка глобальных параметров системы (тарифы, интеграции)
4. Анализ финансовых показателей и конверсии
**Постусловия**: Система настроена и оптимизирована

### Сценарий восстановления доступа
**Актор**: Пользователь
**Предусловия**: Зарегистрированный аккаунт
**Основной сценарий**:
1. Пользователь запрашивает сброс пароля (POST `/api/v1/auth/forgot-password`)
2. Система проверяет email и отправляет ссылку для сброса
3. Пользователь переходит по ссылке и вводит новый пароль
4. Система обновляет пароль и инвалидирует все активные сессии
**Альтернативный сценарий**:
1. Email не найден - система возвращает нейтральное сообщение
2. Ссылка истекла - система предлагает запросить новую ссылку
