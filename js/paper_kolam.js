
paper.install(window);
 var kolam;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();
	

	var node_count = 0;
	var grid = 20;
	var  nr = 0.25;	// how close line stays to dots
	var lineWidth = 2;
	var tree_size = 200;
	var p_remove = 0.1;
	var p_join = 0.1;

	// var kolam;
	// var p_grow = the rest

	function first_node(){
		let net = [];
		let struct = {
			id: 0,
			u: null,
			d: null,
			l: null,
			r: null,
			index: [0,0],
			connections: [],
			point: null
		}
		net.push(struct);
		return net;
	}
	
	function step_vec(dir,mag){
		let angle;
		if(dir=='r')
			angle = 0;
		else if(dir=='d')
			angle = 90;
		else if(dir=='l')
			angle = 180;
		else if(dir=='u')
			angle = 270;

		return new Point({
			length: grid*mag,
			angle: angle
		});
	}

	function new_node(id){
		let struct = {
			id: id,
			u: null,
			d: null,
			l: null,
			r: null,
			connections: []
		}
		return struct;
	}

	function opposite_dir(dir){
		if(dir=='u')
			return 'd';
		if(dir=='d')
			return 'u';
		if(dir=='l')
			return 'r';
		if(dir=='r')
			return 'l';
	}

	function step_index(index, dir){
		let next = index.slice();
		if(dir=='u')
			next[1]++;
		else if(dir=='d')
			next[1]--;
		else if(dir=='l')
			next[0]--;
		else if(dir=='r')
			next[0]++;
		return next;
	}
	
	function add_node(net, node, dir){
		let neu = new_node(net.length);
		node[dir] = neu;
		node.connections.push(dir);

		let opp = opposite_dir(dir);
		neu[opp] = node;
		neu.connections.push(opp);
		neu.index = step_index(node.index,dir);

		let pos = step_vec(dir,1).add(node.point);
		neu.point = pos;

		net.push(neu);
		return neu;
	}

	// adds 2 nodes e.g. up and right, and a third connected to both
	function add_square(net, node, dirs){
		// references
		let dirA = dirs[0];
		let dirB = dirs[1];
		let oppA = opposite_dir(dirA);
		let oppB = opposite_dir(dirB);
		let newA = add_node(net,node, dirA);
		let newB = add_node(net,node, dirB);
		// ready
		let third = new_node(net.length);
		third.connections = [oppA, oppB ];
		newA.connections.push(dirB);
		newB.connections.push(dirA);
		third[oppB] = newA;
		third[oppA] = newB;
		third.point = node.point.add(step_vec(dirA,1)).add(step_vec(dirB,1));
		let idx = step_index(node.index,dirA);
		third.index = step_index(idx,dirB); 
		net.push(third);
	}
	
	function mid_point(node,dir){
		let pos = step_vec(dir, 0.5).add(node.point);
		return pos;
	}

	function draw_net(net){
		let kolam = new Group();
		net.forEach( (node)=>{
			// 
			kolam.addChild(draw_node(node));
		});
		return kolam;
	}


	

	function draw_node(node){
		let conns = node.connections;
		if(conns.length==0){
			return draw_circle(node);
		}
		else if(conns.length==1){
			return draw_tip(node);
		}
		else if(conns.length==2){
			if(conns.includes('u') && conns.includes('d') )
				return draw_straight(node);
			if(conns.includes('l') && conns.includes('r') )
				return draw_straight(node);
			else 
				return draw_corner(node);
		}
		else if(conns.length==3){
			return draw_trig(node);
		}
		else if(conns.length==4){
			return draw_cross(node);
		}
		// return null;
	}

	function draw_circle(node){
		let path = new Path.Circle({
			center: node.point,
			radius: grid*nr
		});
		return path;
	}
	function draw_tip(node){
		let dir = node.connections[0];
		let opp = opposite_dir(dir);
		let knot = mid_point(node,dir);
		let near;
		let path = new Path();
		
		path.add(knot);
		near = step_vec(dir,nr).rotate(90);
		path.add(new Segment({
			point: node.point.add(near),
			handleIn: step_vec(dir, 0.3),
			handleOut: step_vec(opp, 0.4),
		}));
		path.add(new Segment({
			point: node.point.add(near.rotate(180)),
			handleIn: step_vec(opp, 0.4),
			handleOut: step_vec(dir, 0.3),
		}));
		path.add(knot);
		return path;
	}


	function draw_straight(node){
		let dir = node.connections[0];
		let opp = opposite_dir(dir);

		let knotA = mid_point(node,dir);
		let knotB = mid_point(node,opp);

		let near;

		let path = new Path();
		// first side
		near = step_vec(dir,nr).rotate(90);
		path.add(knotA);
		path.add(new Segment({
			point: node.point.add(near),
			handleIn: step_vec(dir,0.3),
			handleOut: step_vec(opp,0.3)
		}));
		path.add(knotB);
		path.add(new Segment({
			point: node.point.add(near.rotate(180)),
			handleIn: step_vec(opp,0.3),
			handleOut: step_vec(dir,0.3)
		}));
		path.add(knotA);
		return path;
		// 
	}

	// returns the 2 connections of a node in clockwise order
	function get_pair_in_order(dirs){
		if(dirs.includes('u')&&dirs.includes('r'))
			return ['u','r'];
		if(dirs.includes('r')&&dirs.includes('d'))
			return ['r','d'];
		if(dirs.includes('d')&&dirs.includes('l'))
			return ['d','l'];
		if(dirs.includes('l')&&dirs.includes('u'))
			return ['l','u'];
	}

	function draw_corner(node){
		// clockwise : add knot points
		
		let crnrs = get_pair_in_order(node.connections);
		let path = new Path();
		let knotA = node.point.add(step_vec(crnrs[0],0.5));
		let knotB = node.point.add(step_vec(crnrs[1],0.5));
		path.add(knotA);
		path.add(knotB);
		
		// continue clockwise
		let vec, handle;
		near = step_vec(crnrs[1],0.3).rotate(90);
		handle = step_vec(crnrs[1],1).rotate(180);	// handleOut
		path.add(new Segment({
			point: node.point.add(near),
			handleOut: handle.multiply(0.2),
			handleIn: handle.multiply(0.3).rotate(180)
		}));
		// rotate & repeat for next corner
		near = near.rotate(90);
		handle = handle.rotate(90);
		path.add(new Segment({
			point: node.point.add(near),
			handleOut: handle.multiply(0.3),
			handleIn: handle.multiply(0.2).rotate(180)
		}));
		path.add(knotA);
		return path;
	}

	function draw_trig(node){
		// get unconnected side from nodes.connections
		let free_dir = 'udlr'.split('');
		node.connections.forEach((c)=>{
			let i = free_dir.indexOf(c);
			free_dir.splice(i,1);
		});

		let opp = opposite_dir(free_dir);
		let knot = step_vec(opp, 0.5);
		let path = new Path();
		path.add(node.point.add(knot));
		knot = knot.rotate(90);
		path.add(node.point.add(knot));
		let near = step_vec(free_dir, nr );
		let handle = step_vec(free_dir, 0.3 ).rotate(90);	// handle out
		path.add(new Segment({
			point: node.point.add(near),
			handleOut: handle,
			handleIn: handle.rotate(180)
		}));
		knot = knot.rotate(180);
		path.add(node.point.add(knot));
		knot = knot.rotate(90);
		path.add(node.point.add(knot));
		return path;
		//
	}

	function draw_cross(node){
		let knot = step_vec('u',0.5);
		let path = new Path();
		path.add(node.point.add(knot));
			knot = knot.rotate(90);
		path.add(node.point.add(knot));
			knot = knot.rotate(90);
		path.add(node.point.add(knot));
			knot = knot.rotate(90);
		path.add(node.point.add(knot));
			knot = knot.rotate(90);
		path.add(node.point.add(knot));
		return path;
	}

	function prob(p){
		if( Math.random()<p)
			return true;
		else
			return false;
	}

	function random(min,max){
		return min + Math.random()*(max-min);
	}
	function random_int(min,max){
		return Math.floor( min + Math.random()*(max-min) );
	}

	function get_index_diff(idxB, idxA){
		return [ idxA[0]-idxB[0] , idxA[1]-idxB[1] ];
	}

	function index_to_dir(idx){
		if( idx[0]==1 && idx[1]==0 )
			return 'r';
		if( idx[0]==-1 && idx[1]==0 )
			return 'l';
		if( idx[0]==0 && idx[1]==1 )
			return 'u';
		if( idx[0]==0 && idx[1]==-1 )
			return 'd';
		return null;
	}

	function dir_to_index(dir){
		if(dir=='r')
			return [1,0];
		if(dir=='l')
			return [-1,0];
		if(dir=='u')
			return [0,1];
		if(dir=='d')
			return [0,-1];
		return null;
	}

	function check_for_neighbours(net, node){
		let neighb = [];
		net.forEach((n)=>{
			let diff = get_index_diff(node.index,n.index);
			let dir = index_to_dir(diff);
			if(dir){
				neighb.push({
					node: n,
					dir: dir
				});
			}
		});
		return neighb;
	}

	function random_dir(){
		let r = Math.random();
		if(r<0.25)
			return 'u';
		else if(r<0.5)
			return 'd';
		else if(r<0.75)
			return 'l';
		else if(r<1)
			return 'r';
	}

	// symmetrical partner of index
	function get_index_pair(net,index){
		let idx = index.slice();
		idx[0] = -idx[0];
		// find node with index
		let pair;
		net.forEach((n)=>{
			if(n.index[0]==idx[0] && n.index[1]==idx[1])
				pair = n;
		});
		return pair;
	}

	// grows net, only appending, not interconnecting
	//     creates more labyrinthine nets 
	function grow_net_v1(net, tree_size)
	{

		while(net.length<tree_size-1){
			// if(true){
				let n = random_int(0, net.length);
				let node = net[n];
				
				let neighbours = check_for_neighbours(net,node);
				
				
				if(neighbours.length<4)
				{
					// * chose from free spots
					let chose_from = 'udlr'.split('');
					neighbours.forEach((nbr)=>{
						let i = chose_from.indexOf(nbr.dir);
						if(i!=-1){
							chose_from.splice(i,1);
						}
					});
					let sprout_dir = chose_from[ random_int(0,chose_from.length) ];
	
					// * a few special cases
					if(sprout_dir=='u' || sprout_dir=='d'){
						add_node(net, node, sprout_dir );
						// * only grow pair vertical if not in center
						if(node.index[0]!=0){
							let pair = get_index_pair(net, node.index);
							add_node(net, pair, sprout_dir );
						}
					}
					else 
					{
						// * sprout L and R
						if(node.index[0]==0){
							// * center, grow L and R on same node
							add_node(net, node, 'l' );
							add_node(net, node, 'r' );
						}
						else{
							// * grow in opposite directions
	
							// * catch case when both grow inward
							if( (node.index[0]==1 && sprout_dir=='l') || (node.index[0]==-1 && sprout_dir=='r') ) 
							{
								let mid = add_node(net, node, sprout_dir );
								let pair = get_index_pair(net, node.index);
								let opp = opposite_dir(sprout_dir);
								// then connect to other side
								mid.connections.push(sprout_dir);
								pair.connections.push(opp);							
							}
							else {
								// grow both outward
								add_node(net, node, sprout_dir );
								let pair = get_index_pair(net, node.index);
								let opp = opposite_dir(sprout_dir);
								add_node(net, pair, opp );	
							}
							//
						}
					}
					// Eo if <4 neighbours
				}
				
				// Eo loop
			}
	}

	function random_free_direction(net,node){
		let neighbours = check_for_neighbours(net,node);
		let chose_from = 'udlr'.split('');
		neighbours.forEach((nbr)=>{
			let i = chose_from.indexOf(nbr.dir);
			if(i!=-1){
				chose_from.splice(i,1);
			}
		});
		return chose_from[ random_int(0,chose_from.length) ];
	}

	// grows net, trims, and adds connections
	function grow_net_v2(net, tree_size)
	{
		while(net.length<tree_size-1){
			// if(true){
				let n = random_int(0, net.length);
				let node = net[n];
				
				let r = Math.random();
				if(r<p_remove)
					remove_a_connection(net,node); 
				else if(r<p_remove+p_join)
					join_new_neighbour(net,node);
				else
					add_neighbour_where_free(net,node);
				
				// Eo loop
			}
	}
	
	function get_node_in_dir(net, node, dir){
		let step = dir_to_index(dir);
		let idx = [];
		idx[0] = step[0] +node.index[0];
		idx[1] = step[1] +node.index[1];
		// get node with index
		let ret;
		net.forEach((n)=>{
			if(n.index[0]==idx[0] && n.index[1]==idx[1] )
				ret = n;
		});
		return ret;
	}

	function remove_connection(node,dir){
		let i =  node.connections.indexOf(dir);
		node.connections.splice(i,1);
	}

	function remove_a_connection(net,node){
		// only if has more than 1
		if(node.connections.length>1){		
			let dir = node.connections[ random_int(0,node.connections.length)];
			let opp = opposite_dir(dir);
			let partner;

			if(dir=='u' || dir=='d'){
				// * remove this one def
				partner = get_node_in_dir(net,node,dir);
				remove_connection(node,dir);
				remove_connection(partner,opp);	
				// * if not center, remove twin too
				if(node.index[0]!=0){
					let twin = get_index_pair(net,node.index);
					partner = get_node_in_dir(net,twin,dir);
					remove_connection(twin,dir);
					remove_connection(partner,opp);	
				}
				// Eo u d
			}
			else {
				// L & R 
				partner = get_node_in_dir(net,node,dir);
				remove_connection(node,dir);
				remove_connection(partner,opp);	
				// remove symmetric pair
				let pair = get_index_pair(net,node.index);
				partner = get_node_in_dir(net,pair,opp);
				remove_connection(pair,opp);
				remove_connection(partner,dir);	
				
				// Eo LR
			}
			
			// if >1 connection
		}
		// Eo f
	}

	function join_new_neighbour(net, node)
	{
		let nbrs = check_for_neighbours(net,node);
		if(node.connections.length != nbrs.length )
		{
			// chose unconnected neighbour
			let unconnected = [];
			nbrs.forEach((nbr)=>{
				let dir = nbr.dir;
				if(!node.connections.includes(dir)){
					unconnected.push(dir);
				}
			});
			let conn_dir = unconnected[ random_int(0,unconnected.length )];
			let opp = opposite_dir(conn_dir);
			let nbr = get_node_in_dir(net,node,conn_dir);
			// add connection
			node.connections.push(conn_dir);
			nbr.connections.push(opp);
				
			if(conn_dir=='u' || conn_dir=='d'){
				// up or down
				if(node.index[0]!=0){
					// connect symm pair too
					let twin = get_index_pair(net,node.index);
					nbr = get_node_in_dir(net,twin,conn_dir);
					twin.connections.push(conn_dir);
					nbr.connections.push(opp);
				}
			}
			else {
				// L & R
				if(node.index[0]==0){
					// connect node to other side too
					node.connections.push(opp);
					nbr = get_node_in_dir(net,node,opp);
					nbr.connections.push(conn_dir);
				}
				else{
					// connect symmetric pair too
					let twin = get_index_pair(net,node.index);
					nbr = get_node_in_dir(net,twin,opp);
					twin.connections.push(opp);
					nbr.connections.push(conn_dir);
				}
				// Eo L R
			}
			// Eo neighbours > connecitons
		}
		// Eo func
	}

	
	function add_neighbour_where_free(net,node){
		let neighbours = check_for_neighbours(net,node);
		if(neighbours.length<4)
		{			
			// * chose from free spots
			let sprout_dir = random_free_direction(net,node);
			
			let idx = dir_to_index(sprout_dir);
			idx[0] += node.index[0];
			idx[1] += node.index[1];

			// * a few special cases
			if(sprout_dir=='u' || sprout_dir=='d'){
				add_node(net, node, sprout_dir );
				// * only grow pair vertical if not in center
				if(node.index[0]!=0){
					let pair = get_index_pair(net, node.index);
					add_node(net, pair, sprout_dir );
				}
			}
			else 
			{
				// * sprout L and R
				if(node.index[0]==0){
					// * center, grow L and R on same node
					add_node(net, node, 'l' );
					add_node(net, node, 'r' );
				}
				else{
					// * grow in opposite directions

					// * catch case when both grow inward
					if( (node.index[0]==1 && sprout_dir=='l') || (node.index[0]==-1 && sprout_dir=='r') ) 
					{
						let mid = add_node(net, node, sprout_dir );
						let pair = get_index_pair(net, node.index);
						let opp = opposite_dir(sprout_dir);
						// then connect to other side
						mid.connections.push(sprout_dir);
						pair.connections.push(opp);							
					}
					else {
						// grow both outward
						add_node(net, node, sprout_dir );
						let pair = get_index_pair(net, node.index);
						let opp = opposite_dir(sprout_dir);
						add_node(net, pair, opp );	
					}
					//
				}
				
				// Eo L or R
			}
			// else	console.log(' node ', node.index,' dir: ', sprout_dir,' >> space ', idx, '  not empty'); 
			
			// Eo if <4 neighbours
		}
		
	}

	function get_net_index(net, node){
		let id = -1;
		for(let n=0; n<net.length; n++){
			if(net[n].id==node.id)
				id = n;
		}
		return id;
	}


	function cut_holes_in_it(net,holes){
		// go through net and remove nodes
		for(let h=0; h<holes; h++){
			// chose random node
			let r = random_int(0, net.length);
			let node = net[r];

			node.connections.forEach((dir)=>{
				let opp = opposite_dir(dir);
				let neighb = get_node_in_dir(net,node,dir);
				let i = neighb.connections.indexOf(opp);
				neighb.connections.splice(i,1);
			});
			net.splice(r,1);

			if(node.index[0]!=0){
				// remove pair too
				let pair = get_index_pair(net,node.index);
				
				pair.connections.forEach((dir)=>{
					// remove connection for each connection
					let opp = opposite_dir(dir);
					let neighb = get_node_in_dir(net,pair,dir);
					let i = neighb.connections.indexOf(opp);
					neighb.connections.splice(i,1);
				});
				// remove pair node
				let ix = get_net_index(net,pair);
				net.splice(ix,1);
			}
			// Eo for
		}
		//
	}

	function main(){

		// setup nodes
		
		let backG = new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});

		grid = random_int(20,60);
		// tree_size = random_int(100,600);
		nr = random(0.2,0.35);

		p_remove = 0.1;
		p_join = random(0.01, 0.3);
		
		let holes = random_int(5,20);
		
		let net = first_node();
		let center = net[0];
		center.point = view.center;
		
		grow_net_v2(net, tree_size);

		cut_holes_in_it(net, holes);

		kolam = draw_net(net);
		kolam.strokeColor = new Color({
			hue: random_int(0,360),
			saturation: random(0.5,1),
			brightness: random(0.5,1)
		});
		kolam.strokeWidth = random_int(1,grid/3);

		// * join pieces together
		join_kolam_paths(kolam);
		



		// * print net
		// net.forEach( (n)=>{
		// })
		// Eo main
	}
	main();

	

	function join_kolam_paths(kolam){
		
		// split path up into bits
		kolam.children.forEach((path)=>{
			if(path.closed)
				path.split(0);
			while(path.segments.length>2){
				// remove last 2 segments
				let loc = path.getLocationOf(path.segments[path.segments.length-2].point);
				let split = path.splitAt(loc);
				kolam.addChild(split);
			}
		});
		
		// * now join
		let pa = 0;
		while(pa<kolam.children.length)
		{
			let A = kolam.children[pa];
			// A.strokeColor = 'white';

			let joined = true;
			while(joined){
				joined = false;
				let pb = 0;
				while(pb<kolam.children.length){
					let B = kolam.children[pb];

					// dont compare to itself
					if(A.id != B.id){
						
						if(check_path_match(A, B)){
							A.join(B);
							joined = true;
							break;
						}
					}
					pb++;
				}
				// 
			}	
			// exited loop, nothing to join this to move on to next
			pa++;
			
		}

		// loop		
		
		// Eo f()
	}
	view.onFrame = function(event) {
	
		// path.
	}

	function points_equal(p1, p2){
		return (p1.x==p2.x) && (p1.y==p2.y);
	}

	function check_path_match(pathA, pathB){
		
		let matching = false;
		let tangA, tangB;

		if( points_equal(pathA.firstSegment.point, pathB.firstSegment.point) ){
			tangA = pathA.getTangentAt(0);
			tangB = pathB.getTangentAt(0);
		}
		else if( points_equal(pathA.firstSegment.point, pathB.lastSegment.point )){
			tangA = pathA.getTangentAt(0);
			tangB = pathB.getTangentAt(pathB.length);
		}
		else if(points_equal(pathA.lastSegment.point, pathB.firstSegment.point )){
			tangA = pathA.getTangentAt(pathA.length);
			tangB = pathB.getTangentAt(0);
		}
		else if(points_equal(pathA.lastSegment.point, pathB.lastSegment.point )){
			tangA = pathA.getTangentAt(pathA.length);
			tangB = pathB.getTangentAt(pathB.length);
		}
		if(tangA && tangB){
			if(compare_tangents(tangA,tangB))
				matching = true;
		}
		return matching;
	}

	function compare_tangents(tangA, tangB){
		let res = false;
		let diff = tangA.angle -tangB.angle;
		if(Math.abs(diff)<20 || Math.abs(180-Math.abs(diff))<20){
			res = true;
		}
		return res;
	}

	let pa = 0;

	tool.onKeyDown = function(event){
		// for(let pa=0; pa<kolam.children.length; pa++){
		
	}
	

	tool.onMouseDown = function(event){
		project.activeLayer.removeChildren();
		main();
		//
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

	// view.draw();
}

