import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ProfileLayout from '../components/ProfileLayout';

const Orders = () => {
    const { user } = useAuth();
    const { orders } = useData();
    const navigate = useNavigate();

    // Filter orders by user email
    const userOrders = orders.filter(order => order.email === user?.email);

    const getStatusIcon = (status) => {
        if (status === 'Livrée' || status === 'Complétée') return 'bi bi-check-circle-fill text-success';
        if (status === 'Annulée') return 'bi bi-x-circle-fill text-danger';
        if (status === 'En expédition') return 'bi bi-box-seam text-info';
        if (status === 'En attente' || status === 'En cours') return 'bi bi-clock-fill text-warning';
        if (status === "Demande d'annulation") return 'bi bi-hourglass-split text-warning';
        return 'bi bi-box-seam text-secondary';
    };

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h3>Veuillez vous connecter pour voir vos commandes</h3>
                <Link to="/login" className="btn btn-primary mt-3">Se connecter</Link>
            </Container>
        );
    }

    return (
        <ProfileLayout>
            <div className="mb-4">
                <h3 className="fw-bold">Mes commandes</h3>
                <p className="text-muted mb-0">Suivez vos commandes en cours et consultez votre historique</p>
            </div>

            {userOrders.length === 0 ? (
                <Card className="shadow-sm border-0 text-center p-5">
                    <i className="bi bi-box-seam" style={{ fontSize: '5rem', color: '#ddd' }}></i>
                    <h4 className="mt-4 text-muted">Aucune commande</h4>
                    <p className="text-muted">Vous n'avez pas encore passé de commande</p>
                    <Button variant="warning" className="text-white mt-3" onClick={() => navigate('/shop')}>
                        Découvrir la boutique
                    </Button>
                </Card>
            ) : (
                <>
                    {/* Active Orders Section */}
                    {userOrders.filter(order => order.status !== 'Livrée' && order.status !== 'Annulée').length > 0 && (
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white border-bottom p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="bi bi-clock-history text-warning me-2"></i>
                                        Commandes en cours
                                    </h5>
                                    <Badge bg="warning" text="dark">
                                        {userOrders.filter(order => order.status !== 'Livrée' && order.status !== 'Annulée').length}
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {userOrders.filter(order => order.status !== 'Livrée' && order.status !== 'Annulée').map(order => (
                                        <ListGroup.Item key={order.id} className="p-4">
                                            <Row className="align-items-center">
                                                <Col md={2}>
                                                    <div className="text-center">
                                                        <i className={`${getStatusIcon(order.status)} mb-2`} style={{ fontSize: '2rem' }}></i>
                                                        <h6 className="mb-0">#{order.id}</h6>
                                                        <small className="text-muted">{order.date}</small>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Client</small>
                                                    <strong>{order.customerName}</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <small className="text-muted d-block">Articles</small>
                                                    <strong>{order.items?.length || 0} article(s)</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <small className="text-muted d-block">Montant</small>
                                                    <strong className="text-success">{order.total.toLocaleString()} FCFA</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <Badge bg={
                                                        order.status === 'En expédition' ? 'info' :
                                                            order.status === 'En cours' ? 'warning' :
                                                                order.status === 'En attente' ? 'secondary' :
                                                                    order.status === "Demande d'annulation" ? 'warning' :
                                                                        order.status === 'Annulée' ? 'danger' : 'primary'
                                                    } className="w-100 py-2">
                                                        {order.status}
                                                    </Badge>
                                                </Col>
                                                <Col md={1}>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => navigate(`/profile/orders/${order.id}`)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Delivered & Cancelled Orders Section */}
                    {userOrders.filter(order => order.status === 'Livrée' || order.status === 'Annulée').length > 0 && (
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-white border-bottom p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="bi bi-clock-history text-secondary me-2"></i>
                                        Historique des commandes
                                    </h5>
                                    <Badge bg="secondary">
                                        {userOrders.filter(order => order.status === 'Livrée' || order.status === 'Annulée').length}
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {userOrders.filter(order => order.status === 'Livrée' || order.status === 'Annulée').map(order => (
                                        <ListGroup.Item key={order.id} className="p-4 bg-light bg-opacity-50">
                                            <Row className="align-items-center">
                                                <Col md={2}>
                                                    <div className="text-center">
                                                        <i className="bi bi-check-circle-fill text-success mb-2" style={{ fontSize: '2rem' }}></i>
                                                        <h6 className="mb-0">#{order.id}</h6>
                                                        <small className="text-muted">{order.date}</small>
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Client</small>
                                                    <strong>{order.customerName}</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <small className="text-muted d-block">Articles</small>
                                                    <strong>{order.items?.length || 0} article(s)</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <small className="text-muted d-block">Montant</small>
                                                    <strong className="text-success">{order.total.toLocaleString()} FCFA</strong>
                                                </Col>
                                                <Col md={2}>
                                                    <Badge bg="success" className="w-100 py-2">
                                                        Livrée
                                                    </Badge>
                                                </Col>
                                                <Col md={1}>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => navigate(`/profile/orders/${order.id}`)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </ProfileLayout>
    );
};

export default Orders;
