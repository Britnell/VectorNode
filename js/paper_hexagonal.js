
// Only executed our code once the DOM is ready.


// ** parameters
paper.install(window);


var windowSize = [ window.innerWidth, window.innerHeight ];

var different_repeats = 6;
var corner_repeats = 12;
var spawn_perc = 0.1;

var born_if = [2,3];
var dies_if = [0,1,4,5,6];

var wrap = false;
var gridS = Math.floor(random(10,50));
var gridSY, hex_rad, gridX, gridY;

var period = 800;
var frame_period = 20;

var frame;
var rules;
var board = [];

var col_alive = new Color(1,0.5,0.2);
var col_dead = new Color(0,0,0);


var respawn = false;
var cornercount = 0;
var diffrntcount = 0;
var lastdifferent = 0;


function create_grid(){

  // create sizes
  gridSY = gridS * Math.sin(Math.PI/3);
  hex_rad = gridS /2 *1.14 +1;
  gridX = Math.floor( (windowSize[0]) /gridS )+1;
  gridY = Math.floor( (windowSize[1]) /gridSY )-1;
  frame = { x:0, y:gridSY };

  // Create gird & draw
  for(let y=0; y<gridY; y++){
    board.push([]);
    for(let x=0; x<gridX; x++){
      let field = {};
      
      field.state = 0;

      let hex_shift = (y%2==0) ? 0 : gridS/2 ;

      // Circle 
      // field.shape = new Path.Circle({
      //   center: [frame+x*gridS+hex_shift,frame+y*gridS],
      //   radius: gridS/2,
      //   fillColor: field.state==1 ? col_alive : col_dead,
      //   // fillColor: null
      // });
      field.shape = new Path.RegularPolygon({
        center: [frame.x+(x*gridS)+hex_shift , frame.y+(y*gridSY) ],
        sides: 6,
        radius: hex_rad,
        strokeColor: null
      });

      board[y].push(field);

      // Eo for
    }
  }  
  
  

  // Eo func
}

function ran(){
  return Math.random();
}

function random_state(){
  return (Math.random()<0.5) ? 0:1;
}

function init_grid(){

  // * Random rules
  rules = random_rules(3);
  document.getElementById('rules').textContent = ' Current rule set : '+ rules.toString();

  
  // * Reset Grid
  for(let y=0; y<gridY; y++){
    for(let x=0; x<gridX; x++){
      board[y][x].state = 0;
      // board[y][x].state = (ran()<spawn_perc) ? 1 : 0;
    }
  }

  // * Start pattern
  let beg = { x: Math.floor(gridX/2) , y: Math.floor(gridY/2) };

  if(beg.y%2!=0)        beg.y-=1;

  let r = ran();
  r = 1.0;

  if(r<0.25){     // * BEGIN DOT
    board[beg.y][beg.x].state  = 1;
  }
  else if(r<0.5){     // * begin line
    board[beg.y][beg.x].state  = 1;
    let len = 1 + Math.round( Math.random() * 5 );
    for(var l=1; l<len; l++){
      board[beg.y][beg.x-l].state = 1;
       board[beg.y][beg.x+l].state = 1;      
    }
  }
  else if(r<0.75){    // * incomplete line 
    board[beg.y][beg.x].state  = 1;
    let len = 1 + Math.round( Math.random() * 5 );
    for(var l=1; l<len; l++){
      if(ran()<0.5){  // pro
        board[beg.y][beg.x-l].state = 1;
        board[beg.y][beg.x+l].state = 1;      
      }
      // Eo for
    }
  }
  else {    // * hammer rows above and below
    board[beg.y][beg.x].state  = 1;
    board[beg.y-1][beg.x].state  = 1;
    board[beg.y-1][beg.x-1].state  = 1;
    board[beg.y+1][beg.x].state  = 1;
    board[beg.y+1][beg.x-1].state  = 1;
  }


  // paint
  for(let y=0; y<gridY; y++){
    for(let x=0; x<gridX; x++){
      board[y][x].shape.fillColor = (board[y][x].state==1) ? col_alive : col_dead;
    }
  }
  
}

