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
	
	function schraffieren(dist, dxdy){
		let group = new Group();
		// let dist = 20;
		// let dxdy = 0.1;
		for(let x=-view.size.height*dxdy; x<view.size.width+view.size.height*dxdy; x+= dist){
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
	let f = 10

	const beam = {
		dir: 0,
		len: view.size.width + view.size.height ,
		base: new Point(0,0),
		p: {x:0,y:0},
		line: new Path.Line({
			from: this.base,
			to: this.p,
			strokeColor: '#aaa',
		}), 
		frame: new Path.Rectangle({
			from: [f,f],
			to: [view.size.width-f, view.size.height-f],
			strokeColor: '#0f0',
		}),
		update: function(){	// updates line from base + direction
			this.p = new Point({
				length: this.len,
				angle: this.dir
			}).add(this.base)
			this.line.firstSegment.point = this.base
			this.line.lastSegment.point = this.p
		},
		crossing: function(group){
			let crossings = [ ...shape.getCrossings(this.line).map(cr=>{ return { shape: shape, ix: cr } }) ]
			let sorted = crossings.sort((a,b)=>{
				let va = a.ix.point.subtract(this.base).length
				let vb = b.ix.point.subtract(this.base).length
				if(va>vb)		return 1;
				else if(va<vb)	return -1;
				else 			return 0;
			})
			return sorted[0]
		},
		bounce: function(ix,shape){
			dot(ix)
			let offset = shape.getOffsetOf(ix)
			let normal = shape.getNormalAt(offset)
			let dir = new Point({ length: 1, angle: this.dir+180 })			
			let newDir = (dir.x*normal.x + dir.y*normal.y) / dir.length / normal.length
			newDir = Math.acos(newDir) * 180 / Math.PI
			return normal.angle - newDir
		}
	}

	var zig, shapes;

	function stepMirror(){
		// intersection
		let { ix, shape } = beam.crossing(group)
		zig.add(ix)
		
		// bounce dir
		beam.dir = beam.bounce(ix,shape)
		beam.base = ix
		beam.update()
	}

	
	function main(){
		// console.log(' svg', svg);
		// svg.position = view.center;
		// svg.scale(3);

		const shape = new Path.Circle({
			center: view.center,
			radius: (view.center.x+view.center.y)/4,
			strokeColor: 'black',
		})
		shapes.addChild(shape)

		zig = new Path({
			strokeColor: '#f6a',
		})
		
		// * start beam pos
		// beam.base = new Point(30,30)
		beam.base = view.center.add([100,100])
		beam.dir = 0.3
		zig.add(beam.base)
		beam.update() 


		for(let x=0;x<1;x++){
			stepMirror()
		}



	}


	view.onFrame = function(event) {
		//


	}

	function dot(pos){
		return new Path.Circle({
			center: pos,
			radius: 4,
			fillColor: '#f66',
		})
	}
	tool.onMouseMove = function(event) {
		// * set mouse dir
		// let dir = event.point.subtract(beam.base)
		// beam.dir = dir.angle
		// beam.update()

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
	
	// * Start
	main();

	// view.draw();
}

