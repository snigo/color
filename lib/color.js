var Color=function(t){"use strict";const e=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.072175],[.0193339,.119192,.9503041]],a=[[3.2404542,-1.5371385,-.4985314],[-.969266,1.8760108,.041556],[.0556434,-.2040259,1.0572252]],n=[[1.0478112,.0228866,-.050127],[.0295424,.9904844,-.0170491],[-.0092345,.0150436,.7521316]],s=[[.9555766,-.0230393,.0631636],[-.0282895,1.0099416,.0210077],[.0122982,-.020483,1.3299098]],r=[.96422,1,.82521],i=[.9505,1,1.089],h=[0,255],l=[0,1],o=[-128,127],u=[0,260],f=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/,c=/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/,y=/\(\s*([0-9a-z.%+-]+)\s*,\s*([0-9a-z.%+-]+)\s*,\s*([0-9a-z.%+-]+)\s*(?:,\s*([0-9a-z.%+-]+)\s*)?\)$/,g=/\(\s*([0-9a-z.%+-]+)\s+([0-9a-z.%+-]+)\s+([0-9a-z.%+-]+)\s*(?:\s+\/\s+([0-9a-z.%+-]+)\s*)?\)$/;class LabColor{constructor({lightness:t,a:e,b:a,chroma:n,hue:s,alpha:i}){Object.defineProperties(this,{lightness:{value:t},a:{value:e},b:{value:a},chroma:{value:n},hue:{value:s},alpha:{value:i},whitePoint:{value:r}})}static lab({lightness:t,a:e,b:a,alpha:n}){const s=G(t),r=v(e),i=v(a);if(p(s,r,i))return new LabColor({lightness:s,a:r,b:i,chroma:k(Math.sqrt(r**2+i**2)),hue:R(180*Math.atan2(i,r)/Math.PI),alpha:$(n)})}static labArray([t,e,a,n]){return LabColor.lab({lightness:t,a:e,b:a,alpha:n})}static lch({lightness:t,chroma:e,hue:a,alpha:n}){const s=G(t),r=k(e),i=R(a);if(p(s,r,i))return new LabColor({lightness:s,a:v(r*Math.cos(i*Math.PI/180)),b:v(r*Math.sin(i*Math.PI/180)),chroma:r,hue:i,alpha:$(n)})}static lchArray([t,e,a,n]){return LabColor.lch({lightness:t,chroma:e,hue:a,alpha:n})}get luminance(){return this.toXyz().y}toXyz(t=this.whitePoint){const e=.008856,a=903.3,n=100*this.lightness,s=(n+16)/116,r=this.a/500+s,i=s-this.b/200,[h,o,u]=[r**3>e?r**3:(116*r-16)/a,n>a*e?((n+16)/116)**3:n/a,i**3>e?i**3:(116*i-16)/a].map((t,e)=>w(t*this.whitePoint[e],7));return new XYZColor({x:h,y:M(l,o),z:u,alpha:this.alpha,whitePoint:this.whitePoint}).adapt(t)}toRgb(){return this.toXyz(i).toRgb()}toLab(){return this}toGrayscale(){return this.copyWith({a:0,b:0})}toLchString(t=3){return this.alpha<1?`lch(${w(100*this.lightness,t)}% ${w(this.chroma,t)} ${w(this.hue,t)}deg / ${this.alpha})`:`lch(${w(100*this.lightness,t)}% ${w(this.chroma,t)} ${w(this.hue,t)}deg)`}toLabString(t=3){return this.alpha<1?`lab(${w(100*this.lightness,t)}% ${w(this.a,t)} ${w(this.b,t)} / ${this.alpha})`:`lab(${w(100*this.lightness,t)}% ${w(this.a,t)} ${w(this.b,t)})`}opacity(t=1){return this.alpha===t?this:new LabColor({lightness:this.lightness,a:this.a,b:this.b,chroma:this.chroma,hue:this.hue,alpha:$(t)})}copyWith(t){return"a"in t||"b"in t?LabColor.lab({lightness:this.lightness,a:this.b,b:this.b,alpha:this.alpha,...t}):"hue"in t||"chroma"in t?LabColor.hsl({lightness:this.lightness,chroma:this.chroma,hue:this.hue,alpha:this.alpha,...t}):"lightness"in t?LabColor.lab({lightness:this.lightness,a:this.b,b:this.b,alpha:this.alpha,...t}):"alpha"in t?this.opacity(t.alpha):this}}class XYZColor{constructor({x:t,y:e,z:a,alpha:n,whitePoint:s}){Object.defineProperties(this,{x:{value:t},y:{value:e},z:{value:a},alpha:{value:n},whitePoint:{value:s}})}static get D50(){return r}static get D65(){return i}get luminance(){return this.y}adapt(t){if(B(t,this.whitePoint))return this;const[e,a,r]=d(this.toXyzArray(),B(t,XYZColor.D50)?n:s);return new XYZColor({x:e,y:a,z:r,alpha:this.alpha,whitePoint:t})}toXyzArray(){return[this.x,this.y,this.z]}toLab(){const t=(B(this.whitePoint,XYZColor.D65)?this.adapt(XYZColor.D50):this).toXyzArray(),[e,a,n]=t.map((t,e)=>t/r[e]).map(t=>t>.008856?Math.cbrt(t):(903.3*t+16)/116);return LabColor.lab({lightness:(116*a-16)/100,a:500*(e-a),b:200*(a-n),alpha:this.alpha})}toRgb(){const t=(B(this.whitePoint,XYZColor.D65)?this:this.adapt(XYZColor.D65)).toXyzArray();return sRGBColor.linArray(d(t,a))}toXyz(){return this}}Map.prototype.setMany=function(t,e,...a){return this.set(t,e),this.set(e,t),a.forEach(t=>{this.set(t,e)}),this},Map.prototype.getPrimaryKey=function(t){return this.get(this.get(t))};const b=new Map;b.setMany("aliceblue",[240,248,255,208,1,.97,1],"#f0f8ff"),b.setMany("antiquewhite",[250,235,215,34,.78,.91,1],"#faebd7"),b.setMany("cyan",[0,255,255,180,1,.5,1],"#00ffff","aqua","#0ff"),b.setMany("aquamarine",[127,255,212,160,1,.75,1],"#7fffd4"),b.setMany("azure",[240,255,255,180,1,.97,1],"#f0ffff"),b.setMany("beige",[245,245,220,60,.56,.91,1],"#f5f5dc"),b.setMany("bisque",[255,228,196,33,1,.88,1],"#ffe4c4"),b.setMany("black",[0,0,0,0,0,0,1],"#000000","#000"),b.setMany("blanchedalmond",[255,235,205,36,1,.9,1],"#ffebcd"),b.setMany("blue",[0,0,255,240,1,.5,1],"#0000ff","#00f"),b.setMany("blueviolet",[138,43,226,271,.76,.53,1],"#8a2be2"),b.setMany("brown",[165,42,42,0,.59,.41,1],"#a52a2a"),b.setMany("burlywood",[222,184,135,34,.57,.7,1],"#deb887"),b.setMany("cadetblue",[95,158,160,182,.25,.5,1],"#5f9ea0"),b.setMany("chartreuse",[127,255,0,90,1,.5,1],"#7fff00"),b.setMany("chocolate",[210,105,30,25,.75,.47,1],"#d2691e"),b.setMany("coral",[255,127,80,16,1,.66,1],"#ff7f50"),b.setMany("cornflowerblue",[100,149,237,219,.79,.66,1],"#6495ed"),b.setMany("cornsilk",[255,248,220,48,1,.93,1],"#fff8dc"),b.setMany("crimson",[220,20,60,348,.83,.47,1],"#dc143c"),b.setMany("darkblue",[0,0,139,240,1,.27,1],"#00008b"),b.setMany("darkcyan",[0,139,139,180,1,.27,1],"#008b8b"),b.setMany("darkgoldenrod",[184,134,11,43,.89,.38,1],"#b8860b"),b.setMany("darkgray",[169,169,169,0,0,.66,1],"#a9a9a9","darkgrey"),b.setMany("darkgreen",[0,100,0,120,1,.2,1],"#006400"),b.setMany("darkkhaki",[189,183,107,56,.38,.58,1],"#bdb76b"),b.setMany("darkmagenta",[139,0,139,300,1,.27,1],"#8b008b"),b.setMany("darkolivegreen",[85,107,47,82,.39,.3,1],"#556b2f"),b.setMany("darkorange",[255,140,0,33,1,.5,1],"#ff8c00"),b.setMany("darkorchid",[153,50,204,280,.61,.5,1],"#9932cc"),b.setMany("darkred",[139,0,0,0,1,.27,1],"#8b0000"),b.setMany("darksalmon",[233,150,122,15,.72,.7,1],"#e9967a"),b.setMany("darkseagreen",[143,188,143,120,.25,.65,1],"#8fbc8f"),b.setMany("darkslateblue",[72,61,139,248,.39,.39,1],"#483d8b"),b.setMany("darkslategray",[47,79,79,180,.25,.25,1],"#2f4f4f","darkslategrey"),b.setMany("darkturquoise",[0,206,209,181,1,.41,1],"#00ced1"),b.setMany("darkviolet",[148,0,211,282,1,.41,1],"#9400d3"),b.setMany("deeppink",[255,20,147,328,1,.54,1],"#ff1493"),b.setMany("deepskyblue",[0,191,255,195,1,.5,1],"#00bfff"),b.setMany("dimgray",[105,105,105,0,0,.41,1],"#696969","dimgrey"),b.setMany("dodgerblue",[30,144,255,210,1,.56,1],"#1e90ff"),b.setMany("firebrick",[178,34,34,0,.68,.42,1],"#b22222"),b.setMany("floralwhite",[255,250,240,40,1,.97,1],"#fffaf0"),b.setMany("forestgreen",[34,139,34,120,.61,.34,1],"#228b22"),b.setMany("gainsboro",[220,220,220,0,0,.86,1],"#dcdcdc"),b.setMany("ghostwhite",[248,248,255,240,1,.99,1],"#f8f8ff"),b.setMany("gold",[255,215,0,51,1,.5,1],"#ffd700"),b.setMany("goldenrod",[218,165,32,43,.74,.49,1],"#daa520"),b.setMany("gray",[128,128,128,0,0,.5,1],"#808080","grey"),b.setMany("green",[0,128,0,120,1,.25,1],"#008000"),b.setMany("greenyellow",[173,255,47,84,1,.59,1],"#adff2f"),b.setMany("honeydew",[240,255,240,120,1,.97,1],"#f0fff0"),b.setMany("hotpink",[255,105,180,330,1,.71,1],"#ff69b4"),b.setMany("indianred",[205,92,92,0,.53,.58,1],"#cd5c5c"),b.setMany("indigo",[75,0,130,275,1,.25,1],"#4b0082"),b.setMany("ivory",[255,255,240,60,1,.97,1],"#fffff0"),b.setMany("khaki",[240,230,140,54,.77,.75,1],"#f0e68c"),b.setMany("lavender",[230,230,250,240,.67,.94,1],"#e6e6fa"),b.setMany("lavenderblush",[255,240,245,340,1,.97,1],"#fff0f5"),b.setMany("lawngreen",[124,252,0,90,1,.49,1],"#7cfc00"),b.setMany("lemonchiffon",[255,250,205,54,1,.9,1],"#fffacd"),b.setMany("lightblue",[173,216,230,195,.53,.79,1],"#add8e6"),b.setMany("lightcoral",[240,128,128,0,.79,.72,1],"#f08080"),b.setMany("lightcyan",[224,255,255,180,1,.94,1],"#e0ffff"),b.setMany("lightgoldenrodyellow",[250,250,210,60,.8,.9,1],"#fafad2"),b.setMany("lightgray",[211,211,211,0,0,.83,1],"#d3d3d3","lightgrey"),b.setMany("lightgreen",[144,238,144,120,.73,.75,1],"#90ee90"),b.setMany("lightpink",[255,182,193,351,1,.86,1],"#ffb6c1"),b.setMany("lightsalmon",[255,160,122,17,1,.74,1],"#ffa07a"),b.setMany("lightseagreen",[32,178,170,177,.7,.41,1],"#20b2aa"),b.setMany("lightskyblue",[135,206,250,203,.92,.75,1],"#87cefa"),b.setMany("lightslategray",[119,136,153,210,.14,.53,1],"#778899","lightslategrey","#789"),b.setMany("lightsteelblue",[176,196,222,214,.41,.78,1],"#b0c4de"),b.setMany("lightyellow",[255,255,224,60,1,.94,1],"#ffffe0"),b.setMany("lime",[0,255,0,120,1,.5,1],"#00ff00","#0f0"),b.setMany("limegreen",[50,205,50,120,.61,.5,1],"#32cd32"),b.setMany("linen",[250,240,230,30,.67,.94,1],"#faf0e6"),b.setMany("magenta",[255,0,255,300,1,.5,1],"#ff00ff","fuchsia","#f0f"),b.setMany("maroon",[128,0,0,0,1,.25,1],"#800000"),b.setMany("mediumaquamarine",[102,205,170,160,.51,.6,1],"#66cdaa"),b.setMany("mediumblue",[0,0,205,240,1,.4,1],"#0000cd"),b.setMany("mediumorchid",[186,85,211,288,.59,.58,1],"#ba55d3"),b.setMany("mediumpurple",[147,112,219,260,.6,.65,1],"#9370db"),b.setMany("mediumseagreen",[60,179,113,147,.5,.47,1],"#3cb371"),b.setMany("mediumslateblue",[123,104,238,249,.8,.67,1],"#7b68ee"),b.setMany("mediumspringgreen",[0,250,154,157,1,.49,1],"#00fa9a"),b.setMany("mediumturquoise",[72,209,204,178,.6,.55,1],"#48d1cc"),b.setMany("mediumvioletred",[199,21,133,322,.81,.43,1],"#c71585"),b.setMany("midnightblue",[25,25,112,240,.64,.27,1],"#191970"),b.setMany("mintcream",[245,255,250,150,1,.98,1],"#f5fffa"),b.setMany("mistyrose",[255,228,225,6,1,.94,1],"#ffe4e1"),b.setMany("moccasin",[255,228,181,38,1,.85,1],"#ffe4b5"),b.setMany("navajowhite",[255,222,173,36,1,.84,1],"#ffdead"),b.setMany("navy",[0,0,128,240,1,.25,1],"#000080"),b.setMany("oldlace",[253,245,230,39,.85,.95,1],"#fdf5e6"),b.setMany("olive",[128,128,0,60,1,.25,1],"#808000"),b.setMany("olivedrab",[107,142,35,80,.6,.35,1],"#6b8e23"),b.setMany("orange",[255,165,0,39,1,.5,1],"#ffa500"),b.setMany("orangered",[255,69,0,16,1,.5,1],"#ff4500"),b.setMany("orchid",[218,112,214,302,.59,.65,1],"#da70d6"),b.setMany("palegoldenrod",[238,232,170,55,.67,.8,1],"#eee8aa"),b.setMany("palegreen",[152,251,152,120,.93,.79,1],"#98fb98"),b.setMany("paleturquoise",[175,238,238,180,.65,.81,1],"#afeeee"),b.setMany("palevioletred",[219,112,147,340,.6,.65,1],"#db7093"),b.setMany("papayawhip",[255,239,213,37,1,.92,1],"#ffefd5"),b.setMany("peachpuff",[255,218,185,28,1,.86,1],"#ffdab9"),b.setMany("peru",[205,133,63,30,.59,.53,1],"#cd853f"),b.setMany("pink",[255,192,203,350,1,.88,1],"#ffc0cb"),b.setMany("plum",[221,160,221,300,.47,.75,1],"#dda0dd"),b.setMany("powderblue",[176,224,230,187,.52,.8,1],"#b0e0e6"),b.setMany("purple",[128,0,128,300,1,.25,1],"#800080"),b.setMany("rebeccapurple",[102,51,153,270,.5,.4,1],"#663399","#639"),b.setMany("red",[255,0,0,0,1,.5,1],"#ff0000","#f00"),b.setMany("rosybrown",[188,143,143,0,.25,.65,1],"#bc8f8f"),b.setMany("royalblue",[65,105,225,225,.73,.57,1],"#4169e1"),b.setMany("saddlebrown",[139,69,19,25,.76,.31,1],"#8b4513"),b.setMany("salmon",[250,128,114,6,.93,.71,1],"#fa8072"),b.setMany("sandybrown",[244,164,96,28,.87,.67,1],"#f4a460"),b.setMany("seagreen",[46,139,87,146,.5,.36,1],"#2e8b57"),b.setMany("seashell",[255,245,238,25,1,.97,1],"#fff5ee"),b.setMany("sienna",[160,82,45,19,.56,.4,1],"#a0522d"),b.setMany("silver",[192,192,192,0,0,.75,1],"#c0c0c0"),b.setMany("skyblue",[135,206,235,197,.71,.73,1],"#87ceeb"),b.setMany("slateblue",[106,90,205,248,.53,.58,1],"#6a5acd"),b.setMany("slategray",[112,128,144,210,.13,.5,1],"#708090","slategrey"),b.setMany("snow",[255,250,250,0,1,.99,1],"#fffafa"),b.setMany("springgreen",[0,255,127,150,1,.5,1],"#00ff7f"),b.setMany("steelblue",[70,130,180,207,.44,.49,1],"#4682b4"),b.setMany("tan",[210,180,140,34,.44,.69,1],"#d2b48c"),b.setMany("teal",[0,128,128,180,1,.25,1],"#008080"),b.setMany("thistle",[216,191,216,300,.24,.8,1],"#d8bfd8"),b.setMany("tomato",[255,99,71,9,1,.64,1],"#ff6347"),b.setMany("turquoise",[64,224,208,174,.72,.56,1],"#40e0d0"),b.setMany("violet",[238,130,238,300,.76,.72,1],"#ee82ee"),b.setMany("wheat",[245,222,179,39,.77,.83,1],"#f5deb3"),b.setMany("white",[255,255,255,0,0,1,1],"#ffffff","#fff"),b.setMany("whitesmoke",[245,245,245,0,0,.96,1],"#f5f5f5"),b.setMany("yellow",[255,255,0,60,1,.5,1],"#ffff00","#ff0"),b.setMany("yellowgreen",[154,205,50,80,.61,.5,1],"#9acd32"),b.setMany("transparent",[0,0,0,0,0,0,0]);class sRGBColor{constructor({red:t,green:e,blue:a,hue:n,saturation:s,lightness:r,alpha:h}){Object.defineProperties(this,{red:{value:t},green:{value:e},blue:{value:a},hue:{value:n},saturation:{value:s},lightness:{value:r},alpha:{value:h},whitePoint:{value:i}})}static rgb({red:t,green:e,blue:a,alpha:n}){const s=L(t),r=L(e),i=L(a);if(!p(s,r,i))return;const l=X(h,s),o=X(h,r),u=X(h,i),f=Math.min(l,o,u),c=Math.max(l,o,u),y=c-f;let g;g=0===y?0:c===l?(o-u)/y:c===o?(u-l)/y+2:(l-o)/y+4;const b=(c+f)/2,d=A(y,b);return new sRGBColor({red:s,green:r,blue:i,hue:R(60*g),saturation:d,lightness:G(b),alpha:$(n)})}static rgbArray([t,e,a,n]){return sRGBColor.rgb({red:t,green:e,blue:a,alpha:n})}static lin({red:t,green:e,blue:a,alpha:n}){const s=[t,e,a].map(t=>t>.0031308?t**(1/2.4)*1.055-.055:12.92*t).map(t=>255*t).concat(n);return sRGBColor.rgbArray(s)}static linArray([t,e,a,n]){return sRGBColor.lin({red:t,green:e,blue:a,alpha:n})}static hsl({hue:t,saturation:e,lightness:a,alpha:n}){const s=R(t),r=G(e),i=G(a);if(!p(s,r,i))return;const h=(1-Math.abs(2*i-1))*r,l=h*(1-Math.abs(s/60%2-1)),o=i-h/2;let u=0,f=0,c=0;return s>=0&&s<60?(u=h,f=l,c=0):s>=60&&s<120?(u=l,f=h,c=0):s>=120&&s<180?(u=0,f=h,c=l):s>=180&&s<240?(u=0,f=l,c=h):s>=240&&s<300?(u=l,f=0,c=h):s>=300&&s<360&&(u=h,f=0,c=l),new sRGBColor({red:L(255*(u+o)),green:L(255*(f+o)),blue:L(255*(c+o)),hue:s,saturation:r,lightness:i,alpha:$(n)})}static hslArray([t,e,a,n]){return sRGBColor.hsl({hue:t,saturation:e,lightness:a,alpha:n})}static hwb({hue:t,whiteness:e,blackness:a,alpha:n}){const s=G(e),r=G(a),i=(1-s+r)/2,h=A(1-s-r,i);return sRGBColor.hsl({hue:R(t),saturation:h,lightness:i,alpha:n})}static hwbArray([t,e,a,n]){return sRGBColor.hwb({hue:t,whiteness:e,blackness:a,alpha:n})}get luminance(){return this.toXyz().y}get mode(){return+(this.luminance<.25)}get hueGroup(){return m(Math.floor((this.hue+15)%360/30)+1,11)}get hueGroupOffset(){return m(this.hue%30+15,30)}get hrad(){return w(this.hue*(Math.PI/180),7)}get hgrad(){return w(this.hue/.9,7)}get hturn(){return w(this.hue/360,7)}get name(){const t=function(t){if("string"==typeof t)return b.getPrimaryKey(t.toLowerCase())}(this.toHexString().substring(0,7));return 1!==this.alpha&&t?t+"*":t}toLin(){return[this.red,this.green,this.blue].map(t=>{const e=t/255;return w(e<.04045?e/12.92:((e+.055)/1.055)**2.4,7)})}toHwb(){const t=[this.red,this.green,this.blue].map(t=>t/255);return[this.hue,w(Math.min(...t),7),w(1-Math.max(...t),7),this.alpha]}toXyz(t=this.whitePoint){const[a,n,s]=d(this.toLin(),e).map(t=>w(t,7));return new XYZColor({x:a,y:M(l,n),z:s,alpha:this.alpha,whitePoint:this.whitePoint}).adapt(t)}toLab(){return this.toXyz(r).toLab()}toRgb(){return this}toGrayscale(){if(0===this.saturation)return this;const t=this.luminance>.0393?255*(this.luminance**(1/2.4)*1.055-.055):3294.6*this.luminance;return sRGBColor.rgb({red:t,green:t,blue:t,alpha:this.alpha})}toRgbString(t="absolute"){const e="relative"===t?w(100*X(h,this.red),1)+"%":this.red,a="relative"===t?w(100*X(h,this.green),1)+"%":this.green,n="relative"===t?w(100*X(h,this.blue),1)+"%":this.blue;return this.alpha<1?`rgb(${e} ${a} ${n} / ${this.alpha})`:`rgb(${e} ${a} ${n})`}toHexString(){return`#${Z(this.red)}${Z(this.green)}${Z(this.blue)}${this.alpha<1?Z(Math.round(255*this.alpha)):""}`}toHslString(t=1){return this.alpha<1?`hsl(${w(this.hue,t)}deg ${w(100*this.saturation,t)}% ${w(100*this.lightness,t)}% / ${this.alpha})`:`hsl(${w(this.hue,t)}deg ${w(100*this.saturation,t)}% ${w(100*this.lightness,t)}%)`}toHwbString(t=1){const[e,a,n]=this.toHwb();return this.alpha<1?`hwb(${w(e,t)}deg ${w(100*a,t)}% ${w(100*n,t)}% / ${this.alpha})`:`hwb(${w(e,t)}deg ${w(100*a,t)}% ${w(100*n,t)}%)`}opacity(t=1){return this.alpha===t?this:new sRGBColor({red:this.red,green:this.green,blue:this.blue,hue:this.hue,saturation:this.saturation,lightness:this.lightness,alpha:$(t)})}invert(){return sRGBColor.rgb({red:255-this.red,green:255-this.green,blue:255-this.blue,alpha:this.alpha})}copyWith(t){return"red"in t||"blue"in t||"green"in t?sRGBColor.rgb({red:this.red,green:this.green,blue:this.blue,alpha:this.alpha,...t}):"hue"in t||"saturation"in t||"lightness"in t?sRGBColor.hsl({hue:this.hue,saturation:this.saturation,lightness:this.lightness,alpha:this.alpha,...t}):"alpha"in t?this.opacity(t.alpha):this}adjust(t){return"red"in t||"blue"in t||"green"in t?sRGBColor.rgb({red:this.red+(G(t.red)||0)*this.red,green:this.green+(G(t.green)||0)*this.green,blue:this.blue+(G(t.blue)||0)*this.blue,alpha:this.alpha+(G(t.alpha)||0)*this.alpha}):"hue"in t||"saturation"in t||"lightness"in t?sRGBColor.hsl({hue:(this.hue||360)+(G(t.hue)||0)*this.hue,saturation:this.saturation+(G(t.saturation)||0)*this.saturation,lightness:this.lightness+(G(t.lightness)||0)*this.lightness,alpha:this.alpha+(G(t.alpha)||0)*this.alpha}):"alpha"in t?this.opacity(this.alpha+(G(t.alpha)||0)*this.alpha):this}}function d(t,e){return t.map((t,a,n)=>n.reduce((t,n,s)=>t+n*e[a][s],0))}function M(t,e){return(e=+e)<t[0]?t[0]:e>t[1]?t[1]:e}function p(...t){return t.every(t=>t||!t&&0==t)}function m(t,e){return(+t%+e+ +e)%+e}function w(t,e=12){return+(+(t*10**e).toFixed(0)*10**-e).toFixed(e<0?0:e)}function C(t,e=12){return null==t||Array.isArray(t)?NaN:(t=t.toString(),t=/%$/.test(t)?+t.slice(0,-1)/100:+t,void 0!==e&&(t=w(t,e)),t)}function $(t){return p(t)?M(l,C(t,4)):1}function v(t){return M(o,w(t,7))}function k(t){return M(u,w(t,7))}function R(t){if("number"==typeof t)return w(m(t,360),7);if("string"!=typeof t)return NaN;const e=(t=t.trim().toLowerCase()).match(/^([+\-0-9e.]+)(turn|g?rad|deg)?$/);if(!e)return NaN;switch(e[2]=e[2]||"deg",e[2]){case"turn":e[1]*=360;break;case"rad":e[1]*=180/Math.PI;break;case"grad":e[1]*=.9;break;case"deg":break;default:return NaN}return w(m(e[1],360),7)}function G(t){return"number"==typeof t?M(l,w(t,7)):"string"==typeof t&&/%$/.test(t)?M(l,C(t,7)):NaN}function L(t){return"number"==typeof t?M(h,w(t,0)):"string"!=typeof t?NaN:M(h,/%$/.test(t)?function(t,e){return t[0]+ +e*(t[1]-t[0])}(h,C(t,0)):w(t,0))}function B(t,e){return t.every((t,a)=>e[a]===t)}function x(t,e){return(t.exec(e.toLowerCase())||[]).filter((t,e)=>e&&!!t)}function z(t,e){return x(new RegExp(`^${"rgb"===t||"hsl"===t?t+"a?":t}${y.source}`),e)}function P(t,e){return x(new RegExp(`^${"rgb"===t||"hsl"===t?t+"a?":t}${g.source}`),e)}function X(t,e){return(+e-t[0])/(t[1]-t[0])}function A(t,e){let a;return a=e>0&&e<=.5?t/(2*e):t/(2-2*e||e),G(a)}function Y(t){return parseInt(1===t.length?t.repeat(2):t.substring(0,2),16)}function Z(t){return(t=M(h,t)).toString(16).padStart(2,"0")}function N(t,e,a=0){return+Math.abs(t-e).toFixed(12)<=a}function S(t){return t instanceof sRGBColor||t instanceof LabColor||t instanceof XYZColor}function q(t="#fff",e,a=2){const n=S(t)?t:W(t);if(!n)return;if(1!==n.alpha)throw SyntaxError("Base color cannot be semitransparent.");if(arguments.length<2){const t=(t,e=2)=>q(n,t,e);return t.find=t=>q.find(n,t),t.min=t=>q.min(n,t),t.max=t=>q.max(n,t),t.validate=t=>q.validate(n,t),t}const s=e instanceof sRGBColor?e:W(e),r=Math.min(s.luminance,n.luminance),i=Math.max(s.luminance,n.luminance);return w((i+.05)/(r+.05),a)}function W(t){if("object"==typeof t){if(p(t.red,t.green,t.blue))return sRGBColor.rgb(t);if(p(t.hue,t.saturation,t.lightness))return sRGBColor.hsl(t);if(p(t.hue,t.whiteness,t.blackness))return sRGBColor.hwb(t);if(p(t.x,t.y,t.z))return new XYZColor(t);if(p(t.lightness,t.a,t.b))return LabColor.lab(t);if(p(t.lightness,t.chroma,t.hue))return LabColor.lch(t)}if("string"==typeof t){if(t=t.trim().toLowerCase(),b.has(t)){const[e,a,n,s,r,i,h]=function(t){if("string"==typeof t)return b.get(t.toLowerCase())}(t);return new sRGBColor({red:e,green:a,blue:n,hue:s,saturation:r,lightness:i,alpha:h})}if(t.startsWith("#")){const e=x(t.length>5?f:c,t).map(Y);return e[3]=w(e[3]/255,7),sRGBColor.rgbArray(e)}if(t.startsWith("rgb"))return sRGBColor.rgbArray(t.includes(",")?z("rgb",t):P("rgb",t));if(t.startsWith("hsl"))return sRGBColor.hslArray(t.includes(",")?z("hsl",t):P("hsl",t));if(t.startsWith("hwb"))return sRGBColor.hwbArray(P("hsl",t));if(t.startsWith("lab"))return LabColor.labArray(P("lab",t));if(t.startsWith("lch"))return LabColor.lchArray(P("lch",t))}}return q.find=(t,{targetContrast:e=7,hue:a,saturation:n=1})=>{const s=S(t)?t:W(t);if(!s)return;let r,i=0,h=1,l=0,o=0;for(;o<=7;){if(r=sRGBColor.hsl({hue:a,saturation:n,lightness:(h+i)/2}),l=q(s,r),N(l,e,.015))return r;l>e&&r.luminance>s.luminance||l<e&&r.luminance<s.luminance?h=(h+i)/2:i=(h+i)/2,o+=1}return r},q.min=(t,e)=>{const a=S(t)?t:W(t);if(!a)return;let n,s=22;return e.forEach(t=>{const e=W(t);if(!t)return;const r=q(a,e);r<s&&(n=e,s=r)}),n},q.max=(t,e)=>{const a=S(t)?t:W(t);if(!a)return;let n,s=0;return e.forEach(t=>{const e=W(t);if(!t)return;const r=q(a,e);r>s&&(n=e,s=r)}),n},q.validate=(t,e)=>{const a=Math.floor(100*q(t,e,7))/100;return{"wcag-aa-normal-text":a>=4.5,"wcag-aa-large-text":a>=3,"wcag-aa-ui":a>=3,"wcag-aaa-normal-text":a>=7,"wcag-aaa-large-text":a>=4.5}},t.LabColor=LabColor,t.XYZColor=XYZColor,t.color=W,t.contrast=q,t.gray=function(t,e=1){return LabColor.lab({lightness:t,a:0,b:0,alpha:e})},t.mix=function(t,e,a=.5){const n=(S(t)?t:W(t)).toRgb(),s=(S(e)?e:W(e)).toRgb();if(!n&&!s)return;if(!n)return s;if(!s)return n;const r=s.alpha*G(a);return sRGBColor.rgb({red:n.red+r*(s.red-n.red),green:n.green+r*(s.green-n.green),blue:n.blue+r*(s.blue-n.blue),alpha:Math.max(n.alpha,w(r,7))})},t.mixLab=function(t,e,a=.5){const n=(S(t)?t:W(t)).toLab(),s=(S(e)?e:W(e)).toLab();if(!n&&!s)return;if(!n)return s;if(!s)return n;const r=s.alpha*G(a);return LabColor.lch({lightness:n.lightness+r*(s.lightness-n.lightness),chroma:n.chroma+r*(s.chroma-n.chroma),hue:n.hue+r*(s.hue-n.hue),alpha:Math.max(n.alpha,w(r,7))})},t.sRGBColor=sRGBColor,t}({});