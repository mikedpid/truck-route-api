const express = require('express');
let router = express.Router();
let { getTruckRoute } = require('../controllers/truckRouteController');

router.get('/api/v1/truck-route/:origin/:destination', (req, res) => {
    let origin = req.params.origin.split(',')
    let destination = req.params.destination.split(',')
    origin = parseFloat(origin[0]).toFixed(2) + ',' + parseFloat(origin[1]).toFixed(2)
    destination = parseFloat(destination[0]).toFixed(2) + ',' + parseFloat(destination[1]).toFixed(2)

    getTruckRoute(origin, destination).then((results) => {
        console.log(results) 
        return res.send(results)
    }).catch(err => { console.log(err); return res.send(err) })
})

module.exports = router;

// 47.043979,21.933605
// 47.035664,21.942661