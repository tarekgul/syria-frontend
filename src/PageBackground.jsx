// 🔁 استخدم هذا المكون للخلفية الضبابية المتغيرة، مشابه للـ HomePage
import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';

export default function PageBackground({ children }) {
  const images = [bg1, bg2, bg3];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundImage: `url(${images[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transition: 'background-image 1s ease-in-out'
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {children}
      </Container>
    </Box>
  );
}
