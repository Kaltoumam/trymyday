import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize user from localStorage (Session persistence)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                const newUser = await response.json();
                setUser(newUser);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Registration error:", error);
            return false;
        }
    };

    const updateUser = (updatedUserData) => {
        // This is primarily for local state updates (e.g. balance change)
        // ideally should sync with backend, but for now we accept the object
        setUser(prev => ({ ...prev, ...updatedUserData }));
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
