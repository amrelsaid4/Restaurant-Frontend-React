import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkUserType, loginUser, loginAdmin, logoutUser, fetchCSRFToken, authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: true,
        error: null,
        initialized: false
    });

    const updateAuthState = (newState) => {
        console.log('🔄 Updating auth state:', newState);
        setAuthState(prevState => {
            const updatedState = { ...prevState, ...newState };
            console.log('🔄 New auth state:', updatedState);
            return updatedState;
        });
    };

    const saveSessionData = (sessionKey, userData) => {
        console.log('💾 Saving session data to localStorage');
        localStorage.setItem('session_key', sessionKey);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    const clearSessionData = () => {
        console.log('🗑️ Clearing session data from localStorage');
        localStorage.removeItem('session_key');
        localStorage.removeItem('user_data');
    };

    const loadSessionData = () => {
        const sessionKey = localStorage.getItem('session_key');
        const userData = localStorage.getItem('user_data');
        
        if (sessionKey && userData) {
            try {
                const user = JSON.parse(userData);
                console.log('📋 Loaded session data from localStorage:', { sessionKey: !!sessionKey, user });
                return { sessionKey, user };
            } catch (error) {
                console.error('❌ Failed to parse stored user data:', error);
                clearSessionData();
            }
        }
        return null;
    };

    const checkAuthStatus = async () => {
        try {
            console.log('🔍 Checking auth status...');
            const data = await checkUserType();
            console.log('✅ Auth status response:', data);
            
            if (data.is_authenticated) {
                const userData = {
                    id: data.user_id,
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name || data.username,
                    last_name: data.last_name || '',
                    is_admin: data.is_admin,
                    is_customer: data.is_customer
                };

                const newAuthState = {
                    isAuthenticated: true,
                    isAdmin: data.is_admin,
                    user: userData,
                loading: false,
                    error: null,
                    initialized: true
            };
            
                updateAuthState(newAuthState);
                
                // Save to localStorage if we have session data
                const sessionKey = localStorage.getItem('session_key');
                if (sessionKey) {
                    saveSessionData(sessionKey, userData);
                }
                
                return newAuthState;
            } else {
                const errorState = {
                    isAuthenticated: false,
                    isAdmin: false,
                    user: null,
                    loading: false,
                    error: null,
                    initialized: true
                };
                updateAuthState(errorState);
                clearSessionData();
                return errorState;
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            const errorState = {
                isAuthenticated: false,
                isAdmin: false,
                user: null,
                loading: false,
                error: error.message,
                initialized: true
            };
            updateAuthState(errorState);
            clearSessionData();
            return errorState;
        }
    };

    const login = async (credentials) => {
        try {
            console.log('🔐 Customer login attempt:', { identity: credentials.identity });
            updateAuthState({ loading: true, error: null });
            
            const data = await loginUser(credentials);
            console.log('✅ Customer login response:', data);
            
            // Save session key if provided
            if (data.session_key) {
                localStorage.setItem('session_key', data.session_key);
            }
            
            // Check auth status and wait for complete update
            const authStatus = await checkAuthStatus();
            console.log('✅ Customer login complete, final auth state:', authStatus);
            
            return { success: true, authStatus };
        } catch (error) {
            console.error('❌ Customer login failed:', error);
            updateAuthState({
                loading: false,
                error: error.message,
                initialized: true
            });
            return { success: false, error: error.message };
        }
    };

    const adminLogin = async (credentials) => {
        try {
            console.log('🔐 Admin login attempt:', { email: credentials.email });
            updateAuthState({ loading: true, error: null });
            
            const data = await loginAdmin(credentials);
            console.log('✅ Admin login response:', data);
            
            // Save session key if provided
            if (data.session_key) {
                localStorage.setItem('session_key', data.session_key);
            }
            
            // Check auth status and wait for complete update
            const authStatus = await checkAuthStatus();
            console.log('✅ Admin login complete, final auth state:', authStatus);
            
            return { success: true, authStatus };
        } catch (error) {
            console.error('❌ Admin login failed:', error);
            updateAuthState({
                loading: false,
                error: error.message,
                initialized: true
            });
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 Logout attempt...');
            await logoutUser();
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('⚠️ Logout error (ignored):', error);
        } finally {
            updateAuthState({
                isAuthenticated: false,
                isAdmin: false,
                user: null,
                loading: false,
                error: null,
                initialized: true
            });
            clearSessionData();
            console.log('✅ Auth state cleared');
        }
    };

    // Initialize auth on app start
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('🚀 Initializing auth...');
                
                // Test backend connection first
                try {
                    await authAPI.testConnection();
                    console.log('✅ Backend connection successful');
                } catch (error) {
                    console.error('❌ Backend connection failed:', error.message);
                    // Continue anyway, maybe it's just the health check endpoint
                }
                
                // Try to fetch CSRF token on app init
                await fetchCSRFToken();
                console.log('🔑 CSRF token fetched');
                
                // Check for stored session first
                const storedSession = loadSessionData();
                if (storedSession) {
                    console.log('📋 Found stored session, verifying with server...');
                    // Verify stored session with server
                    await checkAuthStatus();
                } else {
                    console.log('📋 No stored session, checking server...');
                    // No stored session, check server anyway
                    await checkAuthStatus();
                    }
                
                console.log('✅ Auth initialization complete');
            } catch (error) {
                console.error('❌ Auth initialization failed:', error);
                updateAuthState({ 
                    loading: false, 
                    initialized: true,
                    isAuthenticated: false,
                    isAdmin: false,
                    user: null,
                    error: null
                });
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            ...authState, 
            login, 
            adminLogin, 
            logout, 
            checkAuth: checkAuthStatus,
            updateAuthState
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 