import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Utiliser regex pour trouver et remplacer le pattern de l'ID
# Chercher spécifiquement dans la section avec l'emoji ID
pattern = r'({user\.id \|\| [\'"]N/A[\'"])'
replacement = r'{user.id ? user.id.slice(-8) : \'N/A\'}'

content = re.sub(pattern, replacement, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ID display shortened successfully!")
