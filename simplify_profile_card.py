import re

# Lire le fichier
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer le contenu de la carte de profil
# Chercher et remplacer tout le Card.Body
old_pattern = r'(<Card className="shadow-sm border-0 mb-3">\s*<Card\.Body className="text-center py-4">)(.*?)(</Card\.Body>\s*</Card>)'

new_content = r'''\1
                            <div className="mb-3">
                                <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#ff6000' }}></i>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <i className="bi bi-person-fill me-2" style={{ color: '#ff6000' }}></i>
                                <h6 className="mb-0 fw-bold">{user.name}</h6>
                            </div>
                            <div className="d-flex align-items-center justify-content-center">
                                <i className="bi bi-fingerprint me-2" style={{ color: '#ff6000' }}></i>
                                <small className="mb-0" style={{ fontFamily: 'monospace', color: '#6c757d' }}>
                                    {user.id || 'N/A'}
                                </small>
                            </div>
                        \3'''

content = re.sub(old_pattern, new_content, content, flags=re.DOTALL, count=1)

# Écrire le fichier modifié
with open(r"c:\Users\USER\OneDrive\Bureau\TRY MY DAY\src\pages\Profile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Profile card simplified with icons!")
