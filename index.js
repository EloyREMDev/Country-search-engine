const searchInput = document.querySelector('#search');
const container = document.querySelector('.container');
const body = document.querySelector('.main');
const loader = document.querySelector('.loader');
const formContainer = document.querySelector('.form-container');
const title = document.querySelector('.title');

// Los paises descargados desde la api se guardan en el array de countries
// La api deberia pedirse solo una vez
// Usar este array para crear el filtrado
// Array para almacenar los países
let countries = [];
let countriesInSpanish = []; // Lista de nombres en español para la búsqueda

// Función para obtener los países desde la API de Rest Countries
const getCountries = async () => {
  try {
    console.log('Conectando a la API de países...');

    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) throw new Error('Error al obtener los datos de la API de países.');

    // Guardar los países en el array
    countries = await response.json();

    // Crear un índice de nombres en español
    countriesInSpanish = countries.map(country => ({
      name: country.translations?.spa?.common || country.name.common, // Nombre en español
      originalName: country.name.common, // Nombre original en inglés
      flag: country.flags.svg,
      capital: country.capital ? country.capital[0] : 'N/A',
      region: country.region,
      subregion: country.subregion,
      population: country.population,
      languages: country.languages ? Object.values(country.languages).join(', ') : 'N/A'
    }));

    console.log('Países descargados:', countriesInSpanish);
  } catch (error) {
    console.error('Error al conectar con la API de países:', error);
    container.innerHTML = '<p>Error al cargar los datos. Inténtalo nuevamente.</p>';
  }
};

// Función para obtener el clima desde la API de OpenWeatherMap
const getWeather = async (city) => {
  const apiKey = '117c10a3752abc92029de9736ec57ab9'; // Reemplaza con tu clave de OpenWeatherMap
  const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  try {
    // Construir la URL con los parámetros
    const response = await fetch(`${baseUrl}?q=${city}&appid=${apiKey}&units=metric`);

    if (!response.ok) {
      console.error('Error en la respuesta de la API de clima:', response.status, response.statusText);
      throw new Error('No se pudo obtener el clima para esta ciudad.');
    }

    const weatherData = await response.json();

    // Extraer información relevante del clima
    const weatherInfo = {
      city: weatherData.name,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`, // Construir la URL del icono
    };

    return weatherInfo;
  } catch (error) {
    console.error('Error al obtener el clima:', error);
    return null; // Devuelve null si hay un error
  }
};

// Función para mostrar los países (incluye clima e iconos)
const displayCountries = async (countriesToDisplay) => {
  container.innerHTML = ''; // Limpiar los resultados previos

  if (countriesToDisplay.length > 10) {
    // Mostrar un mensaje si hay demasiados resultados
    container.innerHTML = '<p>Demasiados países, especifica mejor tu búsqueda.</p>';
  } else if (countriesToDisplay.length > 1) {
    // Mostrar solo la bandera y el nombre si hay entre 1 y 10 países
    countriesToDisplay.forEach(country => {
      const countryCard = document.createElement('div');
      countryCard.classList.add('country-card-small');
      
      countryCard.innerHTML = `
        <img src="${country.flag}" alt="Bandera de ${country.name}" />
        <h2>${country.name}</h2>
      `;

      container.appendChild(countryCard);
    });
  } else if (countriesToDisplay.length === 1) {
    // Mostrar toda la información si hay exactamente 1 país
    const country = countriesToDisplay[0];
    const weatherInfo = await getWeather(country.capital); // Obtener el clima usando la capital del país

    const countryCard = document.createElement('div');
    countryCard.classList.add('country-card-large');
    
    countryCard.innerHTML = `
      <div class="country-large-flag">
        <img src="${country.flag}" alt="Bandera de ${country.name}" />
      </div>
      <div class="country-large-info">
        <h2>${country.name}</h2>
        <p><strong>Capital:</strong> ${country.capital}</p>
        <p><strong>Región:</strong> ${country.region}</p>
        <p><strong>Subregión:</strong> ${country.subregion}</p>
        <p><strong>Población:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Idiomas:</strong> ${country.languages}</p>
        ${
          weatherInfo
            ? `<p><strong>Clima actual:</strong> ${weatherInfo.temperature}°C, ${weatherInfo.description}</p>
               <img src="${weatherInfo.icon}" alt="Icono del clima">` // Mostrar el icono del clima
            : `<p><strong>Clima actual:</strong> No disponible</p>`
        }
      </div>
    `;

    container.appendChild(countryCard);
  }
};

// Función para filtrar los países
const filterCountries = (query) => {
  // Buscar coincidencias insensibles a mayúsculas
  const filtered = countriesInSpanish.filter(country =>
    country.name.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length > 0) {
    displayCountries(filtered); // Mostrar los resultados
  } else {
    container.innerHTML = ''; // Limpiar si no hay coincidencias
  }
};

// Evento al escribir en el input
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query) {
    filterCountries(query); // Buscar en español
  } else {
    container.innerHTML = ''; // Limpiar el contenedor si el input está vacío
  }
});

// Llamar a la función para obtener los países al cargar la página
getCountries();



