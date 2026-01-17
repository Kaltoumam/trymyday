import { Container, Button, Card, Row, Col, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const {
        cartItems,
        savedItems,
        appliedCoupon,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getShippingCost,
        getTax,
        getDiscount,
        getCartTotal
    } = useCart();

    const navigate = useNavigate();

    // Track which items are selected (checked)
    const [selectedItems, setSelectedItems] = useState({});

    // Coupon input
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState(null);

    // Initialize all items as selected when cart changes
    useEffect(() => {
        const initialSelection = {};
        cartItems.forEach(item => {
            initialSelection[item.id] = true;
        });
        setSelectedItems(initialSelection);
    }, [cartItems.length]);

    // Toggle item selection
    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Calculate subtotal only for selected items
    const getSelectedSubtotal = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.id]) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);
    };

    // Calculate tax only for selected items (18%)
    const getSelectedTax = () => {
        return 0; // Tax removed
    };

    // Calculate shipping cost for selected items
    const getSelectedShippingCost = () => {
        if (appliedCoupon?.type === 'free_shipping') return 0;
        return 1000;
    };

    // Calculate discount for selected items
    const getSelectedDiscount = () => {
        if (!appliedCoupon) return 0;
        const subtotal = getSelectedSubtotal();

        if (appliedCoupon.type === 'percentage') {
            return subtotal * (appliedCoupon.discount / 100);
        } else if (appliedCoupon.type === 'fixed') {
            return appliedCoupon.discount;
        } else if (appliedCoupon.type === 'free_shipping') {
            return getSelectedShippingCost(); // Logic: discount equals the shipping cost, making it free
        }
        return 0;
    };

    // Calculate total for selected items
    const getSelectedTotal = () => {
        const subtotal = getSelectedSubtotal();
        const tax = getSelectedTax();
        const shipping = getSelectedShippingCost();
        const discount = getSelectedDiscount();
        return subtotal + tax + shipping - discount;
    };

    // Handle coupon application
    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponMessage({ type: 'danger', text: 'Veuillez entrer un code promo' });
            return;
        }

        const result = applyCoupon(couponCode);
        setCouponMessage({
            type: result.success ? 'success' : 'danger',
            text: result.message
        });

        if (result.success) {
            setCouponCode('');
            setTimeout(() => setCouponMessage(null), 3000);
        }
    };

    // Get estimated delivery date (3-5 business days)
    const getEstimatedDelivery = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 5);
        return deliveryDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (cartItems.length === 0 && savedItems.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div className="mb-4">
                    <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
                </div>
                <h2>Votre panier est vide</h2>
                <p className="text-muted mb-4">Découvrez nos produits et commencez votre shopping !</p>
                <Button variant="warning" className="text-white fw-bold px-4 py-2" onClick={() => navigate('/shop')}>
                    Retour à la boutique
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h3 className="mb-4 fw-bold">
                <i className="bi bi-cart3 me-2"></i>
                Mon Panier ({cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'})
            </h3>

            <Row>
                <Col lg={8}>
                    {/* Cart Items List */}
                    {cartItems.length > 0 && (
                        <div className="d-flex flex-column gap-3 mb-4">
                            {cartItems.map(item => (
                                <Card
                                    key={item.id}
                                    className="shadow-sm border-0 rounded-3 overflow-hidden cart-item-card"
                                    style={{
                                        opacity: selectedItems[item.id] ? 1 : 0.5,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                >
                                    <Card.Body className="p-0">
                                        <div className="d-flex p-3">
                                            {/* Checkbox for item selection */}
                                            <div className="d-flex align-items-center me-2">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedItems[item.id] || false}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    style={{ transform: 'scale(1.2)' }}
                                                />
                                            </div>

                                            {/* Image */}
                                            <div className="d-flex align-items-center me-3">
                                                <div style={{ width: '80px', height: '100px', flexShrink: 0 }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-100 h-100 rounded border"
                                                        style={{ objectFit: 'contain', padding: '4px' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{item.name}</h6>
                                                        <p className="text-muted small mb-1">
                                                            <i className="bi bi-tag me-1"></i>
                                                            {item.category}
                                                        </p>
                                                        {item.stock && item.stock < 10 && (
                                                            <Badge bg="warning" text="dark" className="small">
                                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                                Plus que {item.stock} en stock
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="link"
                                                            className="text-primary p-0 text-decoration-none small"
                                                            onClick={() => saveForLater(item.id)}
                                                            title="Enregistrer pour plus tard"
                                                        >
                                                            <i className="bi bi-bookmark me-1"></i>
                                                            Sauvegarder
                                                        </Button>
                                                        <Button
                                                            variant="link"
                                                            className="text-danger p-0 text-decoration-none small"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <i className="bi bi-trash me-1"></i>
                                                            Supprimer
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Price & Quantity Row */}
                                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                                    {/* Quantity Selector */}
                                                    <div className="d-flex align-items-center border rounded-pill px-2 py-1" style={{ backgroundColor: '#fff' }}>
                                                        <Button
                                                            variant="link"
                                                            className="text-dark p-0 text-decoration-none fw-bold"
                                                            style={{ width: '25px' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >−</Button>
                                                        <span className="mx-3 fw-bold small text-warning">{item.quantity}</span>
                                                        <Button
                                                            variant="link"
                                                            className="text-dark p-0 text-decoration-none fw-bold"
                                                            style={{ width: '25px' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >+</Button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-end">
                                                        <span className="d-block text-warning fw-bold fs-5">
                                                            {((item.price * item.quantity)).toLocaleString()} FCFA
                                                        </span>
                                                        <small className="text-muted">
                                                            {(item.price).toLocaleString()} FCFA / unité
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Saved Items Section */}
                    {savedItems.length > 0 && (
                        <Card className="shadow-sm border-0 rounded-3 mb-3">
                            <Card.Header className="bg-light border-0">
                                <h5 className="mb-0 fw-bold">
                                    <i className="bi bi-bookmark-fill me-2 text-primary"></i>
                                    Enregistrés pour plus tard ({savedItems.length})
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    {savedItems.map(item => (
                                        <Col md={6} key={item.id}>
                                            <div className="d-flex border rounded p-2">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                                    className="me-2"
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="small mb-1">{item.name}</h6>
                                                    <p className="text-warning fw-bold small mb-2">{(item.price).toLocaleString()} FCFA</p>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => moveToCart(item.id)}
                                                        >
                                                            <i className="bi bi-cart-plus me-1"></i>
                                                            Ajouter
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => removeSavedItem(item.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {cartItems.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/shop')}>
                                <i className="bi bi-arrow-left me-1"></i>
                                Continuer mes achats
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={clearCart}>
                                <i className="bi bi-trash me-1"></i>
                                Vider le panier
                            </Button>
                        </div>
                    )}
                </Col>

                {/* Order Summary */}
                {cartItems.length > 0 && (
                    <Col lg={4}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h4 className="fw-bold mb-4">Résumé de la commande</h4>

                                {/* Coupon Section */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold small">Code promo</label>
                                    {appliedCoupon ? (
                                        <div className="d-flex align-items-center justify-content-between bg-success bg-opacity-10 p-2 rounded">
                                            <div>
                                                <Badge bg="success" className="me-2">{appliedCoupon.code}</Badge>
                                                <small className="text-success">{appliedCoupon.description}</small>
                                            </div>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-danger p-0"
                                                onClick={removeCoupon}
                                            >
                                                <i className="bi bi-x-circle"></i>
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Entrez le code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                />
                                                <Button variant="outline-warning" onClick={handleApplyCoupon}>
                                                    Appliquer
                                                </Button>
                                            </InputGroup>
                                            <small className="text-muted d-block mt-1">
                                                Essayez: WELCOME10, SAVE20, FREESHIP
                                            </small>
                                        </>
                                    )}
                                    {couponMessage && (
                                        <Alert variant={couponMessage.type} className="mt-2 mb-0 py-2 small">
                                            {couponMessage.text}
                                        </Alert>
                                    )}
                                </div>

                                <hr />

                                {/* Price Breakdown */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Sous-total</span>
                                    <span className="fw-bold">{(getSelectedSubtotal()).toLocaleString()} FCFA</span>
                                </div>


                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Livraison</span>
                                    {getSelectedShippingCost() === 0 ? (
                                        <span className="text-success fw-bold">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Gratuite
                                        </span>
                                    ) : (
                                        <span className="fw-bold">{(getSelectedShippingCost()).toLocaleString()} FCFA</span>
                                    )}
                                </div>

                                {getSelectedDiscount() > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-success">Réduction</span>
                                        <span className="text-success fw-bold">-{getSelectedDiscount().toLocaleString()} FCFA</span>
                                    </div>
                                )}


                                <hr className="my-3" />

                                <div className="d-flex justify-content-between mb-4 align-items-center">
                                    <span className="h5 fw-bold mb-0">Total</span>
                                    <span className="h4 text-warning fw-bold mb-0">{(getSelectedTotal()).toLocaleString()} FCFA</span>
                                </div>

                                {/* Delivery Info */}
                                <div className="bg-light p-3 rounded mb-3">
                                    <small className="text-muted d-block mb-1">
                                        <i className="bi bi-truck me-2"></i>
                                        Livraison estimée
                                    </small>
                                    <small className="fw-bold">{getEstimatedDelivery()}</small>
                                </div>

                                <Button
                                    variant="warning"
                                    size="lg"
                                    className="w-100 text-white fw-bold py-3 shadow-sm rounded-3"
                                    onClick={() => {
                                        // Check if at least one item is selected
                                        const hasSelectedItems = Object.values(selectedItems).some(isSelected => isSelected);

                                        if (!hasSelectedItems) {
                                            alert('⚠️ Veuillez sélectionner au moins un article pour continuer');
                                            return;
                                        }

                                        navigate('/checkout');
                                    }}
                                >
                                    VALIDER MA COMMANDE
                                    <i className="bi bi-chevron-right ms-2 small"></i>
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Paiement 100% Sécurisé
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default Cart;
