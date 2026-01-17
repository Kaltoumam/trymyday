import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import ProfileLayout from '../components/ProfileLayout';

const Reorder = () => {
    const { user } = useAuth();
    const { orders } = useData();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Filter orders by user email and only show completed/delivered orders
    const completedOrders = orders.filter(order =>
        order.email === user?.email &&
        (order.status === 'Livrée' || order.status === 'Complétée')
    );

    const handleReorderAll = (order) => {
        // Add all items from the order to cart
        order.items?.forEach(item => {
            addToCart(item);
        });

        alert(`${order.items?.length} article(s) ajouté(s) au panier !`);
        navigate('/cart');
    };

    const handleReorderItem = (item) => {
        addToCart(item);
        alert('Article ajouté au panier !');
    };

    if (!user) {
        return (
            <ProfileLayout>
                <div className="mb-4">
                    <h3 className="fw-bold">Commander encore</h3>
                    <p className="text-muted">Recommandez vos articles préférés</p>
                </div>
                <Card className="border-0 shadow-sm text-center p-5">
                    <i className="bi bi-person-x" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <h5 className="mt-3">Connexion requise</h5>
                    <p className="text-muted">Connectez-vous pour voir vos commandes précédentes</p>
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
                <h3 className="fw-bold">Commander encore</h3>
                <p className="text-muted">Recommandez facilement vos articles préférés</p>
            </div>

            {completedOrders.length === 0 ? (
                <Card className="border-0 shadow-sm text-center p-5">
                    <i className="bi bi-box-seam" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                    <h5 className="mt-3">Aucune commande livrée</h5>
                    <p className="text-muted">Vos commandes livrées apparaîtront ici pour que vous puissiez les recommander facilement</p>
                    <Button variant="warning" className="text-white mt-2" onClick={() => navigate('/shop')}>
                        Découvrir la boutique
                    </Button>
                </Card>
            ) : (
                <div>
                    {completedOrders.map(order => (
                        <Card key={order.id} className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="fw-bold mb-1">Commande #{order.id}</h6>
                                        <small className="text-muted">
                                            Livrée le {order.date} • {order.items?.length} article(s)
                                        </small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg="success">Livrée</Badge>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="text-white fw-bold"
                                            onClick={() => handleReorderAll(order)}
                                        >
                                            <i className="bi bi-arrow-repeat me-1"></i>
                                            Tout recommander
                                        </Button>
                                    </div>
                                </div>

                                <hr className="my-3" />

                                <Row className="g-3">
                                    {order.items?.map((item, index) => (
                                        <Col key={index} md={6}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/80x80?text=Product'}
                                                    alt={item.name}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                    className="me-3"
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 small">{item.name}</h6>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <small className="text-muted">Qté: {item.quantity}</small>
                                                            <div className="text-warning fw-bold">{item.price.toLocaleString()} FCFA</div>
                                                        </div>
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            onClick={() => handleReorderItem(item)}
                                                        >
                                                            <i className="bi bi-cart-plus"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                <div className="mt-3 pt-3 border-top">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Total de la commande</span>
                                        <strong className="text-success">{order.total.toLocaleString()} FCFA</strong>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </ProfileLayout>
    );
};

export default Reorder;
