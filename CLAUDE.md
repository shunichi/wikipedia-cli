# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wikipedia検索CLIツールのTypeScript実装。Wikipedia APIを使用して記事の検索・表示・履歴管理を行う。

## Development Commands

```bash
# 依存関係のインストール
npm install

# 開発モードで実行
npm run dev

# ビルド
npm run build

# 本番実行
npm start

# テスト実行
npm test

# リント実行
npm run lint

# クリーンアップ
npm run clean
```

## CLI Usage

```bash
# 記事検索
wiki search <キーワード> [--lang ja/en] [--summary]

# 記事表示
wiki show <記事タイトル> [--lang ja/en] [--summary] [--section <セクション名>] [--links]

# ランダム記事
wiki random [--lang ja/en]

# 検索履歴
wiki history
```

## Architecture

- `src/index.ts` - CLIエントリーポイント、commanderによるコマンド処理
- `src/wikipedia.ts` - Wikipedia API統合、検索・記事取得機能
- `src/history.ts` - 検索履歴の保存・取得機能
- `src/__tests__/` - Jestテストファイル

## Key Features

- Wikipedia API (日本語/英語対応)
- 検索履歴管理 (`~/.config/wiki/history.json`)
- MediaWiki記法の簡易テキスト変換
- エラーハンドリングとユーザビリティ重視