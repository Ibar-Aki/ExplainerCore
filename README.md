# ExplainerCore

**社内会議や報告の場で、説明力と会話力を継続的に鍛えるための個人トレーニング基盤です。**

単発のノウハウ収集で終わらせず、「調査 → 評価 → 訓練 → 記録 → 振り返り」のサイクルを同じ構成のまま回し続けることを目的にしています。

---

## 何ができるか

| できること | 担当ファイル・機能 |
|---|---|
| 自分の説明力を診断する | `Baseline Assessor`（Webアプリ） |
| 即答力を鍛える | `Rapid Response Drill` |
| 詰められても崩れない力を鍛える | `Pressure Defense Simulator` |
| 提案を通す力を鍛える | `Persuasion Lab` |
| 過去のセッションと比較して成長を確認する | `Session Review Dashboard` |

---

## クイックスタート

```bash
cd apps/coach-web
npm install
npm run dev:all
```

- フロント: http://localhost:5173
- API サーバー: http://localhost:8787

**AI採点を使う場合**は、`.env.example` を `.env` にコピーして API キーを設定してください。  
設定しない場合でも、ローカル fallback 評価で動作します。  
→ 詳細: [Provider Setup](docs/strategy/provider-setup.md)

---

## ドキュメントマップ

「何を知りたいか」に応じて読む文書が変わります。

| 知りたいこと | 読む文書 |
|---|---|
| このプロジェクト全体の目的と方針 | [project-charter.md](docs/strategy/project-charter.md) |
| 今どのフェーズにいて、次に何をすべきか | [PLANS.md](PLANS.md) |
| アプリの仕組みとコード構成 | [system-architecture.md](docs/strategy/system-architecture.md) |
| 引き継いで最初に何をすべきか | [maintainer-handover.md](docs/strategy/maintainer-handover.md) |
| AIプロバイダの設定方法 | [provider-setup.md](docs/strategy/provider-setup.md) |
| 評価の観点と指標の意味 | [baseline-framework.md](docs/evaluation/baseline-framework.md) |
| 日次・週次の訓練の回し方 | [training-guide.md](docs/training/training-guide.md) |
| アプリの画面構成とUI意図 | [app-information-architecture.md](docs/ux/app-information-architecture.md) |
| 調査レポートの一覧 | [research-map.md](docs/research/research-map.md) |

---

## ディレクトリ構成

```
ExplainerCore/
├── apps/
│   └── coach-web/          # ローカルWebトレーニングアプリ（フロント + APIサーバー）
├── data/
│   ├── rubrics/            # 採点ルーブリック（JSON）
│   └── scenarios/          # 訓練シナリオ（JSON）
├── docs/
│   ├── strategy/           # 方針・設計・運用の意思決定文書
│   ├── evaluation/         # 評価設計
│   ├── training/           # 訓練の設計と運用手順
│   ├── ux/                 # UIと画面設計の意図
│   └── research/           # 調査レポート
├── prompts/                # 外部LLMへ渡す調査・評価用プロンプト
├── sessions/               # 音声・文字起こし・採点結果の保存先
└── templates/              # セッション振り返りテンプレート
```

---

## ヘルスチェック（動作確認）

```bash
cd apps/coach-web
npm test          # 回帰テスト
npm run typecheck # 型チェック
npm run build     # ビルド確認
```
