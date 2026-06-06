import re

with open("c:/Users/LENOVO/Downloads/skripsi-tes - Copy (2)/js/locales.js", "r", encoding="utf-8") as f:
    content = f.read()

en_block = re.search(r'en:\s*{([\s\S]+?)},\s*id:', content).group(1)
id_block = re.search(r'id:\s*{([\s\S]+?)}\s*};', content).group(1)

def extract_keys(text):
    # Match any alphanumeric/underscore word followed by a colon and quote
    matches = re.findall(r'([a-zA-Z0-9_]+)\s*:\s*["\']', text)
    return set(matches)

en_keys = extract_keys(en_block)
id_keys = extract_keys(id_block)

print(f"EN Keys: {len(en_keys)}")
print(f"ID Keys: {len(id_keys)}")

missing_in_id = en_keys - id_keys
missing_in_en = id_keys - en_keys

if missing_in_id:
    print("Missing in ID:", sorted(list(missing_in_id)))
if missing_in_en:
    print("Missing in EN:", sorted(list(missing_in_en)))

if not missing_in_id and not missing_in_en:
    print("Translations are fully synced!")
