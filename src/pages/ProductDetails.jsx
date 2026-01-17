import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Breadcrumb, Form, Card, Modal } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';

import { toast } from 'react-toastify';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, reviews, addReview, orders } = useData();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();

    const product = products.find(p => p.id === parseInt(id));

    const [selectedImage, setSelectedImage] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [selectionError, setSelectionError] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [reviewImages, setReviewImages] = useState([]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imagePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises)
            .then(base64Images => {
                setReviewImages(prev => [...prev, ...base64Images]);
            })
            .catch(error => console.error("Error uploading images:", error));
    };

    // Mock options
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const storageOptions = ['128Go', '256Go', '512Go', '1To'];

    // Location & Delivery State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('Tchad');
    const [selectedCity, setSelectedCity] = useState("N'Djaména");
    const [selectedDistrict, setSelectedDistrict] = useState('Moursal');

    // Temp state for modal
    const [tempCountry, setTempCountry] = useState('Tchad');
    const [tempCity, setTempCity] = useState("N'Djaména");
    const [tempDistrict, setTempDistrict] = useState('Moursal');

    const [deliveryDate, setDeliveryDate] = useState('');

    // Mock Location Data (International)
    const locationData = {
        'Tchad': {
            "N'Djaména": ['Moursal', 'Chagoua', 'Sabangali', 'Farcha', 'Diguel', 'Paris Congo', 'Amriguébé', 'Walia'],
            'Moundou': ['Djarabé', 'Dombeur', 'Gueldjem', 'Quinze Ans'],
            'Sarh': ['Baguirmi', 'Balimba', 'Centre-ville', 'Maïngara'],
            'Abéché': ['Goz Amir', 'Taradon', 'El-Salam', 'Centre']
        },
        'France': {
            'Paris': ['Paris 1er', 'Paris 8ème', 'Paris 16ème', 'La Défense', 'Le Marais'],
            'Lyon': ['Part-Dieu', 'Bellecour', 'Confluence', 'Vieux Lyon'],
            'Marseille': ['Vieux-Port', 'Prado', 'Panier', 'Euroméditerranée'],
            'Bordeaux': ['Centre', 'Chartrons', 'Saint-Michel']
        },
        'Canada': {
            'Montréal': ['Centre-Ville', 'Le Plateau', 'Vieux-Montréal', 'Rosemont'],
            'Québec': ['Sainte-Foy', 'Vieux-Québec', 'Limoilou'],
            'Toronto': ['Downtown', 'Scarborough', 'North York'],
            'Ottawa': ['ByWard Market', 'Centretown', 'Gatineau']
        },
        'États-Unis': {
            'New York': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx'],
            'Washington DC': ['Capitol Hill', 'Georgetown', 'Downtown'],
            'Los Angeles': ['Hollywood', 'Santa Monica', 'Downtown LA'],
            'Miami': ['South Beach', 'Brickell', 'Wynwood']
        }
    };

    const calculateDeliveryDate = (city, country) => {
        const today = new Date();
        let daysToAdd = 7; // Standard

        if (country === 'Tchad') {
            if (city === "N'Djaména") {
                daysToAdd = 5; // Express Local
            } else {
                daysToAdd = 7; // Standard Local
            }
        } else {
            // International Shipping
            daysToAdd = 10;
        }

        const delivery = new Date(today);
        delivery.setDate(today.getDate() + daysToAdd);

        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return delivery.toLocaleDateString('fr-FR', options);
    };


    const handleLocationSave = () => {
        setSelectedCountry(tempCountry);
        setSelectedCity(tempCity);
        setSelectedDistrict(tempDistrict);
        setDeliveryDate(calculateDeliveryDate(tempCity, tempCountry));
        setShowLocationModal(false);
    };



    useEffect(() => {
        if (product) {
            setSelectedImage(product.image || (product.images && product.images[0]));
            // Don't auto-select color/size to force mandatory selection
            setDeliveryDate(calculateDeliveryDate(selectedCity));
        }
        window.scrollTo(0, 0);
    }, [product, id]);

    if (!product) {
        return <Container className="py-5 text-center mt-5"><h3>Produit non trouvé</h3></Container>;
    }

    const isClothing = ['Mode', 'Vêtements', 'Robes', 'Chemises', 'Pantalons', 'Robe Bohème Chic'].includes(product.category) || product.category.toLowerCase().includes('robe') || product.category.toLowerCase().includes('vetement');
    const isShoes = ['Chaussures', 'Sacs'].includes(product.category) || product.category.toLowerCase().includes('chaussure');
    const isTech = ['Électronique', 'Téléphones', 'Ordinateurs', 'Tech', 'Smartphones'].includes(product.category) || product.category.toLowerCase().includes('tech');

    const productReviews = reviews.filter(r => r.productId === product.id);
    const averageRating = productReviews.length > 0
        ? (productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length).toFixed(1)
        : null;

    const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);

    const isVerifiedBuyer = user && orders.some(order =>
        (order.email === user.email || order.userId === user.id) &&
        (order.status === 'Livrée' || order.status === 'Complétée') &&
        order.items.some(item => item.id === product.id)
    );

    const productImages = product.images || [product.image];


    const validateSelection = () => {
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            setSelectionError('Veuillez sélectionner une couleur');
            return false;
        }
        // Check if sizes exist, regardless of category
        if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
            setSelectionError(`Veuillez sélectionner une ${isShoes ? 'pointure' : 'taille'}`);
            return false;
        }
        if (isTech && !selectedStorage) {
            setSelectionError('Veuillez sélectionner une capacité de stockage');
            return false;
        }
        setSelectionError(null);
        return true;
    };

    const handleAddToCart = () => {
        if (!validateSelection()) return;

        const itemToAdd = { ...product, selectedColor };
        if (product.availableSizes && product.availableSizes.length > 0) itemToAdd.selectedSize = selectedSize;
        if (isTech) itemToAdd.selectedStorage = selectedStorage;

        addToCart(itemToAdd);
        toast.success(`Ajouté au panier : ${product.name} ${selectedSize ? `(${selectedSize})` : ''}`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const handleBuyNow = () => {
        if (!validateSelection()) return;

        const itemToAdd = { ...product, selectedColor };
        if (product.availableSizes && product.availableSizes.length > 0) itemToAdd.selectedSize = selectedSize;
        if (isTech) itemToAdd.selectedStorage = selectedStorage;

        addToCart(itemToAdd);
        navigate('/checkout');
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        const newReview = {
            id: Date.now(),
            productId: product.id,
            userName: user?.name || "Utilisateur",
            rating: userRating,
            comment: userComment,
            images: reviewImages,
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        addReview(newReview);
        setUserComment('');
        setReviewImages([]);
        setShowReviewForm(false);
    };

    // Tech Design tokens
    const colors = {
        primary: '#FF6000', // Modern Tech Orange
        background: '#FFFFFF',
        textMain: '#1D1D1F',
        textSecondary: '#86868B',
        accent: '#FF7A29',
        border: 'rgba(0,0,0,0.08)'
    };


    return (
        <div className="product-details-tech" style={{ backgroundColor: colors.background, minHeight: '100vh', paddingTop: '10px', paddingBottom: '40px' }}>
            <Container>
                {/* Breadcrumb - Minimal */}
                {/* Premium Breadcrumb */}
                <div className="d-none d-md-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.85rem' }}>
                    <div
                        onClick={() => navigate('/')}
                        className="d-flex align-items-center gap-1 cursor-pointer hover-opacity"
                        style={{ color: colors.textSecondary, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <i className="bi bi-house-door" style={{ fontSize: '1rem' }}></i>
                        <span>Accueil</span>
                    </div>

                    <i className="bi bi-chevron-right" style={{ color: colors.border, fontSize: '0.7rem' }}></i>

                    <div
                        onClick={() => navigate('/shop')}
                        className="cursor-pointer hover-opacity"
                        style={{ color: colors.textSecondary, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Boutique
                    </div>

                    <i className="bi bi-chevron-right" style={{ color: colors.border, fontSize: '0.7rem' }}></i>

                    <div style={{ color: colors.textMain, fontWeight: '600' }}>
                        {product.name}
                    </div>
                </div>

                <Row className="g-0 justify-content-center">
                    {/* --- IMAGE GALLERY (Floating Card) --- */}
                    <Col lg={showReviews ? 4 : 5}>
                        <div className="gallery-float-card bg-white p-2 shadow-sm border-0 d-flex flex-column mb-4" style={{ borderRadius: '16px 0 0 16px', height: '620px' }}>
                            <div className="position-relative overflow-hidden mb-2" style={{ flex: '1 1 auto', maxHeight: '520px', borderRadius: '12px', backgroundColor: '#fcfcfc' }}>
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'contain' }}
                                />

                                {/* Float heart button */}
                                <Button
                                    variant="white"
                                    onClick={() => toggleFavorite(product.id)}
                                    className="position-absolute top-0 end-0 m-4 rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}
                                >
                                    <i className={`bi ${isFavorite(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart text-dark'} fs-4`}></i>
                                </Button>

                                {/* Navigation Arrows */}
                                {productImages.length > 1 && (
                                    <>
                                        <Button
                                            variant="white"
                                            onClick={() => {
                                                const currentIndex = productImages.indexOf(selectedImage);
                                                const prevIndex = currentIndex === 0 ? productImages.length - 1 : currentIndex - 1;
                                                setSelectedImage(productImages[prevIndex]);
                                            }}
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}
                                        >
                                            <i className="bi bi-chevron-left" style={{ fontSize: '1.2rem' }}></i>
                                        </Button>
                                        <Button
                                            variant="white"
                                            onClick={() => {
                                                const currentIndex = productImages.indexOf(selectedImage);
                                                const nextIndex = currentIndex === productImages.length - 1 ? 0 : currentIndex + 1;
                                                setSelectedImage(productImages[nextIndex]);
                                            }}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}
                                        >
                                            <i className="bi bi-chevron-right" style={{ fontSize: '1.2rem' }}></i>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Horizontal Thumbnails (Low Profile) */}
                            <div className="d-flex gap-2 overflow-auto py-1 px-1 no-scrollbar justify-content-center" style={{ flex: '0 0 auto', minHeight: '75px' }}>
                                {productImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="thumbnail-tech rounded-3 overflow-hidden border-2"
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'transform 0.2s',
                                            borderColor: selectedImage === img ? colors.primary : 'transparent',
                                            borderStyle: 'solid',
                                            padding: '3px',
                                            backgroundColor: '#f9f9f9'
                                        }}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-100 h-100 rounded-2" style={{ objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>


                    </Col>

                    {/* --- INFO COLUMN --- */}
                    <Col lg={showReviews ? 4 : 5}>
                        {/* Static Container forming the middle or right part of the card */}
                        <div
                            className="bg-white shadow-sm border-0 position-relative"
                            style={{
                                height: '620px',
                                borderRadius: showReviews ? '0' : '0 16px 16px 0',
                                overflow: 'hidden',
                                borderLeft: '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            {/* Scrollable Content Area */}
                            <div className="h-100 w-100 p-3 p-md-4 custom-scroll position-relative" style={{ overflowY: 'auto' }}>
                                <div className="vstack gap-2">
                                    {/* Rating in top-right corner */}
                                    <div
                                        className="position-absolute d-flex align-items-center gap-1 cursor-pointer transition-all bg-white p-2 rounded-3 shadow-sm"
                                        onClick={() => setShowReviews(!showReviews)}
                                        style={{
                                            cursor: 'pointer',
                                            top: '20px',
                                            right: '25px',
                                            zIndex: 10,
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <i className="bi bi-star-fill" style={{ fontSize: '0.75rem', color: '#FFD700' }}></i>
                                        <span className="fw-bold" style={{ fontSize: '0.8rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>{averageRating || '4.0'}</span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>({productReviews.length})</span>
                                        <i className={`bi bi-chevron-${showReviews ? 'up' : 'down'} small ms-1 text-muted`} style={{ fontSize: '0.65rem' }}></i>
                                    </div>

                                    {/* Category & Rating Mini Row */}
                                    <h4 className="fw-bold mb-1 pe-5" style={{ color: colors.textMain, letterSpacing: '-0.3px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: '1.35rem' }}>{product.name}</h4>
                                    <div className="mb-3" style={{ color: colors.textSecondary, lineHeight: '1.5', fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{product.description}</div>
                                    <div className="price-tag mb-1">
                                        <span className="fw-bold" style={{ color: colors.primary, fontSize: '1.5rem', fontFamily: '"Segoe UI", Roboto, sans-serif', letterSpacing: '-0.3px' }}>{product.price.toLocaleString()} FCFA</span>
                                    </div>


                                    {/* Variant Selection: Colors (Rectangular Thumbnails) */}
                                    {product.colors && product.colors.length > 0 && (
                                        <div className="mb-2">
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="fw-bold text-dark me-2" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>Couleur:</span>
                                                <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>{selectedColor || 'Non sélectionnée'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {product.colors.map((color, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedColor(color.name);
                                                            if (color.image) setSelectedImage(color.image);
                                                        }}
                                                        className="position-relative overflow-hidden transition-all"
                                                        style={{
                                                            cursor: 'pointer',
                                                            width: '56px',
                                                            height: '66px',
                                                            borderRadius: '8px',
                                                            border: selectedColor === color.name ? `2px solid ${colors.primary}` : '1px solid #f0f0f0',
                                                            padding: '2px',
                                                            backgroundColor: '#fff',
                                                            boxShadow: selectedColor === color.name ? '0 2px 8px rgba(255, 96, 0, 0.15)' : 'none'
                                                        }}
                                                        title={color.name}
                                                    >
                                                        <div
                                                            className="w-100 h-100 rounded-2"
                                                            style={{
                                                                backgroundColor: color.code,
                                                                backgroundImage: color.image ? `url(${color.image})` : 'none',
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                opacity: selectedColor === color.name ? 1 : 0.8
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Variant Selection: Size (Clothing / Shoes) */}
                                    {product.availableSizes && product.availableSizes.length > 0 && (
                                        <div className="mb-2">
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="fw-bold text-dark me-2" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>{isShoes ? 'Pointure' : 'Taille'}:</span>
                                                <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>{selectedSize || 'Non sélectionnée'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {product.availableSizes.map((size) => (
                                                    <div
                                                        key={size}
                                                        onClick={() => {
                                                            setSelectedSize(size);
                                                            setSelectionError(null);
                                                        }}
                                                        className="d-flex align-items-center justify-content-center fw-bold transition-all"
                                                        style={{
                                                            cursor: 'pointer',
                                                            minWidth: '46px',
                                                            height: '38px',
                                                            padding: '0 12px',
                                                            borderRadius: '6px',
                                                            border: selectedSize === size ? `1.5px solid ${colors.primary}` : '1px solid #f0f0f0',
                                                            backgroundColor: selectedSize === size ? '#fff' : '#f8f9fa',
                                                            color: selectedSize === size ? colors.primary : '#444',
                                                            fontSize: '0.8rem',
                                                            fontFamily: '"Segoe UI", Roboto, sans-serif'
                                                        }}
                                                    >
                                                        {size}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Variant Selection: Storage (Tech) */}
                                    {(product.storageOptions || (isTech && (storageOptions && storageOptions.length > 0))) && (
                                        <div className="mb-2">
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="fw-bold text-dark me-2" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>Stockage:</span>
                                                <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>{selectedStorage || 'Non sélectionné'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {(product.storageOptions || storageOptions).map((storage) => (
                                                    <div
                                                        key={storage}
                                                        onClick={() => {
                                                            setSelectedStorage(storage);
                                                            setSelectionError(null);
                                                        }}
                                                        className="d-flex align-items-center justify-content-center fw-bold transition-all"
                                                        style={{
                                                            cursor: 'pointer',
                                                            minWidth: '60px',
                                                            height: '38px',
                                                            padding: '0 12px',
                                                            borderRadius: '6px',
                                                            border: selectedStorage === storage ? `1.5px solid ${colors.primary}` : '1px solid #f0f0f0',
                                                            backgroundColor: selectedStorage === storage ? '#fff' : '#f8f9fa',
                                                            color: selectedStorage === storage ? colors.primary : '#444',
                                                            fontSize: '0.8rem',
                                                            fontFamily: '"Segoe UI", Roboto, sans-serif'
                                                        }}
                                                    >
                                                        {storage}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Recommendation */}
                                    {isClothing && (
                                        <div className="d-flex align-items-center gap-2 mb-4 text-muted small">
                                            <i className="bi bi-hanger"></i>
                                            <span>La plupart des utilisateurs recommandent de prendre votre taille habituelle.</span>
                                        </div>
                                    )}

                                    {/* Selection Error Alert */}
                                    {selectionError && (
                                        <div className="alert alert-danger py-2 px-3 border-0 small mb-3 animate-fade-in" style={{ borderRadius: '8px', backgroundColor: '#fff2f2', color: '#d93025' }}>
                                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                                            {selectionError}
                                        </div>
                                    )}

                                    {/* Action Buttons (Trendyol Style) */}
                                    <div className="d-flex gap-3 mb-4">
                                        <Button
                                            variant="outline-primary"
                                            className="flex-grow-1 py-3 fw-bold"
                                            style={{
                                                borderRadius: '8px',
                                                border: `2px solid ${colors.primary}`,
                                                color: colors.primary,
                                                backgroundColor: '#fff',
                                                fontSize: '1rem'
                                            }}
                                            onClick={handleBuyNow}
                                        >
                                            Acheter maintenant
                                        </Button>
                                        <Button
                                            className="flex-grow-1 py-3 fw-bold text-white border-0"
                                            style={{
                                                borderRadius: '8px',
                                                backgroundColor: colors.primary,
                                                fontSize: '1rem'
                                            }}
                                            onClick={handleAddToCart}
                                        >
                                            Ajouter au panier
                                        </Button>

                                    </div>

                                    {/* Delivery Info Box */}
                                    <div className="bg-light p-3 mb-4 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                            <div className="bg-white p-2 rounded-circle shadow-sm">
                                                <i className="bi bi-box-seam fs-5 text-primary"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                                    Livraison estimée : <span className="text-success">{deliveryDate}</span>
                                                </div>
                                                <div className="text-muted small">
                                                    {selectedCountry === "Tchad" && selectedCity === "N'Djaména" ? 'Livraison Express disponible' : 'Livraison Standard'}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="d-flex align-items-center gap-3 p-2 rounded-3 hover-effect cursor-pointer"
                                            style={{ backgroundColor: 'rgba(0,0,0,0.03)', cursor: 'pointer' }}
                                            onClick={() => setShowLocationModal(true)}
                                        >
                                            <i className="bi bi-geo-alt-fill fs-5 text-danger"></i>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>Livrer à : {selectedCountry}</div>
                                                <div className="text-dark small fw-medium">{selectedCity} - {selectedDistrict}</div>
                                            </div>
                                            <span className="fw-bold small cursor-pointer" style={{ color: colors.primary }}>Changer &gt;</span>
                                        </div>
                                    </div>


                                    {/* Refined Featured Attributes Squares */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1rem', color: colors.textMain }}>
                                            <i className="bi bi-info-circle text-primary"></i>
                                            Caractéristiques principales :
                                        </h6>
                                        <Row className="g-3">
                                            {(product.attributes && product.attributes.length > 0 ? product.attributes : [
                                                { label: 'Coupe', value: 'Regular' },
                                                { label: 'Matière', value: 'Polyester' },
                                                { label: 'Doublure', value: 'Oui' },
                                                { label: 'Col', value: 'Capuche' },
                                                { label: 'Tissu', value: 'Tissé' },
                                                { label: 'Couleur', value: selectedColor || 'Unie' },
                                                { label: 'Fermeture', value: 'Éclair' },
                                                { label: 'Motif', value: 'Uni' }
                                            ]).map((attr, idx) => (
                                                <Col xs={6} md={3} key={idx}>
                                                    <div
                                                        className="p-2 h-100 transition-all text-center"
                                                        style={{
                                                            backgroundColor: '#f5f5f5',
                                                            borderRadius: '6px',
                                                            transition: 'transform 0.2s ease',
                                                            fontFamily: "'Inter', sans-serif"
                                                        }}
                                                    >
                                                        <div className="text-secondary mb-0" style={{ fontSize: '0.65rem', fontWeight: '500', opacity: 0.8, letterSpacing: '0.2px' }}>{attr.label}</div>
                                                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.82rem', fontFamily: "'Manrope', sans-serif", fontWeight: '700' }}>{attr.value}</div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>

                                    {/* Bullet Points (Marketing) */}
                                    <div className="small text-muted">
                                        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                                            <li className="d-flex gap-2">
                                                <span style={{ color: colors.primary }}>•</span>
                                                Ce produit sera expédié par <strong>TRYMYDAY</strong>.
                                            </li>
                                            <li className="d-flex gap-2">
                                                <span style={{ color: colors.primary }}>•</span>
                                                Plus de 50 articles en stock au prix promotionnel.
                                            </li>
                                            <li className="d-flex gap-2">
                                                <span style={{ color: colors.primary }}>•</span>
                                                Possibilité de commander jusqu'à 10 articles maximum par commande.
                                            </li>
                                        </ul>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="w-100 text-center text-muted small text-decoration-none mt-2 bg-light py-2 rounded-3 fw-bold"
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                    >
                                        {showFullDescription ? 'MOINS de caractéristiques' : 'TOUTES les caractéristiques'}
                                        <i className={`bi bi-chevron-${showFullDescription ? 'up' : 'down'} ms-1`}></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* --- REVIEWS SIDE COLUMN --- */}
                    {showReviews && (
                        <Col lg={4} className="animate-fade-in">
                            <div
                                className="bg-white shadow-sm border-0 position-relative"
                                style={{
                                    height: '520px',
                                    borderRadius: '0 16px 16px 0',
                                    overflow: 'hidden',
                                    borderLeft: '1px solid rgba(0,0,0,0.05)'
                                }}
                            >
                                <div className="h-100 w-100 p-4 custom-scroll" style={{ overflowY: 'auto' }}>
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <h5 className="fw-bold mb-0">Avis clients</h5>
                                        <div className="d-flex gap-2">
                                            {isVerifiedBuyer && (
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-decoration-none fw-bold"
                                                    style={{ color: colors.primary, fontSize: '0.85rem' }}
                                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                                >
                                                    {showReviewForm ? 'Annuler' : 'Noter'}
                                                </Button>
                                            )}
                                            <Button
                                                variant="link"
                                                className="p-0 text-muted"
                                                onClick={() => setShowReviews(false)}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </Button>
                                        </div>
                                    </div>

                                    {showReviewForm && (
                                        <div className="mb-4 p-3 bg-light rounded-3">
                                            <Form onSubmit={handleSubmitReview}>
                                                <div className="d-flex gap-2 mb-3">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <i
                                                            key={star}
                                                            className={`bi bi-star${star <= userRating ? '-fill' : ''} fs-4 cursor-pointer`}
                                                            style={{ color: star <= userRating ? '#FFD700' : '#E5E5EA' }}
                                                            onClick={() => setUserRating(star)}
                                                        ></i>
                                                    ))}
                                                </div>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Votre avis..."
                                                    value={userComment}
                                                    onChange={(e) => setUserComment(e.target.value)}
                                                    className="border-0 bg-white mb-2 shadow-none small"
                                                    style={{ borderRadius: '12px' }}
                                                    required
                                                />
                                                <div className="mb-3">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="form-control form-control-sm"
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <Button size="sm" type="submit" className="border-0 rounded-pill px-3 py-1 text-white" style={{ backgroundColor: colors.primary }}>Publier</Button>
                                            </Form>
                                        </div>
                                    )}

                                    <div className="vstack gap-3">
                                        {productReviews.length > 0 ? (
                                            productReviews.map(review => (
                                                <div key={review.id} className="pb-3 border-bottom border-light">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold" style={{ fontSize: '0.85rem' }}>{review.userName}</span>
                                                        <div className="d-flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''}`} style={{ color: '#FFD700', fontSize: '0.7rem' }}></i>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="mb-2 text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{review.comment}</p>
                                                    {review.images && review.images.length > 0 && (
                                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                                            {review.images.map((img, imgIndex) => (
                                                                <img
                                                                    key={imgIndex}
                                                                    src={img}
                                                                    alt="Review"
                                                                    className="rounded"
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted small">Aucun avis pour l'instant.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>

                {/* --- SIMILAR PRODUCTS --- */}
                {
                    similarProducts.length > 0 && (
                        <div className="mt-5 pt-4 border-top">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>Produits Similaires</h4>
                                <Button
                                    variant="link"
                                    className="text-decoration-none fw-bold"
                                    style={{ color: colors.primary, fontSize: '0.9rem' }}
                                    onClick={() => navigate('/shop')}
                                >
                                    Tout voir
                                </Button>
                            </div>
                            <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                                {similarProducts.map(p => (
                                    <Col key={p.id}>
                                        <ProductCard product={p} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )
                }
            </Container >

            {/* Location Selection Modal */}
            < Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} centered >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Choisir votre localisation</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <p className="text-muted small mb-4">Sélectionnez votre pays, ville et quartier pour voir la date de livraison.</p>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">PAYS</Form.Label>
                            <Form.Select
                                value={tempCountry}
                                onChange={(e) => {
                                    const newCountry = e.target.value;
                                    setTempCountry(newCountry);
                                    // Reset City and District based on new Country
                                    const firstCity = Object.keys(locationData[newCountry])[0];
                                    setTempCity(firstCity);
                                    setTempDistrict(locationData[newCountry][firstCity][0]);
                                }}
                                style={{ borderRadius: '8px', padding: '12px' }}
                            >
                                {Object.keys(locationData).map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">VILLE</Form.Label>
                            <Form.Select
                                value={tempCity}
                                onChange={(e) => {
                                    const newCity = e.target.value;
                                    setTempCity(newCity);
                                    setTempDistrict(locationData[tempCountry][newCity][0]); // Reset district
                                }}
                                style={{ borderRadius: '8px', padding: '12px' }}
                            >
                                {locationData[tempCountry] && Object.keys(locationData[tempCountry]).map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">QUARTIER / ZONE</Form.Label>
                            <Form.Select
                                value={tempDistrict}
                                onChange={(e) => setTempDistrict(e.target.value)}
                                style={{ borderRadius: '8px', padding: '12px' }}
                            >
                                {locationData[tempCountry] && locationData[tempCountry][tempCity] && locationData[tempCountry][tempCity].map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Button
                            variant="primary"
                            className="w-100 py-2 fw-bold text-white border-0"
                            style={{ backgroundColor: colors.primary, borderRadius: '8px' }}
                            onClick={handleLocationSave}
                        >
                            Appliquer
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal >

            <style>{`
                .product-details-tech .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .product-details-tech .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .product-details-tech .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .product-details-tech .custom-scroll::-webkit-scrollbar-thumb {
                    background: transparent;
                }
                .product-details-tech .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: transparent;
                }
                .product-details-tech .transition-all {
                    transition: all 0.25s ease-in-out;
                }
                .product-details-tech .thumbnail-tech:hover {
                    transform: scale(1.05);
                }
                .product-details-tech .hover-translate-y:hover {
                    transform: translateY(-4px);
                    border-color: #FF6000 !important;
                }
                .product-details-tech .pill-variant:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .product-details-tech .buy-actions button:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 24px rgba(255, 96, 0, 0.25) !important;
                }
                .product-details-tech .buy-actions button:active {
                    transform: scale(0.98);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .product-details-tech .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .hover-effect {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hover-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                }
                @media (max-width: 768px) {
                    .gallery-float-card {
                        border-radius: 20px !important;
                    }
                    .info-card-tech, .reviews-card-tech {
                        border-radius: 20px !important;
                        padding: 24px !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default ProductDetails;
