// src/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
   AppBar,
   Toolbar,
   Typography,
   Button,
   Container,
   Box,
   Menu,
   MenuItem,
   Divider,
   ListSubheader,
   Stack,
   TextField
 } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import SyriaMap from './SyriaMap';

import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const images = [bg1, bg2, bg3];
  const [bgIndex, setBgIndex] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    fetch('http://localhost:5000/api/provinces').then(r => r.json()).then(setProvinces);
    fetch('http://localhost:5000/api/categories').then(r => r.json()).then(setCategories);
  }, []);

const handleSelectProvince = (provinceName) => {
  const match = provinces.find(p => p.name === provinceName);
  if (match) {
    navigate(`/discover?province=${match._id}`);
  } else {
    navigate(`/discover?search=${encodeURIComponent(provinceName)}`);
  }
};


  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    
  };

  const handleLiveSearch = async (event, value) => {
    setSearchTerm(value);
    if (value.trim()) {
      try {
        const [cardsRes, provincesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/cards?search=${encodeURIComponent(value)}`),
          fetch(`http://localhost:5000/api/provinces?search=${encodeURIComponent(value)}`)
        ]);

        const [cardsData, provincesData] = await Promise.all([
          cardsRes.json(),
          provincesRes.json()
        ]);

const combinedResults = [
  ...cardsData.slice(0, 3).map(item => ({ ...item, type: 'card' })),
  ...provincesData.map(item => ({ ...item, type: 'province' }))
];


        setSearchResults(combinedResults);
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectChange = (event, selectedOption) => {
    if (selectedOption) {
      if (selectedOption.type === 'province') {
        navigate(`/discover?province=${selectedOption._id}`);
      } else if (selectedOption.type === 'card') {
        navigate(`/place/${selectedOption.slug}`);
      }
    }
  };

  const handleSubmitSearch = () => {
    if (searchTerm.trim()) {
      const match = searchResults.find(
        item => (item.type === 'card' && item.title === searchTerm.trim()) ||
                (item.type === 'province' && item.name === searchTerm.trim())
      );

      if (match) {
        if (match.type === 'card') {
          navigate(`/place/${match.slug}`);
        } else if (match.type === 'province') {
          navigate(`/discover?province=${match._id}`);
        }
      } else {
        navigate(`/discover?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/');
};


  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          backgroundImage: `url(${images[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transition: 'background-image 1s ease-in-out',
        }}
      />

<AppBar
  position="fixed"
  sx={{
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: 0,
    padding: 0,
    boxShadow: 'none',
    borderRadius: 0
  }}
>

        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 2 }}>
            زور سوريا
          </Typography>
<Button color="inherit" onClick={() => navigate('/')}>الرئيسية</Button>
 <Button
   color="inherit"
   onClick={handleOpen}
   aria-controls="explore-menu"
   aria-haspopup="true"
   endIcon={<ArrowDropDownIcon />}
   id="explore-button"
 >
   استكشف
 </Button><Button color="inherit" onClick={() => navigate('/plan')}>خطط رحلتك</Button>
<Button color="inherit" onClick={() => navigate('/contact')}>تواصل معنا</Button>

{user ? (
  <>
<Button color="inherit" onClick={() => navigate('/mytrips')}>رحلاتي</Button>
    <Button color="inherit" onClick={handleLogout}>تسجيل الخروج</Button>
  </>
) : (
  <>
    <Button color="inherit" onClick={() => navigate('/login')}>تسجيل الدخول</Button>
    <Button color="inherit" onClick={() => navigate('/register')}>إنشاء حساب</Button>
  </>
)}

        </Toolbar>
      </AppBar>


<Menu
  id="explore-menu"
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
  MenuListProps={{
    onMouseLeave: handleClose,       // يغلق القائمة بلطف عند خروج الفأرة
    'aria-labelledby': 'explore-button'
  }}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
  elevation={2}
  sx={{ mt: 1, borderRadius: 2, minWidth: 240 }}
>
  {/* رابط عام لكل الوجهات */}
  <MenuItem
    component="a"
    href="/discover"
    onClick={handleClose}
  >
    جميع الوجهات
  </MenuItem>
  <Divider />

  {/* تصنيفات */}
  <ListSubheader disableSticky>التصنيفات</ListSubheader>
  {categories.map(cat => (
    <MenuItem
      key={cat._id}
      onClick={() => {
        navigate(`/discover?category=${cat._id}`);
        handleClose();
      }}
    >
      {cat.name}
    </MenuItem>
  ))}
  <Divider />

  {/* محافظات */}
  <ListSubheader disableSticky>المحافظات</ListSubheader>
  {provinces.map(prov => (
    <MenuItem
      key={prov._id}
      onClick={() => {
        navigate(`/discover?province=${prov._id}`);
        handleClose();
      }}
    >
      {prov.name}
    </MenuItem>
  ))}
</Menu>


<Container sx={{ py: 4, position: 'relative', zIndex: 1, mt: 8 }}>
        <Typography variant="h2" align="center" gutterBottom color="#fff">
          اكتشف سحر سوريا
        </Typography>
        <Typography variant="subtitle1" align="center" paragraph color="#eee">
          من الآثار القديمة إلى الطبيعة الخلابة – وجهتك القادمة في انتظارك
        </Typography>

        <Box textAlign="center" mb={3} sx={{ position: 'relative' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) =>
                option.type === 'province' ? `📍 ${option.name}` : option.title || ''
              }
              inputValue={searchTerm}
              onInputChange={handleLiveSearch}
              onChange={handleSelectChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ابحث عن بطاقة أو محافظة..."
                  variant="outlined"
                  sx={{ bgcolor: 'white', borderRadius: 1, minWidth: '400px' }}
                />
              )}
            />
            <Button variant="contained" onClick={handleSubmitSearch}>
              بحث
            </Button>
          </Stack>
        </Box>

        <Box textAlign="center" mb={4}>
  <Button
    variant="outlined"
    sx={{ mx: 1 }}
    onClick={() => navigate('/discover')}
  >
    اكتشف الوجهات
  </Button>
  <Button
    variant="outlined"
    sx={{ mx: 1 }}
    onClick={() => navigate('/plan')}
  >
    خطط رحلتك
  </Button>
</Box>


        <Box
  sx={{
    position: 'relative',
    width: '100%',
    height: 'auto',
    minHeight: 400,
    mt: -6,     // ← هذا يحرك الخريطة للأعلى
    mb: 2,      // ← تقليل المسافة السفلية
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  }}
>
  <SyriaMap provinces={provinces} onSelect={handleSelectProvince} />
</Box>


        {selectedProvince && (
          <Typography variant="h5" align="center" color="#fff">
            المحافظة المختارة: {selectedProvince}
          </Typography>
        )}
      </Container>
    </>
  );
}