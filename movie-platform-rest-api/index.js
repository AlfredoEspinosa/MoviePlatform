const express = require('express');
const app = express();

app.get('/', (req, res)=>{
    res.send('Node.js Server  💻');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is up and running and listening in port ${PORT}`);
})