# 🚀 めばえのカリフォルニアブログ - 公開手順書

## 📋 目次

1. [公開方法の比較](#公開方法の比較)
2. [おすすめ：Netlify で公開する手順](#おすすめnetlify-で公開する手順)
3. [独自ドメインの設定](#独自ドメインの設定)
4. [記事の更新・公開の流れ](#記事の更新公開の流れ)
5. [収益化の設定](#収益化の設定)
6. [よくある質問](#よくある質問)

---

## 公開方法の比較

| サービス | 月額費用 | 難易度 | HTTPS | 独自ドメイン | おすすめ度 |
|---------|---------|--------|-------|------------|-----------|
| **Netlify** | 無料 | ⭐簡単 | ✅ 自動 | ✅ 無料設定 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | 無料 | ⭐簡単 | ✅ 自動 | ✅ 無料設定 | ⭐⭐⭐⭐ |
| GitHub Pages | 無料 | ⭐⭐普通 | ✅ 自動 | ✅ 無料設定 | ⭐⭐⭐ |
| Vercel | 無料 | ⭐簡単 | ✅ 自動 | ✅ 無料設定 | ⭐⭐⭐⭐ |
| レンタルサーバー | 月500〜1000円 | ⭐⭐⭐ | 要設定 | 別途購入 | ⭐⭐ |

**→ Netlify が最もおすすめです。完全無料で高速、設定も簡単です。**

---

## おすすめ：Netlify で公開する手順

### ステップ1: GitHub にブログをアップロード

#### 1-1. GitHub アカウントを作成

1. https://github.com にアクセス
2. 「Sign up」をクリック
3. メールアドレス、パスワード、ユーザー名を入力
4. 無料プラン（Free）を選択

#### 1-2. 新しいリポジトリを作成

1. GitHub にログイン
2. 右上の「+」→「New repository」をクリック
3. 以下の設定で作成：
   - **Repository name**: `mebae-california-blog`
   - **Private** を選択（ブログの中身を非公開にする場合）
4. 「Create repository」をクリック

#### 1-3. ブログをアップロード

ターミナル（VS Code のターミナル）で以下を実行：

```bash
cd ~/blog

# Git を初期化（初回のみ）
git init
git branch -M main

# GitHub のリポジトリを接続（URLはご自身のものに変更）
git remote add origin https://github.com/あなたのユーザー名/mebae-california-blog.git

# 全ファイルをアップロード
git add -A
git commit -m "ブログ初回アップロード"
git push -u origin main
```

> ⚠️ GitHub のユーザー名とパスワード（またはトークン）を聞かれたら入力してください。

---

### ステップ2: Netlify にデプロイ

#### 2-1. Netlify アカウントを作成

1. https://www.netlify.com にアクセス
2. 「Sign up」→「Sign up with GitHub」をクリック
3. GitHub アカウントで認証

#### 2-2. 新しいサイトを作成

1. Netlify ダッシュボードで「Add new site」→「Import an existing project」
2. 「Deploy with GitHub」を選択
3. リポジトリ `mebae-california-blog` を選択
4. 以下の設定を確認：

| 設定項目 | 値 |
|---------|-----|
| Branch to deploy | `main` |
| Build command | `hugo --minify` |
| Publish directory | `public` |

5. 「Deploy site」をクリック！

#### 2-3. デプロイ完了！

数分後、以下のようなURLでブログが公開されます：

```
https://random-name-12345.netlify.app
```

---

### ステップ3: サイト名を変更

1. Netlify ダッシュボード →「Site configuration」→「Change site name」
2. 好きな名前に変更：

```
https://mebae-california.netlify.app
```

---

## 独自ドメインの設定

### ドメインを購入（お名前.com の場合）

1. https://onamae.com にアクセス
2. 希望のドメイン名を検索（例: `mebae-california.com`）
3. `.com` は年間約1,500円程度
4. 購入手続きを完了

### ドメインを Netlify に設定

#### 方法A: Netlify DNS を使う（おすすめ）

1. Netlify ダッシュボード →「Domain management」→「Add custom domain」
2. 購入したドメイン名を入力（例: `mebae-california.com`）
3. 「Set up Netlify DNS」を選択
4. 表示された **ネームサーバー** をメモ：
   ```
   dns1.p03.nsone.net
   dns2.p03.nsone.net
   dns3.p03.nsone.net
   dns4.p03.nsone.net
   ```
5. お名前.com の管理画面でネームサーバーを上記に変更
6. 数時間〜24時間後にドメインが反映されます

#### HTTPS（SSL証明書）

- Netlify が **自動で無料の SSL 証明書** を発行します
- 特に設定は不要です！

---

## 記事の更新・公開の流れ

### 🌟 日常の投稿フロー

```
📝 記事を書く → 💾 保存 → 🚀 publish.sh → ✨ 自動で公開！
```

### 具体的な手順

#### 1. 記事を書く

以下のどれかで記事を作成：
- **管理画面**: http://localhost:1313/admin.html
- **スクリプト**: `./new-post.sh`
- **VS Code**: `content/posts/` に `.md` ファイルを作成

#### 2. プレビューで確認

```bash
./preview.sh
```

ブラウザで http://localhost:1313 を開いて確認

#### 3. 公開する

```bash
./publish.sh
```

このスクリプトが以下を自動実行します：
1. サイトをビルド（エラーチェック）
2. 変更を Git にコミット
3. GitHub にプッシュ
4. **Netlify が自動でデプロイ**（1〜2分で反映）

#### 4. 公開確認

ブラウザで自分のサイトURL を開いて確認！

---

## 収益化の設定

### Google AdSense（広告収入）

#### 申請手順

1. https://adsense.google.com にアクセス
2. Google アカウントでログイン
3. サイトURL を登録（例: `https://mebae-california.com`）
4. 審査用コードをもらう
5. `hugo.toml` の `googleAdsenseId` を更新：

```toml
googleAdsenseId = "ca-pub-ここに実際のIDを入力"
```

6. 審査通過まで数日〜2週間
7. 審査通過後、自動で広告が表示されます

> 💡 **審査のコツ**: 10〜20記事程度、各1,000文字以上の記事があると通りやすい

#### 想定収益

| 月間PV | 月額収益（目安） |
|--------|---------------|
| 1,000 PV | 300〜500円 |
| 5,000 PV | 1,500〜3,000円 |
| 10,000 PV | 3,000〜8,000円 |
| 50,000 PV | 15,000〜40,000円 |

### Amazon アソシエイト（アフィリエイト）

1. https://affiliate-program.amazon.com にアクセス
2. アカウント登録
3. サイト審査（3件以上の商品リンク付き記事が必要）
4. 承認後、`hugo.toml` の `amazonAssociateId` を更新：

```toml
amazonAssociateId = "実際のIDを入力-20"
```

5. 記事内で商品を紹介：

```
{{< amazon title="商品名" asin="商品コード" description="おすすめポイント" >}}
```

### Google Analytics（アクセス解析）

1. https://analytics.google.com にアクセス
2. プロパティを作成
3. 測定ID（`G-XXXXXXXXXX`）を取得
4. `hugo.toml` を更新：

```toml
googleAnalyticsId = "G-実際のID"
```

---

## よくある質問

### Q: 記事を間違えて公開してしまった！

記事ファイルの先頭を `draft: true` に変更して再度 `./publish.sh` を実行すれば非公開になります。

### Q: 古い記事を削除したい

`content/posts/` から該当の `.md` ファイルを削除して `./publish.sh` を実行。

### Q: 写真が表示されない

- 画像ファイルが `static/images/` フォルダに正しく保存されているか確認
- ファイル名のスペルミスがないか確認
- 日本語ファイル名は避けて英数字にする（例: `costco-item1.jpg`）

### Q: スマホから記事を投稿できる？

GitHub のウェブ画面から直接 `.md` ファイルを編集できます。
https://github.com/あなたのユーザー名/mebae-california-blog

### Q: ブログのデザインを変えたい

`static/css/style.css` を編集して `./publish.sh` で公開。

### Q: 費用はいくらかかる？

| 項目 | 費用 |
|------|------|
| ブログホスティング（Netlify） | **無料** |
| 独自ドメイン | 年間 約1,500円 |
| SSL証明書（HTTPS） | **無料**（Netlify自動） |
| 画像ホスティング（Cloudinary） | **無料**（25GB/月） |
| **合計** | **年間 約1,500円（ドメイン代のみ）** |

---

## 📞 困ったときは

- **Netlify公式ドキュメント**: https://docs.netlify.com
- **Hugo公式ドキュメント**: https://gohugo.io/documentation/
- **このブログのソースコード**: `~/blog` フォルダ内
