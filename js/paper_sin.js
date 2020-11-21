
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		// path.rotate(0.5);
	}

	tool.onMouseDown = function(event){
		// path.add(event.point);
	}

	function sine(x, c,amp,f){
		return c +amp *Math.sin(x*f);
	}

	function main(){

		let wave = new Path({
			strokeColor: 'grey'
		});

		for( let x=0; x< view.size.width; x+= 1 ){
			let y = sine(x, view.center.y, 100, 2 *Math.PI* 5 /view.size.width );
			wave.add([x,y]);
		}
		wave.selected = true;
		wave.simplify();

		//
	}
	main();
	
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

