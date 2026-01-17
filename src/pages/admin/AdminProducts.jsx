import { useState } from 'react';
import { Table, Button, Form, Modal, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useData, CATEGORIES } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import BarcodeScanner from '../../components/BarcodeScanner';

const AdminProducts = () => {
    const { products, addProduct, deleteProduct, updateProduct } = useData();
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const navigate = useNavigate();

    if (user?.role === 'expediteur') {
        navigate('/admin');
        return null;
    }
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ name: '', brand: '', collection: '', tags: '', sku: '', price: '', stock: '', category: 'Femme', subcategory: '', description: '', images: [], attributes: [], availableSizes: [], barcode: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [showSearchScanner, setShowSearchScanner] = useState(false);

    // Generate EAN-13
    const generateEAN13 = () => {
        const base = Date.now().toString().slice(-8) + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return base + checkDigit;
    };

    const [imageSource, setImageSource] = useState('upload');

    // Color Variant State
    const [colors, setColors] = useState([]);
    const [newColor, setNewColor] = useState({ name: '', hex: '#000000', images: [] });
    // Main color associated with the main images
    const [mainColor, setMainColor] = useState({ name: '', hex: '#000000' });
    const [colorImageSource, setColorImageSource] = useState('upload');
    const [newColorImageUrl, setNewColorImageUrl] = useState('');

    // Attributes State
    const [newAttribute, setNewAttribute] = useState({ label: '', value: '' });

    const addAttribute = () => {
        if (newAttribute.label && newAttribute.value) {
            setCurrentProduct({
                ...currentProduct,
                attributes: [...(currentProduct.attributes || []), newAttribute]
            });
            setNewAttribute({ label: '', value: '' });
        }
    };

    const removeAttribute = (index) => {
        const updatedAttributes = currentProduct.attributes.filter((_, i) => i !== index);
        setCurrentProduct({ ...currentProduct, attributes: updatedAttributes });
    };

    // Attribute Templates configuration
    const ATTRIBUTE_TEMPLATES = {
        'Clothing': ['Matière', 'Coupe', 'Doublure', 'Col', 'Motif', 'Fermeture', 'Longueur'],
        'Tech': ['Processeur', 'RAM', 'Stockage', 'Écran', 'Batterie', 'Système'],
        'Beauty': ['Type de peau', 'Volume', 'Ingrédients', 'Usage'],
        'Home': ['Dimensions', 'Matière', 'Poids', 'Assemblage'],
        'Shoes': ['Matière Extér.', 'Semelle', 'Fermeture', 'Largeur'],
        'Bags': ['Matière', 'Dimensions', 'Type de fermeture', 'Nb compartiments']
    };

    const getTemplateKey = (cat) => {
        if (['Femme', 'Homme', 'Enfant'].includes(cat)) return 'Clothing';
        if (['Électronique'].includes(cat)) return 'Tech';
        if (['Cosmétique'].includes(cat)) return 'Beauty';
        if (['Maison & Meuble'].includes(cat)) return 'Home';
        if (['Chaussures'].includes(cat)) return 'Shoes';
        if (['Sacs'].includes(cat)) return 'Bags';
        return null;
    };

    const handleTemplateFieldChange = (label, value) => {
        const existingAttributes = currentProduct.attributes || [];
        const index = existingAttributes.findIndex(a => a.label === label);

        let updatedAttributes = [...existingAttributes];
        if (index > -1) {
            if (value === '') {
                updatedAttributes.splice(index, 1);
            } else {
                updatedAttributes[index] = { ...updatedAttributes[index], value };
            }
        } else if (value !== '') {
            updatedAttributes.push({ label, value });
        }

        setCurrentProduct({ ...currentProduct, attributes: updatedAttributes });
    };

    const getFieldValue = (label) => {
        const attr = (currentProduct.attributes || []).find(a => a.label === label);
        return attr ? attr.value : '';
    };

    const toggleSize = (size) => {
        const currentSizes = currentProduct.availableSizes || [];
        const updatedSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size];
        setCurrentProduct({ ...currentProduct, availableSizes: updatedSizes });
    };

    const SIZE_PRESETS = {
        'Clothing': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        'Shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
    };

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showLimit, setShowLimit] = useState(10);

    const handleSave = () => {
        // Ensure at least one image is present, otherwise use placeholder
        const productImages = currentProduct.images && currentProduct.images.length > 0
            ? currentProduct.images
            : ['/assets/category_tech_1766034965148.png'];

        // Combine main color (if defined) with other variants
        let finalColors = [...colors];
        if (mainColor.name) {
            // Create a variant for the main images
            const mainVariant = {
                name: mainColor.name,
                hex: mainColor.hex,
                images: productImages
            };
            finalColors = [mainVariant, ...colors];
        }

        const productData = {
            ...currentProduct,
            images: productImages,
            image: productImages[0], // Main image is the first one
            colors: finalColors, // Save combined colors
            price: Number(currentProduct.price),
            stock: Number(currentProduct.stock)
        };

        if (isEditing) {
            updateProduct(currentProduct.id, productData);
        } else {
            addProduct(productData);
        }
        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentProduct({ name: '', brand: '', collection: '', tags: '', sku: '', price: '', stock: '', category: '', description: '', images: [], attributes: [], availableSizes: [], barcode: '' });
        setColors([]);
        setNewImageUrl('');
        setNewColor({ name: '', hex: '#000000', images: [] });
        setNewColorImageUrl('');
        setMainColor({ name: '', hex: '#000000' });
        setNewAttribute({ label: '', value: '' });
    };

    const openEdit = (product) => {
        setIsEditing(true);
        // Ensure images array exists
        setCurrentProduct({
            ...product,
            brand: product.brand || '',
            collection: product.collection || '',
            tags: product.tags || '',
            sku: product.sku || '',
            images: product.images || [product.image],
            attributes: product.attributes || [],
            availableSizes: product.availableSizes || [],
            barcode: product.barcode || ''
        });

        // Handle colors: Extract first color as "Main Color" if it exists, rest are variants
        const productColors = product.colors || [];
        if (productColors.length > 0) {
            setMainColor({ name: productColors[0].name, hex: productColors[0].hex });
            setColors(productColors.slice(1));
        } else {
            setMainColor({ name: '', hex: '#000000' });
            setColors([]);
        }

        setShowModal(true);
    };

    const openAdd = () => {
        setIsEditing(false);
        resetForm();
        const defaultCat = Object.keys(CATEGORIES)[0];
        const firstSubGroup = Object.values(CATEGORIES[defaultCat].groups)[0];
        setCurrentProduct({
            name: '',
            brand: '',
            collection: '',
            tags: '',
            sku: '',
            price: '',
            stock: '',
            category: defaultCat,
            subcategory: firstSubGroup[0] || 'Général',
            description: '',
            images: [],
            attributes: [],
            availableSizes: [],
            barcode: ''
        });
        setColors([]);
        setShowModal(true);
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setCurrentProduct({
                ...currentProduct,
                images: [...(currentProduct.images || []), newImageUrl]
            });
            setNewImageUrl('');
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentProduct(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    };

    const removeImage = (index) => {
        const updatedImages = currentProduct.images.filter((_, i) => i !== index);
        setCurrentProduct({ ...currentProduct, images: updatedImages });
    };

    // Color Management Functions
    const addColor = () => {
        if (newColor.name && newColor.hex) {
            setColors([...colors, newColor]);
            setNewColor({ name: '', hex: '#000000', images: [] });
        } else {
            alert('Veuillez entrer un nom et une couleur.');
        }
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const addColorImage = () => {
        if (newColorImageUrl.trim()) {
            setNewColor({
                ...newColor,
                images: [...(newColor.images || []), newColorImageUrl]
            });
            setNewColorImageUrl('');
        }
    };

    const removeColorImage = (index) => {
        const updatedImages = newColor.images.filter((_, i) => i !== index);
        setNewColor({ ...newColor, images: updatedImages });
    };

    const handleColorFileUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewColor(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    // Filtering logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const displayedProducts = filteredProducts.slice(0, showLimit);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestion des Produits</h2>
                <Button onClick={openAdd}>+ Nouveau Produit</Button>
            </div>

            <div className="bg-white p-3 rounded shadow-sm mb-4 border">
                <Row className="g-3">
                    <Col md={6}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Rechercher par nom, description ou code-barre..."
                                className="border-start-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button
                                variant="outline-primary"
                                className="border-start-0"
                                style={{ borderLeft: 'none' }}
                                onClick={() => setShowSearchScanner(true)}
                                title="Scanner un produit"
                            >
                                <i className="bi bi-camera"></i>
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">Toutes les catégories</option>
                            {Object.keys(CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <div className="text-muted small text-end mt-2">
                            {filteredProducts.length} produits trouvés
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="bg-white rounded shadow-sm border overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-3" style={{ width: '80px' }}>Image</th>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Prix Vente</th>
                            <th>Stock</th>
                            <th style={{ width: '150px' }}>Code-Barre</th>
                            <th className="text-end pe-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedProducts.map(product => (
                            <tr key={product.id}>
                                <td className="ps-3">
                                    <div className="rounded border bg-light d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                                        <img
                                            src={(product.images && product.images[0]) || product.image || '/assets/category_tech_1766034965148.png'}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = '/assets/category_tech_1766034965148.png'; }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{product.name}</div>
                                    <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{product.description}</div>
                                </td>
                                <td>
                                    <Badge bg="info" className="me-1" style={{ fontSize: '0.7rem' }}>{product.category}</Badge>
                                    <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>{product.subcategory}</Badge>
                                </td>
                                <td className="fw-bold text-success">{product.price.toLocaleString()} FCFA</td>
                                <td>
                                    <div className={product.stock < 10 ? 'text-danger fw-bold' : 'text-success'}>
                                        <i className={`bi bi-circle-fill me-1`} style={{ fontSize: '0.5rem' }}></i>
                                        {product.stock} en stock
                                    </div>
                                </td>
                                <td>
                                    {product.barcode ? (
                                        <div className="d-flex align-items-center gap-2">
                                            <Barcode value={product.barcode} width={1} height={30} fontSize={10} displayValue={false} />
                                            <small className="text-muted" style={{ fontSize: '0.65rem' }}>{product.barcode}</small>
                                        </div>
                                    ) : (
                                        <small className="text-muted fst-italic">Non défini</small>
                                    )}
                                </td>
                                <td className="text-end pe-3">
                                    <Button size="sm" variant="outline-primary" className="me-2 rounded-pill px-3" onClick={() => openEdit(product)}>
                                        <i className="bi bi-pencil me-1"></i> Modif
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        className="rounded-pill px-3"
                                        onClick={() => {
                                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
                                                deleteProduct(product.id);
                                            }
                                        }}
                                    >
                                        <i className="bi bi-trash me-1"></i> Suppr
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {filteredProducts.length > showLimit && (
                    <div className="p-3 text-center border-top bg-light">
                        <Button variant="link" onClick={() => setShowLimit(prev => prev + 10)} className="text-decoration-none fw-bold">
                            Afficher plus de produits ({filteredProducts.length - showLimit} restants)
                        </Button>
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Modifier Produit' : 'Ajouter Produit'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom du produit</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentProduct.name}
                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Marque</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ex: Zara, Apple..."
                                            value={currentProduct.brand}
                                            onChange={e => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Collection</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ex: Été 2024"
                                            value={currentProduct.collection}
                                            onChange={e => setCurrentProduct({ ...currentProduct, collection: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>SKU / Référence</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Code unique"
                                            value={currentProduct.sku}
                                            onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tags (Mots-clés)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ex: casual, fête, vintage"
                                            value={currentProduct.tags}
                                            onChange={e => setCurrentProduct({ ...currentProduct, tags: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Code-Barre EAN-13</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Code-barre auto ou manuel"
                                                value={currentProduct.barcode}
                                                onChange={e => setCurrentProduct({ ...currentProduct, barcode: e.target.value })}
                                                maxLength="13"
                                            />
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => setShowScanner(true)}
                                                title="Scanner avec la caméra"
                                            >
                                                <i className="bi bi-camera"></i>
                                            </Button>
                                            <Button
                                                variant="outline-warning"
                                                onClick={() => setCurrentProduct({ ...currentProduct, barcode: generateEAN13() })}
                                                title="Générer code-barre automatique"
                                            >
                                                <i className="bi bi-upc-scan"></i> Générer
                                            </Button>
                                        </InputGroup>
                                        <Form.Text className="text-muted small">
                                            13 chiffres - Cliquez sur le bouton pour générer automatiquement
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Catégorie</Form.Label>
                                <Form.Select
                                    value={currentProduct.category}
                                    onChange={e => {
                                        const newCat = e.target.value;
                                        const firstSubGroup = Object.values(CATEGORIES[newCat].groups)[0];
                                        setCurrentProduct({
                                            ...currentProduct,
                                            category: newCat,
                                            subcategory: firstSubGroup[0] || 'Général'
                                        });
                                    }}
                                >
                                    {Object.keys(CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Sous-Catégorie</Form.Label>
                                <Form.Select
                                    value={currentProduct.subcategory}
                                    onChange={e => setCurrentProduct({ ...currentProduct, subcategory: e.target.value })}
                                >
                                    {Object.entries(CATEGORIES[currentProduct.category]?.groups || {}).map(([group, items]) => (
                                        <optgroup key={group} label={group}>
                                            {items.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prix Vente (FCFA)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={currentProduct.price}
                                            onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Stock</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={currentProduct.stock}
                                            onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="d-flex justify-content-between align-items-center">
                                    <span>Images du produit</span>
                                    <Badge bg="info" className="ms-2">
                                        {currentProduct.images?.length || 0} image(s)
                                    </Badge>
                                </Form.Label>

                                <div className="mb-3">
                                    <div className="btn-group btn-group-sm w-100 mb-2">
                                        <Button
                                            variant={imageSource === 'upload' ? 'primary' : 'outline-primary'}
                                            onClick={() => setImageSource('upload')}
                                        >
                                            <i className="bi bi-upload me-1"></i> Charger
                                        </Button>
                                        <Button
                                            variant={imageSource === 'url' ? 'primary' : 'outline-primary'}
                                            onClick={() => setImageSource('url')}
                                        >
                                            <i className="bi bi-link-45deg me-1"></i> Lien URL
                                        </Button>
                                    </div>

                                    {imageSource === 'upload' ? (
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileUpload}
                                        />
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="text"
                                                placeholder="https://..."
                                                value={newImageUrl}
                                                onChange={e => setNewImageUrl(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                                            />
                                            <Button variant="outline-secondary" onClick={addImage}>Ajouter</Button>
                                        </div>
                                    )}
                                </div>

                                <div className="border p-3 rounded bg-light" style={{ minHeight: '150px', maxHeight: '250px', overflowY: 'auto' }}>
                                    {currentProduct.images && currentProduct.images.length > 0 ? (
                                        <div className="row g-2">
                                            {currentProduct.images.map((img, idx) => (
                                                <div key={idx} className="col-4">
                                                    <div className="position-relative border rounded p-1 bg-white shadow-sm">
                                                        <img
                                                            src={img}
                                                            alt="preview"
                                                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                                            className="rounded"
                                                        />
                                                        {idx === 0 && (
                                                            <div
                                                                className="position-absolute top-0 start-0 bg-primary text-white p-1 rounded-end"
                                                                style={{ fontSize: '0.6rem', fontWeight: 'bold' }}
                                                            >
                                                                PRINCIPALE
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill p-1 shadow"
                                                            style={{ fontSize: '0.6rem', border: '2px solid white' }}
                                                            onClick={() => removeImage(idx)}
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="bi bi-images text-muted" style={{ fontSize: '2rem' }}></i>
                                            <p className="text-muted small mt-2">Aucune image ajoutée.</p>
                                        </div>
                                    )}
                                </div>
                            </Form.Group>

                            {/* Main Color Section - Moved Here */}
                            <div className="p-3 bg-light rounded mb-3 border">
                                <h6 className="small fw-bold text-muted mb-2">Couleur des images principales</h6>
                                <Row className="g-2">
                                    <Col md={7}>
                                        <Form.Label className="small">Nom de la couleur</Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="ex: Original, Noir..."
                                            value={mainColor.name}
                                            onChange={e => setMainColor({ ...mainColor, name: e.target.value })}
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <Form.Label className="small">Code Hex</Form.Label>
                                        <Form.Control
                                            type="color"
                                            size="sm"
                                            value={mainColor.hex}
                                            onChange={e => setMainColor({ ...mainColor, hex: e.target.value })}
                                            className="p-1 w-100"
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                    {/* Color Variants Section */}
                    <div className="mb-4 border-top pt-3">
                        <h5 className="mb-3">Variantes de Couleur</h5>
                        <Row className="align-items-start g-2 mb-3 bg-light p-3 rounded">
                            <Col md={3}>
                                <Form.Label className="small">Nom (ex: Rouge)</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="Nom"
                                    value={newColor.name}
                                    onChange={e => setNewColor({ ...newColor, name: e.target.value })}
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small">Couleur</Form.Label>
                                <Form.Control
                                    type="color"
                                    size="sm"
                                    value={newColor.hex}
                                    onChange={e => setNewColor({ ...newColor, hex: e.target.value })}
                                    className="p-1"
                                />
                            </Col>
                            <Col md={7}>
                                <div className="border p-2 rounded bg-white">
                                    <Form.Label className="small d-flex justify-content-between">
                                        <span>Images pour {newColor.name || 'cette variante'}</span>
                                        <Badge bg="secondary">{newColor.images?.length || 0}</Badge>
                                    </Form.Label>
                                    <div className="d-flex gap-2 mb-2">
                                        <div className="btn-group btn-group-sm">
                                            <Button variant={colorImageSource === 'upload' ? 'secondary' : 'outline-secondary'} onClick={() => setColorImageSource('upload')}>Upload</Button>
                                            <Button variant={colorImageSource === 'url' ? 'secondary' : 'outline-secondary'} onClick={() => setColorImageSource('url')}>URL</Button>
                                        </div>
                                        {colorImageSource === 'url' ? (
                                            <div className="d-flex gap-1 flex-grow-1">
                                                <Form.Control size="sm" type="text" placeholder="URL image" value={newColorImageUrl} onChange={e => setNewColorImageUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorImage())} />
                                                <Button size="sm" variant="outline-dark" onClick={addColorImage}>+</Button>
                                            </div>
                                        ) : (
                                            <Form.Control size="sm" type="file" multiple accept="image/*" onChange={handleColorFileUpload} />
                                        )}
                                    </div>
                                    <div className="d-flex gap-2 overflow-auto" style={{ maxHeight: '100px' }}>
                                        {newColor.images?.map((img, idx) => (
                                            <div key={idx} className="position-relative border rounded" style={{ minWidth: '60px', width: '60px', height: '60px' }}>
                                                <img src={img} alt="" className="w-100 h-100 rounded object-fit-cover" />
                                                <div className="position-absolute top-0 end-0 translate-middle p-1 bg-danger rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px', cursor: 'pointer' }} onClick={() => removeColorImage(idx)}>
                                                    <span style={{ fontSize: '10px', lineHeight: 0 }}>×</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!newColor.images || newColor.images.length === 0) && <div className="text-muted small fst-italic p-2">Aucune image</div>}
                                    </div>
                                    <div className="mt-2 text-end">
                                        <Button variant="dark" size="sm" onClick={addColor}>Ajouter la variante</Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        {/* Colors List */}
                        {colors.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                                {colors.map((color, idx) => (
                                    <div key={idx} className="border rounded p-2 bg-white shadow-sm" style={{ minWidth: '150px' }}>
                                        <div className="d-flex align-items-center mb-1">
                                            <div className="rounded-circle border me-2" style={{ width: '20px', height: '20px', backgroundColor: color.hex }}></div>
                                            <div className="fw-bold small">{color.name}</div>
                                            <Button variant="link" className="text-danger p-0 ms-auto" size="sm" onClick={() => removeColor(idx)}>
                                                <i className="bi bi-x"></i>
                                            </Button>
                                        </div>
                                        <div className="d-flex gap-1 overflow-hidden" style={{ height: '30px' }}>
                                            {color.images && color.images.length > 0 ? (
                                                color.images.map((img, imgIdx) => (
                                                    <img key={imgIdx} src={img} alt="" className="h-100 rounded border" style={{ width: '30px', objectFit: 'cover' }} />
                                                ))
                                            ) : (
                                                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Sans images</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted small fst-italic">Aucune variante de couleur définie.</p>
                        )}
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={currentProduct.description}
                            onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        />
                    </Form.Group>

                    {/* Sizes Selection Section */}
                    {(getTemplateKey(currentProduct.category) === 'Clothing' || getTemplateKey(currentProduct.category) === 'Shoes') && (
                        <div className="mb-4 border-top pt-3">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                                <i className="bi bi-rulers text-primary"></i>
                                Tailles / Pointures Disponibles
                            </h5>
                            <p className="text-muted small mb-3">Sélectionnez les tailles qui seront proposées au client.</p>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {(getTemplateKey(currentProduct.category) === 'Shoes' ? SIZE_PRESETS.Shoes : SIZE_PRESETS.Clothing).map(size => (
                                    <Button
                                        key={size}
                                        variant={currentProduct.availableSizes?.includes(size) ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        className="px-3 rounded-pill"
                                        onClick={() => toggleSize(size)}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>

                            <InputGroup size="sm" style={{ maxWidth: '300px' }}>
                                <Form.Control
                                    placeholder="Ajouter une taille perso..."
                                    id="customSizeInput"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            if (e.target.value) toggleSize(e.target.value.toUpperCase());
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <Button variant="outline-primary" onClick={() => {
                                    const input = document.getElementById('customSizeInput');
                                    if (input.value) toggleSize(input.value.toUpperCase());
                                    input.value = '';
                                }}>
                                    Ajouter
                                </Button>
                            </InputGroup>
                        </div>
                    )}

                    {/* Dynamic Attributes Section */}
                    <div className="mb-4 border-top pt-3">
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                            <i className="bi bi-list-stars text-primary"></i>
                            Détails & Spécifications
                        </h5>

                        {/* Template Fields based on Category */}
                        {getTemplateKey(currentProduct.category) && (
                            <div className="p-3 bg-light rounded mb-3 border">
                                <h6 className="small fw-bold text-muted mb-3 border-bottom pb-2">CHAMPS RECOMMANDÉS POUR {currentProduct.category.toUpperCase()}</h6>
                                <Row className="g-3">
                                    {ATTRIBUTE_TEMPLATES[getTemplateKey(currentProduct.category)].map(field => (
                                        <Col md={6} key={field}>
                                            <Form.Group>
                                                <Form.Label className="small fw-medium mb-1">{field}</Form.Label>
                                                <Form.Control
                                                    size="sm"
                                                    type="text"
                                                    placeholder={`Saisir ${field.toLowerCase()}...`}
                                                    value={getFieldValue(field)}
                                                    onChange={e => handleTemplateFieldChange(field, e.target.value)}
                                                    style={{ borderRadius: '6px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}

                        <div className="bg-white border rounded p-3">
                            <h6 className="small fw-bold text-muted mb-3">AUTRES DÉTAILS PERSONNALISÉS</h6>
                            <Row className="g-2 mb-3 align-items-end">
                                <Col md={5}>
                                    <Form.Control
                                        size="sm"
                                        type="text"
                                        placeholder="Libellé (ex: Garantie)"
                                        value={newAttribute.label}
                                        onChange={e => setNewAttribute({ ...newAttribute, label: e.target.value })}
                                    />
                                </Col>
                                <Col md={5}>
                                    <Form.Control
                                        size="sm"
                                        type="text"
                                        placeholder="Valeur (ex: 2 ans)"
                                        value={newAttribute.value}
                                        onChange={e => setNewAttribute({ ...newAttribute, value: e.target.value })}
                                    />
                                </Col>
                                <Col md={2}>
                                    <Button size="sm" variant="outline-dark" className="w-100" onClick={addAttribute}>
                                        <i className="bi bi-plus-lg"></i>
                                    </Button>
                                </Col>
                            </Row>

                            {/* List of non-template attributes if any, or all if no template */}
                            {currentProduct.attributes && currentProduct.attributes.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                    {currentProduct.attributes
                                        .filter(attr => !getTemplateKey(currentProduct.category) || !ATTRIBUTE_TEMPLATES[getTemplateKey(currentProduct.category)].includes(attr.label))
                                        .map((attr, idx) => (
                                            <div key={idx} className="d-flex align-items-center bg-light border rounded ps-3 pe-2 py-1">
                                                <span className="text-muted small me-1">{attr.label}:</span>
                                                <span className="fw-bold small">{attr.value}</span>
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0 ms-2 d-flex align-items-center"
                                                    style={{ textDecoration: 'none' }}
                                                    onClick={() => {
                                                        const realIndex = currentProduct.attributes.indexOf(attr);
                                                        removeAttribute(realIndex);
                                                    }}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </Button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
                </Modal.Footer>
            </Modal>
            {/* Barcode Scanner Modal for new/edit */}
            <BarcodeScanner
                show={showScanner}
                onHide={() => setShowScanner(false)}
                onScan={(code) => setCurrentProduct({ ...currentProduct, barcode: code })}
            />

            {/* Barcode Scanner Modal for search */}
            <BarcodeScanner
                show={showSearchScanner}
                onHide={() => setShowSearchScanner(false)}
                onScan={(code) => setSearchTerm(code)}
            />
        </div>
    );
};

export default AdminProducts;
