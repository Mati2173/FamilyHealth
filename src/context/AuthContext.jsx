import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Auth Context - Manages user authentication state and profile data
 * Provides authentication methods and user information to the entire application
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (!session) setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                
                if (!session) {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Load user profile data when session changes
    useEffect(() => {
        let mounted = true;

        async function loadUserData() {
            if (session?.user) {
                if (!profile || profile.id !== session.user.id) {
                    const prof = await fetchProfile(session.user.id);
                    if (mounted) {
                        setProfile(prof);
                        setLoading(false);
                    }
                }
            }
        }

        loadUserData();

        return () => { mounted = false; };
    }, [session]);

    // Registers a new user with email and password, and creates user profile
    async function signUp({ email, password, fullName, heightCm, birthDate, gender }) {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;

        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    height_cm: heightCm,
                    birth_date: birthDate,
                    gender: gender,
                })
                .eq('id', data.user.id);

            if (profileError) throw profileError;
        }

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

    // Refreshes the current user's profile data from the database
    async function refreshProfile() {
        if (!user) return;

        const prof = await fetchProfile(user.id);
        setProfile(prof);
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
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
 * - refreshProfile: Function to refresh user's profile data
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
}