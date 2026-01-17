import { Container, Row, Col, Card, Form, Button, Accordion, InputGroup, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useData } from '../context/DataContext';

const Help = () => {
    const { orders, helpQuestions, addHelpQuestion } = useData();
    const [activeTab, setActiveTab] = useState('contact');

    // Tracking state
    const [trackingId, setTrackingId] = useState('');
    const [foundOrder, setFoundOrder] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Community Form state
    const [userName, setUserName] = useState('');
    const [userQuestion, setUserQuestion] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleTrackOrder = (e) => {
        e.preventDefault();
        const order = orders.find(o => o.id === trackingId.trim() || o.id === `#${trackingId.trim()}`);
        setFoundOrder(order);
        setHasSearched(true);
    };

    const handleSubmitQuestion = (e) => {
        e.preventDefault();
        if (!userName || !userQuestion) return;
        addHelpQuestion({ userName, question: userQuestion });
        setUserName('');
        setUserQuestion('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const menuItems = [
        { id: 'contact', label: 'Nous contacter', icon: 'bi-telephone' },
        { id: 'tracking', label: 'Suivre une commande', icon: 'bi-box-seam' },
        { id: 'faq', label: 'Questions fréquentes', icon: 'bi-question-circle' },
        { id: 'community', label: 'Communauté Q&A', icon: 'bi-chat-dots' },
    ];

    const contactMethods = [
        { title: 'WhatsApp', icon: 'bi-whatsapp', color: '#25D366', action: 'Discuter', link: 'https://wa.me/905461941673' },
        { title: 'Appel Direct', icon: 'bi-telephone-fill', color: '#ff6000', action: 'Appeler', link: 'tel:+905461941673' },
        { title: 'Email', icon: 'bi-envelope-fill', color: '#007bff', action: 'Envoyer', link: 'mailto:Trymyday235@gmail.com' }
    ];

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
            <Container>
                <Row className="g-4">
                    {/* Sidebar */}
                    <Col lg={3}>
                        <div className="sticky-top" style={{ top: '100px' }}>
                            {/* Prominent Quick Access */}
                            <Card className="border-0 shadow-sm mb-4 bg-dark text-white overflow-hidden" style={{ borderRadius: '25px' }}>
                                <div style={{
                                    position: 'absolute', top: '-20px', right: '-20px',
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: 'rgba(255, 96, 0, 0.2)', filter: 'blur(30px)'
                                }}></div>
                                <Card.Body className="p-4 position-relative">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center">
                                        <i className="bi bi-patch-question me-2" style={{ color: '#ff6000' }}></i>
                                        Besoin d'aide ?
                                    </h5>
                                    <p className="small opacity-75 mb-4">Notre équipe est là pour vous accompagner immédiatement.</p>
                                    <Button
                                        href="tel:+905461941673"
                                        variant="warning"
                                        className="w-100 rounded-pill py-2 fw-bold shadow-sm"
                                        style={{ backgroundColor: '#ff6000', borderColor: '#ff6000', color: '#fff' }}
                                    >
                                        Appel Direct
                                    </Button>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-2">
                                    <div className="p-3 mb-2">
                                        <h6 className="fw-bold mb-0 text-muted text-uppercase small" style={{ letterSpacing: '1px' }}>Menu Aide</h6>
                                    </div>
                                    <ListGroup variant="flush">
                                        {menuItems.map(item => (
                                            <ListGroup.Item
                                                key={item.id}
                                                action
                                                active={activeTab === item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className="border-0 rounded-4 mb-1 d-flex align-items-center py-3"
                                                style={{
                                                    fontSize: '0.95rem',
                                                    backgroundColor: activeTab === item.id ? '#ff6000' : 'transparent',
                                                    borderColor: activeTab === item.id ? '#ff6000' : 'transparent',
                                                    color: activeTab === item.id ? '#fff' : '#444'
                                                }}
                                            >
                                                <i className={`bi ${item.icon} me-3 fs-5`}></i>
                                                <span className="fw-medium">{item.label}</span>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    {/* Content Area */}
                    <Col lg={9}>
                        <div className="bg-white p-4 p-lg-5 shadow-sm min-vh-75" style={{ borderRadius: '25px' }}>

                            {/* Tracking Content */}
                            {activeTab === 'tracking' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4">Suivre mon colis</h3>
                                    <p className="text-muted mb-5">Entrez votre numéro de commande pour connaître son avancement sans vous connecter.</p>

                                    <div className="p-4 bg-light rounded-4 mb-4 border border-info border-opacity-10">
                                        <Form onSubmit={handleTrackOrder}>
                                            <InputGroup className="mb-0 custom-input-group">
                                                <Form.Control
                                                    placeholder="Ex: ORD-123456"
                                                    value={trackingId}
                                                    onChange={(e) => setTrackingId(e.target.value)}
                                                    style={{ height: '60px', borderRadius: '15px 0 0 15px', border: '2px solid #ddd' }}
                                                    className="px-4"
                                                />
                                                <Button
                                                    variant="warning"
                                                    type="submit"
                                                    className="px-5 fw-bold"
                                                    style={{ borderRadius: '0 15px 15px 0', backgroundColor: '#ff6000', borderColor: '#ff6000', color: '#fff' }}
                                                >
                                                    Chercher
                                                </Button>
                                            </InputGroup>
                                        </Form>
                                    </div>

                                    {hasSearched && (
                                        <div className="p-4 rounded-4 border fade-in bg-white shadow-sm">
                                            {foundOrder ? (
                                                <Row className="align-items-center">
                                                    <Col md={8}>
                                                        <div className="d-flex align-items-center mb-3">
                                                            <div className="bg-orange-light p-3 rounded-circle me-3">
                                                                <i className="bi bi-box-seam text-orange fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div className="text-muted small">Commande #{foundOrder.id}</div>
                                                                <div className="fw-bold fs-4" style={{ color: '#ff6000' }}>{foundOrder.status}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-muted small">Prévu pour : {foundOrder.date}</div>
                                                    </Col>
                                                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                                                        <Button variant="outline-dark" className="rounded-pill px-4">Plus de détails</Button>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <div className="text-danger d-flex align-items-center justify-content-center py-3">
                                                    <i className="bi bi-exclamation-circle me-2 fs-4"></i>
                                                    Commande non trouvée. Veuillez vérifier votre numéro.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FAQ Content */}
                            {activeTab === 'faq' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4">Questions fréquentes</h3>
                                    <p className="text-muted mb-5">Tout ce que vous devez savoir pour commander sereinement.</p>

                                    <Accordion className="custom-help-accordion mt-4">
                                        <Accordion.Item eventKey="0" className="border-0 mb-3">
                                            <Accordion.Header className="rounded-4">Comment payer mon panier ?</Accordion.Header>
                                            <Accordion.Body className="text-muted">
                                                Vous pouvez régler vos achats via votre portefeuille électronique TRYMYDAY, par carte bancaire, ou en espèces à la livraison selon les zones.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1" className="border-0 mb-3">
                                            <Accordion.Header className="rounded-4">Quels sont les délais de livraison ?</Accordion.Header>
                                            <Accordion.Body className="text-muted">
                                                Les livraisons standards prennent généralement entre 24h et 72h. Vous recevez une notification à chaque étape via votre centre de messages.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2" className="border-0 mb-3">
                                            <Accordion.Header className="rounded-4">Mes données sont-elles protégées ?</Accordion.Header>
                                            <Accordion.Body className="text-muted">
                                                Oui, la sécurité est notre priorité. Toutes les transactions sont cryptées et nous ne stockons jamais vos informations bancaires complètes.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </div>
                            )}

                            {/* Community Content */}
                            {activeTab === 'community' && (
                                <div className="fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-5">
                                        <h3 className="fw-bold mb-0">Communauté Q&A</h3>
                                        <Button
                                            variant="dark"
                                            size="sm"
                                            className="rounded-pill px-4"
                                            onClick={() => document.getElementById('q-form').scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            Poser une question
                                        </Button>
                                    </div>

                                    <div className="approved-list mb-5">
                                        {helpQuestions.filter(q => q.status === 'approved').length > 0 ? (
                                            helpQuestions.filter(q => q.status === 'approved').map(q => (
                                                <Card key={q.id} className="border-0 bg-light mb-4" style={{ borderRadius: '20px' }}>
                                                    <Card.Body className="p-4">
                                                        <div className="d-flex justify-content-between mb-3">
                                                            <div className="fw-bold" style={{ color: '#2c3e50', fontSize: '1.1rem' }}>Q: {q.question}</div>
                                                            <span className="text-muted small">{q.date}</span>
                                                        </div>
                                                        <div className="d-flex">
                                                            <div className="bg-orange p-1 rounded-circle me-3 mt-1" style={{ width: '8px', height: '8px', flexShrink: 0 }}></div>
                                                            <p className="text-muted mb-0">{q.answer}</p>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="bi bi-chat-quote fs-1 opacity-25"></i>
                                                <p className="mt-3 text-muted">Pas encore de questions publiques.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div id="q-form" className="p-4 p-lg-5 bg-light rounded-5 mt-5">
                                        <h4 className="fw-bold mb-3">Votre question n'est pas listée ?</h4>
                                        <p className="text-muted small mb-4">Posez-la nous via ce formulaire. Un admin y répondra publiquement.</p>

                                        <Form onSubmit={handleSubmitQuestion}>
                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <Form.Control
                                                        placeholder="Votre nom"
                                                        className="border-0 p-3 rounded-4"
                                                        value={userName}
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        required
                                                    />
                                                </Col>
                                                <Col md={12} className="mb-3">
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        placeholder="Votre question précise..."
                                                        className="border-0 p-3 rounded-4"
                                                        value={userQuestion}
                                                        onChange={(e) => setUserQuestion(e.target.value)}
                                                        required
                                                    />
                                                </Col>
                                            </Row>
                                            <Button variant="dark" type="submit" className="w-100 py-3 rounded-4 fw-bold mt-2 shadow-sm">
                                                Envoyer pour modération
                                            </Button>
                                        </Form>
                                        {showSuccess && (
                                            <div className="mt-4 p-3 bg-success bg-opacity-10 text-success rounded-4 small fade-in d-flex align-items-center">
                                                <i className="bi bi-check-circle-fill me-2"></i> Question envoyée avec succès !
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Contact Content */}
                            {activeTab === 'contact' && (
                                <div className="fade-in text-center py-4">
                                    <h3 className="fw-bold mb-4">Parler à un de nos agents</h3>
                                    <p className="text-muted mb-5">Nous sommes disponibles 6j/7 pour vous assister en direct.</p>

                                    <Row className="g-4 justify-content-center">
                                        {contactMethods.map((m, idx) => (
                                            <Col key={idx} md={4}>
                                                <Card className="h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '25px' }}>
                                                    <Card.Body className="p-4">
                                                        <div className="mb-3 d-inline-flex p-4 rounded-circle" style={{ backgroundColor: `${m.color}15` }}>
                                                            <i className={`bi ${m.icon} fs-1`} style={{ color: m.color }}></i>
                                                        </div>
                                                        <h5 className="fw-bold mb-3">{m.title}</h5>
                                                        <Button
                                                            variant="dark"
                                                            href={m.link}
                                                            className="w-100 rounded-pill py-2 fw-bold"
                                                            style={{ backgroundColor: m.color, borderColor: m.color }}
                                                        >
                                                            {m.action}
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .fade-in { animation: fadeIn 0.4s ease forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .text-orange { color: #ff6000; }
                .bg-orange { background-color: #ff6000; }
                .bg-orange-light { background-color: rgba(255, 96, 0, 0.1); }
                .hover-lift { transition: transform 0.3s ease; }
                .hover-lift:hover { transform: translateY(-8px); }
                .custom-help-accordion .accordion-button {
                    background-color: #f8f9fa;
                    border: 1px solid #eee;
                    border-radius: 12px !important;
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .custom-help-accordion .accordion-button:not(.collapsed) {
                    color: #ff6000;
                    background-color: #fff;
                    border-color: #ff6000;
                    box-shadow: none;
                }
                .min-vh-75 { min-height: 75vh; }
            `}</style>
        </div>
    );
};

export default Help;
