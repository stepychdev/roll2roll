# Озвучка для видео (≈2 минуты, RU)

## Вариант 1 — Спокойный product demo pitch (~2:00)

**0:00 - 0:15**  
Привет. Это наш проект для Matrix Hackathon — on-chain SocialFi roulette на Solana.  
Мы строим открытую игру, в которой сочетаются fair on-chain механика, DeFi-активы, socialfi и degen UX.
Что на экране:
- Главная страница `Home` (`/`) с pot, wheel и deposit panel
- Короткий общий план интерфейса (без кликов, просто обзор)

**0:15 - 0:35**  
Пользователь может зайти в раунд не только с USDC, но и с любым поддерживаемым токеном.  
Через Jupiter мы делаем swap в USDC и депозит в pot.  
То есть DeFi-действие становится частью игрового цикла, а не отдельной кнопкой ради демо.
Что на экране:
- `DepositPanel` на `Home`
- Показать выбор токена (например `PUMP`/`SOL`) и ввод суммы
- Показать Jupiter quote блок (`X -> USDC via Jupiter`)
- Нажать `DEPOSIT ...` или `DEPOSIT BATCH (...)`
- Если есть запись с Phantom: показать 1-2 окна подтверждения

**0:35 - 0:55**  
Дальше участники видят live pot, свои шансы в процентах, probability wheel, ленту участников и social-элементы.  
Розыгрыш победителя происходит через VRF, поэтому выбор победителя provably fair и проверяемый on-chain.  
Это основа нашего продукта: fair, onchain и открытость.
Что на экране:
- `Home` после депозита: pot, `Your Chance`, `ParticipantsList`, `JackpotWheel`
- Коротко показать чат / ленту
- Переключиться на `Round Detail / History` (если записано) и показать блок `Provably Fair` / `VRF Randomness`
- Либо показать `RoundDetail` с `VRF randomness`, `winning ticket`, `Round PDA`

**0:55 - 1:15**  
Для победителя есть обычный claim в USDC и degen mode.  
В degen mode мы используем Jupiter для swap после клейма, а сам токен сейчас выбирается детерминированно от VRF раунда.  
Мы убрали reroll и сделали degen UX более честным и предсказуемым.  
И концепция продукта очень хорошо подходит под мобильные устройства: короткие игровые сессии, быстрые действия и сильный social/FOMO loop.
Что на экране:
- `WinnerModal`
- Переключение `USDC` <-> `DEGEN MODE`
- Показать, что в VRF-seeded режиме preview скрыт (`Hidden until claim`) / нет reroll
- Нажать `CLAIM DEGEN`
- Показать окна Phantom: сначала claim USDC, потом Jupiter swap (две подписи)

**1:15 - 1:35**  
Также мы реализовали multi-token batch deposit MVP.  
Если пользователь хочет войти сразу несколькими токенами, интерфейс может собрать батч.  
А если транзакция становится слишком большой для Solana, мы автоматически делим её на несколько транзакций и показываем прогресс по частям.
Что на экране:
- `DepositPanel` с `Batch`
- `Add to Batch`, список legs (`Batch (N/N)`), `DEPOSIT BATCH`
- Если есть запись: показать статус `Preparing batch deposit...` / `Sending batch part 1...`
- Если нет записи статуса: показать сам batch UI и кратко проговорить auto-split behavior

**1:35 - 1:50**  
С точки зрения качества, это не просто прототип интерфейса.  
У нас есть Anchor-тесты для on-chain логики, тесты фронта и crank, mainnet smoke checks и Squads multisig для админки и апгрейдов.
Для нас важно подчеркивать, что degen UX строится поверх безопасного, fair и открытого on-chain ядра.
Что на экране:
- Терминал: `npm test` (короткий кадр с passing tests)
- Терминал или файл: `MAINNET_AUDIT.md`, `OPS_RUNBOOK.md`
- Скрин/фрагмент Squads-операций (или `scripts/squads_*`)
- По возможности показать `addresses.mainnet.json` (Ops/Upgrade multisig + timelock)

**1:50 - 2:05**  
Дальше в roadmap — отдельный on-chain degen claim flow, сниженная комиссия для degen mode, переход hot-path инструкций на Pinocchio, ATA cleanup для пользователей, missions с наградами в JUP, реферальная программа с дешевыми payout rails в light/compressed формате, Solana Actions для AI-агентов, Solana Blinks, кланы, кастомные комнаты и приватные спонсорские single-coin комнаты, а также депозиты через tokenized equities и prediction market shares от Jupiter.  
Наш фокус — fair, onchain, openness, degen, fomo и socialfi. Спасибо.
Что на экране:
- Слайд/канва с roadmap bullets (крупно и читабельно)
- Можно показать `IDEAS_ROADMAP_RU.md` / `README_JUDGES_MATRIX.md` как backing visual
- Финальный кадр: `Home` + логотип/название проекта

---

## Вариант 2 — Более “hackathon pitch” (~2:00)

Рекомендуемые кадры для Варианта 2 (быстрый монтаж):
- 0:00–0:20: `Home` (pot/wheel/deposit)
- 0:20–0:40: Jupiter deposit (token -> USDC)
- 0:40–1:00: live social UI (participants/chat/history)
- 1:00–1:20: winner + VRF/provably fair screen (`RoundDetail` или Solscan/round data)
- 1:20–1:40: `WinnerModal` + degen mode + Phantom 2 signatures
- 1:40–2:00: batch deposit UI + test/smoke/squads snippets + roadmap slide

Мы делаем on-chain roulette, который превращает DeFi в игру.  
Пользователь приходит с любым токеном, Jupiter делает routing и swap в USDC, а дальше он участвует в общем roulette pot.

Это не просто swap UI.  
Это SocialFi игровой loop: депозит, live pot, шансы, wheel, чат, история, VRF-розыгрыш, claim, degen post-claim.

Ключевой момент — честность.  
Победитель определяется через VRF, то есть результат проверяемый и provably fair on-chain.

Мы также сделали degen mode для победителя.  
Сейчас это lite-версия: токен выбирается детерминированно от VRF раунда, без reroll, а потом выполняется Jupiter swap.  
Это уже честнее классического “рандома на фронте” и отлично подходит для mobile-first UX.

Для UX и реальных пользователей мы добавили multi-token batch deposit.  
Если батч не помещается в лимиты Solana по размеру транзакции, система автоматически разбивает его на несколько частей и отправляет последовательно.

Мы делаем ставку на fair + onchain + openness + degen + fomo + socialfi, и при этом держим инженерную дисциплину:  
тесты, crank, smoke checks, multisig governance.

В roadmap — отдельный on-chain degen claim с commit/execute логикой, сниженная комиссия для degen mode, Pinocchio для hot paths, ATA cleanup для пользователей, missions с JUP rewards, реферальная программа с дешевыми light/compressed payout rails, AI-agents через Solana Actions, Solana Blinks, кланы, кастомные комнаты, приватные single-coin sponsor rooms, интеграция tokenized equities и prediction market shares через Jupiter.

Это продукт, который можно масштабировать из хакатонного MVP в полноценный fair/open on-chain gamefi/socialfi протокол с практически бесконечным числом вариаций монетизации.
