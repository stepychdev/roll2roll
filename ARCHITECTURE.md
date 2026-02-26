# Roll2Roll — Архитектура проекта

**Дата**: 2026-02-23  
**Последнее обновление**: 2026-02-25  
**Статус**: Mainnet + Devnet (live)  
**Язык интерфейса**: English

---

## 1. Что это

Provably-fair социальный джекпот на Solana. Пользователи депозитят любой SPL-токен (конвертируется в USDC через Jupiter), победитель выбирается VRF-рандомом от MagicBlock. Комиссия 0.25%.

---

## 2. Структура репозитория

```
jackpot/
├── jackpot_anchor_v4/           # Solana-программа (Anchor/Rust)
│   ├── programs/jackpot/src/    # Исходный код программы
│   │   ├── lib.rs               # Точка входа, декларация инструкций
│   │   ├── state.rs             # Config, Round (zero-copy ~21KB), Participant
│   │   ├── instructions/        # 14 инструкций (см. секцию 5)
│   │   ├── events.rs            # 7 событий
│   │   ├── errors.rs            # 27 кодов ошибок
│   │   ├── constants.rs         # MAX_PARTICIPANTS=200, seeds, VRF_REIMBURSEMENT
│   │   └── utils.rs             # Fenwick tree для O(log n) выбора победителя
│   ├── scripts/                 # update_config.ts, init_devnet.ts и др.
│   ├── tests/                   # ts-mocha тесты
│   └── Anchor.toml              # Anchor 0.31.1
│
├── crank/                       # Backend-сервис (round lifecycle)
│   ├── src/index.ts             # Основной loop: auto-lock, request_vrf, auto_claim, close_round
│   ├── src/runtimeLogic.ts      # State machine логика
│   ├── src/activeRoundScan.ts   # Startup backfill + stuck round detection
│   ├── src/constants.ts         # PDA helpers, program constants
│   ├── src/instructions.ts      # Tx builders
│   └── tests/                   # Unit tests
│
├── src/                         # React-фронтенд
│   ├── pages/                   # 7 страниц (Home, History, RoundDetail, HowItWorks, Fairness, Cabinet, PlayerProfile)
│   ├── components/              # 15+ компонентов
│   ├── hooks/                   # 7 хуков (useJackpot — главный)
│   ├── lib/                     # program.ts, constants.ts, jupiterClient.ts, jupiterPrice.ts, roundArchive.ts, firebase.ts, tokenMetadata.ts
│   ├── contexts/                # NavigationContext (SPA routing), ThemeContext
│   ├── idl/jackpot.json         # Скомпилированный IDL
│   └── types.ts                 # Token, Participant, GamePhase, RoundState
│
├── scripts/                     # Devnet/mainnet utility scripts
├── api/                         # Vercel serverless RPC proxy
├── .env.example                 # Template env vars
├── tailwind.config.js           # Кастомная тема, dark mode: 'class'
└── vite.config.ts               # Vite + vite-plugin-node-polyfills
```

---

## 3. Стек технологий

| Слой | Технологии |
|------|-----------|
| **Blockchain** | Solana (devnet), Anchor 0.31.1, Rust |
| **VRF** | MagicBlock ephemeral-vrf-sdk 0.2.3 (solana-program 2.x — нужен bridging типов) |
| **Свопы** | Jupiter Metis Swap API (`/swap/v1/quote` + `/swap/v1/swap-instructions`) |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS 3.4 |
| **Wallet** | @solana/wallet-adapter-react (Phantom, Solflare и т.д.) |
| **Чат** | Firebase Realtime Database |
| **UI** | lucide-react (иконки), react-confetti (анимация победы) |
| **Деплой** | Vercel (из ветки `master`), webhook периодически ломается |

---

## 4. Ключевые адреса

### Mainnet

