# App Information Architecture — 画面構成とUI設計の意図

> **UIを変更するとき、または画面の意図がわからなくなったときに読んでください。**

- 最終更新: 2026-04-19

---

## 画面構成の全体像

アプリは上から下へ以下の5つのエリアで構成されています。

```
┌──────────────────────────────────────────┐
│  1. Hero エリア                           │  ← プロジェクト目的・直近状況のサマリー
├──────────────────────────────────────────┤
│  2. Provider Adapter                      │  ← AIプロバイダの設定状態表示
├──────────────────────────────────────────┤
│  3. Module Navigation（左ナビ）           │  ← モジュール切り替え
├──────────────────────────────────────────┤
│  4. Module Workspace（中央）              │  ← 訓練の実行スペース
├──────────────────────────────────────────┤
│  5. Session Review Dashboard（下部）      │  ← 履歴比較と成長サマリー
└──────────────────────────────────────────┘
```

---

## 各エリアの詳細

### 1. Hero エリア

| 表示内容 | 目的 |
|---|---|
| プロジェクトの目的（一文） | 使う前にゴールを再確認する |
| 登録モジュール数 | 訓練の選択肢を把握する |
| 直近平均スコア | 今の状態をひと目で確認する |
| 保存済みセッション数 | 蓄積量を把握してモチベーションにする |

### 2. Provider Adapter

- OpenAI / Claude / Gemini それぞれの設定状態（`CONFIGURED` / `NOT SET`）を表示
- **重要:** `CONFIGURED` はAPIキーが設定されているという意味であり、Remote採点の成功を保証するものではない
- 実際のRemote/Fallback切り替えは、採点結果の `Mode` フィールドで確認する

### 3. Module Navigation

左ナビから5つのモジュールを切り替えます。

| モジュール | 目的 |
|---|---|
| Baseline Assessor | 現状の説明力を診断する |
| Rapid Response Drill | 即答力を鍛える |
| Pressure Defense Simulator | 詰められても崩れない力を鍛える |
| Persuasion Lab | 提案を通す力を鍛える |
| Session Review Dashboard | 過去セッションを振り返る |

### 4. Module Workspace

訓練の実行スペースです。以下の順で使います。

| ステップ | パネル名 | 内容 |
|---|---|---|
| ① | Baseline Self Check | 自己診断スライダーと自己認識メモを入力（Baselineのみ） |
| ② | Evidence-Based Warmups | 今日の重点に合わせたウォームアップを1つ選ぶ |
| ③ | Session Setup | 制限時間（30/60/90秒プリセットまたは直接入力）を設定 |
| ④ | Scenario | シナリオ本文・`successSignals`・`constraints` を確認 |
| ⑤ | Record / Transcript | 録音して文字起こしを入力 |
| ⑥ | Rubric | 採点軸を確認する |
| ⑦ | Evaluation | AI採点結果・メトリクス・自己認識差分を確認 |

**設計上の重要ポイント:**
- 自己診断スライダーと自己認識メモは `localStorage` に draft 保存される（採点前に消えない）
- Baseline採点時に draft から `baselineSelfCheck` を作成してセッション記録にも保存される
- `Session Setup` でシナリオ本文に秒数が含まれる場合、その値が制限時間の既定値に自動反映される
- `Scenario` パネルでは prompt だけでなく `successSignals`（成功の兆候）と `constraints`（制約）も先に表示する

### 5. Session Review Dashboard

| 表示内容 | 目的 |
|---|---|
| 次の推奨アクション | 弱点に基づいて次に何をやるか提案する |
| 直近トレンド（直近3回 vs その前3回） | 改善しているかを確認する |
| 強い領域 / 弱い領域 | どこに時間を使うかを判断する |
| モジュール別平均スコア | 能力ごとのバランスを確認する |
| 直近の自己認識差分の平均 | 自己評価のズレ傾向を追う |
| セッション履歴一覧 | 過去のセッションを振り返る |

---

## コンポーネント構成

| ファイル | 役割 |
|---|---|
| `App.tsx` | 全体オーケストレーション（状態管理の中枢） |
| `ProviderPanel.tsx` | Provider設定状態の表示 |
| `ModuleNav.tsx` | モジュール切り替えナビ |
| `BaselineSelfCheckPanel.tsx` | 自己診断UI |
| `EvidenceWarmupsPanel.tsx` | Evidence-Based Warmups UI |
| `PracticeWorkspace.tsx` | メイン訓練ワークスペース |
| `ReviewDashboardPanel.tsx` | 履歴比較ダッシュボード |
| `usePracticeRecorder.ts` | 録音・音声認識フック |

---

## 導線設計の方針

- **初回ユーザー:** Dashboard → `Baseline Assessor` へ誘導する
- **即答力を鍛えたい日:** `Rapid Response Drill` を最短動線に置く
- **追及への耐性を鍛えたい日:** `Pressure Defense Simulator` へすぐ切り替えられるようにする
- **どのモジュールからでも:** `Session Review Dashboard` へ戻れるようにする

---

## UI/UXの方針

- 1つの画面で「状況確認 → 回答 → 評価」が完結するようにし、画面遷移を最小化する
- 状態色は **落ち着いた紺・青緑・琥珀** で統一する
- 録音中・制限時間のカウントダウン・採点完了は、視覚的に明確区別する
- Pressure Defense モジュールは、緊張感のある見た目（配色・構成）に寄せる

---

## UIを変更したら必ず更新する

このドキュメントを更新するとともに、変更内容が `docs/evaluation/` や `docs/training/` の記述とも整合しているか確認してください。

---

**→ 次に読む:** [research-map.md](../research/research-map.md)（調査レポートの一覧）
