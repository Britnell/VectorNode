
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var path = new Path();
	path.strokeColor = 'black';
	
	var start = new Point(100, 100);
	path.moveTo(start);
	path.lineTo(start.add([ 200, -50 ]));
	
	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		path.rotate(0.5);
	}

	tool.onMouseDown = function(event){
		path.add(event.point);
	}

	
	

	// view.draw();
}