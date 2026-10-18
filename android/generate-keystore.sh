#!/bin/sh
# Generate Android Production Release Keystore for Google Play Store upload
echo "Generating KaiPay Production Release Keystore..."

keytool -genkeypair -v \
  -keystore android/app/release.keystore \
  -alias kaipay_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass kaipay_release_2026 \
  -keypass kaipay_release_2026 \
  -dname "CN=KaiPay Digital Banking, OU=Mobile Engineering, O=KaiPay Inc., L=Jakarta, ST=DKI Jakarta, C=ID"

echo "Release keystore generated successfully at android/app/release.keystore"
