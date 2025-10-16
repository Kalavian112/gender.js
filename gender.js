let deterSeed = 0;
function Gender(seed){
	// Split up seed (int32) into constituent parts.
	// All values are kept as int8 using &0xFF
	this.masc=(seed&0xFF);
	this.fem=(seed>>8&0xFF);
	this.dys=(seed>>16&0xFF);
	this.fluid=(seed>>24&0xFF);
	// Change deterministic seed each time gender is created
	deterSeed = seed;
	// Get gender label, also used to ensure transition
	this.getLabel = function(){
		if(this.masc<16&&this.fem<16){
			return "agender";
		}
		if(this.masc>240&&this.fem>240){
			return "bigender";
		}
		if(this.masc-this.fem>16){
			return "male";
		}
		if(this.fem-this.masc>64){
			return "female";
		}
		return "nonbinary";
	}
	// Tick gender
	this.tick = function(logResult){
		let transitionDebug = 0;
		let currentLabel = this.getLabel();
		if(this.dys>=64){
			this.dys = (this.dys + (deterRand()&7));
		} else {
			if((deterRand()&3)==0){
				this.dys -= 1;
			} else {
			this.dys = Math.ceil(this.dys * 0.95);
			}
		}
		// Randomly alter all values a tiny bit
		// Check if label changes, if it does undo it
		// There's probably a way better way to do this
		let valueChanged = false;
		let valueAttempts = 0;
		while(valueChanged==false){
			let cMasc = this.masc;
			let cFem = this.fem;
			let cFluid = this.fluid;
			let valueAlt = deterRand();
			this.masc=clamp8(this.masc+normalizeBits((valueAlt&3)-1));
			this.fem=clamp8(this.fem+normalizeBits((valueAlt&3)-1));
			this.fluid=clamp8(this.fluid+normalizeBits((valueAlt&3)-1));
			if(this.getLabel() != currentLabel){
				this.masc = cMasc;
				this.fem = cFem;
				this.fluid = cFluid;
			}
			else {
				valueChanged = true;
			}
		}
		// Check for transition, guaranteed dys>=224 but can happen above 160, also based on fluid
		let transition = false;
		if((deterRand()&63) < this.dys-160){
			transition=true;
			transitionDebug=1;
		}
		else if((deterRand()&0x7FFFFFF)<(this.fluid*this.fluid*this.fluid)){
			transition=true;
			transitionDebug=2;
		}
		// Transition gender
		if(transition){
			// Get current label, keep "rerolling" until it changes
			while(this.getLabel() == currentLabel){
				this.masc = deterRand()&255;
				this.fem = deterRand()&255;
			}
			this.dys = Math.min((deterRand()&63)+8,this.dys);
		}
		// Clamp to 0-255
		this.masc = clamp8(this.masc);
		this.fem = clamp8(this.fem);
		this.dys = clamp8(this.dys);
		this.fluid = clamp8(this.fluid);
		if(logResult){
			if(transition){
				console.log("Transitioned to "+this.getLabel()+" with new dysphoria value "+this.dys);
			}
			console.log("New Masc: "+this.masc);
			console.log("New Fem: "+this.fem);
			console.log("New Dysphoria: "+this.dys);
			console.log("New Fluidity: "+this.fluid);
		}
		return transitionDebug;
	}
	this.processTicks = function(ticks){
		for(let i=0;i<ticks;i++){this.tick(0)}
	}
}
// Changes and returns deterministic seed
function deterRand(){
	deterSeed = deterSeed^(deterSeed<<13);
	deterSeed = deterSeed^(deterSeed>>17);
	deterSeed = deterSeed^(deterSeed<<5);
	return deterSeed;
}
function clamp8(value){
	return Math.min(Math.max(value,0),255) & 0xFF;
}
function normalizeBits(value){
	if(value<=0){
		return value-1;
	}
	else {
		return value;
	}
}
