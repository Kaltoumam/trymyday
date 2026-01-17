import { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await register(name, email, password);
            if (success) {
                navigate('/profile/orders');
            } else {
                setError('Erreur lors de l’inscription. Cet email est peut-être déjà utilisé.');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '450px' }} className="shadow-lg border-0">
                <Card.Body className="p-5">
                    <h2 className="text-center mb-4 fw-bold">Inscription</h2>

                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold" style={{ fontSize: '1.1rem' }}>Nom complet</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Jean Dupont"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold" style={{ fontSize: '1.1rem' }}>Adresse Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold" style={{ fontSize: '1.1rem' }}>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Choisissez un mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Button
                            variant="warning"
                            type="submit"
                            className="w-100 py-3 fw-bold mb-3 text-white d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '10px', fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Création du compte...
                                </>
                            ) : "S'inscrire"}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <small className="text-muted">Déjà un compte ? <Link to="/login" className="fw-bold text-warning">Connexion</Link></small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;