| Что | Адрес |
|-----|-------|
| Program ID | `3wi11KBqF3Qa7JPP6CH4AFrcXbvaYEXMsEr9cmWQy8Zj` |
| USDC Mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Config Admin (Ops Squads vault) | `D4DBCi5ASYf4EinyLJUsKbEzxYoNiAY9bY9aXeXh1ym` |
| Upgrade Authority (Upgrade Squads vault) | `6qZXVsmJVV5WYWMmpwympY1JZrpVGzKYJEqTa2VkJXFW` |
| Treasury USDC ATA | `8dccLsxnj9jwfEeokJrQH2wioJz4sS3mEQGd3miWB5YE` |

### Devnet

| Что | Адрес |
|-----|-------|
| Program ID | `4PhNzNQ7XZAPrFmwcBFMe2ZY8ZaQWos8nJjcsjv1CHyh` |
| Test USDC Mint | `GXJV8YiRpXpbUHdf3q6n4hEKNeBPXK9Kn9uGjm6gZksq` |
| Treasury USDC ATA (Ops vault owner) | `HukbjaCBAJz5VmzkiDcpNjF2BUsxo8z9WwgSzHgGACMd` |
| Config Admin (Ops Squads vault PDA) | `12DcA156ScxVWDjbCajADpYidZor34f2mFweNMsmjh2N` |
| Upgrade Authority (Upgrade Squads vault PDA) | `ApCkCEvWh9M87ec9S3CE22J3nWWXpqvM5CMfLKSGfSkg` |

### Shared

| Что | Адрес |
|-----|-------|
| VRF Program | `Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz` |
| VRF Queue (mainnet/devnet) | `Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh` |
| VRF Identity (callback signer) | `9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw` |

---

## 5. Anchor-программа — инструкции

### Жизненный цикл раунда

```
init_config (один раз)
     │
start_round ──► Open ──► deposit_any (множество раз, таймер стартует при min_participants)
                  │
                  ├── cancel_round (участник забирает свой депозит)
                  ├── admin_force_cancel (status→Cancelled, средства в vault)
                  │       ├── claim_refund (self-service: участник сам вызывает)
                  │       └── close_participant (после рефанда; guard на пустой participant)
                  │
                  ▼ (таймер истёк)
             lock_round ──► Locked
                  │
                  ▼
            request_vrf ──► VrfRequested
                  │
                  ▼ (MagicBlock VRF callback)
            vrf_callback ──► Settled (winner определён)
                  │
                  ├── claim (победитель забирает) ──► Claimed
                  ├── auto_claim (кто угодно триггерит) ──► Claimed
                  │
                  ▼
             close_round (закрывает PDA, возвращает rent)
```

### Таблица инструкций

| Инструкция | Кто вызывает | Что делает |
|-----------|-------------|-----------|
| `init_config` | Admin | Создаёт Config PDA (один раз) |
| `update_config` | Admin | Обновляет параметры (fee, duration, min_participants и т.д.) |
| `start_round` | Любой (service wallet) | Создаёт Round PDA + vault ATA, status=Open |
| `deposit_any` | Игрок | Переводит USDC в vault, записывает tickets. Трюк: `delta = balance_after - usdc_balance_before` — захватывает результат Jupiter-свопа |
| `lock_round` | Любой (service wallet) | Open→Locked, требует `now >= end_ts` и min_participants |
| `request_vrf` | Любой (service wallet) | CPI в MagicBlock VRF, Locked→VrfRequested |
| `vrf_callback` | VRF Oracle | Получает 32 байта рандомности, `winning_ticket = r % total_tickets + 1`, ищет победителя через Fenwick tree |
| `mock_settle` | Admin | Тестовый аналог vrf_callback без оракула |
| `claim` | Победитель | Забирает приз: VRF reimbursement (0.2 USDC → vrf_payer) + fee (0.25% → treasury) + payout → winner |
| `auto_claim` | Кто угодно | Триггерит claim за победителя (деньги идут winner on-chain) |
| `cancel_round` | Участник | Отзывает свой депозит из vault (пока status=Open) |
| `admin_force_cancel` | Admin | Переводит раунд в Cancelled (средства остаются в vault для рефандов через claim_refund) |
| `claim_refund` | Участник | Self-service рефанд из cancelled раунда. Требует `participant` PDA, переводит из vault → user ATA, обнуляет participant balances |
| `close_participant` | Участник | Закрывает Participant PDA и возвращает rent. В `Cancelled` требует `usdc_total == 0 && tickets_total == 0` (после рефанда) |
| `close_round` | Любой | Закрывает Round PDA + vault ATA, возвращает rent (только Claimed/Cancelled, vault пуст) |
| `transfer_admin` | Admin | Переводит `config.admin` на новый адрес (используется для миграции на Squads vault) |
| `set_treasury_usdc_ata` | Admin | Меняет `config.treasury_usdc_ata` с проверкой mint + owner (используется для миграции treasury на Squads vault) |

