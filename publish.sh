#!/bin/bash
# ============================================
# 🚀 めばえブログ - 記事を公開（デプロイ）するスクリプト
# ============================================
# 使い方: ./publish.sh
# ============================================

BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BLOG_DIR"

echo ""
echo "🌸 めばえのカリフォルニアブログ - 記事を公開します"
echo "=================================================="
echo ""

# --- ビルドテスト ---
echo "🔨 サイトをビルド中..."
hugo --minify
if [ $? -ne 0 ]; then
  echo "❌ ビルドに失敗しました。記事に問題がないか確認してください。"
  exit 1
fi
echo "✅ ビルド成功！"
echo ""

# --- Git でコミット & プッシュ ---
echo "📤 変更をアップロード中..."
git add -A
echo ""
read -p "💬 変更内容を一言で（例: 新しい記事を追加）: " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="記事を更新 $(date +%Y-%m-%d)"
fi

git commit -m "$COMMIT_MSG"
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 公開完了！ 数分後にサイトに反映されます。"
  echo "   🌐 https://mebae-california.com"
  echo ""
else
  echo ""
  echo "❌ アップロードに失敗しました。インターネット接続を確認してください。"
  echo ""
fi
