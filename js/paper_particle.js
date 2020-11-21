
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var mouse=new Point(0,0);
	var p, trail;

	
	view.onFrame = function(event) {
		// 
		for(let x=0; x<10; x++){
			p.move();
			trail.add(p.pos);
		}
		
		// 
	}

	tool.onMouseMove = function(event){
		mouse = event.point;
	}

	function move_particle(){
		// calc gravitations
		let acc = new Point(0,0);
		this.gravities.forEach((obj)=>{
			let vec = obj.center.subtract(this.pos);
			acc = acc.add( vec.normalize().multiply( obj.mass *100 / (vec.length*vec.length) ));
		});
		this.acc = acc;
		// add it all up
		this.vel = this.vel.add(this.acc)
		this.pos = this.pos.add(this.vel);
		this.shape.position = this.pos;
	}

	function new_particle(){
		let particle = {
			pos: new Point(0,0),
			vel: new Point(0,0),
			acc: new Point(0,0),
			move: move_particle,
			shape: new Path(),
			gravities: []
		}
		return particle;
	}

	function new_gravitation(p,m){
		let grav = {
			center: p,
			mass: m
		}
		return grav;
	}
	
	function main(){
		
		// * background
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});
		
		// * particle
		p = new_particle();
		p.pos = new Point(300,300);
		p.vel = new Point( 0.1, 0.8 );
		
		// * trail path
		trail = new Path({
			strokeColor: 'white'
		});

		// * gravitations
		let sun = new_gravitation(view.center, 3 );
		let lop = new_gravitation(view.center.add(new Point(400,-400)), 0.5 );
		p.gravities.push(sun);
		p.gravities.push(lop);

		// * Gravity points
		new Path.Circle({
			center: sun.center,
			radius: 20,
			fillColor: '#d09020'
		});
		new Path.Circle({
			center: lop.center,
			radius: 10,
			fillColor: '#d04000'
		});


		// p.move();
		// let timeout = true;
		// setTimeout(function(){ timeout = false; }, 5000 );

		// while(timeout){
		// 	p.move();
		// 	trail.add(p.pos);
		// }
	

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

