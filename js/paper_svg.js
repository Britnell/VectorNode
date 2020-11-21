/*
	imposes shading lines onto shapes out of svg
	Manually tho
*/
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

	function init(){
		// import svg & call main
		import_svg('/static/test.svg',function(shape){
			svg = shape;
			main();
		})
	}
	init();
	
	function schraffieren(){
		let group = new Group();
		let dist = 20;
		let dxdy = 0.1;

		for(let x=-view.size.height*dxdy; x<view.size.width; x+= dist){
			let p = new Point(x,0);
			let q = new Point(x+view.size.height*dxdy,view.size.height);
			group.addChild(new Path.Line({
				from: p, 	to: q
			}));
		}
		return group;
	}

	// keeps only texture on top of shape
	function intersect(shape, texture){
		// let sect = line.intersect(circ,{trace: false});	
		let res = new Group();
		texture.children.forEach((path)=>{
			let part = path.intersect(shape,{ trace: false});
			res.addChild(part);
		});
		return res;
	}

	// cuts shape out of texture
	function subtract(shape, texture){
		// let sect = line.intersect(circ,{trace: false});	
		let res = new Group();
		texture.children.forEach((path)=>{
			// let part = path.clone();
			// shapes.forEach((shape)=>{
			let part = path.subtract(shape,{ trace: false});	
			if(part.hasChildren()){
				part.children.forEach((ch)=>{
					res.addChild(ch);
				});
			}
			else 
				res.addChild(part);
		});
		return res;
	}

	function main(){
		svg.position = view.center;
		console.log(' svg', svg);
		
		
		svg.children[0].remove();	// first child is this weird rectangle (bounding?)
		svg = svg.children[0];	// other child is group of paths
		svg.scale(3);
		svg.visible = false;
		
		let diag = schraffieren();
		diag.strokeWidth = 2;
		// dig.strokeColor = 'green';
		
		let A = subtract(svg.children[2], diag);
		A = subtract(svg.children[3], A);
		A.strokeColor = 'green';
		
		diag.position.x += 5;
		let B = subtract(svg.children[1], diag);
		B.strokeColor = 'green';

		diag.position.x += 5;
		let C = subtract(svg.children[0], diag);
		C.strokeColor = 'green';

		
	}

	view.onFrame = function(event) {
		//
	}

	tool.onMouseMove = function(event){
		//
		// let hits = svg.hitTestAll(event.point);
		// console.log(' hits : ', hits.length );
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

