import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\context\AuthContext.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Ajouter balance à la fonction register
pattern = r"(const newUser = \{[^}]*id: generateUserId\(\),[^}]*name,[^}]*email,[^}]*role: 'client')\s*\};"
replacement = r"\1,\n            balance: 0\n        };"

content = re.sub(pattern, replacement, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\context\AuthContext.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Balance added to register function!")
