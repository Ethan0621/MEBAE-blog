#!/bin/bash
# ============================================
# 🌸 めばえブログ - 初回セットアップスクリプト
# ============================================
# 奥様のPCで1回だけ実行してください
# ============================================

echo ""
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo "🌸                                          🌸"
echo "🌸  めばえブログ 初回セットアップ            🌸"
echo "🌸                                          🌸"
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo ""

# --- ① Homebrew の確認 ---
echo "📦 ① Homebrew を確認中..."
if ! command -v brew &>/dev/null; then
  echo "   Homebrew が見つかりません。インストールします..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Apple Silicon Mac の場合、PATHを通す
  if [ -f /opt/homebrew/bin/brew ]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  echo "   ✅ Homebrew インストール完了"
else
  echo "   ✅ Homebrew は既にインストールされています"
fi
echo ""

# --- ② Hugo, Node.js, Git のインストール ---
echo "📦 ② Hugo, Node.js, Git を確認中..."

if ! command -v hugo &>/dev/null; then
  echo "   Hugo をインストール中..."
  brew install hugo
  echo "   ✅ Hugo インストール完了"
else
  echo "   ✅ Hugo は既にインストールされています ($(hugo version | head -c 30))"
fi

if ! command -v node &>/dev/null; then
  echo "   Node.js をインストール中..."
  brew install node
  echo "   ✅ Node.js インストール完了"
else
  echo "   ✅ Node.js は既にインストールされています ($(node --version))"
fi

if ! command -v git &>/dev/null; then
  echo "   Git をインストール中..."
  brew install git
  echo "   ✅ Git インストール完了"
else
  echo "   ✅ Git は既にインストールされています ($(git --version))"
fi
echo ""

# --- ③ ブログをクローン ---
echo "📥 ③ ブログをダウンロード中..."
if [ -d ~/MEBAE-blog ]; then
  echo "   ブログフォルダが既に存在します。最新版に更新します..."
  cd ~/MEBAE-blog
  git pull origin main
  echo "   ✅ 最新版に更新しました"
else
  cd ~
  git clone https://github.com/Ethan0621/MEBAE-blog.git
  echo "   ✅ ブログをダウンロードしました"
fi
echo ""

# --- ④ 実行権限を付与 ---
echo "🔧 ④ スクリプトの設定中..."
chmod +x ~/MEBAE-blog/start-blog.sh
chmod +x ~/MEBAE-blog/publish.sh
chmod +x ~/MEBAE-blog/preview.sh
chmod +x ~/MEBAE-blog/new-post.sh
chmod +x ~/MEBAE-blog/めばえブログ起動.command
echo "   ✅ 完了"
echo ""

# --- ⑤ 設定ファイルの確認 ---
echo "🔑 ⑤ 設定ファイルを確認中..."
if [ ! -f ~/MEBAE-blog/.blog-config.json ]; then
  echo ""
  echo "   ⚠️  GitHubトークンの設定が必要です。"
  echo "   Ethanさんが設定してください。"
  echo ""
  echo "   以下のコマンドで設定ファイルを作成："
  echo '   cat > ~/MEBAE-blog/.blog-config.json << EOF'
  echo '   {'
  echo '     "githubUser": "Ethan0621",'
  echo '     "githubToken": "ここにPATを入れる",'
  echo '     "githubRepo": "Ethan0621/MEBAE-blog"'
  echo '   }'
  echo '   EOF'
  echo ""
else
  echo "   ✅ 設定ファイルは既に存在します"
fi
echo ""

# --- ⑥ デスクトップにショートカットを作成 ---
echo "🖥️  ⑥ デスクトップにショートカットを作成中..."
cp ~/MEBAE-blog/めばえブログ起動.command ~/Desktop/ 2>/dev/null
if [ $? -eq 0 ]; then
  chmod +x ~/Desktop/めばえブログ起動.command
  echo "   ✅ デスクトップに「めばえブログ起動」を作成しました"
else
  echo "   ⚠️  デスクトップへのコピーに失敗しました。手動でコピーしてください。"
fi
echo ""

# --- 完了 ---
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo "🌸                                          🌸"
echo "🌸  ✅ セットアップ完了！                    🌸"
echo "🌸                                          🌸"
echo "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸"
echo ""
echo "🌸 使い方："
echo "   デスクトップの「めばえブログ起動」をダブルクリック！"
echo ""
echo "   または、ターミナルで："
echo "   cd ~/MEBAE-blog && ./start-blog.sh"
echo ""
echo "📖 詳しい使い方は MANUAL.md を見てください"
echo ""
