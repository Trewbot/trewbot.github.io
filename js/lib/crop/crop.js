/*
 *	Graphene Image Cropper
 *	Written By Trevor J Hoglund
 *	Mar 17, 2016
 */

	function _i(i){return document.getElementById(i);}
	Element.prototype.set = function(o){
		for(var i in o)
			if(~['styles','style'].indexOf(i) && typeof o[i] === 'object') for(var p in o[i]) this.style[p] = o[i][p];
			else if(i === 'html') this.innerHTML = o[i];
			else this.setAttribute(i, o[i]);
		return this;
	};
	if(typeof Graphene !== 'object') _g = Graphene	= {};
	_g.x = _g.crop	= function(element, image, kind, o){
		var o = o || {};
		this.int = typeof window._g_x_i == 'undefined'
			? window._g_x_i = 0
			: ++window._g_x_i;
		if(typeof image !== 'string') return !1;
		this.elem     = element;
		this.kind     = kind;
		(this.img = new Image()).src = image;
		this.y1       = this.y2 = this.y3 = this.y4 = this.y5 =
		this.x1       = this.x2 = this.x3 = this.x4 = this.x5 = 0;
		this.rendered = !1;
		if(!this.thb) this.hb = 0;
		this.load	= function(){
			this.elem.set({
				style	: {
					width	: kind == 'cut'
						? this.elem.style.width
							? this.elem.style.width
							: this.elem.style.height
								? (+this.elem.style.height.split("px")[0] / this.img.height) * this.img.width + "px"
								: this.img.width + 'px'
						: o.frame.width + 'px',
					height	: kind == 'cut'
						? this.elem.style.height
							? this.elem.style.height
							: this.elem.style.width
								? (+this.elem.style.width.split("px")[0] / this.img.width) * this.img.height + "px"
								: this.img.height + 'px'
						: o.frame.height + 'px',
					position	: 'relative',
					background	: 'url(' + this.img.src + ')',
					backgroundSize : kind == 'cut'
						? 'contain'
						: '',
					cursor	: kind == 'cut'
						? 'crosshair'
						: 'move',
				}
			});
			this.init();
		}
		this.img.onload = this.load.bind(this);
		this.init   = function(){
			if(kind == 'cut'){
				this.eh		= typeof o.extra_handles == 'boolean'
								? o.extra_handles
								: !1;
				this.handle	= typeof o.handle_color == 'string'
								? o.handle_color
								: 'rgba(0,0,0,0.4)';
				this.hw		= typeof o.handle_width == 'number'
								? o.handle_width
								: 8;
				this.hb		= typeof o.handle_border_width == 'number'
								? o.handle_border_width
								: typeof o.handle_border == 'boolean' && o.handle_border
									? 1
									: 0;
				this.hbc	= typeof o.handle_border_color == 'string'
								? o.handle_border_color
								: '#ddd';
				this.thb	= typeof o.handle_border == 'boolean'
								? o.handle_border
								: !1;
				this.min	= typeof o.minimum == 'number'
								? o.minimum
								: 0;
				this.shade	= typeof o.shade == 'string'
								? o.shade
								: 'rgba(0,0,0,0.35)';
				this.arrow	= [
								'north',
								'west',
								'south',
								'east',
								'northwest',
								'northeast',
								'southeast',
								'southwest'
							];
				
				this.values		= {
					top		: 0,
					left	: 0,
					height	: 0,
					width	: 0
				};
				
				this.cutting	=
				this.moving		=
				this.resize		=
				this.linear		=
				this.rsz_ns		=
				this.rsz_ew		=
				this.rsz_nw		=
				this.rsz_ne		=
				this.rsz_sw		=
				this.rsz_se		= !1;
				
				this.y3                    = this.elem.getBoundingClientRect().height;
				this.x3                    = this.elem.getBoundingClientRect().width;
				this.square                = (typeof o.square == 'boolean')?o.square:!1;
				var gra_crop_html          = '';
				for(var i = 0; i < 4; i++)
					gra_crop_html 		  += '<div id="crop-div-'+this.arrow[i]+'-'+this.int+'" class="crop-div" style="cursor:crosshair;padding:0;margin:0;background:'+this.shade+';display:block;position:absolute;"></div>';
				for(var i = !this.square && this.eh ? 0 : 4; i < 8; i++)
					gra_crop_html		  += '<div id="crop-handle-'+this.arrow[i]+'-'+this.int+'" class="crop-handle" style="cursor:'+((i<4)?((i%2==0)?'ns':'ew'):((i%2==0)?'nw':'ne'))+'-resize;padding:0;margin:0;background:'+this.handle+';display:none;position:absolute;width:'+(this.hw-(this.hb*2))+'px;height:'+(this.hw-(this.hb*2))+'px;border-color:'+this.hbc+';border-width:'+this.hb+'px;border-style:'+((this.thb)?'solid':'')+';"></div>';
				this.elem.innerHTML        = gra_crop_html;
				this.cdn                   = _i('crop-div-north-'+this.int);
				this.cdw                   = _i('crop-div-west-'+this.int);
				this.cds                   = _i('crop-div-south-'+this.int);
				this.cde                   = _i('crop-div-east-'+this.int);
				if(!this.square && this.eh){
					this.chn               = _i('crop-handle-north-'+this.int);
					this.chw               = _i('crop-handle-west-'+this.int);
					this.chs               = _i('crop-handle-south-'+this.int);
					this.che               = _i('crop-handle-east-'+this.int);
				}
				this.chnw                  = _i('crop-handle-northwest-'+this.int);
				this.chne                  = _i('crop-handle-northeast-'+this.int);
				this.chsw                  = _i('crop-handle-southwest-'+this.int);
				this.chse                  = _i('crop-handle-southeast-'+this.int);
				this.getValues             = function(){
					return {
						left               : this.x1,
						width              : this.x2 - this.x1,
						top                : this.y1,
						height             : this.y2 - this.y1
					};
				}
				this.sendEvent             = function(kind){
					var generic            = {
						cropper            : this.int,
						left               : this.x1,
						width              : this.x2 - this.x1,
						top                : this.y1,
						height             : this.y2 - this.y1
					}
					if(kind=='crop' || kind=='set' || kind=='resize' || kind=='move'){
						var event          = new CustomEvent(kind, {
							detail         : generic
						});
						window.dispatchEvent(event);
					}
				}
				this.render                = function(){
					if(this.y2 - this.y1 < this.min){ this.y2 = this.y1 + this.min; }
					if(this.x2 - this.x1 < this.min){ this.x2 = this.x1 + this.min; }

					if(this.square){if(this.y2 - this.y1 < this.x2 - this.x1){this.squareX();} else {this.squareY();}}
					
					if(this.x2 > this.x3){ this.x2 = this.x3; this.squareY();}
					if(this.y2 > this.y3){ this.y2 = this.y3; this.squareX();}
					if(this.x1 > this.x3){ this.x1 = this.x3; this.squareY();}
					if(this.y1 > this.y3){ this.y1 = this.y3; this.squareX();}
					if(this.x1 < 0)      { this.x1 = 0;       this.squareY();}
					if(this.y1 < 0)      { this.y1 = 0;       this.squareX();}
					if(this.x2 < 0)      { this.x2 = 0;       this.squareY();}
					if(this.y2 < 0)      { this.y2 = 0;       this.squareX();}
					if(this.x2 < this.x1){ this.x2 = this.x1; this.squareY();}
					if(this.y2 < this.y1){ this.y2 = this.y1; this.squareX();}
					
					
					this.rendered          = !0;

					this.cdn.style.top     = "0px";
					this.cdn.style.left    = "0px";
					this.cdn.style.height  = this.y1 + "px";
					this.cdn.style.width   = this.x3 + "px";
					this.cdn.style.backgroundPositionX = "0px";
					this.cdn.style.backgroundPositionY = "0px";
					
					this.cdw.style.top     = this.y1 + "px";
					this.cdw.style.left    = "0px";
					this.cdw.style.height  = this.y2 - this.y1 + "px";
					this.cdw.style.width   = this.x1 + "px";
					this.cdw.style.backgroundPositionX = "0px";
					this.cdw.style.backgroundPositionY = - this.y1 + "px";
					
					this.cde.style.top     = this.y1 + "px";
					this.cde.style.left    = this.x2 + "px";
					this.cde.style.height  = this.y2 - this.y1 + "px";
					this.cde.style.width   = this.x3 - this.x2 + "px";
					this.cde.style.backgroundPositionX = - this.x2 + "px";
					this.cde.style.backgroundPositionY = - this.y1 + "px";
					
					this.cds.style.top     = this.y2 + "px";
					this.cds.style.left    = "0px";
					this.cds.style.height  = this.y3 - this.y2 + "px";
					this.cds.style.width   = this.x3 + "px";
					this.cds.style.backgroundPositionX = "0px";
					this.cds.style.backgroundPositionY = - this.y2 + "px";
					
					
					if(!this.square && this.eh){
					this.chn.style.top     = this.y1 - (this.hw / 2) + "px";
					this.chn.style.left    = this.x1 + ((this.x2 - this.x1) / 2) - (this.hw / 2) + "px";
					this.chn.style.display = 'block';

					this.chw.style.top     = this.y1 + ((this.y2 - this.y1) / 2) - (this.hw / 2) + "px";
					this.chw.style.left    = this.x1 - (this.hw / 2) + "px";
					this.chw.style.display = 'block';

					this.chs.style.top     = this.y2 - (this.hw / 2) + "px";
					this.chs.style.left    = this.x1 + ((this.x2 - this.x1) / 2) - (this.hw / 2) + "px";
					this.chs.style.display = 'block';

					this.che.style.top     = this.y1 + ((this.y2 - this.y1) / 2) - (this.hw / 2) + "px";
					this.che.style.left    = this.x2 - (this.hw / 2) + "px";
					this.che.style.display = 'block';
					}
					
					
					this.chnw.style.top    = this.y1 - (this.hw / 2) + "px";
					this.chnw.style.left   = this.x1 - (this.hw / 2) + "px";
					this.chnw.style.display= 'block';
					
					this.chne.style.top    = this.y1 - (this.hw / 2) + "px";
					this.chne.style.left   = this.x2 - (this.hw / 2) + "px";
					this.chne.style.display= 'block';

					this.chsw.style.top    = this.y2 - (this.hw / 2) + "px";
					this.chsw.style.left   = this.x1 - (this.hw / 2) + "px";
					this.chsw.style.display= 'block';

					this.chse.style.top    = this.y2 - (this.hw / 2) + "px";
					this.chse.style.left   = this.x2 - (this.hw / 2) + "px";
					this.chse.style.display= 'block';

					
					this.values.top        = this.y1;
					this.values.left       = this.x1;
					this.values.height     = this.y2 - this.y1;
					this.values.width      = this.x2 - this.x1;
				}
				this.mouseup               = function(e){
					if(this.cutting || this.moving || this.resize || this.linear){
						this.elem.style.cursor = 'move';
						this.cdn.style.cursor  = 
						this.cde.style.cursor  = 
						this.cds.style.cursor  = 
						this.cdw.style.cursor  = 'crosshair';
						this.sendEvent('crop');
					}
					if(this.cutting) this.sendEvent('set');
					if(this.resize || this.linear) this.sendEvent('resize');
					if(this.moving) this.sendEvent('move');
					this.cutting           = this.moving = this.linear = this.resize = this.rsz_ns = this.rsz_ew = this.rsz_nw = this.rsz_ne = this.rsz_sw = this.rsz_se = !1;
				}
				this.mousedown             = function(e){
					var tool = this.elem.getBoundingClientRect(),
						chnw = this.chnw.getBoundingClientRect(),
						chne = this.chne.getBoundingClientRect(),
						chsw = this.chsw.getBoundingClientRect(),
						chse = this.chse.getBoundingClientRect();
					if(this.eh){
						var
						chn  = this.chn.getBoundingClientRect(),
						chw  = this.chw.getBoundingClientRect(),
						chs  = this.chs.getBoundingClientRect(),
						che  = this.che.getBoundingClientRect();
					}
					if(this.checkloc(e, chnw)){
							e.preventDefault();
							this.x4        = e.clientX - chnw.left;
							this.y4        = e.clientY - chnw.top;
							this.x5        = this.x2;
							this.y5        = this.y2;
							this.resize    = !0;
							this.rsz_nw    = !0;
					} else if(this.checkloc(e, chne)){
							e.preventDefault();
							this.x4        = e.clientX - chne.left;
							this.y4        = e.clientY - chne.top;
							this.x5        = this.x1;
							this.y5        = this.y2;
							this.resize    = !0;
							this.rsz_ne    = !0;
					} else if(this.checkloc(e, chsw)){
							e.preventDefault();
							this.x4        = e.clientX - chsw.left;
							this.y4        = e.clientY - chsw.top;
							this.x5        = this.x2;
							this.y5        = this.y1;
							this.resize    = !0;
							this.rsz_sw    = !0;
					} else if(this.checkloc(e, chse)){
							e.preventDefault();
							this.x4        = e.clientX - chse.left;
							this.y4        = e.clientY - chse.top;
							this.x5        = this.x1;
							this.y5        = this.y1;
							this.resize    = !0;
							this.rsz_se    = !0;
					} else if(this.eh && this.checkloc(e, chn)){
							e.preventDefault();
							this.y4        = e.clientY - chn.top;
							this.y5        = this.y2;
							this.linear    = !0;
							this.rsz_ns    = !0;
					} else if(this.eh && this.checkloc(e, chw)){
							e.preventDefault();
							this.x4        = e.clientX - chw.left;
							this.x5        = this.x2;
							this.linear    = !0;
							this.rsz_ew    = !0;
					} else if(this.eh && this.checkloc(e, chs)){
							e.preventDefault();
							this.y4        = e.clientY - chs.top;
							this.y5        = this.y1;
							this.linear    = !0;
							this.rsz_ns    = !0;
					} else if(this.eh && this.checkloc(e, che)){
							e.preventDefault();
							this.x4        = e.clientX - che.left;
							this.x5        = this.x1;
							this.linear    = !0;
							this.rsz_ew    = !0;
					} else if(this.checkloc(e, tool)){
						e.preventDefault();
						if(e.clientX > tool.left + this.x1
							&& e.clientY > tool.top + this.y1
							&& e.clientX < tool.left + this.x2
							&& e.clientY < tool.top + this.y2){
							this.x4        = e.clientX - tool.left - this.x1;
							this.y4        = e.clientY - tool.top  - this.y1;
							this.x5        = this.x2 - this.x1;
							this.y5        = this.y2 - this.y1;
							this.render();
							this.moving    = !0;
						} else {
							this.x1        = e.clientX - tool.left;
							this.y1        = e.clientY - tool.top;
							this.x4        = this.x1;
							this.y4        = this.y1;
							this.x2        = this.x1 + 8;
							this.y2        = this.y1 + 8;
							this.render();
							this.cutting   = !0;
						}
					}
				}
				this.checkloc       = function(e, r){
					var t,
						y = e.pageY - ((t = document.documentElement.scrollTop)?t:scrollY),
						x = e.pageX - ((t = document.documentElement.scrollLeft)?t:scrollX);
					return (r && (x > r.left && y > r.top && x < r.right && y < r.bottom));
				}
				this.mousemove      = function(e){
					var tool        = this.elem.getBoundingClientRect();
					if(this.cutting){
						var t,
							y   = e.pageY - ((t = document.documentElement.scrollTop)?t:scrollY),
							x   = e.pageX - ((t = document.documentElement.scrollLeft)?t:scrollX),
							a   = (this.x5 = x - tool.left) > this.x4,
							b   = (this.y5 = y - tool.top) > this.y4;
						this.x1 =  a?this.x4:this.x5,
						this.x2 = !a?this.x4:this.x5,
						this.y1 =  b?this.y4:this.y5,
						this.y2 = !b?this.y4:this.y5;
						this.render();
					} else if(this.moving){
						this.x1     = e.clientX - tool.left - this.x4;
						this.x2     = this.x1 + this.x5;
						if(this.x2  > this.x3)
							this.x2 = this.x3, this.x1 = this.x2 - this.x5;
						if(this.x1  < 0)
							this.x1 = 0, this.x2 = this.x5;
						this.y1     = e.clientY - tool.top - this.y4;
						this.y2     = this.y1 + this.y5;
						if(this.y2  > this.y3)
							this.y2 = this.y3, this.y1 = this.y2 - this.y5;
						if(this.y1  < 0)
							this.y1 = 0, this.y2 = this.y5;
						this.render();
					} else if(this.resize){
						this.x6     = e.clientX - tool.left + ((this.hw / 2) - this.x4);
						this.y6     = e.clientY - tool.top  + ((this.hw / 2) - this.y4);
						this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = (this.rsz_nw || this.rsz_se)
							? 'nw-resize'
							: 'ne-resize';
						this.x1 = Math.min(this.x5,this.x6);
						this.x2 = Math.max(this.x5,this.x6);
						this.y1 = Math.min(this.y5,this.y6);
						this.y2 = Math.max(this.y5,this.y6);
						this.render();
					} else if(this.linear){
						if(this.rsz_ns){
							this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'ns-resize';
							this.y6     = e.clientY - tool['top']  + ((this.hw / 2) - this.y4);
							if(this.y6 > this.y5) this.y1 = this.y5, this.y2 = this.y6;
							if(this.y6 < this.y5) this.y1 = this.y6, this.y2 = this.y5;
						} else if(this.rsz_ew){
							this.elem.style.cursor = this.cdn.style.cursor = this.cde.style.cursor = this.cds.style.cursor = this.cdw.style.cursor = 'ew-resize';
							this.x6     = e.clientX - tool['left'] + ((this.hw / 2) - this.x4);
							if(this.x6 > this.x5) this.x1 = this.x5, this.x2 = this.x6;
							if(this.x6 < this.x5) this.x1 = this.x6, this.x2 = this.x5;
						}
						this.render();
					}
				}
				this.squareY = function(){
					if(this.square){
						if((this.cutting && ((this.x5  > this.x4 && this.y5 > this.y4) || (this.x5  < this.x4 && this.y5 > this.y4))) || (this.resize && ((this.x6 < this.x5 && this.y6 > this.y5) || (this.x6 > this.x5 && this.y6 > this.y5)))) this.y2 = this.y1 + (this.x2 - this.x1);
						if((this.cutting && ((this.x5  > this.x4 && this.y5 < this.y4) || (this.x5  < this.x4 && this.y5 < this.y4))) || (this.resize && ((this.x6 < this.x5 && this.y6 < this.y5) || (this.x6 > this.x5 && this.y6 < this.y5)))) this.y1 = this.y2 - (this.x2 - this.x1);
					}
				}
				this.squareX = function(){
					if(this.square){
						if((this.cutting && ((this.x5  > this.x4 && this.y5 > this.y4) || (this.x5  > this.x4 && this.y5 < this.y4))) || (this.resize && ((this.x6  > this.x5 && this.y6 > this.y5) || (this.x6 > this.x5 && this.y6 < this.y5)))) this.x2 = this.x1 + (this.y2 - this.y1);
						if((this.cutting && ((this.x5  < this.x4 && this.y5 < this.y4) || (this.x5  < this.x4 && this.y5 > this.y4))) || (this.resize && ((this.x6  < this.x5 && this.y6 < this.y5) || (this.x6 < this.x5 && this.y6 > this.y5)))) this.x1 = this.x2 - (this.y2 - this.y1);
					}
				}
				document.addEventListener('mouseup',   this.mouseup.bind(this));
				document.addEventListener('mousedown', this.mousedown.bind(this));
				document.addEventListener('mousemove', this.mousemove.bind(this));
				this.cropTo = function(crop){
					if(!(typeof crop == 'object' && typeof crop.left == 'number'&& typeof crop.width == 'number'&& typeof crop.top == 'number'&& typeof crop.height == 'number')) return !1;
					this.x1 = crop.left;
					this.x2 = crop.left + crop.width;
					this.y1 = crop.top;
					this.y2 = crop.top + crop.height;
					this.render();
				}
				
				this.stop = function(){
					document.removeEventListener('mouseup',   this.mouseup);
					document.removeEventListener('mousedown', this.mousedown);
					document.removeEventListener('mousemove', this.mousemove);
				}
				
				if(typeof o.preset == 'object' && typeof o.preset.left == 'number' && typeof o.preset.width == 'number' && typeof o.preset.top == 'number' && typeof o.preset.height == 'number'){
					this.x1 = o.preset.left;
					this.x2 = o.preset.left + o.preset.width;
					this.y1 = o.preset.top;
					this.y2 = o.preset.top + o.preset.height;
					this.elem.style.cursor = 'move';
					this.render();
				}
			}
			else if(kind == 'frame'){
				if(typeof o.frame.width    !== 'number' || typeof o.frame.height !== 'number'){console.error("Frame undefined!"); return !1};
				this.force_width           = (typeof o.force_width == 'boolean')?o.force_width:!1;
				this.force_height          = (typeof o.force_height == 'boolean')?o.force_height:!1;
				this.moving                = !1;
				this.x1                    = (typeof o.preset == 'object' && typeof o.preset.left == 'number')?-o.preset.left:0;
				this.y1                    = (typeof o.preset == 'object' && typeof o.preset.top == 'number')?-o.preset.top:0;
				this.elem.style.backgroundPosition = this.x1 + "px " + this.y1 + "px";
				this.x2                    = this.x1 + o.frame.width;
				this.y2                    = this.y1 + o.frame.height;
				this.x3                    = (this.force_width)?o.frame.width:(this.force_height)?(o.frame.height/this.img.height)*this.img.width:this.img.width;
				this.y3                    = (this.force_width)?(o.frame.width/this.img.width)*this.img.height:(this.force_height)?o.frame.height:this.img.height;
				this.force_width           = (typeof o.force_width == 'boolean')?o.force_width:!1;
				this.force_height          = (typeof o.force_height == 'boolean')?o.force_height:!1;
				this.bleed                 = (typeof o.bleed == 'boolean')?o.bleed:!1;
				this.bleed_width           = (typeof o.bleed_width == 'number')?o.bleed_width:0;
				this.bleed_opacity         = (typeof o.bleed_opacity == 'number')?o.bleed_opacity:0.3;
				if(this.bleed){
					var ghost = '<div class="crop-ghost" style="top:-'+this.bleed_width+'px;left:-'+this.bleed_width+'px;width:'+(o.frame.width+(2*this.bleed_width))+'px;height:'+(o.frame.height+(2*this.bleed_width))+'px;'+ ((typeof o.bleed_width == 'number')?'overflow:hidden;':'')+'opacity:'+this.bleed_opacity+';position:absolute;"><img class="crop-ghost-img" src="'+this.img.src+'" style="margin:0;position:absolute;overflow:hidden;width:'+(this.force_width?o.frame.width+'px':this.force_height?'auto':this.img.width+'px')+';height:'+(this.force_height?o.frame.height+'px':this.force_width?'auto':this.img.height+'px')+';top:'+(this.bleed_width + this.y1)+'px;left:'+(this.bleed_width + this.x1)+'px;"/></div><div style="position:absolute;width:'+o.frame.width+'px;height:'+o.frame.height+'px;top:0;left:0;cursor:move;"></div>';
					this.elem.insertAdjacentHTML('afterbegin', ghost);
					this.ghost = this.elem.getElementsByClassName('crop-ghost-img')[0];
				} else {
					this.elem.style.cursor = 'move';
				}
				if(this.force_width){this.elem.style.backgroundSize = o.frame.width + "px auto"; if(this.bleed) this.ghost.style.width = o.frame.width + "px";}
				else if(this.force_height){this.elem.style.backgroundSize = "auto " + o.frame.height + "px"; if(this.bleed) this.ghost.style.height = o.frame.height + "px";}
				
				this.getValues             = function(){
					var ret = {
						left: - this.x1,
						width: this.x2 + this.x1,
						top: - this.y1,
						height: this.y2 + this.y1
					}
					if(this.force_width){
						var ratio  = this.img.width / o.frame.width;
						ret.left  *= ratio;
						ret.width *= ratio;
						ret.top   *= ratio;
						ret.height*= ratio;
					} else if(this.force_height){
						var ratio  = this.img.height / o.frame.height;
						ret.left  *= ratio;
						ret.width *= ratio;
						ret.top   *= ratio;
						ret.height*= ratio;
					}
					return ret;
				}
				this.sendEvent             = function(kind){
					var vals               = this.getValues(),
						generic            = {
						cropper            : this.int,
						left               : vals.left,
						width              : vals.width,
						top                : vals.top,
						height             : vals.height
					}
					if(kind=='move' || kind=='moving'){
						var event          = new CustomEvent(kind, {
							detail         : generic
						});
						window.dispatchEvent(event);
					}
				}
				this.render                = function(){
					this.elem.style.backgroundPosition  = this.x1 + "px " + this.y1 + "px";
					if(this.bleed){
						this.ghost.style.left = this.x1 + this.bleed_width + "px";
						this.ghost.style.top  = this.y1 + this.bleed_width + "px";
					}
				}
				this.mouseup               = function(e){
					if(this.moving)          this.sendEvent("move");
					this.moving            = !1;
					if(this.bleed)           this.ghost.parentElement.style.cursor = '';
				}
				this.mousedown             = function(e){
					var rect               = this.elem.getBoundingClientRect();
					if(rect && (e.clientX  > rect['left'] && e.clientY > rect['top'] && e.clientX < rect['left'] + rect['width'] && e.clientY < rect['top'] + rect['height'])){
						e.preventDefault();
						this.x4            = e.clientX - rect['left'] - this.x1;
						this.y4            = e.clientY - rect['top']  - this.y1;
						this.x5            = o.frame.width;
						this.y5            = o.frame.height;
						this.moving        = !0;
						if(this.bleed) this.ghost.parentElement.style.cursor = 'move';
						this.render();
					}
				}
				this.mousemove             = function(e){
					if(this.moving){
						this.sendEvent("moving")
						var tool    = this.elem.getBoundingClientRect();
						this.x1     = e.clientX - tool['left'] - this.x4;
						this.x2     = this.x5 - this.x1;
						if(this.x2  > this.x3)
							this.x2 = this.x3, this.x1 = this.x5 - this.x2;
						if(this.x1  > 0)
							this.x1 = 0, this.x2 = this.x5;
						this.y1     = e.clientY - tool['top'] - this.y4;
						this.y2     = this.y5 - this.y1;
						if(this.y2  > this.y3)
							this.y2 = this.y3, this.y1 = this.y5 - this.y2;
						if(this.y1  > 0)
							this.y1 = 0, this.y2 = this.y5;
						this.render();
					}
				}
				document.addEventListener('mouseup',   this.mouseup.bind(this));
				document.addEventListener('mousedown', this.mousedown.bind(this));
				document.addEventListener('mousemove', this.mousemove.bind(this));
			}
		}
	};
	_g.x.changes = [
		["v0.0.0.0001","Jul 08, 2014","Scripts copied over from Graphene and adjusted to fit external requirements."],
		["v0.0.0.0002","Jul 08, 2014","Added variables to allow omnidirectional cropping for kind:cut."],
		["v0.0.0.0003","Jul 08, 2014","Added resizing with handles for kind:cut."],
		["v0.0.0.0004","Jul 08, 2014","Fixed y1 and x1 variables being able to pass y2 and x2 respectively."],
		["v0.0.0.0005","Jul 08, 2014","Allowed y1 and x1 to pass y2 and x2 respectively, and switch positions while resizing for kind:cut. Changed tools divs' cursor to resizing while resizing for kind:cut."],
		["v0.0.0.0006","Jul 09, 2014","Fixed resizing while square:true moving opposing corners for kind:cut. Changed square:true to use smaller width rather than larger for kind:cut."],
		["v0.0.0.0007","Jul 09, 2014","Fixed cutting while square:true moving opposing corners for kind:cut. Fixed y2 and x2 variables being able to be lass than y1 and x1 respectively."],
		["v0.0.1.0008","Jul 09, 2014","Added options for preset values for kind:cut."],
		["v0.0.1.0009","Jul 09, 2014","Added getValues() function for kind:cut. Added crop, set, resize and move events for kind:cut."],
		["v0.0.1.0010","Jul 09, 2014","Added extra_handles option to enable north, west, south and east resize handles for kind:cut."],
		["v0.0.1.0011","Jul 09, 2014","Fixed error when checking mousedown while extra_handles:!1 for kind:cut."],
		["v0.0.2.0012","Jul 10, 2014","Added scripts to build the cropper with minimal effort by the client (do not have to set width and height) for kind:cut. Added image as a required input."],
		["v0.0.2.0013","Jul 10, 2014","Added kind:frame. Added option bleed to show full image as ghost for kind:frame."],
		["v0.0.2.0014","Jul 11, 2014","Fixed style of image backgrounds as shade (using background positions) for kind:cut."],
		["v0.0.2.0015","Jul 14, 2014","Added force_width and force_height o for kind:frame. Added getValues() function for kind:frame. Added move and moving events for kind:frame. Added cropTo() function for kind:cut. Fixed some CSS errors."],
		["v0.0.2.0016","Aug 27, 2014","Added stop() for kind:cut."],
		["v0.0.2.0017","Mar 02, 2015","Refactored"],
		["v0.0.2.0018","Nov 25, 2015","Refactored"],
		["v0.1.0.0019","Jan 01, 2016","Fixed kind:cut sizing"],
		["v0.1.0.0020","Jan 01, 2016","Fixed handle borders"],
		["v0.1.0.0021","Jan 01, 2016","Fixed y3 == x3 for non-forced frames"],
		["v0.1.0.0022","Jan 01, 2016","Added changelog as array"],
		["v0.1.0.0023","Jan 01, 2016","Refactored"],
		["v0.1.0.0024","Jan 01, 2016","Fixed ghost styling."],
		["v0.1.0.0025","Jan 01, 2016","Fixed frame presets."],
		["v0.1.0.0026","Mar 17, 2016","Fixed changes error."],
		["x0.1.0.0026","Mar 17, 2016","Changed version scheme to xX.X.X.XXXX."],
	];