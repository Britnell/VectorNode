
paper.install(window);

let letter;
let colA; let colB; let pA; let pB;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	view.onFrame = function(event) {
		
		//*
	}

	
	tool.onMouseDown = function(event){
		project.activeLayer.removeChildren();
		new_letter();
		//*
	}


	let vary = 0;
	tool.onMouseMove = function(event){
		// vary = 360 * ( event.point.x / view.size.width );
		// rotate with screen X 
		let r = 360 * (event.lastPoint.x - event.point.x) / view.size.width;

		project.activeLayer.children.forEach((child)=>{
			child.rotate(r);
		});
		// console.log(x);

		//*
	}


	
	let letter_links = [];	
	

	function load_letters(){
		// Caps letters
		for( let x=65; x<91; x++){
			let name = '/static/letters/Roboto-'+ String.fromCharCode(x) +'.svg'
			letter_links.push(name);
		}
		// low cap
		for( let x=97; x<123; x++){
			let name = '/static/letters/Roboto-'+ String.fromCharCode(x) +'-lowercase.svg'
			letter_links.push(name);
		}
		// run first time
		new_letter();
	}
	load_letters();
	
	
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

	function draw_field(shape){
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
						// only triggers once.... ?!
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
						// console.log( vec.getAngle() );

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

