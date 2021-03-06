const express = require('express');
let router = express.Router();
let { getTruckRoute, mapMatch } = require('../controllers/truckRouteController');

router.get('/api/v1/truck-route/:origin/:destination', (req, res) => {
    let origin = req.params.origin.split(',')
    let destination = req.params.destination.split(',')
    const truckProfile = {
        height: (parseFloat(req.query.height) > 1) ? parseFloat(req.query.height).toFixed(2) : 4.2,
        width: (parseFloat(req.query.width) > 1) ? parseFloat(req.query.width).toFixed(2) : 2.4,
        length: (parseFloat(req.query.length) > 1) ? parseFloat(req.query.length).toFixed(2) : 7
    }
    origin = parseFloat(origin[0]).toFixed(6) + ',' + parseFloat(origin[1]).toFixed(6)
    destination = parseFloat(destination[0]).toFixed(6) + ',' + parseFloat(destination[1]).toFixed(6)

    getTruckRoute(origin, destination, truckProfile).then((results) => {
        return res.send(results)
    }).catch(err => { console.log(err); return res.send(err) })
})

router.post('/api/v1/mapMatch', (req, res) => {
    const coordsArr = req.body.coordinates
    mapMatch(coordsArr).then((results) => {
        return res.send(results)
    }).catch(err => { console.log(err); return res.send(err) })

})

module.exports = router;

// 47.043979,21.933605
// 47.035664,21.942661