'use client'

// Authentication Context
// Manages user authentication state throughout the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserProfile = async (userId: string) => {
    // Check if Supabase is properly configured first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_project_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');

    if (!isConfigured) {
      // Silently skip profile loading if Supabase is not configured
      console.log('🔕 Supabase not configured - skipping profile load');
      return;
    }

    try {
      console.log('Loading user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle specific database errors quietly
        if (error.code === 'PGRST116') {
          console.log('No user profile found for user:', userId, '- This might be expected for new users');
          return;
        }
        if (error.code === '42P01') {
          console.log('user_profiles table does not exist yet - Please run the database schema');
          return;
        }
        
        // Only log if in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('Supabase error loading user profile:', error.message);
        }
        return;
      }

      if (data) {
        console.log('✅ User profile loaded successfully for:', data.email);
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error loading user profile:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_project_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');

    if (!isConfigured) {
      console.log('🔕 Supabase not configured - Auth disabled');
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial auth session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session:', session ? 'Found' : 'Not found');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found in session:', session.user.email);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth initialization error:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Auth state change:', event);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Could not set up auth listener:', error instanceof Error ? error.message : 'Unknown error');
      }
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
