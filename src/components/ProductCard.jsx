import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ product }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { user } = useAuth();
    const { NoTranslate } = useLanguage();
    const navigate = useNavigate();
    const favorite = isFavorite(product.id);

    const orangeAccent = '#f1823dff';

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/register', { state: { from: `/product/${product.id}`, message: 'Inscrivez-vous pour ajouter des produits à vos favoris !' } });
            return;
        }

        toggleFavorite(product.id);
    };

    return (
        <Card
            className="h-100 border-0 shadow-sm hover-up transition-all position-relative"
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
        >
            {/* Heart Icon (Floating) */}
            <div
                className="position-absolute top-0 end-0 p-2"
                style={{ zIndex: 10 }}
                onClick={handleFavoriteClick}
            >
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '30px', height: '30px', border: '1px solid #f0f0f0' }}>
                    <i className={`bi ${favorite ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`} style={{ fontSize: '0.9rem' }}></i>
                </div>
            </div>

            {/* Product Image Wrapper (Taller Vertical Ratio) */}
            <div style={{ height: '280px', overflow: 'hidden', backgroundColor: '#fcfcfc' }}>
                <Card.Img
                    variant="top"
                    src={product.image || (product.images && product.images[0]) || '/assets/category_tech_1766034965148.png'}
                    alt={product.name}
                    style={{ height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/category_tech_1766034965148.png'; }}
                />

                {/* Bottom Image Banner (Status) - Only show for Limited Stock */}
                {product.stock > 0 && product.stock < 5 && (
                    <div className="position-absolute bottom-0 start-0 w-100 py-1"
                        style={{
                            backgroundColor: 'rgba(235, 64, 52, 0.9)',
                            transform: 'translateY(-100%)',
                            textAlign: 'center',
                            fontSize: '0.7rem',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                        <span className="text-white">
                            <i className="bi bi-lightning-fill me-1"></i>
                            STOCK LIMITÉ
                        </span>
                    </div>
                )}
            </div>

            <Card.Body className="px-2 pt-3 pb-2">
                {/* Product Name (Bold) */}
                <div className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                    {product.name}
                </div>

                {/* Category (Lighter weight) */}
                <div className="mb-1 text-muted text-truncate" style={{ fontSize: '0.75rem', fontWeight: '400' }}>
                    {product.category}
                </div>

                {/* Star Rating Row */}
                <div className="d-flex align-items-center gap-1 mb-2">
                    <span className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>4.5</span>
                    <div className="d-flex text-warning" style={{ fontSize: '0.65rem' }}>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-half"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>(12)</span>
                </div>

                {/* Price */}
                <div className="fw-bold" style={{ color: orangeAccent, fontSize: '0.95rem' }}>
                    <NoTranslate>{product.price.toLocaleString()} FCFA</NoTranslate>
                </div>
            </Card.Body>

            <style>{`
                .transition-all {
                    transition: all 0.25s ease-in-out;
                }
                .hover-up:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </Card>
    );
};

export default ProductCard;
