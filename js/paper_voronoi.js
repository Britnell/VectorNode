
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
		
	}

	function random_int(min,max){
		return Math.floor( min + Math.random()*(max-min));
	}

	function random_points(N){
		let points = [];
		while(points.length<N){
			points.push(new Point(random_int(0,view.size.width),random_int(0,view.size.height)) );
		}
		return points;
	}

	var voronoi = new Voronoi();

	function main(){
		let margin = 0;
		// * bounding box
		let bbox = {
			xl: margin,
			xr: view.bounds.width - margin,
			yt: margin,
			yb: view.bounds.height - margin
		};
		
		let n = random_int(3,20);
		var sites = random_points(n);

		var diagram = voronoi.compute(sites, bbox);
		console.log(' VORONOI ', diagram );
		// diagram.vertices    points on frame between points
		// giagram.edges       edges of frame between poitns
		
		diagram.cells.forEach((cell)=>{
			// let cellpoint = new Point(.x,cell.site.y);

			// new Path.Circle({
			// 	center: cell.site,
			// 	radius: 10,
			// 	fillColor: '#00ffff'
			// });

			// draw cell shape
			let outl = new Path();
			cell.halfedges.forEach((half)=>{
				outl.join( new Path.Line({
					from: half.edge.va,
					to: half.edge.vb
				}));
			});
			// outl.fillColor = '#a0a040';
			// outl.scale(0.99,c.center);
			// console.log(' shape ', outl );

			// * trace along shape
			let dens = 10;
			// for(let x=0; x<outl.length; x+=dens){				let loc = outl.getLocationAt(x);			}
			let star = new Path({
				strokeColor: 'black'
			});
			let L = view.size.width +view.size.height;

			for(let x=0; x<360; x+= 6 ){
				let v = new Point({
					length: L,
					angle: x
				});
				let li = new Path.Line({
					from: cell.site,
					to: v.add(cell.site)
				});
				let ints = li.getCrossings(outl);
				if(ints.length>0){
					new Path.Line({
						from: cell.site,
						to: ints[0].point,
						strokeColor: 'black',
						strokeWidth: 3
					});
				}
			}

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

