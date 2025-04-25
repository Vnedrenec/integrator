# Тестирование коннекторов

В этом документе описываются подходы, методы и инструменты для тестирования коннекторов, разрабатываемых для платформы Make в рамках проекта "BPM Centr".

## Типы тестирования

### Модульное тестирование

Модульное тестирование направлено на проверку отдельных компонентов коннектора в изоляции от других компонентов.

**Что тестируется**:
- Отдельные функции и методы
- Адаптеры для внешнего API
- Утилиты и вспомогательные функции
- Механизм проверки подписки

**Инструменты**:
- Jest
- Mocha + Chai
- Sinon (для моков и стабов)

**Пример модульного теста**:

```javascript
// subscription.test.js
const { checkSubscription } = require('../app/functions/subscription');
const nock = require('nock');

describe('Subscription Utils', () => {
  describe('checkSubscription', () => {
    beforeEach(() => {
      // Мокируем глобальную функцию $http.get, которая используется в IML функциях
      global.$http = {
        get: jest.fn()
      };
    });

    it('should return true for active subscription', () => {
      // Arrange
      const apiKey = 'test-api-key';
      const connectorName = 'test-connector';

      // Мокируем ответ от API
      global.$http.get.mockReturnValue({
        statusCode: 200,
        body: { active: true }
      });

      // Act
      const result = checkSubscription(apiKey, connectorName);

      // Assert
      expect(result).toBe(true);
      expect(global.$http.get).toHaveBeenCalledWith({
        url: 'https://api.bpmcentr.com/subscription/check',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        params: {
          connector: connectorName
        }
      });
    });

    it('should throw error for inactive subscription', () => {
      // Arrange
      const apiKey = 'test-api-key';
      const connectorName = 'test-connector';

      // Мокируем ответ от API
      global.$http.get.mockReturnValue({
        statusCode: 200,
        body: { active: false }
      });

      // Act & Assert
      expect(() => checkSubscription(apiKey, connectorName))
        .toThrow('Ваша подписка неактивна или истекла. Пожалуйста, обновите подписку в BPM Centr.');
    });

    it('should throw error when API returns error', () => {
      // Arrange
      const apiKey = 'test-api-key';
      const connectorName = 'test-connector';

      // Мокируем ответ от API с ошибкой
      global.$http.get.mockReturnValue({
        statusCode: 400,
        body: { error: 'API error' }
      });

      // Act & Assert
      expect(() => checkSubscription(apiKey, connectorName))
        .toThrow('Ошибка проверки подписки: API error');
    });
  });
});
```

### Интеграционное тестирование

Интеграционное тестирование направлено на проверку взаимодействия между различными компонентами коннектора и внешними системами.

**Что тестируется**:
- Взаимодействие с API BPM Centr
- Взаимодействие с внешним API
- Взаимодействие между модулями коннектора
- Преобразование данных между системами

**Инструменты**:
- Jest
- Nock (для мокирования HTTP-запросов)
- Supertest (для тестирования API)

**Пример интеграционного теста**:

