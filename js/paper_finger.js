
paper.install(window);

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	

	let gap = 20;

	// draws envelope around a line path
	//  arcs around the end-point
	function envelope_first(path){
		// clockwise, start on left side of path
		let env = new Path({
			strokeColor: 'black',
			closed: false
		});
		let steps = 10;

		// * left side +normal
		for(let c=0; c<path.curves.length; c++){
			let curve = path.curves[c];
			let st = steps/curve.length;	// transl steps into curveLocation
			st = Math.floor(st*1000)/1000;
			for(let cl=0; cl<=1; cl+=st){
				// points on curve
				let point = curve.getPointAtTime(cl);
				let norml = curve.getNormalAtTime(cl);
				let parl = point.clone().add(norml.multiply(gap));
				env.add(parl);
			}

		}
		
		// * Arc around end-point
		let p1 = env.lastSegment.point;
		let pm = path.lastSegment.point;
		let norm = path.lastCurve.getNormalAtTime(1);
		let tang = path.lastCurve.getTangentAtTime(1);
		let p2 = pm.subtract(norm.multiply(gap));
		pm = pm.add(tang.multiply(gap));
		let arc = new Path.Arc({
			from: p1,
			through: pm,
			to: p2,
		});
		env.join(arc);
		
		// Right side -normal
		for(let c=path.curves.length-1; c>=0; c--){
			let curve = path.curves[c];
			let st = steps/curve.length;	// transl steps into curveLocation
			st = Math.floor(st*1000)/1000;
			for(let cl=1; cl>=0; cl-=st){
				// points on curve
				let point = curve.getPointAtTime(cl);
				let norml = curve.getNormalAtTime(cl);
				let parl = point.clone().subtract(norml.multiply(gap));
				env.add(parl);
			}

		}
		
		env.simplify();

		return env;
		// * Eo func
	}

	function envelope_after(path){

		let env = new Path({
			strokeColor: 'black',
			closed: false
		});
		let steps = 10;

		let resume = {
			break : false
		};

		// * only left-side now
		for(let c=0; c<path.curves.length; c++){
			let curve = path.curves[c];
			let st = steps/curve.length;	// transl steps into curveLocation
			st = Math.floor(st*1000)/1000;
			for(let cl=0; cl<=1; cl+=st){
				// points on curve
				let point = curve.getPointAtTime(cl);
				let norml = curve.getNormalAtTime(cl).multiply(gap);;
				let parl = point.add(norml);
				env.add(parl);
				let trig = point.subtract(pole.point).length;
				if(pole.waiting && trig<gap/2){
					console.log('POLE', trig);
					pole.waiting = false;
					resume.curve = c;
					resume.cloc = cl+st*gap/steps;
					resume.break = true;
					resume.point = parl.clone();
					resume.normal = norml.multiply(gap).clone();
					resume.tangent = curve.getTangentAtTime(cl).multiply(gap);
					resume.resume = parl.add(resume.tangent);

					break;
				}
				// 
			}
			if(resume.break)	break;
		}

		if(resume.break){
			// break out path here
			console.log(' break at ', resume );

			// follow normal out of view
			let pos = resume.point.clone();
			
			pos = pos.add(resume.normal);
			env.add(pos.clone());
			
			while(pos.isInside(view.size)){
				// console.log(pos, resume.normal )
				pos = pos.add(resume.normal);
				env.add(pos.clone());
			}
			
			// then step over
			pos = pos.add(resume.tangent);
			env.add(pos.clone());

			// then return back along tangent
			while(pos.subtract(resume.resume).length >gap ){
				pos = pos.subtract(resume.normal);
				env.add(pos.clone());
				console.log(pos, resume.resume );
			}

			// * Resume curving
			for(let c=resume.curve; c<path.curves.length; c++){
				let curve = path.curves[c];
				let st = steps/curve.length;	// transl steps into curveLocation
				st = Math.floor(st*1000)/1000;
				for(let cl=resume.cloc; cl<=1; cl+=st){
					// points on curve
					let point = curve.getPointAtTime(cl);
					let norml = curve.getNormalAtTime(cl).multiply(gap);;
					let parl = point.add(norml);
					env.add(parl);
				}
			}


			// return null;
			//
		}
		
		// envelope_solve_corners(env);
		// env.simplify();
		env.selected  =true;
		return env;
		//
	}


	function envelope_solve_corners(path){
		// console.log(' checking : ', path);

		for(let s=0; s<path.segments.length-3; s++){
			let seg = path.segments[s];
			let next = path.segments[s+1];
			let dist_to_next = seg.point.subtract(next.point).length;
			// check next 10
			let other_closest = -1;
			let other_closest_id = 0;
			for(let n=s+2; n<s+10 && n<path.segments.length; n++){
				let other = path.segments[n];
				let d = other.point.subtract(seg.point).length;
				if(d<dist_to_next){
					other_closest = d;
					other_closest_id = n;
				}
			}
			if(other_closest!=-1){
				for(let r=0; r<other_closest_id-s-1; r++ ){
					path.segments[s+1].remove();
				}
			}
			// Eo for
		}
		// Eo f
	}

	function random(a,b){
		return a+ Math.random()*(b-a);
	}
	function random_int(a,b){
		return Math.floor(a+ Math.random()*(b-a));
	}

	var pole;

	function main(){
		
		// demo path
		var path = new Path({
			strokeColor: 'black'
		});

		path.add(0,0);
		path.add( random_int(0,view.center.x), random_int(0,view.center.y) );
		path.add(view.center);
		path.simplify();

		pole = {
			point: [view.size.width*0.7, view.size.height*0.6 ],
			waiting: true
		};

		let last = envelope_first(path);

		// new Path.Circle({
				// 	center: seg.point,
				// 	radius: 5,
				// 	fillColor: 'red'
				// })
		for(let x=0; x<16; x++){
			last = envelope_after(last);
		}

	}
	main();


	view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		// path.rotate(0.5);
	}

	tool.onMouseDown = function(event){
		// path.add(event.point);
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
	

	
	
	function export_svg(){
		
		let expo = project.exportSVG(options);

		// Eo func
	}

	
	function envelope_after_v1(path){

		let env = new Path({
			strokeColor: 'black',
			closed: false
		});
		let steps = 10;

		// * only left-side now
		for(let c=0; c<path.curves.length; c++){
			let curve = path.curves[c];
			let st = steps/curve.length;	// transl steps into curveLocation
			st = Math.floor(st*1000)/1000;
			for(let cl=0; cl<=1; cl+=st){
				// points on curve
				let point = curve.getPointAtTime(cl);
				let norml = curve.getNormalAtTime(cl);
				let parl = point.clone().add(norml.multiply(gap));
				env.add(parl);
			}

		}
		envelope_solve_corners(env);
		env.simplify();

		return env;
		//
	}


	// view.draw();
}


