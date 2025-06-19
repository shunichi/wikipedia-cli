# Wikipedia CLI Tool

TypeScript製のWikipedia検索CLIツール。Wikipedia APIを使用して記事の検索・表示・履歴管理を行います。

## 特徴

- 🔍 **記事検索**: キーワードでWikipedia記事を検索
- 📖 **記事表示**: 記事の詳細内容を表示（要約モードも対応）
- 🔄 **リダイレクト自動追従**: リダイレクト記事を自動的に最終記事に転送
- 🎲 **ランダム記事**: ランダムな記事を表示
- 📝 **検索履歴**: 過去の検索履歴を管理
- 🌐 **多言語対応**: 日本語・英語Wikipedia対応
- 🧹 **MediaWiki記法処理**: 記事のマークアップを読みやすいテキストに変換

## インストール

### 前提条件

- Node.js (v18以上)
- npm

### セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd cc-sandox

# 依存関係をインストール
npm install

# TypeScriptをビルド
npm run build

# グローバルコマンドとして登録
npm link
```

## 使用方法

### 基本的なコマンド

```bash
# ヘルプを表示
wiki --help

# 記事を検索
wiki search "東京"
wiki search "Tokyo" --lang en

# 記事を表示
wiki show "東京"

# 要約のみ表示
wiki show -s "東京"

# 特定セクションを表示
wiki show "東京" --section "歴史"

# リンクも表示
wiki show "東京" --links

# ランダム記事
wiki random
wiki random --lang en

# 検索履歴を表示
wiki history
```

### オプション

#### 共通オプション
- `-l, --lang <lang>`: 言語設定 (ja/en) デフォルト: ja

#### show コマンド
- `-s, --summary`: 要約のみ表示（最初の3文）
- `--section <section>`: 特定セクションを表示
- `--links`: 関連リンクを表示

## 開発

### 開発用コマンド

```bash
# 開発モードで実行
npm run dev search "テスト"

# テスト実行
npm test

# リント実行
npm run lint

# ビルド
npm run build

# クリーンアップ
npm run clean
```

### プロジェクト構成

```
src/
├── index.ts          # CLIエントリーポイント
├── wikipedia.ts      # Wikipedia API統合
├── history.ts        # 検索履歴管理
└── __tests__/        # テストファイル
    └── wikipedia.test.ts
```

### 主要な技術

- **TypeScript**: 型安全な開発
- **commander.js**: CLI framework
- **axios**: HTTP クライアント
- **Jest**: テストframework
- **ESLint**: コード品質管理

## API 仕様

### Wikipedia API エンドポイント

- 検索: `https://{lang}.wikipedia.org/w/api.php?action=query&list=search`
- 記事取得: `https://{lang}.wikipedia.org/w/api.php?action=query&prop=revisions|extracts`
- ランダム: `https://{lang}.wikipedia.org/w/api.php?action=query&list=random`

### 設定ファイル

検索履歴は `~/.config/wiki/history.json` に保存されます。

## 例

### 記事検索の例

```bash
$ wiki search "猫"
検索結果: "猫"
──────────────────────────────────────────────────
1. ネコ
   ネコ（猫）は、狭義には食肉目ネコ科ネコ属に分類される...

2. 猫の手も借りたい
   猫の手も借りたいは、日本のことわざ...
```

### 要約表示の例

```bash
$ wiki show -s "猫"
"猫" から "ネコ" にリダイレクトされました

記事: ネコ
══════════════════════════════════════════════════
【要約】
ネコ（猫）は、狭義には食肉目ネコ科ネコ属に分類されるリビアヤマネコ（ヨーロッパヤマネコ）が家畜化されたイエネコ（家猫、Felis silvestris catus）に対する通称である。イヌ（犬）と並ぶ代表的なペットとして、世界中で飼われている。広義的には、ヤマネコやネコ科動物全般を指すこともある（後述）。
```

## ライセンス

MIT

## 貢献

プルリクエストや Issue の報告を歓迎します。

## 作者

🤖 Generated with [Claude Code](https://claude.ai/code)