"""Patches the prebuilt android/app/build.gradle so the release build is signed with our own keystore.
Reads ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD at build time."""
import re, sys

path = 'android/app/build.gradle'
s = open(path).read()

release_cfg = """
        release {
            storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }"""

if 'ANDROID_KEYSTORE_PATH' in s:
    sys.exit(0)

m = re.search(r'signingConfigs\s*\{', s)
if not m:
    sys.exit('signingConfigs block not found in build.gradle')
s = s[:m.end()] + release_cfg + s[m.end():]

# point the release build type at the new config
bt = re.search(r'buildTypes\s*\{', s)
rel = re.search(r'release\s*\{', s[bt.end():])
start = bt.end() + rel.start()
end = s.index('}', start)
block = s[start:end]
if 'signingConfig signingConfigs.debug' in block:
    block = block.replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release')
else:
    block = block.replace('release {', 'release {\n            signingConfig signingConfigs.release', 1)
s = s[:start] + block + s[end:]
open(path, 'w').write(s)
print('release signing configured')
