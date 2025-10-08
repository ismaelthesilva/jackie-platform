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
    try {
      console.log('Loading user profile for ID:', userId); // Debug log
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle specific database errors
        if (error.code === 'PGRST116') {
          console.warn('No user profile found for user:', userId, '- This might be expected for new users');
          return;
        }
        if (error.code === '42P01') {
          console.warn('user_profiles table does not exist yet - Please run the database schema');
          return;
        }
        
        // Better error logging for Supabase errors
        console.error('Supabase error loading user profile:');
        console.error('- User ID:', userId);
        console.error('- Message:', error.message || 'No message');
        console.error('- Details:', error.details || 'No details');  
        console.error('- Hint:', error.hint || 'No hint');
        console.error('- Code:', error.code || 'No code');
        console.error('- Full error:', error);
        return;
      }

      if (data) {
        console.log('✅ User profile loaded successfully:', {
          id: data.id,
          email: data.email,
          role: data.role,
          fullName: data.full_name
        });
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
        console.log('🔐 Admin status:', data.role === 'admin');
      } else {
        console.warn('No user profile data returned for user:', userId);
      }
    } catch (error) {
      // Better error logging for JavaScript errors
      console.error('JavaScript error in loadUserProfile:');
      console.error('- User ID:', userId);
      console.error('- Error type:', typeof error);
      console.error('- Message:', error instanceof Error ? error.message : 'Unknown error type');
      console.error('- Name:', error instanceof Error ? error.name : 'Unknown');
      console.error('- Stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('- Full error:', error);
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
        } else {
          console.log('❌ No user in session');
        }
      } catch (error) {
        console.warn('Supabase not configured properly:', error);
        // Continue without auth if Supabase is not configured
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Loading profile for user:', session.user.email);
          await loadUserProfile(session.user.id);
        } else {
          console.log('🚪 User signed out, clearing profile');
          setUserProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Could not set up auth listener:', error);
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
