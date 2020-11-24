
paper.install(window);


var font, text, boundary;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	// kommunist biggie alice genesis simz
	var str = alice;
	var svg_font = 'elfin.svg';		// ems_society	ems_casual  ems_tech  elfin gothic_it 
	var svg_bounds = 'alice_opt.svg'  			// marx  circle  biggie_out  gutenberg sims_out alice

	// * font
	var fontScale = 4;
	var lineH_adjust = 0.8;		// default: 1.0
	var lineShift = 0.35;			// shift e.g. proportion of a line
	
	// * letter spacing 
	var spacingFixed = 1;		// fixed spacing
	var spacingProp = 1;		// prop of letter bound that is added for spacing
	var spacingSpace = 2;		// spacing for spaces

	// * boundary
	var boundaryScale = 0.9;
	var inverse = true;

	// * page
	var margins = 0.3;
	var yMargin = 0;		// as percent of page height


	// 
	var lineH, margin;	
	
	var type_pos;
	var l;

	
	// lets you add exceptinons to spacing for specific characters
	function pre_spacing(letter,char){
		let special = [];	/// Marx [ 'p', 'g', 'y', 'f'];		space /= 4;
		let space = spacingProp *letter.bounds.width/2;

		// if(special.includes(char))			space /= 4;
		
		return space + spacingFixed;
	}

	function post_spacing(letter,char){
		let special = [ ];
		let space = spacingProp *letter.bounds.width/2;

		// if(char=='t')			return -space/4;
		// else if(char=='p')		return space;
		return space;
	}

	// ref /folder/file.svg
	function import_svg(ref,callback){
		project.importSVG(ref,(x)=>{
			callback(x);
		});
	}

	function import_svgs(callback){
		let files = 2;
		let imported = 0;
		console.log(' importing SVGs... ', files );
		
		// 		*  Fonts
		import_svg('/static/'+svg_font,function(file){
			file.children[0].remove();
			font = file.children[0];
			imported++;
			if(imported==files)				callback();
		});

		import_svg('/static/'+svg_bounds,function(file){
			file.children[0].remove();
			boundary = file.children[0];
			imported++;
			if(imported==files)				callback();
		});
	}

	
	function is_ascii_char(char){
		let x = char.charCodeAt();
		return (x>=33 && x<=126) ? true : false;
	}

	function get_letter(alph,char){
		let x = char.charCodeAt() -33;	// letters start at 33
		let letter = new Group();
		loop_through_children(alph.children[x],function(path){
			letter.addChild(path.clone());
		})
		letter.closed = false;
		letter.fillColor = null;
		letter.strokeColor = 'black';
		// get * adj and scale
		letter.Yadjust = letter.position.y -alph.position.y;
		letter.scale(fontScale);
		letter.Yadjust *= fontScale;
		return letter;
	}


	// test with center point
	function in_boundary(pos){
		let res = boundary.contains(pos);
		if(inverse)	 res = !res;
		return res;		
	}

	// gives overlap index 0 fully out, 1 fully in
	//  difficult as letters are strokes, so boundary rect is used for overlap
	//  which is only approximation too, but its better than center point test
	function over_boundary(letter){
		// letter.group & boundary group

		// for each letter part
		let box = new Path.Rectangle(letter.bounds);
		let Aint = 0, Atot = 0;
		boundary.children.forEach((path)=>{
			let int = box.intersect(path);
			int.remove();
			Aint += int.area;
		});
		box.remove();
		let overlap = Aint / box.area;
		if(inverse)			overlap = 1-overlap;		
		return overlap;
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

	function check_letter_pos(letter){
		if( type_pos.y > view.size.height )
			return false;
		else if(in_boundary(type_pos))
			return true;
		else if(over_boundary(letter) > 0.4 )			return true;
		else 
			return false;
	}

	function step_pos(letter,char){
		// step by 1/2 letter + fixed spacing
		type_pos.x += pre_spacing(letter,char);
		
		letter.position = type_pos.clone();	// move letter for overlap calc.

		while( check_letter_pos(letter) ) {
			// step pos
			// console.log(type_pos);
			type_pos.x += spacingFixed;
			if(type_pos.x > view.size.width-margin){
				//  step new line
				type_pos.x = margin; // + shuffle?
				type_pos.y += lineH;
			}
			letter.position = type_pos.clone();	// move letter for overlap calc.
		}

		// * adjust for varying center points
		// letter.position.y += letter.Yadjust;

		// move by second half of letter
		type_pos.x += post_spacing(letter,char);
	}

	

	function type(){
		if(l<str.length){
			// check if ascii char in font set
			if(type_pos.y < view.size.height)
			{
				let char = str[l];
				if(is_ascii_char(char) )
				{
					// get letter
					let letter = get_letter(font,char);

					// find next free loc
					step_pos(letter,char);

					// text.addChild(letter);  // add to group
				}
				else if(char.charCodeAt()==32){
					type_pos.x += spacingSpace;
				}
				//
			}
			// next letter
			l++;
		}
		else if(l>0 && l==str.length){	/// * catch ending
			font.remove();
			boundary.remove();
		}

		// Eo f
	}
	
			// * draw letter bounds
			// letter.visible = false;
			// let bound = new Path.Rectangle(letter.bounds);
			// bound.strokeColor = 'black';
			
			// * draw letter position
			// new Path.Circle({
			// 	center: type_pos,
			// 	radius: 2,
			// 	fillColor: 'red'
			// })
			



	function init(){
		//
		margin = margins * view.size.width / 2;
		
		// import svgs & call main
		import_svgs(function(){
			// console.log(' svgs imported\n  font: ', font,' bound: ', boundary );

			font.strokeWidth = 1;
			font.fillColor = null;
			
			lineH = font.bounds.height * fontScale * lineH_adjust;
			
			boundary.fillColor = null;
			boundary.strokeColor = 'grey';
			boundary.fitBounds(view.size);
			boundary.scale(boundaryScale);


			main();
		});	
		
	}


	function main(){
		// text = new Group();
		type_pos = new Point(margin,(1+lineShift) *lineH +view.size.height * yMargin);
		l = 0;
		

		// * hide svg
	}	
	
	init();

	view.onFrame = function(event) {
		for(let x=0; x<10; x++){
			type();
		}
	}

	tool.onMouseDown = function(event){
		
	}
	
	tool.onKeyUp = function(event){
		
	}


	tool.onKeyDown = function(event){

		return false;
	}

	

	//		#############################################################################################################


	
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
		console.log(' EXPORT! ');
		// http://paperjs.org/reference/project/#exportsvg
		let export_options = {
			'bounds': 'view',	// 'content' uses outer stroke bounds
			'precision' : 5,	// amount of fractional digits in numbers used in SVG data 
			'asString': true 
		}
		var svg = project.exportSVG(export_options);
		console.log(' clicked ');
		downloadDataUri({
			data: 'data:image/svg+xml;base64,' + btoa(svg),
			filename: 'export.svg'
		});
	});
	
	
	

	// view.draw();
}
