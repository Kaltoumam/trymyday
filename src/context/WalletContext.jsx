import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch wallet balance from backend
    const fetchBalance = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // ... (existing imports)

            // Inside the component
            const response = await fetch(`${API_BASE_URL}/api/wallet/balance?email=${user.email}`);
            const data = await response.json();

            if (data.success) {
                const newBalance = data.balance || 0;
                setBalance(newBalance);

                // Optional: Sync user object in AuthContext if needed
                if (user.balance !== newBalance) {
                    updateUser({ ...user, balance: newBalance });
                }
            }
        } catch (error) {
            console.error('Error fetching balance from API:', error);
            // Fallback to local storage if API fails
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = localUsers.find(u => u.email === user.email);
            if (currentUser) setBalance(currentUser.balance || 0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transaction history from backend
    const fetchTransactions = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/wallet/transactions?email=${user.email}`);
            const data = await response.json();

            if (data.success) {
                let userTransactions = data.transactions || [];

                // Restriction pour les managers : 30 derniers jours
                if (user?.role === 'manager') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    userTransactions = userTransactions.filter(tx => new Date(tx.date) >= thirtyDaysAgo);
                }

                setTransactions(userTransactions);
            }
        } catch (error) {
            console.error('Error fetching transactions from API:', error);
            // Fallback
            const allTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            const userTransactions = allTransactions.filter(tx => tx.userEmail === user.email)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(userTransactions);
        }
    };

    // Pay with wallet
    const payWithWallet = async (amount, orderId) => {
        if (!user) {
            return { success: false, message: 'Veuillez vous connecter' };
        }

        try {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = localUsers.findIndex(u => u.email === user.email);

            if (userIndex === -1) {
                return { success: false, message: 'Utilisateur introuvable' };
            }

            if (localUsers[userIndex].balance < amount) {
                return { success: false, message: 'Solde insuffisant' };
            }

            // Deduct balance
            const newBalance = localUsers[userIndex].balance - amount;
            localUsers[userIndex].balance = newBalance;
            localStorage.setItem('users', JSON.stringify(localUsers));

            // Record transaction
            const allTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
            const newTransaction = {
                id: Date.now(),
                userId: user.id,
                userEmail: user.email,
                amount: amount,
                type: 'debit',
                description: `Paiement Commande #${orderId}`,
                date: new Date().toISOString(),
                balanceAfter: newBalance
            };
            allTransactions.push(newTransaction);
            localStorage.setItem('wallet_transactions', JSON.stringify(allTransactions));

            // Update local state
            setBalance(newBalance);
            updateUser({ ...user, balance: newBalance });
            fetchTransactions();

            return { success: true, newBalance };
        } catch (error) {
            console.error('Error paying with wallet:', error);
            return { success: false, message: 'Erreur lors du paiement' };
        }
    };

    // Check if user has sufficient balance
    const hasSufficientBalance = (amount) => {
        return balance >= amount;
    };

    // Load balance on user change
    useEffect(() => {
        if (user) {
            fetchBalance();
            fetchTransactions();
        } else {
            setBalance(0);
            setTransactions([]);
        }
    }, [user]);

    // Periodically sync balance (useful if admin updates it in another "tab" or if session needs update)
    useEffect(() => {
        const interval = setInterval(() => {
            if (user) fetchBalance();
        }, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [user]);

    const value = {
        balance,
        transactions,
        loading,
        fetchBalance,
        fetchTransactions,
        payWithWallet,
        hasSufficientBalance
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
