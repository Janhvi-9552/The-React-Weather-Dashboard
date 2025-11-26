const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Replace with your actual OpenWeatherMap API key
const apiKey = 'YOUR_ACTUAL_API_KEY_HERE';

app.use(cors());

// Route: Current Weather by City or Geolocation
app.get('/weather', async (req, res) => {
  const { city, lat, lon, unit = 'metric' } = req.query;

  let url = '';
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
  } else {
    return res.status(400).json({ error: 'City or coordinates required' });
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Route: 5-Day Forecast by City
app.get('/forecast', async (req, res) => {
  const { city, unit = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required for forecast' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
