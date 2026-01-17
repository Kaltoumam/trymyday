import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';

const UserInfo = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setError('Les mots de passe ne correspondent pas');
                return;
            }
            if (formData.newPassword.length < 6) {
                setError('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }
        }

        const updatedUser = {
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };

        if (updateUser) {
            updateUser(updatedUser);
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        setFormData({
            ...formData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    return (
        <ProfileLayout>
            <div className="mb-4">
                <h3 className="fw-bold">Informations utilisateur</h3>
                <p className="text-muted">Gérez vos informations personnelles</p>
            </div>

            {showSuccess && (
                <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
                    Vos informations ont été mises à jour avec succès !
                </Alert>
            )}

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4">Informations personnelles</h5>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nom complet *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+90 XXX XXX XX XX"
                            />
                        </Form.Group>

                        <hr className="my-4" />

                        <h5 className="fw-bold mb-4">Changer le mot de passe</h5>
                        <p className="text-muted small mb-3">
                            Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe
                        </p>

                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe actuel</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Entrez votre mot de passe actuel"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nouveau mot de passe</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 caractères"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Retapez le mot de passe"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mt-4">
                            <Button variant="outline-secondary" onClick={() => navigate('/profile')}>
                                Retour
                            </Button>
                            <Button variant="warning" type="submit" className="text-white fw-bold px-4">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-3">Informations du compte</h5>
                    <div className="bg-light p-3 rounded">
                        <Row>
                            <Col md={6} className="mb-2">
                                <small className="text-muted d-block">ID Utilisateur</small>
                                <strong className="small">{user?.id || 'N/A'}</strong>
                            </Col>
                            <Col md={6} className="mb-2">
                                <small className="text-muted d-block">Date d'inscription</small>
                                <strong className="small">
                                    {user?.createdAt || new Date().toLocaleDateString('fr-FR')}
                                </strong>
                            </Col>
                            <Col md={6}>
                                <small className="text-muted d-block">Type de compte</small>
                                <strong className="small">{user?.role === 'admin' ? 'Administrateur' : 'Client'}</strong>
                            </Col>
                            <Col md={6}>
                                <small className="text-muted d-block">Statut</small>
                                <strong className="small text-success">Actif</strong>
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>
        </ProfileLayout>
    );
};

export default UserInfo;
