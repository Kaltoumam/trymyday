import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Corriger TOUS les guillemets échappés incorrectement avec regex plus robuste
content = re.sub(r"\\'", "'", content)

# Écrire le fichier corrigé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("All escaped quotes fixed!")
