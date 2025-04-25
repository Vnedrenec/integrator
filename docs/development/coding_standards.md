# Стандарты кодирования

В этом документе описаны стандарты кодирования, принятые в проекте "BPM Centr". Соблюдение этих стандартов обеспечивает единообразие кода, улучшает его читаемость и упрощает поддержку.

## Содержание
- [Общие принципы](#общие-принципы)
- [TypeScript](#typescript)
- [NestJS](#nestjs)
- [React](#react)
- [Базы данных](#базы-данных)
- [Тестирование](#тестирование)
- [Документация](#документация)
- [Git и контроль версий](#git-и-контроль-версий)
- [Code Review](#code-review)

## Общие принципы

### Именование
- Используйте **camelCase** для переменных, функций и методов
- Используйте **PascalCase** для классов, интерфейсов, типов и компонентов React
- Используйте **UPPER_CASE** для констант
- Используйте **kebab-case** для файлов и директорий

### Форматирование
- Используйте 2 пробела для отступов
- Максимальная длина строки: 100 символов
- Используйте одинарные кавычки (`'`) для строк
- Всегда добавляйте точку с запятой (`;`) в конце выражений
- Используйте фигурные скобки для всех блоков, даже для однострочных

### Комментарии
- Используйте JSDoc для документирования функций, классов и методов
- Комментируйте сложную логику и неочевидные решения
- Избегайте комментариев, которые просто повторяют код
- Используйте `TODO:`, `FIXME:` и `NOTE:` для обозначения задач

### Структура кода
- Следуйте принципу "один файл - одна ответственность"
- Группируйте связанные функции и классы
- Используйте модули для организации кода
- Следуйте принципам SOLID

## TypeScript

### Типизация
- Всегда указывайте типы для параметров функций и возвращаемых значений
- Используйте интерфейсы для описания объектов
- Избегайте использования `any`, предпочитайте `unknown` или конкретные типы
- Используйте дженерики для создания переиспользуемых компонентов

```typescript
// Плохо
function getUser(id) {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

// Хорошо
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json() as Promise<User>;
}
```

### Импорты
- Группируйте импорты в следующем порядке:
  1. Внешние библиотеки
  2. Внутренние модули
  3. Типы и интерфейсы
  4. Стили и ресурсы
- Сортируйте импорты в алфавитном порядке внутри каждой группы

```typescript
// Внешние библиотеки
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Внутренние модули
import { UserService } from '../services/user.service';
import { createUserDto } from './dto/create-user.dto';

// Типы и интерфейсы
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';

// Стили и ресурсы
import '../styles/user.css';
```

### Асинхронный код
- Используйте `async/await` вместо цепочек промисов
- Обрабатывайте ошибки с помощью `try/catch`
- Используйте `Promise.all` для параллельного выполнения независимых асинхронных операций

```typescript
// Плохо
function getUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(user => {
      return fetch(`/api/subscriptions/${user.subscriptionId}`)
        .then(res => res.json())
        .then(subscription => {
          return { user, subscription };
        });
    })
    .catch(error => console.error(error));
}

// Хорошо
async function getUserData(userId: string): Promise<{ user: User; subscription: Subscription }> {
  try {
    const userResponse = await fetch(`/api/users/${userId}`);
    const user = await userResponse.json() as User;

    const subscriptionResponse = await fetch(`/api/subscriptions/${user.subscriptionId}`);
    const subscription = await subscriptionResponse.json() as Subscription;

    return { user, subscription };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}
```

## NestJS

### Модули
- Каждый модуль должен иметь свою директорию
- Файл модуля должен экспортировать класс с декоратором `@Module`
- Модуль должен импортировать все необходимые зависимости
- Модуль должен экспортировать все сервисы, которые будут использоваться в других модулях

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

### Контроллеры
- Используйте декораторы для определения маршрутов и методов HTTP
- Используйте DTO для валидации входящих данных
- Используйте декораторы `@Param`, `@Query`, `@Body` для получения параметров
- Используйте декораторы `@UseGuards` для защиты маршрутов

```typescript
// src/users/controllers/users.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
```

### Сервисы
- Используйте декоратор `@Injectable` для сервисов
- Внедряйте зависимости через конструктор
- Используйте интерфейсы для определения контрактов сервисов
- Обрабатывайте ошибки и выбрасывайте исключения NestJS

```typescript
// src/users/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
```

### Исключения
- Используйте встроенные исключения NestJS (`NotFoundException`, `BadRequestException` и т.д.)
- Добавляйте информативные сообщения об ошибках
- Используйте фильтры исключений для обработки ошибок на уровне приложения

```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : exceptionResponse,
    });
  }
}
```

## React

### Компоненты
- Используйте функциональные компоненты и хуки
- Разделяйте компоненты на презентационные и контейнеры
- Используйте TypeScript для типизации пропсов и состояния
- Используйте мемоизацию для оптимизации производительности

```typescript
// Презентационный компонент
import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  onEdit: (id: string) => void;
  id: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, onEdit, id }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={() => onEdit(id)}>Edit</button>
    </div>
  );
};

// Контейнер
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../store/actions/userActions';
import { UserCard } from '../components/UserCard';
import { RootState } from '../store/types';

export const UserContainer: React.FC<{ userId: string }> = ({ userId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users.currentUser);
  const loading = useSelector((state: RootState) => state.users.loading);

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [dispatch, userId]);

  const handleEdit = (id: string) => {
    // Логика редактирования
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <UserCard
      id={user.id}
      name={`${user.firstName} ${user.lastName}`}
      email={user.email}
      onEdit={handleEdit}
    />
  ) : null;
};
```

### Хуки
- Создавайте пользовательские хуки для переиспользуемой логики
- Следуйте правилам хуков React
- Используйте хуки для работы с состоянием, эффектами и контекстом

```typescript
// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { Subscription } from '../types/subscription';
import { fetchSubscription } from '../api/subscriptionApi';

export const useSubscription = (userId: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getSubscription = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscription(userId);
        setSubscription(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    getSubscription();
  }, [userId]);

  return { subscription, loading, error };
};
```

### Redux
- Используйте Redux Toolkit для управления состоянием
- Разделяйте состояние на слайсы
- Используйте селекторы для доступа к состоянию
- Используйте типизацию для действий и редьюсеров

```typescript
// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.loading = false;
    },
    fetchUserFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUserStart, fetchUserSuccess, fetchUserFailure } = userSlice.actions;
export default userSlice.reducer;
```

## Базы данных

### Миграции
- Используйте миграции для изменения схемы базы данных
- Каждая миграция должна быть атомарной и обратимой
- Используйте осмысленные имена для миграций
- Тестируйте миграции перед применением в продакшене

```typescript
// src/migrations/1682609600000-CreateUserTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1682609600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'last_name',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### Запросы
- Используйте параметризованные запросы для предотвращения SQL-инъекций
- Используйте транзакции для атомарных операций
- Оптимизируйте запросы для производительности
- Используйте индексы для часто используемых полей в запросах

```typescript
// Пример использования транзакций
async createUserWithSubscription(userData: CreateUserDto, connectorId: string, makeAccountId: string): Promise<User> {
  const queryRunner = this.connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Создание пользователя
    const user = queryRunner.manager.create(User, userData);
    await queryRunner.manager.save(user);

    // Создание подписки
    const subscription = queryRunner.manager.create(Subscription, {
      userId: user.id,
      connectorId,
      makeAccountId,
      status: SubscriptionStatus.TRIAL,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    });
    await queryRunner.manager.save(subscription);

    await queryRunner.commitTransaction();

    return user;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

## Тестирование

### Модульные тесты
- Тестируйте каждую функцию и класс отдельно
- Используйте моки для изоляции тестируемого кода
- Следуйте принципу "один тест - одна проверка"
- Используйте осмысленные имена для тестов

```typescript
// src/users/services/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
```

### Интеграционные тесты
- Тестируйте взаимодействие между компонентами
- Используйте тестовую базу данных
- Очищайте данные после каждого теста
- Используйте фикстуры для подготовки данных

```typescript
// src/users/controllers/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { getConnection } from 'typeorm';
import { User } from '../entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получение токена аутентификации
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  beforeEach(async () => {
    // Очистка таблицы пользователей перед каждым тестом
    await getConnection().createQueryBuilder().delete().from(User).execute();
  });

  it('/users (POST) should create a new user', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.firstName).toBe(newUser.firstName);
    expect(response.body.lastName).toBe(newUser.lastName);
    expect(response.body).not.toHaveProperty('password');
  });
});
```

## Документация

### Документация кода
- Используйте JSDoc для документирования функций, классов и методов
- Документируйте параметры, возвращаемые значения и исключения
- Добавляйте примеры использования для сложных функций
- Обновляйте документацию при изменении кода

```typescript
/**
 * Сервис для управления подписками пользователей.
 */
@Injectable()
export class SubscriptionService {
  /**
   * Создает новую подписку для пользователя.
   *
   * @param userId - ID пользователя
   * @param connectorId - ID коннектора
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

### Документация API
- Используйте Swagger/OpenAPI для документирования API
- Документируйте все эндпоинты, параметры и ответы
- Добавляйте примеры запросов и ответов
- Группируйте эндпоинты по тегам

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
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.createSubscription(
      createSubscriptionDto.userId,
      createSubscriptionDto.connectorId,
      createSubscriptionDto.makeAccountId,
    );
  }
}
```

## Git и контроль версий

### Ветвление
- Используйте GitFlow или Trunk-Based Development
- Создавайте отдельные ветки для каждой задачи
- Используйте осмысленные имена для веток
- Регулярно обновляйте ветки из основной ветки

### Коммиты
- Используйте осмысленные сообщения коммитов
- Следуйте формату Conventional Commits
- Включайте номер задачи в сообщение коммита
- Делайте небольшие атомарные коммиты

```
feat(auth): add email verification #123

- Add email verification service
- Send verification email on registration
- Verify email token and activate user account
```

### Pull Requests
- Создавайте Pull Request для каждой задачи
- Добавляйте описание изменений
- Связывайте Pull Request с задачей
- Запрашивайте ревью у других разработчиков

## Code Review

### Процесс ревью
1. Автор создает Pull Request и назначает ревьюеров
2. Ревьюеры проверяют код и оставляют комментарии
3. Автор вносит изменения в соответствии с комментариями
4. Ревьюеры одобряют Pull Request
5. Автор или ответственный за слияние выполняет merge

### Критерии ревью
- Соответствие стандартам кодирования
- Корректность реализации
- Производительность и оптимизация
- Тестирование
- Документация
- Безопасность

### Чек-лист для ревью
- [ ] Код соответствует стандартам кодирования
- [ ] Реализация соответствует требованиям задачи
- [ ] Добавлены тесты для новой функциональности
- [ ] Все тесты проходят успешно
- [ ] Документация обновлена
- [ ] Нет проблем с производительностью
- [ ] Нет проблем с безопасностью
- [ ] Код легко читается и понимается
