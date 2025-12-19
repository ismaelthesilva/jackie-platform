'use client'

import React from 'react';
import Auth from '@/components/Auth';

const Register: React.FC = () => {
  return <Auth mode="register" redirectTo="/dashboard" />;
};

export default Register;
