---
title: "【管理用】写真・動画の投稿ガイド"
date: 2026-04-11
draft: true
---

## 📸 写真のアップロード方法

### 方法1: Cloudinary（おすすめ・ブログ用）

1. **Cloudinary にログイン**
   - https://cloudinary.com/ にアクセス
   - メールアドレスとパスワードでログイン

2. **写真をアップロード**
   - 左メニューの「Media Library」をクリック
   - 「Upload」ボタンを押す
   - iPhone の写真を選んでアップロード
   - フォルダは `blog/料理`、`blog/costco` など分けると整理しやすい

3. **記事に貼り付け**
   - アップロードした画像の名前をコピー
   - 記事内に以下のように書く：

```
{{</* img src="cloudinary:blog/料理/nikujaga.jpg" alt="肉じゃが" caption="今日の晩ご飯🍲" */>}}
```

### 方法2: ローカル画像（少量の場合）

1. 画像を `/Users/hideki/blog/static/images/` フォルダに保存
2. 記事内に以下のように書く：

```
{{</* img src="/images/nikujaga.jpg" alt="肉じゃが" caption="今日の晩ご飯🍲" */>}}
```

---

## 🖼️ 複数の写真をギャラリーで表示

```
{{</* gallery */>}}
{{</* img src="cloudinary:blog/costco/item1.jpg" alt="商品1" */>}}
{{</* img src="cloudinary:blog/costco/item2.jpg" alt="商品2" */>}}
{{</* img src="cloudinary:blog/costco/item3.jpg" alt="商品3" */>}}
{{</* /gallery */>}}
```

---

## 🎥 動画の投稿方法

1. **YouTube に動画をアップロード**
   - iPhone の YouTube アプリから直接アップロード
   - 「限定公開」or「公開」で投稿

2. **動画IDをコピー**
   - YouTube の URL `https://youtu.be/ABC123` の `ABC123` 部分

3. **記事に貼り付け**

```
{{</* youtube id="ABC123" title="コストコ購入品紹介" */>}}
```

---

## 📝 新しい記事の書き方テンプレート

```markdown
---
title: "記事のタイトル"
date: 2026-04-11
categories: ["料理"]
tags: ["お昼ご飯", "料理記録"]
image: "cloudinary:blog/料理/thumbnail.jpg"
description: "記事の説明文（Google検索に表示されます）"
---

ここに本文を書きます。

写真を入れたいときは：
{{</* img src="cloudinary:blog/料理/photo.jpg" alt="写真の説明" */>}}

YouTubeを入れたいときは：
{{</* youtube id="動画ID" title="動画タイトル" */>}}
```
