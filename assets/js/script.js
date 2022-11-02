console.log('Hello')

// Search Section 

const searchText = document.getElementById('searchText').value
const searchBtn = document.getElementById('searchBtn')

// History Section

const history = document.getElementById('history')
const historyItem = document.querySelectorAll('.history-item')
const clearHistoryBtn = document.getElementById('clearHistory')

// Current City Information

const searchedCity = document.getElementById('searchedCity')
const currentCityTemp = document.getElementById('currentCityTemp')
const currentCityWind = document.getElementById('currentCityWind')
const currentCityHumidity = document.getElementById('currentCityHumidity')

// API Section 

let APIKey = '7b23df2e93e0f4913efaf4a0404c91c0'
let weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=perris&appid=${APIKey}`

console.log(weatherApi)

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();
today = `(${mm}/${dd}/${yyyy})`;


// Calls the weather API 
function fetchWeather() {
  searchText.textContent = 'Loading...'
  fetch(weatherApi)
  .then((response) => response.json())
  .then((data) => {

    let city = data[0].name
    
    searchedCity.textContent = city;

    console.log(data)
  })
}

// 

function getCityDetails(city) {
    if (!! response.data) {
      console.error('No City found')
      fetchWeather()
      return
    }
  })
}

// Search Button calls weather API
searchBtn.addEventListener('click', fetchWeather)