import { Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ProfileLayout from '../components/ProfileLayout';

const Profile = () => {
    const { user } = useAuth();
    const { orders } = useData();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="py-5 text-center">
                <h3>Veuillez vous connecter pour accéder à votre profil</h3>
                <Link to="/login" className="btn btn-primary mt-3">Se connecter</Link>
            </div>
        );
    }

    return (
        <ProfileLayout>
            {/* Welcome Card */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <h4 className="mb-2">Bienvenue, {user.name} ! 👋</h4>
                    <p className="text-muted mb-0">
                        Gerez vos commandes, vos informations personnelles et bien plus encore.
                    </p>
                </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                    <Card className="border-0 shadow-sm h-100" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <Card.Body className="text-center p-3">
                            <div className="mb-2" style={{ fontSize: '2rem' }}>📦</div>
                            <h4 className="mb-1 fw-bold">
                                {orders.filter(o => o.email === user.email).length}
                            </h4>
                            <small className="opacity-75">Commandes</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="border-0 shadow-sm h-100" style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white'
                    }}>
                        <Card.Body className="text-center p-3">
                            <div className="mb-2" style={{ fontSize: '2rem' }}>❤️</div>
                            <h4 className="mb-1 fw-bold">
                                {(() => {
                                    const favs = localStorage.getItem(`favorites_${user.email}`);
                                    return favs ? JSON.parse(favs).length : 0;
                                })()}
                            </h4>
                            <small className="opacity-75">Favoris</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="border-0 shadow-sm h-100" style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white'
                    }}>
                        <Card.Body className="text-center p-3">
                            <div className="mb-2" style={{ fontSize: '2rem' }}>🎟️</div>
                            <h4 className="mb-1 fw-bold">
                                {(() => {
                                    const coupons = localStorage.getItem(`coupons_${user.email}`);
                                    if (!coupons) return 3;
                                    const parsed = JSON.parse(coupons);
                                    return parsed.filter(c => !c.used && new Date(c.expiryDate) > new Date()).length;
                                })()}
                            </h4>
                            <small className="opacity-75">Coupons actifs</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6}>
                    <Card className="border-0 shadow-sm h-100" style={{
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white'
                    }}>
                        <Card.Body className="text-center p-3">
                            <div className="mb-2" style={{ fontSize: '2rem' }}>📍</div>
                            <h4 className="mb-1 fw-bold">
                                {(() => {
                                    const addresses = localStorage.getItem(`addresses_${user.email}`);
                                    return addresses ? JSON.parse(addresses).length : 0;
                                })()}
                            </h4>
                            <small className="opacity-75">Adresses</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Recent Orders - Full Width */}
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold">Commandes récentes</h6>
                                <Link to="/profile/orders" className="btn btn-sm btn-outline-warning">
                                    Voir tout
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {orders.filter(o => o.email === user.email).slice(0, 3).length === 0 ? (
                                <div className="text-center p-5">
                                    <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#ddd' }}></i>
                                    <p className="text-muted mt-3 mb-0">Aucune commande</p>
                                </div>
                            ) : (
                                <ListGroup variant="flush">
                                    {orders.filter(o => o.email === user.email).slice(0, 3).map(order => (
                                        <ListGroup.Item key={order.id} className="p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center flex-grow-1">
                                                    <div className="me-3">
                                                        <i className="bi bi-box-seam text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-1">Commande #{order.id}</h6>
                                                        <small className="text-muted">{order.date} • {order.items?.length || 0} article(s)</small>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    {user.role === 'admin' ? (
                                                        <div className="mb-2">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={order.status}
                                                                onChange={(e) => {
                                                                    const newStatus = e.target.value;
                                                                    const updatedOrders = orders.map(o =>
                                                                        o.id === order.id ? { ...o, status: newStatus } : o
                                                                    );
                                                                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                                                                    window.location.reload();
                                                                }}
                                                                style={{ minWidth: '120px' }}
                                                            >
                                                                <option value="En attente">En attente</option>
                                                                <option value="En cours">En cours</option>
                                                                <option value="Livrée">Livrée</option>
                                                                <option value="Annulée">Annulée</option>
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <Badge bg={
                                                            order.status === 'Livrée' ? 'success' :
                                                                order.status === 'En cours' ? 'warning' :
                                                                    order.status === 'Annulée' ? 'danger' : 'secondary'
                                                        }>
                                                            {order.status}
                                                        </Badge>
                                                    )}
                                                    <div className="fw-bold text-success mt-1">{order.total.toLocaleString()} FCFA</div>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </ProfileLayout>
    );
};

export default Profile;
