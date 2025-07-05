import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Grid, MenuItem, Select, Tab, Tabs, TextField, Typography
} from '@mui/material';

function AdminPage() {
  const [tab, setTab] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [provinceForm, setProvinceForm] = useState({ name: '', image: '', description: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [cardForm, setCardForm] = useState({
    title: '', slug: '', image: '', description: '', content: '', gallery: '',
    province: '', category: '', lat: '', lng: ''
  });

  useEffect(() => {
   fetch('https://syria-backend.onrender.com/api/provinces')
.then(res => res.json()).then(setProvinces);
   fetch('https://syria-backend.onrender.com/api/categories')
.then(res => res.json()).then(setCategories);
   fetch('https://syria-backend.onrender.com/api/cards')
.then(res => res.json()).then(setCards);
  }, []);

  const handleChange = (setFunc, field, value) => setFunc(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (url, data, onSuccess) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      onSuccess();
      window.location.reload();
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>لوحة الإدارة</Typography>
      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
        <Tab label="محافظات" />
        <Tab label="أقسام" />
        <Tab label="بطاقات" />
      </Tabs>

      {tab === 0 && (
        <Box mt={4}>
          <Typography variant="h6">إضافة محافظة</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField label="الاسم" value={provinceForm.name} onChange={e => handleChange(setProvinceForm, 'name', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="الصورة" value={provinceForm.image} onChange={e => handleChange(setProvinceForm, 'image', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="الوصف" value={provinceForm.description} onChange={e => handleChange(setProvinceForm, 'description', e.target.value)} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => handleSubmit('https://syria-backend.onrender.com/api/provinces', provinceForm, () => setProvinceForm({ name: '', image: '', description: '' }))}>➕ إضافة</Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box mt={4}>
          <Typography variant="h6">إضافة قسم</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField label="الاسم" value={categoryForm.name} onChange={e => handleChange(setCategoryForm, 'name', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => handleSubmit('https://syria-backend.onrender.com/api/categories', categoryForm, () => setCategoryForm({ name: '' }))}>➕ إضافة</Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box mt={4}>
          <Typography variant="h6">إضافة بطاقة</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField label="العنوان" value={cardForm.title} onChange={e => handleChange(setCardForm, 'title', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="الرابط (slug)" value={cardForm.slug} onChange={e => handleChange(setCardForm, 'slug', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="الصورة الرئيسية" value={cardForm.image} onChange={e => handleChange(setCardForm, 'image', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="الوصف" value={cardForm.description} onChange={e => handleChange(setCardForm, 'description', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="المحتوى الكامل" value={cardForm.content} onChange={e => handleChange(setCardForm, 'content', e.target.value)} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="صور إضافية (مفصولة بفاصلة)" value={cardForm.gallery} onChange={e => handleChange(setCardForm, 'gallery', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth value={cardForm.province} displayEmpty onChange={e => handleChange(setCardForm, 'province', e.target.value)}>
                <MenuItem value="" disabled>اختر المحافظة</MenuItem>
                {provinces.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth value={cardForm.category} displayEmpty onChange={e => handleChange(setCardForm, 'category', e.target.value)}>
                <MenuItem value="" disabled>اختر القسم</MenuItem>
                {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={6}>
              <TextField label="خط العرض (Latitude)" value={cardForm.lat} onChange={e => handleChange(setCardForm, 'lat', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="خط الطول (Longitude)" value={cardForm.lng} onChange={e => handleChange(setCardForm, 'lng', e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => handleSubmit('https://syria-backend.onrender.com/api/cards', {
                ...cardForm,
                lat: parseFloat(cardForm.lat),
                lng: parseFloat(cardForm.lng),
                gallery: cardForm.gallery.split(',').map(s => s.trim())
              }, () => setCardForm({
                title: '', slug: '', image: '', description: '', content: '',
                gallery: '', province: '', category: '', lat: '', lng: ''
              }))}>➕ إضافة البطاقة</Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default AdminPage;
