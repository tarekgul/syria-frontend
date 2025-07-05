// MyTripsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button,
  Menu, MenuItem, Divider, ListSubheader
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function MyTripsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [bgIndex, setBgIndex] = useState(0);
  const images = [bg1, bg2, bg3];

  const [anchorEl, setAnchorEl] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/provinces').then(r => r.json()).then(setProvinces);
    fetch('http://localhost:5000/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/plans/my-plans', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setPlans(data.reverse());
        } else {
          alert(data.error || 'فشل في تحميل الخطط');
        }
      } catch (err) {
        alert('حدث خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <>
      {/* الخلفية */}
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

      {/* شريط التنقل */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 2 }}>
            زور سوريا
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>الرئيسية</Button>
          <Button color="inherit" onClick={handleOpen} endIcon={<ArrowDropDownIcon />}>استكشف</Button>
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

      {/* قائمة الاستكشاف */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ mt: 1, borderRadius: 2, minWidth: 240 }}
      >
        <MenuItem onClick={() => { navigate('/discover'); handleClose(); }}>
          جميع الوجهات
        </MenuItem>
        <Divider />
        <ListSubheader disableSticky>التصنيفات</ListSubheader>
        {categories.map(cat => (
          <MenuItem key={cat._id} onClick={() => { navigate(`/discover?category=${cat._id}`); handleClose(); }}>
            {cat.name}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader disableSticky>المحافظات</ListSubheader>
        {provinces.map(prov => (
          <MenuItem key={prov._id} onClick={() => { navigate(`/discover?province=${prov._id}`); handleClose(); }}>
            {prov.name}
          </MenuItem>
        ))}
      </Menu>

      {/* محتوى الرحلات */}
      <Container dir="rtl" sx={{ mt: 12, color: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom>📋 رحلاتي المحفوظة</Typography>
        {loading ? (
          <Typography align="center">...جارٍ التحميل</Typography>
        ) : plans.length === 0 ? (
          <Typography align="center">لا توجد أي رحلات محفوظة بعد.</Typography>
        ) : (
          plans.map((planItem, index) => (
            <Box key={index} sx={{ my: 4, p: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🧳 رحلة {plans.length - index} ({planItem.mode === 'auto' ? 'تخطيط تلقائي' : 'تخطيط يدوي'})
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                📅 التاريخ: {new Date(planItem.createdAt).toLocaleString()}
              </Typography>
              {planItem.plan.map((dayCards, dayIndex) => (
                <Box key={dayIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🗓️ اليوم {dayIndex + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
{dayCards.map((card, cardIndex) => (
  <Box
    key={cardIndex}
    sx={{
      p: 1,
      minWidth: 250,
      border: '1px solid #ccc',
      borderRadius: 2,
      bgcolor: 'rgba(255,255,255,0.8)',
      color: '#000'
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold">
      📍 {card.title}
    </Typography>
    <Typography variant="body2" color="gray">
      {card.province?.name} - {card.category?.name}
    </Typography>
  </Box>
))}

                  </Box>
                </Box>
              ))}
            </Box>
          ))
        )}
        <Box textAlign="center" mt={3}>
          <Button variant="contained" onClick={() => navigate('/plan')}>🔙 العودة لتخطيط الرحلة</Button>
        </Box>
      </Container>
    </>
  );
}
