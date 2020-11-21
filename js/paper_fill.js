/*
	subtracts shapes from each other to key unique regions
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
		import_svg('/static/drawing-2.svg',function(shape){
			// first child is invisible rectangle 
			shape.children[0].remove();	
			svg = shape.children[0];
			main();
		})
	}
	init();
	
	function schraffieren(dist, dxdy){
		let group = new Group();
		// let dist = 20;
		// let dxdy = 0.1;
		let outer = Math.abs(dxdy);
		for(let x=-view.size.height*outer; x<view.size.width+view.size.height*outer; x+= dist){
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

	function subtract_shapes_from_each_other(group){
		// * for Each shape
		let s = 0;
		do{
			let o = 0;
			let advance = true;
			// * loop through other shapes
			do{
				if(s==o){
					o++;
				}
				else {
					let sh =  group.children[s];
					let other = group.children[o];
					if(sh.contains(other.interiorPoint)){
						// sh contains other
						let sub = sh.subtract(other);
						group.addChild(sub);
						sh.remove();
						advance = false;	// removed and appended a shape, so repeat for same index 's'
					}
					else 
						o++;
				}
			}
			while(o<group.children.length)
			
			if(advance)
				s++;
		}
		while(s<group.children.length)
	}

	function get_brightness(col){
		return (col.red + col.green + col.blue)/3;
	}

	function get_hue(col){
		return (col.hue );
	}

	function add_to_group(group, thing){
		if(!thing.hasChildren()){
			group.addChild(thing);
		}
		else {
			thing.children.forEach((ch)=>{
				add_to_group(group,ch);
			});
		}
	}

	function get_texture(col){
		if(col.hue < 10){
			// red
			return schraffieren( 4, 0.8);
		}
		else if(col.hue < 30){
			// orange
			return schraffieren( 8, -0.8);
		}
		else {
			return schraffieren( 20, 0.01);
		}
		
	}
	function main(){

		console.log(' svg', svg);
		svg.fitBounds(view.size);
		// svg.position = view.center;
		// svg.scale(3);
		// svg.visible = false;
		
		// tidy shapes so they dont conver each other
		subtract_shapes_from_each_other(svg);
		
		let art = new Group();
		// shade them in
		// let shape = svg.children[0];
		svg.children.forEach((shape)=>{
			// shapesh.selected = true;
			let col = shape.style.fillColor;
			
			let fill = get_texture(col);
			let shaded = intersect(shape,fill);
			// add_to_group(art,shaded);
			if(shaded.hasChildren()){
				shaded.children.forEach((ch)=>{
					art.addChild(ch);
				});
			}
			else 
				art.addChild(shaded);
			// fill.remove();
		
		});

		svg.visible = false;

		art.visible = true;
		art.strokeColor = 'red';
		

		// let shading = schraffieren(4,0);
		// shading.strokeWidth = 2;
		// shading.strokeColor = 'black';
		// shading.visible = true;

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

