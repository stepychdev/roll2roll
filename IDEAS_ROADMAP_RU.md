# Идеи и Roadmap (RU)

## 1. Что мы строим (в одном абзаце)
Мы строим **fair / open / onchain SocialFi roulette** на Solana с выраженным **degen / fomo** характером, где DeFi-действия (через Jupiter) становятся частью игрового цикла: пользователь заходит в раунд с разными токенами, видит live-шансы и социальную активность, а победитель получает provably fair результат через VRF и может выбрать degen-способ клейма.

## 2. Ключевая идея продукта (ядро)
### Принципы, которые мы хотим подчеркивать всегда
- **Fair**: честность и проверяемость результатов
- **On-chain**: реальное состояние игры и расчеты живут на блокчейне
- **Openness**: прозрачность, проверяемость, открытая логика
- **SocialFi**: социальные механики + деньги + поведенческие циклы
- **Degen/FOMO**: азартный, мемный, хаотичный, но в рамках честного ядра

### Позиционирование
- Это не просто “DeFi UI с колесом”
- Это не просто “казино”
- Это **игровой SocialFi loop**, завязанный на реальные on-chain активы и Jupiter

## 3. Что уже есть (сильные стороны продукта сейчас)
### Fair / On-chain
- VRF для выбора победителя (provably fair winner selection)
- On-chain lifecycle раунда (депозиты, lock/settle, claim, refunds, force-cancel)
- Проверяемое состояние и операции на Solana

### UX / Product
- Live pot / odds / probability wheel
- Лента участников (social visibility)
- История раундов
- Чат
- Degen mode claim UX

### Jupiter интеграция (реальная, а не “для галочки”)
- Вход в игру не только через USDC, но и через другие токены (swap -> USDC)
- Degen-claim path через Jupiter
- Multi-token batch deposit MVP
- Auto-splitting oversized batch tx (если не помещается по размеру)

### Инженерная зрелость / Ops
- Squads multisig (admin + upgrade authority)
- Runbooks / smoke checks
- Тесты (Anchor + crank + frontend + scripts)

## 4. Degen mode: текущая версия vs целевая версия
### 4.1 Текущая версия (Lite Degen Claim)
Что уже сделано:
- Токен degen mode выбирается детерминированно от `round VRF` (seeded)
- `Re-roll` отключен в VRF-seeded режиме
- На фронте токен можно скрывать до клейма (UX concealment)

Что важно честно понимать:
- Это **lite-версия**
- Путь сейчас: `claim (USDC) -> Jupiter swap`
- Значит пользователь теоретически может остаться в USDC (если не делает swap / swap падает)

### 4.2 Целевая версия (Strict Degen Claim)
Что хотим:
- `degen commit` on-chain
- После выбора degen mode **нет пути назад в classic USDC claim**
- Отдельная логика `degen execute`
- Награда “предопределена” и зафиксирована on-chain

## 5. Что мы придумали, но не успели реализовать (структурировано)
### A. Core protocol / контрактные улучшения
1. **Отдельный контрактный flow для degen mode**
- `degen commit` / `degen execute`
- запрет fallback в classic claim после commit

2. **Сниженная комиссия для degen-claim**
- отдельные fee-параметры:
  - classic claim fee
  - degen claim fee
- мотивировать пользователя выбирать degen mode

3. **(Отдельный) VRF для degen claim** — advanced версия
- независимая случайность для degen токена
- больше честности/маркетинговой силы
- но значительно сложнее state machine и ops

### B. Performance / infra roadmap
4. **Переход hot-path инструкций на Pinocchio**
- снизить compute overhead на критичных путях
- больше low-level контроля
- повысить производительность / execution efficiency
- делать постепенно, не ломая mainnet совместимость

5. **Закрытие пустых ATA (rent recovery)**
- безопасный UX для пользователей
- cleanup после swap-heavy сценариев
- batch-safe исполнение

### C. Jupiter-native expansion (asset surface)
6. **Депозиты tokenized equities (в будущем через Jupiter ecosystem routing)**
- превращаем более широкий класс активов в игровой вход

7. **Депозиты prediction market shares**
- связать degen/SocialFi loop с prediction markets
- новые игровые сценарии и тематические раунды

### D. Distribution / growth / ecosystem
8. **Referral program**
- органический рост
- social loops
- retention механики
- MVP-версия может использовать **дешевые выплаты в light-формате токенов** (light/compressed token payouts) для снижения стоимости массовых начислений и нагрузки на сеть

9. **AI agents через Solana Actions**
- agent-assisted interaction
- миссии / уведомления / автоматизация social engagement

10. **Solana Blinks**
- взаимодействие с игрой “снаружи” основного сайта
- play/share flows на других сайтах и поверхностях
- сильный viral/distribution layer

### E. Social / community formats
11. **Кланы / команды**
- групповые соревнования
- командные лидерборды
- долговременные social loops

