import re

# Lire le fichier ProfileLayout.jsx
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\components\ProfileLayout.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Ajouter l'import useState si nécessaire
if 'useState' not in content:
    content = content.replace(
        "import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';",
        "import { useState } from 'react';\nimport { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';"
    )

# Ajouter le state showBalance après la déclaration du composant
pattern = r"(const ProfileLayout = \(\{ children \}\) => \{\s*const \{ user, logout \} = useAuth\(\);)"
replacement = r"\1\n    const [showBalance, setShowBalance] = useState(false);"
content = re.sub(pattern, replacement, content)

# Remplacer l'ancienne carte de profil par la nouvelle avec layout horizontal
old_card = r'<Card className="shadow-sm border-0 mb-3">.*?<Card\.Body className="text-center py-4">.*?</Card\.Body>\s*</Card>'

new_card = '''<Card className="shadow-sm border-0 mb-3">
                        <Card.Body className="py-3 px-3">
                            <div className="d-flex align-items-start">
                                <div className="me-3" style={{ fontSize: '3rem' }}>👤</div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-person-fill me-2" style={{ color: '#ff6000', fontSize: '1rem' }}></i>
                                        <h6 className="mb-0 fw-bold">{user?.name}</h6>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2" style={{ fontSize: '1.1rem', filter: 'sepia(1) saturate(5) hue-rotate(0deg) brightness(1.2)' }}>🆔</span>
                                        <small className="mb-0" style={{ fontFamily: 'monospace', color: '#6c757d' }}>
                                            {user?.id || 'N/A'}
                                        </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-wallet2 me-2" style={{ color: '#ff6000', fontSize: '1rem' }}></i>
                                        <small className="mb-0 me-2" style={{ fontFamily: 'monospace', color: '#6c757d', minWidth: '60px' }}>
                                            {showBalance ? `${user?.balance || 0} €` : '-----'}
                                        </small>
                                        <i
                                            className={`bi bi-eye${showBalance ? '-slash' : ''} ms-1`}
                                            style={{ cursor: 'pointer', color: '#6c757d', fontSize: '0.85rem' }}
                                            onClick={() => setShowBalance(!showBalance)}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>'''

content = re.sub(old_card, new_card, content, flags=re.DOTALL)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\components\ProfileLayout.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ProfileLayout.jsx updated with new profile card!")
