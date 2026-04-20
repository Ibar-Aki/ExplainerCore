# Research Map — 調査テーマと結果レポートの索引

> **「どんな調査がされているか」「どのレポートを読めばいいか」を確認したいときに開いてください。**

- 最終更新: 2026-04-19

---

## 調査テーマと対応レポートの一覧

| # | テーマ | 調査レポート | 調査プロンプト |
|---|---|---|---|
| 1 | わかりやすい説明 | [01-business-explanation.md](deep-research/01-business-explanation.md) | [prompts/01](../../prompts/deep-research/01-business-explanation.md) |
| 2 | 即答力 | [02-rapid-response.md](deep-research/02-rapid-response.md) | [prompts/02](../../prompts/deep-research/02-rapid-response.md) |
| 3 | 詰め対応 | [03-pressure-defense.md](deep-research/03-pressure-defense.md) | [prompts/03](../../prompts/deep-research/03-pressure-defense.md) |
| 4 | 説得と合意形成 | [04-persuasion-and-alignment.md](deep-research/04-persuasion-and-alignment.md) | [prompts/04](../../prompts/deep-research/04-persuasion.md) |
| 5 | 評価方法とアプリ設計 | [05-evaluation-and-app-design.md](deep-research/05-evaluation-and-app-design.md) | [prompts/05](../../prompts/deep-research/05-evaluation-and-apps.md) |
| 6 | 補助テーマ: ユーモア会話訓練 | [06-humor-conversation-training.md](deep-research/06-humor-conversation-training.md) | （プロンプトなし）|

---

## 簡単に始められる訓練法のレポート

調査結果の中でも、「個人で手軽に始められる」「根拠が比較的ある」訓練法をまとめた別レポートがあります。

→ [easy-evidence-based-training-methods.md](evidence-based/easy-evidence-based-training-methods.md)

**特に優先する6つ:**
1. 自己説明プロンプト（説明の構造化）
2. 想起練習（即答の初速向上）
3. 分散練習（定着・型の自動化）
4. If-Then プランニング（即答・詰め対応の一手目自動化）
5. 低速呼吸（詰め対応の崩れにくさ）
6. 視点取得プロンプト（説得力・交渉）

---

## 各テーマで調査している内容

### 1. わかりやすい説明
- 結論先行、構造化、例示、抽象と具体の往復
- 誤解を減らす言い換えと聞き手別の最適化

### 2. 即答力
- 時間制約下での回答設計（30/60/90秒）
- 会議での端的な報告、質問意図の即時把握
- 回答準備時間の短縮

### 3. 詰め対応
- 論点の切り分けと事実・解釈の分離
- 守るべき主張と引くべき主張の判断
- 感情的圧への耐性と信頼を落とさない防御
- 境界線管理と再着地

### 4. 説得と合意形成
- 相手の関心軸に合わせた説明調整
- 反論の先回りと両面提示
- 利害関係者別の最適化とクロージング

### 5. 評価方法とアプリ設計
- 自己評価・AI評価の組み合わせ設計
- 音声評価・応答速度の測定
- 継続利用しやすいUX設計

### 6. ユーモア会話訓練（補助テーマ）
- 笑わせる技術より「相手が話しやすくなる会話設計」を重視
- `Yes, And`、遊びフレーム、安全なズラし、不発時の回収

---

## 調査データの格納ルール

| 種類 | 格納先 |
|---|---|
| 調査結果（生データ） | `data/raw/` |
| 調査結果（整理版・要約） | `docs/research/` 配下のMarkdown |
| deep researchの主レポート | `docs/research/deep-research/` |
| 実装へ反映した観点 | `data/rubrics/` `data/scenarios/` `docs/evaluation/` `docs/training/` |

---

## 過去の反映計画レポート（参考）

調査結果を実装へどう反映するかを検討した記録は、以下のアーカイブに保管しています。

- [docs/strategy/archive/](../strategy/archive/)

---

**→ 次に読む:** 各レポートを読んだ後は [training-guide.md](../training/training-guide.md) に戻り、訓練に反映する
