# FAQ для жюри (RU, устное интервью)

## 1) В чем главная идея продукта?
Это **fair / open / on-chain SocialFi roulette** на Solana.  
Мы превращаем DeFi-действия (через Jupiter) в игровой цикл: вход в раунд, live pot, social/FOMO, VRF-розыгрыш, claim, degen mode.

## 2) Чем вы отличаетесь от “обычного swap UI”?
У нас Jupiter — это не отдельная кнопка для демо.  
Jupiter встроен в сам игровой цикл:
- вход в раунд через swap -> USDC
- degen claim после выигрыша
- batch deposit UX

А сама игра (раунды, пот, settlement, claim/refund) живет on-chain.

## 3) Насколько у вас реально fair?
Победитель выбирается через VRF, то есть результат provably fair и проверяемый on-chain.  
Это основа продукта. Мы отдельно подчеркиваем fairness, on-chain и openness.

## 4) Что сейчас с Degen Mode?
Сейчас это **lite degen mode**:
- токен выбирается детерминированно от `round VRF`
- `reroll` отключен
- после клейма в USDC идет Jupiter swap

Это уже честнее и лучше по UX, но пока не fully on-chain enforced degen-claim.

## 5) Почему Degen Mode не fully on-chain прямо сейчас?
Потому что для этого нужен отдельный контрактный flow:
- `degen commit`
- запрет classic claim
- `degen execute`
- async state machine + retry/failure logic

Мы решили сначала выкатить честный и прозрачный lite-вариант, а строгий on-chain degen flow держим в roadmap.

## 6) Почему пользователь видит две транзакции в degen claim?
Потому что текущая схема такая:
1. `claim` в USDC (on-chain)
2. Jupiter swap (USDC -> degen token)

Это осознанный компромисс ради скорости внедрения и совместимости с текущей архитектурой.

## 7) Что у вас по безопасности?
Это один из наших сильных акцентов.
- Squads multisig для админки и апгрейдов
- разделение ролей (Ops / Upgrade)
- timelock discipline на upgrade пути
- тесты по on-chain логике, фронту, crank
- mainnet smoke checks
- прозрачные on-chain состояния и операции

Коротко: degen UX поверх безопасного и проверяемого ядра.

## 8) Почему вы заявляете mobile-first?
Потому что продукт естественно ложится на мобильное поведение:
- короткие игровые сессии
- быстрые решения (войти/подождать/claim)
- social/FOMO loop
- wallet-native UX

Дополнительно мы планируем Solana Blinks и Solana Actions, чтобы игра жила не только внутри сайта.

## 9) Что с лимитами Solana и сложными Jupiter-маршрутами?
Мы уже столкнулись с реальным ограничением размера транзакции (не только CU).  
Поэтому сделали:
- batch deposit
- auto-splitting oversized batches на несколько tx
- прогресс по chunk’ам в UI

Это практичное инженерное решение под реальные ограничения сети.

## 10) Зачем вам Pinocchio, если уже есть Anchor?
Anchor — отличный стек для скорости разработки и тестирования.

Pinocchio у нас в roadmap для **hot paths**:
- снизить compute overhead
- получить больше low-level контроля
- повысить производительность и эффективность по мере роста

То есть это не “мода”, а осознанный performance roadmap.

## 11) Что такое “бесконечные вариации монетизации”?
У нас одно fair/on-chain ядро, вокруг которого можно строить много форматов:
- публичные раунды
- private/sponsored rooms
- кастомные комнаты
- single-coin sponsor rooms
- clans/teams
- referral loops
- degen fee modes
- missions с JUP rewards
- prediction-share themed rooms

Это позволяет масштабировать продукт без переписывания протокольного ядра.

## 12) Что самое важное в roadmap?
Ближайшее:
- strict on-chain degen claim
- reduced degen fee
- referral + missions
- ATA cleanup UX
- Blinks / Actions

Дальше:
- Pinocchio hot paths
- clans / sponsor rooms / custom rooms
- prediction shares и tokenized equities integrations

## 13) Почему вы не используете MagicBlock ER прямо сейчас?
Потому что текущий submission мы сознательно сделали L1-first:
- проще и прозрачнее fairness/settlement
- совместимость с Jupiter
- меньше ops-сложности

Но MagicBlock — хороший roadmap fit для будущих real-time механик.

## 14) Короткая формула для ответа жюри
Мы строим **fair + onchain + open SocialFi roulette** с degen/FOMO UX, где Jupiter — часть core gameplay loop, а не отдельная DeFi-кнопка.

