import { useState } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Fonction pour générer un ID unique (identique à AuthContext)
const generateUserId = () => {
    const chars = '0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const AdminUsers = () => {
    const { users, setUsers } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.role === 'expediteur' || user?.role === 'manager') {
        navigate('/admin');
        return null;
    }
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'client'
    });

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Open modal for creating new user
    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'client'
        });
        setShowModal(true);
    };

    // Open modal for editing user
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'client'
        });
        setShowModal(true);
    };

    // Save user (create or update)
    const handleSave = () => {
        if (!formData.name || !formData.email) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (editingUser) {
            // Update existing user
            const updatedUsers = users.map(u =>
                u.email === editingUser.email
                    ? {
                        ...u,
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        ...(formData.password && { password: formData.password })
                    }
                    : u
            );
            setUsers(updatedUsers);
            alert('Utilisateur modifié avec succès !');
        } else {
            // Create new user
            if (!formData.password) {
                alert('Le mot de passe est obligatoire pour un nouveau compte');
                return;
            }

            // Check if email already exists
            if (users.some(u => u.email === formData.email)) {
                alert('Cet email est déjà utilisé');
                return;
            }

            const newUser = {
                id: generateUserId(),
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                joined: new Date().toISOString().split('T')[0],
                balance: 0,
                avatar: '👤'
            };
            setUsers([...users, newUser]);
            alert('Utilisateur créé avec succès !');
        }

        setShowModal(false);
    };

    // Delete user
    const handleDelete = (user) => {
        if (user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
            alert('Impossible de supprimer le dernier administrateur !');
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
            setUsers(users.filter(u => u.email !== user.email));
            alert('Utilisateur supprimé avec succès !');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Gestion des Clients</h4>
                <Button variant="primary" onClick={handleCreate}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Nouveau Client
                </Button>
            </div>

            {/* Search and Filter */}
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">Tous les rôles</option>
                        <option value="client">Clients</option>
                        <option value="admin">Administrateurs</option>
                        <option value="manager">Managers</option>
                        <option value="expediteur">Expéditeurs</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3">Aucun utilisateur trouvé</p>
                </div>
            ) : (
                <Table hover responsive>
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Inscrit le</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user.email}>
                                <td>{user.id || index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td>
                                    {user.joined ? (
                                        new Date(user.joined).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })
                                    ) : 'Date inconnue'}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(user)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(user)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingUser ? 'Modifier l\'utilisateur' : 'Nouveau utilisateur'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom complet *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Jean Dupont"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="jean@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!!editingUser}
                            />
                            {editingUser && (
                                <Form.Text className="text-muted">
                                    L'email ne peut pas être modifié
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Mot de passe {!editingUser && '*'}
                            </Form.Label>
                            <Form.Control
                                type="password"
                                placeholder={editingUser ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rôle *</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="client">Client</option>
                                <option value="admin">Administrateur</option>
                                <option value="manager">Manager</option>
                                <option value="expediteur">Expéditeur</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editingUser ? 'Modifier' : 'Créer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminUsers;
