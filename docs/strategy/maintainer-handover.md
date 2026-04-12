# ExplainerCore 引継ぎ書

- 作成日: 2026-04-13 01:18 JST
- 作成者: Codex (GPT-5)

## この文書の目的

この文書は、ExplainerCore を引き継いだ人が、最初に何を理解し、どの順番で確認し、どこから改善を始めればよいかを短時間で把握するための実務向けメモです。

前提として、このレポジトリは「説明力」と「会話力」を継続的に鍛えるためのローカル運用基盤です。単なる調査置き場ではなく、調査、訓練、採点、履歴保存、振り返りを一つの構成で回すことを目指しています。

## まず理解すること

- 中核プロダクトは `apps/coach-web` のローカル Web アプリです
- 静的な教材と評価定義は `data` にあり、運用知見や設計判断は `docs` にあります
- 実行時の成果物は `sessions` に保存されます
- 現状は「初期実装完了、これから実運用で精度を詰める段階」です
- OpenAI / Claude / Gemini の切り替えに対応していますが、API キー未設定環境では fallback 評価で動きます

## 引継ぎ直後にやること

### 1. 全体像をつかむ

以下をこの順で読むと、迷いにくいです。

1. [`README.md`](C:/Work_Codex/ExplainerCore/README.md)
2. [`PLANS.md`](C:/Work_Codex/ExplainerCore/PLANS.md)
3. [`project-charter.md`](C:/Work_Codex/ExplainerCore/docs/strategy/project-charter.md)
4. [`system-architecture.md`](C:/Work_Codex/ExplainerCore/docs/strategy/system-architecture.md)
5. [`repository-review-2026-04-10.md`](C:/Work_Codex/ExplainerCore/docs/strategy/repository-review-2026-04-10.md)
6. [`operating-playbook.md`](C:/Work_Codex/ExplainerCore/docs/training/operating-playbook.md)
7. [`app-information-architecture.md`](C:/Work_Codex/ExplainerCore/docs/ux/app-information-architecture.md)

### 2. アプリを起動して現状を確認する

`apps/coach-web` で以下を実行します。

```bash
npm install
npm run dev:all
```

確認する点:

