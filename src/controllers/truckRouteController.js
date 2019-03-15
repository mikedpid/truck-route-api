const config = require('../config')
const axios = require('axios')
const polyline = require('@mapbox/polyline');
const fs = require('fs')
const path = require('path');

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

exports.mapMatch = (latLngArr) => {
    return new Promise((resolve, reject) => {
        this.buildGpxFile(latLngArr).then((filepath) => {
            return this.convertFileToBuffer(filepath).then((encoded) => {
                let url = `https://rme.api.here.com/2/matchroute.json?app_id=${config.HERE_APP_ID}&app_code=${config.HERE_APP_CODE}&routemode=car&file=${encoded}`
                return axios.post(url, encoded, {
                    headers: { 'Content-Type': 'application/binary'}
                }).then(data => {
                    let obj = data.data.TracePoints.map(point => {
                        return  {'latitude': point.latMatched, 'longitude': point.lonMatched} 
                    })
                    resolve(obj)
                }).catch(err => {
                    reject(err.response.data)
                })
                return axios.get(url).then(data => { resolve(data.data) }).catch(err => { reject(err.response.data) })
            })
            
        })
    })
}

exports.buildGpxFile = (latLngArr) => {
    return new Promise((resolve, reject) => {
        const templateStart = `<?xml version="1.0"?>\n<gpx version="1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd"><trk><trkseg>`
        const templateEnd = '</trkseg></trk></gpx>'
        let templateContent = ''

        latLngArr.forEach(obj => {
            templateContent += `\n<trkpt lat="${obj.latitude}" lon="${obj.longitude}" />`
        })
    
        let template = templateStart + templateContent + templateEnd
        let pathName = path.join(__dirname, '../tempData/')
        let fileName = new Date().valueOf() + '.gpx'
        fs.writeFile(`${pathName + fileName}`, template, function(err) {
            if(err) { console.log(err); return reject(err) }
            console.log(`${fileName} has been saved`)
            return resolve({'file_path': pathName + fileName})
        })
    })
}

exports.convertFileToBuffer = (fileToConvert) => {
    return new Promise((resolve, reject) => {
        const file = fs.readFileSync(fileToConvert.file_path, (err) => {
            if(err) {
                console.log(err)
                return reject(err)
            }
        })
        const encoded = Buffer.from(file)//.toString('base64')
        fs.unlink(fileToConvert.file_path, () => {
            console.log('GPX File deleted')
        }) // delete the file
        return resolve(encoded)
    })
}

// 47.083941,21.885 oradea
// 45.6637,25.512863 brasov