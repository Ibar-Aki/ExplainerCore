# System Architecture

- 作成日: 2026-04-09 23:25 JST
- 作成者: Codex (GPT-5)

## 概要

ExplainerCore は、静的定義ファイル、ローカル API、React フロントエンド、セッション保存領域で構成されます。責務を分けることで、訓練ロジック、表示、保存形式、プロンプト設計を独立して改善できるようにしています。

## 構成

- `data/rubrics/*.json`: モジュール別ルーブリック
- `data/scenarios/*.json`: モジュール別シナリオ
- `apps/coach-web/server`: ローカル API と保存処理
- `apps/coach-web/src`: React UI
- `sessions/audio`: 録音ファイル
- `sessions/transcripts`: 文字起こしと自己レビュー
- `sessions/reviews`: 採点結果

## サーバー責務

- `/api/bootstrap`: modules, rubrics, scenarios, provider 状態を返す
- `/api/session/generate`: シナリオに対する coaching 情報を返す
- `/api/session/audio`: 録音ファイルを保存する
- `/api/session/evaluate`: transcript を採点し、transcript/review を保存する
- `/api/history`: review index から履歴を返す

設計上のポイント:
- rubrics/scenarios はメモリキャッシュする
- 履歴は `sessions/reviews/index.json` を優先参照する
- scenario 検証は `moduleId + scenarioId` で行う
- provider 設定状態と実行結果は分けて扱う

## フロント責務

- `App.tsx`: 画面全体のオーケストレーション
- `components/*`: パネル単位の描画
- `hooks/usePracticeRecorder.ts`: 録音、音声認識、音声 URL 管理
- `lib/baseline.ts`: Baseline 自己診断の計算と localStorage draft
- `lib/dashboard.ts`: 履歴集計とダッシュボード表示用の派生計算

## データの流れ

1. 起動時に `bootstrap` と `history` を取得
2. モジュールとシナリオを選択して生成 API を呼ぶ
3. 録音し、必要なら音声を保存する
4. transcript と selfReview を評価 API へ送る
5. server が transcript/review/index を更新する
6. front が history を再取得してダッシュボードを更新する

## Baseline 関連の扱い

- 自己診断の回答と自己認識メモは localStorage draft に保持する
- Baseline Assessor で採点すると、draft から `baselineSelfCheck` を作って保存する
- 採点結果には `selfCheckComparison` を入れ、自己認識平均との差を見る

## 今後の拡張候補

- review index の再構築コマンド
- transcript / review の JSON schema 明文化
- Remote 失敗時の詳細ログ分類
- シナリオ追加時の検証スクリプト
