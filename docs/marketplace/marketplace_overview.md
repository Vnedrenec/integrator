# Маркетплейс коннекторов

В этом документе представлено детальное описание маркетплейса коннекторов платформы BPM Centr, его функциональности и особенностей.

## Обзор маркетплейса коннекторов

Маркетплейс коннекторов BPM Centr - это централизованная платформа для поиска, выбора и приобретения коннекторов для интеграции с платформой Make. Маркетплейс предоставляет пользователям удобный интерфейс для просмотра доступных коннекторов, их сравнения, чтения отзывов и оформления подписок.

### Цели маркетплейса

1. **Централизация доступа к коннекторам** - единая точка для поиска и приобретения всех доступных коннекторов
2. **Упрощение выбора** - предоставление подробной информации о каждом коннекторе для принятия обоснованного решения
3. **Управление подписками** - удобный интерфейс для управления подписками на коннекторы
4. **Сбор обратной связи** - система рейтингов и отзывов для улучшения качества коннекторов
5. **Продвижение новых коннекторов** - платформа для анонсирования и продвижения новых коннекторов

## Функциональность маркетплейса

### Каталог коннекторов

Каталог коннекторов является основной частью маркетплейса и предоставляет следующие возможности:

1. **Просмотр списка коннекторов** - отображение всех доступных коннекторов в виде карточек с основной информацией
2. **Фильтрация и поиск** - возможность фильтрации коннекторов по категории, цене, рейтингу и другим параметрам
3. **Сортировка** - сортировка коннекторов по популярности, дате добавления, цене и рейтингу
4. **Пагинация** - разделение списка коннекторов на страницы для удобного просмотра

#### Карточка коннектора в каталоге

Каждый коннектор в каталоге представлен в виде карточки, содержащей следующую информацию:

- Логотип коннектора
- Название коннектора
- Краткое описание (1-2 предложения)
- Категория
- Рейтинг (среднее значение отзывов)
- Цена (начальная стоимость подписки)
- Кнопка "Подробнее" для перехода на страницу детального описания

```
+-------------------+
| [Логотип]         |
| Название коннектора|
|                   |
| Краткое описание  |
| коннектора        |
|                   |
| Категория: XXX    |
| Рейтинг: ★★★★☆    |
| Цена: от XX USD   |
|                   |
| [Подробнее]       |
+-------------------+
```

### Фильтры и поиск

Маркетплейс предоставляет следующие возможности для фильтрации и поиска коннекторов:

1. **Поисковая строка** - поиск коннекторов по названию, описанию и ключевым словам
2. **Фильтр по категории** - фильтрация коннекторов по категориям (CRM, маркетплейсы, платежные системы и т.д.)
3. **Фильтр по цене** - фильтрация коннекторов по ценовому диапазону
4. **Фильтр по рейтингу** - фильтрация коннекторов по минимальному рейтингу
5. **Фильтр по статусу** - фильтрация коннекторов по статусу (новые, популярные, рекомендуемые)

### Система рейтингов и отзывов

Маркетплейс включает систему рейтингов и отзывов, которая позволяет пользователям:

1. **Оставлять отзывы** - возможность написать отзыв о коннекторе после его использования
2. **Ставить оценки** - оценка коннектора по 5-балльной шкале
3. **Читать отзывы других пользователей** - просмотр отзывов и оценок других пользователей
4. **Сортировать отзывы** - сортировка отзывов по дате, рейтингу или полезности
5. **Отмечать отзывы как полезные** - возможность отметить отзывы других пользователей как полезные

### Запрос на новые коннекторы

Маркетплейс предоставляет возможность пользователям запрашивать разработку новых коннекторов:

1. **Форма запроса** - заполнение формы с описанием требуемого коннектора
2. **Голосование за запросы** - возможность голосовать за запросы других пользователей
3. **Отслеживание статуса запроса** - мониторинг статуса рассмотрения запроса
4. **Уведомления** - получение уведомлений о изменении статуса запроса

## Интерфейс маркетплейса

Детальные макеты интерфейса маркетплейса представлены в файле [marketplace_screens.md](../ui/marketplace_screens.md).






## Интеграция с другими системами

### Интеграция с системой подписок

Маркетплейс интегрирован с системой подписок, что позволяет:

1. **Оформлять подписки** - возможность оформить подписку на коннектор непосредственно из маркетплейса
2. **Управлять подписками** - просмотр и управление активными подписками
3. **Продлевать подписки** - возможность продления подписок перед их истечением
4. **Отменять подписки** - возможность отмены подписок при необходимости

### Интеграция с системой уведомлений

Маркетплейс интегрирован с системой уведомлений, что позволяет:

1. **Получать уведомления о новых коннекторах** - уведомления о появлении новых коннекторов
2. **Получать уведомления о статусе запросов** - уведомления об изменении статуса запросов на новые коннекторы
3. **Получать уведомления о подписках** - уведомления о статусе подписок (активация, истечение, продление)
4. **Получать уведомления о ответах на отзывы** - уведомления о ответах на оставленные отзывы

## Администрирование маркетплейса

### Управление коннекторами

Администраторы имеют доступ к следующим функциям управления коннекторами:

1. **Добавление новых коннекторов** - создание новых коннекторов в маркетплейсе
2. **Редактирование существующих коннекторов** - изменение информации о существующих коннекторах
3. **Удаление коннекторов** - удаление коннекторов из маркетплейса
4. **Управление категориями** - создание, редактирование и удаление категорий коннекторов
5. **Управление ценами** - установка и изменение цен на коннекторы

### Управление запросами

Администраторы имеют доступ к следующим функциям управления запросами на новые коннекторы:

1. **Просмотр запросов** - просмотр списка запросов на новые коннекторы
2. **Изменение статуса запросов** - изменение статуса запросов (на рассмотрении, одобрен, отклонен, в разработке, завершен)
3. **Ответы на запросы** - отправка ответов на запросы пользователей
4. **Аналитика запросов** - просмотр статистики и аналитики по запросам

### Управление отзывами

Администраторы имеют доступ к следующим функциям управления отзывами:

1. **Модерация отзывов** - проверка и модерация отзывов перед публикацией
2. **Ответы на отзывы** - возможность ответить на отзывы пользователей
3. **Удаление отзывов** - удаление неприемлемых отзывов
4. **Аналитика отзывов** - просмотр статистики и аналитики по отзывам

## Связанные разделы

- [Шаблон страницы описания коннектора](connector_template.md)
- [Процесс добавления новых коннекторов](connector_addition.md)
- [Управление подписками](../subscription/overview.md)
- [Интеграция с Make API](../integrations/make_integration.md)
- [Макеты интерфейса](../ui/wireframes.md)
- [Макеты экранов маркетплейса](../ui/marketplace_screens.md)
