#!/bin/sh
# 建可复用的字体子集环境：npm ci 之后跑一次，pack_fonts.cjs 会自动使用它。
# 成稿及其交付不依赖本步骤；只有构建（字体子集嵌入）需要。
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
venv="$root/.font-venv"

if [ ! -x "$venv/bin/python" ]; then
  echo "[setup-fonts] 创建 $venv"
  python3 -m venv "$venv"
fi

# 装进 venv 只影响本技能，不需要 --break-system-packages，也不动系统 Python（PEP 668）。
"$venv/bin/pip" install --quiet --upgrade pip
"$venv/bin/pip" install --quiet -r "$root/scripts/requirements-fonts.txt"

echo "[setup-fonts] 完成：$venv/bin/python"
echo "[setup-fonts] 验证：node scripts/probe_capabilities.cjs /tmp/deck-probe"
