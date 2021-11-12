/*
    # # # # ------------   
*/



	// * Setup
const express = require('express'); // running immediately

const fs = require('fs');

const app = require('express')(); // running immediately
const server = require('http').Server(app);

const port = 3000;

// server.listen(port, () =>  {
//   console.log(`Server is runnign port http://localhost:${port} `);
// } );

	// * Express

app.get('/', (req,res) => {
  res.sendFile(__dirname +'/index.html');
});

// app.get('/list-letters', (req,res)=>{
// });
app.use('/html', express.static('html'));
app.use('/js', express.static('js'));
app.use('/static', express.static('static'));
app.use('/letters', express.static('letters'));
app.use('/cdt2d', express.static('cdt2d'));


console.log(`App is runnign port http://localhost:8000 `);
app.listen(8000);
