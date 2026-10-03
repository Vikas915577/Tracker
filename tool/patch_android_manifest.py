from pathlib import Path

manifest = Path('android/app/src/main/AndroidManifest.xml')
if not manifest.exists():
    raise SystemExit(f'Missing {manifest}; run flutter create first.')

text = manifest.read_text()

# INTERNET permission for Supabase/API access.
perm = '<uses-permission android:name="android.permission.INTERNET" />'
if perm not in text:
    i = text.find('>')
    if i < 0:
        raise SystemExit('Could not find manifest opening tag')
    text = text[:i + 1] + f'\n    {perm}' + text[i + 1:]

# The native shell serves the bundled web core from http://localhost:8080/.
# Android 9+ blocks cleartext HTTP by default, so allow cleartext ONLY for localhost.
xml_dir = Path('android/app/src/main/res/xml')
xml_dir.mkdir(parents=True, exist_ok=True)
security_config = xml_dir / 'network_security_config.xml'
security_config.write_text('''<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n    <domain-config cleartextTrafficPermitted="true">\n        <domain includeSubdomains="false">localhost</domain>\n    </domain-config>\n</network-security-config>\n''')

app_start = text.find('<application ')
if app_start < 0:
    raise SystemExit('Could not find <application> tag')
app_end = text.find('>', app_start)
if app_end < 0:
    raise SystemExit('Could not find end of <application> tag')

app_tag = text[app_start:app_end]
attr = 'android:networkSecurityConfig="@xml/network_security_config"'
if 'android:networkSecurityConfig=' not in app_tag:
    text = text[:app_end] + f'\n        {attr}' + text[app_end:]

manifest.write_text(text)
print('Android manifest patched: localhost cleartext traffic is explicitly allowed via Network Security Config.')
