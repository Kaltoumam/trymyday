import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer l'affichage de l'ID complet par les 8 derniers caractères
old_pattern = r'{user\.id \|\| \'N/A\'}'
new_pattern = r'{user.id ? user.id.slice(-8) : \'N/A\'}'

content = content.replace(old_pattern, new_pattern)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ID shortened to last 8 characters!")
