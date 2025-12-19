'use client'

import React from 'react';
import Auth from '@/components/Auth';

const Login: React.FC = () => {
  return <Auth mode="login" redirectTo="/dashboard" />;
};

export default Login;
