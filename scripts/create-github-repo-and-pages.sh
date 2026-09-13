#!/usr/bin/env bash
set -euo pipefail
# GitHub repository slugs are safest with ASCII. The site/README title remains “对外共享文件库”.
REPO_NAME="${1:-duiwai-gongxiang-wenjian-ku}"
DESC="对外共享文件库：3016旅游工作台等生成的公开 HTML 文件，供 QQ/手机/浏览器直接访问。"

if ! gh auth status >/dev/null 2>&1; then
  echo "未登录 GitHub。请先运行：gh auth login"
  exit 2
fi
OWNER="$(gh api user --jq .login)"

git branch -M main
if ! gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  gh repo create "$OWNER/$REPO_NAME" --public --description "$DESC"
fi

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"

git push -u origin main --force

# Enable GitHub Pages from main branch root, no Actions workflow required.
if ! gh api "/repos/$OWNER/$REPO_NAME/pages" >/dev/null 2>&1; then
  gh api --method POST "/repos/$OWNER/$REPO_NAME/pages" \
    -F source[branch]=main \
    -F source[path]=/ >/dev/null
else
  gh api --method PUT "/repos/$OWNER/$REPO_NAME/pages" \
    -F source[branch]=main \
    -F source[path]=/ >/dev/null || true
fi

echo "仓库：https://github.com/$OWNER/$REPO_NAME"
echo "Pages：https://$OWNER.github.io/$REPO_NAME/"
