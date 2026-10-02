from pathlib import Path

p = Path('android/app/src/main/AndroidManifest.xml')
if not p.exists():
    raise SystemExit(f'Missing {p}; run flutter create first.')
s = p.read_text()
perm = '<uses-permission android:name="android.permission.INTERNET" />'
if perm not in s:
    i = s.find('>')
    if i < 0:
        raise SystemExit('Could not find manifest opening tag')
    s = s[:i+1] + '\n    ' + perm + s[i+1:]
p.write_text(s)
