console.log('Hello')

// Search Section 

const searchText = document.getElementById('searchText')
const searchBtn = document.getElementById('searchBtn')

// History Section

const history = document.getElementById('history')
const historyItem = document.querySelectorAll('.history-item')
const clearHistoryBtn = document.getElementById('clearHistory')


// API Section 

let weatherapi = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=7b23df2e93e0f4913efaf4a0404c91c0'
let APIKey = '7b23df2e93e0f4913efaf4a0404c91c0'

fetch(weatherapi)
  .then((response) => response.json())
  .then((data) => console.log(data))