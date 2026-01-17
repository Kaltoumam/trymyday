import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer toute la section de la carte de profil avec de meilleures icônes et alignement
old_card_body = r'<Card\.Body className="text-center py-4">.*?</Card\.Body>'

new_card_body = '''<Card.Body className="text-center py-4">
                            <div className="mb-3">
                                <div style={{ fontSize: '4rem' }}>👤</div>
                            </div>
                            <div className="d-flex align-items-center justify-content-start mb-2 px-3">
                                <i className="bi bi-person-fill me-2" style={{ color: '#ff6000', fontSize: '1.1rem' }}></i>
                                <h6 className="mb-0 fw-bold">{user.name}</h6>
                            </div>
                            <div className="d-flex align-items-center justify-content-start mb-2 px-3">
                                <i className="bi bi-fingerprint me-2" style={{ color: '#ff6000', fontSize: '1.1rem' }}></i>
                                <small className="mb-0" style={{ fontFamily: 'monospace', color: '#6c757d' }}>
                                    {user.id || 'N/A'}
                                </small>
                            </div>
                            <div className="d-flex align-items-center justify-content-start px-3">
                                <i className="bi bi-wallet2 me-2" style={{ color: '#ff6000', fontSize: '1.1rem' }}></i>
                                <small className="mb-0 me-2" style={{ fontFamily: 'monospace', color: '#6c757d', minWidth: '60px' }}>
                                    {showBalance ? `${user.balance || 0} €` : '-----'}
                                </small>
                                <i
                                    className={`bi bi-eye${showBalance ? '-slash' : ''} ms-1`}
                                    style={{ cursor: 'pointer', color: '#6c757d', fontSize: '0.9rem' }}
                                    onClick={() => setShowBalance(!showBalance)}
                                ></i>
                            </div>
                        </Card.Body>'''

content = re.sub(old_card_body, new_card_body, content, flags=re.DOTALL)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Profile card updated with better icons and alignment!")
