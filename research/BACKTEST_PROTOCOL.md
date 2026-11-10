# Six-month Upstox order-flow backtest — research protocol

Status: **Data validation pending. No historical performance results have been generated.**

## Scope
- Study period: 2026-05-08 through 2026-11-07 (IST), inclusive; exclude exchange holidays.
- NSE stock futures, with a liquid-symbol pilot before expanding to all F&O.
- Research only: no real orders, no live-trading claims.
- Maximum modeled loss per trade: INR 2,000 including estimated fees and slippage.

## Data acceptance gates
1. Validate broker authentication without printing or committing credentials.
2. Resolve each underlying to the **correct dated futures contract**; retain expiry and lot-size history. Never backtest a current contract across expired months.
3. Fetch genuine historical five-minute futures OHLCV and OI for the entire study period. Check timestamp timezone, gaps, duplicates, expiry roll, units, and OI completeness.
4. Calculate EMA21, VWAP, ATR and volume filters using only observations known by the decision time. Reset intraday VWAP at the session boundary.
5. Obtain genuine historical option-chain snapshots only if available. Never use today's chain or reconstructed intraday archive paths as historical signals.
6. Confirm coverage and missingness by symbol/month before any strategy results are reported.

## Pre-registered strategy families
- Long buildup: positive price change and positive OI change, above EMA21/VWAP, confirmation on closed bars.
- Short buildup: negative price change and positive OI change, below EMA21/VWAP.
- Breakout and retest of levels computed from past observed bars, with futures OI confirmation.
- Sector breadth confirmation only where timestamped constituent data is available.

Define exact thresholds and execution assumptions **before** inspecting test-period outcomes. Reject lookahead signals.

## Evaluation
- Chronological train/validation/holdout partitions, no random row shuffling.
- Entry on next bar or conservative executable price, never at the signal bar's already-known close.
- Commissions, exchange fees, STT where applicable, GST, stamp duty, spread and slippage; contract lot sizes and actual trading calendar.
- Position-level stop/target, same-bar ambiguity resolved conservatively; mark unrealized positions at session end.
- Report number of trades, net P&L, win rate, profit factor, expectancy in R, maximum drawdown, monthly results, and full trade ledger.
- Explicitly label partial-data tests as partial. Do not fabricate outcomes.

## Infrastructure
- Dashboard: Railway NITS-ORDER-FLOW service, currently using archive mode.
- Backtest: separate isolated worker, not the public dashboard server.
- Secrets: configure through Railway protected variables or GitHub Actions secrets, never through source files or chat.
- Upstox adapter in server/providers/upstox.mjs is documented as unverified; its real historical API responses must be validated before use.
