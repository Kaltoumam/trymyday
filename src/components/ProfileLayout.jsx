import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Modal, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileLayout = ({ children }) => {
    const { user, logout, updateUser } = useAuth();
    const [showBalance, setShowBalance] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const location = useLocation();

    // Liste d'avatars disponibles
    const availableAvatars = [
        // Classiques
        '👤', '👨', '👩', '🧑', '👦', '👧',
        // Professions
        '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🔧', '👩‍🔧',
        '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨',
        // Super-héros & Fantasy
        '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧛‍♂️', '🧛‍♀️',
        // Street Mood / Urbain 🔥
        '😎', '🤙', '✌️', '🤘', '�', '🤝',
        '💪', '🦾', '🧠', '❤️‍🔥', '💯', '🔥',
        '⚡', '💎', '👑', '🎯', '🏆', '⭐',
        '🎸', '🎧', '🎤', '🎮', '🏀', '⚽',
        '🛹', '🏍️', '🚀', '💰', '💵', '🎰',
        // Emojis Cool
        '😏', '😈', '🤩', '🥶', '🤑', '🥳',
        '🤠', '🤓', '🧐', '😇', '🤯', '😤',
        // Animaux
        '�🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
        '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
        '🦅', '🦉', '�', '🐺', '🦈', '�',
        // Autres
        '🎃', '🤖', '👽', '👾', '🎭', '🎨',
        '☠️', '👻', '💀', '🎲', '🃏', '🌟'
    ];

    const handleAvatarSelect = (avatar) => {
        // Mettre à jour l'avatar de l'utilisateur
        const updatedUser = { ...user, avatar };
        updateUser(updatedUser);

        // Mettre à jour dans la liste des utilisateurs
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u =>
            u.email === user.email ? updatedUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        setShowAvatarModal(false);
    };

    const menuSections = [
        {
            title: 'Mes Commandes',
            items: [
                { icon: 'bi-box-seam', label: 'Toutes mes commandes', link: '/profile/orders', badge: null },
                { icon: 'bi-arrow-repeat', label: 'Commander encore', link: '/profile/reorder', badge: null },
            ]
        },
        {
            title: 'Portefeuille & Coupons',
            items: [
                { icon: 'bi-wallet2', label: 'Mon portefeuille', link: '/profile/wallet', badge: null },
                { icon: 'bi-ticket-perforated', label: 'Mes coupons', link: '/profile/coupons', badge: null },
            ]
        },
        {
            title: 'Mon Compte & Aide',
            items: [
                { icon: 'bi-person', label: 'Informations utilisateur', link: '/profile/info', badge: null },
                { icon: 'bi-geo-alt', label: 'Mes adresses', link: '/profile/addresses', badge: null },
                { icon: 'bi-credit-card-2-front', label: 'Cartes enregistrées', link: '/profile/cards', badge: null },
                { icon: 'bi-shield-lock', label: 'Confidentialité', link: '/profile/privacy', badge: null },
                { icon: 'bi-toggles', label: 'Paramètres actifs', link: '/profile/settings', badge: null },
                { icon: 'bi-question-circle', label: 'Aide', link: '/help', badge: null },
            ]
        }
    ];

    return (
        <Container className="py-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Row>
                {/* Sidebar */}
                <Col lg={2} md={3} className="mb-4">
                    <Card className="border-0 mb-3" style={{
                        background: 'linear-gradient(135deg,  #f39d48ff 0%, #f6ce93ff 100%)',
                        boxShadow: '0 4px 15px rgba(236, 144, 87, 0.74)',
                        borderRadius: '12px'
                    }}>
                        <Card.Body className="py-3 px-3">
                            <div className="text-center mb-3">
                                <div
                                    className="mx-auto mb-2"
                                    onClick={() => setShowAvatarModal(true)}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        border: '3px solid rgba(255, 255, 255, 0.3)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                >
                                    {user?.avatar || '👤'}
                                    <i className="bi bi-pencil-fill" style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        fontSize: '0.6rem',
                                        color: 'white',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}></i>
                                </div>
                                <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '1.1rem', color: '#000' }}>
                                    {user?.name}
                                </h6>
                            </div>

                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex align-items-center justify-content-between p-2" style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                                        <span className="fw-bold me-2" style={{ fontSize: '0.9rem', color: '#000' }}>ID:</span>
                                        <small className="text-truncate" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#000', fontWeight: '800' }}>
                                            {user?.id || 'N/A'}
                                        </small>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-2" style={{
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div className="d-flex align-items-center" style={{ minWidth: 0, flex: 1 }}>
                                        <i className="bi bi-wallet2 me-2" style={{ color: '#000', fontSize: '1rem', flexShrink: 0 }}></i>
                                        <small className="text-truncate" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#000', fontWeight: '800' }}>
                                            {showBalance ? `${(user?.balance || 0).toLocaleString()} FCFA` : '---'}
                                        </small>
                                    </div>
                                    <i
                                        className={`bi bi-eye${showBalance ? '-slash' : ''}`}
                                        style={{ cursor: 'pointer', color: '#000', fontSize: '1rem', flexShrink: 0 }}
                                        onClick={() => setShowBalance(!showBalance)}
                                    ></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {menuSections.map((section, idx) => (
                        <Card key={idx} className="shadow-sm border-0 mb-3">
                            <Card.Body className="p-0">
                                <div className="px-3 py-2 border-bottom bg-light">
                                    <h6 className="mb-0 fw-bold text-muted" style={{ fontSize: '0.75rem' }}>
                                        {section.title}
                                    </h6>
                                </div>
                                <ListGroup variant="flush">
                                    {section.items.map((item, itemIdx) => (
                                        <ListGroup.Item
                                            key={itemIdx}
                                            as={Link}
                                            to={item.link}
                                            action
                                            active={location.pathname === item.link}
                                            className="border-0 d-flex align-items-center justify-content-between py-3"
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className={`${item.icon} me-2`} style={{ fontSize: '1rem', color: location.pathname === item.link ? '#fff' : '#ff6000' }}></i>
                                                <span style={{ fontSize: '0.8rem' }}>{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <Badge
                                                    bg={item.badge === 'NOUVEAU' || item.badge === 'PREMIUM' ? 'danger' : 'warning'}
                                                    className="text-white small"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    ))}

                    <Card className="shadow-sm border-0">
                        <ListGroup variant="flush">
                            <ListGroup.Item
                                action
                                className="border-0 text-danger d-flex align-items-center py-3"
                                onClick={logout}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="bi bi-box-arrow-right me-2" style={{ fontSize: '1rem' }}></i>
                                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>Déconnexion</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col lg={10} md={9}>
                    {children}
                </Col>
            </Row>

            {/* Modal de sélection d'avatar */}
            <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
                <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #f39d48ff 0%, #f6ce93ff 100%)', color: 'white', border: 'none' }}>
                    <Modal.Title style={{ fontSize: '1.1rem' }}>
                        <i className="bi bi-emoji-smile me-2"></i>
                        Choisir un avatar
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '10px',
                        padding: '10px'
                    }}>
                        {availableAvatars.map((avatar, index) => (
                            <div
                                key={index}
                                onClick={() => handleAvatarSelect(avatar)}
                                style={{
                                    fontSize: '2rem',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                    border: user?.avatar === avatar ? '3px solid #f39d48ff' : '2px solid #e0e0e0',
                                    background: user?.avatar === avatar ? 'rgba(243, 157, 72, 0.1)' : 'white'
                                }}
                                onMouseEnter={(e) => {
                                    if (user?.avatar !== avatar) {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.background = '#f5f5f5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (user?.avatar !== avatar) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.background = 'white';
                                    }
                                }}
                            >
                                {avatar}
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none' }}>
                    <Button variant="secondary" size="sm" onClick={() => setShowAvatarModal(false)}>
                        Annuler
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ProfileLayout;
