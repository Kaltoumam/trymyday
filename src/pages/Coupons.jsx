import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';

const Coupons = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Load coupons from localStorage
    const [coupons, setCoupons] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`coupons_${user.email}`);
        return saved ? JSON.parse(saved) : [
            // Default coupons for demo
            {
                id: 1,
                code: 'BIENVENUE10',
                discount: 10,
                type: 'percentage',
                description: 'Coupon de bienvenue',
                minAmount: 50,
                expiryDate: '2025-12-31',
                used: false
            },
            {
                id: 2,
                code: 'NOEL2025',
                discount: 20,
                type: 'percentage',
                description: 'Promotion de Noël',
                minAmount: 100,
                expiryDate: '2025-12-25',
                used: false
            },
            {
                id: 3,
                code: 'LIVRAISON',
                discount: 0,
                type: 'shipping',
                description: 'Livraison gratuite',
                minAmount: 0,
                expiryDate: '2026-01-31',
                used: false
            }
        ];
    });

    const handleCopyCoupon = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Code "${code}" copié dans le presse-papiers !`);
    };

    const handleUseCoupon = (code) => {
        // Store coupon code in localStorage for cart to use
        localStorage.setItem('appliedCoupon', code);
        navigate('/cart');
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    const getDiscountText = (coupon) => {
        if (coupon.type === 'shipping') return 'Livraison gratuite';
        if (coupon.type === 'percentage') return `-${coupon.discount}%`;
        return `-${coupon.discount.toLocaleString()} FCFA`;
    };

    const activeCoupons = coupons.filter(c => !c.used && !isExpired(c.expiryDate));
    const usedCoupons = coupons.filter(c => c.used);
    const expiredCoupons = coupons.filter(c => !c.used && isExpired(c.expiryDate));

    if (!user) {
        return (
            <ProfileLayout>
                <div className="mb-4">
                    <h3 className="fw-bold">Mes coupons</h3>
                    <p className="text-muted">Gérez vos codes promo</p>
                </div>
                <Card className="border-0 shadow-sm text-center p-5">
                    <i className="bi bi-person-x" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <h5 className="mt-3">Connexion requise</h5>
                    <p className="text-muted">Connectez-vous pour voir vos coupons</p>
                    <Button variant="warning" className="text-white mt-2" onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                </Card>
            </ProfileLayout>
        );
    }

    return (
        <ProfileLayout>
            <div className="mb-4">
                <h3 className="fw-bold">Mes coupons</h3>
                <p className="text-muted">Utilisez vos codes promo pour économiser</p>
            </div>

            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">Coupons disponibles ({activeCoupons.length})</h5>
                    <Row className="g-3">
                        {activeCoupons.map(coupon => (
                            <Col key={coupon.id} md={6} lg={4}>
                                <Card className="border-0 shadow-sm h-100" style={{
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white'
                                }}>
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h4 className="fw-bold mb-0">{getDiscountText(coupon)}</h4>
                                                <small className="opacity-75" style={{ fontSize: '0.8rem' }}>{coupon.description}</small>
                                            </div>
                                            <i className="bi bi-ticket-perforated" style={{ fontSize: '1.5rem' }}></i>
                                        </div>

                                        <div className="bg-white bg-opacity-25 rounded p-2 mb-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <small className="opacity-75 d-block" style={{ fontSize: '0.7rem' }}>Code promo</small>
                                                    <strong style={{ fontSize: '1rem', letterSpacing: '1px' }}>
                                                        {coupon.code}
                                                    </strong>
                                                </div>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleCopyCoupon(coupon.code)}
                                                    style={{ padding: '0.25rem 0.5rem' }}
                                                >
                                                    <i className="bi bi-clipboard"></i>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            {coupon.minAmount > 0 && (
                                                <small className="d-block opacity-75" style={{ fontSize: '0.75rem' }}>
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Min: {coupon.minAmount.toLocaleString()} FCFA
                                                </small>
                                            )}
                                            <small className="d-block opacity-75" style={{ fontSize: '0.75rem' }}>
                                                <i className="bi bi-calendar me-1"></i>
                                                Jusqu'au {new Date(coupon.expiryDate).toLocaleDateString('fr-FR')}
                                            </small>
                                        </div>

                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="w-100 fw-bold"
                                            onClick={() => handleUseCoupon(coupon.code)}
                                        >
                                            Utiliser
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* Used Coupons */}
            {usedCoupons.length > 0 && (
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">Coupons utilisés ({usedCoupons.length})</h5>
                    <Row className="g-3">
                        {usedCoupons.map(coupon => (
                            <Col key={coupon.id} md={6} lg={4}>
                                <Card className="border-0 shadow-sm h-100 bg-light">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold mb-1 text-muted">{getDiscountText(coupon)}</h6>
                                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>{coupon.description}</small>
                                            </div>
                                            <Badge bg="secondary">Utilisé</Badge>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Code: {coupon.code}</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* Expired Coupons */}
            {expiredCoupons.length > 0 && (
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">Coupons expirés ({expiredCoupons.length})</h5>
                    <Row className="g-3">
                        {expiredCoupons.map(coupon => (
                            <Col key={coupon.id} md={6} lg={4}>
                                <Card className="border-0 shadow-sm h-100 bg-light">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold mb-1 text-muted">{getDiscountText(coupon)}</h6>
                                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>{coupon.description}</small>
                                            </div>
                                            <Badge bg="danger">Expiré</Badge>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                Code: {coupon.code} • Expiré le {new Date(coupon.expiryDate).toLocaleDateString('fr-FR')}
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* No coupons */}
            {activeCoupons.length === 0 && usedCoupons.length === 0 && expiredCoupons.length === 0 && (
                <Card className="border-0 shadow-sm text-center p-5">
                    <i className="bi bi-ticket-perforated" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <h5 className="mt-3">Aucun coupon disponible</h5>
                    <p className="text-muted">Vos coupons apparaîtront ici</p>
                    <Button variant="warning" className="text-white mt-2" onClick={() => navigate('/shop')}>
                        Découvrir la boutique
                    </Button>
                </Card>
            )}
        </ProfileLayout>
    );
};

export default Coupons;
