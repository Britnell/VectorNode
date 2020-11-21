
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	function draw_hex_grid(grid_size){
		// hex grid, equilateral triangles
		// let x_off = Math.sin(30)*grid_size;	// offset of every other row
		let y_off = Math.sin(Math.PI /3)*grid_size;	// distance between y rows
		let hex_r = (grid_size/2) / (Math.cos(Math.PI/6));
		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();

		while(p.y < view.size.height +y_off)
		{
			// y loop
			if(row_i%2==1)
				p.x = -grid_size/2;
			else
				p.x = 0;

			while(p.x < view.size.width +grid_size)
			{
				// x loop
				shapes.addChild(new Path.RegularPolygon({
					center: p.clone(),
					sides: 6,
					radius: hex_r
				}));
				p.x += grid_size;
			}
			row_i++;
			p.y += y_off;
			// Eo y
		}
		return shapes;
	}

	function draw_4_8(gridS){
		
		let oct_h = Math.sqrt(2)*gridS;
		let oct_r = oct_h / Math.cos( 2*Math.PI/16 );

		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();

		while(p.y < view.size.height +gridS)
		{
			// y loop
			if(row_i%2==1)
				p.x = -gridS/2;
			else
				p.x = 0;

			while(p.x < view.size.width +gridS)
			{
				// x loop
				shapes.addChild(new Path.RegularPolygon({
					center: p.clone(),
					sides: 8,
					radius: oct_r/2
				}));
				p.x += gridS;
			}
			row_i++;
			p.y += gridS/2;
			// Eo y
		}
		return shapes;
	}
	

	// finds point where lines at ANGLE of to points meet , returns DISTANCE
	// * Polygon seems to be constructed clockwise
	function find_star_point(shape,angl){
		let corners = shape.segments.length;
		let long = shape.strokeBounds.size.width;	// make lines long enough to meet
		// get points
		let midA = shape.getPointAt( (1)*shape.length / corners /2 );
		let normA = shape.getNormalAt( (1)*shape.length / corners /2 );
		normA = normA.rotate(180).multiply(long);
		let midB = shape.getPointAt( (3)*shape.length / corners /2 );
		let normB = shape.getNormalAt( (3)*shape.length / corners /2 );
		normB = normB.rotate(180).multiply(long);
		// * create lines & find intersection
		let LA = new Path.Line({
			from: midA,
			to: midA.add(normA.rotate(-(90-angl)))
		});
		let LB = new Path.Line({
			from: midB,
			to: midB.add(normB.rotate((90-angl)))
		});
		let cross = LA.getCrossings(LB)[0].point;
		cross = cross.subtract(midA);
		return cross.length;
	}

	function get_star_points(shape,point,angle,dist){
		let loc = shape.getNearestLocation(point);
		let norm = shape.getNormalAt(loc).rotate(180).multiply(dist);
		return [ point.add(norm.rotate(90-angle)) , point.add(norm.rotate(-90+angle)) ];
	}

	function fill_shape(shape, angle){
		let corners = shape.segments.length;
		let star = find_star_point(shape,angle);

		let fill = new Path();
		for(let c=0; c<corners; c++){
			let mid = shape.getPointAt( (1+2*c)*shape.length / corners /2 );
			let stars = get_star_points(shape,mid,angle,star);
			// * In
			fill.join(new Path.Line({
				from: stars[0],		
				to: mid
			}));
			// * Out
			fill.join(new Path.Line({
				from: mid,		
				to: stars[1]
			}));
		}
		return fill;
	}

	function main(){

		// * background
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		
		let G = 100;
		let alph = 80;
		
		// * create structure shapes
		let gridShapes = draw_hex_grid(G);
		// let gridShapes = draw_4_8(G);
		gridShapes.strokeColor = '#303030';

		let fillShapes = new Group();
		gridShapes.children.forEach((shape)=>{

			let fill = fill_shape( shape, alph );	// returns fill shape
			fillShapes.addChild(fill);
			
			// Eo for each shape
		});		
		fillShapes.strokeColor = '#10e0a0';
	}
	main();

	view.onFrame = function(event) {
		//
	}

	tool.onMouseMove = function(event){
		
		// * redraw
		project.activeLayer.removeChildren();

		// * background
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});

		let G = 100;
		let alph = 1 + 90 * event.point.x / view.size.width;
		
		// * create structure shapes
		let gridShapes = draw_hex_grid(G);
		let fillShapes = new Group();

		gridShapes.children.forEach((shape)=>{

			let fill = fill_shape( shape, alph );	// returns fill shape
			fillShapes.addChild(fill);
			
			// Eo for each shape
		});

		gridShapes.strokeColor = '#303030';
		fillShapes.strokeColor = '#10e0a0';
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

