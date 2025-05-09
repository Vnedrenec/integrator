# Введение в проект "BPM Centr"

## Обзор проекта

Проект "BPM Centr" представляет собой платформу для разработки и управления доступом к коннекторам в сервисе Make (ранее Integromat). Платформа специализируется на создании уникальных коннекторов для CRM-систем, маркетплейсов, ERP-систем и платежных сервисов, которые отсутствуют в официальном маркетплейсе Make.

Ключевые особенности платформы:

1. **Разработка уникальных коннекторов** - создание коннекторов для систем, которые не представлены в маркетплейсе Make
2. **Монетизация через подписки** - взимание комиссии с пользователей за использование разработанных коннекторов
3. **Прямое взаимодействие данных** - данные передаются напрямую между Make и целевыми системами, без прохождения через серверы BPM Centr
4. **Контроль подписок** - BPM Centr контролирует только подписки и доступ к коннекторам

Платформа реализует фримиум-модель монетизации, предоставляя пользователям бесплатный пробный период с последующей автоматической подпиской.

## Архитектурный подход

Платформа разрабатывается с использованием принципов Clean Architecture, что обеспечивает высокую модульность, тестируемость и гибкость системы. Это позволяет легко адаптировать платформу под изменяющиеся требования бизнеса и масштабировать её для обслуживания до 10 000 пользователей. Особое внимание уделяется безопасности данных и защите конфиденциальной информации пользователей.

## Цели проекта

- Создание удобной системы управления подписками на коннекторы, индивидуально разработанные для Make
- Разработка высококачественных коннекторов для систем, не представленных в официальном маркетплейсе
- Автоматизация процессов биллинга и управления подписками
- Обеспечение безопасного доступа к API коннекторов
- Предоставление аналитики использования коннекторов

## Целевая аудитория

- Пользователи платформы Make, нуждающиеся в специализированных коннекторах
- Разработчики интеграций и автоматизаций
- Бизнес-пользователи, использующие автоматизацию рабочих процессов
- Компании, которым требуются интеграции с системами, не представленными в официальном маркетплейсе Make

## Преимущества использования BPM Centr

- **Доступ к уникальным коннекторам** - возможность использовать интеграции с системами, не представленными в официальном маркетплейсе
- **Безопасность данных** - данные передаются напрямую между Make и целевыми системами, минуя серверы BPM Centr
- **Гибкая система подписок** - различные категории коннекторов для разных потребностей
- **Техническая поддержка** - помощь в настройке и использовании коннекторов
- **Регулярные обновления** - постоянное улучшение существующих коннекторов и разработка новых

## Связанные разделы

- [Архитектура проекта](../overview/architecture.md)
- [Разработка коннекторов](../connectors/development.md)
- [Управление подписками](../subscription/overview.md)
- [Технический стек](../overview/tech_stack.md)