12. **Приватные спонсорские комнаты**
- private / branded rooms
- вход только в одной монете
- выигрыш начисляется тоже в этой монете
- идеально для токен-комьюнити, маркетинговых кампаний и спонсорских activation

13. **Creator / streamer mode**
- брендированные комнаты для создателей контента
- affiliate / referral links
- Blinks / shareable entry points для клипов, постов и комьюнити-дистрибуции

14. **Sponsor analytics / campaign dashboard**
- аналитика по спонсорским комнатам и токен-кампаниям
- воронка: просмотры -> входы -> депозиты -> ретеншн
- метрики эффективности activation для брендов и сообществ

15. **Risk policy transparency page**
- открыто показывать price impact policy, fallback policy, route ограничения, slippage policy
- превратить “risk controls” в часть product transparency / openness

16. **Protocol transparency page**
- live stats
- treasury flow
- fee breakdown
- multisig addresses / roles
- последние апгрейды и governance events

## 6. Почему продукт хорошо ложится на мобильные устройства
### Mobile-first fit (ключевой аргумент)
- короткие игровые сессии
- быстрые decision loops (войти / подождать / claim / degen)
- высокий social/FOMO эффект
- wallet-native поведение (подписания как часть UX)
- Blinks + Actions в будущем усиливают mobile-distribution ещё больше

### Что уже помогает mobile UX
- Batch deposit (меньше ручных действий)
- Auto-splitting oversized tx
- прогресс по chunk’ам (`Sending batch part N...`)
- degen mode как быстрый пост-выигрышный сценарий

## 7. Бесконечные вариации монетизации (что именно имеется в виду)
### Идея
У нас есть **одно fair/onchain ядро**, вокруг которого можно строить много бизнес-форматов, не ломая базовую механику.

### Варианты монетизации / продуктовых форматов
- Публичные раунды
- Private/sponsored rooms
- Single-coin sponsor rooms
- Prediction shares rooms / ставки на prediction shares
- Кастомные комнаты, где пользователи сами настраивают правила (монета входа, формат выплаты, лимиты, таймеры, доступ)
- Деген fee modes (different fee policy)
- Referral fees / referral rewards
- Клановые сезоны / team competitions
- Token-specific campaigns
- Community-branded rounds
- Prediction-themed rounds
- Stock-themed rounds (будущее)
- Creator / influencer rooms (логичное расширение)
- sponsor analytics subscriptions / campaign tooling
- premium automation tooling for communities / creators (в будущем)

### Почему это важно
- Можно экспериментировать без полной смены протокола
- Легче тестировать гипотезы
- Один и тот же fair/open core масштабируется в разные GTM-модели

## 8. Приоритеты roadmap (по этапам)
### Ближайший этап (быстрый ROI)
1. Lite degen polish (fallback policy, ясный UX)
2. ATA cleanup UX
3. Referral MVP (с возможными light/compressed token payout для дешевых начислений)
4. Mobile/Blinks-friendly interaction flows
5. Missions / quest rewards с выплатами в `JUP` (дополнительная мотивация и retention)

### Следующий этап (продуктовая глубина)
5. `degen commit/execute` on-chain
6. reduced degen fee
7. clans / teams
8. private sponsored rooms

### Среднесрочный этап (масштаб и производительность)
9. Pinocchio migration hot paths
10. AI agents via Solana Actions
11. tokenized equities / prediction shares integrations

## 9. Риски и честные ограничения (чтобы не переобещать)
- Текущий lite degen mode не является fully on-chain enforced
- Тяжелые Jupiter-маршруты могут упираться в лимит размера tx (не только CU)
- Strict degen flow потребует контрактного апгрейда и timelock
- Отдельный VRF под degen claim сильно усложняет lifecycle и ops

## 10. Безопасность и операционная зрелость (что важно подчеркивать)
### Почему протокол выглядит “взрослым”, а не просто как demo
- **Squads multisig** для admin и отдельно для upgrade authority (разделение ролей)
- timelock на upgrade-пути (mainnet governance discipline)
- runbooks и mainnet smoke-check сценарии
- тесты на on-chain логику, crank, frontend critical flows
- явные fallback-политики и обработка edge-cases (refund/cancel/cleanup)
- акцент на прозрачность и проверяемость on-chain состояния

### Как это подавать коротко
- “Мы делаем degen UX поверх безопасного и прозрачного on-chain ядра.”
- “Безопасность и openness — часть продукта, а не послесловие.”
## 11. Как это презентовать (короткая формула)
### Формула продукта
**Fair + Onchain + Openness + SocialFi + Degen/FOMO + Jupiter liquidity**

### Формула видения
**Открытое on-chain SocialFi-казино/игровое ядро с бесконечным количеством форматов монетизации и distribution-слоёв (mobile, blinks, actions, communities).**
