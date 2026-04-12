#!/bin/bash
# ============================================
# 📝 めばえブログ - 新しい記事を作成するスクリプト
# ============================================
# 使い方: ./new-post.sh
# ============================================

BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BLOG_DIR"

echo ""
echo "🌸 めばえのカリフォルニアブログ - 新しい記事を作成します"
echo "=================================================="
echo ""

# --- タイトル入力 ---
read -p "📝 記事のタイトルを入力してください: " TITLE
if [ -z "$TITLE" ]; then
  echo "❌ タイトルが入力されていません。"
  exit 1
fi

# --- カテゴリー選択 ---
echo ""
echo "📂 カテゴリーを選んでください（番号を入力）:"
echo "  1) 料理"
echo "  2) Costco"
echo "  3) Trader Joe's"
echo "  4) 日系スーパー"
echo "  5) アジア系スーパー"
echo "  6) アメリカ生活"
echo "  7) 旅行"
echo "  8) その他（手動入力）"
echo ""
read -p "番号: " CAT_NUM

case $CAT_NUM in
  1) CATEGORY="料理" ;;
  2) CATEGORY="Costco" ;;
  3) CATEGORY="Trader Joe's" ;;
  4) CATEGORY="日系スーパー" ;;
  5) CATEGORY="アジア系スーパー" ;;
  6) CATEGORY="アメリカ生活" ;;
  7) CATEGORY="旅行" ;;
  8) read -p "カテゴリー名を入力: " CATEGORY ;;
  *) CATEGORY="アメリカ生活" ;;
esac

# --- タグ入力 ---
echo ""
read -p "🏷️  タグをカンマ区切りで入力（例: ロサンゼルス,買い物）: " TAGS_INPUT

# タグをYAML配列形式に変換
IFS=',' read -ra TAG_ARRAY <<< "$TAGS_INPUT"
TAGS_YAML="["
for i in "${!TAG_ARRAY[@]}"; do
  TAG=$(echo "${TAG_ARRAY[$i]}" | xargs) # trim whitespace
  if [ $i -gt 0 ]; then
    TAGS_YAML+=", "
  fi
  TAGS_YAML+="\"$TAG\""
done
TAGS_YAML+="]"

# --- 説明文入力 ---
echo ""
read -p "📄 記事の説明文（Google検索に表示されます）: " DESCRIPTION

# --- ファイル名を生成 ---
DATE=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
MONTH=$(date +%m)

# タイトルからファイル名を生成（英数字とハイフンのみ）
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
if [ -z "$SLUG" ]; then
  # 日本語タイトルの場合、日付ベースのファイル名
  SLUG="post-$(date +%Y%m%d-%H%M%S)"
fi

FILENAME="content/posts/${SLUG}.md"

# --- 記事ファイルを作成 ---
cat > "$FILENAME" << EOF
---
title: "${TITLE}"
date: ${DATE}
draft: false
categories: ["${CATEGORY}"]
tags: ${TAGS_YAML}
description: "${DESCRIPTION}"
image: ""
---

ここに記事を書いてください ✍️

<!-- 📸 写真を挿入したい場合はこのコメントを消して使ってください: -->
<!-- {{</* img src="/images/${SLUG}/photo.jpg" alt="写真の説明" caption="キャプション" */>}} -->

<!-- 🖼️ 複数写真のギャラリー: -->
<!-- {{</* gallery */>}} -->
<!-- {{</* img src="/images/${SLUG}/photo1.jpg" alt="写真1" */>}} -->
<!-- {{</* img src="/images/${SLUG}/photo2.jpg" alt="写真2" */>}} -->
<!-- {{</* /gallery */>}} -->

<!-- 🎥 YouTube動画: -->
<!-- {{</* youtube id="動画ID" title="動画タイトル" */>}} -->

<!-- 🛒 Amazon商品リンク: -->
<!-- {{</* amazon title="商品名" asin="商品コード" description="説明" */>}} -->
EOF

# 画像用フォルダを作成
mkdir -p "static/images/${SLUG}"

echo ""
echo "✅ 記事を作成しました！"
echo "   📄 ファイル: ${FILENAME}"
echo "   🖼️  画像フォルダ: static/images/${SLUG}/"
echo ""
echo "📌 次のステップ:"
echo "   1. ${FILENAME} をエディタで開いて記事を書く"
echo "   2. 写真は static/images/${SLUG}/ に保存"
echo "   3. 完了したら ./publish.sh でデプロイ"
echo ""

# --- エディタで開くか確認 ---
read -p "VS Codeで記事を開きますか？ (y/n): " OPEN_EDITOR
if [ "$OPEN_EDITOR" = "y" ] || [ "$OPEN_EDITOR" = "Y" ]; then
  code "$FILENAME"
fi
