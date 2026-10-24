"""Verify that the APK contains the exact offline game source and vendor license."""
from pathlib import Path
import sys
import zipfile

root = Path(__file__).resolve().parents[1] / 'www'
apk = Path(sys.argv[1])
with zipfile.ZipFile(apk) as archive:
    files = [p for p in root.rglob('*') if p.is_file()]
    for file in files:
        name = 'assets/' + file.relative_to(root).as_posix()
        assert archive.read(name) == file.read_bytes(), f'Missing or stale asset: {name}'
    assert 'classes.dex' in archive.namelist()
    assert 'AndroidManifest.xml' in archive.namelist()
print(f'PASS: {len(files)} offline assets match source bytes; native DEX and manifest present')
