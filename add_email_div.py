import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Trouver et corriger la ligne 318 (index 317)
for i in range(len(lines)):
    if i == 317:  # Ligne 318
        # Ajouter le div d'ouverture manquant
        lines[i] = '                                    <div className="mb-2">\r\n' + lines[i]

# Écrire le fichier corrigé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Missing div tag added for Email field!")
