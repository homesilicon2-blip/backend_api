require("dotenv").config();
const app = require('./src/app')


app.listen(3000 , ()=>{
    console.log("hey this port is 3000")
})