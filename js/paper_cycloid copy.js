
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	const Ra = Math.floor( 0.4 * (view.size.height+view.size.width) /4 );
	var cogA, cogB;
	var arm, penArm;

	// new Path.Circle({
	// 	center: view.center,
	// 	radius: Ra,
	// 	strokeColor: 'black'
	// })

	const col_dark = '#505050';
	const col_light = '#909090';

	var speed = 2;
	var centerGear = 120;	// center : 120 , 150
	var ratios = [ 32, 34, 40, 50, 58, 60, 72, 74, 90, 94, 98, 100  ];
	
	function random_ratio(){
		let rat = ratios[ Math.floor(Math.random()*ratios.length) ];
		if(Math.random()<0.3)
			rat = -rat;
		return rat ;
	}	
	// 

	function new_cog(){
		let cog = {
			a_init: random_int(0,360),
			a: 	0,
			gear: random_ratio(),
			cog_pos: function(){
				return this.shape.position.clone();
			},
			out_pos: function(){
				return this.shape.position.add(new Point({ angle: this.a, length: this.shape.bounds.width / 2 }) );
			},
			// cog circle
			shape: 
				new Group([ 
						new Path.Circle({
						center: [0,0],
						radius: random_int(50,80),
						strokeWidth: 4,
						strokeColor: col_dark
					}),
					new Path.Circle({
						center: [0,0],
						radius: 12,
						fillColor: col_light
					}) 
				]),
			// cog point
			dot: new Path.Circle({
				center: [0,0],
				radius: 5,
				fillColor: col_light
			})
			// cog center
			
		};
		cog.a = cog.a_init;
		cog.shape.onMouseDown = shape_down;
		cog.shape.onMouseDrag = shape_drag;
		return cog;
	}

	var shape_click = 'x';

	function shape_down(click){
		let ctr = click.target.lastChild;
		// console.log( click.point, ctr.bounds.center )
		if(ctr.contains(click.point))
			shape_click = 'center';
		else
			shape_click = 'radius';
	}

	function shape_drag(drag){
		flush();		// delete art
		if(shape_click=='center')
			center_drag(drag);
		else if(shape_click=='radius')
			radius_drag(drag);
	}

	function center_drag(drag){
		drag.target.position = drag.point;
	}
	function radius_drag(drag){
			// let v = event.delta
			let dir = drag.point.subtract(drag.target.position);
			let diff = Math.abs(drag.delta.angle -dir.angle);
			if((diff) < 60){
				let prop = (drag.target.bounds.width + drag.delta.length ) / drag.target.bounds.width;
				drag.target.scale(prop)
			}
			else if(diff>120){
				let prop = (drag.target.bounds.width - drag.delta.length ) / drag.target.bounds.width;
				drag.target.scale(prop)
			}
	}

	function one_fixed(){

		cogA = new_cog();
		console.log(cogA.gear);
		// cogA.a = null;		// fixed, wont move
		// cogA.shape.scale(1/100);
		cogA.shape.position = new Point(Ra, random_int(50,view.size.height-50));
		// cogA.center.position = cogA.shape.position;
		cogA.dot.position = cogA.cog_pos();
		

		cogB = new_cog();
		cogB.shape.position = view.center.add( [Ra,random_int(-200,200)] );
		// cogB.center.position = cogB.shape.position;
		cogB.dot.position = cogB.out_pos();

		// pen arm
		penArm.anchor = (Math.random()<0.5) ? cogA.dot : cogB.dot;
		
	}

	function new_arms(){
		// arm joining dots
		arm = new Path.Line({
			strokeWidth: 1,
			strokeColor: col_dark
		});
		// pen arm holding pen
		penArm = {
			// anchor: [0,0],
			offset: Ra* random(0.6,1.4),
			length: Ra * random_int(0.5,2),
			line: new Path.Line({
				strokeWidth: 1,
				strokeColor: col_dark
			}),
			marker: new Path.Circle({
				radius: 12,
				fillColor: col_light
			})
		}
		// arm.sendToBack();
		// penArm.line.sendToBack();
	}

	
	function step(){
		step_cog(cogA);
		step_cog(cogB);
		step_arm();
		step_pen();
		rotate_art();
	}
	
	function step_cog(cog){
		if(cog.a!=null){
			cog.a += speed * centerGear / cog.gear;
			cog.dot.position = cog.out_pos();
		}
	}

	function step_arm(){
		arm.firstSegment.point = cogA.dot.position;
		arm.lastSegment.point = cogB.dot.position;
	}

	function step_pen(){
		// console.log(' pen ', arm )
		// let armAngle = cogA.dot.position
		let armPoint = arm.getPointAt(penArm.offset);
		let norm = arm.getNormalAt(penArm.offset).multiply(penArm.length);
		let p = armPoint.add(norm);
		
		// * 
		penArm.marker.position = armPoint;
		penArm.line.firstSegment.point = armPoint;
		penArm.line.lastSegment.point = p;
		//
		art.add(p);
	}

	function rotate_art(){
		art.rotate(speed,view.center);
	}

	var stop = false;

	function flush (){
		art.removeSegments();
	}

	//	############################################################
	
	function setup(){
		
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		art = new Path({
			strokeColor: 'white'
		});


		new_arms();

		// generate cogs
		one_fixed();


		// Eo setup
	}

	setup();

	function reset(){
		art.removeSegments();
		// reset angles
		cogA.a = cogA.a_init;
		cogB.a = cogB.a_init;
		// step to move shapes
		step_arm();
		step_pen();
		
		view.draw();
	}

	view.onFrame = function(event) {
		if(!stop)
			step();
	}

	tool.onMouseDown = function(event){

		
		// * stop anim.
		// if(!stop) {
		// 	stop = true;
		// 	// remove draw shapes
		// 	cogs.forEach((cog)=>{
		// 		cog.dot.remove();
		// 		cog.shape.remove();
		// 		cog.armCircle.remove();
		// 		scroll = art.segments.length;
		// 	})
		// 	// 
		// 	// art.simplify();
		// 	art.visible = false;
		// }
	}

	var scroll;
	var lastVal = 0;
	var copy;

	tool.onMouseDown = function(event){
		
	}
	tool.onMouseDrag = function(event){

		// Eo drag
	}

	tool.onKeyDown = function(event){
		if(event.key=='space'){
			// reset
			if(stop)
				stop = false;
			else {
				reset();
				stop = true;
			}
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

