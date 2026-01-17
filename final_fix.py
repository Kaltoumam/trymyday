import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Corriger TOUS les guillemets échappés incorrectement
content = re.sub(r"\\'([^']*)\\'", r"'\1'", content)

# Nettoyer les divs vides dupliquées
content = re.sub(r'(\s+<div className="mb-2">\s+){2,}', r'\1', content)

# Écrire le fichier corrigé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("All escaped quotes fixed and empty divs cleaned!")
