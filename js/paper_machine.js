
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	const Ra = Math.floor( 0.4 * (view.size.height+view.size.width) /4 );
	// new Path.Circle({
	// 	center: view.center,
	// 	radius: Ra,
	// 	strokeColor: 'black'
	// })

	var stop = false;

	var cogs = [];
	var art;
	

	function random_cog(){
		return {
			// angular position 
			pos_ang: random_int(0,180),
			pos_rad: Ra + random_int(-50,50),
			pos_speed : random(0.01,0.08),
			
			// 
			out_ang: random_int(0,360),
			out_rad: random_int(30,100),
			out_speed:  random(0.8,3),
			
			// arm: Ra + random_int(-30,30),	// set later, depending on distance
			
			pos_vec: function(){
				return new Point({
					length: this.pos_rad,
					angle: this.pos_ang
				})
			},
			out_vec: function(){
				return new Point({
					length: this.out_rad,
					angle: this.out_ang
				})
			}
		};
	}


	function new_cogs(){

		// pos_speed = random(0.2,1);

		let cogA = random_cog();
		let cogB = random_cog();

		// movement
		cogB.pos_speed = cogA.pos_speed;				// same speed !
		cogB.pos_ang = cogA.pos_ang +random_int(30,120);	// ensures right order
	
		// wheel
		cogB.out_rad = cogA.out_rad * random(0.2,1.2);

		if(Math.random()<0.2)
			cogB.out_speed = cogA.out_speed * random(0.99,1.01);
		else
			cogB.out_speed = cogA.out_speed;

			let pA = view.center.add(cogA.pos_vec());
			let pB = view.center.add(cogB.pos_vec());
			let cog_sep = pA.subtract(pB).length + (cogA.out_rad+cogB.out_rad)/2;

		cogA.arm = cog_sep * random(0.6,1.2);
		cogB.arm = cogA.arm * random(0.9,1.1);	// second similar to first

		// console.log(' arms ', cogA.arm, cogB.arm)
		// * Shapes
		
		cogA.dot = new Path.Circle({
			center: [0,0],
			radius: 3,
			fillColor: 'white'
		});
		cogA.shape = new Path.Circle({
			center: [0,0],
			radius: cogA.out_rad,
			strokeColor: 'grey'
		});
		cogA.armCircle = new Path.Circle({
			center: [0,0],
			radius: cogA.arm,
			strokeColor: 'grey'
			// ,visible: false
		});
		cogB.dot = new Path.Circle({
			center: [0,0],
			radius: 3,
			fillColor: 'white'
		});
		cogB.shape = new Path.Circle({
			center: [0,0],
			radius: cogB.out_rad,
			strokeColor: 'grey'
		});
		cogB.armCircle = new Path.Circle({
			center: [0,0],
			radius: cogB.arm,
			strokeColor: 'grey'
			// ,visible: false
		});

		//
		cogs.push(cogA);
		cogs.push(cogB);
	}

	function step_cogs(){
		cogs.forEach((cog)=>{
			// turn cogs
			cog.pos_ang += cog.pos_speed;
			cog.out_ang += cog.out_speed;
			// move shapes
			let pos = view.center.add( cog.pos_vec() );
			let dot =pos.add( cog.out_vec() );
			cog.shape.position = pos;
			cog.dot.position = dot;
			cog.armCircle.position = dot;
		})
	}

	function cog_point(cog){
		let center = view.center.add( cog.pos_vec() );
		return center.add( cog.out_vec() );
	}

	function solve_for(){
		let hits = cogs[0].armCircle.getIntersections(cogs[1].armCircle);

		if(hits.length>0){
			let closer = hits[0];
			let dist = view.center.subtract(hits[0].point).length;
			if(view.center.subtract(hits[1].point).length<dist)
				closer = hits[1];
			
			art.add(closer.point);
		}
		// Eo f()
	}
	
	function setup(){
		
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		art = new Path({
			strokeColor: 'white'
		});
		// generate cogs
		new_cogs();
		stop = false;


		// Eo setup
	}


	setup();

	view.onFrame = function(event) {
		//
		if(!stop)
			for(let x=0; x<5; x++){
				step_cogs();
				solve_for();
			}
	}

	tool.onMouseDown = function(event){
		// * stop anim.
		if(!stop) {
			stop = true;
			// remove draw shapes
			cogs.forEach((cog)=>{
				cog.dot.remove();
				cog.shape.remove();
				cog.armCircle.remove();
				scroll = art.segments.length;
			})
			// 
			// art.simplify();
		}
	}

	var scroll;
	var lastVal = 0;
	var copy;

	tool.onMouseDrag = function(event){
		art.visible = false;
		let delta = {
			x: event.point.x-event.lastPoint.x,
			y: event.point.y-event.lastPoint.y
		};
		if(Math.abs(delta.x)>Math.abs(delta.y)){
			scroll += delta.x*2;
		}
		else {
			scroll -= (delta.y)/5;
		}
		

		if(scroll < 0)
			scroll = 0;
		else if(scroll >= art.segments.length)
			scroll = art.segments.length-1;
		
		// 
		let round = Math.floor(scroll*1)/1;
		if(round!=lastVal){
			// console.log(' S ', scroll, round );
			lastVal = round;
			
			if(copy) 				copy.removeSegments();
			
			copy = art.clone();
			copy.removeSegments(round);
			// copy.simplify();
			copy.visible = true;
			
			// * 
			
		}

		// Eo drag
	}

	tool.onKeyDown = function(event){
		if(event.key=='space'){
			// Empty
			cogs = [];
			project.activeLayer.removeChildren();
			// restart
			setup();
		}
		return false;
	}

	// funcitons

	function random_point(){
		
	}

	function random_int(min,max){
		return Math.floor(min + Math.random() * (max-min));
	}
	function random(min,max){
		return min + Math.random() * (max-min);
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

