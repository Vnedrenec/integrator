# Рекомендации по разработке

В этом документе представлены рекомендации и лучшие практики для разработки проекта "BPM Centr".

## Содержание
- [Процесс разработки](#процесс-разработки)
- [Работа с Git](#работа-с-git)
- [Лучшие практики кодирования](#лучшие-практики-кодирования)
- [Обработка ошибок](#обработка-ошибок)
- [Безопасность](#безопасность)
- [Производительность](#производительность)
- [Документирование кода](#документирование-кода)

## Процесс разработки

### Методология разработки
- Используется методология Agile/Scrum
- Спринты длительностью 2 недели
- Ежедневные stand-up встречи
- Планирование спринта в начале каждого спринта
- Ретроспектива в конце каждого спринта

### Управление задачами
- Все задачи отслеживаются в Jira
- Каждая задача должна иметь:
  - Четкое описание
  - Критерии приемки
  - Оценку сложности (в story points)
  - Приоритет
- Статусы задач:
  - To Do
  - In Progress
  - Code Review
  - QA
  - Done

### Процесс Code Review
1. Разработчик создает Pull Request (PR) и назначает ревьюеров
2. Ревьюеры проверяют код и оставляют комментарии
3. Разработчик вносит изменения в соответствии с комментариями
4. Ревьюеры одобряют PR
5. PR сливается в целевую ветку

### Definition of Done
- Код соответствует требованиям задачи
- Код соответствует стандартам кодирования
- Написаны тесты с достаточным покрытием
- Все тесты проходят успешно
- Код прошел Code Review
- Документация обновлена
- PR слит в целевую ветку

## Работа с Git

### Модель ветвления
- Используется GitFlow:
  - `main` - стабильная версия для продакшена
  - `develop` - основная ветка разработки
  - `feature/*` - ветки для новых функций
  - `bugfix/*` - ветки для исправления ошибок
  - `release/*` - ветки для подготовки релизов
  - `hotfix/*` - ветки для срочных исправлений в продакшене

### Именование веток
- `feature/JIRA-123-short-description` - для новых функций
- `bugfix/JIRA-456-short-description` - для исправления ошибок
- `release/v1.2.3` - для релизов
- `hotfix/v1.2.4-short-description` - для срочных исправлений

### Коммиты
- Используйте формат Conventional Commits:
  - `feat: добавлена функция X`
  - `fix: исправлена ошибка Y`
  - `docs: обновлена документация Z`
  - `refactor: переработан компонент W`
  - `test: добавлены тесты для V`
  - `chore: обновлены зависимости`
- Включайте номер задачи в сообщение коммита:
  - `feat(auth): добавлена двухфакторная аутентификация [JIRA-123]`

### Pull Requests
- Название PR должно содержать номер задачи и краткое описание
- Описание PR должно содержать:
  - Ссылку на задачу
  - Описание изменений
  - Инструкции по тестированию
  - Скриншоты (если применимо)
- PR должен быть небольшим и сфокусированным на одной задаче
- PR должен проходить все автоматические проверки (CI)

## Лучшие практики кодирования

### Общие принципы
- Следуйте принципам SOLID
- Пишите чистый, читаемый и поддерживаемый код
- Избегайте дублирования кода (DRY)
- Используйте типизацию везде, где это возможно
- Избегайте использования `any` в TypeScript
- Используйте асинхронные операции с `async/await`

### Структура проекта
- Следуйте принципам Clean Architecture
- Разделяйте код на слои:
  - Domain (сущности и бизнес-правила)
  - Application (сценарии использования)
  - Infrastructure (реализация репозиториев, внешние сервисы)
  - Interfaces (контроллеры, представления)
- Используйте модульную структуру для организации кода

### Именование
- Используйте осмысленные и описательные имена
- Следуйте соглашениям об именовании для каждого языка и фреймворка
- Избегайте сокращений и аббревиатур, кроме общепринятых

### Функции и методы
- Функции должны быть небольшими и выполнять одну задачу
- Ограничивайте количество параметров (не более 3-4)
- Используйте объекты для передачи множества параметров
- Избегайте побочных эффектов
- Возвращайте ранний результат для упрощения логики

### Классы и объекты
- Классы должны быть небольшими и иметь одну ответственность
- Используйте композицию вместо наследования
- Инкапсулируйте внутреннее состояние
- Используйте интерфейсы для определения контрактов

## Обработка ошибок

### Стратегия обработки ошибок
- Используйте исключения для обработки ошибок
- Создавайте пользовательские классы исключений для разных типов ошибок
- Обрабатывайте исключения на соответствующем уровне
- Логируйте ошибки с достаточным контекстом

### Типы ошибок
- Ошибки валидации (400 Bad Request)
- Ошибки аутентификации (401 Unauthorized)
- Ошибки авторизации (403 Forbidden)
- Ошибки не найдено (404 Not Found)
- Ошибки конфликта (409 Conflict)
- Внутренние ошибки сервера (500 Internal Server Error)

### Пример обработки ошибок в NestJS

```typescript
// Создание пользовательского исключения
export class SubscriptionExpiredException extends HttpException {
  constructor(message = 'Subscription has expired') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

// Использование исключения
async validateSubscription(userId: string): Promise<void> {
  const subscription = await this.subscriptionRepository.findActiveByUserId(userId);

  if (!subscription) {
    throw new SubscriptionExpiredException();
  }

  if (subscription.status === SubscriptionStatus.PAYMENT_PENDING) {
    // Проверка грейс-периода
    const gracePeriodEnd = new Date(subscription.endDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 дня грейс-периода

    if (new Date() > gracePeriodEnd) {
      throw new SubscriptionExpiredException('Grace period has ended');
    }
  }
}

// Глобальный фильтр исключений
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : exceptionResponse,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception.stack,
      `ExceptionFilter`
    );

    response.status(status).json(errorResponse);
  }
}
```

## Безопасность

### Аутентификация и авторизация
- Используйте JWT для аутентификации
- Храните токены безопасно (HttpOnly cookies для refresh token)
- Используйте RBAC для авторизации
- Проверяйте права доступа на уровне контроллеров и сервисов

### Защита от уязвимостей
- Защита от SQL-инъекций: используйте параметризованные запросы и ORM
- Защита от XSS: экранируйте пользовательский ввод
- Защита от CSRF: используйте CSRF-токены
- Защита от брутфорс-атак: ограничивайте количество попыток входа

### Безопасность данных
- Шифруйте чувствительные данные в базе данных
- Используйте HTTPS для всех коммуникаций
- Не храните секреты в коде или репозитории
- Регулярно обновляйте зависимости для устранения уязвимостей

### Пример защиты от брутфорс-атак

```typescript
// Middleware для ограничения количества попыток входа
@Injectable()
export class LoginRateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const email = req.body.email;
    const key = `login:${ip}:${email}`;

    const attempts = await this.redisService.get(key);
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    const blockDuration = this.configService.get<number>('LOGIN_BLOCK_DURATION', 15 * 60); // 15 минут

    if (attempts && parseInt(attempts) >= maxAttempts) {
      throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Увеличиваем счетчик попыток
    if (attempts) {
      await this.redisService.set(key, parseInt(attempts) + 1, blockDuration);
    } else {
      await this.redisService.set(key, 1, blockDuration);
    }

    next();
  }
}
```

## Производительность

### Оптимизация запросов к базе данных
- Используйте индексы для часто запрашиваемых полей
- Оптимизируйте запросы (SELECT только нужные поля)
- Используйте пагинацию для больших наборов данных
- Используйте кэширование для часто запрашиваемых данных

### Кэширование
- Используйте Redis для кэширования данных
- Кэшируйте результаты запросов к внешним API
- Используйте стратегии инвалидации кэша
- Настройте TTL (время жизни) для кэшированных данных

### Асинхронная обработка
- Используйте очереди для длительных операций
- Обрабатывайте вебхуки асинхронно
- Используйте фоновые задачи для отправки email и других уведомлений

### Пример кэширования с использованием Redis

```typescript
// Сервис для кэширования
@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const defaultTtl = this.configService.get<number>('CACHE_TTL', 3600); // 1 час
    await this.redisService.set(key, JSON.stringify(value), ttl || defaultTtl);
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}

// Использование кэширования в сервисе
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;

    // Попытка получить данные из кэша
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Если данных нет в кэше, получаем из базы
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Сохраняем данные в кэш
    await this.cacheService.set(cacheKey, user);

    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.userRepository.update(id, userData);

    // Инвалидируем кэш
    await this.cacheService.delete(`user:${id}`);

    return user;
  }
}
```

## Документирование кода

### JSDoc
- Документируйте все публичные функции, классы и методы
- Описывайте параметры, возвращаемые значения и исключения
- Добавляйте примеры использования для сложных функций
- Обновляйте документацию при изменении кода

### Пример JSDoc

```typescript
/**
 * Сервис для управления подписками пользователей.
 */
@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly stripeService: StripeService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Создает новую подписку для пользователя.
   *
   * @param userId - ID пользователя
   * @param connectorId - ID коннектора
   * @param makeAccountId - ID аккаунта Make
   * @returns Созданная подписка
   * @throws NotFoundException - Если пользователь или план не найдены
   * @throws BadRequestException - Если у пользователя уже есть активная подписка
   *
   * @example
   * ```typescript
   * const subscription = await subscriptionService.createSubscription('user-id', 'connector-id', 'make-account-id');
   * console.log(subscription.id);
   * ```
   */
  async createSubscription(userId: string, connectorId: string, makeAccountId: string): Promise<Subscription> {
    // Реализация
  }
}
```

### Swagger/OpenAPI
- Используйте декораторы Swagger для документирования API
- Документируйте все эндпоинты, параметры и ответы
- Добавляйте примеры запросов и ответов
- Группируйте эндпоинты по тегам

### Пример Swagger

```typescript
@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription created successfully', type: Subscription })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or connector not found' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.createSubscription(
      createSubscriptionDto.userId,
      createSubscriptionDto.connectorId,
      createSubscriptionDto.makeAccountId,
    );
  }
}
```
