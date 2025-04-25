# Тестовые данные

В этом документе представлены тестовые данные для разработки и тестирования проекта "BPM Centr".

Тестовые сценарии представлены в файле [План тестирования и тестовые сценарии](test_plan.md).

## Тестовые пользователи

| Email | Пароль | Роль | Статус | Описание |
|-------|--------|------|--------|----------|
| admin@bpmcentr.com | admin123 | superadmin | active | Суперадминистратор системы |
| manager@bpmcentr.com | manager123 | admin | active | Администратор системы |
| support@bpmcentr.com | support123 | support | active | Специалист технической поддержки |
| user1@example.com | password123 | user | active | Пользователь с активной подпиской |
| user2@example.com | password123 | user | trial | Пользователь на пробном периоде |
| user3@example.com | password123 | user | expired | Пользователь с истекшей подпиской |
| user4@example.com | password123 | user | unverified | Незарегистрированный пользователь |
| user5@example.com | password123 | user | payment_pending | Пользователь с ожидающим платежом |

## Тестовые планы подписки

| ID | Название | Категория | Описание | Цена | Валюта | Период | Пробный период | Активен |
|----|----------|----------|----------|------|--------|--------|----------------|---------|
| conn_standard_1 | CMS Коннектор | Стандартный | Коннектор для популярной CMS | 15.00 | USD | monthly | 7 | true |
| conn_standard_2 | Почтовый коннектор | Стандартный | Коннектор для почтового сервиса | 15.00 | USD | monthly | 7 | true |
| conn_standard_yearly | CMS Коннектор (годовой) | Стандартный | Коннектор для популярной CMS с годовой оплатой | 153.00 | USD | yearly | 7 | true |
| conn_advanced_1 | CRM Коннектор | Расширенный | Коннектор для CRM-системы | 30.00 | USD | monthly | 7 | true |
| conn_advanced_2 | Маркетплейс коннектор | Расширенный | Коннектор для маркетплейса | 30.00 | USD | monthly | 7 | true |
| conn_premium_1 | ERP Коннектор | Премиум | Коннектор для корпоративной ERP-системы | 50.00 | USD | monthly | 14 | true |
| conn_inactive | Неактивный коннектор | Стандартный | Коннектор, который больше не предлагается | 15.00 | USD | monthly | 7 | false |

## Тестовые подписки

| ID | Пользователь | Коннектор | Аккаунт Make | Статус | Дата начала | Дата окончания | Дата окончания пробного периода |
|----|--------------|----------|--------------|--------|-------------|----------------|--------------------------------|
| sub_1 | user1@example.com | conn_standard_1 | make_account_1 | active | 2023-01-01 | 2023-12-31 | null |
| sub_2 | user2@example.com | conn_standard_2 | make_account_2 | trial | 2023-04-10 | 2023-04-17 | 2023-04-17 |
| sub_3 | user1@example.com | conn_advanced_1 | make_account_1 | active | 2023-01-01 | 2023-12-31 | null |
| sub_4 | user3@example.com | conn_premium_1 | make_account_3 | expired | 2023-01-01 | 2023-03-31 | null |
| sub_5 | user5@example.com | conn_standard_1 | make_account_4 | payment_pending | 2023-03-01 | 2023-04-01 | null |

## Тестовые API-ключи

| ID | Пользователь | Ключ | Название | Активен | Последнее использование |
|----|--------------|------|----------|---------|-------------------------|
| key_1 | user1@example.com | api_key_12345 | Основной ключ | true | 2023-04-15 |
| key_2 | user1@example.com | api_key_67890 | Тестовый ключ | true | 2023-04-10 |
| key_3 | user2@example.com | api_key_abcde | Основной ключ | true | 2023-04-14 |
| key_4 | user3@example.com | api_key_fghij | Основной ключ | false | 2023-03-20 |

## Тестовые платежи

