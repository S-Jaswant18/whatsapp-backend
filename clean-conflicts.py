
import re

def clean_conflicts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to keep only the HEAD part of conflicts
    # <<<<<<< HEAD
    # (keep this)
    # =======
    # (discard this)
    # >>>>>>> ...
    
    cleaned = re.sub(r'<<<<<<< HEAD\n(.*?)\n?=======\np?.*?\n?>>>>>>> [a-z0-9]+\n', r'\1\n', content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)

clean_conflicts('package.json')
clean_conflicts('package-lock.json')
