import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Auth Context - Manages user authentication state and profile data
 * Provides authentication methods and user information to the entire application
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetches user profile data from Supabase
    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        
        return data;
    }

    // Initialize auth state on component mount and listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user ?? null;

                setUser(prevUser => {
                    if (prevUser?.id === currentUser?.id) return prevUser;
                    else return currentUser;
                });

                
                if (!currentUser) {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Load user profile data when session changes
    useEffect(() => {
        if (!user || (profile && profile.id === user.id)) return;

        async function loadProfile() {
            setLoading(true);

            const prof = await fetchProfile(user.id);

            setProfile(prof);
            setLoading(false);
        }

        loadProfile();
    }, [user]);

    // Registers a new user with email and password, and creates user profile
    async function signUp({ email, password, fullName, heightCm, birthDate, gender, activityLevel }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    height_cm: heightCm,
                    birth_date: birthDate,
                    gender: gender,
                    activity_level: activityLevel,
                    is_public: false,
                }
            }
        });

        if (error) throw error;

        return data;
    }

    // Signs in a user with email and password
    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        return data;
    }

    // Signs out the current user
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
    }

    // Sends a password reset email to the specified email address
    async function sendPasswordResetEmail(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    
        if (error) throw error;
    }

    // Refreshes the current user's profile data from the database
    async function refreshProfile() {
        if (!user) return;

        const prof = await fetchProfile(user.id);
        setProfile(prof);
    }

    // Updates the user's profile information in the database and state
    async function updateUserProfile(updates) {
        if (!user) throw new Error('Usuario no autenticado');

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;

        setProfile(prev => ({ ...prev, ...updates }));
    }

    // Updates the user's authentication information ({ email, password }) and state
    async function updateUserAccount(updates) {
        const { data, error } = await supabase.auth.updateUser(updates);
        
        if (error) throw error;
        
        if (data.user) {
            setUser(data.user);
        }
        
        return data;
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        sendPasswordResetEmail,
        updateUserProfile,
        updateUserAccount,
        refreshProfile,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook to access the authentication context
 * Must be used within an AuthProvider component
 * 
 * Returns an object containing:
 * - user: Current authenticated user object (null if not logged in)
 * - profile: User's profile data from database (null if not loaded)
 * - loading: Boolean indicating if auth state is being loaded
 * - isAuthenticated: Boolean indicating if user is logged in
 * - signUp: Function to register a new user
 * - signIn: Function to login with email and password
 * - signOut: Function to logout the current user
 * - sendPasswordResetEmail: Function to send a password reset email
 * - refreshProfile: Function to refresh user's profile data
 * - updateUserProfile: Function to update user's profile information
 * - updateUserAccount: Function to update user's authentication information (email/password)
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
}