| ID | Подписка | Пользователь | Сумма | Валюта | Статус | Метод оплаты | Дата создания |
|----|----------|--------------|-------|--------|--------|--------------|---------------|
| pay_1 | sub_1 | user1@example.com | 10.00 | USD | success | stripe | 2023-01-01 |
| pay_2 | sub_1 | user1@example.com | 10.00 | USD | success | stripe | 2023-02-01 |
| pay_3 | sub_1 | user1@example.com | 10.00 | USD | success | stripe | 2023-03-01 |
| pay_4 | sub_3 | user3@example.com | 25.00 | USD | success | paypal | 2023-01-01 |
| pay_5 | sub_3 | user3@example.com | 25.00 | USD | success | paypal | 2023-02-01 |
| pay_6 | sub_3 | user3@example.com | 25.00 | USD | success | paypal | 2023-03-01 |
| pay_7 | sub_4 | user5@example.com | 10.00 | USD | failed | stripe | 2023-04-01 |

## SQL-скрипты для создания тестовых данных

### Создание тестовых пользователей

```sql
-- Предполагается, что пароли хешируются в приложении
-- Здесь используются хеши для примера (не использовать в реальном приложении)
INSERT INTO users (id, email, password_hash, first_name, last_name, is_email_verified, role, status, created_at, updated_at)
VALUES
  ('user_id_1', 'admin@bpmcentr.com', '$2a$10$hashed_password', 'Admin', 'User', true, 'superadmin', 'active', NOW(), NOW()),
  ('user_id_2', 'manager@bpmcentr.com', '$2a$10$hashed_password', 'Manager', 'User', true, 'admin', 'active', NOW(), NOW()),
  ('user_id_3', 'support@bpmcentr.com', '$2a$10$hashed_password', 'Support', 'User', true, 'support', 'active', NOW(), NOW()),
  ('user_id_4', 'user1@example.com', '$2a$10$hashed_password', 'User', 'One', true, 'user', 'active', NOW(), NOW()),
  ('user_id_5', 'user2@example.com', '$2a$10$hashed_password', 'User', 'Two', true, 'user', 'trial', NOW(), NOW()),
  ('user_id_6', 'user3@example.com', '$2a$10$hashed_password', 'User', 'Three', true, 'user', 'expired', NOW(), NOW()),
  ('user_id_7', 'user4@example.com', '$2a$10$hashed_password', 'User', 'Four', false, 'user', 'unverified', NOW(), NOW()),
  ('user_id_8', 'user5@example.com', '$2a$10$hashed_password', 'User', 'Five', true, 'user', 'payment_pending', NOW(), NOW());
```

### Создание тестовых коннекторов

```sql
INSERT INTO connectors (id, name, category, description, price, currency, billing_period, trial_period_days, features, is_active, created_at, updated_at)
VALUES
  ('conn_standard_1', 'CMS Коннектор', 'Стандартный', 'Коннектор для популярной CMS', 15.00, 'USD', 'monthly', 7, '{"feature1": true, "feature2": true, "feature3": false}', true, NOW(), NOW()),
  ('conn_standard_2', 'Почтовый коннектор', 'Стандартный', 'Коннектор для почтового сервиса', 15.00, 'USD', 'monthly', 7, '{"feature1": true, "feature2": true, "feature3": false}', true, NOW(), NOW()),
  ('conn_standard_yearly', 'CMS Коннектор (годовой)', 'Стандартный', 'Коннектор для популярной CMS с годовой оплатой', 153.00, 'USD', 'yearly', 7, '{"feature1": true, "feature2": true, "feature3": false}', true, NOW(), NOW()),
  ('conn_advanced_1', 'CRM Коннектор', 'Расширенный', 'Коннектор для CRM-системы', 30.00, 'USD', 'monthly', 7, '{"feature1": true, "feature2": true, "feature3": true}', true, NOW(), NOW()),
  ('conn_advanced_2', 'Маркетплейс коннектор', 'Расширенный', 'Коннектор для маркетплейса', 30.00, 'USD', 'monthly', 7, '{"feature1": true, "feature2": true, "feature3": true}', true, NOW(), NOW()),
  ('conn_premium_1', 'ERP Коннектор', 'Премиум', 'Коннектор для корпоративной ERP-системы', 50.00, 'USD', 'monthly', 14, '{"feature1": true, "feature2": true, "feature3": true, "feature4": true}', true, NOW(), NOW()),
  ('conn_inactive', 'Неактивный коннектор', 'Стандартный', 'Коннектор, который больше не предлагается', 15.00, 'USD', 'monthly', 7, '{"feature1": true, "feature2": false, "feature3": false}', false, NOW(), NOW());
```

