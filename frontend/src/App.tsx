import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
});

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Listing {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number | null;
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await backend.getCategories();
        setCategories(result);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Categories
      </Typography>
      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <StyledCard component={Link} to={`/category/${category.id}`}>
              <StyledCardMedia
                image={`https://source.unsplash.com/random/400x300?${category.name}`}
                title={category.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {category.name}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const CategoryPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const categoryId = window.location.pathname.split('/').pop() || '';

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const result = await backend.getListings(categoryId);
        setListings(result);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };
    fetchListings();
  }, [categoryId]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Listings for {categoryId}
      </Typography>
      <Grid container spacing={4}>
        {listings.map((listing) => (
          <Grid item key={listing.id} xs={12} sm={6} md={4}>
            <StyledCard>
              <StyledCardMedia
                image={`https://source.unsplash.com/random/400x300?${listing.title}`}
                title={listing.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.description}
                </Typography>
                <Typography variant="h6" component="p" sx={{ mt: 2 }}>
                  {listing.price ? `$${listing.price.toFixed(2)}` : 'Price upon request'}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white' }}>
            Modern Classifieds
          </Typography>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<CategoryPage />} />
      </Routes>
    </>
  );
};

export default App;
