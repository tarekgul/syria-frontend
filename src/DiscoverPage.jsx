import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, MenuItem, TextField, Card, CardMedia,
  CardContent, Button, AppBar, Toolbar, Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, Divider, ListSubheader } from '@mui/material';

import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';
const selectSX = {
  '& .MuiOutlinedInput-root': {
    height: 72,              // ارتفاع الحقل
    padding: 0,              // لإلغاء البادينج الافتراضي
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',       // حشوة نصية أفقية
    fontSize: '1.2rem',      // حجم الخط داخل الاختيار
    height: '100%',          // ليمتد للارتفاع الكامل
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.2rem',      // حجم خطّ اللابل
    top: '-6px',             // ضبط الارتفاع للّابل
  },
};


export default function DiscoverPage() {
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
const API = 'https://syria-backend.onrender.com';

  const navigate = useNavigate();
  const location = useLocation();
  const images = [bg1, bg2, bg3];

useEffect(() => {
  fetch(`${API}/api/provinces`).then(res => res.json()).then(setProvinces);
  fetch(`${API}/api/categories`).then(res => res.json()).then(setCategories);
}, []);


useEffect(() => {
  const params = new URLSearchParams(location.search);
  const province = params.get('province') || '';
  const category = params.get('category') || '';
  const search = params.get('search') || '';

  setSelectedProvince(province);
  setSelectedCategory(category);

  let url = `${API}/api/cards`;

  if (search) {
    url += `?search=${encodeURIComponent(search)}`;
  } else if (province || category) {
    const query = new URLSearchParams();
    if (province) query.append('province', province);
    if (category) query.append('category', category);
    url += `/filter?${query.toString()}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(setCards);
}, [location.search]);


  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const [anchorEl, setAnchorEl] = useState(null);
const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});
const handleOpen = (e) => setAnchorEl(e.currentTarget);
const handleClose = () => setAnchorEl(null);
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/');
};


  return (
    <>
      {/* الخلفية المغبشة */}
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

      {/* شريط علوي */}
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
    </Button>
    <Button color="inherit" onClick={() => navigate('/plan')}>خطط رحلتك</Button>
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
    onMouseLeave: handleClose,
    'aria-labelledby': 'explore-button'
  }}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
  elevation={2}
  sx={{ mt: 1, borderRadius: 2, minWidth: 240 }}
>
  <MenuItem component="a" href="/discover" onClick={handleClose}>
    جميع الوجهات
  </MenuItem>
  <Divider />
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


      {/* المحتوى */}
<Container sx={{ py: 4, position: 'relative', zIndex: 1, mt: 10 }}>
        <Typography variant="h4" gutterBottom color="#fff">استكشف الوجهات</Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
 <TextField
           select
           fullWidth
           label="اختر محافظة"
           value={selectedProvince}
           onChange={e => {
             const prov = e.target.value;
             const p = new URLSearchParams(location.search);
             if (prov) p.set('province', prov);
             else p.delete('province');
             // ضيف الباراميتر الثاني (category) إذا موجود
             navigate(`/discover?${p.toString()}`);
           }}
                      SelectProps={{
               // هذا هو المفتاح لإظهار الـ MenuItem ذات القيمة الفارغة
               displayEmpty: true
             }}
             // هذا يتأكد من أن اللابل يطفو لأعلى في كل الأحوال
             InputLabelProps={{ shrink: true }}
           sx={selectSX}
         >


              <MenuItem value="">الكل</MenuItem>
              {provinces.map((prov) => (
                <MenuItem key={prov._id} value={prov._id}>{prov.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
         <TextField
           select
           fullWidth
           label="اختر القسم"
           value={selectedCategory}
           onChange={e => {
             const cat = e.target.value;
             const p = new URLSearchParams(location.search);
             if (cat) p.set('category', cat);
             else p.delete('category');
             // ضيف الباراميتر الأول (province) إذا موجود
             navigate(`/discover?${p.toString()}`);
           }}
 SelectProps={{
               displayEmpty: true
             }}
             InputLabelProps={{ shrink: true }}
           sx={selectSX}
         >


              <MenuItem value="">الكل</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 4,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)'
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={card.image}
                  alt={card.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/place/${card.slug}`)}
                  >
                    عرض المزيد
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {cards.length === 0 && (
          <Typography variant="body2" color="#eee" sx={{ mt: 4 }}>
            لا توجد بطاقات مطابقة.
          </Typography>
        )}
      </Container>
    </>
  );
}
