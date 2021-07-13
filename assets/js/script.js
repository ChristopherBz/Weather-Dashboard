//variables
var apiKey = '99336f723cf33396d1785798e4d39750';
var date = moment().format('MM/DD/YYYY');
var cityNameEl = $('#cityName');
var tempEl = $('#temp');
var windEl = $('#wind');
var humidEl = $('#humidity');
var uvEl = $('#uv');


// Weather function to get city name, date, temperature, wind, humidity & UV. Forecast included at the bottom
// Using ajax and Get Method
function getWeather(city) {
    var weatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;
    $.ajax({
        url: weatherURL,
        method: 'GET',
    }).then(function (cityWeather) {
        weather = cityWeather;
        console.log(cityWeather)
        
        // Temperature provided in kelvin needs fahrenheit conversion
        var temp = ((weather.main.temp - 273.15) * (9 / 5) + 32).toFixed(0);
        
        // Dynamic Current weather icon that changes colour for day/night
        var icon = cityWeather.weather[0].icon;
        var iconSrc = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
       
        // Create text for the currentForcast div.
        cityNameEl.text(weather.name + ' (' + date + ')');
        cityNameEl.append('<img id="icon" src= \'' + iconSrc + '\'/>');
        tempEl.text('Temperature: ' + temp + '\xB0F');
        windEl.text('Wind: ' + weather.wind.speed + ' MPH');
        humidEl.text('Humidity: ' + weather.main.humidity + '%');
        $('#forecastHeader').text('5-Day Forecast:');
        
        // uvIndex has seperate URL and needs the lat & long
        var lon = weather.coord.lon;
        var lat = weather.coord.lat;
        var uvURL = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey;
        $.ajax({
            url: uvURL,
            method: 'GET'
        }).then(function (uvIndex) {
            uvEl.text('UV Index: ' + uvIndex.value);
            
            // Dynamic UV backgrount colour dependant on rating level.
            if (uvIndex.value < 2) {
                $('#uv').attr('class', 'low');
            } else if (uvIndex.value >= 3 && uvIndex.value <= 5) {
                $('#uv').attr('class', 'moderate');
            } else if (uvIndex.value > 6 && uvIndex.value <= 7) {
                $('#uv').attr('class', 'high');
            } else if (uvIndex.value > 8) {
                $('#uv').attr('class', 'veryhigh');
            }
        })
    })

    //5 day-Forecast calls to a seperate URL
    var forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey;
    $.ajax({
        url: forecastURL,
        method: 'GET'
    }).then(function (forecastWeather) {
        $('#forecastCard').empty();
        var forecast = forecastWeather;
        
        // Forecast API is in 3 hours increments so to get daily 24 / 3 = 8 each loop.
        for (i = 0; i < forecast.list.length; i += 8) {
            // Elements which will be created on page
            var card = $('<div class="col-lg-2 col-sm-12" id="cardContainer">');
            var day = $('<p>');
            var dayTemp = $('<p>');
            var windEl = $('<p>');
            var dayHumidity = $('<p>');
            var tempK = forecast.list[i].main.temp;
            var dateTime = forecast.list[i].dt;
            var formattedDate = moment.unix(dateTime).format('MM/DD/YYYY');
            var iconSrc = 'https://openweathermap.org/img/wn/' + forecastWeather.list[i].weather[0].icon + '@2x.png';
            
            // Action to populate individual forcast cards
            day.text(formattedDate);
            dayTemp.text('Temp: ' + ((tempK - 273.15) * (9 / 5) + 32).toFixed(0) + '\xB0F');
            windEl.text('Wind: ' + weather.wind.speed + ' MPH');
            dayHumidity.text('Humidity: ' + forecast.list[i].main.humidity + '%');
            card.append(day, '<img id="forecastIcon" src= \'' + iconSrc + '\'/>', dayTemp, windEl, dayHumidity);
            $('#forecastCard').append(card);
        }
    })
}

// Search button listener.
$('#btn').on('click', function (event) {
    event.preventDefault();
    var city = $('#input').val().trim();
    var citySearched = JSON.parse(localStorage.getItem('citySearched'));
    if (citySearched == null) {
      citySearched = [];
    }
    citySearched.unshift(city);
    var cityPast = localStorage.setItem('citySearched', JSON.stringify(citySearched));
    addCityButton(city);
    getWeather(city);
})

// City buttons once the user has searched for a city.
function addCityButton(city) {
    $('#th').text('Previous Cities');
    var newSearch = $('<tr id="previousSearch">');
    var cityButton = $('<button id=' + city + ' class=btn>').text(city);
    newSearch.append(cityButton);
    cityButton.on('click', function () {
        getWeather(city);
    })
    $('#cityButton').prepend(newSearch);
}

// Local storage to keep the city buttons on load
window.onload = function () {
    var cityPast = JSON.parse(localStorage.getItem('citySearched'));
    console.log(cityPast);
    if (cityPast == null) {
      cityPast = [];
    }
    for (i = 0; i < cityPast.length; i++) {
        if (cityPast[i] != null) {
            addCityButton(cityPast[i]);
        }
    }
    if (cityPast.length > 0) {
        getWeather(cityPast[0]);
    }
}
