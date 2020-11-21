
paper.install(window);

var text;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var path = new Path();
	path.strokeColor = 'black';
	
	var square = new Path.Rectangle({
		point: view.center,
		size: [200,200]
	});
	square.fillColor = 'red';
	
	path.moveTo(new Point(0, view.center.y));
	path.add(new Point(view.size.width, view.center.y));
	// path.lineTo(start.add([ 200, -50 ]));
	
	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		// path.rotate(0.5);
	}

	tool.onMouseDown = function(event){
		// * new text at pos
		// text = new PointText({
		// 	point: event.point,
		// 	justification: 'center'
		// });
		text.position = event.point;

		// let r = square['intersect'](text);
	}

	text = new PointText({
		point: [view.center.x, view.center.y ],
		justification: 'center',
		fillColor: null,
		strokeColor: 'blue',
		strokeWidth: 1
	});
	
	let shift = false;
	tool.onKeyUp = function(event){
		if(event.key.includes('shift')){
			shift = false;
		}
	}

	tool.onKeyDown = function(event){

		console.log(event.key);
		if(event.key.length==1){
			text.content += shift? event.key.toUpperCase() : event.key;
		}
		else if(event.key.includes('backspace')){
			text.content = text.content.substring(0,text.content.length-1);
		}
		else if(event.key.includes('space')){
			text.content += " ";
		}
		else if(event.key.includes('enter')){
			text.content += "\n";
		}
		else if(event.key.includes('shift')){
			shift = true;
		}

		
		// scale to fit canvas
		let border = 20;
		let r_x = (view.size.width -border) / text.strokeBounds.width;
		let r_y = (view.size.height -border) / text.strokeBounds.height;
		text.fontSize = Math.floor( text.fontSize * ( (r_x<r_y)?r_x:r_y ) );
		
		// move up, text gets longer
		if(text.strokeBounds.y + text.strokeBounds.height > view.size.height ){
			text.position.y -= text.strokeBounds.y + text.strokeBounds.height - view.size.height;
		}

		return false;
	}

	
	// Here is a way with JS		https://www.mikechambers.com/blog/2014/07/01/saving-svg-content-from-paper.js/
	function downloadDataUri(options) {
		if (!options.url)
			options.url = "http://download-data-uri.appspot.com/";
		$('<form method="post" action="' + options.url
			+ '" style="display:none"><input type="hidden" name="filename" value="'
			+ options.filename + '"/><input type="hidden" name="data" value="'
			+ options.data + '"/></form>').appendTo('body').submit().remove();
	}
	
	$('#export-button').click(function() {
		// http://paperjs.org/reference/project/#exportsvg
		let export_options = {
			'bounds': 'view',	// 'content' uses outer stroke bounds
			'precision' : 5,	// amount of fractional digits in numbers used in SVG data 
			'asString': true 
		}
		var svg = project.exportSVG(export_options);
		downloadDataUri({
			data: 'data:image/svg+xml;base64,' + btoa(svg),
			filename: 'export.svg'
		});
	});
	

	
	
	function export_svg(){
		
		let expo = project.exportSVG(options);

		// Eo func
	}

	// view.draw();
}

