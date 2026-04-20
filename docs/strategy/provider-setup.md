# Provider Setup — AI プロバイダの設定方法

> **Remote採点を使いたいときに読んでください。** API キー未設定でもアプリは動きます（fallback評価モード）。

- 最終更新: 2026-04-19

---

## 設定手順

**Step 1:** `.env.example` を `.env` としてコピーする

```bash
cp apps/coach-web/.env.example apps/coach-web/.env
```

**Step 2:** 使いたいプロバイダの API キーを`.env` に記入する

```env
APP_PORT=8787

OPENAI_API_KEY=sk-...        # OpenAI を使う場合
OPENAI_MODEL=gpt-4.1-mini

ANTHROPIC_API_KEY=sk-ant-...  # Claude を使う場合
ANTHROPIC_MODEL=claude-3-5-sonnet-latest

GEMINI_API_KEY=AI...          # Gemini を使う場合
GEMINI_MODEL=gemini-2.0-flash
```

**Step 3:** アプリを起動する

```bash
cd apps/coach-web
npm run dev:all
```

**Step 4:** 画面上部の `Provider Adapter` に `CONFIGURED` と表示されていることを確認する

**Step 5:** 実際にセッション生成と採点を1回ずつ行い、結果欄の `Mode: Remote` と `providerMessage`を確認する

---

## 各プロバイダの API キー取得先

| プロバイダ | API キー取得先 | このアプリでの使い方 |
|---|---|---|
| **OpenAI** | [platform.openai.com/settings/organization/api-keys](https://platform.openai.com/settings/organization/api-keys) | Responses API でシナリオ生成と採点を行う |
| **Claude** | [console.anthropic.com](https://console.anthropic.com) | Messages API で JSON形式の生成と採点を行う |
| **Gemini** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | `generateContent` で JSON形式の生成と採点を行う |

---

## よくある誤解

> ❌ 「`Provider Adapter` が `CONFIGURED` なら Remote採点は成功する」

**正しくは:** `CONFIGURED` は API キーが設定されていることを示すだけです。  
Remote が実際に成功したかどうかは、**採点結果の `Mode` フィールド**（`Remote` または `Fallback`）と `providerMessage` で確認してください。

---

## 動作確認チェックリスト

```
□ Provider Adapter のカードが CONFIGURED になっている
□ 生成結果の providerMessage にプロバイダ名とモデル名が出る
□ 採点結果の Mode が Remote になる
□ Remote が一定時間応答しない場合でも fallback に切り替わる
□ Remote 失敗時は providerMessage に原因が残る
```

---

## 推奨する導入順序

最初から3社を同時に比較しようとすると混乱しやすいので、以下の順がおすすめです。

1. **まず OpenAI だけ設定**して、Remote採点が動くことを確認する
2. **次に Claude を追加**し、同じシナリオで評価内容の違いを比較する
3. **最後に Gemini を追加**して、3社の `nextActions` の品質差を確認する

---

**→ 次に読む:** [maintainer-handover.md](maintainer-handover.md)（引き継ぎ時の作業手順）
