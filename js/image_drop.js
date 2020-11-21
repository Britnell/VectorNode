/*
 *    V1
 *
 */

paper.install(window);

window.onload = function() {
  
  
  //            #######################           Funcitons


  function from_angle(alpha){
    var p = new Point( stepSize* Math.cos(alpha), stepSize* Math.sin(alpha) ); 
    return p;
  }
  
  function random(min,max){
    return Math.floor( min + Math.random() *(max-min) );
  }

  function random_f(min,max){
    return ( min + Math.random() *(max-min) );
  }

  function random_hue(){
    return { hue: random(0,360), saturation: 1, brightness: 1 };
  }

  function random_col(){
    return { hue: random(0,360), saturation: random_f(0.30,0.99), brightness: random_f(0.20,0.99) };
  }

  function random_col_var(){
    var Var = 20;
    let h = Hue + random(-Var,Var);
    if(h<0) h += 360;
    else if(h>=360) h -= 360;
    return { hue: (h), saturation: random_f(0.40,0.99), brightness: random_f(0.20,0.99) };
  }

  function random_point(size){
    return new Point( random(-size,size), random(-size,size) );
  }

  function rescale(x,min,max,omin,omax){
    var prop = (x-min)/(max-min);
    return omin + prop * (omax-omin);
  }
  function expon(x,min,max,omin,omax){
    var prop = (x-min)/(max-min);
    return omin + prop* prop* (omax-omin);
  }

    // * Setup

  paper.setup('papercanvas');
  var tool = new Tool();

  // * Hammer

  var canvas = document.getElementById('papercanvas');
    
  //            ***       setup     *****

  function setup(){ 
    
    
  }


  function reset(){
    
    //
  }


  setup();

  


  view.onFrame = function(event){ 
      //

      paper.view.draw();
    
    // Eo Frame
  }



  //
  //                ##########################################################
  //
  
  tool.onMouseDown = function(event){
    //
  }

  tool.onMouseDrag = function (event){

    // Eo mouseDrag
  }


  tool.onKeyDown = function(event) {

    // * Any Key : Reset
    if(event.key=='space'){
      // on space, add a droplet
      for(var x=0;x<3;x++)
        drops.push( new Drop() );   // 
      return false;
    }

  }

  // paper.view.draw();

  //    **    window.load
}

