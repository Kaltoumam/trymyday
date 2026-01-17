import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminFinance = () => {
    const { expenses, addExpense, deleteExpense, updateExpense, orders, products } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'manager') {
            navigate('/admin');
        }
    }, [user, navigate]);

    if (user?.role === 'manager') return null;
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Général',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Stock', 'Marketing', 'Logistique', 'Loyer', 'Salaires', 'Outils IT', 'Général'];

    const totalRevenue = (orders || []).reduce((acc, o) => acc + (o.total || 0), 0);

    const totalExpenses = (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const grossProfit = totalRevenue;
    const netProfit = grossProfit - totalExpenses;

    const handleClose = () => {
        setShowModal(false);
        setEditingExpense(null);
        setFormData({
            description: '',
            amount: '',
            category: 'Général',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleShow = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                date: expense.date
            });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: Number(formData.amount)
        };

        if (editingExpense) {
            updateExpense(editingExpense.id, data);
        } else {
            addExpense(data);
        }
        handleClose();
    };

    return (
        <div className="p-1">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestion Financière</h2>
                <Button
                    variant="primary"
                    onClick={() => handleShow()}
                    className="d-flex align-items-center"
                    style={{ background: '#ef9c52ff', borderColor: '#ef9c52ff' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Ajouter une dépense
                </Button>
            </div>

            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <Card.Body>
                            <h6 className="opacity-90">Chiffre d'Affaires</h6>
                            <h3 className="fw-bold mb-0">{totalRevenue.toLocaleString()} FCFA</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}>
                        <Card.Body>
                            <h6 className="opacity-90">Investissement</h6>
                            <h3 className="fw-bold mb-0">{grossProfit.toLocaleString()} FCFA</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <Card.Body>
                            <h6 className="opacity-90">Charges Fixes</h6>
                            <h3 className="fw-bold mb-0">{totalExpenses.toLocaleString()} FCFA</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-white" style={{ background: netProfit >= 0 ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' }}>
                        <Card.Body>
                            <h6 className="opacity-90">Bénéfice Net</h6>
                            <h3 className="fw-bold mb-0">{netProfit.toLocaleString()} FCFA</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0">Historique des Dépenses</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Description</th>
                                    <th>Catégorie</th>
                                    <th>Montant</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            Aucune dépense enregistrée
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map(expense => (
                                        <tr key={expense.id}>
                                            <td className="ps-4 small">{expense.date}</td>
                                            <td className="fw-medium">{expense.description}</td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border">
                                                    {expense.category}
                                                </Badge>
                                            </td>
                                            <td className="fw-bold text-danger">-{Number(expense.amount).toLocaleString()} FCFA</td>
                                            <td className="text-end pe-4">
                                                <Button
                                                    variant="link"
                                                    className="text-primary p-0 me-3"
                                                    onClick={() => handleShow(expense)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0"
                                                    onClick={() => deleteExpense(expense.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="ex: Facture électricité, Achat stock..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Montant (FCFA)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Catégorie</Form.Label>
                            <Form.Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={handleClose}>Annuler</Button>
                        <Button variant="primary" type="submit" style={{ background: '#ef9c52ff', borderColor: '#ef9c52ff' }}>
                            {editingExpense ? 'Mettre à jour' : 'Enregistrer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminFinance;
