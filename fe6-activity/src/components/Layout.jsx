import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children, logout }) => {
  return (
    <>
      <Navbar logout={logout} />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout; 