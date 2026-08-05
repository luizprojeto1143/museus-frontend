import os
import re

def char_to_byte(c):
    try: return ord(c.encode('cp1252'))
    except: return ord(c)

def fix_mojibake(match):
    s = match.group(0)
    b = bytes([char_to_byte(c) for c in s])
    try:
        return b.decode('utf-8')
    except:
        return s

def get_chars(start, end):
    return ''.join(bytes([i]).decode('cp1252') if i not in [129, 141, 143, 144, 157] else chr(i) for i in range(start, end+1))

c_cont = get_chars(0x80, 0xBF)
c_2 = get_chars(0xC2, 0xDF)
c_3 = get_chars(0xE0, 0xEF)
c_4 = get_chars(0xF0, 0xF4)

pattern = f'([{c_4}][{c_cont}]{{3}}|[{c_3}][{c_cont}]{{2}}|[{c_2}][{c_cont}])'

def process_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        has_bom = raw.startswith(b'\xef\xbb\xbf')
        if has_bom: raw = raw[3:]
        
        text = raw.decode('utf-8')
        
        matches = re.findall(pattern, text)
        if not matches:
            return False
            
        fixed = re.sub(pattern, fix_mojibake, text)
        
        if fixed != text:
            # Re-encode and save
            out = fixed.encode('utf-8')
            if has_bom: out = b'\xef\xbb\xbf' + out
            with open(filepath, 'wb') as f:
                f.write(out)
            return True
    except Exception as e:
        pass
    return False

# Test on one file first
file = 'src/modules/backoffice/equipment/pages/SecretaryDashboard.tsx'
print('Fixed SecretaryDashboard?', process_file(file))

# Then process the whole src directory
count = 0
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.js') or f.endswith('.jsx'):
            if process_file(os.path.join(root, f)):
                count += 1
print(f'Fixed {count} files in total!')
