console.log('Hello')

// Search Section 

const searchText = document.getElementById('searchText')
const searchBtn = document.getElementById('searchBtn')

// History Section

const history = document.getElementById('history')
const historyItem = document.querySelectorAll('.history-item')
const clearHistoryBtn = document.getElementById('clearHistory')

// Current City Information

const currentCityTemp = document.getElementById('currentCityTemp')

// API Section 

let APIKey = '7b23df2e93e0f4913efaf4a0404c91c0'
let weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=perris&appid=${APIKey}`

console.log(weatherApi)

// Calls the weather API 
function fetchWeather() {
  fetch(weatherApi)
  .then((response) => response.json())
  .then((data) => console.log(data))
}

// fetchWeather()

searchBtn.addEventListener('click', fetchWeather)