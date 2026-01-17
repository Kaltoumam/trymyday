import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Available coupons
const AVAILABLE_COUPONS = {
    'WELCOME10': { discount: 10, type: 'percentage', description: 'Réduction de 10%' },
    'SAVE20': { discount: 20, type: 'percentage', description: 'Réduction de 20%' },
    'FREESHIP': { discount: 0, type: 'free_shipping', description: 'Livraison gratuite' },
    'FIXED50': { discount: 32500, type: 'fixed', description: 'Réduction de 32 500 FCFA' },
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    // Cart items
    const [cartItems, setCartItems] = useState([]);

    // Saved items (save for later)
    const [savedItems, setSavedItems] = useState([]);

    // Coupon state
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Load cart execution when user changes
    useEffect(() => {
        if (user) {
            const savedCart = localStorage.getItem(`cart_${user.email}`);
            setCartItems(savedCart ? JSON.parse(savedCart) : []);

            const savedSavedItems = localStorage.getItem(`savedItems_${user.email}`);
            setSavedItems(savedSavedItems ? JSON.parse(savedSavedItems) : []);
        } else {
            // Optional: Support guest cart by using a generic 'cart' key, 
            // OR strictly follow user request to empty on logout.
            // Following strict user request: "le panier doit se vider" on logout.
            setCartItems([]);
            setSavedItems([]);
        }
    }, [user]);

    // Persist cart to localStorage (User specific)
    useEffect(() => {
        if (user) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    // Persist saved items to localStorage (User specific)
    useEffect(() => {
        if (user) {
            localStorage.setItem(`savedItems_${user.email}`, JSON.stringify(savedItems));
        }
    }, [savedItems, user]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: Number(quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setAppliedCoupon(null);
    };

    // Save for later functionality
    const saveForLater = (id) => {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            setSavedItems(prev => [...prev, item]);
            removeFromCart(id);
        }
    };

    const moveToCart = (id) => {
        const item = savedItems.find(item => item.id === id);
        if (item) {
            addToCart(item);
            setSavedItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const removeSavedItem = (id) => {
        setSavedItems(prev => prev.filter(item => item.id !== id));
    };

    // Coupon functionality
    const applyCoupon = (code) => {
        const coupon = AVAILABLE_COUPONS[code.toUpperCase()];
        if (coupon) {
            setAppliedCoupon({ code: code.toUpperCase(), ...coupon });
            return { success: true, message: `Coupon "${code}" appliqué avec succès!` };
        }
        return { success: false, message: 'Code promo invalide' };
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    // Calculate subtotal
    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate shipping cost
    const getShippingCost = () => {
        if (appliedCoupon?.type === 'free_shipping') return 0;
        return 1000; // Further reduced flat shipping
    };

    // Calculate tax (5% TVA)
    const getTax = () => {
        return 0; // Tax removed as requested
    };

    // Calculate discount
    const getDiscount = () => {
        if (!appliedCoupon) return 0;
        const subtotal = getSubtotal();

        if (appliedCoupon.type === 'percentage') {
            return subtotal * (appliedCoupon.discount / 100);
        } else if (appliedCoupon.type === 'fixed') {
            return Math.min(appliedCoupon.discount, subtotal);
        }
        return 0;
    };

    // Calculate final total
    const getCartTotal = () => {
        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        const tax = getTax();
        const discount = getDiscount();

        return Math.max(0, subtotal + shipping + tax - discount);
    };

    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            savedItems,
            appliedCoupon,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            saveForLater,
            moveToCart,
            removeSavedItem,
            applyCoupon,
            removeCoupon,
            getSubtotal,
            getShippingCost,
            getTax,
            getDiscount,
            getCartTotal,
            getCartCount,
            availableCoupons: AVAILABLE_COUPONS
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
