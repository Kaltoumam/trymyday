import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Trouver et modifier la carte de profil supérieure
# Chercher la section avec user.name et user.email
pattern = r'(<h5 className="fw-bold mb-1">{user\.name}</h5>\s*<p className="text-muted small mb-0">{user\.email}</p>)'
replacement = r'\1\n                            <p className="small mb-0" style={{ fontFamily: \'monospace\', color: \'#ff6000\', marginTop: \'4px\' }}>\n                                ID: {user.id || \'N/A\'}\n                            </p>'

content = re.sub(pattern, replacement, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ID added to profile header card!")
