import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CardMedia, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';
import { AccountCircle } from '@mui/icons-material';

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
  paddingTop: '56.25%',
});

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Topic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorPrincipal: string;
  createdAt: bigint;
}

interface Reply {
  id: string;
  topicId: string;
  content: string;
  authorPrincipal: string;
  createdAt: bigint;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
    });
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: () => setIsAuthenticated(true),
      });
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
            Modern Forum
          </Typography>
          {isAuthenticated ? (
            <IconButton color="inherit" onClick={logout}>
              <AccountCircle />
            </IconButton>
          ) : (
            <Button color="inherit" onClick={login}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<CategoryPage isAuthenticated={isAuthenticated} />} />
        <Route path="/topic/:id" element={<TopicPage isAuthenticated={isAuthenticated} />} />
      </Routes>
    </>
  );
};

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

const CategoryPage: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const { id } = useParams<{ id: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      if (id) {
        try {
          const result = await backend.getTopics(id);
          setTopics(result);
        } catch (error) {
          console.error('Error fetching topics:', error);
          setSnackbarMessage('Error fetching topics. Please try again.');
          setSnackbarOpen(true);
        }
      }
    };
    fetchTopics();
  }, [id]);

  const handleCreateTopic = async () => {
    if (id && isAuthenticated) {
      try {
        const result = await backend.createTopic(id, newTopic.title, newTopic.content);
        if ('ok' in result) {
          setIsDialogOpen(false);
          setNewTopic({ title: '', content: '' });
          const updatedTopics = await backend.getTopics(id);
          setTopics(updatedTopics);
          setSnackbarMessage('Topic created successfully!');
          setSnackbarOpen(true);
        } else {
          console.error('Error creating topic:', result.err);
          setSnackbarMessage(`Error creating topic: ${result.err}`);
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error creating topic:', error);
        setSnackbarMessage('Error creating topic. Please try again.');
        setSnackbarOpen(true);
      }
    } else if (!isAuthenticated) {
      setSnackbarMessage('Please login to create a topic.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Topics for {id}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setIsDialogOpen(true)} sx={{ mb: 2 }}>
        Create New Topic
      </Button>
      <Grid container spacing={4}>
        {topics.map((topic) => (
          <Grid item key={topic.id} xs={12}>
            <StyledCard onClick={() => navigate(`/topic/${topic.id}`)}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {topic.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topic.content.substring(0, 100)}...
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newTopic.content}
            onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTopic}>Create</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

const TopicPage: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchTopicAndReplies = async () => {
      if (id) {
        try {
          const topicResult = await backend.getTopics(id);
          if (topicResult.length > 0) {
            setTopic(topicResult[0]);
          }
          const repliesResult = await backend.getReplies(id);
          setReplies(repliesResult);
        } catch (error) {
          console.error('Error fetching topic and replies:', error);
          setSnackbarMessage('Error fetching topic and replies. Please try again.');
          setSnackbarOpen(true);
        }
      }
    };
    fetchTopicAndReplies();
  }, [id]);

  const handleCreateReply = async () => {
    if (id && isAuthenticated) {
      try {
        const result = await backend.createReply(id, newReply);
        if ('ok' in result) {
          setNewReply('');
          const updatedReplies = await backend.getReplies(id);
          setReplies(updatedReplies);
          setSnackbarMessage('Reply created successfully!');
          setSnackbarOpen(true);
        } else {
          console.error('Error creating reply:', result.err);
          setSnackbarMessage(`Error creating reply: ${result.err}`);
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error creating reply:', error);
        setSnackbarMessage('Error creating reply. Please try again.');
        setSnackbarOpen(true);
      }
    } else if (!isAuthenticated) {
      setSnackbarMessage('Please login to create a reply.');
      setSnackbarOpen(true);
    }
  };

  if (!topic) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {topic.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {topic.content}
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Replies
      </Typography>
      {replies.map((reply) => (
        <Card key={reply.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1">{reply.content}</Typography>
          </CardContent>
        </Card>
      ))}
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Your Reply"
        value={newReply}
        onChange={(e) => setNewReply(e.target.value)}
        sx={{ mt: 2, mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleCreateReply}>
        Post Reply
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default App;