### Структуры данных

**Round** (`#[account(zero_copy)]`, `#[repr(C)]`, ~21KB):
- Fenwick tree `[u64; 201]` для O(log n) выбора победителя по winning_ticket
- `participants: [[u8; 32]; 200]` — массив pubkeys участников
- MAX_PARTICIPANTS = 200

**Config** (обычный Anchor account):
- `round_duration_sec: u32` (текущее: 10 сек)
- `fee_bps: u16` (текущее: 25 = 0.25%)
- `min_participants: u16` (текущее: 2)
- `max_deposit_per_user: u64` (0 = без лимита, использует 8 байт из reserved)
- `paused: bool`

---

## 6. Frontend — главный хук useJackpot

Центральная машина состояний (~879 строк). Управляет всей игровой логикой:

### Фазы (GamePhase)
```
waiting → open → countdown (≤6 сек) → spinning (Locked/VrfRequested) → settled → claimed/cancelled → waiting
```

### Автоматические действия (через crank service)
Выделенный backend-сервис (`crank/`) обеспечивает автоматизацию жизненного цикла раундов. Приватный ключ хранится на сервере — никогда не попадает в браузерный бандл.

1. **Auto-create**: `phase=waiting` → `start_round` (через service wallet)
   - Защита от дублей: `lastCreatedRoundRef` + `cancelled` flag в effect cleanup
   - `pollRound` убран из deps array эффекта (предотвращает re-trigger при смене roundId)
2. **Auto-lock**: `endTs` истёк + buffer 3 сек → `lock_round`
   - `lastLockedRoundRef` сбрасывается при ошибке lock (если раунд всё ещё Open)
3. **Auto-VRF**: сразу после lock → `request_vrf` (чейнится атомарно)
4. **Auto-advance**: settled/claimed/cancelled → roundId+1 через 2 сек
   - Guard: `advancingRef.current` предотвращает double-advance

### Service Wallet Transaction Safety
`serviceSignAndSend` по умолчанию использует **preflight simulation** (`skipPreflight: false`). Невалидные транзакции (AlreadyInUse, RoundNotOpen и т.д.) отклоняются на этапе симуляции — не попадают на chain и не тратят SOL. `skipPreflight: true` передаётся только для fire-and-forget операций (close_round после claim).

### Unclaimed Prize
Когда раунд settle, если текущий кошелёк — победитель, приз сохраняется в `localStorage`. При рефреше страницы startup scan ищет Settled раунды on-chain и восстанавливает unclaimed prize даже если localStorage пуст.

### Deposit
- **USDC**: прямой `deposit_any`
- **Другой токен**: Jupiter quote → swap instructions → `buildSwapAndDepositTx` (VersionedTransaction v0 с Address Lookup Tables)

---

## 7. Frontend — страницы и компоненты

### Страницы

| Страница | Описание |
|----------|----------|
| **Home** | Bento-grid layout: Hero, Pot+Deposit (тёмная карточка), Timer, JackpotWheel (donut SVG), Live Feed, Chat, Vault Verified, Recent Winners |
| **History** | Таблица раундов с пагинацией (10/страница), фильтры, поиск по ID/wallet |
| **RoundDetail** | Детали раунда: участники, Provably Fair секция (VRF randomness, winning ticket, PDA) |
| **HowItWorks** | Анимированный timeline 5 шагов (IntersectionObserver) |
| **Fairness** | Bento-сетка: VRF flow, RTP 99.75%, контракт, Win Chances (статика) |

