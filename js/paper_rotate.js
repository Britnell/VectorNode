
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var mouse=new Point(0,0);
	var trail;

	
	view.onFrame = function(event) {
		// 

		for(let x=0; x<50; x++){
			// get point
			let p = view.center.clone();
			kogs.forEach((kog)=>{
				p = p.add(kog.vec);
			});
			trail.add(p);
			// rotate kogs
			kogs.forEach((kog)=>{
				kog.vec = kog.vec.rotate(kog.rot);
			});
		}
		
		// 
	}

	tool.onMouseDown = function(event){
		// mouse = event.point;
		console.log(trail);
	}

	
	var kogs, wheel;

	function new_kog(p, speed){
		return { vec: new Point(p), rot: speed };
	}
	function main(){
		
		// * background
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		
		kogs = [];
		kogs.push(new_kog([30,0], 1 ));
		kogs.push(new_kog([10,150], 0.02 ));
		kogs.push(new_kog([0,25], 0.01 ));
		
		
		trail = new Path({
			strokeColor: 'white',
			strokeWidth: 1
		});

		// Eo main
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

