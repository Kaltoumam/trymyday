import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Favorites = () => {
    const { favorites } = useFavorites();
    const { products } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!user) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="light" className="border">
                    <Alert.Heading>Connexion requise</Alert.Heading>
                    <p>Vous devez être connecté pour voir vos favoris.</p>
                    <Button variant="warning" className="text-white" onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                </Alert>
            </Container>
        );
    }

    // Get favorite products
    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
        <Container className="py-5" style={{ minHeight: '70vh' }}>
            <h2 className="mb-4 fw-bold">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                Mes Favoris ({favoriteProducts.length})
            </h2>

            {favoriteProducts.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-heart" style={{ fontSize: '5rem', color: '#ddd' }}></i>
                    <h3 className="mt-4 text-muted">Aucun favori pour le moment</h3>
                    <p className="text-muted mb-4">Ajoutez des produits à vos favoris en cliquant sur le cœur ❤️</p>
                    <Button variant="warning" className="text-white fw-bold" onClick={() => navigate('/shop')}>
                        Découvrir nos produits
                    </Button>
                </div>
            ) : (
                <Row className="g-4">
                    {favoriteProducts.map(product => (
                        <Col key={product.id} xs={6} sm={4} md={3} lg={3}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}

            <style>
                {`
                    .hover-effect:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                        transition: all 0.3s ease;
                    }
                `}
            </style>
        </Container>
    );
};

export default Favorites;
