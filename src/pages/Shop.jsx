import { Container, Row, Col, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useData, CATEGORIES } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import { useLocation, Link } from 'react-router-dom';

const Shop = () => {
    const { products } = useData();
    const location = useLocation();

    // Get params from URL
    const queryParams = new URLSearchParams(location.search);
    const catParam = queryParams.get('cat');
    const subParam = queryParams.get('sub');
    const brandParam = queryParams.get('brand');

    const [filter, setFilter] = useState(catParam || 'All');
    const [subFilter, setSubFilter] = useState(subParam || 'All');
    const [brandFilter, setBrandFilter] = useState(brandParam || 'All');

    // Sync state with URL params
    useEffect(() => {
        setFilter(catParam || 'All');
        setSubFilter(subParam || 'All');
        setBrandFilter(brandParam || 'All');
    }, [catParam, subParam, brandParam]);

    const filteredProducts = products.filter(p => {
        const matchesCat = filter === 'All' || p.category === filter;
        const matchesSub = subFilter === 'All' || p.subcategory === subFilter;
        const matchesBrand = brandFilter === 'All' || (p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase());
        return matchesCat && matchesSub && matchesBrand;
    });

    const categoryList = ['All', ...Object.keys(CATEGORIES)];

    return (
        <Container className="py-3">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
                <div>
                    <h1 className="fw-bold mb-0 fs-2">
                        {brandFilter !== 'All' ? `Produits ${brandFilter}` : (filter === 'All' ? 'Tous nos produits' : (subFilter === 'All' ? filter : subFilter))}
                    </h1>
                    <p className="text-muted mb-0 small">{filteredProducts.length} produits trouvés</p>
                </div>


            </div>

            <Row className="g-4">
                {filteredProducts.map(product => (
                    <Col key={product.id} xs={6} sm={4} md={3} lg={2}>
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>

            {filteredProducts.length === 0 && (
                <div className="text-center py-5">
                    <h3 className="text-muted">Aucun produit trouvé dans cette catégorie.</h3>
                </div>
            )}
        </Container>
    );
};

export default Shop;
