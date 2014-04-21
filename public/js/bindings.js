function Binding(element, data, callback){
	this.data = data;
	this.element = element;	// element needs to impelemnt change()
	this.element.change = callback;
	element.addEventListener('change', this, false);
}

Binding.prototype.handleEvent = function(event){
	switch(event.type){
		case 'change' : this.change(this.element.value);
	}
}

Binding.prototype.change = function(value){
	this.data = value;
	this.element.change(value);
}