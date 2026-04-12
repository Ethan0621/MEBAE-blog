# 🌸 めばえのカリフォルニアブログ - 運用ガイド

## 📝 記事を投稿する方法（3つ）

---

### 方法① ブラウザの管理画面で書く（おすすめ！）

1. ターミナルで `./preview.sh` を実行
2. ブラウザで **http://localhost:1313/admin.html** を開く
3. タイトル・カテゴリー・タグ・本文を入力
4. 「📄 記事ファイルを生成」ボタンを押す
5. 「📋 コピー」して VS Code の `content/posts/` に新しい `.md` ファイルとして保存
6. ターミナルで `./publish.sh` を実行して公開！

---

### 方法② スクリプトで作る（ターミナル）

```bash
./new-post.sh
```

質問に答えていくだけで記事のテンプレートが作成されます。

---

### 方法③ VS Code で直接書く

1. `content/posts/` フォルダを右クリック → 「新しいファイル」
2. ファイル名は `記事名.md`（例: `costco-april-2026.md`）
3. 以下のテンプレートをコピーして書き始める：

```markdown
---
title: "記事タイトル"
date: 2026-04-11
draft: false
categories: ["アメリカ生活"]
tags: ["ロサンゼルス"]
description: "記事の説明"
image: ""
---

ここに記事を書く
```

---

## 📸 写真の使い方

### 写真の保存場所
- `static/images/` フォルダに保存
- 記事ごとにフォルダを分けると整理しやすい
  - 例: `static/images/costco-april/photo1.jpg`

### 記事に写真を入れる

```
{{< img src="/images/costco-april/photo1.jpg" alt="コストコの商品" caption="お気に入りの商品🛒" >}}
```

### 複数写真をギャラリーで表示

```
{{< gallery >}}
{{< img src="/images/costco-april/item1.jpg" alt="商品1" >}}
{{< img src="/images/costco-april/item2.jpg" alt="商品2" >}}
{{< img src="/images/costco-april/item3.jpg" alt="商品3" >}}
{{< /gallery >}}
```

---

## 🎥 動画の使い方

1. YouTubeに動画をアップロード
2. 動画のURLから **ID** をコピー（`https://youtu.be/ABC123` の `ABC123`）
3. 記事に貼り付け：

```
{{< youtube id="ABC123" title="コストコ購入品紹介" >}}
```

---

## 🚀 記事を公開する

```bash
./publish.sh
```

これだけで記事がインターネットに公開されます！

---

## 📂 ホームのカテゴリーを管理する

トップページに表示されるカテゴリーボックスの追加・削除・並び替えができます。

### 管理画面から操作する方法（おすすめ！）

1. ターミナルで `./start-blog.sh` を実行
2. ブラウザで **http://localhost:1313/admin.html** を開く
3. ヘッダーの「📂 カテゴリー」ボタンをクリック
4. 以下の操作ができます：

| やりたいこと | 操作 |
|------------|------|
| 並び替え | ☰ マークをつかんでドラッグ＆ドロップ |
| 追加 | 「＋ カテゴリーを追加」ボタンをクリック |
| 削除 | 各行の右側の ✕ ボタンをクリック |
| 絵文字の変更 | 左側の絵文字欄をクリックして入力 |
| 名前・URLの変更 | 各欄を直接クリックして編集 |

5. 「💾 保存する」をクリック
6. 「🚀 サイトに公開する」で本番サイトに反映

### URLの形式

カテゴリーのURLは以下の形式で入力します：
```
/categories/カテゴリー名/
```
例：`/categories/アメリカ生活/`、`/categories/costco/`

> 💡 カテゴリーを追加した場合は、対応する `content/categories/カテゴリー名/_index.md` ファイルも必要です。

---

## 📂 フォルダ構成

```
blog/
├── content/posts/     ← 📝 記事はここに保存
├── static/images/     ← 📸 写真はここに保存
├── static/css/        ← 🎨 デザイン
├── new-post.sh        ← 📝 記事作成スクリプト
├── publish.sh         ← 🚀 公開スクリプト
└── preview.sh         ← 👀 プレビュースクリプト
```

---

## 🔧 便利コマンド

| やりたいこと | コマンド |
|------------|---------|
| プレビュー起動 | `./preview.sh` |
| 新しい記事を作成 | `./new-post.sh` |
| 記事を公開 | `./publish.sh` |
| サイトを表示 | ブラウザで http://localhost:1313 |
| 管理画面を開く | ブラウザで http://localhost:1313/admin.html |

---

## 🚀 ブログの公開・収益化

詳しい手順は **[DEPLOY.md](DEPLOY.md)** をご覧ください。

- Netlify（無料）での公開方法
- 独自ドメインの設定
- Google AdSense / Amazon アフィリエイトの始め方
- 費用：**年間 約1,500円（ドメイン代のみ）**
