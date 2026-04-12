# めばえのカリフォルニアブログ

Hugo で構築した独自ブログです。

## Hugo のインストール

```bash
brew install hugo
```

## ローカルで確認

```bash
hugo server -D
```

ブラウザで http://localhost:1313 を開いて確認できます。

## 新しい記事の作成

```bash
hugo new posts/記事名.md
```

## ビルド（本番用）

```bash
hugo --minify
```

`public/` フォルダに本番用ファイルが生成されます。
