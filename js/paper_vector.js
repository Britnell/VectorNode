
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();


	
	function main(){

		let p = view.center;
		let lineL = 50;

		elem = new Path.Arc({
			strokeWidth: 0,
			// strokeColor: new Color(0.1, 0.4, 0.8),
			fillColor: 'black',
			from: [p.x+lineL, p.y ],
			through: [p.x, p.y-lineL ],
			to: [p.x, p.y+lineL ]
		});
		elem.add(p)

		// elem.lastSegment.selected = true;	

		let squ = new Path();
		squ.add([100,100]);
		squ.add([50,200]);
		squ.add([100,300]);
		squ.add([150,200]);
		squ.add([100,100]);
		squ.strokeColor = 'black';
		let G = new Group();
		G.addChild(squ);

		let loc = squ.getLocationOf( squ.segments[squ.segments.length-2].point );
		let spl = squ.splitAt(loc);
		spl.strokeColor = 'red';
		spl.position.x += 100;
		squ.strokeColor = 'blue';

		let line = new Path.Line({
			from: [100,100],
			to: [300,100],
			strokeWidth: 10,
			strokeColor: 'blue'
		});

		let circ = new Path.Circle({
			center: [200,100],
			radius: 80,
			strokeWidth: 10,
			strokeColor: 'black'
		});

		let unite = line.unite(circ);
		unite.position.y += 200;
		unite.position.x += 0*220;
		
		let sect = line.intersect(circ,{trace: false});	
		// let sect = circ.intersect(line,{trace: false});
		sect.position.y += 200;
		sect.position.x += 1*220;
		
		let sub = line.subtract(circ,{trace:false});
		sub.position.y += 200;
		sub.position.x += 2*220;

		let excl = line.exclude(circ,{trace:false});
		excl.position.y += 200;
		excl.position.x += 3*220;
		
		let dvd = circ.divide(line,{trace:false});
		dvd.position.y += 2*200;
		dvd.position.x += 0*220;
		

	}
	main();

	view.onFrame = function(event) {
		//
	}

	tool.onMouseDown = function(event){
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

