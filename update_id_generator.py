import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\context\AuthContext.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer la fonction generateUserId pour créer un ID avec mélange de chiffres et lettres
old_function = r"const generateUserId = \(\) => \{[^}]+\};"
new_function = """const generateUserId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };"""

content = re.sub(old_function, new_function, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\context\AuthContext.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ID generator updated to create mixed alphanumeric IDs!")
