import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Badge, Nav, InputGroup, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useData, CATEGORIES } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';

import { useCart } from '../context/CartContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { language, setLanguage } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSidebarCat, setActiveSidebarCat] = useState('Femme');
    const [showSidebarMenu, setShowSidebarMenu] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowSidebarMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const handleSearch = (e) => {
        e.preventDefault();
        // Placeholder pour la recherche réelle
    };

    return (
        <header className="bg-white shadow-sm" style={{ zIndex: 1040 }}>

            {/* Main Header Row */}
            <div className="py-2">
                <Container className="navbar-container">
                    <Row className="align-items-center g-2">
                        {/* Logo Column */}
                        <Col lg={2} md={2} xs={6}>
                            <Link to="/" className="text-dark text-decoration-none d-flex align-items-center">
                                <h1 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-1.5px', fontSize: '1.6rem' }}>
                                    TRYMYDAY
                                </h1>
                            </Link>
                        </Col>

                        {/* Search Bar Column - Dominant & Expanded */}
                        <Col lg={6} md={6} className="d-none d-md-block px-lg-3">
                            <Form onSubmit={handleSearch}>
                                <div className="d-flex bg-light rounded-2 border p-1 search-wrapper transition-all">
                                    <Form.Control
                                        type="text"
                                        placeholder="Que recherchez-vous aujourd'hui ?"
                                        className="bg-transparent border-0 shadow-none px-3 py-1"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ fontSize: '0.82rem' }}
                                    />
                                    <Button
                                        type="submit"
                                        className="border-0 px-4 rounded-2 transition-all d-flex align-items-center"
                                        style={{ backgroundColor: '#ff6000', color: '#fff' }}
                                    >
                                        <i className="bi bi-search fs-6"></i>
                                    </Button>
                                </div>
                            </Form>
                        </Col>

                        {/* Action Column - Compact & Professional */}
                        <Col lg={4} md={4} xs={6} className="d-flex justify-content-end align-items-center gap-1 gap-xl-2">

                            {/* Profile Dropdown */}
                            {user ? (
                                <NavDropdown
                                    align="end"
                                    title={
                                        <div className="d-flex align-items-center action-item px-2 py-1 rounded-2 transition-all">
                                            <i className="bi bi-person fs-4 me-xl-1" style={{ color: '#ff6000' }}></i>
                                            <div className="d-none d-xl-flex flex-column text-start" style={{ lineHeight: '1' }}>
                                                <span className="text-muted" style={{ fontSize: '0.5rem' }}>Bonjour,</span>
                                                <span className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>{user.name.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    }
                                    id="user-dropdown"
                                    className="custom-nav-dropdown border-0"
                                >
                                    <NavDropdown.Item as={Link} to="/profile/orders"><i className="bi bi-person-circle me-3 text-warning"></i> Mon Profil</NavDropdown.Item>
                                    {(user.role === 'admin' || user.role === 'manager' || user.role === 'expediteur') && (
                                        <NavDropdown.Item as={Link} to="/admin" className="fw-bold text-primary"><i className="bi bi-speedometer2 me-3"></i> Dashboard</NavDropdown.Item>
                                    )}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logout} className="text-danger"><i className="bi bi-box-arrow-right me-3"></i> Déconnexion</NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <Link to="/login" className="text-dark text-decoration-none d-flex align-items-center action-item px-2 py-1 transition-all">
                                    <i className="bi bi-person fs-4 me-xl-1"></i>
                                    <span className="d-none d-xl-inline fw-bold" style={{ fontSize: '0.75rem' }}>Connexion</span>
                                </Link>
                            )}

                            {/* Favorites Action */}
                            <Link to="/favorites" className="text-dark text-decoration-none d-flex align-items-center action-item px-2 py-1 transition-all">
                                <i className="bi bi-heart fs-4 me-xl-1 text-danger"></i>
                                <span className="d-none d-xl-inline fw-bold" style={{ fontSize: '0.75rem' }}>Favoris</span>
                            </Link>

                            {/* Cart Action */}
                            <Link to="/cart" className="text-dark text-decoration-none d-flex align-items-center action-item px-2 py-1 transition-all">
                                <div className="position-relative me-xl-1">
                                    <i className="bi bi-cart3 fs-5" style={{ color: '#ff6000' }}></i>
                                    <Badge
                                        bg="danger"
                                        pill
                                        className="position-absolute top-0 start-100 translate-middle border border-2 border-white"
                                        style={{ fontSize: '0.45rem', padding: '0.3em 0.4em', backgroundColor: '#ff6000 !important' }}
                                    >
                                        {getCartCount()}
                                    </Badge>
                                </div>
                                <span className="d-none d-xl-inline fw-bold" style={{ fontSize: '0.75rem' }}>Panier</span>
                            </Link>

                            {/* Language Selector */}
                            <NavDropdown
                                align="end"
                                title={
                                    <div className="d-flex align-items-center action-item px-2 py-1 rounded-2 transition-all">
                                        <i className="bi bi-translate fs-5 me-xl-1" style={{ color: '#ff6000' }}></i>
                                        <span className="fw-bold text-dark d-none d-xl-inline" style={{ fontSize: '0.75rem' }}>{language}</span>
                                    </div>
                                }
                                id="language-dropdown"
                                className="custom-nav-dropdown border-0"
                            >
                                <NavDropdown.Item className="small" onClick={() => setLanguage('FR')}><span className="me-2">🇫🇷</span> FR - Français</NavDropdown.Item>
                                <NavDropdown.Item className="small" onClick={() => setLanguage('EN')}><span className="me-2">🇺🇸</span> EN - English</NavDropdown.Item>
                                <NavDropdown.Item className="small" onClick={() => setLanguage('TR')}><span className="me-2">🇹🇷</span> TR - Türkçe</NavDropdown.Item>
                                <NavDropdown.Item className="small" onClick={() => setLanguage('AR')}><span className="me-2">🇸🇦</span> AR - العربية</NavDropdown.Item>
                            </NavDropdown>

                            {/* Help Assistant - Far Right */}
                            <Link to="/help" className="text-dark text-decoration-none d-flex align-items-center action-item px-2 py-1 transition-all rounded-2">
                                <i className="bi bi-telephone fs-4" style={{ color: '#ff6000' }}></i>
                            </Link>

                        </Col>
                    </Row>

                    {/* Mobile Search Bar (visible only below md) */}
                    <div className="d-md-none mt-3">
                        <Form onSubmit={handleSearch}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Que recherchez-vous ?"
                                    className="bg-light border-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button variant="warning" type="submit"><i className="bi bi-search"></i></Button>
                            </InputGroup>
                        </Form>
                    </div>
                </Container>
            </div>

            {/* Category Navigation Bar */}
            <div className="border-bottom bg-white d-none d-lg-block position-relative" style={{ margin: 0, padding: 0 }} ref={menuRef}>
                <Container className="navbar-container">
                    <Nav className="align-items-center">
                        {/* Categories Trigger */}
                        <div
                            className={`categories-trigger py-2 pe-3 me-4 ${showSidebarMenu ? 'active' : ''}`}
                            onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="bi bi-list fs-6 me-2"></i>
                            <span className="fw-bold small">TOUTES LES CATÉGORIES</span>
                        </div>

                        {/* Standard Nav Links */}
                        <Link to="/shop?sort=new" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-dark text-decoration-none">
                            NOUVEAUTÉS
                        </Link>
                        <Link to="/shop" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-dark text-decoration-none">
                            MARQUES
                        </Link>
                        <Link to="/shop?cat=Gifts" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-dark text-decoration-none">
                            IDÉES CADEAUX
                        </Link>
                        <Link to="/shop?cat=Collections" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-dark text-decoration-none">
                            COLLECTIONS
                        </Link>
                        <Link to="/shop?cat=Favorites" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-dark text-decoration-none">
                            COUPS DE CŒUR
                        </Link>
                        <Link to="/shop?cat=Flash" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-decoration-none" style={{ color: '#7b1fad' }}>
                            <i className="bi bi-lightning-fill me-1"></i> OFFRES FLASH
                        </Link>
                        {/* Quick links for common categories */}
                        <Link to="/shop?cat=Best" className="nav-link-item py-2 px-3 text-uppercase small fw-bold text-danger text-decoration-none">
                            <i className="bi bi-fire me-1"></i> MEILLEURES VENTES
                        </Link>
                    </Nav>

                </Container>
                {/* Sidebar Mega Menu Overlay */}
                <div className={`sidebar-mega-menu ${showSidebarMenu ? 'show' : ''}`}>
                    <Container className="navbar-container h-100 p-0 shadow-lg border rounded-bottom bg-white overflow-hidden">
                        <div className="d-flex h-100">
                            {/* Left Side: Sidebar */}
                            <div className="category-sidebar border-end bg-light" style={{ width: '220px' }}>
                                {Object.entries(CATEGORIES).map(([category, data]) => (
                                    <div
                                        key={category}
                                        className={`sidebar-item d-flex align-items-center justify-content-between px-2 py-2 cursor-pointer ${activeSidebarCat === category ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveSidebarCat(category)}
                                        onClick={() => {
                                            navigate(`/shop?cat=${category}`);
                                            setShowSidebarMenu(false);
                                        }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className={`bi ${data.icon} me-3`} style={{ fontSize: '0.9rem' }}></i>
                                            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{category}</span>
                                        </div>
                                        <i className="bi bi-chevron-right opacity-50" style={{ fontSize: '0.7rem' }}></i>
                                    </div>
                                ))}
                            </div>

                            {/* Right Side: Content Area */}
                            <div className="category-content p-2 flex-grow-1 overflow-auto">
                                <h4 className="fw-bold mb-4 d-flex align-items-center">
                                    {activeSidebarCat}
                                </h4>
                                <Row className="g-2">
                                    {Object.entries(CATEGORIES[activeSidebarCat]?.groups || {}).map(([groupName, items]) => (
                                        <Col key={groupName} md={3}>
                                            <h6 className="fw-bold border-bottom pb-1 mb-1 text-dark group-header">
                                                {groupName}
                                            </h6>
                                            <ul className="list-unstyled">
                                                {items.map(sub => (
                                                    <li key={sub} className="mb-2">
                                                        <Link
                                                            to={`/shop?cat=${activeSidebarCat}&sub=${sub}`}
                                                            className="subcategory-link text-muted text-decoration-none d-block"
                                                            style={{ fontSize: '0.85rem' }}
                                                            onClick={() => setShowSidebarMenu(false)}
                                                        >
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>

            <style>{`
                .hover-orange:hover {
                    color: #ff6000 !important;
                }
                
                .search-wrapper:focus-within {
                    border-color: #ff6000 !important;
                    background-color: #fff !important;
                    box-shadow: 0 0 0 4px rgba(255, 96, 0, 0.1);
                }

                .action-item {
                    color: #333;
                    border: 1px solid transparent;
                }
                .action-item:hover {
                    color: #ff6000 !important;
                    background-color: #fffaf5;
                    border-color: #ffe0cc;
                }

                .categories-trigger {
                    cursor: pointer;
                    transition: all 0.3s;
                    border-radius: 4px;
                }
                .categories-trigger:hover, .categories-trigger.active {
                    color: #ff6000;
                    background-color: #fffaf5;
                }
                
                .nav-link-item {
                    transition: all 0.2s;
                    position: relative;
                }
                .nav-link-item:after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: #ff6000;
                    transition: all 0.3s;
                    transform: translateX(-50%);
                }
                .nav-link-item:hover {
                    color: #ff6000 !important;
                }
                .nav-link-item:hover:after {
                    width: 70%;
                }
                
                /* Sidebar Mega Menu Styles */
                .sidebar-mega-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    height: 500px;
                    z-index: 1050;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .sidebar-mega-menu.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .sidebar-item {
                    transition: all 0.2s;
                    border-left: 4px solid transparent;
                }
                .sidebar-item.active {
                    background-color: #fff !important;
                    color: #ff6000;
                    border-left-color: #ff6000;
                    font-weight: bold;
                }
                
                .subcategory-link:hover {
                    color: #ff6000 !important;
                    padding-left: 5px;
                }
                
                .custom-nav-dropdown .dropdown-toggle::after {
                    display: none;
                }
                .custom-nav-dropdown .dropdown-menu {
                    margin-top: 10px;
                    border: none;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border-radius: 12px;
                    padding: 10px;
                    min-width: 240px;
                }
                .custom-nav-dropdown .dropdown-item {
                    border-radius: 8px;
                    padding: 10px 15px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .custom-nav-dropdown .dropdown-item:hover {
                    background-color: #fffaf5;
                    color: #ff6000;
                }
            `}</style>
        </header >
    );
};

export default Navigation;
