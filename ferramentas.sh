#!/usr/bin/env bash
# Baixa as ferramentas para montar os apps Android sem Gradle e sem Android Studio.
# Uso: bash ferramentas.sh            (monta em /home/claude/work/apps/tools, onde os build.sh procuram)
# Precisa de Java 17 ou mais novo, unzip e curl. Tudo vem do GitHub (liberado no ambiente do Claude).
set -euo pipefail
T="${1:-/home/claude/work/apps/tools}"
mkdir -p "$T"; cd "$T"
baixa() { [ -s "$2" ] || curl -fsSL --retry 3 -o "$2" "$1"; }

# android.jar (API 35): compilar e ligar os recursos contra ele
baixa https://raw.githubusercontent.com/Sable/android-platforms/master/android-35/android.jar android-35.jar
# D8 (classe com.android.tools.r8.D8) vem dentro do jadx
baixa https://github.com/skylot/jadx/releases/download/v1.5.1/jadx-1.5.1.zip jadx.zip
[ -s jadx_x/lib/jadx-1.5.1-all.jar ] || { mkdir -p jadx_x; unzip -q -o jadx.zip 'lib/jadx-1.5.1-all.jar' -d jadx_x; }
# aapt2 vem dentro do apktool
baixa https://github.com/iBotPeaches/Apktool/releases/download/v2.12.1/apktool_2.12.1.jar apktool.jar
[ -x apk_x/prebuilt/linux/aapt2 ] || { mkdir -p apk_x; unzip -q -o apktool.jar 'prebuilt/linux/*' -d apk_x; chmod +x apk_x/prebuilt/linux/*; }
# assinador: alinha e assina com a chave de depuração embutida (a MESMA de todos os apps dele; não troque)
baixa https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar signer.jar

python3 -c "import cryptography" 2>/dev/null || pip install --break-system-packages cryptography >/dev/null
ls -l android-35.jar jadx_x/lib/jadx-1.5.1-all.jar apk_x/prebuilt/linux/aapt2 signer.jar
echo "Ferramentas prontas em $T"
echo "Certificado esperado nos APKs (SHA-256): 1e08a903aef9c3a721510b64ec764d01d3d094eb954161b62544ea8f187b5953"
