/*////////////////////////////////////////////////////////////////////////////////////////
swfIN 2.4.0 - 2010-07-26
javascript toolkit for flash developers
© 2005-2010 Francis Turmel | swfIN.nectere.ca | www.nectere.ca | francis@nectere.ca
released under the MIT license
/*////////////////////////////////////////////////////////////////////////////////////////
/**
* swfIN constructor
* Note: width and height can be either Numbers or Strings (for percentage: "100%")
* @param {String} swfPath
* @param {String} swfID
* @param {String} width
* @param {String} height
*/
if( typeof swfIN == "undefined" ){
var swfIN = function(swfPath, swfID, width, height){
//init
this.params = [];
this.flashVars = [];
this.swfPath = swfPath;
this.swfID = swfID;
this.containerDivID = "div_" + swfID;
this.width = String(width);
this.height = String(height);
this.scrollbarWidth = null;
this.scrollbarHeight = null;
this.requiredVersion = [0,0,0];
this.redirectURL = null;
this.redirectUseParams = false;
this.xiPath = null;
this.xiWidth = null;
this.xiHeight = null;
this.is_written = false;
this.showDivName = null;
this.showDivStyleMemory = null;
this.isUsingMacMousewheel = false;
//init windows resize & array proto, but only once!
swfIN._static.init();
}
swfIN.prototype = {
/**
* Add an embed param
* @param {String} name
* @param {Object} val
* @return {void}
*/
addParam: function(name, val){
if(name != "") this.params[name] = val;
},
/**
* Adds multiple embed params
* @param {Object} params
* @return {void}
*/
addParams: function(params){
for(var i in params){
if(params.hasOwnProperty(i)) this.addParam(i, params[i]);
}
},
/**
* Add a flashVar
* @param {String} name
* @param {Object} val
* @return {void}
*/
addVar: function(name, val){
if(name != "") this.flashVars[name] = val;
},
/**
* Add multiple flashVars. Note: works well with swfIN.utils.getAllQueryParams()
* @param {Object} vars
* @return {void}
*/
addVars: function(vars){
for(var i in vars){
if(vars.hasOwnProperty(i)) this.addVar(i, vars[i]);
}
},
/**
* Set the size at which the browser scrollbar will take over. Old minSize() method.
* Can be used after write()
* @param {Number} width
* @param {Number} height
* @return {void}
*/
scrollbarAt: function(width, height){
this.scrollbarWidth = width;
this.scrollbarHeight = height;
if( this.isWritten() ) this.refresh();
},
/**
* Resize the embeded SWF
* Cam be used after write()
* @param {Number} width
* @param {Number} height
* @return {void}
*/
resize: function(width, height){
this.width = width;
this.height = height;
if( this.isWritten() ) this.refresh();
},
/**
* Set the required Flash version, and optional redirect infos
* LEGACY - use detectRedirect
* @param {Array} requiredVersion
* @param {String} redirectURL
* @param {Boolean} redirectUseParams
* @return {void}
*/
detect: function(requiredVersion, redirectURL, redirectUseParams){
this.detectRedirect(requiredVersion, redirectURL, redirectUseParams);
},
/**
* Set the required Flash version. Will redirect to a URL with optional querystring params if Flash requirements are not met.
* @param {Array} requiredVersion
* @param {String} redirectURL
* @param {Boolean} redirectUseParams
* @return {void}
*/
detectRedirect: function(requiredVersion, redirectURL, redirectUseParams){
this.requiredVersion = requiredVersion;
this.redirectURL = redirectURL;
this.redirectUseParams = redirectUseParams || false;
},
/**
* Set the required Flash version. Will destroy the specified div if Flash requirements are met.
* @param {Array} requiredVersion
* @param {String} showDivName
* @param {Boolean} autoHide (optional, defaults to true)
*/
detectShowDiv: function(requiredVersion, showDivName, autoHide){
this.requiredVersion = requiredVersion;
this.showDivName = showDivName;
},
/**
* Indicates the use of express install by specifying the path the to xi.swf to use
* Optional width/height
* @param {String} xiPath
* @param {Number} width
* @param {Number} height
* @return {void}
*/
useExpressInstall: function(xiPath, width, height){
this.xiPath = xiPath;
this.xiWidth = width;
this.xiHeight = height;
},
/**
* Shortcut to init SWFAddress
* @return {void}
*/
useSWFAddress: function(){
if( typeof SWFAddress != "undefined" ){
SWFAddress.setId( this.getSWFID() );
}else{
this._error( "Can't find SWFAddress. Remove the .useSWFAddress() call if you're not using it.");
}
},
/**
* Required to reroute mousewheel events to swf (for mac support)
* @return {void}
*/
useMacMousewheel: function(){
this.isUsingMacMousewheel = true;
},
/**
* Helper for ExternalInterface callbacks
* @param {String} funk
* @return {*}
*/
callback: function(funk){
var o = this.getSWFRef();
var a = arguments;
var f = funk;
var expression = "";
for( var i = 1; i < arguments.length; i++){
expression += (i == 1) ? "a["+i+"]" : ", a["+i+"]";
}
var result = null;
try{
if (o[f]){
result = eval("o[f](" + expression + ");");
}else{
this._error("callback function \"" + funk + "\" does not exist");
}
}catch(err){
this._error("callback function \"" + funk + "\" failed");
}
return result;
},
/**
* Write the html tags!
* @return {void}
*/
write: function(){
//decide action to take
if( !swfIN.detect.isPlayerVersionValid(this.requiredVersion) && swfIN.detect.isPlayerVersionValid(swfIN._memory.expressInstallVersion) && this.xiPath != null && swfIN.utils.getQueryParam("detect") != "false" ){
//embed the express install swf
//NOTE: if the express install process fails or the user selects "no", the swfIN._static.expressInstallFailed() method will be called
//and will allow for a redirection or hidden div
//express install flashVars
document.title = document.title.slice(0, 47) + " - Flash Player Installation";
this.addVar("MMdoctitle", document.title);
this.addVar("MMplayerType", ( swfIN.detect.nsPlugin() ) ? "PlugIn": "ActiveX");
this.addVar("MMredirectURL", window.location);
//change swfPath and width/height
//TODO: make the min size check for express install work with % - tie it with _calculateWidth() etc..
this.width = this.xiWidth || this.width;
if(this.width < swfIN._memory.expressInstallMinSize.w) this.width = swfIN._memory.expressInstallMinSize.w;
this.height = this.xiHeight || this.height;
if(this.height < swfIN._memory.expressInstallMinSize.h) this.height = swfIN._memory.expressInstallMinSize.h;
this.swfPath = this.xiPath;
//embed express install swf
document.write( this.getHTML() );
//flag as written
this.is_written = true;
}else if ( swfIN.detect.isPlayerVersionValid(this.requiredVersion) || swfIN.utils.getQueryParam("detect") == "false" ){
//Flash player OK or detect == false, embed the SWF normally
document.write( this.getHTML() );
//flag as written
this.is_written = true;
}else if( this.redirectURL != null ){
//redirect to noFlash url
var url = ( this.redirectUseParams ) ? this.redirectURL + "?required=" + this.requiredVersion.join(".") + "&installed=" + swfIN.detect.getPlayerVersionString() : this.redirectURL;
location.href = url;
}
if (this.isWritten()) {
if( this.showDivName ){
var style = swfIN.utils.$(this.showDivName).style;
this.showDivStyleMemory = {visibility:style.visibility, position:style.position};
swfIN.utils.$hide(this.showDivName);
}
//check for all possible conflicts
this._checkForConflicts();
//push a reference to the swfIN instance
swfIN._memory.swf_stack.push(this);
//refresh size
//TODO: will this fix the IE6 table bug, or only the old innerHTML trick will work? Do we still need this?
this.refresh();
//form fix
this._formFix();
}else{
if( this.showDivName ){
var style = swfIN.utils.$(this.showDivName).style;
style.visibility = this.showDivStyleMemory.visibility;
style.position = this.showDivStyleMemory.position;
}
}
},
/**
* Checks if this swfIN instance has been written
* @return {Boolean}
*/
isWritten: function(){
return this.is_written;
},
/**
* Clear and hide the SEO div
* @param {String} seoDiv
* @return {void}
*/
hideSEO: function(seoDiv){
swfIN.utils.$delete(seoDiv);
/*
//old stuff
var div = swfIN.utils.$(seoDiv);
div.innerHTML = "";
div.style.display = "none";
*/
},
/**
* Returns the container div's ID as a String
* @return {String}
*/
getDivID: function(){
return this.containerDivID;
},
/**
* Returns the container div's reference (Object / HTMLDivElement)
* @return {HTMLDivElement}
*/
getDivRef: function(){
return swfIN.utils.$( this.getDivID() );
},
/**
* Returns the embedded SWF's ID as a String
* return {String}
*/
getSWFID: function(){
return this.swfID;
},
/**
* Returns the embedded SWF's reference (Object / HTMLDivElement)
* @return {HTMLDivElement}
*/
getSWFRef: function(){
return swfIN.utils.$( this.getSWFID() );
},
/**
* Refresh display and calculates if scrollbars are needed
* @return {void}
*/
refresh: function(){
var div = this.getDivRef();
div.style.width = this._calculateWidth();
div.style.height = this._calculateHeight();
if(this.scrollbarWidth) div.style["min-width"] = this.scrollbarWidth + "px";
if(this.scrollbarHeight) div.style["min-height"] = this.scrollbarHeight + "px";
},
/**
* Returns the HTML code to be written for the embedding
* @return {String}
*/
getHTML: function(){
//flashvars
var fv = "";
for(var i in this.flashVars){
if(this.flashVars.hasOwnProperty(i)){
var mod = (fv == "") ? "" : "&";
fv += mod + i + "=" + escape(this.flashVars[i]);
}
}
//params default
var p = {};
p["movie"] = this.swfPath;
p["quality"] = "high";
p["menu"] = "false";
p["swLiveConnect"] = "true";
p["pluginspage"] = swfIN._memory.player_download;
p["allowScriptAccess"] = "always";
p["FlashVars"] = fv;
//override default with user defined params
for(var i in this.params){
if (this.params.hasOwnProperty(i)) p[i] = this.params[i];
}
//object attributes
var a = {data:this.swfPath, name:this.swfID, id:this.swfID, width:"100%", height:"100%", align:"top", hspace:0, vspace:0};
if( swfIN.detect.ie() ){
a.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
}else{
a.type = "application/x-shockwave-flash";
}
//build the object tag
var tag = "<object ";
//attributes
for(var i in a){
if (a.hasOwnProperty(i)) tag += " " + i + "='"+a[i]+"'";
}
tag += ">"
//params
for(var i in p){
if (p.hasOwnProperty(i)) tag += "<param name='"+i+"' value='"+p[i]+"'>";
}
tag += "</object>";
//output
var minValues = (this.scrollbarWidth > 0 && this.scrollbarHeight > 0) ? "min-width:"+this.scrollbarWidth + "px; min-height:"+this.scrollbarHeight+"px" : "" ;
tag = "<div id='"+this.containerDivID+"' style='width:"+ this._calculateWidth() +"; height:"+ this._calculateHeight() + "; "+ minValues +"'>" + tag + "</div>";
return tag;
},
//#######################################################
//private - misc
/**
* Fixes callbacks when SWF is inside a form in IE
* @return {void}
*/
_formFix: function(){
if( swfIN.detect.ie() ){
window[ this.getSWFID() ] = document[ this.getSWFID() ];
}
},
/**
* Returns good value to use for width
* @return {String}
*/
_calculateWidth: function(){
return this._sizeHelper("Width");
},
/**
* Returns good value to use for height
* @return {String}
*/
_calculateHeight: function(){
return this._sizeHelper("Height");
},
/**
* Internal helper to calculate width and height
* @param {String} type
* @return {String}
*/
_sizeHelper: function( type ){
var scrollbar = String( this["scrollbar" + type] );
var res = String( this[type.toLowerCase()] );
if ( scrollbar != null && res.indexOf("%") > -1 ){
var pixelVal = swfIN.detect.getBrowserSize()[type.substr(0,1).toLowerCase()] * ( res.split("%")[0] / 100);
res = ( scrollbar > pixelVal ) ? scrollbar : res;
}
return ( res.indexOf("%") > -1 ) ? res : res + "px" ;
},
/**
* Checks if everything is in place to properly embed. Most of these warnings are meant to be alerts for devs
* @return {void}
*/
_checkForConflicts: function(){
//swfID and container ID cannot be empty, no more auto-generation
if(this.swfID == null) this._error("The swf's id cannot be empty");
if(this.containerDivID == null) this._error("The container div's id cannot be empty");
//make sure there is no spaces or illegal chars in the ids
if(this.swfID.indexOf(" ") > -1) this._error("The swf's id cannot contain spaces");
if(this.containerDivID.indexOf(" ") > -1) this._error("The container div's id cannot contain spaces");
//swfID and containerID cannot be the same
if( this.getDivID() == this.getSWFID() ) this._error("You cannot name swfs or divs by the same id. Please revise the ids currently in use.");
//... and troughout all swfIN instances
var movies = swfIN._memory.swf_stack;
for (var i=0; i<movies.length; i++){
if( movies[i].getDivID() == this.getDivID() ||
movies[i].getDivID() == this.getSWFID() ||
movies[i].getSWFID() == this.getDivID() ||
movies[i].getSWFID() == this.getSWFID() ){
this._error("You cannot name swfs or divs by the same id. Please revise the ids currently in use.");
}
}
},
/**
* Simple debug alert() call to warn devs about common integration errors
* @param {String} msg
* @return {void}
*/
_error: function(msg){
//alert("swfIN error!\n"+msg);
//throw "swfIN error!\n" + msg;
try{
console.error("swfIN error!\n" + msg);
}catch(e){}
}
}
//###############################################################################
//private static methods package
swfIN._static = {
/**
* Init, only called once by the first swfIN instance to set the Array.push() mixin and the window.resize event handler
* @return {void}
*/
init: function(){
if( !swfIN._memory.is_init ){
//Array.push() prototype for IE5 on Mac
if (Array.prototype.push == null){
Array.prototype.push=function(val){
this[this.length]=val;
return this.length;
}
}
//add listeners for mac mousehweel support
if( swfIN.detect.mac() ){
swfIN.utils.addEventListener(window, "DOMMouseScroll", swfIN._static.sendMousewheel);
swfIN.utils.addEventListener(document, "mousewheel", swfIN._static.sendMousewheel);
}
//add a listener to the window's resize event
swfIN.utils.addEventListener(window, "resize", swfIN._static.refreshAll);
//flag as init
swfIN._memory.is_init = true;
}
},
/**
* Refreshed the sizes of all written swfIN instances
* Called by the window.resize
* @return {void}
*/
refreshAll: function(){
//refresh all instances
var movies = swfIN._memory.swf_stack;
for (var i=0; i<movies.length; i++){
var m = movies[i];
if( m.isWritten() ) m.refresh();
}
},
/**
* Captures mouse events and routes them to all swfs
* Only activated on mac
* @param {Event} event
* @return {void}
*/
sendMousewheel: function( event ){
//figure out proper delta
var delta = 0;
if (event.wheelDelta) {
delta = event.wheelDelta / 40;
} else if (event.detail) {
delta = -event.detail;
}
//if delta is not 0, sent to all swfIN instances that are set to receive the event
if (delta) {
var movies = swfIN._memory.swf_stack;
for (var i=0; i<movies.length; i++){
var m = movies[i];
if( m.isWritten() && m.isUsingMacMousewheel ){
m.callback("externalMouseEvent", delta);
}
}
}
//stop event bubbling
//if(event.preventDefault) event.preventDefault();
//event.returnValue = false;
},
/**
* Called from xi.swf
* User clicked "no" in the prompt or the minimum os/flash version requirements for express install weren't met
* @return {void}
*/
expressInstallFailed: function(){
var movies = swfIN._memory.swf_stack;
for(var i in movies){
if (movies.hasOwnProperty(i)){
var m = movies[i];
swfIN.utils.$delete( m.getDivID() );
m.is_written = false;
movies = swfIN.utils.splice(movies, i, 1);
swfIN._memory.swf_stack = movies;
m.xiPath = null;
m.write();
}
}
}
}
//###############################################################################
//private static vars package
swfIN._memory = {
swf_stack: [],
is_init: false,
player_download: "http://get.adobe.com/flashplayer/",
user_agent: navigator.userAgent.toLowerCase(),
expressInstallMinSize:{w:214, h:137},
expressInstallVersion: [6,0,65],
fullscreenModeVersion: [9,0,28],
vistaVersion: [9,0,28]
}
//###############################################################################
//DETECT LIB
swfIN.detect = {
/**
* Returns an array of ints [major, minor, rev]
* taken from swfObject 1.5 with some minor adjustments
* @return {Array}
*/
getPlayerVersion: function(){
var v = [0,0,0];
var axo;
if(navigator.plugins && navigator.mimeTypes.length){
var x = navigator.plugins["Shockwave Flash"];
if(x && x.description) {
v = x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
}
}else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0){ // if Windows CE
axo = 1;
var counter = 3;
while(axo) {
try {
counter++;
axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+ counter);
v = [counter,0,0];
} catch (e) {
axo = null;
}
}
} else { // Win IE (non mobile)
// do minor version lookup in IE, but avoid fp6 crashing issues
// see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
try{
axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
}catch(e){
try {
axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
v = [6,0,21];
axo.AllowScriptAccess = "always"; // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this code)
} catch(e) {
if (v[0] == 6) {
return v;
}
}
try {
axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
} catch(e) {}
}
if (axo != null) {
v = axo.GetVariable("$version").split(" ")[1].split(",");
}
}
return v;
},
/**
* Takes an array of ints [major, minor, rev]
* taken from swfObject 1.5 with some minor adjustments
* @param {Array} required
* @return {Boolean}
*/
isPlayerVersionValid: function(required){
var current = swfIN.detect.getPlayerVersion();
if(current[0] < required[0]) return false;
if(current[0] > required[0]) return true;
if(current[1] < required[1]) return false;
if(current[1] > required[1]) return true;
if(current[2] < required[2]) return false;
return true;
},
/**
* Returns a string in the format "9.0.47", for display purposes only
* @return {String}
*/
getPlayerVersionString: function(){
return swfIN.detect.getPlayerVersion().join(".");
},
/**
* Is Netscape 4?
* @return {Boolean}
*/
ns4: function(){
return (document.layers != null);
},
/**
* Is IE5 on Mac?
* @return {Boolean}
*/
ie5_mac: function(){
return (swfIN._memory.user_agent.indexOf("msie 5") != -1 && swfIN._memory.user_agent.indexOf("mac") != -1);
},
/**
* Is IE7?
* @return {Boolean}
*/
ie7: function(){
return (swfIN._memory.user_agent.indexOf("msie 7") != -1);
},
/**
* Is IE?
* @return {Boolean}
*/
ie: function(){
return (swfIN._memory.user_agent.indexOf("msie") != -1);
},
/**
* Is Webkit? (Safari, Chrome)
* @return {Boolean}
*/
webkit: function(){
return (swfIN._memory.user_agent.indexOf("webkit") != -1);
},
/**
* Is Opera?
* @return {Boolean}
*/
opera: function(){
return (window.opera != null);
},
/**
* Mac platform?
* @return {Boolean}
*/
mac: function(){
return (swfIN._memory.user_agent.indexOf("mac") != -1);
},
/**
* Does this browser support the netscape plugin architecture (ie: not activex)
* Used for Express Install
* @return {Boolean}
*/
nsPlugin: function(){
return (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length > 0);
},
/**
* Get width and height of browser (supports old browsers)
* Returns an object {w:1, h:1}
* @return {Object}
*/
getBrowserSize: function(){
if (self.innerWidth){
return {w: self.innerWidth, h: self.innerHeight};
}else if (document.documentElement && document.documentElement.clientWidth){
return {w: document.documentElement.clientWidth, h: document.documentElement.clientHeight};
}else if (document.body){
return {w: document.body.clientWidth, h: document.body.clientHeight};
}else{
return {w:null, h:null};
}
},
/**
* Full screen size
* Returns an object {w:1, h:1}
* @return {Object}
*/
getFullScreenSize: function(){
return {w: screen.width, h: screen.height};
},
/**
* Available screen size
* Returns an object {w:1, h:1}
* @return {Object}
*/
getAvailScreenSize: function(){
return {w: screen.availWidth, h: screen.availHeight};
}
}
//###############################################################################
//UTILS LIB
swfIN.utils = {
/**
* Prototype-like wrapper, returns a reference to an HTML element based on ID
* @param {String} id
* @return {HTMLDivElement}
*/
$: function(id){
return document.getElementById(id);
},
/**
* Wrapper to delete a tag by ID
* @param {String} id
* @return {void}
*/
$delete: function(id){
var o = swfIN.utils.$(id);
o.parentNode.removeChild(o);
},
/**
* Sets an element's visibility to hidden
* @param {String} id
* @return {void}
*/
$hide: function(id){
var style = swfIN.utils.$(id).style;
style.visibility = "hidden";
style.position = "absolute";
},
/**
* Splice for arrays and arguments object
* @param {Array} o
* @param {Number} index
* @param {Number} count (optional)
* @return {Array}
*/
splice: function(o, num, count){
var a = [];
if(count == null) count = o.length - num;
var counter = 0;
for(var i = num; i< o.length; i++){
if(++counter < count){
a[i-num] = o[i];
}
}
return a;
},
/**
* Delegate, supports extra arguments
* @param {Object} scope
* @param {Function} handler
* @return {Function}
*/
delegate: function(scope, handler){
var _f = function(){
var tt = arguments.callee.t;
var ff = arguments.callee.f;
var aa = arguments.callee.a;
return ff.apply(tt, aa);
}
_f.t = scope;
_f.f = handler;
_f.a = swfIN.utils.splice(arguments, 2);
return _f;
},
/**
* addEventListener wrapper
* @param {Object} listenerObject
* @param {String} event
* @param {Function} handler
* @return {void}
*/
addEventListener: function( listenerObject, event, handler ){
if(listenerObject.addEventListener) {
listenerObject.addEventListener(event, handler, true);
}else{
listenerObject.attachEvent("on" + event, handler);
}
},
/**
* Creates a pretty popup
* @param {String} url
* @param {String} name
* @param {Number} w
* @param {Number} h
* @param {Number} x
* @param {Number} y
* @param {Array} params
* @return {void}
*/
popUp: function(url, name, w, h, x, y, params){
//check fullscreen and center stuff
var scr2 = swfIN.detect.getFullScreenSize();
var scr = swfIN.detect.getAvailScreenSize();
w = (w == "full") ? scr.w : w;
h = (h == "full") ? scr.h : h;
//always center from fullscreen size
x = (x == "center") ? (scr2.w - w) / 2 : x;
y = (y == "center") ? (scr2.h - h) / 2 : y;
//define all extra params
var p = [];
p["width"] = w;
p["innerWidth"] = w;
p["height"] = h;
p["innerHeight"] = h;
//--use moveTo() instead, it remembers the monitor where the launcher was
//p["left"] = x;
//p["screenX"] = x
//p["top"] = y;
//p["screenY"] = y;
p["toolbar"] = 0; //Specifies whether to display the toolbar in the new window.
p["location"] = 0; //Specifies whether to display the address line in the new window.
p["directories"] = 0; //Specifies whether to display the Netscape directory buttons.
p["status"] = 0; //Specifies whether to display the browser status bar.
p["menubar"] = 0; //Specifies whether to display the browser menu bar.
p["scrollbars"] = 0; //Specifies whether the new window should have scrollbars.
p["resizable"] = 0; //Specifies whether the new window is resizable.
p["copyhistory"] = 0; //Whether or not to copy the old browser window's history list to the new window. does it work?
p["fullscreen"] = 0; //IE only fullscreen mode - it goes above the taskbar...
//overwrite default params with custom ones
for(var i in params){
if (params.hasOwnProperty(i)) p[i] = params[i];
}
//compile final extras string
var finalExtras = "";
for(var i in p){
if (p.hasOwnProperty(i)) finalExtras += (finalExtras == "") ? i+"="+p[i] : ","+i+"="+p[i];
}
//open window
var win = window.open(url, name, finalExtras);
//move, resize and focus
win.resizeTo(w, h);
win.moveTo(0, 0);
win.moveBy(x, y);
win.focus();
},
/**
* Get a querystring param by key
* @param {String} key
* @return {String}
*/
getQueryParam: function(key){
var val = swfIN.utils.getAllQueryParams()[key];
return (val != undefined && val != "") ? val : null ;
},
/**
* Get full querystring
* Returns an object with strings
* @return {Object}
*/
getAllQueryParams: function(){
var qs={};
var params = window.location.search.substring(1).split("&");
for (var i=0; i<params.length; i++) {
var keyVal = params[i].split("=");
qs[ keyVal[0] ] = keyVal[1];
}
return qs;
}
}
}