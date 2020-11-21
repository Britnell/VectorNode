
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	
	//
	function draw_leaf(p, len, fatness, lopside, shape)
	{
		var leaf = new Path({
			// selected: true
		});

		let widt = len*fatness;
		shape *= len;

		let tipHandle;
		if(shape>  (1-lopside)*len){
			tipHandle = (1-lopside)*len;
		}
		else{
			tipHandle = shape;
		}

		// from stem
		let stem = p.clone();
		leaf.add(stem);

		let Rside = p.clone().add([(widt/2),(len*lopside)]);
		leaf.add( new Segment(Rside, new Point(0,-shape), new Point(0,tipHandle) ) );

		let tip = p.clone().add([0,len]);;
		leaf.add(tip);
	
		let Lside = p.clone().add([-(widt/2),(len*lopside)]);
		leaf.add( new Segment(Lside, new Point(0,tipHandle), new Point(0,-shape) ) );//.selected = true;
		
		leaf.add(stem);

		return leaf;
	}

	// * draw leaf in two halves for coloring
	function draw_leaf2(p, len, fatness, lopside, shape, col)
	{	
		let dark = col.clone();
		dark.brightness -= 0.1;

		var left = new Path({
			// selected: true
			fillColor: col
		});
		var right = new Path({
			// selected: true
			fillColor: dark
		});

		let widt = len*fatness;
		shape *= len;
		let tipHandle;
		if(shape>  (1-lopside)*len)
			tipHandle = (1-lopside)*len;
		else
			tipHandle = shape;

		let stem = p.clone();
		left.add(stem);
		right.add(stem);
		
		let Rside = p.clone().add([(widt/2),(len*lopside)]);
		right.add( new Segment(Rside, new Point(0,-shape), new Point(0,tipHandle) ) );

		let Lside = p.clone().add([-(widt/2),(len*lopside)]);
		left.add( new Segment(Lside, new Point(0,-shape), new Point(0,tipHandle) ) );//.selected = true;
		
		let tip = p.clone().add([0,len]);
		left.add(tip);
		right.add(tip);
	
		left.add(stem);
		right.add(stem);

		return new Group([left,right]);
	}

	
	function random(min,max){
		return min + ( Math.random() *(max-min) );
	}
	function random_int(min,max){
		return Math.floor(min + ( Math.random() *(max-min) ));
	}

	function random_color(){
		let c = new Color({
			hue: random(0,360),
			saturation: 0.75,
			brightness: 0.7
		});
		return c;
	}

	function draw_random_leaves(){
		let len = random_int(40,120);	// stem to tip
		let fat = random(0.3,0.8);		// proportion width to length
		let lop = random(0.2,0.8);  // asymmetry of leaf
		let sha = random(0.2,0.8);	// controls curve handle
		let col = new Color(random(0,0.5), random(0.7,1), random(0,0.4) );

		let leaves = random_int(30,100);
		for(let l=0; l<leaves; l++){
			let p = new Point( random_int(0,view.size.width), random_int(0,view.size.height) );
			draw_leaf2(p,len,fat,lop,sha,col);
		}
	}
	draw_random_leaves();

	function draw_test_leaves(){
		let col = new Color(0.2,0.9,0.05);

		for(let y=1; y<=10; y+=1)
		{
			for( let x = 1; x<= 10; x+= 1)
			{
				let p = new Point(x*130, 10+((y-1)*100));
				if(y%2==0)	p.x+= 65;

				// 		   draw_leaf(p, len, fatness, lopside, shape)
				let leaf = draw_leaf2(p, 80, 0.5, 0.2+0.07*y, 0.2 +0.05*x, col );

				// leaf.fillColor = 
			}
		}
	}
	// draw_test_leaves();
	

	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		// path.rotate(0.5);
	}

	tool.onMouseDown = function(event){
		
	}

	
	//		##########################			EXPORT			#####################
	


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


		// from tip
		// let tip = p.clone();
		// leaf.add(tip);
	
		// let Lside = p.clone().add([-(widt/2),-(len*lopside)]);
		// leaf.add( new Segment(Lside, new Point(0,shape), new Point(0,-shape) ) ).selected = true;
		
		// let stem = p.clone().add([0,-len]);
		// leaf.add(stem);

		// let Rside = p.clone().add([(widt/2),-(len*lopside)]);
		// leaf.add( new Segment(Rside, new Point(0,-shape), new Point(0,shape) ) );
		
		// leaf.add(tip);