import { Link, Outlet, useLocation } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();

    let menuItems = [
        { path: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
        { path: '/admin/products', label: 'Produits', icon: 'bi-box-seam' },
        { path: '/admin/orders', label: 'Commandes', icon: 'bi-cart-check' },
        { path: '/admin/users', label: 'Clients', icon: 'bi-people' },
        { path: '/admin/finance', label: 'Finance', icon: 'bi-bar-chart-line' },
        { path: '/admin/wallet', label: 'Wallet', icon: 'bi-wallet2' },
        { path: '/admin/support', label: 'Support', icon: 'bi-question-square' },
    ];

    const { user } = useAuth();

    if (user?.role === 'manager') {
        menuItems = menuItems.filter(item => item.label !== 'Clients' && item.label !== 'Finance');
    } else if (user?.role === 'expediteur') {
        menuItems = menuItems.filter(item =>
            item.label === 'Dashboard' || item.label === 'Commandes'
        );
    }

    return (
        <Container fluid className="pt-3 pb-4">
            <Row>
                <Col md={2} lg={2}>
                    <Card className="shadow-sm border-0 mb-4 h-100">
                        <Card.Body className="p-0">
                            <div className="p-2 text-white mb-2" style={{ background: 'linear-gradient(135deg, #ef9c52ff 0%, #f19456ff 100%)' }}>
                                <h6 className="mb-0 fw-bold">
                                    {user?.role === 'manager' ? 'Manager Panel' :
                                        user?.role === 'expediteur' ? 'Panel Expéditeur' : 'Admin Panel'}
                                </h6>
                            </div>
                            <ListGroup variant="flush">
                                {menuItems.map(item => (
                                    <ListGroup.Item
                                        key={item.path}
                                        as={Link}
                                        to={item.path}
                                        action
                                        active={location.pathname === item.path}
                                        className="border-0 rounded-0 py-2 px-3 d-flex align-items-center"
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        <i className={`${item.icon} me-2`}></i>
                                        {item.label}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={10} lg={10}>
                    <div className="bg-white p-4 rounded-3 shadow-sm" style={{ minHeight: '80vh' }}>
                        <Outlet />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout;
