# Notification Preferences Service

## Выполнил все основные и дополнительные требования.

Сервис управления предпочтениями уведомлений
Стек: TypeScript, Node.js (Express), PostgreSQL, Zod, Jest.

## Запуск

Требуется Node.js 20+ и Docker.

```bash
docker compose up -d        # PostgreSQL на localhost:5433
npm install
cp .env.example .env
npm run migrate             # создаёт таблицы и сиды
npm run dev                 # сервер на localhost:3000
```

## Тесты

```bash
npm test
```

### Сквозная проверка сценариев

```bash
# отключить маркетинг по email
curl -X POST localhost:3000/users/user-1/preferences -H "Content-Type: application/json" \
  -d '{"preference":{"notificationType":"marketing","channel":"email","enabled":false}}'

# задать quiet hours
curl -X POST localhost:3000/users/user-1/preferences -H "Content-Type: application/json" \
  -d '{"quietHours":{"startTime":"22:00","endTime":"08:00","timezone":"Europe/Berlin"}}'

# deny: глобальная политика (marketing+sms+EU)
curl -X POST localhost:3000/evaluate -H "Content-Type: application/json" \
  -d '{"userId":"user-1","notificationType":"marketing","channel":"sms","region":"EU","datetime":"2026-05-21T12:00:00Z"}'

# deny: quiet hours (21:30 UTC = 23:30 в Берлине)
curl -X POST localhost:3000/evaluate -H "Content-Type: application/json" \
  -d '{"userId":"user-1","notificationType":"marketing","channel":"push","region":"US","datetime":"2026-05-21T21:30:00Z"}'

# allow: транзакционное в то же время
curl -X POST localhost:3000/evaluate -H "Content-Type: application/json" \
  -d '{"userId":"user-1","notificationType":"transactional","channel":"email","region":"US","datetime":"2026-05-21T21:30:00Z"}'

# метрики
curl localhost:3000/metrics
```

## Архитектура

```
src/
  domain/        чистые бизнес-правила и типы: merge предпочтений, evaluate, quiet hours
  services/      сценарии: координируют репозитории и домен, логируют события
  repositories/  SQL-доступ, маппинг строк БД в доменные типы
  controllers/   HTTP-адаптер: params/body → вызов сервиса → ответ
  routes/        маршруты + валидация входа (Zod)
  middleware/    валидация, обработка ошибок
  schemas/       Zod-схемы запросов
  infra/         подключение к БД, логгер, метрики
  exceptions/    ApiError — операционные ошибки API
migrations/      SQL-миграции и сиды (применяются npm run migrate)
```

Зависимости направлены внутрь: домен не знает ни про Express, ни про PostgreSQL. Вся логика решения allow/deny — чистые функции (`domain/evaluate.ts`), тестируемые без моков и БД.

Порядок проверок в evaluate: глобальная политика → эффективные предпочтения (дефолты + изменения пользователя) → quiet hours → allow.

## Основные решения

**Хранятся только переопределения.** `user_preferences` содержит только то, что пользователь менял сам; Обеденяем default и user preferences в node.js. Если понадобится поменять дефолтные настройки, то при таком решении не понадобится миграция.

**Идемпотентность через ключи.** обеспецивается в repository. INSERT ... ON CONFLICT DO UPDATE

**Quiet hours** Хранится строками. Например `22:00–08:00` + `Europe/Berlin` смещенийй по времени не делаем. В некоторых странах, меняется время на летнее и зимнее. По этому храним время в UTC и часовой пояс. UTC-момент запроса конвертируется в локальное время зоны через `Intl.DateTimeFormat`. Интервалы через полночь поддержаны.

**Неизвестная пара тип+канал → deny.** Безопасный дефолт: что явно не разрешено — не отправляется.

**Регион — открытое множество** (валидируется как код `A-Z`): выход на новый рынок не требует изменения кода. Глобальная политика — наличие строки в таблице - запрет. Политика сильнее настроек пользователя.

**Известное упрощение:** в момент перевода часов (DST) локальное время может существовать дважды или не существовать — погрешность quiet hours до часа дважды в год признана приемлемой для уведомлений.

## Observability

Структурированные JSON-логи в stdout. Счётчики в памяти с лейблами, снимок — `GET /metrics`.

Ошибки API едины по формату; известные ошибки БД маппятся в осмысленные статусы (unique violation → 409), детали внутренних ошибок наружу не отдаются.

## Что дальше до продакшена

- Добавить pino или друго логгер, вместо console.log. Изменения потребуются только в инфраструктуре, а не в бизнес-логике
- Prometheus и Grafana для метрик.
- Интеграционные тесты с реальным PostgreSQL (testcontainers) supertest-тесты API. Сейчас вместо PostgreSQL, в тестах, просто map.
- Кэширование дефолтов и глобальных политик (меняются редко, читаются на каждый evaluate). Например добавить Redis и вынести эти данные туда.
