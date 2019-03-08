const config = require('../config')
const axios = require('axios')
const polyline = require('@mapbox/polyline');

exports.getTruckRoute = (origin, destination, truckProfile) => {
    console.log(origin, destination)
    return new Promise((resolve, reject) => {
        if(!origin || !destination) { reject({'status': 'error', 'message': 'Invalid parameters'}) }

        let url = `https://route.api.here.com/routing/7.2/calculateroute.json?app_id=${config.HERE_APP_ID}&app_code=${config.HERE_APP_CODE}`
        url += `&waypoint0=geo!${origin}&waypoint1=geo!${destination}`
        url += `&mode=fastest;truck;traffic:disabled&routeAttributes=shape`
        url += `&width=${truckProfile.width}&height=${truckProfile.height}&length=${truckProfile.length}`

        return axios.get(url).then((res) => {
            const data = res.data.response.route[0]
            let obj = {}
            obj.maneuver = data.leg[0].maneuver
            obj.origin = data.leg[0].start
            obj.destination = data.leg[0].end
            obj.distance = data.summary.distance
            obj.time = {traffic: data.summary.trafficTime, travel: data.summary.travelTime}
            obj.pointCoords = []

            let coordArray = []
            data.shape.forEach(point => {
                let coord = point.split(',')
                coordArray[coordArray.length] = [parseFloat(coord[0]), parseFloat(coord[1])]
                obj.pointCoords.push({ 'latitude': parseFloat(coord[0]), 'longitude': parseFloat(coord[1]) })
            });

            obj.polylines = polyline.encode(coordArray)
            // obj.pointCoords = data.shape.map(point => {
            //     let coord = point.split(',')
            //     // obj.arr.push([[parseFloat(coord[0]), parseFloat(coord[1])]])
            //     return {'latitude': parseFloat(coord[0]), 'longitude': parseFloat(coord[1])}
            // })
            resolve(obj);
        }).catch(err => { console.log(err.response.data.details); reject({ 'status': 'error', 'message': err.response.data }) })

    })
}

// 47.083941,21.885 oradea
// 45.6637,25.512863 brasov