import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';

const Cards = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    // Load saved cards
    const [savedCards, setSavedCards] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`cards_${user.email}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        isDefault: false
    });

    // Redirect if not logged in
    if (!user) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="light" className="border">
                    <Alert.Heading>Connexion requise</Alert.Heading>
                    <p>Veuillez vous connecter pour accéder à vos cartes.</p>
                    <Button variant="warning" className="text-white" onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                </Alert>
            </Container>
        );
    }

    // Save cards to localStorage
    const saveCards = (cards) => {
        if (user) {
            localStorage.setItem(`cards_${user.email}`, JSON.stringify(cards));
            setSavedCards(cards);
        }
    };

    // Add or update card
    const handleSaveCard = () => {
        if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (editingCard) {
            // Update existing card
            const updatedCards = savedCards.map(card =>
                card.id === editingCard.id
                    ? {
                        ...card,
                        cardNumber: cardData.cardNumber,
                        cardHolder: cardData.cardHolder,
                        expiryDate: cardData.expiryDate,
                        lastFour: cardData.cardNumber.slice(-4),
                        isDefault: cardData.isDefault
                    }
                    : card
            );
            saveCards(updatedCards);
        } else {
            // Add new card
            const newCard = {
                id: Date.now().toString(),
                cardNumber: cardData.cardNumber,
                cardHolder: cardData.cardHolder,
                expiryDate: cardData.expiryDate,
                lastFour: cardData.cardNumber.slice(-4),
                isDefault: cardData.isDefault || savedCards.length === 0,
                addedDate: new Date().toISOString()
            };

            // If this is set as default, remove default from others
            let updatedCards = savedCards;
            if (newCard.isDefault) {
                updatedCards = savedCards.map(card => ({ ...card, isDefault: false }));
            }

            saveCards([...updatedCards, newCard]);
        }

        resetForm();
    };

    // Delete card
    const handleDeleteCard = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
            const newCards = savedCards.filter(card => card.id !== id);
            saveCards(newCards);
        }
    };

    // Set as default card
    const handleSetDefault = (id) => {
        const updatedCards = savedCards.map(card => ({
            ...card,
            isDefault: card.id === id
        }));
        saveCards(updatedCards);
    };

    // Reset form
    const resetForm = () => {
        setCardData({
            cardNumber: '',
            cardHolder: '',
            expiryDate: '',
            cvv: '',
            isDefault: false
        });
        setEditingCard(null);
        setShowCardModal(false);
    };

    // Edit card
    const handleEditCard = (card) => {
        setEditingCard(card);
        setCardData({
            cardNumber: card.cardNumber,
            cardHolder: card.cardHolder,
            expiryDate: card.expiryDate,
            cvv: '***',
            isDefault: card.isDefault
        });
        setShowCardModal(true);
    };

    return (
        <ProfileLayout>
            <h3 className="mb-4 fw-bold">
                <i className="bi bi-credit-card me-2"></i>
                Mes cartes bancaires
            </h3>

            {savedCards.length === 0 ? (
                <Card className="border-0 shadow-sm text-center p-5">
                    <i className="bi bi-credit-card" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <h5 className="mt-3 text-muted">Aucune carte enregistrée</h5>
                    <p className="text-muted">Ajoutez une carte pour faciliter vos paiements</p>
                    <Button variant="warning" className="text-white mt-2" onClick={() => setShowCardModal(true)}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Ajouter une carte
                    </Button>
                </Card>
            ) : (
                <>
                    <div className="mb-3">
                        <Button variant="warning" className="text-white" onClick={() => setShowCardModal(true)}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Ajouter une carte
                        </Button>
                    </div>

                    <Row className="g-3">
                        {savedCards.map(card => (
                            <Col md={6} key={card.id}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <i className="bi bi-credit-card-2-front" style={{ fontSize: '2rem', color: '#ffc107' }}></i>
                                            </div>
                                            {card.isDefault && (
                                                <Badge bg="success">Par défaut</Badge>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <h5 className="mb-1">•••• •••• •••• {card.lastFour}</h5>
                                            <p className="text-muted mb-0">{card.cardHolder}</p>
                                            <small className="text-muted">Expire: {card.expiryDate}</small>
                                        </div>

                                        <div className="d-flex gap-2">
                                            {!card.isDefault && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleSetDefault(card.id)}
                                                >
                                                    Définir par défaut
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteCard(card.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Add/Edit Card Modal */}
            <Modal show={showCardModal} onHide={resetForm} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCard ? 'Modifier' : 'Ajouter'} une carte</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Numéro de carte *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardData.cardNumber}
                                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\s/g, '') })}
                                maxLength="16"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom du titulaire *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="NOM PRENOM"
                                value={cardData.cardHolder}
                                onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                            />
                        </Form.Group>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date d'expiration *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="MM/AA"
                                        value={cardData.expiryDate}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length >= 2) {
                                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                            }
                                            setCardData({ ...cardData, expiryDate: value });
                                        }}
                                        maxLength="5"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>CVV *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                        maxLength="3"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Définir comme carte par défaut"
                                checked={cardData.isDefault}
                                onChange={(e) => setCardData({ ...cardData, isDefault: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={resetForm}>
                        Annuler
                    </Button>
                    <Button variant="warning" className="text-white" onClick={handleSaveCard}>
                        {editingCard ? 'Modifier' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </ProfileLayout>
    );
};

export default Cards;
