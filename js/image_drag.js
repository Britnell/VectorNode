/*
 *   Drag and drop image into paperjs example :
 *        https://gist.github.com/jcblw/6406436
 *
 */

paper.install(window);

window.onload = function() {
  
  paper.setup('papercanvas');
	var tool = new Tool();

  var input = document.getElementById('upload');
  var mock = document.getElementById('mock');
  var filter = /^image\/(?:svg\+xml)$/i;

  let drop;

  input.addEventListener('change', function(){
    var i = 0, 
      len = this.files.length, 
      img, file;
    
    if(this.files.length>1){
      console.log(" PLease just one image, try again");
    }
    else {
      console.log(this.files[0]);

      var image = document.getElementById('frame');
      image.src = URL.createObjectURL(this.files[0]);
      
      drop = new Raster('frame');
      drop.position = view.center;
      drop.scale(0.5);             
    } 
  }, true)

  


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

