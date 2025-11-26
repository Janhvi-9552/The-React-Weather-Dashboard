import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateHistory = (city) => {
    const updated = [city, ...history.filter(c => c !== city)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const fetchWeather = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/weather?city=${trimmedCity}&unit=${unit}`)
      .then(res => res.json())
      .then(data => {
        if (data.error || data.cod !== 200) throw new Error(data.error || 'Weather fetch failed');
        setWeather(data);
        updateHistory(trimmedCity);
      })
      .catch(() => setError('City not found or API error.'))
      .finally(() => setLoading(false));
  };

  const fetchForecast = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/forecast?city=${trimmedCity}&unit=${unit}`)
      .then(res => res.json())
      .then(data => {
        console.log("Forecast response:", data); // Debug log
        if (!data.list || data.cod !== "200") {
          throw new Error("Forecast data not available");
        }
        const daily = data.list.filter(reading =>
          reading.dt_txt.includes("12:00:00")
        );
        if (daily.length === 0) {
          throw new Error("No forecast entries found");
        }
        setForecast(daily);
      })
      .catch(() => setError("Forecast data not available."))
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    fetchWeather();
    fetchForecast();
  };

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(`http://localhost:5000/weather?lat=${latitude}&lon=${longitude}&unit=${unit}`)
        .then(res => res.json())
        .then(data => {
          if (data.error || data.cod !== 200) throw new Error(data.error || 'Geolocation fetch failed');
          setWeather(data);
        })
        .catch(() => setError('Geolocation failed.'))
        .finally(() => setLoading(false));
    });
  }, [unit]);

  return (
    <div className="App">
      <h1>🌤 Weather Dashboard</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
          Switch to {unit === 'metric' ? '°F' : '°C'}
        </button>
      </div>

      <div className="history">
        <h3>Recent Searches</h3>
        {history.map((item, index) => (
          <button key={index} onClick={() => setCity(item)}>
            {item}
          </button>
        ))}
      </div>

      {loading && <p>⏳ Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weather && !loading && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p>{new Date().toLocaleDateString()}</p>
          <p>{weather.weather[0].description}</p>
          <p>🌡 {weather.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>🌬 Wind: {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}

      {forecast.length > 0 && !loading && (
        <>
          <h2>📅 5-Day Forecast</h2>
          <div className="forecast-container">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <h3>{new Date(day.dt_txt).toLocaleDateString()}</h3>
                <p>{day.weather[0].description}</p>
                <p>🌡 {day.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
                <p>💧 {day.main.humidity}%</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt="forecast icon"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
