import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Trouver et modifier la carte de profil pour ajouter le badge
# Chercher la section après l'ID
pattern = r'(<p className="small mb-0" style={{ fontFamily: \'monospace\', color: \'#ff6000\', marginTop: \'4px\' }}>\s*ID: {user\.id \|\| \'N/A\'}\s*</p>)'
replacement = r'''\1
                            <div className="mt-2">
                                <span className="badge bg-secondary">Standard</span>
                            </div>'''

content = re.sub(pattern, replacement, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Standard badge added to profile card!")
