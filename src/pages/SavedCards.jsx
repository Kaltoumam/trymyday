import { Card, Button, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';

const SavedCards = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    // Load cards from localStorage
    const [cards, setCards] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`cards_${user.email}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    // Redirect if not logged in
    if (!user) {
        return (
            <ProfileLayout>
                <div className="mb-4">
                    <h3 className="fw-bold">Cartes enregistrées</h3>
                    <p className="text-muted">Gérez vos cartes bancaires</p>
                </div>
                <Alert variant="info">
                    <Alert.Heading>Connexion requise</Alert.Heading>
                    <p>Vous devez être connecté pour gérer vos cartes.</p>
                    <Button variant="primary" onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                </Alert>
            </ProfileLayout>
        );
    }

    const saveCards = (newCards) => {
        setCards(newCards);
        localStorage.setItem(`cards_${user.email}`, JSON.stringify(newCards));
    };

    const handleOpenModal = (card = null) => {
        if (card) {
            setEditingCard(card);
            setFormData(card);
        } else {
            setEditingCard(null);
            setFormData({
                cardName: '',
                cardNumber: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: ''
            });
        }
        setShowModal(true);
    };

    const handleSaveCard = () => {
        if (!formData.cardName || !formData.cardNumber || !formData.expiryMonth || !formData.expiryYear) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Validate card number (simple check)
        if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Le numéro de carte doit contenir 16 chiffres');
            return;
        }

        let newCards;
        if (editingCard) {
            // Update existing card
            newCards = cards.map(c =>
                c.id === editingCard.id ? { ...formData, id: editingCard.id } : c
            );
        } else {
            // Add new card
            const newCard = { ...formData, id: Date.now() };
            newCards = [...cards, newCard];
        }

        saveCards(newCards);
        setShowModal(false);
    };

    const handleDeleteCard = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
            const newCards = cards.filter(c => c.id !== id);
            saveCards(newCards);
        }
    };

    const maskCardNumber = (number) => {
        const cleaned = number.replace(/\s/g, '');
        return `**** **** **** ${cleaned.slice(-4)}`;
    };

    const getCardType = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (cleaned.startsWith('4')) return 'Visa';
        if (cleaned.startsWith('5')) return 'Mastercard';
        if (cleaned.startsWith('3')) return 'American Express';
        return 'Carte bancaire';
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    return (
        <ProfileLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold">Cartes enregistrées</h3>
                    <p className="text-muted mb-0">Gérez vos moyens de paiement</p>
                </div>
                <Button variant="warning" className="text-white fw-bold" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Nouvelle carte
                </Button>
            </div>

            {cards.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-credit-card" style={{ fontSize: '5rem', color: '#ddd' }}></i>
                    <h3 className="mt-4 text-muted">Aucune carte enregistrée</h3>
                    <p className="text-muted mb-4">Ajoutez une carte pour faciliter vos paiements</p>
                    <Button variant="warning" className="text-white fw-bold" onClick={() => handleOpenModal()}>
                        Ajouter une carte
                    </Button>
                </div>
            ) : (
                <Row className="g-4">
                    {cards.map(card => (
                        <Col key={card.id} md={6} lg={4}>
                            <Card className="h-100 shadow-sm border-0" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white'
                            }}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <small className="opacity-75">{getCardType(card.cardNumber)}</small>
                                            <h6 className="fw-bold mb-0">{card.cardName}</h6>
                                        </div>
                                        <div>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-1 text-white"
                                                onClick={() => handleOpenModal(card)}
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </Button>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-1 text-white"
                                                onClick={() => handleDeleteCard(card.id)}
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <i className="bi bi-credit-card-2-front" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>
                                        {maskCardNumber(card.cardNumber)}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <small className="opacity-75">Expire le</small>
                                            <p className="mb-0 fw-bold">{card.expiryMonth}/{card.expiryYear}</p>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Add/Edit Card Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCard ? 'Modifier la carte' : 'Nouvelle carte'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom sur la carte *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex: JEAN DUPONT"
                                value={formData.cardName}
                                onChange={e => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Numéro de carte *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                value={formatCardNumber(formData.cardNumber)}
                                onChange={e => {
                                    const value = e.target.value.replace(/\s/g, '');
                                    if (/^\d*$/.test(value) && value.length <= 16) {
                                        setFormData({ ...formData, cardNumber: value });
                                    }
                                }}
                            />
                        </Form.Group>

                        <Row>
                            <Col xs={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mois *</Form.Label>
                                    <Form.Select
                                        value={formData.expiryMonth}
                                        onChange={e => setFormData({ ...formData, expiryMonth: e.target.value })}
                                    >
                                        <option value="">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month.toString().padStart(2, '0')}>
                                                {month.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Année *</Form.Label>
                                    <Form.Select
                                        value={formData.expiryYear}
                                        onChange={e => setFormData({ ...formData, expiryYear: e.target.value })}
                                    >
                                        <option value="">AA</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                            <option key={year} value={year.toString().slice(-2)}>
                                                {year.toString().slice(-2)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CVV</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="123"
                                        maxLength="3"
                                        value={formData.cvv}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setFormData({ ...formData, cvv: value });
                                            }
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Alert variant="info" className="small">
                            <i className="bi bi-shield-lock me-2"></i>
                            Vos informations sont sécurisées et cryptées
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="warning" className="text-white fw-bold" onClick={handleSaveCard}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </ProfileLayout>
    );
};

export default SavedCards;
