import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer la carte de profil avec un layout horizontal
old_card_body = r'<Card\.Body className="text-center py-4">.*?</Card\.Body>'

new_card_body = '''<Card.Body className="py-3 px-3">
                            <div className="d-flex align-items-start">
                                <div className="me-3" style={{ fontSize: '3rem' }}>👤</div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-person-fill me-2" style={{ color: '#ff6000', fontSize: '1rem' }}></i>
                                        <h6 className="mb-0 fw-bold">{user.name}</h6>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="bi bi-fingerprint me-2" style={{ color: '#ff6000', fontSize: '1rem' }}></i>
                                        <small className="mb-0" style={{ fontFamily: 'monospace', color: '#6c757d' }}>
                                            {user.id || 'N/A'}
                                        </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-wallet2 me-2" style={{ color: '#ff6000', fontSize: '1rem' }}></i>
                                        <small className="mb-0 me-2" style={{ fontFamily: 'monospace', color: '#6c757d', minWidth: '60px' }}>
                                            {showBalance ? `${user.balance || 0} €` : '-----'}
                                        </small>
                                        <i
                                            className={`bi bi-eye${showBalance ? '-slash' : ''} ms-1`}
                                            style={{ cursor: 'pointer', color: '#6c757d', fontSize: '0.85rem' }}
                                            onClick={() => setShowBalance(!showBalance)}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>'''

content = re.sub(old_card_body, new_card_body, content, flags=re.DOTALL)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Profile card layout changed to horizontal!")
