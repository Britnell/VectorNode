/*
	imposes shading lines onto shapes out of svg
	Manually tho
*/
var cdt2d = require('./cdt2d/cdt2d.js');

paper.install(window);

window.onload = function() {


	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	// ref /folder/file.svg
	function import_svg(ref,callback){
		project.importSVG(ref,(x)=>{
			callback(x);
		});
	}

	let svg;
	let dist = 60;

	function init(){
		// import svg & call main
		import_svg('/static/november2.svg',function(shape){
			svg = shape;
			main();
		})
	}
	init();
	
	var cdt;
	function run_cdt(group){
		// 
		cdt = {
			points: [],
			edges: []
		}
		
		// add shape points
		loop_through_children(group, function(path){
			// path.selected = true;
			add_path_cdt(path);
		});

		// add random point distribution
		add_points_outside(group);

		return cdt2d(cdt.points, cdt.edges, { exterior: true, interior: false });

	}

	function add_points_outside(group){
		
		let p= new Point(0,dist/2);

		do {
			// step in x & wrap
			p.x += dist;
			if(p.x>view.size.width){
				p.x -= view.size.width;
				p.x += dist/2;
				p.y += dist;
			}

			let ran = p.add( new Point({ length: random(0,dist/3), angle: random_int(0,360) }) );
			let outside = true;
			loop_through_children(group,function(path){
				if(path.contains(ran))
					outside = false;
			});

			if(outside){
				cdt.points.push([ran.x,ran.y]);
			}

		}
		while( p.y < view.size.height )

	}
	function draw_cdt(points){

		points.forEach((trig)=>
		{
			// for each array of indices
			let path = new Path({
				strokeColor: 'black',
				closed: true
			});
			for(let i=0; i<3; i++){
				// for each index
				let c = trig[i];
				path.add(cdt.points[c]);
			}
			path.scale(2);

		})
	}
		
	function add_path_cdt(path){
		// lets assume closed paths
		let index = cdt.points.length;	

		path.segments.forEach((seg,i)=>{
			cdt.points.push([seg.point.x,seg.point.y]);
			let next = (i+1)%path.segments.length;
			cdt.edges.push([index+i,index+next]);
		});
	}

	function loop_through_children(item, callback){
		if(item.hasChildren()){
			item.children.forEach((child)=>{
				loop_through_children(child,callback);
			});
		}
		else {
			callback(item);
		}
	}
	function add_points_into_path(group){

		loop_through_children(group, function(path){
			let i=0;
			do {
				let curve = path.curves[i];
				if(curve.length>dist){
					curve.divideAt(dist);	//curve.length/2);	
				}
				i++;
			}
			while(i<path.curves.length)
			
		});
	}

	
	function main(){

		// * SVG
		svg.position = view.center;
		svg.children[0].remove();	// first child is this weird rectangle (bounding?)
		svg = svg.children[0];	// other child is group of paths
		svg.fitBounds(view.size);
		svg.scale(0.8);
		svg.visible = false;
		// svg.selected = true;


		// * adds extra points to center of long curves 
		add_points_into_path(svg);

		// * run CDT & draw
		let cdt_points = run_cdt(svg);
		draw_cdt(cdt_points);

	}

	view.onFrame = function(event) {
		//
	}

	tool.onMouseMove = function(event){
		//
		// let hits = svg.hitTestAll(event.point);
		// console.log(' hits : ', hits.length );
	}

	
	function random(min,max){
		return (min + Math.random() * (max-min));
	}
	function random_int(min,max){
		return Math.floor(min + Math.random() * (max-min));
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

