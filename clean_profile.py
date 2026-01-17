import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Supprimer tous les caractères littéraux `r`n
content = content.replace("`r`n", "")

# Pattern pour trouver la section Card.Body et nettoyer les duplications
pattern = r'(<Card\.Body className="p-3">)(.*?)(<div className="mb-2">.*?<small className="text-muted d-block">Email</small>)'
replacement = r'\1\n                                    <div className="mb-2">\n                                        <small className="text-muted d-block">ID Compte</small>\n                                        <strong className="small" style={{ fontFamily: \'monospace\', color: \'#ff6000\' }}>\n                                            {user.id || \'N/A\'}\n                                        </strong>\n                                    </div>\n                                    \3'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Écrire le fichier nettoyé
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("File cleaned successfully!")