### Создание тестовых подписок

```sql
INSERT INTO subscriptions (id, user_id, connector_id, make_account_id, status, start_date, end_date, trial_end_date, stripe_subscription_id, stripe_customer_id, created_at, updated_at)
VALUES
  ('sub_1', 'user_id_4', 'conn_standard_1', 'make_account_1', 'active', '2023-01-01', '2023-12-31', NULL, 'stripe_sub_1', 'stripe_cus_1', NOW(), NOW()),
  ('sub_2', 'user_id_5', 'conn_standard_2', 'make_account_2', 'trial', '2023-04-10', '2023-04-17', '2023-04-17', 'stripe_sub_2', 'stripe_cus_2', NOW(), NOW()),
  ('sub_3', 'user_id_4', 'conn_advanced_1', 'make_account_1', 'active', '2023-01-01', '2023-12-31', NULL, 'stripe_sub_3', 'stripe_cus_1', NOW(), NOW()),
  ('sub_4', 'user_id_6', 'conn_premium_1', 'make_account_3', 'expired', '2023-01-01', '2023-03-31', NULL, 'stripe_sub_4', 'stripe_cus_3', NOW(), NOW()),
  ('sub_5', 'user_id_8', 'conn_standard_1', 'make_account_4', 'payment_pending', '2023-03-01', '2023-04-01', NULL, 'stripe_sub_5', 'stripe_cus_4', NOW(), NOW());
```

### Создание тестовых API-ключей

```sql
INSERT INTO api_keys (id, user_id, key, name, is_active, last_used_at, created_at, updated_at)
VALUES
  ('key_1', 'user_id_4', 'api_key_12345', 'Основной ключ', true, '2023-04-15', NOW(), NOW()),
  ('key_2', 'user_id_4', 'api_key_67890', 'Тестовый ключ', true, '2023-04-10', NOW(), NOW()),
  ('key_3', 'user_id_5', 'api_key_abcde', 'Основной ключ', true, '2023-04-14', NOW(), NOW()),
  ('key_4', 'user_id_6', 'api_key_fghij', 'Основной ключ', false, '2023-03-20', NOW(), NOW());
```

### Создание тестовых платежей

```sql
INSERT INTO payments (id, subscription_id, user_id, amount, currency, status, payment_method, stripe_payment_id, created_at, updated_at)
VALUES
  ('pay_1', 'sub_1', 'user_id_4', 15.00, 'USD', 'success', 'stripe', 'stripe_pay_1', '2023-01-01', NOW()),
  ('pay_2', 'sub_1', 'user_id_4', 15.00, 'USD', 'success', 'stripe', 'stripe_pay_2', '2023-02-01', NOW()),
  ('pay_3', 'sub_1', 'user_id_4', 15.00, 'USD', 'success', 'stripe', 'stripe_pay_3', '2023-03-01', NOW()),
  ('pay_4', 'sub_3', 'user_id_4', 30.00, 'USD', 'success', 'stripe', 'stripe_pay_4', '2023-01-01', NOW()),
  ('pay_5', 'sub_3', 'user_id_4', 30.00, 'USD', 'success', 'stripe', 'stripe_pay_5', '2023-02-01', NOW()),
  ('pay_6', 'sub_3', 'user_id_4', 30.00, 'USD', 'success', 'stripe', 'stripe_pay_6', '2023-03-01', NOW()),
  ('pay_7', 'sub_4', 'user_id_6', 50.00, 'USD', 'success', 'paypal', 'paypal_pay_1', '2023-01-01', NOW()),
  ('pay_8', 'sub_4', 'user_id_6', 50.00, 'USD', 'success', 'paypal', 'paypal_pay_2', '2023-02-01', NOW()),
  ('pay_9', 'sub_4', 'user_id_6', 50.00, 'USD', 'success', 'paypal', 'paypal_pay_3', '2023-03-01', NOW()),
  ('pay_10', 'sub_5', 'user_id_8', 15.00, 'USD', 'failed', 'stripe', 'stripe_pay_7', '2023-04-01', NOW());
```
