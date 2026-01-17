import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Corriger les guillemets échappés incorrectement
content = content.replace("\\'monospace\\'", "'monospace'")
content = content.replace("\\'#ff6000\\'", "'#ff6000'")
content = content.replace("\\' N/A\\'", "'N/A'")

# Écrire le fichier corrigé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Quotes fixed successfully!")
