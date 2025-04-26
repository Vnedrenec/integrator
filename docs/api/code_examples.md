# Примеры кода для ключевых компонентов

В этом документе представлены примеры кода для ключевых компонентов системы "BPM Centr", которые помогут разработчикам быстрее понять структуру проекта и начать разработку.

## Содержание
- [Структура проекта](#структура-проекта)
- [Модели данных](#модели-данных)
- [Репозитории](#репозитории)
- [Сервисы](#сервисы)
- [Контроллеры](#контроллеры)
- [Middleware](#middleware)
- [Валидация](#валидация)
- [Аутентификация](#аутентификация)
- [Интеграции](#интеграции)

## Структура проекта

Пример структуры файлов и директорий для бэкенда:

```
backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── subscription.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   └── api-key.entity.ts
│   │   ├── repositories/
│   │   │   ├── user.repository.interface.ts
│   │   │   ├── subscription.repository.interface.ts
│   │   │   └── payment.repository.interface.ts
│   │   └── services/
│   │       ├── auth.service.interface.ts
│   │       ├── subscription.service.interface.ts
│   │       └── payment.service.interface.ts
│   ├── application/
│   │   ├── use_cases/
│   │   │   ├── auth/
│   │   │   │   ├── register.use-case.ts
│   │   │   │   ├── login.use-case.ts
│   │   │   │   └── verify-email.use-case.ts
│   │   │   ├── subscription/
│   │   │   │   ├── create-subscription.use-case.ts
│   │   │   │   ├── cancel-subscription.use-case.ts
│   │   │   │   └── resume-subscription.use-case.ts
│   │   │   └── payment/
│   │   │       ├── process-payment.use-case.ts
│   │   │       └── update-payment-method.use-case.ts
│   │   ├── interfaces/
│   │   │   ├── stripe.interface.ts
│   │   │   ├── sendpulse.interface.ts
│   │   │   └── make.interface.ts
│   │   └── dto/
│   │       ├── auth/
│   │       │   ├── register.dto.ts
│   │       │   └── login.dto.ts
│   │       ├── subscription/
│   │       │   └── subscription.dto.ts
│   │       └── payment/
│   │           └── payment.dto.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── typeorm-config.ts
│   │   ├── external_services/
│   │   │   ├── stripe/
│   │   │   │   ├── stripe.service.ts
│   │   │   │   └── stripe.module.ts
│   │   │   ├── sendpulse/
│   │   │   │   ├── sendpulse.service.ts
│   │   │   │   └── sendpulse.module.ts
│   │   │   └── make/
│   │   │       ├── make.service.ts
│   │   │       └── make.module.ts
│   │   ├── repositories/
│   │   │   ├── typeorm/
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── subscription.repository.ts
│   │   │   │   └── payment.repository.ts
│   │   │   └── repositories.module.ts
│   │   └── security/
│   │       ├── jwt/
│   │       │   ├── jwt.strategy.ts
│   │       │   └── jwt.service.ts
│   │       └── security.module.ts
│   ├── interfaces/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── subscription.controller.ts
│   │   │   │   └── payment.controller.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── error-handler.middleware.ts
│   │   │   └── api.module.ts
│   │   ├── web/
│   │   │   └── web.module.ts
│   │   └── jobs/
│   │       ├── subscription-reminder.job.ts
│   │       └── jobs.module.ts
│   └── main.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── nest-cli.json
├── package.json
├── tsconfig.json
└── .env.example
```

## Модели данных

### Пример модели User (TypeORM Entity)

```typescript
// src/domain/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';
import { ApiKey } from './api-key.entity';
import { Payment } from './payment.entity';

/**
 * Перечисление ролей пользователей в системе
 * USER - обычный пользователь
 * ADMIN - администратор с расширенными правами
 * SUPERADMIN - суперадминистратор с полным доступом
 * SUPPORT - сотрудник технической поддержки
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  SUPPORT = 'support',
}

/**
 * Перечисление статусов пользователя
 * UNVERIFIED - email не подтвержден
 * ACTIVE - активный пользователь
 * BLOCKED - заблокированный пользователь
 */
export enum UserStatus {
  UNVERIFIED = 'unverified',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

/**
 * Сущность пользователя в системе
 * Хранит основную информацию о пользователе и его статусе
 */
@Entity('users')
export class User {
  // Уникальный идентификатор пользователя
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Email пользователя (уникальный)
  @Column({ unique: true })
  email: string;

  // Хеш пароля пользователя
  @Column()
  passwordHash: string;

  // Имя пользователя
  @Column()
  firstName: string;

  // Фамилия пользователя
  @Column()
  lastName: string;

  // Название компании (опционально)
  @Column({ nullable: true })
  company: string;

  // Телефон пользователя (опционально)
  @Column({ nullable: true })
  phone: string;

  // Флаг подтверждения email
  @Column({ default: false })
  isEmailVerified: boolean;

  // Роль пользователя в системе
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Статус пользователя
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.UNVERIFIED,
  })
  status: UserStatus;

  // Дата создания записи
  @CreateDateColumn()
  createdAt: Date;

  // Дата последнего обновления записи
  @UpdateDateColumn()
  updatedAt: Date;

  // Дата последнего входа в систему
  @Column({ nullable: true })
  lastLoginAt: Date;

  // Связь с подписками пользователя
  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  // Связь с API-ключами пользователя
  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys: ApiKey[];

  // Связь с платежами пользователя
  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];
}
```

### Пример модели Subscription

```typescript
// src/domain/entities/subscription.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Connector } from './connector.entity';
import { Payment } from './payment.entity';

/**
 * Перечисление статусов подписки
 * UNVERIFIED - не подтверждена
 * TRIAL - пробный период
 * ACTIVE - активная подписка
 * PAYMENT_PENDING - ожидание оплаты
 * SUSPENDED - приостановлена
 * CANCELED - отменена
 * EXPIRED - истекла
 */
export enum SubscriptionStatus {
  UNVERIFIED = 'unverified',
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAYMENT_PENDING = 'payment_pending',
  SUSPENDED = 'suspended',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

/**
 * Сущность подписки на коннектор
 * Связывает пользователя с коннектором и хранит информацию о статусе подписки
 */
@Entity('subscriptions')
export class Subscription {
  // Уникальный идентификатор подписки
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Идентификатор пользователя
  @Column()
  userId: string;

  // Связь с пользователем (при удалении пользователя удаляются все его подписки)
  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Идентификатор коннектора
  @Column()
  connectorId: string;

  // Связь с коннектором (при удалении коннектора поле становится NULL)
  @ManyToOne(() => Connector, connector => connector.subscriptions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'connectorId' })
  connector: Connector;

  // Идентификатор аккаунта Make, к которому привязан коннектор
  @Column()
  makeAccountId: string;

  // Статус подписки
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.UNVERIFIED,
  })
  status: SubscriptionStatus;

  // Дата начала подписки
  @Column()
  startDate: Date;

  // Дата окончания подписки
  @Column()
  endDate: Date;

  // Дата окончания пробного периода (если есть)
  @Column({ nullable: true })
  trialEndDate: Date;

  // Дата отмены подписки (если была отменена)
  @Column({ nullable: true })
  canceledAt: Date;

  // Идентификатор подписки в Stripe (уникальный)
  @Column({ unique: true })
  stripeSubscriptionId: string;

  // Идентификатор клиента в Stripe
  @Column()
  stripeCustomerId: string;

  // Дата создания записи
  @CreateDateColumn()
  createdAt: Date;

  // Дата последнего обновления записи
  @UpdateDateColumn()
  updatedAt: Date;

  // Связь с платежами по этой подписке
  @OneToMany(() => Payment, payment => payment.subscription)
  payments: Payment[];
}
```

## Репозитории

### Интерфейс репозитория

```typescript
// src/domain/repositories/user.repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(options?: { skip?: number; take?: number }): Promise<[User[], number]>;
}
```

### Реализация репозитория с TypeORM

```typescript
// src/infrastructure/repositories/typeorm/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<[User[], number]> {
    const [users, count] = await this.userRepository.findAndCount({
      skip: options?.skip || 0,
      take: options?.take || 10,
    });
    return [users, count];
  }
}
```

## Сервисы

### Интерфейс сервиса

```typescript
// src/domain/services/auth.service.interface.ts
import { User } from '../entities/user.entity';

export interface IAuthService {
  register(email: string, password: string, firstName: string, lastName: string): Promise<User>;
  login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }>;
  verifyEmail(token: string): Promise<User>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}
```

### Реализация сервиса

```typescript
// src/application/use_cases/auth/register.use-case.ts
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User, UserStatus } from '../../../domain/entities/user.entity';
import { ISendPulseService } from '../../interfaces/sendpulse.interface';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sendPulseService: ISendPulseService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    // Проверка существования пользователя
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      status: UserStatus.UNVERIFIED,
    });

    // Генерация токена для подтверждения email
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'email-verification' },
      { expiresIn: '48h' },
    );

    // Отправка email для подтверждения
    await this.sendPulseService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    );

    return user;
  }
}
```

## Контроллеры

### Пример контроллера аутентификации

```typescript
// src/interfaces/api/controllers/auth.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards, HttpCode } from '@nestjs/common';
import { RegisterUseCase } from '../../../application/use_cases/auth/register.use-case';
import { LoginUseCase } from '../../../application/use_cases/auth/login.use-case';
import { VerifyEmailUseCase } from '../../../application/use_cases/auth/verify-email.use-case';
import { RegisterDto } from '../../../application/dto/auth/register.dto';
import { LoginDto } from '../../../application/dto/auth/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.registerUseCase.execute(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, refreshToken, expiresIn } = await this.loginUseCase.execute(
      loginDto.email,
      loginDto.password,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    await this.verifyEmailUseCase.execute(token);
    return { message: 'Email successfully verified' };
  }
}
```

## Middleware

### Пример middleware для аутентификации

```typescript
// src/interfaces/api/middlewares/auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

## Валидация

### Пример DTO с валидацией

```typescript
// src/application/dto/auth/register.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;
}
```

## Аутентификация

### Пример JWT стратегии

```typescript
// src/infrastructure/security/jwt/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
```

## Интеграции

### Пример интеграции со Stripe

```typescript
// src/infrastructure/external_services/stripe/stripe.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IStripeService } from '../../../application/interfaces/stripe.interface';

@Injectable()
export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_API_KEY'), {
      apiVersion: '2022-11-15',
    });
  }

  /**
   * Создает нового клиента в Stripe
   * @param email - Email клиента
   * @param name - Имя клиента
   * @returns ID созданного клиента
   */
  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return customer.id;
  }

  /**
   * Создает подписку в Stripe
   * @param customerId - ID клиента в Stripe
   * @param priceId - ID тарифа в Stripe
   * @param trialPeriodDays - Длительность пробного периода в днях (по умолчанию 7 дней)
   * @returns ID созданной подписки
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    trialPeriodDays: number = 7,
  ): Promise<string> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialPeriodDays,
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription.id;
  }

  /**
   * Отменяет подписку в Stripe (в конце текущего периода)
   * @param subscriptionId - ID подписки в Stripe
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Возобновляет отмененную подписку в Stripe
   * @param subscriptionId - ID подписки в Stripe
   */
  async resumeSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Создает объект события из webhook-запроса Stripe
   * @param payload - Тело запроса в виде Buffer
   * @param signature - Подпись запроса из заголовка Stripe-Signature
   * @returns Объект события Stripe
   */
  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
```

### Пример интеграции с SendPulse

```typescript
// src/infrastructure/external_services/sendpulse/sendpulse.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendPulseService } from '../../../application/interfaces/sendpulse.interface';
import * as SendPulse from 'sendpulse-api';
import { promisify } from 'util';

@Injectable()
export class SendPulseService implements ISendPulseService {
  private sendpulse: any;
  private sendEmail: any;

  constructor(private readonly configService: ConfigService) {
    const userId = this.configService.get<string>('SENDPULSE_API_USER_ID');
    const secret = this.configService.get<string>('SENDPULSE_API_SECRET');
    const tokenStorage = this.configService.get<string>('SENDPULSE_TOKEN_STORAGE');

    this.sendpulse = new SendPulse(userId, secret, tokenStorage);
    this.sendEmail = promisify(this.sendpulse.smtpSendMail.bind(this.sendpulse));
  }

  /**
   * Отправляет email для подтверждения регистрации
   * @param email - Email пользователя
   * @param name - Имя пользователя
   * @param token - JWT токен для подтверждения email
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const emailData = {
      html: `
        <h1>Подтверждение регистрации</h1>
        <p>Здравствуйте, ${name}!</p>
        <p>Для подтверждения вашего email и активации аккаунта, пожалуйста, перейдите по ссылке:</p>
        <p><a href="${verificationUrl}">Подтвердить email</a></p>
        <p>Ссылка действительна в течение 48 часов.</p>
      `,
      text: `Здравствуйте, ${name}! Для подтверждения вашего email и активации аккаунта, пожалуйста, перейдите по ссылке: ${verificationUrl}`,
      subject: 'Подтверждение регистрации в BPM Centr',
      from: {
        name: 'BPM Centr',
        email: 'noreply@bpmcentr.com',
      },
      to: [
        {
          name,
          email,
        },
      ],
    };

    await this.sendEmail(emailData);
  }

  /**
   * Отправляет уведомление о скором окончании пробного периода
   * @param email - Email пользователя
   * @param name - Имя пользователя
   * @param daysLeft - Количество оставшихся дней пробного периода
   */
  async sendTrialEndingNotification(
    email: string,
    name: string,
    daysLeft: number,
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    const subscriptionUrl = `${baseUrl}/dashboard/subscription`;

    const emailData = {
      html: `
        <h1>Окончание пробного периода</h1>
        <p>Здравствуйте, ${name}!</p>
        <p>Ваш пробный период заканчивается через ${daysLeft} дней.</p>
        <p>Для продолжения использования сервиса, пожалуйста, оформите подписку:</p>
        <p><a href="${subscriptionUrl}">Управление подпиской</a></p>
      `,
      text: `Здравствуйте, ${name}! Ваш пробный период заканчивается через ${daysLeft} дней. Для продолжения использования сервиса, пожалуйста, оформите подписку: ${subscriptionUrl}`,
      subject: 'Окончание пробного периода в BPM Centr',
      from: {
        name: 'BPM Centr',
        email: 'noreply@bpmcentr.com',
      },
      to: [
        {
          name,
          email,
        },
      ],
    };

    await this.sendEmail(emailData);
  }
}
```
