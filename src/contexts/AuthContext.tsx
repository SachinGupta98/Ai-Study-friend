import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/authService';
import { clearToken } from '../services/apiService';
import Spinner from '../components/Spinner';

interface AuthContextType {
    currentUser: string | null;
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // On mount: check if there's a stored JWT and validate it with the backend
        const checkSession = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);
            } catch {
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();

        // Listen for the 'auth:logout' event dispatched by apiService when a 401 is received
        const handleForcedLogout = () => {
            setCurrentUser(null);
        };
        window.addEventListener('auth:logout', handleForcedLogout);

        return () => {
            window.removeEventListener('auth:logout', handleForcedLogout);
        };
    }, []);

    const login = (username: string) => {
        setCurrentUser(username);
    };

    const logout = async () => {
        await apiLogout();
        clearToken();
        setCurrentUser(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--color-background-start)]">
                <Spinner />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
