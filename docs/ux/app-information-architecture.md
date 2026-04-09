# App Information Architecture

- 作成日: 2026-04-09 00:20 JST
- 作成者: Codex (GPT-5)
- 更新日: 2026-04-09

## 画面構成

### 1. Hero

- プロジェクトの目的
- 登録モジュール数
- 直近平均
- 履歴件数

### 2. Provider Adapter

- OpenAI / Claude / Gemini の設定状態
- model 名
- 設定時の注意文

### 3. Module Navigation

- Baseline Assessor
- Rapid Response Drill
- Pressure Defense Simulator
- Persuasion Lab
- Session Review Dashboard

### 4. Module Workspace

- Baseline Self Check
- Session Setup
- Scenario
- Record / Transcript
- Rubric
- Evaluation

### 5. Session Review Dashboard

- 次の推奨アクション
- 直近トレンド
- 強い領域 / 弱い領域
- モジュール別平均
- セッション履歴一覧

## 現在の実装メモ

- 画面上部は、プロジェクトの目的と直近トレーニング状況をまとめたヒーロー領域
- `Provider Adapter` は設定状態のみを表示する
- 左側ナビゲーションでモジュールを切り替える
- `Baseline Assessor` では自己診断スライダーと自己認識メモを先に入力する
- Baseline の自己診断は draft としてローカル保存し、採点時にはセッション記録にも保存する
- 中央ワークスペースで `Session Setup` `Scenario` `Record / Transcript` `Rubric` `Evaluation` を順に扱う
- 下部の `Session Review Dashboard` で保存済みセッション比較と成長サマリーを扱う
- 実際の Remote / Fallback 実行結果は、生成結果と採点結果に表示する

## コンポーネント構成

- `App.tsx`: 全体オーケストレーション
- `ProviderPanel.tsx`: provider 選択と設定状態表示
- `ModuleNav.tsx`: モジュール切替
- `BaselineSelfCheckPanel.tsx`: 自己診断 UI
- `PracticeWorkspace.tsx`: 訓練ワークスペース
- `ReviewDashboardPanel.tsx`: 履歴比較ダッシュボード
- `usePracticeRecorder.ts`: 録音と音声認識

## 追加された要素

- 自己診断平均と 4 能力別の自己認識サマリー
- 自己認識平均と AI 評価平均との差分カード
- モジュール別平均スコアの比較カード
- 直近 3 セッションとその前 3 セッションの差分表示
- 次に鍛えるべきモジュールの推奨表示

## 導線方針

- 初回ユーザーは Dashboard から `Baseline Assessor` へ誘導する
- 即答力を鍛えたい日は `Rapid Response Drill` を最短動線に置く
- 追及への耐性を鍛えたい日は `Pressure Defense Simulator` へすぐ切り替えられるようにする
- 全モジュールから最終的に `Session Review Dashboard` へ戻れるようにする

## UI/UX メモ

- 1 画面で「状況」「回答」「評価」が分断されない構成にする
- 状態色は落ち着いた紺、青緑、琥珀で統一する
- 録音中、制限時間、採点完了は視覚的に明確にする
- 文章中心の UI にしつつ、圧迫感のある詰め対応モードは緊張感のある見た目に寄せる
