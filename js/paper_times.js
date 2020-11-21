
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var nMin = 50;
	var nMax = 160;
	var qMin = 2;
	var qMax = 200;
	var border = 30;
	
	var N = 99;
	var Q = 2;

	var last_render = [0,0];
	var drag;

	function main(){
		draw_the_thing(Q,N);
		
		//
	}
	main();

	view.onFrame = function(event) {

		//
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

	tool.onMouseDown = function(event){

	}

	tool.onMouseDrag = function(event){
		
		let delta = event.point.subtract(event.lastPoint);
		delta = delta.multiply(0.05);
		N = limit(N-delta.y,nMin,nMax);
		Q = limit(Q+delta.x,qMin,qMax);
		project.activeLayer.removeChildren();
		draw_the_thing(Q,N);

		//
	}


	function draw_the_thing(Q,N){
		let q = Math.round(Q);
		let n = Math.round(N);
		new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		})
		// 			
		let circle = create_circle(n);
		let lines = times_table(q,n, circle );
		lines.strokeColor = 'red';
		// label
		let label = new PointText({
			point: [30,30],
			content: `[${q}:${n}]`,
			fillColor: 'white',
			fontSize: 25
		})
	}


	
	function create_circle(N){
		let radius = (view.size.width<view.size.height) ? view.size.width : view.size.height;
		radius *= 0.5 * 0.9;
		let alph = 360 / N;
		// let group = new Group();
		let array = [];
		for(let n=0; n<N; n++){
			let p = view.center.add( new Point({
				length: radius,
				angle: n*alph
			}) );
			array.push(p);
		}
		return array;
	}

	function times_table(Q, N, circle ){
		let group = new Group();
		for(let x=1; x<N; x++){
			// for each val
			let p1 = circle[x];
			let rem = (x*Q)%N;
			if(x!=rem){
				// * only draw if not the same	
				let p2 = circle[rem];
				group.addChild(new Path.Line({
					from: p1,
					to: p2
				}));
			}
		}
		return group;
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

