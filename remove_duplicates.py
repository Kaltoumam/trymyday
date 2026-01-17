import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Trouver et supprimer les lignes dupliquées ID Compte
output_lines = []
id_compte_count = 0
skip_until_next_div = False
i = 0

while i < len(lines):
    line = lines[i]
    
    # Détecter les blocs ID Compte
    if 'ID Compte' in line and '<small' in line:
        id_compte_count += 1
        if id_compte_count == 1:
            # Garder le premier bloc
            output_lines.append(line)
            i += 1
        else:
            # Sauter les blocs suivants
            # Sauter jusqu'à la fin du div
            while i < len(lines) and '</div>' not in lines[i]:
                i += 1
            if i < len(lines):
                i += 1  # Sauter aussi le </div>
            continue
    else:
        output_lines.append(line)
        i += 1

# Écrire le fichier nettoyé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.writelines(output_lines)

print(f"Removed {id_compte_count - 1} duplicate ID Compte fields!")