### Ключевые компоненты

| Компонент | Что делает |
|-----------|-----------|
| `JackpotWheel` | SVG donut-колесо. Кумулятивная анимация вращения (5-8 оборотов, 5.5 сек, cubic-bezier). Сегменты пропорциональны usdcAmount |
| `DepositPanel` | Compact/Full режимы. Dropdown выбора токена. Для non-USDC показывает "→ USDC via Jupiter" |
| `WinnerModal` | Полноэкранный modal с confetti, CLAIM кнопка (только для победителя) |
| `UnclaimedBadge` | Фиксированный badge: "You won Round #X! $Y unclaimed" — переживает рефреш |
| `Chat` | Firebase Realtime Database, авто-скролл, collapsible |
| `Header` | Nav-пилюли, dark mode, уведомления (только win/loss), кошелёк |

### Хуки

| Хук | Что делает |
|-----|-----------|
| `useJackpot` | Вся игровая логика (polling, auto-actions, deposit, claim) |
| `useRoundHistory` | Пагинация раундов: forward scan + binary search для maxRoundId, `getMultipleAccountsInfo` батч, `toHistoryRoundWithDeposits()` для per-participant архивации |
| `useWalletTokens` | Список токенов кошелька с метаданными, поллинг каждые 10 сек |
| `useChat` | Firebase: `onValue` + `onChildAdded`, дедупликация |
| `useNotifications` | localStorage-персистентность, глобальная шина `pushNotification()` |

### Навигация
Без react-router. `NavigationContext` с `type Page = 'game' | 'history' | 'how-it-works' | 'fairness' | 'round-detail'`. `PageRouter` в App.tsx — switch-case.

---

## 8. Внешние интеграции

### Jupiter Metis Swap API
- `/swap/v1/quote` — получение котировки (ExactIn, slippage 100 bps)
- `/swap/v1/swap-instructions` — получение composable инструкций (НЕ Ultra)
- Собирается в одну VersionedTransaction v0: `[computeBudget, setup, swap, cleanup, deposit_any]`
- API key через `VITE_JUPITER_API_KEY`
- `jupiterPrice.ts` — Jupiter Price API v2 для real-time цен non-USDC токенов
- `jupiterMobile.ts` — определение Jupiter Mobile in-app browser, deeplinks
- Потенциальные улучшения: ExactOut swap mode, Jupiter Referral Program, Token Ledger для точного deposit_any

### MagicBlock VRF
- `ephemeral-vrf-sdk 0.2.3` (uses solana-program 2.x — нужен type bridging через `to_bytes()/new_from_array()`)
- `blake3` pinned to `=1.6.1` (новее требует Rust edition 2024)
- Identity PDA seed: `b"identity"`
- Callback аутентификация: `Signer` constraint + address check = `VRF_PROGRAM_IDENTITY`

### Firebase Realtime Database
- **Чат**: `chat/messages` — real-time RTDB
- **Архив раундов**: `rounds/{roundId}` — сохраняет snapshot завершённых раундов для History после close_round
  - Включает `participantDeposits[]` — per-participant USDC и tickets (добавлено в `c0939b9`)
  - Write-once правила (PERMISSION_DENIED при перезаписи = OK)
  - `getMaxArchivedRoundId()` через `orderByKey + limitToLast(1)` для startup scan
- Graceful fallback если env vars не заданы

### Metaplex Token Metadata
- Ручной парсинг on-chain metadata (без Umi SDK)
- In-memory cache, batch-загрузка

---

## 9. Управление / Governance

### Текущие параметры on-chain (Config)

### Текущие параметры on-chain (devnet Config)
- `round_duration_sec`: **10** секунд
- `fee_bps`: **25** (0.25%)
- `ticket_unit`: 1,000,000 (1 USDC = 1 ticket)
- `min_participants`: **2**
- `min_total_tickets`: **2**

### Frontend константы
- `POLL_INTERVAL`: 3000 мс (поллинг раунда)
- `AUTO_ADVANCE_DELAY`: 2000 мс (задержка перед следующим раундом)
- `SETTLED_ADVANCE_DELAY`: 2000 мс
- `LOCK_BUFFER_SEC`: 3 (буфер для расхождения часов)
- `PAGE_SIZE`: 10 (пагинация истории)

