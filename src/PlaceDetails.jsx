// src/PlaceDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Divider,
  Rating,
  Stack,
  AppBar,
  Toolbar
} from '@mui/material';
import { Star } from '@mui/icons-material';

export default function PlaceDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const API = 'https://syria-backend.onrender.com';

  const [card, setCard] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
fetch(`${API}/api/cards/${slug}`)
      .then(res => res.json())
      .then(setCard)
      .catch(err => console.error(err));
  }, [slug]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

await fetch(`${API}/api/cards/${card._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text: commentText })
    });

    setCommentText('');
    window.location.reload();
  };

  const handleAddRating = async () => {
    if (!ratingValue) return;

await fetch(`${API}/api/cards/${card._id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ value: Number(ratingValue) })
    });

    setRatingValue(0);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!card) return <Typography>جارٍ التحميل...</Typography>;

  const averageRating = card.ratings?.length
    ? (card.ratings.reduce((acc, r) => acc + r.value, 0) / card.ratings.length).toFixed(1)
    : null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${card.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: -1
        }
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1, direction: 'ltr' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            زور سوريا
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>الرئيسية</Button>
          <Button color="inherit" onClick={() => navigate('/discover')}>استكشف</Button>
          <Button color="inherit" onClick={() => navigate('/plan')}>خطط رحلتك</Button>
          <Button color="inherit" onClick={() => navigate('/contact')}>تواصل معنا</Button>

          {user ? (
            <>
              <Typography sx={{ mx: 2 }}>{user.name}</Typography>
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

      <Container maxWidth="md" sx={{ mt: 4, position: 'relative', zIndex: 1, direction: 'rtl' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(4px)', direction: 'rtl' }}>
          <Typography variant="h4" gutterBottom>{card.title}</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>{card.content}</Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">التقييم العام:</Typography>
            {averageRating ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={Number(averageRating)} readOnly precision={0.5} />
                <Typography>{averageRating} / 5</Typography>
              </Stack>
            ) : (
              <Typography>لا يوجد تقييم بعد</Typography>
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              التعليقات:
            </Typography>
            {card.comments.length > 0 ? (
              card.comments.map((c, i) => (
                <Paper key={i} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)', direction: 'rtl' }} elevation={1}>
                  <Typography variant="subtitle2" sx={{ color: 'gray' }}>{c.user?.name || 'مستخدم'}</Typography>
                  <Typography>{c.text}</Typography>
                </Paper>
              ))
            ) : (
              <Typography>لا توجد تعليقات بعد.</Typography>
            )}
          </Box>

          {user ? (
            <Box>
              <Typography variant="h6" gutterBottom>أضف تعليقاً أو قيماً هذا المكان:</Typography>

              <TextField
                label="تعليقك"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ bgcolor: '#fff', borderRadius: 1, direction: 'rtl' }}
                inputProps={{ style: { textAlign: 'right' } }}
              />

              <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ mt: 1 }}>
                إرسال التعليق
              </Button>

              <Box mt={3}>
                <Typography gutterBottom>التقييم:</Typography>
                <Rating
                  value={Number(ratingValue)}
                  onChange={(e, newValue) => setRatingValue(newValue)}
                  precision={1}
                  icon={<Star fontSize="inherit" />} />
                <Button variant="outlined" onClick={handleAddRating} sx={{ ml: 2, mt: 1 }}>
                  إرسال التقييم
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography color="error" sx={{ mt: 2 }}>
              يجب تسجيل الدخول لتتمكن من إضافة تعليق أو تقييم.
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}