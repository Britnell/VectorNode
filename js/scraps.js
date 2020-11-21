
	function random_empty_space(max, xlim, ylim){
		let spaces = random_int(0,max);
		let empties = [];

		while(empties.length<spaces){
			let r = Math.random();

			let p = [ random_int(0,xlim), random_int(-ylim, ylim) ];
			empties.push(p.slice());

			if(p[0] != 0){
				p[0] = -p[0];
				empties.push(p);
			}

			if(Math.random()<0.1){
				// add neighbouring empty
				let d = dir_to_index(random_dir());
				d[0] += p[0];
				d[1] += p[1];
				empties.push(d.slice());
				if(d[0]!=0){
					d[0] = -d[0];
					empties.push(d);
				}
				console.log(' Neighbous! ' , p, d);
			}
			// Eo loop
		}
		return empties;
    }
    

    let max_empties = 20;
		let empties_area_x = random_int(4,10);
		let empties_area_y = random_int(4,10);
		empty_space = random_empty_space(max_empties, empties_area_x, empties_area_y);
		console.log(' EMPTIES ', empty_space);


        