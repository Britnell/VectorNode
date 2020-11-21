
paper.install(window);
//  var kolam;

window.onload = function() {
	// * Setup
	paper.setup('papercanvas');
	var tool = new Tool();
	

	var grid = 20;
	var  nr = 0.25;	// how close line stays to dots
	var lineWidth = 2;
	var tree_size = 200;
	var p_remove = 0.1;
	var p_join = 0.1;

	var kolam;
	// var p_grow = the rest

	var net, list, dead;
	var symmetries = [ 'X', 'XY', 'ROT2' ]; //, 'ROT4' ];
	var directions = ['u','r','d','l'];
	var symmetry;
	var net_count, net_size;
	var kolam_size;

	var tip_shapes = [ 'round','pointy', 'trig'];
	var tip_shape;

	let join_index;

	function new_kolam(){
		
		// * 
		let background = new Path.Rectangle({
			point: [0,0],
			size: view.size,
			fillColor: 'black'
		});

		// * set up symmetry & clear banned areas
		grid = random_int(20,30);
		net_count = 0;
		net_size = {
			n: random_int(50,300)
		}
		net_size.x = Math.floor( view.size.width  /2 /grid )-2;
		net_size.y = Math.floor( view.size.height /2 /grid )-2;
		
		symmetry = symmetries[random_int(0,symmetries.length)];

		nr = random(0.2,0.33);	// curvature
		p_remove = 0.1;
		p_join = random(0.01, 0.25);
		tip_shape = tip_shapes[ random_int(0,tip_shapes.length)];

		console.log(' NEW KOLAM size ', net_size, ' symmetry ', symmetry, '  tip: ', tip_shape, ' curve:', nr  );
		new_net();

		// * allocate dead space

		// * plant seedling
		initial_nodes();

		// * create net
		grow_net();

		
		kolam = draw_net();
		kolam.strokeColor = random_color();
		
		// // * split up 
		// split_kolam(kolam);

		// // * join paths
		// join_index = 0;
		// join_kolam();

		// kolam.strokeColor = 'white';

		// Eo Kolam
	}
	new_kolam();

	function get_tangent_at(path,point){
		let offset = path.getOffsetOf(point);
		return path.getTangentAt(offset);
	}

	function join_kolam(){

		// loop through
		while(join_index<kolam.children.length)
		{
			let A = kolam.children[join_index];
			if(A.closed){
				join_index++;			
			}
			else
			{
				let p = A.segments[0].point;
				
				// in terms of junction
				let junction = kolam.hitTestAll(p);

				if(junction.length==2){
					junction[0].item.join(junction[1].item);
				}
				else 
				{
					// get info
					junction.forEach((hit)=>{
						hit.offset = hit.item.getOffsetOf(p);
						hit.angle = get_tangent_at(hit.item,p).angle;
					});

					if(junction.length==4){
						// 2 pairs to join - find pairs
						let smallest = find_smallest_diff_4(junction);	// returns pair for 0
						let other_pair = [1,2,3];
						other_pair.splice( other_pair.indexOf(smallest),1);
						// join
						join_paths(junction[0],junction[smallest]);
						join_paths(junction[other_pair[0]],junction[other_pair[1]]);
					}
					else if(junction.length==3){
						let pair = find_smallest_diff_3(junction);
						join_paths(junction[pair[0]],junction[pair[1]]);
					}
					else {
						// new Path.Circle({
						// 	center: p,
						// 	radius: 6,
						// 	fillColor: 'white'
						// })
						console.log(' WE HAVE A PROBLEM< this junction has ', junction.length, junction );
						junction[0].item.join(this);
						junction[0].item.strokeColor = 'yellow'; 
						junction[0].item.strokeWidth = 4;
						break;
					}
				}

			}

			// Eo join loop
		}

		// Eo f()
	}

	function join_paths(juncA, juncB){
		if( (juncA.offset==0 && juncB.offset==0) || (juncA.offset!=0 && juncB.offset!=0) ){
			juncB.item.reverse();
		}
		juncA.item.join(juncB.item);
	}

	function random_color(){
		return new Color({
			hue: random_int(0,360),
			saturation: 0.8,
			brightness: 0.8
		});
	}
	
	// returns index of smallest total angle diff, to match with i:0
	function find_smallest_diff_4(junction){
		let smallest = 180;
		let code = -1;
		for(let i=1; i<junction.length; i++){
			let d = Math.abs( junction[0].angle-junction[i].angle);
			let closest_angle = Math.round(d/180)*180;
			let x = Math.abs(closest_angle-d);
			if(x<smallest){
				smallest = x;
				code = i;
			}
		}
		return code;
	}
	function find_smallest_diff_3(junction){
		let smallest = 180;
		let pair;
		for(let i=0; i<3; i++){
			let j = (i+1)%3;
			let d = Math.abs( junction[i].angle-junction[j].angle);
			let closest_angle = Math.round(d/180)*180;
			let x = Math.abs(closest_angle-d);
			if(x<smallest){
				smallest = x;
				pair = [i,j];
			}
		}
		return pair;
	}

	function split_kolam(group){
		// split path up into bits
		group.children.forEach((path)=>{
			if(path.closed)
				path.split(0);
			while(path.segments.length>2){
				// remove last 2 segments
				let loc = path.getLocationOf(path.segments[path.segments.length-2].point);
				let split = path.splitAt(loc);
				group.addChild(split);
			}
		});
	}

	function make_dead_space(){
		dead = [];

	}

	function in_dead_space(index){
		return false;
	}

	function new_net(){
		list = [];
		net = {};
		for(let x=-net_size.x; x<=net_size.x; x++){
			net[x] = {};
			for(let y=-net_size.y; y<=net_size.y; y++){
				net[x][y] = null;
				//
			}
		}
	}

	function initial_nodes(){
		let r = Math.random();
		if(r<0.4){
			// One center node
			create_node([0,0]);
		}
		else if(r<0.8){
			// one symmetric node
			let new_idx = [ random_int(-net_size.x/2,net_size.x/2), random_int( -net_size.y/2, net_size.y/2) ];
			get_symmetric_nodes(new_idx,'u').forEach((_new)=>{
				create_node(_new.index);
			});
		}
		else {
			// scatter of
			let seeds = random_int(4, 16);
			while(net_count<seeds){
				let new_idx = [ random_int(-net_size.x,net_size.x+1), random_int( -net_size.y, net_size.y+1) ];
				get_symmetric_nodes(new_idx,'u').forEach((_new)=>{
					create_node(_new.index);
				});
				//
			}
		}
	}

	function create_node(index){
		let node = new_node();
		node.index = index;
		node.point = view.center.add( [index[0]*grid, -index[1]*grid]);
		list.push(node);
		set_net(index,node);
	}

	function grow_net(){	// gg

		while(net_count < net_size.n)
		{
			let rand_node = list[random_int(0, list.length)];

			add_one_neighbour(rand_node);

			let r = Math.random();
			if( r<p_join){
				add_one_connection(rand_node);
				// join 2 nodes
			}
			else if( r <p_join+p_remove){
				// break a connection 
			}

			
			
			// 
		}

		// Eo func ()
	}

	function in_grid(index){
		return ( (index[0]>=-net_size.x && index[0]<=net_size.x) && (index[1]>=-net_size.y && index[1]<=net_size.y) );
	}

	
	function add_one_neighbour(node){
		// xx
		let free_nbrs = get_free_nbrs(node);		
		if(free_nbrs.length>0){
			let dir = free_nbrs[random_int(0,free_nbrs.length)];

			// cehck if in bounds or a dead zone
			let new_idx = index_in_dir(node.index,dir);
			if(in_grid(new_idx) && !in_dead_space(new_idx) ){
				let new_nodes = get_symmetric_nodes(node.index,dir);
				add_new_nodes(new_nodes);				
			}
		}
	}

	function add_one_connection(node){
		let nbrs = get_nbrs(node);
		if(nbrs.length>node.connections.length){
			// remove neighbours which are connected to you
			node.connections.forEach((dir)=>{
				nbrs.splice( nbrs.indexOf(dir),1);
			});
			let new_dir = nbrs[random_int(0,nbrs.length)];
			let new_connections = get_symmetric_nodes(node.index,new_dir);
			new_connections.forEach((_new)=>{
				connect_nodes(_new.index,_new.dir);
			});
		}
	}

	function get_symmetric_nodes(index,dir){
		let new_nodes;
		if(symmetry=='X'){
			new_nodes = get_connections_X(index,dir);
		}
		else if(symmetry=='XY'){
			new_nodes = get_connections_XY(index,dir);
		}
		else if(symmetry=='ROT2'){
			new_nodes = get_connections_rot2(index,dir);
		}
		return new_nodes;
	}

	function add_new_nodes(instructions){
		instructions.forEach((new_node)=>{
			add_node_in_dir( new_node.index, new_node.dir );
		});
	}
	
	function connect_nodes(index,dir){
		let node = get_net(index);
		let other = get_net(index_in_dir(index,dir));
		let opp = opposite_dir(dir);
		node.connections.push(dir);
		other.connections.push(opp);
		node[dir] = other;
		other[opp] = node;		
	}

	function add_node_in_dir( index, dir ){
		let onto_node = get_net(index);
		let new_idx = index_in_dir(index,dir);
		let opp = opposite_dir(dir);
		// Check net is empty
		if(!get_net(new_idx) ){
			let _new = new_node();
			_new.index =  new_idx;
			_new.point = view.center.add( [new_idx[0]*grid, -new_idx[1]*grid]);
			// connect to orig 
			_new.connections.push(opp);
			onto_node.connections.push(dir);
			_new[opp] = onto_node;
			onto_node[dir] = _new;
			// add to list & net
			list.push(_new);
			set_net(_new.index, _new);
		}
		else {
			// connect instead of creating new
			let other_node = get_net(new_idx);
			// if(!onto_node.connections.includes(dir)){
			onto_node.connections.push(dir);
			onto_node[dir] = other_node;
			// if(!other_node.connections.includes(dir)){
			other_node.connections.push(opp);
			other_node[opp] = onto_node;
		}
	}
	// ***************************************  static functions ***************************************
		
	function new_node(){
		let struct = {
			id: net_count++,
			u: null,
			d: null,
			l: null,
			r: null,
			index: null,
			point: null,
			connections: []
		}
		return struct;
	}

	function get_free_nbrs(node){
		let free = [];
		if(!get_net(index_in_dir(node.index,'u')))
			free.push('u');
		if(!get_net(index_in_dir(node.index,'d')))
			free.push('d');
		if(!get_net(index_in_dir(node.index,'l')))
			free.push('l');
		if(!get_net(index_in_dir(node.index,'r')))
			free.push('r');
		return free;
	}

	function get_nbrs(node){
		let free = [];
		if(get_net(index_in_dir(node.index,'u')))
			free.push('u');
		if(get_net(index_in_dir(node.index,'d')))
			free.push('d');
		if(get_net(index_in_dir(node.index,'l')))
			free.push('l');
		if(get_net(index_in_dir(node.index,'r')))
			free.push('r');
		return free;
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

	function index_in_dir(index,dir){
		let idx = dir_to_index(dir);
		idx[0] += index[0];
		idx[1] += index[1];
		return idx;
	}

	function idx_mirr_x(index){
		return [ -index[0], index[1] ];
	}

	function idx_mirr_y(index){
		return [ index[0], -index[1] ];
	}

	function idx_mirr_xy(index){
		return [ -index[0], -index[1] ];
	}

	function set_net(index,node){
		net[index[0]][index[1]] = node;
	}
	
	function get_net(index){
		if(in_grid(index))
			return net[index[0]][index[1]];
		else 
			return null;
	}

	function index_equal(idxA,idxB){
		return ( (idxA[0]==idxB[0]) && (idxA[1]==idxB[1]) );
	}
	
	// * get all connections to be made for horizontal 'X' symmetry
	function get_connections_X(orig, dir){
		
		let new_nodes = [];

		// grow node
		new_nodes.push({
			index: orig,
			dir: dir
		});
		
		if(dir=='u' || dir=='d'){
			// * if not in center, grow pair
			if(orig[0]!=0){
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: dir
				});
			}
		}
		else 
		{
			// * sprout L and R
			if(orig[0]==0){
				// * center, grow opp dir on same node
				let opp = opposite_dir(dir);
				new_nodes.push({
					index: orig,
					dir: opposite_dir(dir)
				});
			}
			else{
				// * grow pair opposite
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: opposite_dir(dir)
				});
			}
		}
		return new_nodes;
	}

	function get_connections_XY(orig, dir){
		
		let new_nodes = [];
		let opp = opposite_dir(dir);
		
		// * special cases first

		// * if in center 
		if(index_equal(orig,[0,0])){
			// grow orig in all directions
			new_nodes.push({
				index: orig,
				dir: 'u'
			});
			new_nodes.push({
				index: orig,
				dir: 'd'
			});
			new_nodes.push({
				index: orig,
				dir: 'l'
			});
			new_nodes.push({
				index: orig,
				dir: 'r'
			});
		}
		// * on Y axis
		else if( orig[0]==0 ){	
			if(dir=='u' || dir=='d'){
				// grow Up & down on X 
				new_nodes.push({
					index: orig,
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_y(orig),
					dir: opp
				});
			}
			else{
				// grow L&R from Y axis , twice on orig node
				new_nodes.push({
					index: (orig),
					dir: dir
				});
				new_nodes.push({
					index: (orig),
					dir: opp
				});
				new_nodes.push({
					index: idx_mirr_y(orig),
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_y(orig),
					dir: opp
				});
			}
		}
		// * on X Axis
		else if( orig[1]==0 ){	
			if(dir=='l' || dir=='r'){
				// * grow opposite only
				new_nodes.push({
					index: orig,
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: opp
				});
			}
			else{
				// * grow Up &down from X axis, twice on same node
				new_nodes.push({
					index: orig,
					dir: dir
				});
				new_nodes.push({
					index: orig,
					dir: opp
				});
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: opp
				});
			}
		}
		else{
			// * different for X or Y axis

			if(dir=='l' || dir=='r'){
				// * L & R
				new_nodes.push({
					index: orig,
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_y(orig),
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: opp
				});
				new_nodes.push({
					index: idx_mirr_xy(orig),
					dir: opp
				});
			}
			else {
				// * Up & Down
				new_nodes.push({
					index: orig,
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_x(orig),
					dir: dir
				});
				new_nodes.push({
					index: idx_mirr_y(orig),
					dir: opp
				});
				
				new_nodes.push({
					index: idx_mirr_xy(orig),
					dir: opp
				});
			}
			// Eo XY
		}

		return new_nodes;
	}


	function get_connections_rot2(orig, dir){
		
		let new_nodes = [];
		
		// grow orig in all directions
		new_nodes.push({
			index: orig,
			dir: dir
		});
		new_nodes.push({
			index: idx_mirr_xy(orig),
			dir: opposite_dir(dir)
		});

		return new_nodes;
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
	

	//	###################################  D R A W ################################

	function draw_net(){
		let kolam = new Group();
		list.forEach( (node)=>{
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
		if(tip_shape=='round')	
			return draw_tip_round(node);
		else if(tip_shape=='pointy')
			return draw_tip_pointy(node);	
		else if(tip_shape=='trig')	
			return draw_tip_trig(node);
	}


	function draw_tip_round(node){
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

	// draw pointy tip
	function draw_tip_pointy(node){
		let dir = node.connections[0];
		let opp = opposite_dir(dir);
		let path = new Path();
		let knot = mid_point(node,dir);
		let angl = 50;
		let knot_h = 0.7;
		let tip_h = 0.4;
		// path.add(knot );
		near = step_vec(dir,nr).rotate(90);
		path.add(new Segment({
			point: knot,// node.point.add(near),
			// handleIn: step_vec(dir, 0.3),
			handleOut: step_vec(opp, knot_h).rotate(-angl)
		}));
		path.add(new Segment({	// * tip
			point: node.point.add(step_vec(opp,0.5)),
			handleIn: step_vec(dir, tip_h),
			handleOut: step_vec(dir, tip_h),
		}));
		path.add(new Segment({
			point: knot,//node.point.add(near.rotate(180)),
			handleIn: step_vec(opp, knot_h).rotate(angl)
			// handleOut: step_vec(dir, 0.3),
		}));
		// path.add( knot );
		return path;
	}

	function draw_tip_trig(node){
		let dir = node.connections[0];
		let opp = opposite_dir(dir);
		let knot = mid_point(node,dir);
		let path = new Path();
		let rx = 60;
		path.add(knot);
		path.add(node.point.add(step_vec(dir,nr).rotate(rx) ));
		path.add(node.point.add(step_vec(opp,0.5)) );
		path.add(node.point.add(step_vec(dir,nr).rotate(-rx) )); 
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
		let knotA = mid_point(node,crnrs[0]); //node.point.add(step_vec(crnrs[0],0.5));
		let knotB = mid_point(node,crnrs[1]); //node.point.add(step_vec(crnrs[1],0.5));
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

	function mid_point(node,dir){
		let pos = step_vec(dir, 0.5).add(node.point);
		return pos;
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


	function random_free_direction(node){
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



	tool.onKeyDown = function(event){

		if(event.key=='j'){
			
			// * split up 
			split_kolam(kolam);

			// * join paths
			join_index = 0;
			join_kolam();

			kolam.strokeColor = 'black';
			project.activeLayer.children[0].remove();
		}
		

		// Eo key Down
		
	}
	

	tool.onMouseDown = function(event){
		// project.activeLayer.removeChildren();
		
		//
	}



	// #################################### E X P O R T ##############################


	
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

