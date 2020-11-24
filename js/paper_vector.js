
paper.install(window);

var intersect;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	var bound = new Path.Circle({
		center: view.center,
		radius: 1,
		strokeColor: 'blue'
	})

	var shp = new Path({
		strokeColor: 'black'
	})
	shp.add([-30,30],[0,0],[30,30],[30,-30]);

	function main(){
		bound.fitBounds(view.size);
		
		intersect = new Group({
			fillColor: 'green',
			strokeColor: null
		});

	}
	main();

	view.onFrame = function(event) {
		//
	}



	tool.onMouseDown = function(event){
		//
		shp.position = event.point;

		let int = shp.subtract(bound,{trace: true});
		int.strokeColor = 'red';
		console.log(' i: ', int );
		// intersect.addChild(int);
		// console.log(' i ', intersect.area );
	}

	
	function linear(x,xmin,xmax, ymin,ymax){
		let r = (x-xmin)/(xmax-xmin);
		return ymin + r * (ymax-ymin);
	}

	function limit(x,xmin,xmax){
		if(x<xmin)
			x = xmin;
		else if(x>xmax)
			x = xmax;
		return x;
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
	
	// view.draw();
}

