# Provider Setup

- 作成日: 2026-04-09 00:20 JST
- 作成者: Codex (GPT-5)
- 更新日: 2026-04-10

## 目的

`apps/coach-web` で fallback ではなく Remote 生成・Remote 採点を使うために、各 LLM プロバイダの API キーを `.env` に設定します。

## 手順

1. [`.env.example`](C:/Work_Codex/ExplainerCore/apps/coach-web/.env.example) を `.env` として複製する
2. 利用したいプロバイダの API キーを設定する
3. `apps/coach-web` で `npm run dev:all` を実行する
4. 画面上部の `Provider Adapter` で `CONFIGURED` 表示になっていることを確認する
5. 実際にセッション生成と採点を 1 回ずつ行い、結果欄の `Mode: Remote` と `providerMessage` を確認する

## `.env` の変数

```env
APP_PORT=8787

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-latest

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

## OpenAI

- API キー管理画面: [platform.openai.com/settings/organization/api-keys](https://platform.openai.com/settings/organization/api-keys)
- このアプリは [Responses API](https://api.openai.com/v1/responses) を使ってシナリオ生成と採点を行う
- サーバー実装では `instructions` と `input` を分けて送る
- プロジェクトキーを作成し、`OPENAI_API_KEY` に設定する

補足:
- 権限の考え方は [Manage permissions in the OpenAI platform](https://developers.openai.com/api/docs/guides/rbac) を参照
- provider カードは設定有無を示すだけで、Remote 成功を保証する表示ではない

## Claude

- 公式 API ドキュメント: [docs.anthropic.com/en/api/messages](https://docs.anthropic.com/en/api/messages)
- `ANTHROPIC_API_KEY` にキーを設定する
- このアプリでは `Messages API` を使って JSON 形式のシナリオ生成と採点を行う

## Gemini

- 公式 API ドキュメント: [ai.google.dev/api/generate-content](https://ai.google.dev/api/generate-content)
- `GEMINI_API_KEY` にキーを設定する
- このアプリでは `generateContent` を使って JSON 形式のシナリオ生成と採点を行う

## 確認チェックリスト

- `Provider Adapter` のカードが `CONFIGURED` になっている
- 生成結果の `providerMessage` に provider 名と model 名が出る
- 採点結果の `Mode` が `Remote` になる
- Remote 呼び出しが一定時間で応答しない場合も、fallback に切り替わり `providerMessage` に残る
- Remote 失敗時は fallback に落ち、原因が `providerMessage` に残る

## 推奨運用

- 最初は OpenAI だけ設定して Remote 動作を確認する
- 次に Claude と Gemini を追加し、同じシナリオで出力差を比較する
- 本格運用前に、各プロバイダで `Rapid Response Drill` と `Pressure Defense Simulator` を最低 1 回ずつ回す
