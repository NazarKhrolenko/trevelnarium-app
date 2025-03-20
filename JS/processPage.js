'use strict';

const ratingBar = document.querySelector('.ratingBar')
const overModal = document.querySelector('.container')
const markerIcon = document.querySelector('.leaflet-marker-icon'); 
const form = document.querySelector('.form');
const sidebar = document.querySelector('.sidebar');
const inputRate = document.querySelector('.form__input--rate');
const inputExpensies = document.querySelector('.form__input--expensies');
const inputPlace = document.querySelector('.form__input--place');
const inputCuisine = document.querySelector('.form__input--cuisine');
const file = document.querySelector('.form__input--file');

const closeButton = document.getElementById('popupClose');
const modalWindow = document.getElementById('popup');
const blur = document.getElementById('blur');

class Trip {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    marker =null;
    
    constructor(coords, rate, expensies, cityOf , cuisine, files) {
        this.coords = coords; 
        this.rate = rate;
        this.expensies = expensies;
        this.cityOf = cityOf;
        this.cuisine = cuisine;
        this.files = files; 
    }
}

class App {
    map;
    mapEvent;
    #trips = [];
    #activeMarker = null;

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newTrip.bind(this));
    }
    
    
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Impossible to get your location');
                }
            );
        }
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        this.map = L.map('map',{
            center: coords,
            zoom: 5,
            minZoom:2,
            maxBounds: [
                [-85, -180], // Південно-західний кут
                [85, 180]    // Північно-східний кут
            ],
            maxBoundsViscosity: 1.0, // Робить межі більш жорсткими
            worldCopyJump: false, // Забороняє копіювання карти по горизонталі
            continuousWorld: false // Забороняє безперервний світ
        });


        this.lightTileLayer = L.tileLayer('https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=KYKejM4XTQ3Quwh2xoR1YSTrMCqdiM1RyPJVO1EdyZqhjlF8UIeYWuIUw4s7TUO6', {})
         this.darkTileLayer = L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=KYKejM4XTQ3Quwh2xoR1YSTrMCqdiM1RyPJVO1EdyZqhjlF8UIeYWuIUw4s7TUO6', {});
    
            this.lightTileLayer.addTo(this.map);

        this.map.on('click', this._handleMapClick.bind(this));

        this._loadFromLocalStorage();
    }

    _handleMapClick(mapEvent) {
        this.mapEvent = mapEvent;
        popup.showModal()
    }

    _displayOnMap(trip) {

        // Перевірка, чи є файли

        const imagesHTML = trip.files.map((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            const className = index % 2 === 0 ? 'little-card' : 'big-card'; // Чередування
            return `<img src="${imageUrl}" class="card ${className}" alt="Trip Image">`;
        }).join('');

        let marker = L.marker(trip.coords)
            .addTo(this.map)
            .bindPopup(L.popup({
                autoClose: false,
            className: 'custom-popup' // Додаємо клас для стилізації
        }))
        .setPopupContent(`
        <div class="card-group">${imagesHTML}</div>`)
        .openPopup();
        trip.marker = marker;
        marker.addEventListener('click', () => {
            console.log("Маркер натиснуто:", trip); // Перевіряємо, чи спрацьовує подія
            this._markerFocus(trip);
        });
    
        // marker.addEventListener('click',() =>this._unFocusOnTrip(trip))
        
    }

    async _newTrip(event) {
        event.preventDefault();

        if (!this.mapEvent) {
            alert("Click on the map first!");
            return;
        }

        const { lat, lng } = this.mapEvent.latlng;
        const rate = +inputRate.value;
        const expensies = +inputExpensies.value;
        const cityOf =await this._getCityName(lat, lng);
        const cuisine = inputCuisine.value;
        const selecedFiles = Array.from(file.files)

        // Перевірка валідності введених даних
        const areNumbers = (...numbers) => numbers.every(num => Number.isFinite(num));
        const arePositive = (...numbers) => numbers.every(num => num > 0);
        const minRate = (...numbers) => numbers.every(num => num < 11) 
        if (!areNumbers(rate, expensies) || !arePositive(rate, expensies)) {
            alert("Type a positive number");
            return;
        }
        if(!minRate(rate)){
            alert("Maximum rate is 10!")
            return;
        }

        // Створення нового об'єкта Trip
        const trip = new Trip([lat, lng], rate, expensies, cityOf, cuisine, selecedFiles);
        this.#trips.push(trip);

        
        // Додавання на карту
        this._displayOnMap(trip);

        // Додавання в сайдбар
        this._displayTripOnSideBar(trip);
        // this.sendDataToServer(trip)
     
        this._focusOnTrip(trip);
        this._saveToLocalStorage();
        // Очищення форми
        form.reset();
        
        CloseModalWindow();
    }

    _displayTripOnSideBar(trip) {
       const imagesHTML = trip.files.map(file =>{
        const imageUrl = URL.createObjectURL(file);
        return `<img src="${imageUrl}" class="trip__image" alt="Trip Image">`;
        })
        .join('');
    
        const html = `
        <div class ="sideTab" data-id="${trip.id}">
          <div class="trip">
            <div class="trip__details">
              <span class="trip__description">🔝 Rate</span>
              <span class="trip__value">${trip.rate} ⭐</span>
            </div>
            <div class="trip__details">
              <span class="trip__description">&#128178; Expensies</span>
              <span class="trip__value">${trip.expensies} 💰</span>
            </div>
            <div class="trip__details">
              <span class="trip__description">&#128506 Place</span>
              <span class="trip__value">${trip.cityOf} &#128205;</span>
            </div>
            <div class="trip__details">
              <span class="trip__description">🍴 Cuisine</span>
              <span class="trip__value">${trip.cuisine} 🏙</span>
            </div>
            <div class="trip__images">${imagesHTML}</div>
          </div>
        </div>`
        sidebar.insertAdjacentHTML('beforeend', html);
        // ratingBar.insertAdjacentHTML('beforeend', html);
        document.querySelector(`.sideTab[data-id="${trip.id}"]`).addEventListener('click',() => this._focusOnTrip(trip));
    }
    _focusOnTrip(trip) {
        const sideTab = document.querySelector(`.sideTab[data-id="${trip.id}"]`);
        if (!sideTab) return;
    
        // Якщо є активний маркер, повертаємо його до стандартного вигляду
        if (this.#activeMarker && this.#activeMarker !== trip.marker) {
            this._unFocusOnTrip()
        }
    
        // Видаляємо підсвітку з інших вкладок
        document.querySelectorAll('.sideTab').forEach(tab => tab.classList.remove('focused'));
        sideTab.classList.add('focused');
    
        if (trip.marker) {
            // Змінюємо розмір маркера при фокусі
            trip.marker.setIcon(L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconSize: [50, 82], // Збільшений розмір
                iconAnchor: [25, 82]
            }));
    
            // Використовуємо flyTo() для плавного масштабування і переміщення
            this.map.flyTo(trip.coords, 6, {
                animate: true,
                duration: 1.5, // Тривалість анімації у секундах
                easeLinearity: 0.2
            });
    
            trip.marker.openPopup();
            this.#activeMarker = trip.marker;
        } else {
            console.error("Маркер для цього запису не знайдено:", trip);
        }
    }
    _markerFocus(trip){
        if (!trip.marker) {
            console.error("Маркер відсутній для цього запису:", trip);
            return;
        }
    
        // Якщо є активний маркер, повертаємо його до стандартного вигляду
        if (this.#activeMarker && this.#activeMarker !== trip.marker) {
            this._unFocusOnTrip();
        }
    
        console.log("Зміна розміру маркера:", trip);
    
        trip.marker.setIcon(L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [50, 82], // Збільшений розмір
            iconAnchor: [25, 82]
        }));

        this.map.flyTo(trip.coords,6,{
            animate: true,
            duration:1.5
        });
    
        trip.marker.openPopup();
        this.#activeMarker = trip.marker;
    }
    _unFocusOnTrip()
    {
        
            this.#activeMarker.setIcon(L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconSize: [25, 41], // Стандартний розмір
                iconAnchor: [12, 41]
            }));
            this.#activeMarker.closePopup();
            // this.#activeMarker = null;
    
    }
    _saveToLocalStorage() {
        const tripsToSave = this.#trips.map(trip => ({
            coords: trip.coords,
            rate: trip.rate,
            expensies: trip.expensies,
            cityOf: trip.cityOf,
            cuisine: trip.cuisine,
            files: [] // Файли не зберігаємо у localStorage
        }));
    
        localStorage.setItem('trips', JSON.stringify(tripsToSave));
    }
    async _loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('trips'));
    
        if (!data) return; // Якщо даних немає, виходимо
    
        this.#trips = await Promise.all(data.map(tripData => {
            const trip = new Trip(
                tripData.coords, 
                tripData.rate, 
                tripData.expensies, 
                tripData.cityOf, 
                tripData.cuisine, 
                [] // Файли не можна зберігати в localStorage, тож ігноруємо їх
            );
            this._displayOnMap(trip);  // Додаємо на мапу
            this._displayTripOnSideBar(trip); // Додаємо в сайдбар
            return trip;
        }));
    }
    getMap() {
        return this.map;
    }
    async _getCityName(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            return data.address.city || data.address.town || data.address.village || 'Unknown';
        } catch (error) {
            console.error('Помилка отримання міста:', error);
            return 'Unknown';
        }
    }


    
    // async sendDataToServer(trip){
    //     const data = {
    //         coords: trip.coords,
    //         rate: trip.rate,
    //         expensies: trip.expensies,
    //         cityOf: trip.cityOf,
    //         cuisine: trip.cuisine
    //     }

    //     try {
    //         const response = await fetch('http://localhost:3001/api/trip',{
    //             method: 'POST',
    //             headers:{'Content-Type': 'application/json'},
    //             body: JSON.stringify(data),
    //             mode: 'cors' 
    //         });
    //         const result = await response.json();
    //         console.log('Server responce', result);

    //     } catch (error) {
    //         console.error('Error', error)
    //     }
    // }
    
    
}

