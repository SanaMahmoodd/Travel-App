import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config(); // تحميل المتغيرات من .env

const app = express();

// تعريف المسار الرئيسي
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'client', 'views', 'index.html'));
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*',  // هنا يتم تحديد الموقع الذي ستتمكن منه الواجهة الأمامية من إرسال الطلبات
  methods: ['GET', 'POST'],  // تحديد الطرق المسموح بها
  allowedHeaders: ['Content-Type'],  // تحديد الرؤوس المسموح بها
}));
app.use(express.static('dist'));

// Routes
app.get('/', (req, res) => {
  res.sendFile('dist/index.html');
});

app.get('/', (req, res) => {
  try {
    res.status(200).send('Server is running!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`Server running on localhost:${PORT}`);
});

// API Configuration
const GEO_API_URL = 'http://api.geonames.org/searchJSON';
const GEO_USERNAME = process.env.GEO_USERNAME; // استخدام المتغير من .env

// Endpoint to get location data
app.post('/getLocation', async (req, res) => {
  const { location } = req.body; // استلام اسم الموقع من العميل

  // تحقق من أن location موجود
  if (!location) {
    return res.status(400).send({ error: 'Location is required' });
  }

  try {
    const response = await fetch(`${GEO_API_URL}?q=${location}&maxRows=1&username=${GEO_USERNAME}`);
    console.log(response);

    if (!response.ok) {
      // إذا كان هناك خطأ في الاستجابة من API
      return res.status(500).send({ error: 'Failed to fetch data from GeoNames' });
    }

    const data = await response.json();

    if (data.geonames && data.geonames.length > 0) {
      const { lat, lng } = data.geonames[0];
      res.send({ lat, lng });
    } else {
      res.status(404).send({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error fetching data from Geonames:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const WEATHER_API_URL = 'https://api.weatherbit.io/v2.0/current';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // استخدام المفتاح من .env

app.post('/getWeather', async (req, res) => {
  const { lat, lng } = req.body; // استلام الإحداثيات من العميل

  // تحقق من وجود الإحداثيات
  if (!lat || !lng) {
    return res.status(400).send({ error: 'Latitude and Longitude are required' });
  }

  try {
    const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`);

    if (!response.ok) {
      return res.status(500).send({ error: 'Failed to fetch weather data' });
    }

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
    console.error('Error fetching data from Weatherbit:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

const PIXABAY_API_URL = 'https://pixabay.com/api/';
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY; // استخدام مفتاح الـ API من .env

// Endpoint لجلب الصور من Pixabay
app.post('/getImage', async (req, res) => {
  console.log('Request body:', req.body);
  const { location } = req.body; // استلام اسم الموقع من العميل

  if (!location) {
    return res.status(400).send({ error: 'Location is required' });
  }

  try {
    // إرسال طلب إلى Pixabay API
    const response = await fetch(`${PIXABAY_API_URL}?key=${PIXABAY_API_KEY}&q=${location}&image_type=photo`);

    if (!response.ok) {
      return res.status(500).send({ error: 'Failed to fetch image from Pixabay' });
    }

    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const imageUrl = data.hits[0].webformatURL; // اختيار أول صورة من النتائج
      console.log('Image URL:', imageUrl);
      res.send({ imageUrl });
    } else {
      res.status(404).send({ error: 'Image not found for the given location' });
    }
  } catch (error) {
    console.error('Error fetching image from Pixabay:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});


export default app;
