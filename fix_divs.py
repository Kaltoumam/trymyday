import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Trouver et corriger les lignes 317-318
for i in range(len(lines)):
    # Ligne 317: supprimer le div orphelin
    if i == 316:  # Index 316 = ligne 317
        lines[i] = lines[i].replace('</div> <div className="mb-2">', '</div>')
    # Ligne 318: supprimer le div orphelin
    elif i == 317:  # Index 317 = ligne 318
        if '<div className="mb-2">' in lines[i] and '<small' not in lines[i]:
            lines[i] = ''

# Écrire le fichier corrigé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Unclosed div tags fixed!")
