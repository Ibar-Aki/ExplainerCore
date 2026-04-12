# ExplainerCore

- 作成日: 2026-04-09 00:20 JST
- 作成者: Codex (GPT-5)
- 更新日: 2026-04-12

## 概要

ExplainerCore は、日本語の社内会議や報告を主戦場として、説明力と会話力を継続的に鍛えるための個人トレーニング基盤です。単発のノウハウ収集ではなく、調査、評価、訓練、記録、振り返りを同じフォルダ構成の中で回すことを目的にしています。

鍛える対象は以下の 4 能力です。

1. ビジネスでの会話力と説明のわかりやすさ
2. 急に話を振られたときの反射神経と即答力
3. 詰められたときに論点を崩さず説明し切る力
4. 提案を通すための説得力と反論処理力

## 現在の実装状況

現時点では、以下が利用できます。

- `prompts/deep-research` に 5 本の外部 LLM 向け調査プロンプト
- `docs/research/deep-research` に整理済みの deep research レポート
- `data/rubrics` にモジュール別ルーブリック JSON
- `data/scenarios` に会議・報告・詰め対応・説得シナリオ JSON
- `apps/coach-web` にローカル Web アプリ
- `sessions` に音声、文字起こし、採点結果の保存

`coach-web` には以下のモジュールがあります。

- `Baseline Assessor`
- `Rapid Response Drill`
- `Pressure Defense Simulator`
- `Persuasion Lab`
- `Session Review Dashboard`

## 重要な仕様

- Provider カードは各 LLM の設定状態を示します
- 実際にその回で `Remote` か `Fallback` だったかは、生成結果と採点結果の `providerMessage` と `Mode` を見ます
- Baseline の自己診断スライダーと自己認識メモはローカル draft として保持され、Baseline 採点時にはセッション記録にも保存されます
- 継続評価の速度系メトリクスは、現時点では「質問提示後に録音開始へ入るまでの準備時間」を `answerPreparationSec` として扱います
- セッションごとの制限時間は `timeLimitSec` として保存され、評価結果には `estimatedReadingSec` `fillerCount` `longPauseCount` `selfPerceptionGap` などの簡易メトリクスも含まれます
- rubrics/scenarios はサーバープロセス内でキャッシュされ、履歴は `sessions/reviews/index.json` を優先して参照します
- 各訓練モジュールには、研究ベースで短時間に回せる `Evidence-Based Warmups` が付き、そこから今回の重点へ直接反映できます
- `Session Setup` では 30 / 60 / 90 秒プリセットを使え、シナリオ本文に秒数がある場合は既定値にも反映されます
- `Scenario` では prompt に加えて `successSignals` と `constraints` を表示し、`Session Review Dashboard` では自己認識差分の平均も確認できます

## ディレクトリ方針

- `docs`: 設計、調査、評価、訓練、UI/UX の文書
- `prompts`: 外部 LLM 調査用、評価用、シミュレーション用のプロンプト
- `data`: 採点ルーブリック、訓練シナリオ、加工前後データ
- `apps/coach-web`: ローカル Web トレーニングアプリ
- `sessions`: 音声、文字起こし、レビュー結果の保存先
- `templates`: セッション記録などのテンプレート

## まず読む文書

- 全体方針: [`PLANS.md`](C:/Work_Codex/ExplainerCore/PLANS.md)
- 成功条件とスコープ: [`project-charter.md`](C:/Work_Codex/ExplainerCore/docs/strategy/project-charter.md)
- 実装構造: [`system-architecture.md`](C:/Work_Codex/ExplainerCore/docs/strategy/system-architecture.md)
- レポジトリレビュー記録: [`repository-review-2026-04-10.md`](C:/Work_Codex/ExplainerCore/docs/strategy/repository-review-2026-04-10.md)
- 評価設計: [`baseline-framework.md`](C:/Work_Codex/ExplainerCore/docs/evaluation/baseline-framework.md)
- 訓練運用: [`operating-playbook.md`](C:/Work_Codex/ExplainerCore/docs/training/operating-playbook.md)
- UI/UX 構成: [`app-information-architecture.md`](C:/Work_Codex/ExplainerCore/docs/ux/app-information-architecture.md)
- deep research 一覧: [`index.md`](C:/Work_Codex/ExplainerCore/docs/research/deep-research/index.md)

## coach-web の起動

`apps/coach-web` で以下を実行します。

```bash
npm install
npm run dev:all
```

- フロント: [http://localhost:5173](http://localhost:5173)
- ローカル API: [http://localhost:8787](http://localhost:8787)

確認用コマンド:

```bash
npm test
npm run typecheck
npm run build
```

## Provider 設定

`.env.example` を `.env` にコピーし、必要な API キーを設定すると OpenAI / Claude / Gemini を切り替えられます。キー未設定時はローカル fallback 評価で動作します。

詳細は [`provider-setup.md`](C:/Work_Codex/ExplainerCore/docs/strategy/provider-setup.md) を参照してください。

## 推奨の使い方

1. `prompts/deep-research` を使って説明力・会話力の知見を集める
2. `Baseline Assessor` で自己診断と初回採点を行う
3. 各モジュール冒頭の `Evidence-Based Warmups` を 1 つ選び、今回の重点へ反映してから回す
4. 弱点に応じて `Rapid Response Drill` / `Pressure Defense Simulator` / `Persuasion Lab` を回す
5. `Session Review Dashboard` で履歴比較し、次の重点を決める
6. `templates/session-review-template.md` を使って重要セッションを手動レビューする

## 直近の次アクション

- API キーを入れて OpenAI / Claude / Gemini の Remote 採点を 1 回ずつ確認する
- 実運用セッションを増やし、履歴からルーブリックの重みと nextActions の質を調整する
- deep research の調査結果を [`docs/research/deep-research`](C:/Work_Codex/ExplainerCore/docs/research/deep-research/index.md) から見直し、`data/scenarios` と `data/rubrics` に反映する