- [http://localhost:5173](http://localhost:5173) が開く
- [http://localhost:8787](http://localhost:8787) の API が応答する
- モジュール切替、Scenario 表示、録音 UI、Dashboard 表示が崩れていない
- `Provider Adapter` が設定状態を正しく示す

### 3. 最低限の健全性チェックを回す

`apps/coach-web` で以下を実行します。

```bash
npm test
npm run typecheck
npm run build
```

補足:

- 現状のテストは限定的で、主に fallback 評価ロジックの回帰防止です
- UI 全体の E2E は未整備なので、手動確認はまだ重要です

## どこを触ると何が変わるか

### アプリ本体

- `apps/coach-web/src/App.tsx`: 画面全体の状態管理とオーケストレーション
- `apps/coach-web/src/components/*`: 各 UI パネル
- `apps/coach-web/src/hooks/usePracticeRecorder.ts`: 録音と音声認識
- `apps/coach-web/src/lib/baseline.ts`: Baseline 自己診断の計算と draft 保存
- `apps/coach-web/src/lib/dashboard.ts`: 履歴集計とサマリー表示

### サーバーと評価

- `apps/coach-web/server/index.ts`: ローカル API エントリ
- `apps/coach-web/server/aiProviders.ts`: Remote provider 呼び出し
- `apps/coach-web/server/fallbackEngine.ts`: ローカル fallback 生成・評価
- `apps/coach-web/server/dataStore.ts`: セッション保存、履歴 index 管理

### 訓練素材

- `data/rubrics/*.json`: 採点観点
- `data/scenarios/*.json`: シナリオ定義
- `prompts/*`: 外部 LLM 調査用プロンプト

### ドキュメント

- `docs/strategy`: 方針、設計、プロバイダ設定、改善計画
- `docs/training`: 日次・週次の運用方法
- `docs/evaluation`: 評価設計
- `docs/ux`: UI/UX 意図
- `docs/research`: 調査結果と根拠

### 実行成果物

- `sessions/audio`: 録音
- `sessions/transcripts`: 文字起こしや自己レビュー
- `sessions/reviews`: 採点結果と履歴

## 優先順位つきの次アクション

優先度が高い順に並べると、着手順は以下です。

1. API キーを設定して Remote 動作を各 provider で 1 回ずつ確認する
2. 実セッションを増やし、`nextActions` とスコアの納得感を確認する
3. `data/rubrics` と `data/scenarios` を、実運用で弱かった箇所に合わせて調整する
4. `docs/research/deep-research` の知見を訓練導線へ反映する
5. E2E テストや schema 整備など、保守性向上の作業に入る

特に 1 は重要です。現時点の残課題として、Remote 実通信の全面確認はまだ終わっていません。

## このレポジトリで会話力を伸ばす回し方

引継ぎを受ける人自身も会話力を伸ばしたいなら、実装保守と個人トレーニングを分けずに回すのが効率的です。推奨の進め方は以下です。

1. `Baseline Assessor` で自己認識と現状スコアのズレを確認する
2. その日の重点を 1 つに絞り、`Evidence-Based Warmups` を 1 本だけ回す
3. `Rapid Response Drill` で即答力を鍛える
4. `Pressure Defense Simulator` で詰められたときの論点維持を鍛える
5. `Persuasion Lab` で提案の通し方と反論処理を鍛える
6. `Session Review Dashboard` と [`session-review-template.md`](C:/Work_Codex/ExplainerCore/templates/session-review-template.md) で振り返る

会話力の中でも「雑談」「場を和らげる」「安心して遊べる会話」を伸ばしたい場合は、[`06-humor-conversation-training.md`](C:/Work_Codex/ExplainerCore/docs/research/deep-research/06-humor-conversation-training.md) が重要です。このレポートは、笑わせる技術よりも、相手が話しやすくなる会話設計、Yes, And、遊びフレーム、安全なズラし、不発時の回収を重視しています。

日次運用の最小形は以下です。

- ウォームアップ 1 本
- 実戦モジュール 2 本
- 各セッションで自己レビュー 3 行
- 1 本だけ深掘りレビュー

週次では以下を見ます。

- 弱いモジュール
- 自己認識差分が大きい回
- 改善した能力と悪化した能力
- 次週の重点 2 つ

## 引継ぎ時に共有しておきたい注意点

- `Provider Adapter` は設定状態の表示であり、Remote 成功保証ではありません
- 実際に Remote だったかどうかは、生成結果や採点結果の `Mode` と `providerMessage` を確認します
- `sessions` は運用データなので、検証用の一時データを増やしすぎない方が扱いやすいです
- UI/UX を変えたら [`docs/ux`](C:/Work_Codex/ExplainerCore/docs/ux/app-information-architecture.md) を更新します
- 評価指標を変えたら `docs/evaluation` を更新します
- 訓練導線を変えたら `docs/training` を更新します
- provider まわりを変えたら [`provider-setup.md`](C:/Work_Codex/ExplainerCore/docs/strategy/provider-setup.md) を更新します

## 最初の 1 週間の推奨プラン

### Day 1

- 文書を一通り読む
- アプリを起動する
- テスト、型チェック、ビルドを通す

### Day 2-3

- OpenAI を先に設定して Remote 動作を確認する
- Baseline と Rapid Response を自分で 1 回ずつ回す
- `sessions` に何が残るかを確認する

### Day 4-5

- Claude / Gemini も設定し、出力差を比較する
- 評価コメントの質と `nextActions` の納得感を見る
- 必要なら rubrics/scenarios の修正候補をメモする

### Day 6-7

- 1 つだけ改善を入れて、関連ドキュメントも更新する
- 自分の会話トレーニング結果を 1 件振り返り文書に残す

## 迷ったら戻る場所

- 目的に迷ったら: [`project-charter.md`](C:/Work_Codex/ExplainerCore/docs/strategy/project-charter.md)
- 構造に迷ったら: [`system-architecture.md`](C:/Work_Codex/ExplainerCore/docs/strategy/system-architecture.md)
- 運用に迷ったら: [`operating-playbook.md`](C:/Work_Codex/ExplainerCore/docs/training/operating-playbook.md)
- UI の意図に迷ったら: [`app-information-architecture.md`](C:/Work_Codex/ExplainerCore/docs/ux/app-information-architecture.md)
- 現在の残課題に迷ったら: [`repository-review-2026-04-10.md`](C:/Work_Codex/ExplainerCore/docs/strategy/repository-review-2026-04-10.md)

## 引継ぎの一言まとめ

このレポジトリは、完成品というより「既に回せる初期版」です。まずは壊さず動かし、次に実セッションを増やし、その後に評価品質と訓練導線を改善する順で進めると失敗しにくいです。
