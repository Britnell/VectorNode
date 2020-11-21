
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	let steps = 0.03;

	let a_diff = 0;
	let r_diff = 16;
	let rMax = view.size.width/2;

	
	var voronoi = new Voronoi();
	let frame = 50;
	
	var bbox = {
		xl: -frame,
		xr: view.bounds.width +frame,
		yt: -frame,
		yb: view.bounds.height +frame
	};
	
	function draw_petals(a_diff, r_diff){
		// * background
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});

		// create dots & draw
		let a = 0;
		let sites = [];

		for(let r=0; r<rMax; r+= r_diff){

			let p = new Point({
				length: r,
				angle: a
			});
			p = p.add(view.center);
			sites.push(p.clone());

			// new Path.Circle({
			// 	center: p,
			// 	radius: 2,
			// 	fillColor: '#c09010'
			// });

			a += a_diff;
		}

		// Voronoi
		let vroni = voronoi.compute(sites, bbox);

		// * draw frame
		vroni.edges.forEach((edge)=>{
			new Path.Line({
				from: edge.va,
				to: edge.vb,
				strokeColor:'white'
			});
		});

		// * draw cells
		// vroni.cells.forEach((cell)=>{
		// 	// draw cell shape
		// 	let outl = new Path({
		// 		strokeColor: 'white'
		// 	});
		// 	cell.halfedges.forEach((half)=>{
		// 		outl.join( new Path.Line({
		// 			from: half.edge.va,
		// 			to: half.edge.vb
		// 		}));
		// 	});
		// 	outl.smooth();
		// 	outl.scale(0.8);
		// });

	}
	

	draw_petals(a_diff, r_diff);
	

	view.onFrame = function(event) {
		//

		a_diff += steps;

		// voronoi crashes at 180 degrees..... ? great fix :)
		if(a_diff>= 179.8 && a_diff<180.1)			a_diff = 180.1;
		
		if(a_diff>360)	a_diff = 0;

		project.activeLayer.removeChildren();
		draw_petals(a_diff,r_diff);

		let label = (a_diff);
		label = Math.floor(label*1)/1;
		new PointText({
			point: [20,20],
			fontSize: 18,
			fillColor: '#c09010',
			content: label.toString()
		});

		//
	}

	tool.onMouseMove = function(event){
		// project.activeLayer.removeChildren();
		// let a_diff = 360*(event.point.x/view.size.width) / 10;
		// let r_diff = (event.point.y/view.size.height) *10;
		// draw_petals(a_diff,r_diff);
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

