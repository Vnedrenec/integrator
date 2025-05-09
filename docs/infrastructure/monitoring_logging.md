# Мониторинг и логирование

## Мониторинг
- Используем Prometheus для сбора метрик:
  - HTTP-сервисы: `http_request_duration_seconds`, `http_requests_total`, `error_rate`.
  - Системные метрики: CPU, память, диск (node_exporter).
  - Экспортёры: node_exporter, blackbox_exporter.
- Grafana дашборды:
  - Доступность сервисов (uptime), 95/99 перцентиль latency.
  - Ошибки (5xx rate), нагрузка на API.
  - Бизнес-метрики: количество активных подписок, ежедневный доход.
- Alertmanager:
  - Правила: latency > 500ms (5m), error_rate > 1% (3m).
  - Уведомления в Slack, email, PagerDuty.
- SLA: доступность 99.9% в месяц.

## Логирование
- Централизованное логирование через Elasticsearch/Fluentd/Kibana (EFK):
  - JSON-логи: `timestamp`, `level`, `service`, `traceId`, `message`.
  - Пример:
    ```json
    {"timestamp":"...","level":"info","service":"api","traceId":"...","message":"Запрос /api/v1/users"}
    ```
- Уровни логов: `error`, `warn`, `info`, `debug`.
- Correlation ID:
  - Генерируется на уровне ingress и передаётся по всем запросам.
- Хранение и ротирование:
  - Логи хранятся 90 дней, архивация старше 30 дней.
  - Daily index roll-over.
- Error tracking:
  - Sentry: автоматическая отправка исключений и трассировка.
- Аудит логов:
  - Запись административных операций и действий пользователей.

## Мониторинг и обработка ошибок

### Классификация ошибок

| Тип ошибки | Описание | Приоритет | Время реакции |
|------------|------------|-------------|----------------|
| Критические | Сбои, влияющие на работу всей системы | Высокий | 15 минут |
| Высокие | Сбои в ключевых функциях (платежи, API) | Высокий | 1 час |
| Средние | Проблемы с некритичными функциями | Средний | 24 часа |
| Низкие | Косметические проблемы, не влияющие на функционал | Низкий | Следующий спринт |

### Стратегия обработки ошибок

1. **Автоматическое обнаружение**:
   - Использование Sentry для отслеживания исключений в реальном времени
   - Мониторинг статус-кодов HTTP (5xx, 4xx) через Prometheus
   - Анализ логов с использованием ELK Stack

2. **Уведомления**:
   - Slack-уведомления для критических и высоких ошибок
   - Email-уведомления для средних ошибок
   - Ежедневный дайджест низкоприоритетных ошибок

3. **Реагирование**:
   - Автоматические попытки восстановления для определенных типов ошибок
   - Дежурный инженер для критических сбоев
   - Система эскалации для нерешенных проблем

4. **Анализ и предотвращение**:
   - Еженедельный анализ часто встречающихся ошибок
   - Регулярные проверки системы на наличие уязвимостей
   - Автоматические тесты для критических путей
