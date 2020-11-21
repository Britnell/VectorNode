/*
    # # # # ------------   
*/



	// * Setup
const express = require('express'); // running immediately

const app = require('express')(); // running immediately
const server = require('http').Server(app);

const port = 3000;

// server.listen(port, () =>  {
//   console.log(`Server is runnign port ${port} `);
// } );

	// * Express

app.get('/', (req,res) => {
  res.sendFile(__dirname +'/html/paper_vector.html');
});

// app.get('/list-letters', (req,res)=>{
// });
app.use('/html', express.static('html'));
app.use('/js', express.static('js'));
app.use('/static', express.static('static'));
app.use('/letters', express.static('letters'));
app.use('/cdt2d', express.static('cdt2d'));

console.log(`App is runnign port :8000 `);
app.listen(8000);