```javascript
// get-contact.test.js
const nock = require('nock');
const fs = require('fs');
const path = require('path');

// Загружаем JSON-конфигурацию модуля
const getContactModule = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../app/modules/actions/get-contact.json'), 'utf8')
);

// Мокируем глобальные функции Make
global.checkSubscription = jest.fn();

describe('Get Contact Module', () => {
  beforeEach(() => {
    // Мокируем API для получения контакта
    nock('https://api.example.com/v1')
      .get('/contacts/12345')
      .reply(200, {
        id: '12345',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        created_at: '2023-01-15T10:30:00Z'
      });

    // Сбрасываем моки между тестами
    global.checkSubscription.mockReset();
    global.checkSubscription.mockReturnValue(true);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('communication section', () => {
    it('should correctly format the request URL', () => {
      // Arrange
      const parameters = {
        contactId: '12345'
      };
      const connection = {
        apiKey: 'test-api-key',
        bpmCentrApiKey: 'test-bpm-api-key'
      };

      // Проверяем URL запроса
      const url = getContactModule.communication.url;
      const formattedUrl = url.replace('{{parameters.contactId}}', parameters.contactId);

      // Assert
      expect(formattedUrl).toBe('/contacts/12345');
    });

    it('should correctly map response to output', () => {
      // Arrange
      const responseBody = {
        id: '12345',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        created_at: '2023-01-15T10:30:00Z'
      };

      // Имитируем обработку ответа согласно конфигурации
      const output = {};
      const outputMapping = getContactModule.communication.response.output;

      // Применяем маппинг (упрощенная версия того, что делает Make)
      for (const [key, value] of Object.entries(outputMapping)) {
        // Заменяем {{body.field}} на значение из responseBody
        const match = value.match(/{{body\.([^}]+)}}/);
        if (match) {
          const fieldName = match[1];
          output[key] = responseBody[fieldName];
        } else if (value.includes('formatDate')) {
          // Упрощенная обработка форматирования даты
          const dateMatch = value.match(/formatDate\(body\.([^,]+)/);
          if (dateMatch) {
            const fieldName = dateMatch[1];
            output[key] = responseBody[fieldName].split('T')[0]; // Упрощенное форматирование
          }
        }
      }

      // Assert
      expect(output).toEqual({
        id: '12345',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        createdAt: '2023-01-15T10:30:00Z' // Предполагаем, что форматирование даты работает
      });
    });

    it('should check subscription status', () => {
      // Arrange
      const connection = {
        bpmCentrApiKey: 'test-bpm-api-key'
      };

      // Имитируем вызов проверки подписки из wrapper
      const wrapper = getContactModule.communication.response.wrapper;
      const subscriptionCheck = wrapper.subscription;

      // Извлекаем параметры вызова функции checkSubscription
      const match = subscriptionCheck.match(/checkSubscription\(([^,]+),\s*'([^']+)'/);
      const apiKeyParam = match[1];
      const connectorNameParam = match[2];

      // Проверяем, что параметры соответствуют ожидаемым
      expect(apiKeyParam).toBe('connection.bpmCentrApiKey');
      expect(connectorNameParam).toBe('mycrm');

      // Имитируем вызов функции с реальными параметрами
      const result = global.checkSubscription(connection.bpmCentrApiKey, 'mycrm');

      // Assert
      expect(global.checkSubscription).toHaveBeenCalledWith(connection.bpmCentrApiKey, 'mycrm');
      expect(result).toBe(true);
    });
  });
});
```

### Функциональное тестирование

Функциональное тестирование направлено на проверку соответствия коннектора функциональным требованиям и пользовательским сценариям.

**Что тестируется**:
- Полный цикл работы коннектора
- Соответствие требованиям
- Пользовательские сценарии
- Обработка ошибок и исключительных ситуаций

**Инструменты**:
- Postman
- Make API
- Ручное тестирование в интерфейсе Make

**Пример функционального теста**:

```javascript
// Пример тестового сценария в Make
const scenario = {
  name: 'Тестирование создания контакта',
  blueprint: {
    modules: [
      {
        name: 'webhook',
        type: 'trigger',
        provider: 'builtin',
        connection: 'webhook',
        metadata: {
          designer: {
            x: 0,
            y: 0
          }
        },
        parameters: {
          mode: 'simple'
        }
      },
      {
        name: 'createContact',
        type: 'action',
        provider: 'mycrm',
        connection: 'api_key',
        metadata: {
          designer: {
            x: 300,
            y: 0
          }
        },
        parameters: {
          name: 'Тестовый контакт',
          email: 'test@example.com',
          phone: '+7 (999) 123-45-67'
        }
      },
      {
        name: 'getContact',
        type: 'action',
        provider: 'mycrm',
        connection: 'api_key',
        metadata: {
          designer: {
            x: 600,
            y: 0
          }
        },
        parameters: {
          contactId: '{{2.id}}'
        }
      }
    ],
    connections: [
      {
        from: {
          moduleId: 1,
          port: 'output'
        },
        to: {
          moduleId: 2,
          port: 'input'
        }
      },
      {
        from: {
          moduleId: 2,
          port: 'output'
        },
        to: {
          moduleId: 3,
          port: 'input'
        }
      }
    ]
  }
};

// Запуск сценария и проверка результатов
async function testScenario() {
  // Создаем сценарий через Make API
  const createdScenario = await makeApi.createScenario(scenario);

  // Запускаем сценарий
  const execution = await makeApi.executeScenario(createdScenario.id);

  // Получаем результаты выполнения
  const result = await makeApi.getExecutionResult(execution.id);

  // Проверка результатов
  expect(result.modules[1].output.id).toBeDefined();
  expect(result.modules[1].output.name).toBe('Тестовый контакт');
  expect(result.modules[1].output.email).toBe('test@example.com');

  expect(result.modules[2].output.id).toBe(result.modules[1].output.id);
  expect(result.modules[2].output.name).toBe('Тестовый контакт');
  expect(result.modules[2].output.email).toBe('test@example.com');

  // Удаляем тестовый сценарий
  await makeApi.deleteScenario(createdScenario.id);
}
```

