cd backend
import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Corriger l'accolade supplémentaire
content = content.replace("{user.id ? user.id.slice(-8) : 'N/A'}}", "{user.id ? user.id.slice(-8) : 'N/A'}")

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Extra brace removed!")
