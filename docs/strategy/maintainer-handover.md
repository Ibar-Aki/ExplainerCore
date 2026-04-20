# Maintainer Handover — 引き継ぎガイド

> **引き継いだ直後に読んでください。** このドキュメントの目的は、最初の1週間に迷わないことです。  
> 詳細な設計や運用方法は各専門ドキュメントにあります。

- 最終更新: 2026-04-19

---

## まず理解すること（3行）

- **中核プロダクト:** `apps/coach-web` のローカルWebアプリ
- **現在の状態:** 初期実装完了、これから実セッションを増やして評価精度を詰める段階
- **API キー未設定でも動く:** fallback評価モードで全機能が使える

---

## 最初の1週間の行動計画

### Day 1 — 全体像をつかむ

以下をこの順で読みます（各10〜15分）。

| 順番 | 文書 | 読む目的 |
|---|---|---|
| 1 | [README.md](../../README.md) | プロジェクト全体の構成を把握する |
| 2 | [PLANS.md](../../PLANS.md) | 今どこにいて、次に何をすべきかを把握する |
| 3 | [project-charter.md](project-charter.md) | なぜこのプロジェクトがあるかを理解する |
| 4 | [system-architecture.md](system-architecture.md) | コード構成とデータの流れを把握する |
| 5 | [training-guide.md](../training/training-guide.md) | 訓練の回し方を把握する |

### Day 2-3 — アプリを動かす

```bash
cd apps/coach-web
npm install
npm run dev:all
```

確認ポイント:
- http://localhost:5173 が開く
- http://localhost:8787 のAPIが応答する
- モジュール切替・シナリオ表示・録音UI・Dashboard が正常に動く

テストも合わせて流してください:

```bash
npm test          # 回帰テスト（fallback評価ロジックの確認）
npm run typecheck # 型エラーチェック
npm run build     # ビルド確認（本番と同じ状態の確認）
```

> **注意:** テストは限定的で、UIのE2Eは未整備です。アプリの手動確認も重要です。

### Day 4-5 — Remote採点を確認する

[provider-setup.md](provider-setup.md) に従い、OpenAIから順に設定して採点を通してください。

確認ポイント:
- 採点結果の `Mode` が `Remote` になる
- `nextActions` の内容が fallback より具体的になる

### Day 6-7 — 最初の改善を入れる

実際にトレーニングを1回以上回し、気になった箇所（rubric、scenario、UI）を1つだけ改善してください。  
改善したら、関連ドキュメントも必ず更新します。

---

## 各部分の担当と変更先

| やりたいこと | 見る場所 |
|---|---|
| 採点観点を変える | `data/rubrics/*.json` |
| シナリオを追加・変更する | `data/scenarios/*.json` |
| 画面を変える | `src/components/*` |
| 録音の挙動を変える | `src/hooks/usePracticeRecorder.ts` |
| AI評価ロジックを変える | `server/aiProviders.ts` / `server/fallbackEngine.ts` |
| 保存・履歴管理を変える | `server/dataStore.ts` |

---

## 変更したときのドキュメント更新ルール

| 変更内容 | 更新するドキュメント |
|---|---|
| UI/UX を変えた | [app-information-architecture.md](../ux/app-information-architecture.md) |
| 評価指標を変えた | [baseline-framework.md](../evaluation/baseline-framework.md) |
| 訓練の回し方を変えた | [training-guide.md](../training/training-guide.md) |
| Provider まわりを変えた | [provider-setup.md](provider-setup.md) |

---

## 注意事項

- **`Provider Adapter` の `CONFIGURED` 表示はRemote成功を保証しない。** 実際のRemote/Fallbackは採点結果の `Mode` で確認する。
- **`sessions/` は実運用データ。** 検証用の一時データを増やしすぎると管理が煩雑になる。
- **E2Eテストは未整備。** UIの変更後は必ず手動で動作確認する。

---

## 自分自身のトレーニングも兼ねる場合

保守作業と訓練を分けずに回すのが一番効率的です。
詳しい使い方は [training-guide.md](../training/training-guide.md) を参照してください。

---

**一言でまとめると:** まずは壊さず動かし、実セッションを増やし、その後に評価品質と訓練導線を改善する順で進めると失敗しにくいです。