### Нагрузочное тестирование

Нагрузочное тестирование направлено на проверку производительности коннектора при высокой нагрузке и определение его предельных возможностей.

**Что тестируется**:
- Производительность при высокой нагрузке
- Время отклика
- Использование ресурсов
- Стабильность при длительной работе

**Инструменты**:
- Artillery
- JMeter
- k6

**Пример нагрузочного теста**:

```yaml
# artillery-test.yml
config:
  target: "https://api.example.com/v1"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 20
      name: "Разогрев"
    - duration: 120
      arrivalRate: 20
      name: "Постоянная нагрузка"
  defaults:
    headers:
      X-API-Key: "{{apiKey}}"
      Content-Type: "application/json"
  variables:
    apiKey: "test-api-key"

scenarios:
  - name: "Получение и создание контактов"
    flow:
      - get:
          url: "/contacts?limit=10"
          capture:
            - json: "$.items[0].id"
              as: "contactId"
      - get:
          url: "/contacts/{{contactId}}"
      - post:
          url: "/contacts"
          json:
            name: "Тестовый контакт"
            email: "test-{{$randomString(10)}}@example.com"
            phone: "+7 (999) 123-45-67"
      - think: 1
      - get:
          url: "/contacts?query=Тестовый"
          expect:
            - statusCode: 200
            - contentType: "application/json"
```

## Методология тестирования

### Подготовка тестовых данных

1. **Создание тестовых аккаунтов**
   - Создайте тестовые аккаунты во внешних сервисах
   - Настройте тестовые данные в этих аккаунтах
   - Обеспечьте изоляцию тестовых данных от продакшн-данных

2. **Подготовка тестовых наборов данных**
   - Создайте наборы данных для различных сценариев тестирования
   - Подготовьте данные для позитивных и негативных тестов
   - Обеспечьте воспроизводимость тестовых данных

3. **Настройка тестового окружения**
   - Настройте тестовое окружение, изолированное от продакшн-окружения
   - Настройте доступы и права для тестирования
   - Подготовьте инструменты для мониторинга и анализа результатов тестирования

### Автоматизация тестирования

1. **Разработка автоматических тестов**
   - Создайте набор автоматических тестов для различных уровней тестирования
   - Обеспечьте покрытие всех критических функций
   - Реализуйте тесты для проверки граничных условий и обработки ошибок

2. **Настройка CI/CD для запуска тестов**
   - Интегрируйте тесты в процесс CI/CD
   - Настройте автоматический запуск тестов при изменении кода
   - Настройте отчеты о результатах тестирования

3. **Мониторинг результатов тестирования**
   - Анализируйте результаты тестирования
   - Отслеживайте тренды и паттерны ошибок
   - Используйте результаты тестирования для улучшения качества кода

### Тестирование в различных окружениях

1. **Тестирование в разработческом окружении**
   - Тестирование во время разработки
   - Быстрая обратная связь для разработчиков
   - Проверка базовой функциональности

2. **Тестирование в тестовом окружении**
   - Полное тестирование перед выпуском
   - Проверка интеграции с другими системами
   - Тестирование производительности и безопасности

3. **Тестирование в продакшн-окружении**
   - Проверка работоспособности в реальных условиях
   - Мониторинг производительности и стабильности
   - Сбор обратной связи от пользователей

## Чек-лист тестирования коннектора

### Базовая функциональность

- [ ] Аутентификация работает корректно
- [ ] Все операции выполняются успешно
- [ ] Все триггеры срабатывают корректно
- [ ] Обработка ошибок работает правильно
- [ ] Проверка подписки работает корректно

### Обработка данных

- [ ] Корректное преобразование данных
- [ ] Правильная обработка специальных символов
- [ ] Корректная работа с большими объемами данных
- [ ] Правильная обработка пустых значений
- [ ] Корректная обработка дат и времени

### Производительность

- [ ] Время отклика в пределах допустимых значений
- [ ] Оптимальное использование ресурсов
- [ ] Корректная работа при высокой нагрузке
- [ ] Эффективное использование кэширования
- [ ] Стабильность при длительной работе

### Безопасность

