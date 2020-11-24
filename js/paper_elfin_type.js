// this demo imports prepared alphabet svg in ascii order and then copies the letters to type

paper.install(window);

var text, svg;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();

	var elfin;

	var type_pos;
	var shift = false;
	var spacing = 4;
	var margin = 80;
	var line = 20;		// line height
	
	// ASCII
	//		String.fromCharCode()		(char).charCodeAt()
	//
	// !: 33 to ~: 126
	// var ASCII = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
	
	
	function is_ascii_char(char){
		let x = char.charCodeAt();
		return (x>=33 && x<=126) ? true : false;
	}

	function get_letter(elfin,char){
		let x = char.charCodeAt() -33;	// letters start at 33
		let letter = new Group();
		if(elfin.children[x].hasChildren())
			elfin.children[x].children.forEach((child)=>{
				letter.addChild(child.clone());
			})
		else
			letter.addChild(elfin.children[x].clone());
		return letter;
	}

	// ref /folder/file.svg
	function import_svg(ref,callback){
		project.importSVG(ref,(x)=>{
			callback(x);
		});
	}

	function type(char){
		
		// check if ascii char in elfin set
		if(is_ascii_char(char)){
			let x = char.charCodeAt() -33;	// letters start at 33
			console.log(x,char);
			// * add letter shape
			let letter = get_letter(elfin,char);
			letter.position = type_pos.clone();
			letter.fillColor = null;
			letter.strokeColor = 'black';
			text.addChild(letter);  // simply add as child, even if is group
			
			// step typing loc
			type_pos.x += letter.bounds.width + spacing;
			if(type_pos.x > view.size.width-margin){
				type_pos.x = margin;
				type_pos.y += line;
			}

		}
	}


	function init(){
		//
		text = new Group();
		type_pos = new Point(margin,60);
		
		// import svg & call main
		import_svg('/static/elfin.svg',function(shape){
			shape.children[0].remove();
			svg = shape.children[0];	// thats just how they are wrapped
			elfin = svg;
			elfin.scale(5);
			elfin.fillColor = null;
			main();
		})
		
	}

	function main(){
		svg.position.x += 300;
		svg.scale(3);
		// svg.remove();

	}
	
	init();

	view.onFrame = function(event) {
		
	}

	tool.onMouseDown = function(event){
		
	}
	
	tool.onKeyUp = function(event){
		if(event.key.includes('shift'))
			shift = false;
	}


	tool.onKeyDown = function(event){

		let char = event.key;
		
		if(char.length ==1){
			if(shift)
				char = char.toUpperCase();
			type(char);
		}
		else if(char.includes('backspace') || char.includes('delete')){
			console.log('del');
		}
		else if(event.key.includes('space')){
			console.log('space');
		}
		else if(event.key.includes('enter')){
			console.log('enter');
		}
		else if(event.key.includes('shift')){
			shift = true;
		}

		

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

