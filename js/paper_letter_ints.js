// playing with intersections

paper.install(window);

let letter;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		// path.rotate(0.5);
	}

	let diag = new Path.Line({
		from: [0,0],
		to: view.center,
		strokeWidth: 1,
		strokeColor: 'black'
	});

	tool.onMouseDown = function(event){
		// diag.segments[1].point = event.point;
		// letter.children.forEach((ch)=>{
		// 	let ints = diag.exclude(ch);
		// 	// console.log(ints.hasChildren());
		// 	// let ints = diag.getIntersections(ch);
		// 	// ints.forEach((i)=>{
		// 	// 	new Path.Circle({
		// 	// 		center: i.point,
		// 	// 		radius: 4,
		// 	// 		fillColor: '#009dec'
		// 	// 	}).removeOnDown();
		// 	// })
		// })
		
		// circle.position = event.point;
		// if(inters)
		// 	inters.remove();
		// inters = circle.subtract(letter);
		// inters.fillColor = new Color(1,0.8,0);
		// inters.selected = true;
		// console.log(inters);
	}

	var circle = new Path.Circle({
		center: [0,0],
		radius: 88,
		strokeWidth: 1,
		strokeColor: 'blue'
		// fillColor: new Color(0.3, 1, 0.3),
	});

	let inters;

	tool.onMouseMove = function(event){
		letter.children.forEach((ch)=>{
			let near = ch.getNearestPoint(event.point);
			new Path.Circle({
				center: near,
				radius: 4,
				fillColor: '#009dec'
			}).removeOnMove();
			// console.log( event.point, near);
		});
	}

	function load_letters(){
		// Caps letters
		for( let x=65; x<91; x++){
			let name = '/letters/Roboto-'+ String.fromCharCode(x) +'.svg'
			letter_links.push(name);
		}
		// lower case

		// letters = new Group();

		// chose
		let r = Math.floor(Math.random() *letter_links.length);
		let ref = letter_links[r];
		project.importSVG(ref,(x)=>{	
			letter = x;
			main();
		});
	}
	
	
	let letter_links = [];	
	load_letters();
	

	function main(){
		letter.position = view.center;
		letter.fitBounds(view.bounds)
		letter.firstChild.remove();
		// letter.fillColor = new Color(1, 0.3, 0.3);

		// console.log(letter);

		draw_vertical_lines(letter);
		// let line = new Path.Line({
		// 	from: [x,0],
		// 	to: [x,h],
		// 	strokeColor: 'blue',
		// 	strokeWidth: 1

		
		// Eo main()
	}

	function draw_vertical_lines(shape){
		let st = 14;
		let h = view.size.height;
		for( let x=0; x<view.size.width; x += st){
			let line = new Path.Line({
				from: [x,0],
				to: [x,h],
				strokeWidth: 1,
				strokeColor: 'black'
			});
			
			// let exclude = line.exclude(shape);
			// exclude.strokeColor= 'blue',
			// exclude.strokeWidth= 1;

			shape.children.forEach((ch)=>{
				let ints = line.getIntersections(ch);

				if(ints.length!=0){
					line.remove();
					// first & last
					new Path.Line({
						from: [x,0],
						to: ints[0].point,
						strokeWidth: 1,
						strokeColor: 'black'
					});
					new Path.Line({
						from: ints[ints.length-1].point,
						to: [x,h],
						strokeWidth: 1,
						strokeColor: 'black'
					});
					
					if(ints.length>2){
						console.log(" ints ", ints.length);
						for( let x=1; x< ints.length-3; x++){
							console.log(x);
							new Path.Line({
								from: ints[x].point,
								to: ints[x+1].point,
								strokeWidth: 1,
								strokeColor: 'black'
							});
						}
					}
				}
				ints.forEach((i)=>{
					new Path.Circle({
						center: i.point,
						radius: 4,
						fillColor: '#009dec'
					});
				});
			});
			
		}
		
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

