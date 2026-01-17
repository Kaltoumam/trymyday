import { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext(null);

export const CATEGORIES = {
    'Femme': {
        icon: 'bi-person',
        groups: {
            'Vêtements': ['Robes', 'Chemisiers', 'Jeans', 'Jupes', 'T-shirts', 'Vestes'],
            'Chaussures': ['Baskets', 'Bottines', 'Talons', 'Sandales'],
            'Sacs': ['Sacs à main', 'Sacs bandoulière', 'Pochettes', 'Cabas'],
            'Accessoires': ['Bijoux', 'Montres', 'Lunettes']
        }
    },
    'Homme': {
        icon: 'bi-person',
        groups: {
            'Vêtements': ['Chemises', 'Pantalons', 'Pulls', 'T-shirts', 'Costumes', 'Polos'],
            'Chaussures': ['Baskets', 'Mocassins', 'Bottes'],
            'Sacs': ['Sacs à dos', 'Sacs de sport', 'Sacoches'],
            'Accessoires': ['Montres', 'Ceintures', 'Cravates']
        }
    },
    'Enfant': {
        icon: 'bi-emoji-smile',
        groups: {
            'Bébé': ['Bodys', 'Ensembles'],
            'Garçon': ['T-shirts', 'Pantalons', 'Vestes'],
            'Fille': ['Robes', 'Jupes', 'Pantalons'],
            'Sacs': ['Cartables', 'Sacs à dos', 'Trousses'],
            'Jouets': ['Éveil', 'Jeux de société', 'Poupées']
        }
    },
    'Maison & Meuble': {
        icon: 'bi-house',
        groups: {
            'Décoration': ['Lampes', 'Vases', 'Coussins', 'Tableaux'],
            'Mobilier': ['Chaises', 'Tables', 'Canapés'],
            'Linge de maison': ['Draps', 'Serviettes', 'Région']
        }
    },
    'Cosmétique': {
        icon: 'bi-magic',
        groups: {
            'Maquillage': ['Teint', 'Yeux', 'Lèvres'],
            'Soins': ['Visage', 'Corps', 'Cheveux'],
            'Parfums': ['Homme', 'Femme', 'Coffrets']
        }
    },
    'Chaussures': {
        icon: 'bi-handbag',
        groups: {
            'Sports': ['Baskets', 'Running', 'Football'],
            'Ville': ['Mocassins', 'Bottes', 'Chaussures de ville'],
            'Soirée': ['Talons', 'Escarpins', 'Sandales chic']
        }
    },
    'Sacs': {
        icon: 'bi-bag',
        groups: {
            'Modèles': ['Sacs à main', 'Sacs à dos', 'Pochettes', 'Cabas'],
            'Usage': ['Voyage', 'Sport', 'Bureau', 'Soirée'],
            'Matières': ['Cuir', 'Simili', 'Tissu']
        }
    },
    'Électronique': {
        icon: 'bi-display',
        groups: {
            'Mobile': ['Smartphones', 'Accessoires'],
            'Audio': ['Casques', 'Enceintes'],
            'Informatique': ['PC Portables', 'Périphériques'],
        }
    }
};

const initialReviews = [
    { id: 101, productId: 1, userId: 10, userName: 'Alice', rating: 5, comment: 'Excellent casque, le son est pur !', date: '2024-06-15' },
    { id: 102, productId: 1, userId: 11, userName: 'Bob', rating: 4, comment: 'Très confortable, un peu cher mais vaut le coup.', date: '2024-06-18' },
    { id: 103, productId: 2, userId: 12, userName: 'Charlie', rating: 5, comment: 'Superbe montre, très fluide.', date: '2024-06-20' },
];

// Keep users/expenses/questions for now as they are less critical or handled differently effectively
const initialUsers = [
    { id: 1, name: 'Jean Dupont', email: 'jean@test.com', role: 'client', joined: '2025-01-15' },
    { id: 2, name: 'Admin User', email: 'Trymyday235@gmail.com', role: 'admin', joined: '2025-01-01' },
];

const initialExpenses = [
    { id: 1, description: 'Stock initial', amount: 325000, category: 'Stock', date: '2025-12-01' },
    { id: 2, description: 'Publicité Facebook', amount: 32500, category: 'Marketing', date: '2025-12-15' },
];

const initialHelpQuestions = [
    { id: 1, question: "Comment puis-je modifier mon adresse de livraison ?", answer: "Vous pouvez le faire dans votre profil, section 'Mes adresses'.", status: 'approved', date: '2025-12-20', userName: 'Alice' },
    { id: 2, question: "Acceptez-vous le paiement en cryptomonnaie ?", answer: "Pas encore, mais nous y travaillons !", status: 'approved', date: '2025-12-22', userName: 'Bob' },
];

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem('users');
        const userList = savedUsers ? JSON.parse(savedUsers) : initialUsers;
        const today = new Date().toISOString().split('T')[0];
        return userList.map(u => ({
            ...u,
            joined: (u.joined && u.joined !== '2025-01-01') ? u.joined : today
        }));
    });

    const [expenses, setExpenses] = useState(() => {
        const savedExpenses = localStorage.getItem('expenses');
        return savedExpenses ? JSON.parse(savedExpenses) : initialExpenses;
    });
    const [reviews, setReviews] = useState(initialReviews);
    const [helpQuestions, setHelpQuestions] = useState(() => {
        const saved = localStorage.getItem('helpQuestions');
        return saved ? JSON.parse(saved) : initialHelpQuestions;
    });

    // Fetch Products and Orders from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const prodRes = await fetch('http://localhost:3001/api/products');
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProducts(prodData);
                }

                // Fetch Orders
                const orderRes = await fetch('http://localhost:3001/api/orders');
                if (orderRes.ok) {
                    const orderData = await orderRes.json();
                    setOrders(orderData);
                }

                // Fetch Users (for Admin view)
                const userRes = await fetch('http://localhost:3001/api/admin/wallet/users');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.success) {
                        setUsers(userData.users);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Persist users to localStorage (Legacy)
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    // Persist expenses to localStorage (Legacy)
    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    // Persist help questions to localStorage (Legacy)
    useEffect(() => {
        localStorage.setItem('helpQuestions', JSON.stringify(helpQuestions));
    }, [helpQuestions]);


    const addProduct = async (product) => {
        try {
            const newProduct = { ...product, id: Date.now(), images: product.images || [product.image] };

            // Optimistic update
            setProducts(prev => [...prev, newProduct]);

            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if (!response.ok) {
                // Revert on failure not implemented for simplicity, but acceptable for MPV
                console.error("Failed to save product to backend");
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        try {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));

            await fetch(`http://localhost:3001/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const deleteProduct = async (id) => {
        try {
            setProducts(prev => prev.filter(p => p.id !== id));

            await fetch(`http://localhost:3001/api/products/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const addReview = (newReview) => {
        setReviews([...reviews, { ...newReview, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
    };

    // Add new order
    const addOrder = async (orderData) => {
        const newOrder = {
            id: orderData.id || `CMD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerName: orderData.customerName || 'Client',
            email: orderData.email,
            date: new Date().toISOString().split('T')[0],
            total: orderData.total,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            status: orderData.status || 'En attente',
            items: orderData.items || [],
            shippingAddress: orderData.shippingAddress,
            phone: orderData.phone,
            paymentMethod: orderData.paymentMethod
        };

        // Optimistic UI
        setOrders(prevOrders => [newOrder, ...prevOrders]);

        try {
            await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });
        } catch (error) {
            console.error("Error saving order:", error);
        }

        return newOrder;
    };

    // Update existing order
    const updateOrder = async (id, updatedData) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, ...updatedData } : o));

        try {
            await fetch(`http://localhost:3001/api/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const addExpense = (expense) => {
        const newExpense = { ...expense, id: Date.now() };
        setExpenses([newExpense, ...expenses]);
    };

    const updateExpense = (id, updatedExpense) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e));
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const addHelpQuestion = (questionData) => {
        const newQ = {
            id: Date.now(),
            ...questionData,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            answer: ''
        };
        setHelpQuestions([newQ, ...helpQuestions]);
    };

    const updateHelpQuestion = (id, updatedData) => {
        setHelpQuestions(helpQuestions.map(q => q.id === id ? { ...q, ...updatedData } : q));
    };

    const deleteHelpQuestion = (id) => {
        setHelpQuestions(helpQuestions.filter(q => q.id !== id));
    };

    return (
        <DataContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct, loading,
            orders, setOrders, addOrder, updateOrder,
            users, setUsers,
            expenses, addExpense, updateExpense, deleteExpense,
            reviews, addReview,
            helpQuestions, addHelpQuestion, updateHelpQuestion, deleteHelpQuestion
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
