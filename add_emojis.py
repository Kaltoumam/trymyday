import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer les icônes par des emojis dans la carte de profil
# Remplacer l'icône avatar par un emoji
content = re.sub(
    r'<i className="bi bi-person-circle" style={{ fontSize: \'4rem\', color: \'#ff6000\' }}></i>',
    '<div style={{ fontSize: \'4rem\' }}>👤</div>',
    content
)

# Remplacer l'icône personne par un emoji
content = re.sub(
    r'<i className="bi bi-person-fill me-2" style={{ color: \'#ff6000\' }}></i>',
    '<span className="me-2" style={{ fontSize: \'1.2rem\' }}>👤</span>',
    content
)

# Remplacer l'icône empreinte digitale par un emoji
content = re.sub(
    r'<i className="bi bi-fingerprint me-2" style={{ color: \'#ff6000\' }}></i>',
    '<span className="me-2" style={{ fontSize: \'1.2rem\' }}>🆔</span>',
    content
)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Icons replaced with emojis!")
