import React, { useRef } from 'react';
import { Container, Button, Carousel, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const { products } = useData();
    const { user } = useAuth();
    const { NoTranslate } = useLanguage();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const categories = [
        { name: 'Femme', image: '/assets/category_mode_1766034946780.png', link: '/shop?cat=Femme', icon: 'bi-person-heart' },
        { name: 'Homme', image: '/assets/cat_homme.png', link: '/shop?cat=Homme', icon: 'bi-person-check' },
        { name: 'Enfant', image: '/assets/cat_enfant.png', link: '/shop?cat=Enfant', icon: 'bi-smartwatch' },
        { name: 'Maison', image: '/assets/cat_maison.png', link: '/shop?cat=Maison %26 Meuble', icon: 'bi-house' },
        { name: 'Cosmétique', image: '/assets/cat_cosmetique.png', link: '/shop?cat=Cosmétique', icon: 'bi-magic' },
        { name: 'Chaussures', image: '/assets/cat_chaussures.png', link: '/shop?cat=Chaussures', icon: 'bi-bag-dash' },
        { name: 'Sacs', image: '/assets/cat_sacs.png', link: '/shop?cat=Sacs', icon: 'bi-handbag' },
        { name: 'Électronique', image: '/assets/category_tech_1766034965148.png', link: '/shop?cat=Électronique', icon: 'bi-laptop' },
    ];

    const brands = [
        { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
        { name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg' },
        { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        { name: 'Samsung', logo: 'https://logodix.com/logo/5010.gif' },
        { name: 'LC Waikiki', logo: 'https://www.capsacrecoeur.re/media/enseignes/logo/logo-lcw-512x2432-page-0001.jpg' },
        { name: 'DeFacto', logo: 'https://i.ytimg.com/vi/a0TATeKpWP4/maxresdefault.jpg' },
        { name: 'Flo', logo: 'https://i3.kuponla.com/wp-content/uploads/2019/12/flo-guncel-indirim-kuponlari-KUPONLACOM.jpg' },
        { name: 'Gratis', logo: 'https://th.bing.com/th/id/R.378025d751a1c477acea1d823881ea70?rik=SQyfcSp%2fJsZ2Jw&riu=http%3a%2f%2f3.bp.blogspot.com%2f-g-EVGo9KnRM%2fVJlFMqWLXuI%2fAAAAAAAAFnE%2fhwEjqE6oqgs%2fs1600%2fGratis-870x350.jpg&ehk=B%2b4zSKUaiGgk34Yg1gBB66eAdxFr6ybrEm1uQRwZx7c%3d&risl=&pid=ImgRaw&r=0' },
        { name: 'Watsons', logo: 'https://tse2.mm.bing.net/th/id/OIP.yd-tbxLLhTiVK3qLjU1UgQAAAA?w=300&h=59&rs=1&pid=ImgDetMain&o=7&rm=3' },
        { name: 'Gucci', logo: 'https://tse2.mm.bing.net/th/id/OIP.OhvpW9EsnRviqrFasMoenQHaBy?w=860&h=208&rs=1&pid=ImgDetMain&o=7&rm=3' },
        { name: 'Dior', logo: 'https://tse4.mm.bing.net/th/id/OIP.BHA8sdXscHDNjtn1ha-uxwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3' },
        { name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
    ];

    const brandCampaigns = [
        {
            brand: 'LC Waikiki',
            logo: 'https://www.capsacrecoeur.re/media/enseignes/logo/logo-lcw-512x2432-page-0001.jpg',
            slogan: 'Style de Saison pour Tous',
            bgColor: '#F47B4E',
            products: [
                { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80', price: '4500 FCFA' },
                { img: 'https://images.unsplash.com/photo-1539109132314-347f854181f0?auto=format&fit=crop&w=400&q=80', price: '3200 FCFA' }
            ]
        },
        {
            brand: 'DeFacto',
            logo: 'https://i.ytimg.com/vi/a0TATeKpWP4/maxresdefault.jpg',
            slogan: 'Nouveau Look, Nouveau Vous',
            bgColor: '#9B6B9D',
            products: [
                { img: 'https://images.unsplash.com/photo-1488161628813-f4460f872be4?auto=format&fit=crop&w=400&q=80', price: '5800 FCFA' },
                { img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', price: '4900 FCFA' }
            ]
        },
        {
            brand: 'Flo',
            logo: 'https://i3.kuponla.com/wp-content/uploads/2019/12/flo-guncel-indirim-kuponlari-KUPONLACOM.jpg',
            slogan: 'Vos Chaussures de Rêve',
            bgColor: '#BC4B5B',
            products: [
                { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', price: '12500 FCFA' },
                { img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80', price: '18000 FCFA' }
            ]
        },
        {
            brand: 'Zara',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg',
            slogan: 'Élégance Contemporaine',
            bgColor: '#4A8B9C',
            products: [
                { img: 'https://images.unsplash.com/photo-1532453288672-3a27e9be4efd?auto=format&fit=crop&w=400&q=80', price: '25000 FCFA' },
                { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80', price: '35000 FCFA' }
            ]
        },
        {
            brand: 'Gratis',
            logo: 'https://th.bing.com/th/id/R.378025d751a1c477acea1d823881ea70?rik=SQyfcSp%2fJsZ2Jw&riu=http%3a%2f%2f3.bp.blogspot.com%2f-g-EVGo9KnRM%2fVJlFMqWLXuI%2fAAAAAAAAFnE%2fhwEjqE6oqgs%2fs1600%2fGratis-870x350.jpg&ehk=B%2b4zSKUaiGgk34Yg1gBB66eAdxFr6ybrEm1uQRwZx7c%3d&risl=&pid=ImgRaw&r=0',
            slogan: 'Prenez Soin de Vous',
            bgColor: '#E57373',
            products: [
                { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&w=400&q=80', price: '2500 FCFA' },
                { img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80', price: '4500 FCFA' }
            ]
        },
        {
            brand: 'Apple',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
            slogan: 'L\'Innovation à l\'État Pur',
            bgColor: '#607D8B',
            products: [
                { img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80', price: '650.000 FCFA' },
                { img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', price: '950.000 FCFA' }
            ]
        }
    ];

    const featuredProducts = products.slice(0, 6);

    return (
        <div className="home-page" style={{
            fontFamily: '"Segoe UI", Roboto, sans-serif',
            backgroundColor: '#fff',
            scrollBehavior: 'smooth'
        }}>
            {/* --- 1. CIRCULAR CATEGORY NAVIGATION  --- */}
            <div className="category-scroll-container py-1 border-bottom shadow-sm bg-white sticky-top" style={{ zIndex: 1020, top: '1px' }}>
                <Container>
                    <div className="d-flex justify-content-center overflow-auto gap-3 py-1 no-scrollbar scroll-pill-container" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                to={cat.link}
                                className="text-decoration-none text-center d-flex flex-column align-items-center gap-1 group category-pill-item"
                                style={{ minWidth: '75px' }}
                            >
                                <div className="category-circle-wrapper position-relative p-1 rounded-circle border border-2 border-warning hover-scale"
                                    style={{ width: '64px', height: '64px', transition: 'all 0.3s ease' }}>
                                    <div className="rounded-circle overflow-hidden w-100 h-100 border">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-100 h-100 object-fit-cover transition-transform"
                                        />
                                    </div>
                                </div>
                                <span className="small fw-bold text-dark text-nowrap" style={{ fontSize: '0.78rem' }}>{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </Container>
            </div>

            {/* --- 2. DUAL TOP CAROUSELS --- */}
            <Container className="py-2 mb-4">
                <Row className="g-3">
                    {/* Left Carousel: Femme Focus */}
                    <Col md={6}>
                        <div className="rounded-4 overflow-hidden shadow-sm position-relative" style={{ height: '380px' }}>
                            <Carousel interval={5000} fade className="h-100 mini-hero">
                                <Carousel.Item className="h-100">
                                    <div className="h-100 w-100 position-relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1591085686350-798c0f9faf7c?auto=format&fit=crop&w=1000&q=80"
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Mode Femme"
                                            style={{ objectPosition: 'center 20%' }}
                                        />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <span className="badge bg-warning mb-2">MODE FEMME</span>
                                            <h3 className="text-white fw-bold mb-2">ÉLÉGANCE AU FÉMININ</h3>
                                            <Link to="/shop?cat=Femme" className="text-white text-decoration-none small fw-bold">DÉCOUVRIR →</Link>
                                        </div>
                                    </div>
                                </Carousel.Item>
                                <Carousel.Item className="h-100">
                                    <div className="h-100 w-100 position-relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Maison"
                                        />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <span className="badge bg-info mb-2">MAISON</span>
                                            <h3 className="text-white fw-bold mb-2">DÉCO & STYLE</h3>
                                            <Link to="/shop?cat=Maison" className="text-white text-decoration-none small fw-bold">EXPLORER →</Link>
                                        </div>
                                    </div>
                                </Carousel.Item>
                            </Carousel>
                        </div>
                    </Col>

                    {/* Right Carousel: Homme & Tech Focus */}
                    <Col md={6}>
                        <div className="rounded-4 overflow-hidden shadow-sm position-relative" style={{ height: '380px' }}>
                            <Carousel interval={5500} fade className="h-100 mini-hero">
                                <Carousel.Item className="h-100">
                                    <div className="h-100 w-100 position-relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80"
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Mode Homme"
                                            style={{ objectPosition: 'center 10%' }}
                                        />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <span className="badge bg-primary mb-2">MODE HOMME</span>
                                            <h3 className="text-white fw-bold mb-2">STYLE MODERNE</h3>
                                            <Link to="/shop?cat=Homme" className="text-white text-decoration-none small fw-bold">DÉCOUVRIR →</Link>
                                        </div>
                                    </div>
                                </Carousel.Item>
                                <Carousel.Item className="h-100">
                                    <div className="h-100 w-100 position-relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80"
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Technologie"
                                        />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <span className="badge bg-info mb-2">NOUVEAUTÉS TECH</span>
                                            <h3 className="text-white fw-bold mb-2">INNOVATION</h3>
                                            <Link to="/shop?cat=Électronique" className="text-white text-decoration-none small fw-bold">VOIR PLUS →</Link>
                                        </div>
                                    </div>
                                </Carousel.Item>
                            </Carousel>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* --- 4. FEATURED PRODUCTS (HORIZONTAL SLIDER STYLE) --- */}
            <Container className="mb-5 py-4 position-relative">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0 border-start border-4 border-warning ps-3" style={{ fontSize: '1.5rem' }}>Les plus aimés</h3>
                    <Link to="/shop" className="text-warning fw-bold text-decoration-none small">Voir Tout →</Link>
                </div>

                <div className="position-relative slider-wrapper px-md-2">
                    {/* Navigation Arrows */}
                    <Button
                        variant="white"
                        className="position-absolute start-0 top-50 translate-middle-y shadow-sm rounded-circle d-none d-md-flex align-items-center justify-content-center border hover-scale"
                        style={{ zIndex: 10, width: '45px', height: '45px', left: '-25px' }}
                        onClick={() => scroll('left')}
                    >
                        <i className="bi bi-chevron-left text-dark"></i>
                    </Button>

                    <div
                        ref={scrollRef}
                        className="d-flex overflow-auto gap-3 pb-3 no-scrollbar px-1"
                        style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
                    >
                        {featuredProducts.map((product) => (
                            <div key={product.id} style={{ minWidth: '220px', scrollSnapAlign: 'start' }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="white"
                        className="position-absolute end-0 top-50 translate-middle-y shadow-sm rounded-circle d-none d-md-flex align-items-center justify-content-center border hover-scale"
                        style={{ zIndex: 10, width: '45px', height: '45px', right: '-25px' }}
                        onClick={() => scroll('right')}
                    >
                        <i className="bi bi-chevron-right text-dark"></i>
                    </Button>
                </div>
            </Container>


            {/* --- 6. BRAND CAMPAIGN BANNERS (Trendyol Style) --- */}
            <Container className="mb-5 pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0 border-start border-4 border-warning ps-3" style={{ fontSize: '1.5rem' }}>Destinations de Marques</h3>
                </div>
                <Row className="g-4">
                    {brandCampaigns.map((campaign, idx) => (
                        <Col key={idx} lg={4} md={6}>
                            <div
                                className="campaign-card d-flex rounded-4 overflow-hidden shadow-sm border h-100"
                                style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                                onClick={() => navigate(`/shop?brand=${encodeURIComponent(campaign.brand)}`)}
                            >
                                {/* Left: Product Previews */}
                                <div className="d-flex p-2 bg-white gap-2 align-items-center justify-content-center" style={{ width: '60%' }}>
                                    {campaign.products.map((p, i) => (
                                        <div key={i} className="text-center">
                                            <div className="rounded-3 overflow-hidden border" style={{ width: '85px', height: '110px' }}>
                                                <img src={p.img} alt="product" className="w-100 h-100 object-fit-cover" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right: Brand & Slogan */}
                                <div
                                    className="d-flex flex-column justify-content-center p-3 text-white text-center pb-4"
                                    style={{ width: '40%', backgroundColor: campaign.bgColor }}
                                >
                                    <div className="bg-white rounded-3 p-1 mb-3 d-flex align-items-center justify-content-center" style={{ height: '50px' }}>
                                        <img src={campaign.logo} alt={campaign.brand} className="mw-100 mh-100 object-fit-contain" />
                                    </div>
                                    <h6 className="fw-bold mb-0 lh-sm" style={{ fontSize: '0.85rem' }}>{campaign.slogan}</h6>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* --- 7. SIMPLE LOGO LIST (Refined) --- */}
            <Container className="mb-5 pb-4">
                <div className="d-flex flex-wrap justify-content-center gap-4 py-2 border-top pt-4 grayscale-img" style={{ opacity: 0.5 }}>
                    {brands.map((brand, idx) => (
                        <img
                            key={idx}
                            src={brand.logo}
                            alt={brand.name}
                            style={{ height: '25px', width: 'auto', objectFit: 'contain' }}
                            title={brand.name}
                        />
                    ))}
                </div>
            </Container>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .category-circle-wrapper:hover {
                    border-color: #ffc107 !important;
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(255,193,7,0.3);
                }
                
                .category-circle-wrapper img { transition: transform 0.5s ease; }
                .category-pill-item:hover img { transform: scale(1.15); }

                .hover-scale-btn {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .hover-scale-btn:hover {
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .hover-scale-img img {
                    transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .hover-scale-img:hover img {
                    transform: scale(1.08);
                }
                
                .boutique-banner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(rgba(0,0,0,0.4), transparent);
                    pointer-events: none;
                }

                .backdrop-blur {
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }

                .text-shadow {
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .main-hero-carousel .carousel-control-prev,
                .main-hero-carousel .carousel-control-next {
                    width: 5%;
                }

                @keyframes slideRight {
                    from { transform: translateX(-50px) translateY(-50%); opacity: 0; }
                    to { transform: translateX(0) translateY(-50%); opacity: 1; }
                }
                .animate-slide-right { animation: slideRight 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }

                @keyframes slideLeft {
                    from { transform: translateX(50px) translateY(-50%); opacity: 0; }
                    to { transform: translateX(0) translateY(-50%); opacity: 1; }
                }
                .animate-slide-left { animation: slideLeft 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
                
                .mini-hero .carousel-indicators [data-bs-target] {
                    width: 25px;
                    height: 2px;
                    margin: 0 3px;
                }
                .mini-hero .carousel-control-prev, 
                .mini-hero .carousel-control-next {
                    width: 10%;
                }

                .brand-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                    border-color: #ffc107 !important;
                }

                .grayscale-img {
                    filter: grayscale(100%);
                    opacity: 0.6;
                    transition: all 0.3s ease;
                }

                .brand-card:hover .grayscale-img {
                    filter: grayscale(0%);
                    opacity: 1;
                    transform: scale(1.05);
                }

                .campaign-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.12) !important;
                }
            `}</style>
        </div >
    );
};

export default Home;
