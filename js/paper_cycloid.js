
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var drawLayer, mechanicsLayer;

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

	var speed = 1;
	var centerGear = 120;	// center : 120 , 150
	var ratios = [ 15, 30, 60,  12, 24, 48, 60, 72, 84, 96, 108, 10, 40, 80 ];
		//50, 58, , 72, 74, 90, 94, 98, 100  ];
	
	function random_ratio(){
		// let rat = -ratios[ Math.floor(Math.random()*ratios.length) ];
		// if(Math.random()<0.3)
		// 	rat = -rat;
		// return rat ;
		return random_int(4,120);
	}	
	// 


	var cogA_widget, cogB_widget, speed_widget;

	function setup_widgets(){
		let y = view.size.height - 40;
		cogA_widget = gear_widget([view.center.x/2,y]);
		cogB_widget = gear_widget([view.center.x*1.5,y]);

		cogA_widget.text.content = 'Gear A: '+cogA.gear;
		cogB_widget.text.content = 'Gear B: '+cogB.gear;
		cogA_widget.update_textbox();
		cogB_widget.update_textbox();

		speed_widget = gear_widget([view.center.x, 40]);
		speed_widget.text.content = 'Speed  '+speed;
		speed_widget.update_textbox();

		// cogA_widget.text.bounds.selected = true;
		// cogA_widget.box = new Path.Rectangle(cogA_widget.text.bounds);
		
		
	}

	function gear_widget(point){
		return {
			text: new PointText({
				point: point,
				fillColor: 'white',
				fontFamily: 'Courier New',
				fontSize: 20
			}),
			box: new Path.Rectangle({
				point: point,
				size: [1,1],
				strokeColor: 'white'
			}),
			update_textbox: function(str){
				if(str)
					this.text.content = str;
				this.box.removeSegments();
				this.box = new Path.Rectangle(this.text.bounds);
				this.box.strokeColor = 'white';
				this.box.scale(1.1);
			}
		}
	}

	

	function new_cog(){
		let cog = {
			a_init: random_int(0,360),
			a: 	0,
			gear: random_ratio(),
			cog_pos: function(){
				return this.wheel.position.clone();
			},
			out_pos: function(){
				return this.wheel.position.add(new Point({ angle: this.a, length: this.radius() }) );
			},
			// cog circle
			wheel: new Path.Circle({
					center: [0,0],
					radius: random_int(50,80),
					strokeWidth: 4,
					strokeColor: col_dark
				}),
			radius: function(){
				return this.wheel.bounds.width/2;
			},
			center: new Path.Circle({
					center: [0,0],
					radius: 15,
					fillColor: col_light
				}),
			// cog point
			dot: new Path.Circle({
				center: [0,0],
				radius: 5,
				fillColor: col_light
			})
			// cog center
			
		};
		cog.a = cog.a_init;
		return cog;
	}

	function move_cog(cog, point){
		cog.wheel.position = point;
		cog.center.position = point;
	}

	var swap_anchor = false;

	function one_fixed(){

		cogA = new_cog();
		// cogA.a = null;		// fixed, wont move
		// cogA.shape.scale(1/100);
		move_cog(cogA, new Point(Ra, random_int(50,view.size.height-50)) );
		

		cogB = new_cog();
		move_cog( cogB, view.center.add( [Ra,random_int(-200,200)] ) );
		

		// pen arm
		if(Math.random()<0.5){
			swap_anchor = true;
			penArm.anchor = cogB.dot;
		}
		else {
			penArm.anchor = cogA.dot;
			swap_anchor = false;
		}


		//
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
			length: Ra * random(0.5,2),
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

	
	function step(rotate){
		if(rotate){
			step_cog(cogA);
			step_cog(cogB);
		}
		update_cog(cogA);
		update_cog(cogB);

		update_arm();
		let p = update_pen();
		if(rotate){
			if(drawLayer!=project.activeLayer)
				drawLayer.activate();
			art.add(p);
			rotate_art();
		}
	}
	
	function step_cog(cog){
		cog.a += speed * centerGear / cog.gear;
	}

	function update_cog(cog){
		cog.dot.position = cog.out_pos();
	}

	function update_arm(){
		arm.firstSegment.point = cogA.dot.position;
		arm.lastSegment.point = cogB.dot.position;
	}

	function update_pen(){
		let off = penArm.offset;
		if(swap_anchor)
			off = arm.length - penArm.offset;
		let armPoint = arm.getPointAt(off);
		let norm = arm.getNormalAt(off).multiply(penArm.length);
		let p = armPoint.add(norm);
		
		// * 
		penArm.marker.position = armPoint;
		penArm.line.firstSegment.point = armPoint;
		penArm.line.lastSegment.point = p;
		//
		return p;
	}

	function rotate_art(){
		art.rotate(speed,view.center);
	}

	var stop = true;

	function flush (){
		art.removeSegments();
	}

	//	############################################################
	
	function setup(){
		
		drawLayer = new Layer();
		mechanicsLayer = new Layer();

		drawLayer.activate();
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		art = new Path({
			strokeColor: 'white'
		});

		mechanicsLayer.activate();
		
		// * Generate mechanics
		new_arms();
		one_fixed();

		step(false);

		setup_widgets();
		// Eo setup
	}

	setup();

	function reset(){
		// reset angles
		cogA.a = cogA.a_init;
		cogB.a = cogB.a_init;
		// step to move shapes
		step(false);
		
		// view.draw();
	}

	view.onFrame = function(event) {
		if(!stop){
			for(let x=0; x<3; x++){
				step(true);
			}
		}
	}

	var click = {}

	function cog_click(cog, point){
		let v = point.subtract(cog.cog_pos());
		// console.log(' rad : ', Math.abs( v.length -cog.radius() ),' center : ', v.length);
		if( Math.abs( v.length -cog.radius() ) < 10 ){
			click = { type: 'radius', target: cog };
			// cog.wheel.bounds.selected = true;
		}
		else if(v.length < 12)
			click = { type: 'center' ,target: cog };
	
	}

	function radius_drag(cog, point){
		let dist = point.subtract(cog.cog_pos());
		let prop = dist.length / cog.radius();
		cog.wheel.scale(prop);

	}

	function marker_click(point){
		let v = point.subtract(penArm.marker.position)
		if(v.length<20){
			click = { type: 'offset-marker' };
		}
	}

	function marker_drag(point){
		let dist = penArm.anchor.position.subtract(point);
		penArm.offset = dist.length;

	}

	function widget_click(point){
		if(cogA_widget.box.contains(point)){
			click = {type: 'widget', target: 'A' };
			gearDrag = cogA.gear;
		}
		else if(cogB_widget.box.contains(point)){
			click = {type: 'widget', target: 'B' };
			gearDrag = cogB.gear;
		}
		if(speed_widget.box.contains(point)){
			click = {type: 'widget', target: 'S' };
		}
	}

	var gearDrag, lastGear = 0;
	function widget_drag(letter,event){
		gearDrag += event.delta.x /20;
		
		if(gearDrag>100)			gearDrag = 100;
		else if(gearDrag<-100)		gearDrag = -100;

		let rou = Math.round(gearDrag);
		if(rou!=lastGear && rou!=0 ){
			
			if(letter=='A'){
				cogA.gear = rou;
				cogA_widget.update_textbox(' Gear '+letter+': '+rou);
			}
			else if(letter=='B'){
				cogB.gear = rou;
				cogB_widget.update_textbox(' Gear '+letter+': '+rou);
			}
			lastGear = rou;
		}
	}

	var lastSpeed = 0;
	function speed_drag(event){
		speed += event.delta.x /100;
		
		if(speed<0.3)			speed = 0.3;
		else if(speed>4)		speed = 4;

		let round = Math.round(speed*10)/10;
		if(round != lastSpeed){
			speed_widget.text.content = 'Speed '+round;
			speed_widget.update_textbox();
			lastSpeed = round;
		}
		//
	}

	tool.onMouseDown = function(event){
		if(click.type!='rewind'){
			click = {};
			marker_click(event.point);
			cog_click(cogA, event.point);
			cog_click(cogB, event.point);
			widget_click(event.point);
		}
	}

	tool.onMouseDrag = function(event){
		if(click.type=='center'){
			move_cog(click.target,event.point);
			step(false);
		}
		else if(click.type=='radius'){
			radius_drag(click.target, event.point);
			step(false);
		}
		else if(click.type=='offset-marker'){
			marker_drag(event.point);
			step(false);
		}
		else if(click.type=='widget'){
			if(click.target=='S')
				speed_drag(event);
			else 
				widget_drag(click.target,event);
		}
		else if(click.type=='rewind'){
			rewind_path(event);
		}
	}

	tool.onMouseUp = function(event){
		// if(Object.keys(click).length==0){
		// 	if(stop)
		// 		stop = false;
		// 	else {
		// 		stop = true;
		// 	}
		// }
	}

	var rewinding = false;
	var rewindVal, rewindCopy, lastRewind = 0;

	function rewind_path(event){	// rr
		if(art.visible)		art.visible = false;

		let delta = event.point.subtract(event.lastPoint);
		if(Math.abs(delta.x)>Math.abs(delta.y))
			rewindVal += delta.x*2;
		else 
			rewindVal -= (delta.y)/5;


		if(rewindVal<0)		rewindVal = 0;
		else if(rewindVal>=art.segments.length)		rewindVal =art.segments.length;
		
		let round = Math.floor(rewindVal);
		if(round!=lastRewind){
			console.log(rewindVal)
			lastRewind = round;
			//
			if(rewindCopy) 				rewindCopy.removeSegments();
			rewindCopy = art.clone();
			rewindCopy.removeSegments(round);
			rewindCopy.visible = true;
		}

		
	}

	tool.onKeyDown = function(event){
		if(event.key=='space'){
			// reset
			if(stop)			stop = false;
			else 				stop = true;
			
		}
		else if(event.key=='c' || event.key=='x'){
			art.removeSegments();
		}
		else if(event.key=='h'){
			// hide mechanics
			if(mechanicsLayer.visible)
				mechanicsLayer.visible = false;
			else 	
				mechanicsLayer.visible = true;
		}
		else if(event.key=='r'){
			console.log(' rewinding');
			if(!rewinding){
				rewinding = true;
				click = { type: 'rewind' }
				stop = true;
				rewindVal = art.segments.length;
				mechanicsLayer.visible = false;
			}
			else {
				rewinding = false;
				click = {};
				mechanicsLayer.visible = true;
				art.visible = true;
				if(rewindCopy) 				rewindCopy.removeSegments();
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

