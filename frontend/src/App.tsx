import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
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
  const { id } = useParams<{ id: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState({ title: '', description: '', price: '' });

  useEffect(() => {
    const fetchListings = async () => {
      if (id) {
        try {
          const result = await backend.getListings(id);
          setListings(result);
        } catch (error) {
          console.error('Error fetching listings:', error);
        }
      }
    };
    fetchListings();
  }, [id]);

  const handleCreateListing = async () => {
    if (id) {
      try {
        const result = await backend.createListing(id, newListing.title, newListing.description, newListing.price ? parseFloat(newListing.price) : null);
        if ('ok' in result) {
          setIsDialogOpen(false);
          setNewListing({ title: '', description: '', price: '' });
          // Refresh listings
          const updatedListings = await backend.getListings(id);
          setListings(updatedListings);
        } else {
          console.error('Error creating listing:', result.err);
        }
      } catch (error) {
        console.error('Error creating listing:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Listings for {id}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setIsDialogOpen(true)} sx={{ mb: 2 }}>
        Create New Listing
      </Button>
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
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create New Listing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Price"
            fullWidth
            type="number"
            value={newListing.price}
            onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateListing}>Create</Button>
        </DialogActions>
      </Dialog>
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