// const OpenModalWindow = function () {
//     modalWindow.classList.remove('hidden');
//     blur.classList.add('active');
// };

// const CloseModalWindow = function () {
//     modalWindow.classList.add('hidden');
//     blur.classList.remove('active');
// };
// closeButton.addEventListener('click', () => {
//     modalWindow.classList.add('hidden');
//     blur.classList.remove('active');
// });
// document.addEventListener("keydown", (event) => {
//     if (event.key === "Escape") {
//         modalWindow.classList.add('hidden');
//         blur.classList.remove('active');
//     }
// });

const CloseModalWindow = () => popup.close();
form.addEventListener("submit",()=>{
    CloseModalWindow});
popup.addEventListener("click", (event) => {
    if (event.target === popup) {
        popup.close();
    }})
closeButton.addEventListener("click",() => popup.close())    


const app = new App();


/********************************************************************** */
const themeToggle = document.querySelector('.themeToggle');

themeToggle.addEventListener('change', () =>{
    document.body.classList.toggle("dark-mode");
    
    const map = app.getMap(); 
    if (document.body.classList.contains("dark-mode")) {
        app.map.removeLayer(app.lightTileLayer);
        app.darkTileLayer.addTo(app.map);
    } else {
        app.map.removeLayer(app.darkTileLayer);
        app.lightTileLayer.addTo(app.map);
    }
    modalWindow.classList.toggle("dark-mode");
})



const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  sidebar.classList.toggle("active");
});






