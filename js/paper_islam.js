
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var struct = 0;
	var structures = 6;

	var showGrid = false;
	var second = false;
	var G = 400;	// Grid size
	var gridShapes, fillShapes;
	var colour = '#e09010';
	var strokeWeight = 2;
	var mouse, lastMouse;

	var interlace = false;
	var background, strokeColour = 'black';
	var max_split;

	function draw_hex_grid(grid_size){
		// hex grid, equilateral triangles
		// let x_off = Math.sin(30)*grid_size;	// offset of every other row
		grid_size *= 2/3;
		let y_off = Math.sin(Math.PI /3)*grid_size;	// distance between y rows
		let hex_r = (grid_size/2) / (Math.cos(Math.PI/6));
		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();
		max_split = hex_r;

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
		
		let oct_h = Math.sqrt(2)*gridS/2;	// tangent to sides
		let oct_r = oct_h / Math.cos( 2*Math.PI/16 );	// radius to corners
		let oct_s = Math.sin(2*Math.PI/16) *oct_r;// side of octo

		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();
		max_split = oct_s;

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
				shapes.addChild(new Path.Rectangle({
					center: p.add([gridS/2,0]),
					size: [oct_s,oct_s]
				}));
				p.x += gridS;
			}
			row_i++;
			p.y += gridS/2;
			// Eo y
		}
		return shapes;
	}

	function draw_4612(gridS){

		let x = gridS/4;
		max_split = x;

		let w_dode, r_dode = (Math.sqrt(6)+Math.sqrt(2)) *x/2;
		let r_hex = x;
		let w_hex = Math.cos(Math.PI/6) *x *2;

		let x_grid = 0, y_grid = 0;
		
		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();

		while(p.y < view.size.height +gridS)
		{
			// y loop
			p.x = 0;

			while(p.x < view.size.width +gridS)
			{
				// * Same row
				let dode = new Path.RegularPolygon({
					center: p.clone(),
					sides: 12,
					radius: r_dode,
					rotation: 15
				});	
				shapes.addChild(dode);
				w_dode = dode.bounds.size.width;
				shapes.addChild(new Path.RegularPolygon({
					center: p.add([(w_dode/2+w_hex/2),0]),
					sides: 6,
					radius: r_hex
				}));
				shapes.addChild(new Path.Rectangle({
					center: p.add([(w_dode/2+w_hex+x/2),0]),
					size: [x,x]
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p.add([(w_dode/2+w_hex+x+w_hex/2),0]),
					sides: 6,
					radius: r_hex
				}));
				// * squares around dode
				let v = new Point({
					length: w_dode/2+x/2,
					angle: -30
				});
				for( let d=0; d<5; d++){
					shapes.addChild(new Path.Rectangle({
						center: p.add(v.rotate(60*d)),
						size: [x,x],
						rotation: (1+d)*60
					}));
				}
				// * 2nd dode
				shapes.addChild(new Path.RegularPolygon({
					center: p.add([(w_dode/2+w_hex+x/2) , (w_dode/2+x/2) ]),
					sides: 12,
					radius: r_dode,
					rotation: 15
				}) );
				// * 2 hex underneath
				v = new Point({
					length: w_dode/2+w_hex/2,
					angle: 60
				})
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v),
					sides: 6,
					radius: r_hex
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v.rotate(60)),
					sides: 6,
					radius: r_hex
				}));
				// * loop
				if(x_grid==0)
					x_grid = w_dode + 2*w_hex + x;

				p.x += x_grid;
			}
			if(y_grid==0)
				y_grid = w_dode + x;

			p.y += y_grid;
			// Eo y
		}
		return shapes;
	}

	function draw_altair(gridS){
		
		let x = gridS /2;
		max_split = x;
		
		let oct_d = x * Math.sqrt(4+2*Math.sqrt(2) );	// diameter
		let oct_w = x * (1+Math.sqrt(2));

		// let pent_h = x * Math.sqrt(3/4);
		let pent_h = x /2 *Math.sqrt( 5+2*Math.sqrt(5));
		let pent_rc = x / 10 * Math.sqrt(50+10*Math.sqrt(5) );
		let pent_ri = x / 10 * Math.sqrt(25+10*Math.sqrt(5) );
		
		let r_hex = x;
		let w_hex = Math.cos(Math.PI/6) *x *2;

		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();

		// HACK
		let xgrid = x * 8.32;
		let ygrid = x * 4.16;

		while(p.y < view.size.height +gridS)
		{
			// y loop
			if(row_i%2==1)
				p.x = -xgrid/2;
			else
				p.x = 0;

			while(p.x < view.size.width +gridS)
			{	
				let v;
				// x loop
				let oct = new Path.RegularPolygon({
					center: p.clone(),
					sides: 8,
					radius: oct_d/2
				});
				// oct_w = oct.bounds.size.width;
				shapes.addChild(oct);
				// pentagons
				v = new Point({
					length: oct_w/2 + pent_ri,
					angle: 0
				});
				// Draw pentagons manually, as successive roatation somehow translates them .... ?!
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v.rotate(0)),
					sides: 5,
					radius: pent_rc,
					rotation: 18
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v.rotate(180)),
					sides: 5,
					radius: pent_rc,
					rotation: -18
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v.rotate(-90)),
					sides: 5,
					radius: pent_rc,
					rotation: 0
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p.add(v.rotate(90)),
					sides: 5,
					radius: pent_rc,
					rotation: 72/2
				}));
				// * hexagons
				v = new Point({
					length: (w_hex + oct_w)/2,
					angle: 0
				});
				for(let x=0;x<4; x++){
					shapes.addChild(new Path.RegularPolygon({
						center: p.add(v.rotate(45+x*90)),
						sides: 6,
						radius: r_hex,
						rotation: 45+x*90
					}));
				}
				// * four hexagons
				let p2 = p.add([xgrid/2,0]);
				// dot(p2);
				shapes.addChild(new Path.Rectangle({
					center: p2.clone(),
					size: [x,x],
					rotation: 45
				}));
				v = new Point({
					length: x *0.55 + w_hex/2 ,
					angle: 45
				});
				shapes.addChild(new Path.RegularPolygon({
					center: p2.add(v),
					sides: 6,
					radius: r_hex,
					rotation: 16
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p2.add(v.rotate(180)),
					sides: 6,
					radius: r_hex,
					rotation: 16
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p2.add(v.rotate(-90)),
					sides: 6,
					radius: r_hex,
					rotation: -16
				}));
				shapes.addChild(new Path.RegularPolygon({
					center: p2.add(v.rotate(90)),
					sides: 6,
					radius: r_hex,
					rotation: -16
				}));
				
				// if(xgrid==0)		 xgrid = oct_w + 2*pent_h + 2*x + Math.sqrt(2)*x;
				p.x += xgrid;
			}
			row_i++;
			// if(ygrid==0)  ygrid = oct_w/2 + pent_h + x +x*Math.sqrt(2)/2;
			p.y += ygrid;
			// Eo y
		}
		return shapes;
	}

	
	function draw_12_43(gridS){
		
		let x = gridS / 5;
		// let x = gridS / ( 1/Math.sqrt(2) + (Math.sqrt(6)+Math.sqrt(2) / 2 ) );
		let p = new Point(0,0);
		let row_i = 0;
		let shapes = new Group();

		max_split = x;
		let w_dode = x * (2 + Math.sqrt(3));
		let r_dode = (Math.sqrt(6)+Math.sqrt(2)) *x/2;
		let squ_d = Math.sqrt(2)*x;

		let xGrid = r_dode*2 + squ_d;
		let yGrid = r_dode + squ_d/2;

		while(p.y < view.size.height +gridS)
		{
			// y loop
			if(row_i%2==1)
				p.x = -xGrid/2;
			else 
				p.x = 0;

			while(p.x < view.size.width +gridS)
			{
				// * dodecahedron
				shapes.addChild(new Path.RegularPolygon({
					center: p.clone(),
					sides: 12,
					radius: r_dode,
					rotation: 0
				}));
				let squ = new Path.Rectangle({
					center: p.add([r_dode+squ_d/2,0]),
					size: [x,x],
					rotation: 45
				});
				shapes.addChild(squ);
				
				// draw triangles
				squ.curves.forEach((c,i)=>{
					let p1 = c.point1;
					let p2 = c.point2;
					let trig = new Path({ closed: true });
					trig.add(p1);
					trig.add(p2);
					trig.add( p2.add( p2.subtract(p1).rotate(-120) ));
					shapes.addChild(trig);
				});

				p.x += xGrid;
			}
			row_i++;
			p.y += yGrid;
			// Eo y
		}
		return shapes;
	
	}

	function draw_10_qut(gridS){
		
		let x = gridS / 5;
		// let x = gridS / ( 1/Math.sqrt(2) + (Math.sqrt(6)+Math.sqrt(2) / 2 ) );
		let row_i = 0;
		let shapes = new Group();

		max_split = x;
		let deca_w = x * Math.sqrt(5 + 2*Math.sqrt(5) );
		let deca_r = x * (1+Math.sqrt(5));	
		
		let xGrid = deca_w;
		
		let f = x/2 * Math.sqrt(14 + 6*Math.sqrt(5) );
		let yGrid = f + 1*x;

		let p = new Point(0,0);
		while(p.y < view.size.height +gridS)
		{
			// y loop
			p.x = 0;

			while(p.x < view.size.width +gridS)
			{
				// * decagon
				let deca = new Path.RegularPolygon({
					center: p.clone(),
					sides: 10,
					radius: deca_r/2,
					rotation: 18
				});
				shapes.addChild(deca);
				// hourglass
				let hour = new Path({closed: true });
				let v = deca.segments[8].point.subtract(deca.segments[9].point);
				hour.add(deca.segments[0].point.add([0,x]).add(v));
				hour.add(deca.segments[0].point.add([0,x]));
				hour.add(deca.segments[0].point);
				hour.add(deca.segments[9].point);
				hour.add(deca.segments[8].point);
				hour.add(deca.segments[8].point.add([0,x]));
				shapes.addChild(hour);
				// ruby
				let ruby = new Path({closed: true});
				v = deca.segments[8].point.subtract(deca.segments[7].point)
				// ruby.add(deca.segments[7].point.add(v.rotate(-72)) );
				ruby.add(deca.segments[8].point.add([0,x]));
				ruby.add(deca.segments[8].point);
				let r = deca.segments[7].point;
				ruby.add(r.clone());	// 7 = tip
				r = r.add(v.rotate(-72));
				ruby.add(r.clone());	// top r
				r = r.add([0,x]);	
				ruby.add(r.clone());	// bot r
				r = r.add(v);	
				ruby.add(r.clone());	// bot
				shapes.addChild(ruby);
				// *
				p.x += xGrid;
			}
			row_i++;
			p.y += yGrid;
			// Eo y
		}
		return shapes;
	
	}

	function dot(p,r,col){
		if(!r)			r = 4;
		if(!col)	col = 'red';
		return new Path.Circle({
			center: p,
			radius: r,
			fillColor: col
		});
	}
	

	function get_split_points(shape, side, dist){
		let corners = shape.segments.length;
		let points = [], tang;

		let point = shape.getPointAt( (0.5+side)*shape.length / corners  );
		tang = shape.getTangentAt( (0.5+side)*shape.length / corners  );
		tang = tang.multiply(dist/2)
		points.push(point.add(tang));
		points.push(point.subtract(tang));
		return points;
	}


	
	// 33
	function fill_shape3(shape, angle, split){
		let corners = shape.segments.length;
		
		let fill = new Group();
		let long = shape.bounds.size.width; //shape.length;

		let r = shape.bounds.size.width / shape.bounds.size.height;
		if( Math.abs(1.90211-r) < 0.0001 ){
			// * hourglass shape
			for(let c=0; c<3; c++){
				// first half is 0,1,2
				let p = c-1;
				if(p==-1)	p = 2;
				
				let point = get_split_points(shape,c, split)[1];
				let point_norm = shape.getNormalAt( (0.5+c)*shape.length / corners  );
				point_norm = point_norm.rotate(180).multiply(long);
				let part = get_split_points(shape,p, split)[0];
				let part_norm = shape.getNormalAt( (0.5+p)*shape.length / corners  );
				part_norm = part_norm.rotate(180).multiply(long);
				
				let lineP = new Path.Line({
					from: point,
					to: point.add(point_norm.rotate(90-angle))
				});
				let lineX = new Path.Line({
					from: part,
					to: part.add(part_norm.rotate(-90+angle))
				});
				let int = lineP.getIntersections(lineX);
				let shp = new Path();
				shp.add(point);
				if(int.length>0) shp.add(int[0].point);
				shp.add(part);
				fill.addChild(shp);
				lineP.remove();			lineX.remove();
			}

			// * hourglass shape 
			for(let c=3; c<6; c++){
				// second half is 3,4,5
				let p = c-1;
				if(p==2)	p = 5;
				
				let point = get_split_points(shape,c, split)[1];
				let point_norm = shape.getNormalAt( (0.5+c)*shape.length / corners  );
				point_norm = point_norm.rotate(180).multiply(long);
				let part = get_split_points(shape,p, split)[0];
				let part_norm = shape.getNormalAt( (0.5+p)*shape.length / corners  );
				part_norm = part_norm.rotate(180).multiply(long);
				
				let lineP = new Path.Line({
					from: point,
					to: point.add(point_norm.rotate(90-angle))
				});
				let lineX = new Path.Line({
					from: part,
					to: part.add(part_norm.rotate(-90+angle))
				});
				let int = lineP.getIntersections(lineX);
				let shp = new Path();
				shp.add(point);
				if(int.length>0) shp.add(int[0].point);
				shp.add(part);
				fill.addChild(shp);
				lineP.remove();			lineX.remove();
			}
		}
		else
		for(let c=0; c<corners; c++){
			let p;
			if(second)			p = c-2;
			else 				p = c-1;
			if(p<0)	p += corners;

			let point = get_split_points(shape,c, split)[1];
			let point_norm = shape.getNormalAt( (0.5+c)*shape.length / corners  );
			point_norm = point_norm.rotate(180).multiply(long);
			let part = get_split_points(shape,p, split)[0];
			let part_norm = shape.getNormalAt( (0.5+p)*shape.length / corners  );
			part_norm = part_norm.rotate(180).multiply(long);
			
			let lineP = new Path.Line({
				from: point,
				to: point.add(point_norm.rotate(90-angle))
			});
			let lineX = new Path.Line({
				from: part,
				to: part.add(part_norm.rotate(-90+angle))
			});
			let int = lineP.getIntersections(lineX);
			let shp = new Path();
			shp.add(point);
			if(int.length>0) shp.add(int[0].point);
			shp.add(part);
			fill.addChild(shp);
			lineP.remove();			lineX.remove();
		}
		return fill;
	}

	

	

	// Re-calc fills & draw
	function islamify(angl, split){

		// // * redraw
		fillShapes.removeChildren();
		fillShapes = new Group();

		let max = 0.9;
		if(split>max)	split = max;
		else if(split<-max) split = -max;
		
		gridShapes.children.forEach((shape)=>{
			let fill = fill_shape3( shape, angl, split*max_split );	// returns fill shape
			fillShapes.addChild(fill);
		});		
		
		// fillShapes.strokeColor = colour;
		fillShapes.strokeColor = strokeColour;
		fillShapes.strokeWidth = strokeWeight;
	}

	function draw_grid(){

		if(gridShapes.hasChildren())
			gridShapes.removeChildren();
		
		if(struct==0)
			gridShapes = draw_hex_grid(G);
		else if(struct==1)
			gridShapes = draw_4_8(G);
		else if(struct==2)
			gridShapes = draw_4612(G);		
		else if(struct==3)
			gridShapes = draw_12_43(G);
		else if(struct==4)
			gridShapes = draw_10_qut(G);
		else if(struct==5)
			gridShapes = draw_altair(G);
		
		if(showGrid)
			gridShapes.strokeColor = 'grey';
	}

	function linear(x,min,max, omin, omax){
		let ratio = (x-min)/(max-min);
		return omin + ratio *(omax-omin);
	}

	function random_int(min,max){
		return Math.floor( min + Math.random() *(max-min) );
	}
	function random(min,max){
		return ( min + Math.random() *(max-min) );
	}


	
	function main(){	// mm

		// * main **********************************
		lastMouse = new Point(0,0);
		mouse = view.center;

		// * background
		background = new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: colour
		});
		background.fillColor = colour;

		// * create structure shapes
		gridShapes = new Group();
		draw_grid();
		
		// * init fill group
		fillShapes = new Group();
		
		let alph = linear(mouse.x, 0, view.size.width, 0,90 );
		let split = linear(mouse.y,0,view.size.height,-1,1);
		islamify(alph,split);
		lastMouse = mouse.clone();
		
		// EO main
	}
	main();

	view.onFrame = function(event) {

		// * Redraw
		if(mouse.subtract(lastMouse).length != 0){
			let alph = linear(mouse.x, 0, view.size.width, 0,90 );
			let split = linear(mouse.y,0,view.size.height,-1,1);
			islamify(alph,split);
			lastMouse = mouse.clone();
		}

		//
	}


	tool.onMouseDown = function(event){	// dd
		if(Math.random()<0.5)
			second = false;
		else
			second = true;
		
		let screen = (view.size.width<view.size.height) ? view.size.height : view.size.width;
		G = random_int(screen/5,screen/3);

		if(interlace)
			strokeWeight = random_int(1,4);	
		else
			strokeWeight = random_int(1,G/25);

		// background color
		colour = new Color({
			hue: random_int(0,360),
			saturation: random(0.6,0.9),
			brightness: random(0.4,0.9)
		});
		background.fillColor = colour;
		
		/// line color
		strokeColour= colour.clone();
		if(colour.brightness>0.7)
			strokeColour.brightness = random(0.1,0.2);
		else
			strokeColour.brightness = random(0.85,1);

		// change grid structure & rebuild grid
		struct = (struct+1)%structures;
		draw_grid();

		if(struct==3)	second = false;	// messes up small triangles here
		if(struct==4)	second = false;	// messes up small triangles here
		// redraw too
		mouse = event.point;
		let alph = linear(mouse.x, 0, view.size.width, 0,90 );
		let split = linear(mouse.y,0,view.size.height,-1,1);
		islamify(alph,split);
		lastMouse = mouse.clone();
	}

	tool.onMouseMove = function(event){
		mouse = event.point;
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

