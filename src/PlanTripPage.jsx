// PlanTripPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, Container, FormControlLabel, Grid, TextField,
  Typography, Radio, RadioGroup, FormControl, FormLabel, IconButton, MenuItem, AppBar, Toolbar, Autocomplete, Paper, InputLabel, Select
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Menu, Divider, ListSubheader } from '@mui/material';

import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import bg3 from './images/bg3.jpg';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = angle => angle * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function PlanTripPage() {
  const [bgIndex, setBgIndex] = useState(0);
  const images = [bg1, bg2, bg3];

  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [mode, setMode] = useState('auto');
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [days, setDays] = useState(1);
  const [highlightedCardTitles, setHighlightedCardTitles] = useState([]);
  const [plan, setPlan] = useState([]);
  const [manualPlan, setManualPlan] = useState([]);
  const [manualDay, setManualDay] = useState(1);
  const [selectedManualCard, setSelectedManualCard] = useState('');
const [manualDaysCount, setManualDaysCount] = useState(1);
const API = 'https://syria-backend.onrender.com';

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
fetch(`${API}/api/provinces`).then(res => res.json()).then(setProvinces);
fetch(`${API}/api/categories`).then(res => res.json()).then(setCategories);
fetch(`${API}/api/cards`).then(res => res.json()).then(setCards);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSelect = (state, setState, value) => {
    if (state.includes(value)) {
      setState(state.filter(v => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const groupByProximity = (cardsList, numDays) => {
    const grouped = Array.from({ length: numDays }, () => []);
    let remaining = [...cardsList];

    for (let day = 0; day < numDays && remaining.length > 0; day++) {
      const dayGroup = [];
      let current = remaining[0];
      dayGroup.push(current);
      remaining = remaining.slice(1);

      while (dayGroup.length < Math.ceil(cardsList.length / numDays)) {
        let next = null;
        let minDist = Infinity;
        for (const card of remaining) {
          const dist = haversineDistance(current.lat, current.lng, card.lat, card.lng);
          if (dist < minDist) {
            minDist = dist;
            next = card;
          }
        }
        if (next) {
          dayGroup.push(next);
          remaining = remaining.filter(c => c._id !== next._id);
          current = next;
        } else {
          break;
        }
      }
      grouped[day] = dayGroup;
    }
    return grouped;
  };

  const generatePlan = () => {
    if (!selectedProvinces.length || !selectedCategories.length) {
      alert("يرجى اختيار محافظات وأقسام أولاً.");
      return;
    }

    const highlights = cards.filter(c => highlightedCardTitles.includes(c.title)).map(c => c._id);

    const filtered = cards.filter(card =>
      selectedProvinces.includes(card.province?._id) &&
      selectedCategories.includes(card.category?._id)
    );

    if (filtered.length === 0) {
      alert("لم يتم العثور على بطاقات تطابق اختياراتك.");
      setPlan([]);
      return;
    }

    const sorted = [
      ...filtered.filter(c => highlights.includes(c._id)),
      ...filtered.filter(c => !highlights.includes(c._id))
    ];

    const grouped = groupByProximity(sorted, days);
    setPlan(grouped);
  };

  const moveCard = (dayIndex, cardIndex, direction, isManual = false) => {
    const targetPlan = isManual ? [...manualPlan] : [...plan];
    const day = targetPlan[dayIndex];
    const newIndex = cardIndex + direction;
    if (newIndex < 0 || newIndex >= day.length) return;
    const temp = day[cardIndex];
    day[cardIndex] = day[newIndex];
    day[newIndex] = temp;
    isManual ? setManualPlan(targetPlan) : setPlan(targetPlan);
  };

  const deleteCard = (dayIndex, cardIndex, isManual = false) => {
    const targetPlan = isManual ? [...manualPlan] : [...plan];
    targetPlan[dayIndex].splice(cardIndex, 1);
    isManual ? setManualPlan(targetPlan) : setPlan(targetPlan);
  };

  const handleAddManualCard = () => {
    const card = cards.find(c => c._id === selectedManualCard);
    if (!card) return;
    const updated = [...manualPlan];
    while (updated.length < manualDay) updated.push([]);
    updated[manualDay - 1].push(card);
    setManualPlan(updated);
    setSelectedManualCard('');
  };

  const savePlan = async (planData, modeType) => {
  if (!user) {
    alert("يجب تسجيل الدخول لحفظ الخطة.");
    return;
  }

  try {
    const token = localStorage.getItem('token');
const res = await fetch(`${API}/api/plans/save-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ plan: planData, mode: modeType })
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ تم حفظ الخطة بنجاح!");
    } else {
      alert("❌ فشل في الحفظ: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("❌ خطأ أثناء الاتصال بالخادم");
  }
};

const [anchorEl, setAnchorEl] = useState(null);

const handleOpen = (e) => setAnchorEl(e.currentTarget);
const handleClose = () => setAnchorEl(null);


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

<AppBar position="fixed" sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
  <Toolbar>
    <Typography variant="h6" sx={{ flexGrow: 2 }}>زور سوريا</Typography>
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


<Container dir="rtl" sx={{ py: 4, position: 'relative', zIndex: 1, mt: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, textAlign: 'right' }}>
        <Typography variant="h4" align="center" gutterBottom>
           خطط رحلتك
        </Typography>

        <FormControl component="fieldset" sx={{ my: 2 }}>
          <FormLabel component="legend">اختر نوع التخطيط</FormLabel>
          <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
            <FormControlLabel value="auto" control={<Radio />} label="تخطيط تلقائي" />
            <FormControlLabel value="manual" control={<Radio />} label="تخطيط يدوي" />
          </RadioGroup>
        </FormControl>

        {mode === 'auto' ? (
          <>
            <Typography variant="h6">اختر المحافظات:</Typography>
            {provinces.map(prov => (
              <FormControlLabel key={prov._id} control={<Checkbox checked={selectedProvinces.includes(prov._id)} onChange={() => handleSelect(selectedProvinces, setSelectedProvinces, prov._id)} />} label={prov.name} />
            ))}
<Typography variant="h6" sx={{ mt: 2 }}>اختر الأقسام:</Typography>
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
  {categories.map(cat => (
    <FormControlLabel
      key={cat._id}
      control={
        <Checkbox
          checked={selectedCategories.includes(cat._id)}
          onChange={() => handleSelect(selectedCategories, setSelectedCategories, cat._id)}
        />
      }
      label={cat.name}
    />
  ))}
</Box>

<Grid container spacing={1} alignItems="center" sx={{ my: 2 }}>
  <Grid item xs={8}>
    <TextField
      label="عدد الأيام"
      type="number"
      fullWidth
      value={days}
      onChange={(e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) setDays(val);
      }}
    />
  </Grid>
  <Grid item xs={2}>
    <IconButton
      color="primary"
      onClick={() => setDays(prev => Math.max(1, prev - 1))}
      sx={{ border: '1px solid #ccc', borderRadius: 2 }}
    >
      <RemoveIcon />
    </IconButton>
  </Grid>
  <Grid item xs={2}>
    <IconButton
      color="primary"
      onClick={() => setDays(prev => prev + 1)}
      sx={{ border: '1px solid #ccc', borderRadius: 2 }}
    >
      <AddIcon />
    </IconButton>
  </Grid>
</Grid>


<Autocomplete
  multiple
  options={cards.map((c) => c.title)}
  value={highlightedCardTitles}
  onChange={(e, val) => setHighlightedCardTitles(val)}
  renderInput={(params) => <TextField {...params} label="بطاقات مميزة" />}
  sx={{ my: 2 }}
/>


            <Button variant="contained" onClick={generatePlan} sx={{ mt: 2 }}>إنشاء الخطة</Button>
{plan.length > 0 && (
  <Button
    variant="outlined"
    color="success"
    onClick={() => savePlan(plan, 'auto')}
    sx={{ mt: 3 }}
  >
     حفظ الخطة
  </Button>
)}

            {plan.map((dayCards, i) => (
              <Box key={i} sx={{ mt: 4 }}>
                <Typography variant="h6">اليوم {i + 1}</Typography>
                {dayCards.map((card, j) => (
                  <Box key={card._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Typography>{card.title} ({card.province?.name}, {card.category?.name})</Typography>
                    <IconButton onClick={() => moveCard(i, j, -1)}><ArrowUpwardIcon /></IconButton>
                    <IconButton onClick={() => moveCard(i, j, 1)}><ArrowDownwardIcon /></IconButton>
                    <IconButton onClick={() => deleteCard(i, j)}><DeleteIcon /></IconButton>
                  </Box>
                ))}
              </Box>
            ))}
          </>
        ) : (
          <>
<Grid container spacing={1} alignItems="center" sx={{ my: 2 }}>
  <Grid item xs={8} md={4}>
    <TextField
      label="عدد أيام الرحلة"
      type="number"
      fullWidth
      value={manualDaysCount}
      onChange={(e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
          setManualDaysCount(val);
          setManualPlan(Array.from({ length: val }, () => []));
          if (manualDay > val) setManualDay(1);
        }
      }}
    />
  </Grid>
  <Grid item xs={2}>
    <IconButton
      color="primary"
      onClick={() => {
        setManualDaysCount(prev => Math.max(1, prev - 1));
        setManualPlan(prev => prev.slice(0, Math.max(1, prev.length - 1)));
        if (manualDay > Math.max(1, manualDaysCount - 1)) setManualDay(1);
      }}
      sx={{ border: '1px solid #ccc', borderRadius: 2 }}
    >
      <RemoveIcon />
    </IconButton>
  </Grid>
  <Grid item xs={2}>
    <IconButton
      color="primary"
      onClick={() => {
        const newCount = manualDaysCount + 1;
        setManualDaysCount(newCount);
        setManualPlan(prev => [...prev, []]);
      }}
      sx={{ border: '1px solid #ccc', borderRadius: 2 }}
    >
      <AddIcon />
    </IconButton>
  </Grid>
</Grid>

<Grid container spacing={2} alignItems="center" sx={{ my: 2 }}>
  <Grid item xs={12} md={4}>
    <FormControl fullWidth>
      <InputLabel>اختر اليوم</InputLabel>
      <Select
        value={manualDay}
        label="اختر اليوم"
        onChange={(e) => setManualDay(parseInt(e.target.value))}
      >
        {Array.from({ length: manualDaysCount }, (_, i) => (
          <MenuItem key={i + 1} value={i + 1}>اليوم {i + 1}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={5}>
    <FormControl fullWidth>
      <InputLabel>اختر بطاقة</InputLabel>
      <Select
        value={selectedManualCard}
        label="اختر بطاقة"
        onChange={(e) => setSelectedManualCard(e.target.value)}
      >
        {cards.map(card => (
          <MenuItem key={card._id} value={card._id}>{card.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={3}>
    <Button
      variant="contained"
      fullWidth
      onClick={handleAddManualCard}
      disabled={!selectedManualCard}
    >
      إضافة
    </Button>
  </Grid>
</Grid>

{manualPlan.length > 0 && (
  <Button
    variant="outlined"
    color="success"
    onClick={() => savePlan(manualPlan, 'manual')}
    sx={{ mt: 3 }}
  >
     حفظ الخطة
  </Button>
)}

             
            {manualPlan.map((dayCards, i) => (
              <Box key={i} sx={{ mt: 3 }}>
                <Typography variant="h6">اليوم {i + 1}</Typography>
                {dayCards.map((card, j) => (
                  <Box key={card._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Typography>{card.title} ({card.province?.name}, {card.category?.name})</Typography>
                    <IconButton onClick={() => moveCard(i, j, -1, true)}><ArrowUpwardIcon /></IconButton>
                    <IconButton onClick={() => moveCard(i, j, 1, true)}><ArrowDownwardIcon /></IconButton>
                    <IconButton onClick={() => deleteCard(i, j, true)}><DeleteIcon /></IconButton>
                  </Box>
                ))}
              </Box>
            ))}
          </>
        )}
      </Container>
    </>
  );
}

export default PlanTripPage;
