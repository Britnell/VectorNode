
paper.install(window);

var letter;
var colA; var colB; var pA; var pB;

var text = ['T'];
var letters;
var letter_group;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	
	view.onFrame = function(event) {
		
		//*
	}

	var letter_links = [];
	letter_group = new Group();
	letters = [];

	let shift = false;

	tool.onKeyDown = function(event){
		if(event.key=='shift'){
			shift = true;
		}
		else if(event.key=='backspace'){
			text.splice(text.length-1,1);
			rebuild();
		}
		else if(event.key.length==1){
			// 65 - 90 , 97 - 122
			let key = event.key;
			if(shift)				key = key.toUpperCase();
			let ascii = key.charCodeAt();
			if( (ascii>=65 && ascii <=90) || (ascii>=97&&ascii<=122) ){
				text.push(key);
			}
			rebuild();
		}

		return false;
	}

	tool.onKeyUp = function(event){
		if(event.key=='shift'){
			shift = false;
		}
	}

	tool.onMouseDown = function(event){
		// project.activeLayer.removeChildren();
		// new_letter();
		//*
		rebuild();
	}

	tool.onMouseMove = function(event){
		
		// rotate with screen X 
		let r = 360 * (event.lastPoint.x - event.point.x) / view.size.width;
		project.activeLayer.children.forEach((child)=>{
			child.rotate(r);
		});

		//*
	}


	function rebuild(){
		// remove all elements
		project.activeLayer.removeChildren();
		// spell word out
		if(text.length>0)
			spell_word();
	}
		
	function load_loop(i){
		let letter = text[i];
		let link = '/letters/Roboto-';
		if(letter==letter.toLowerCase())
			link += letter +'-lowercase.svg';
		else if(letter==letter.toUpperCase())
			link += letter +'.svg';
		// import
		project.importSVG(link,(x)=>{	
			letter_group.addChild(x);
			if(++i==text.length)
				arrange_word();
			else 
				load_loop(i);			
		});
	}

	// load svg shapes
	function spell_word(){
		// 
		var svg_load = 0;

		// new Path.Rectangle({
		// 	position: [0,0],
		// 	size: view.size,
		// 	fillColor: 'white'
		// })
		load_loop(0 );
		
	}
	spell_word();

	// arrange svg shapes
	function arrange_word(){
		letter_group.position = view.center;
		// spacing
		for(let c=1; c<letter_group.children.length; c++){
			let curr = letter_group.children[c];
			let prev = letter_group.children[c-1];
			curr.position.x = prev.bounds.topRight.x + 20;
			//
		}
		letter_group.fitBounds(view.bounds);
		letter_group.children.forEach((letter)=>{
			letter.firstChild.remove();
		});

		// draw field shapes
		draw_field_group(letter_group);

		letter_group.visible = false;
		// remove letter shapes
		
		letter_group.removeChildren();

		//
	}

	// draw field around group
	function draw_field_group(group){
		// letter_group.rotation = 0;

		let st = Math.floor(random(20,50));
		let comps = st /1.6;

		// pre-choose random shape
		let sh = Math.random();	
		let lineTh = Math.floor(random(4,comps));
		let lineL = Math.floor(random(comps*0.5,comps*1.8));
		// let col = random_gradient();
		new_color();

		for( let x=1; x<=view.size.width; x+=st)
		{
			for(let y=1; y<=view.size.height; y+= st)
			{
				// each matrix point
				let p = new Point(x,y);

				// * get nearest point of each letter
				let nearest_points = [];
				let its_inside = false;

				letter_group.children.forEach((child)=>{
					let near;
					if(child.hasChildren()){
						child.children.forEach((path)=>{
							near = path.getNearestPoint(p);
							nearest_points.push(near);
							if(path.contains(p))
								its_inside = true;
						});
					}
				});

				// * find closest
				let closest = view.size.width;
				let closest_i = 0;
				nearest_points.forEach((near,i)=>{
					let vec = p.subtract(near);
					if(vec.length<closest){
						closest = vec.length;
						closest_i = i;
					}
				});

				let near = nearest_points[closest_i];
				if(!its_inside)
				{
					let elem;
					if(sh<0.25){
						// * line
						elem = new Path.Line({
							from: [p.x-lineL/2,p.y],
							to: [p.x+lineL/2, p.y],
							strokeWidth: lineTh,
							strokeColor: vary_color(p.x,p.y)
						});
					}
					else if(sh<0.5){	
						// * triangle
						elem = new Path({
							strokeWidth: 0,
							fillColor: vary_color(p.x,p.y)
						});
						elem.add([p.x+lineL,p.y]);
						elem.add([p.x,p.y]);
						elem.add([p.x,p.y+lineL]);
					}
					else if(sh<0.75){
						elem = new Path.Arc({
							strokeWidth: 0,
							// strokeColor: new Color(0.1, 0.4, 0.8),
							fillColor: vary_color(p.x,p.y),
							from: [p.x+lineL, p.y ],
							through: [p.x, p.y ],
							to: [p.x, p.y+lineL ]
						});
					}
					else {
						elem = new Path.Arc({
							strokeWidth: 0,
							// strokeColor: new Color(0.1, 0.4, 0.8),
							fillColor: vary_color(p.x,p.y),
							from: [p.x+lineL*0.6, p.y ],
							through: [p.x, p.y-lineL*0.6 ],
							to: [p.x, p.y+lineL*0.6 ]
						});
						elem.add(p.clone());
					}
					let vec = near.subtract(p);
					elem.rotate( vec.getAngle() +90 );
				}


				
				

				// Eo for x,y
			}
		}

		// letter.remove();

		// Eo f()
	}

	function new_letter(){
		let r = Math.floor(Math.random() *letter_links.length);
		let ref = letter_links[r];
		project.importSVG(ref,(x)=>{	
			letter = x;
			main();
		});
	}
	

	function main(){
		letter.position = view.center;
		letter.fitBounds(view.bounds)
		letter.firstChild.remove();
		// letter.fillColor = new Color(1, 0.3, 0.3);

		draw_field(letter);
		
		// Eo main()
	}

	function random(min,max){
		return min + ( Math.random() *(max-min) );
	}

	function random_color(){
		let c = new Color({
			hue: random(0,360),
			saturation: 0.75,
			brightness: 0.7
		});
		return c;
	}

	

	function new_color(){
		pA = new Point( random(0,view.size.width), 0 );
		pB = new Point( random(0,view.size.width), view.size.height );

		let hDiff = Math.floor(random(10,50));
		let hA = random(0,360-hDiff);
		let hB = hA + hDiff;
		let s = random(0.6,0.8);
		let bA = 0.9, bB = 0.3;

		colA = new Color({
			hue: hA,
			saturation: s,
			brightness: bA
			});
		colB =  new Color({
			hue: hB,
			saturation: s,
			brightness: bB
			});
		//	
	}

	function scale(x, xmin, xmax, ymin, ymax){
		let ratio = ( x-xmin ) / (xmax-xmin);
		return ymin + (ymax-ymin) * ratio;
	}
	
	function vary_color(x,y){
		let distA = new Point(x,y).subtract(pA).length;
		let distB = new Point(x,y).subtract(pB).length;
		let ratio = distA / (distA+distB);
		
		let r = scale(ratio,0,1, colA.red, colB.red );
		let g = scale(ratio,0,1, colA.green, colB.green );
		let b = scale(ratio,0,1, colA.blue, colB.blue );
		return new Color(r,g,b);
		//
	}

	function random_gradient(){
		let pA = new Point( random(0,view.size.width), 0 );
		let pB = new Point( random(0,view.size.width), view.size.height );
		//
	}

	function draw_field(shape){	//df
		let st = Math.floor(random(20,50));
		let comps = st /1.6;

		// pre-choose random shape
		let sh = Math.random();	
		let lineTh = Math.floor(random(4,comps));
		let lineL = Math.floor(random(comps*0.5,comps*1.8));
		// let col = random_gradient();
		new_color();

		for( let x=st/2; x<view.size.width; x+=st)
		{
			for(let y=st/2; y<view.size.height; y+= st)
			{
				
				let p = new Point(x,y);
				if(!shape.contains(p)){
					// get nearest
					shape.children.forEach((ch)=>{
						let near = ch.getNearestPoint(p);
						// only trigers once.... ?!
						let elem;
						if(sh<0.25){
							// * line
							elem = new Path.Line({
								from: [p.x-lineL/2,p.y],
								to: [p.x+lineL/2, p.y],
								strokeWidth: lineTh,
								strokeColor: vary_color(p.x,p.y)
							});
						}
						else if(sh<0.5){	
							// * triangle
							elem = new Path({
								strokeWidth: 0,
								fillColor: vary_color(p.x,p.y)
							});
							elem.add([p.x+lineL,p.y]);
							elem.add([p.x,p.y]);
							elem.add([p.x,p.y+lineL]);
						}
						else if(sh<0.75){
							elem = new Path.Arc({
								strokeWidth: 0,
								// strokeColor: new Color(0.1, 0.4, 0.8),
								fillColor: vary_color(p.x,p.y),
								from: [p.x+lineL, p.y ],
								through: [p.x, p.y ],
								to: [p.x, p.y+lineL ]
							});
						}
						else {
							elem = new Path.Arc({
								strokeWidth: 0,
								// strokeColor: new Color(0.1, 0.4, 0.8),
								fillColor: vary_color(p.x,p.y),
								from: [p.x+lineL, p.y ],
								through: [p.x +lineL/2, p.y+lineL ],
								to: [p.x, p.y ]
							});
						}
						let vec = near.subtract(p);
						elem.rotate( vec.getAngle() +90 );
						

					});
					
					//
				}

				// Eo for
			}
		}

		letter.remove();

		// Eo f()
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

