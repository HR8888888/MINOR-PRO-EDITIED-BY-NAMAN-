const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory


// Replace 'your-database-name' with your actual MongoDB database name
const dbConnection = 'mongodb+srv://gaurav:nloeqsf2t5Ga@rajpal151.2x4f7.mongodb.net/?retryWrites=true&w=majority&appName=rajpal151';
// Connect to MongoDB
mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a MongoDB schema and model
const querySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  query: String

});

const Query = mongoose.model('Query', querySchema);

// Serve static files (your HTML form)
app.use(express.static(__dirname));

// Use middleware for JSON and form data parsing
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Define routes

// Display the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle form submission
app.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;

    // Create a new query document
    const newQuery = new Query({
      name,
      email,
      phone,
      query
    });

    // Save the query to the database
    await newQuery.save();

    res.send('Query submitted successfully.');
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).send('Error submitting query.');
  }
});

// Define a route to render the Dashboard page
app.get('/dashboard', async (req, res) => {
  try {
    const queries = await Query.find().exec();

    // Render the dashboard.ejs view with the retrieved data
    res.render('dashboard', { queries });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).send('Error fetching queries.');
  }
});

// Add this route to handle delete requests
app.post('/delete/:id', async (req, res) => {
  try {
    const queryId = req.params.id;

    // Find and remove the query by its ID
    await Query.findByIdAndRemove(queryId);

    res.redirect('/dashboard'); // Redirect back to the dashboard
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).send('Error deleting query.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
