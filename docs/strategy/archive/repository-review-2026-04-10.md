# Repository Review 2026-04-10

- 作成日: 2026-04-10 00:58 JST
- 作成者: Codex (GPT-5)

## 目的

この文書は、ExplainerCore 全体レビューで確認した主要な不具合、修正内容、残課題を簡潔に残すための記録です。

## 今回見つかった主な問題

- fallback 採点で `nextActions` を作る際に `breakdown.sort()` をそのまま使っており、表示順がルーブリック順から崩れる
- Remote provider 呼び出しにタイムアウトがなく、外部 API 停滞時に生成や採点が長時間ぶら下がる
- 録音停止の二重実行や音声認識停止時に、誤検知のエラー表示が出る余地がある
- 回帰防止テストがなく、fallback 評価ロジックの並び替えバグのような問題を再発しやすい

## 実施した修正

- `fallbackEngine.ts` で `nextActions` 用の並び替えをコピー配列に変更し、`breakdown` の表示順を維持
- `aiProviders.ts` に timeout 付き fetch を追加し、Remote 呼び出し停滞時は明示的に fallback へ切替
- `usePracticeRecorder.ts` を修正し、録音停止レースと `SpeechRecognition` の不要エラー通知を抑制
- `apps/coach-web/tests/fallbackEngine.test.ts` を追加し、fallback 評価の順序バグを自動検知可能にした
- `package.json` に `npm test` を追加した

## フォルダ整理

- 検証用に生成した `sessions` 配下の一時レビュー記録は削除対象とし、常設データを増やさない運用に寄せる
- `dist` や `output` のような生成物は Git 管理外のまま維持し、必要に応じて削除して使う

## 残課題

- Remote 実通信は API キー未設定のため、全 provider の疎通までは未確認
- UI 全体の自動 E2E テストは未整備
- fallback 評価ロジックは改善済みだが、実運用データが増えたら重みや改善文言の再調整が必要