- [ ] Безопасное хранение учетных данных
- [ ] Защита от инъекций и других атак
- [ ] Соответствие требованиям безопасности
- [ ] Корректная обработка конфиденциальных данных
- [ ] Проверка прав доступа

### Интеграция

- [ ] Корректная интеграция с API BPM Centr
- [ ] Корректная интеграция с внешним API
- [ ] Совместимость с различными версиями API
- [ ] Корректная обработка изменений в API
- [ ] Соответствие документации API

### Пользовательский опыт

- [ ] Понятные и информативные сообщения об ошибках
- [ ] Корректное отображение в интерфейсе Make
- [ ] Удобство использования и настройки
- [ ] Соответствие ожиданиям пользователей
- [ ] Качество документации и примеров

## Инструменты для тестирования

### Инструменты для модульного и интеграционного тестирования

1. **Jest** - фреймворк для тестирования JavaScript/TypeScript
   - Простой и мощный синтаксис
   - Встроенные моки и стабы
   - Поддержка асинхронного кода
   - Генерация отчетов о покрытии

2. **Mocha + Chai** - комбинация фреймворка и библиотеки утверждений
   - Гибкая настройка
   - Поддержка различных стилей утверждений
   - Хорошая интеграция с другими инструментами

3. **Sinon** - библиотека для создания моков, стабов и шпионов
   - Мокирование функций и объектов
   - Отслеживание вызовов функций
   - Имитация поведения внешних зависимостей

4. **Nock** - библиотека для мокирования HTTP-запросов
   - Перехват и мокирование HTTP-запросов
   - Проверка отправленных запросов
   - Имитация различных ответов сервера

### Инструменты для функционального тестирования

1. **Postman** - инструмент для тестирования API
   - Создание и выполнение HTTP-запросов
   - Автоматизация тестирования API
   - Создание коллекций тестов
   - Генерация отчетов

2. **Make API** - API для управления сценариями в Make
   - Создание и запуск сценариев
   - Получение результатов выполнения
   - Автоматизация тестирования в Make

3. **Cypress** - инструмент для end-to-end тестирования
   - Тестирование веб-интерфейсов
   - Запись и воспроизведение действий пользователя
   - Визуальное отображение процесса тестирования

### Инструменты для нагрузочного тестирования

1. **Artillery** - инструмент для нагрузочного тестирования
   - Создание сценариев нагрузки
   - Генерация отчетов о производительности
   - Интеграция с CI/CD

2. **JMeter** - инструмент для нагрузочного тестирования
   - Широкие возможности настройки
   - Поддержка различных протоколов
   - Визуальное представление результатов

3. **k6** - современный инструмент для нагрузочного тестирования
   - JavaScript API
   - Высокая производительность
   - Интеграция с облачными платформами

## Лучшие практики тестирования

### Организация тестов

1. **Структурируйте тесты по уровням**
   - Модульные тесты
   - Интеграционные тесты
   - Функциональные тесты
   - Нагрузочные тесты

2. **Группируйте тесты по функциональности**
   - Тесты аутентификации
   - Тесты операций
   - Тесты триггеров
   - Тесты обработки ошибок

3. **Используйте описательные имена тестов**
   - Указывайте, что тестируется
   - Указывайте ожидаемый результат
   - Используйте понятные и информативные имена

### Написание эффективных тестов

1. **Следуйте принципу AAA (Arrange-Act-Assert)**
   - Arrange: подготовка данных и окружения
   - Act: выполнение тестируемого кода
   - Assert: проверка результатов

2. **Тестируйте граничные условия**
   - Пустые значения
   - Максимальные и минимальные значения
   - Специальные символы и форматы

3. **Изолируйте тесты**
   - Каждый тест должен быть независимым
   - Используйте моки и стабы для изоляции
   - Очищайте состояние между тестами

### Автоматизация и CI/CD

1. **Интегрируйте тесты в CI/CD**
   - Запускайте тесты при каждом коммите
   - Блокируйте слияние при неуспешных тестах
   - Генерируйте отчеты о покрытии

2. **Оптимизируйте время выполнения тестов**
   - Запускайте тесты параллельно
   - Используйте кэширование
   - Приоритизируйте критические тесты

3. **Мониторьте качество тестов**
   - Отслеживайте покрытие кода
   - Анализируйте стабильность тестов
   - Улучшайте тесты на основе обратной связи

## Связанные разделы

- [Обзор коннекторов](overview.md)
- [Структура коннекторов](structure.md)
- [Разработка коннекторов](development.md)
- [Примеры коннекторов](examples/)
