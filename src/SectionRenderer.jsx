import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material';

export default function SectionRenderer({ type, settings }) {
  switch (type) {
    case 'hero': {
      const { title, subtitle, image } = settings;
      return (
        <Paper
          sx={{
            position: 'relative',
            height: 300,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Box textAlign="center" sx={{ backgroundColor: 'rgba(0,0,0,0.5)', p: 2, borderRadius: 1 }}>
            <Typography variant="h4" gutterBottom>{title || 'Hero Title'}</Typography>
            {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
          </Box>
        </Paper>
      );
    }

    case 'searchFilters': {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>{settings.title || 'Search & Filters'}</Typography>
          <Typography color="text.secondary">Render search input and filter controls here.</Typography>
        </Paper>
      );
    }

    case 'cardsGrid': {
      const cards = settings.cards || [];
      return (
        <Box>
          <Typography variant="h5" gutterBottom>{settings.title || 'Cards Grid'}</Typography>
          <Grid container spacing={2}>
            {cards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  {card.image && (
                    <Box
                      component="img"
                      src={card.image}
                      alt={card.title}
                      sx={{ width: '100%', height: 140, objectFit: 'cover', mb: 1 }}
                    />
                  )}
                  <Typography variant="h6">{card.title}</Typography>
                  {card.link && (
                    <Button variant="outlined" href={card.link} sx={{ mt: 1 }}>عرض المزيد</Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    case 'customHtml': {
      return (
        <Box>
          <Typography variant="body1">
            <span dangerouslySetInnerHTML={{ __html: settings.html || '' }} />
          </Typography>
        </Box>
      );
    }

    default:
      return (
        <Box>
          <Typography color="error">Unknown section type: {type}</Typography>
        </Box>
      );
  }
}
