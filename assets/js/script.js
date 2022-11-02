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

// Card Section

const cardDate = document.getElementById('cardDate')

// API Section 

let APIKey = '7b23df2e93e0f4913efaf4a0404c91c0'
let weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${citySearched}&appid=${APIKey}`
let citySearched = searchText

console.log(weatherApi)

// Grab todays date

const todaysDate = document.getElementById('todaysDate')

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();
today = `${mm}/${dd}/${yyyy}`;

todaysDate.textContent = today

// Calls the weather API 

function fetchWeather() {
  searchText.textContent = 'Loading...'
  fetch(weatherApi)
  .then((response) => response.json())
  .then((data) => {

    let cityName = data.name
    let cityTemp = data.main.temp
    let cityWind = data.wind.speed
    let cityHumidity = data.main.humidity

    searchedCity.textContent = cityName
    currentCityTemp.textContent = cityTemp
    currentCityWind.textContent = cityWind
    currentCityHumidity.textContent = cityHumidity


    console.log(data)
  })
}

// Search Button calls weather API
searchBtn.addEventListener('click', fetchWeather)