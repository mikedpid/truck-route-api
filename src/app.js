const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let truckRoute = require('./routes/truckRoute')
app.use(truckRoute)

app.listen(port, () => console.log(`App listening on port ${port}`))