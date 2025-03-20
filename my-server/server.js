// const express = require('express');
// const cors = require('cors');
// const app = express();
// app.listen(3001,()=>console.log('hellooo'));
// app.use(express.static('public'));
// app.use(express.json({limit: '1mb'}));

// app.use(cors());  // Це дозволить всі запити з інших доменів


// const database =[];

// app.post('/api',(request,response)=>{
//     console.log('I got it');
//     console.log(request.body);
//     const data =request.body;
//     database.push(data);
//     console.log(database);
//     response.json({
//         status: 'success',
//     })

// })

const express =require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app =express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/travel_memory', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  const TripSchema = new mongoose.Schema({
    city: String,
    country: String,
    rating: Number
});

const Trip = mongoose.model('Trip', TripSchema);

app.post('/api/trip', (req, res) => {
    const newTrip = new Trip(req.body);
    newTrip.save()
        .then(() => res.json({ message: 'Trip saved' }))
        .catch(err => res.status(500).json({ error: 'Failed to save trip' }));
});

app.listen(3001,()=>console.log('Helloooo'));