function reset_grid(){

  // Remove old
  board.forEach( function(row){
    row.forEach( function(x){
      x.shape.remove();
    });
  });
  board = [];
  
  gridS = random(10,50);
  
  create_grid();

  init_grid();

}

function random_rules(number){

  let rule = [ ];

  while( rule.length<number ){
    let r = Math.floor( Math.random()*6 );
    if( !rule.includes(r) && r!=0 ){
      rule.push(r);
    }
  }
  return rule;
}


function apply_rules(state,nbrs){
  let res;
  
  if(true)
    if(rules.includes(nbrs)){
      res = 1;
    }
    else{
      res = 0;
    }
  
  if(false)
    if(state==1){
      if(dies_if.includes(nbrs))
        res = 0;
      else
        res = 1;
    }
    else{
      if(born_if.includes(nbrs))
        res = 1;
      else
        res = 0;
    }
  return res;
}

function next_day()
{
  let alive = 0;
  let change = 0;

  // * counts for dead-end conditions
  for(let y=0; y<gridY; y++){
    for(let x=0; x<gridX; x++){
      let ngbrs = count_neighbour(x,y);
      board[y][x].next = apply_rules(board[y][x].state, ngbrs);
      alive += board[y][x].next;
      if(board[y][x].next != board[y][x].state )  change++;
    }
  }

  // transfer state & color
  for(let y=0; y<gridY; y++){
    for(let x=0; x<gridX; x++){
      board[y][x].state = board[y][x].next;
      if(board[y][x].state==1)
        board[y][x].shape.fillColor = col_alive;
      else
        board[y][x].shape.fillColor = col_dead;
    }
  }

  // * if DEAD
  if(alive==0)      respawn = true;

  // * if stagnant
  if(change==lastdifferent){
    diffrntcount++;
    if(diffrntcount==different_repeats){
      diffrntcount = 0;
      respawn = true;
    }
  }
  else{
    diffrntcount = 0;
  }
  lastdifferent = change

  // * if reached corner
  if(board[0][1].state==1) {
    cornercount++;
    if(cornercount==corner_repeats)  {
      respawn = true;
      cornercount = 0;
    }      
    //
  }

  // Eo f
}

// * Count alive neighbours ,  alive: state=1
function count_neighbour(x,y){
  let nb = 0;
  if(y%2==0){
    // even
    nb += board_get(x-1,y).state;
    nb += board_get(x+1,y).state;
    nb += board_get(x-1,y-1).state;
    nb += board_get(x,y-1).state;
    nb += board_get(x-1,y+1).state;
    nb += board_get(x,y+1).state;
  }
  else {
    // odd
    nb += board_get(x-1,y).state;
    nb += board_get(x+1,y).state;
    nb += board_get(x,y-1).state;
    nb += board_get(x+1,y-1).state;
    nb += board_get(x,y+1).state;
    nb += board_get(x+1,y+1).state;    
  }
  return nb;
}

function board_get(x,y){
  let res;

  if(wrap){
    // wrapping
    if(x<0)             x+= gridX;
    else if(x>=gridX)   x-= gridX;
    if(y<0)             y+= gridY;
    else if(y>=gridY)   y-= gridY;
    res = board[y][x];  
  }
  else {
    // edge
    if(x<0 || x>=gridX || y<0 || y>=gridY )
      res = { state: 0 };
    else
      res = board[y][x];
  }
  return res;
}

function random(min,max){
  return min + Math.random()*(max-min);
}

function loop(){

  
  if( respawn ){
      reset_grid();
      respawn = false;
  }
  else {
    next_day();
  }

  // Eo loop
}

window.onload = function()
{
      // * Setup Paper
    paper.setup('paperCanvas');
    var ui = new Tool();

    create_grid();

    init_grid();


    ui.onMouseMove = function(event){

    }

    ui.onMouseDown = function(event){
      respawn = true;
    }

    ui.onKeyDown = function(event){
      if(event.key == 'space'){
        // respawn
        respawn = true;
        return false;
      }
    }
    //Eo window.onload

    view.onFrame = function(event) {

      // frame / draw
      if(event.count%frame_period==0)
        loop();

    }
}