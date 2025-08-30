import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ملفات الواجهة الأمامية
app.use(express.static(join(__dirname, '../../client')));

// الصفحة الرئيسية
app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, '../../client/views/index.html'));
});

// endpoint للتأكد من تشغيل السيرفر
app.get('/health', (_req, res) => {
  res.send('Server is running!');
});

// GeoNames API
const GEO_API_URL = 'http://api.geonames.org/searchJSON';
const GEO_USERNAME = process.env.GEO_USERNAME;

app.post('/getLocation', async (req, res) => {
  const { location } = req.body;
  if (!location) return res.status(400).send({ error: 'Location is required' });

  try {
    const response = await fetch(`${GEO_API_URL}?q=${location}&maxRows=1&username=${GEO_USERNAME}`);
    const data = await response.json();

    if (data.geonames && data.geonames.length > 0) {
      const { lat, lng } = data.geonames[0];
      res.send({ lat, lng });
    } else {
      res.status(404).send({ error: 'Location not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Weatherbit API
const WEATHER_API_URL = 'https://api.weatherbit.io/v2.0/current';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

app.post('/getWeather', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).send({ error: 'Latitude and Longitude are required' });

  try {
    const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const weather = data.data[0];
      res.send({
        temperature: weather.temp,
        weather_description: weather.weather.description,
        city_name: weather.city_name,
      });
    } else {
      res.status(404).send({ error: 'Weather data not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Pixabay API
const PIXABAY_API_URL = 'https://pixabay.com/api/';
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

app.post('/getImage', async (req, res) => {
  const { location } = req.body;
  if (!location) return res.status(400).send({ error: 'Location is required' });

  try {
    const response = await fetch(`${PIXABAY_API_URL}?key=${PIXABAY_API_KEY}&q=${location}&image_type=photo`);
    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[0].webformatURL;
      res.send({ imageUrl });
    } else {
      res.status(404).send({ error: 'Image not found for the given location' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// بدء السيرفر
const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
