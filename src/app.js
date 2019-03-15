const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

let truckRoute = require('./routes/truckRoute')
app.use(truckRoute)

app.listen(port, () => console.log(`App listening on port ${port}`))
// app.listen(port, '192.168.0.113', () => console.log(`App listening on port ${port}`))