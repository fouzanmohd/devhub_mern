const express = require('express')
const app = express()
const connectDB = require('./config/db')

app.get('/', (req,res)=>{
    res.send('Api is running!')
})

// MongoDB Connection
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))