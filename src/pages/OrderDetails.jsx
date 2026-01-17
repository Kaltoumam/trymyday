import { Container, Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ProfileLayout from '../components/ProfileLayout';

const OrderDetails = () => {
    const { orderId } = useParams();
    const { orders, updateOrder } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Find the order
    const order = orders.find(o => o.id === orderId);

    // Check if order exists and belongs to user
    if (!order) {
        return (
            <Container className="py-5 text-center">
                <h3>❌ Commande introuvable</h3>
                <Button variant="warning" className="mt-3 text-white" onClick={() => navigate('/profile/orders')}>
                    ⬅️ Retour aux commandes
                </Button>
            </Container>
        );
    }

    if (order.email !== user?.email && user?.role !== 'admin') {
        return (
            <Container className="py-5 text-center">
                <h3>🔒 Accès non autorisé</h3>
                <Button variant="warning" className="mt-3 text-white" onClick={() => navigate('/profile/orders')}>
                    ⬅️ Retour aux commandes
                </Button>
            </Container>
        );
    }

    const getStatusBadge = (status) => {
        if (status === 'Livrée' || status === 'Complétée') return 'success';
        if (status === 'Annulée') return 'danger';
        if (status === 'En attente' || status === 'En cours') return 'warning';
        if (status === "Demande d'annulation") return 'warning';
        return 'info';
    };

    return (
        <ProfileLayout>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Détails de la commande</h3>
                    <p className="text-muted mb-0">Commande #{order.id}</p>
                </div>
                <Button variant="outline-secondary" onClick={() => navigate('/profile/orders')}>
                    ⬅️ Retour
                </Button>
            </div>

            <Row className="align-items-start">
                {/* Left Column - Order Info */}
                <Col lg={8}>
                    {/* Order Status */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Statut de la commande</h5>
                            {order.status === "Demande d'annulation" && (
                                <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4">
                                    <i className="bi bi-hourglass-split me-3 fs-4"></i>
                                    <div>
                                        <div className="fw-bold">Annulation en cours</div>
                                        <small>Votre demande d'annulation a été enregistrée. Elle attend la confirmation d'un administrateur pour que votre remboursement soit effectué.</small>
                                    </div>
                                </div>
                            )}
                            <div className="d-flex align-items-center">
                                <Badge bg={getStatusBadge(order.status)} className="px-3 py-2 me-3">
                                    {order.status}
                                </Badge>
                                <div>
                                    <small className="text-muted d-block">Date de commande</small>
                                    <strong>{order.date}</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Tracking Timeline */}
                    {(order.trackingNumber || (order.timeline && order.timeline.length > 0)) && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Suivi de commande
                                </h5>

                                {order.trackingNumber && (
                                    <div className="alert alert-info mb-3">
                                        <i className="bi bi-truck me-2"></i>
                                        <strong>Numéro de suivi :</strong> {order.trackingNumber}
                                    </div>
                                )}

                                {order.timeline && order.timeline.length > 0 && (
                                    <div className="timeline">
                                        {order.timeline.map((entry, index) => (
                                            <div key={index} className="timeline-item mb-4">
                                                <div className="d-flex">
                                                    <div className="me-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                backgroundColor:
                                                                    entry.newStatus === 'Livrée' ? '#198754' :
                                                                        entry.newStatus === 'En expédition' ? '#0dcaf0' :
                                                                            entry.newStatus === 'En cours' ? '#ffc107' :
                                                                                entry.newStatus === 'Annulée' ? '#dc3545' : '#6c757d',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            <i className={`bi ${entry.newStatus === 'Livrée' ? 'bi-check-circle-fill' :
                                                                entry.newStatus === 'En expédition' ? 'bi-box-seam' :
                                                                    entry.newStatus === 'En cours' ? 'bi-truck' :
                                                                        entry.newStatus === 'Annulée' ? 'bi-x-circle-fill' : 'bi-clock-fill'
                                                                }`}></i>
                                                        </div>
                                                        {index < order.timeline.length - 1 && (
                                                            <div
                                                                className="ms-3"
                                                                style={{
                                                                    width: '2px',
                                                                    height: '60px',
                                                                    backgroundColor: '#dee2e6',
                                                                    marginTop: '5px'
                                                                }}
                                                            ></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <div>
                                                                <strong>{entry.newStatus}</strong>
                                                                {entry.oldStatus && entry.oldStatus !== entry.newStatus && (
                                                                    <small className="text-muted ms-2">
                                                                        (de {entry.oldStatus})
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">{entry.date}</small>
                                                        </div>
                                                        {entry.note && (
                                                            <div className="alert alert-light mb-0 mt-2 py-2 px-3">
                                                                <i className="bi bi-info-circle me-2"></i>
                                                                {entry.note}
                                                            </div>
                                                        )}
                                                        {entry.admin && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-person-badge me-1"></i>
                                                                {entry.admin}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Order Items */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Articles commandés ({order.items?.length || 0})</h5>
                            <ListGroup variant="flush">
                                {order.items?.map((item, index) => (
                                    <ListGroup.Item key={index} className="px-0 py-3">
                                        <Row className="align-items-center">
                                            <Col xs="auto">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/80x80?text=Product'}
                                                    alt={item.name}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </Col>
                                            <Col>
                                                <h6 className="mb-1">{item.name}</h6>
                                                <small className="text-muted">Quantité: {item.quantity}</small>
                                            </Col>
                                            <Col xs="auto">
                                                <strong className="text-warning">{item.price.toLocaleString()} FCFA</strong>
                                                <div className="small text-muted">
                                                    Total: {(item.price * item.quantity).toLocaleString()} FCFA
                                                </div>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Adresse de livraison</h5>
                            <div className="bg-light p-3 rounded">
                                <p className="mb-1"><strong>{order.customer}</strong></p>
                                <p className="mb-1 small">{order.shippingAddress?.address}</p>
                                <p className="mb-1 small">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                <p className="mb-1 small">{order.shippingAddress?.country}</p>
                                <p className="mb-1 small">Tél: {order.phone}</p>
                                <p className="mb-0 small">Email: {order.email}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Summary */}
                <Col lg={4}>
                    <div className="sticky-top" style={{ top: '100px', zIndex: 10, transition: 'all 0.3s ease' }}>
                        <Card className="border-0 shadow-sm mb-3">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Résumé de la commande</h5>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Sous-total</span>
                                    <span>{(order.total - (order.shippingCost || 0)).toLocaleString()} FCFA</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Livraison</span>
                                    <span>{order.shippingCost ? `${order.shippingCost.toLocaleString()} FCFA` : 'Gratuite'}</span>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Total</strong>
                                    <strong className="text-warning fs-5">{order.total.toLocaleString()} FCFA</strong>
                                </div>

                                <div className="bg-light p-3 rounded">
                                    <small className="text-muted d-block mb-1">Numéro de commande</small>
                                    <strong className="small">{order.id}</strong>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Actions */}
                        <Card className="border-0 shadow-sm mt-3">
                            <Card.Body className="p-3">
                                {order.status === 'En attente' && (
                                    <Button
                                        variant="danger"
                                        className="w-100 mb-2"
                                        onClick={() => {
                                            if (window.confirm('Êtes-vous sûr de vouloir annuler ? L\'administrateur devra accepter l\'annulation avant que votre argent ne soit retourné sur votre compte.')) {
                                                const timelineEntry = {
                                                    date: new Date().toLocaleString('fr-FR'),
                                                    oldStatus: order.status,
                                                    newStatus: "Demande d'annulation",
                                                    note: "L'utilisateur a demandé l'annulation.",
                                                    admin: "Client"
                                                };
                                                updateOrder(order.id, {
                                                    status: "Demande d'annulation",
                                                    timeline: [...(order.timeline || []), timelineEntry]
                                                });
                                            }
                                        }}
                                    >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Annuler la commande
                                    </Button>
                                )}
                                <Button
                                    variant="outline-warning"
                                    className="w-100 mb-2"
                                    onClick={() => window.print()}
                                >
                                    <i className="bi bi-printer me-2"></i>
                                    Imprimer
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100"
                                    onClick={() => navigate('/shop')}
                                >
                                    <i className="bi bi-shop me-2"></i>
                                    Continuer mes achats
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </ProfileLayout>
    );
};

export default OrderDetails;
