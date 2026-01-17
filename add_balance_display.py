import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Ajouter l'import useState
if 'useState' not in content:
    content = content.replace(
        "import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';",
        "import { useState } from 'react';\nimport { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';"
    )

# Ajouter le state showBalance après la déclaration du composant
pattern = r"(const Profile = \(\) => \{\s*const \{ user, logout \} = useAuth\(\);)"
replacement = r"\1\n    const [showBalance, setShowBalance] = useState(false);"

content = re.sub(pattern, replacement, content)

# Ajouter l'affichage du solde après l'ID dans la carte de profil
# Chercher la section avec l'ID
id_pattern = r'(<div className="d-flex align-items-center justify-content-center">\s*<span className="me-2" style=\{\{ fontSize: \'1\.2rem\' \}\}>🆔</span>\s*<small className="mb-0"[^>]*>\s*\{user\.id \|\| \'N/A\'\}\s*</small>\s*</div>)'

balance_html = r'''\1
                            <div className="d-flex align-items-center justify-content-center mt-2">
                                <span className="me-2" style={{ fontSize: '1.2rem' }}>💰</span>
                                <small className="mb-0" style={{ fontFamily: 'monospace', color: '#6c757d' }}>
                                    {showBalance ? `${user.balance || 0} €` : '••••'}
                                </small>
                                <i 
                                    className={`bi bi-eye${showBalance ? '-slash' : ''}-fill ms-2`}
                                    style={{ cursor: 'pointer', color: '#ff6000', fontSize: '1rem' }}
                                    onClick={() => setShowBalance(!showBalance)}
                                ></i>
                            </div>'''

content = re.sub(id_pattern, balance_html, content)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Balance display with toggle added to Profile.jsx!")