---

## 11. Известные проблемы и что нужно реализовать

### Критичное для mainnet

| Проблема | Описание |
|----------|----------|
| **Нет reconnect/retry** | Если RPC упадёт, нет экспоненциального backoff |

### Средний приоритет

| Задача | Описание |
|--------|----------|
| **Fairness.tsx — статические данные** | "Live Verification" секция с захардкоженными seed/result. Нужно подтягивать реальные данные раундов |
| **Fairness.tsx — Win Chances chart** | 4 статических бара ($10, $5, $50, $15). Не связаны с реальными данными |
| **auto_claim не используется** | Builder `buildAutoClaim` есть в `program.ts`, но фронт его не вызывает. Победитель клеймит только вручную |

### Низкий приоритет / cleanup

| Задача | Описание |
|--------|----------|
| **StatsBar.tsx** | Компонент создан но нигде не рендерится |
| **MOCK_TOKENS, generateMockRound** | Моковые данные в `mocks.ts`, нигде не используются |
| **CLAUDE.md удалён** | Внутренний док — не нужен в public repo |
| **init_devnet.ts feeBps=500** | Скрипт инициализации задаёт 5% fee вместо 0.25% — потом нужен update_config |
| **Дубль VRF callback** | Оракул MagicBlock иногда отправляет повторный callback. Контракт отклоняет (0x1) — безвредно, платит оракул. Можно заменить require на тихий return Ok(()) — но нужен редеплой |

## 12. Authority / Multisig

На devnet и mainnet выполнен split-role rollout через **Squads V4**:

- **Ops Multisig (2-of-3)** — управляет `config.admin` через **vault PDA**
- **Upgrade Multisig (2-of-3)** — держит `program upgrade authority` через **vault PDA** (mainnet: 12h timelock)

Ключевые инструкции, добавленные для миграции:

- `transfer_admin(new_admin)`
- `set_treasury_usdc_ata(new_treasury_usdc_ata, expected_owner)`

Smoke-test проведён через Squads proposal:

1. `update_config(paused = true)`
2. `update_config(paused = false)`

Обе транзакции выполнены через `Ops` multisig (2-of-3) на devnet и mainnet.

Актуальные адреса зафиксированы в `addresses.json`.

### Будущие фичи (из продуктовой стратегии)

- Мультираундовая система (параллельные раунды)
- Реферальная программа
- Турниры/лидерборд
- NFT-бейджи за серии побед
- Mainnet деплой с production-ready backend

---

## 12. Как запустить

```bash
# Frontend (devnet)
cp .env.example .env  # заполнить API ключи и RPC URL
npm install
npm run dev           # localhost:5173

# Crank service (automated round lifecycle)
cd crank
cp .env.example .env  # заполнить RPC + keypair path
npm install
npm run start

# Anchor program (localnet/devnet)
cd jackpot_anchor_v4
anchor build -- --features devnet
anchor deploy --provider.cluster devnet
```

### ENV переменные (frontend)
- `VITE_JUPITER_API_KEY` — API key от portal.jup.ag
- `VITE_FIREBASE_*` — для чата и архива раундов
- `VITE_NETWORK` — `devnet` или `mainnet`
- `VITE_RPC_URL` — RPC endpoint

### ENV переменные (crank)
- `RPC_URL` — dedicated RPC endpoint
- `CRANK_KEYPAIR_PATH` — путь к keypair для crank транзакций
- `NETWORK` — `devnet` или `mainnet`
- `FIREBASE_DATABASE_URL` — для архивации раундов

---

## 13. Про MagicBlock Ephemeral Rollups

Ephemeral Rollups от MagicBlock — временные SVM-среды для ускорения транзакций. Аккаунты «делегируются» в rollup, обрабатываются быстро, затем результат коммитится в основную сеть. Текущая архитектура работает напрямую на L1, интеграция ER планируется для снижения латентности депозитов.
