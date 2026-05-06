import sys
try:
    with open('index.html', 'r', encoding='utf-8') as f:
        text = f.read()

    original_bytes = text.encode('cp1252', errors='replace')
    fixed_text = original_bytes.decode('utf-8', errors='replace')
    
    with open('index_fixed.html', 'w', encoding='utf-8') as f:
        f.write(fixed_text)
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
