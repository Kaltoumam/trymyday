import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/profile/orders');
            } else {
                setError('Email ou mot de passe incorrect');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }} className="shadow-lg border-0">
                <Card.Body className="p-5">
                    <h2 className="text-center mb-4 fw-bold">Connexion</h2>

                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
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

                        <Form.Group className="mb-4" controlId="formBasicPassword">
                            <Form.Label className="fw-bold" style={{ fontSize: '1.1rem' }}>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Mot de passe"
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
                                    Connexion...
                                </>
                            ) : 'Se connecter'}
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <small className="text-muted">Pas encore de compte ? <Link to="/register" className="fw-bold text-warning">Inscription</Link></small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
