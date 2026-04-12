#!/bin/bash
# ============================================
# 🌸 めばえブログ - ブログを起動するスクリプト
# ============================================
# 使い方: このファイルをダブルクリックするだけ！
# または: ./start-blog.sh
# ============================================

BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BLOG_DIR"

echo ""
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo "🌸                                    🌸"
echo "🌸  めばえのカリフォルニアブログ       🌸"
echo "🌸  管理画面を起動しています...        🌸"
echo "🌸                                    🌸"
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo ""

# --- 既存のプロセスを停止 ---
pkill -f "hugo server" 2>/dev/null
pkill -f "admin-server.js" 2>/dev/null
sleep 1

# --- APIサーバーを起動（バックグラウンド） ---
echo "📡 管理サーバーを起動中..."
node "$BLOG_DIR/admin-server.js" &
API_PID=$!
sleep 1

# --- Hugoサーバーを起動（バックグラウンド） ---
echo "🔨 プレビューサーバーを起動中..."
hugo server -D --port 1313 &
HUGO_PID=$!
sleep 2

echo ""
echo "✅ 起動完了！"
echo ""
echo "🌸 管理画面: http://localhost:1313/admin.html"
echo "👀 プレビュー: http://localhost:1313/"
echo "🌐 公開サイト: https://mebae-california.com"
echo ""
echo "⏹️  終了するには Ctrl+C を押してください"
echo ""

# --- ブラウザで管理画面を開く ---
open "http://localhost:1313/admin.html"

# --- 終了時にプロセスを停止 ---
cleanup() {
  echo ""
  echo "🌸 ブログを停止しています..."
  kill $API_PID 2>/dev/null
  kill $HUGO_PID 2>/dev/null
  echo "👋 おつかれさまでした！"
  exit 0
}

trap cleanup SIGINT SIGTERM

# --- プロセスの終了を待つ ---
wait
