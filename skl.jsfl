/*var timeline = fl.getDocumentDOM().getTimeline();
var layer = timeline.layers[0];
var elem= layer.frames[0].elements;
for (var i = elem.length - 1; i >= 0; i--) {
	if(elem[i].name == 'mcGenderBox')
	{
		fl.getDocumentDOM().selectNone();
		elem[i].selected = true;
		document.enterEditMode('inPlace');
	}
};*/
var file = fl.configURI + 'Commands/json2.jsfl';
fl.runScript(file); 
/*
var fm = fl.getDocumentDOM().getTimeline().layers[0].frames[0];

var elem = fm.elements[0];
var xOffset = elem.transformX - elem.x;
var yOffset = elem.transformY - elem.y;
fl.getDocumentDOM().selectNone();
elem.selected = true;
var archX = roundToTwip(-xOffset / elem.width);
var archY = roundToTwip(yOffset / elem.height);
document.enterEditMode('inPlace');
getActionList(0, xOffset, yOffset, archX, archY);
document.exitEditMode();

*/


var boneName = ["fronthand",
				"frontshoulder",
				"weapon",
				"head",
				"robe",
				"frontfoot",
				"idlefoot",
				"frontshin",
				"frontthigh",
				"hip",
				"chest",
				"backfoot",
				"backshin",
				"backthigh",
				"backrobe",
				"backhand",
				"backshoulder",
				"weaponoff",
				"cape",
				"backhair"];
fl.showIdleMessage(false);
var actionList = {};
var spriteList = {};
var exportPng = [];
var effectpng = [];
var startFrameStatus = {};
var startIndex = 0;
var select = fl.getDocumentDOM().selection;
for(var i =0;i < select.length;i++)
{
	var elem = select[i];
	var ac = elem.libraryItem.linkageClassName;
	if(elem.libraryItem.linkageClassName == "AvatarSkelM")
	{
		select = arrayRemove(select, i);
		select.push(elem)
		break;
	}
}
var first = true;
var ggg = select.length;
for(var i =select.length-1;i >= 0;i--)
{
	var elem = select[i];
	var xOffset = elem.transformX - elem.x;
	var yOffset = elem.transformY - elem.y;
	fl.getDocumentDOM().selectNone();
	elem.selected = true;
	var archX = roundToTwip(-xOffset / elem.width);
	var archY = roundToTwip(yOffset / elem.height);
	document.enterEditMode('inPlace');
	var asName = elem.libraryItem.linkageClassName;
	var ddd = getActionList(startIndex, xOffset, yOffset, archX, archY, exportPng, effectpng, actionList, spriteList, startFrameStatus, first, asName);
	exportPng = ddd[1];
	effectpng = ddd[2];
	spriteList = ddd[3];
	startIndex = ddd[4];
	startFrameStatus = ddd[5];
	document.exitEditMode();
	first = false;
}
fl.showIdleMessage(true);
saveMotionXML(actionList, exportPng, effectpng, spriteList);


function getActionList(startIndex, xOffset, yOffset, archX, archY, exportPng, effectpng, actionList, spriteList, startFrameStatusObject, first, asName)
{
	var timeline = fl.getDocumentDOM().getTimeline();
	var layers = timeline.layers;
	var labelEnd = 0;
	var maxFrameId = 0;
	var posOffset = null;
	for(var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
		var currentLayer = layers[layerIndex];
		if(!currentLayer.visible) {
			continue
		}
		var frames = currentLayer.frames;
		if(currentLayer.name.toLowerCase() == "label") {
			var tmp = getLabelXml(frames, startIndex, actionList, asName);
			actionList = tmp[0];
			maxFrameId = tmp[1];
			labelEnd = frames.length - 1;
			continue;
		}
		if(currentLayer.name.toLowerCase() == "shadow") {
			continue;
		}
		selectLayer(layerIndex);
		var findFirst = false;
		var startFrame = 0;
		var endFrame = frames.length - 1;
		var lastFrameStatus = null;
		var startFrameStatus = null;
		for(var frameIndex = 0; frameIndex < frames.length;) {
			var currentFrame = frames[frameIndex];

			selectFrame(frameIndex);
			if(!findFirst) {
				if(currentFrame.elements.length <= 0) {
					if(!actionList.hasOwnProperty(currentLayer.name.toLowerCase())) {
						actionList[currentLayer.name.toLowerCase()] = {};
					}
					var fff = {
							"positionX" : 0,
							"positionY" : 0,
							"scaleX" : 1,
							"scaleY" : 1,
							"skewX" : 0,
							"skewY" : 0,
							"colorMode" : 0,
							"brightness" : 0,
						};
					actionList[currentLayer.name.toLowerCase()][frameIndex+startIndex] = createTransformInfo(fff);
				}
				else {
					findFirst = true;
					var zIndex = timeline.layers.length - layerIndex;

					//
					var show = true;
					if(!startFrameStatusObject.hasOwnProperty(currentLayer.name.toLowerCase()) && !first)
					{
						show = false;
					}
					newLayer = true;
					if(startFrameStatusObject.hasOwnProperty(currentLayer.name.toLowerCase()))
					{
						newLayer = false;
					}
					var tmp = getSourceXML(currentFrame.elements[0], zIndex, frameIndex, currentLayer.name.toLowerCase(), spriteList, exportPng, effectpng, xOffset, yOffset, endFrame+startIndex, show, newLayer);
					spriteList = tmp['spriteList'];
					exportPng = tmp['exportPng'];
					effectpng = tmp['effectpng'];
					if(!startFrameStatusObject.hasOwnProperty(currentLayer.name.toLowerCase()))
					{
						startFrameStatusObject[currentLayer.name.toLowerCase()] = tmp['startFrameStatus'];
					}
					startFrameStatus = startFrameStatusObject[currentLayer.name.toLowerCase()];
					startFrame = frameIndex;
					if(statusEqual(tmp['startFrameStatus'], startFrameStatus)) {
						lastFrameStatus = {
							"positionX" : 0,
							"positionY" : 0,
							"scaleX" : 1,
							"scaleY" : 1,
							"skewX" : 0,
							"skewY" : 0,
							"colorMode" : startFrameStatus.colorMode,
							"brightness" : startFrameStatus.brightness,
						};
					}
					else {
						lastFrameStatus = getTransform(currentFrame.elements[0], startFrameStatus);
					}
					if(!actionList.hasOwnProperty(currentLayer.name.toLowerCase())) {
						actionList[currentLayer.name.toLowerCase()] = {};
					}
					actionList[currentLayer.name.toLowerCase()][frameIndex+startIndex] = createTransformInfo(lastFrameStatus);
				}
			}
			var tmp = getFrameXML(currentFrame, frameIndex, frames, startFrameStatus, lastFrameStatus, currentFrame, actionList, startIndex, currentLayer.name.toLowerCase());
			frameIndex = tmp['end'];
			actionList = tmp['actionList'];
			lastFrameStatus = tmp['lastFrameStatus'];
		}
	}
	//saveMotionXML(actionList, exportPng, tmp);
	return [actionList, exportPng, effectpng, spriteList, maxFrameId, startFrameStatusObject];
}



function getFrameXML(frame, frameIndex, frames, startStatus, lastFrameStatus, currentFrame, actionList, startIndex, name) {
	if(frame.startFrame != frameIndex) {
		alert("error55555");
		return {"end":(frameIndex + 1), "actionList":actionList, "lastFrameStatus":lastFrameStatus};
	}
	var start = frame.startFrame;
	var end = frame.startFrame + frame.duration;
	if(end >= frames.length) {
		return {"end":end, "actionList":actionList, "lastFrameStatus":lastFrameStatus};
	}
	var endStatus = getTransform(frames[end].elements[0], startStatus);
	if(startStatus == null || lastFrameStatus == null) {
		if(!actionList.hasOwnProperty(name)) {
			actionList[name] = {};
		}
		actionList[name][end + startIndex] = createTransformInfo(endStatus);
	}
	else if(!statusEqual(endStatus, lastFrameStatus)) {
		//actionList[currentFrame.elements[0].name][end + startIndex] = createTransformInfo(endStatus, end);
		for(var i = 1; i <= frame.duration; i++) {
			var tt = getStatusDivise(frame.motionTweenRotate, lastFrameStatus, endStatus, frame.duration , i);
			if(tt != null)
			{
				if(!actionList.hasOwnProperty(name)) {
					actionList[name] = {};
				}
				actionList[name][start + i + startIndex] = createTransformInfo(tt);
			}
		}

	}
	lastFrameStatus = endStatus;
	return {"end":end, "actionList":actionList, "lastFrameStatus":lastFrameStatus};
}
function getTransform(element, startStatus)
{
	var result = {
		"positionX" : 0,
		"positionY" : 0,
		"scaleX" : 1,
		"scaleY" : 1,
		"skewX" : 0,
		"skewY" : 0,
		"colorMode" : 0,
		"brightness" :0,
	};
	if (!element || !startStatus) return result;
	result.positionX = roundToTwip(getX(element) - startStatus.positionX);
	result.positionY = roundToTwip(getY(element) - startStatus.positionY);

	result.scaleX = roundToTwip(getMatrixScaleX(element.matrix) / startStatus.scaleX);
	result.scaleY = roundToTwip(getMatrixScaleY(element.matrix) / startStatus.scaleY);

	result.skewX = roundToTwip(getMatrixSkewX(element.matrix) - startStatus.skewX);
	result.skewY = roundToTwip(getMatrixSkewY(element.matrix) - startStatus.skewY);

	var ggg = getColorXML(element);
	result.colorMode = ggg[1];
	result.brightness = ggg[0] - startStatus.brightness;
	if(result.positionY != 0)
	{
		result.positionY = -result.positionY;
	}
	return result;
}
function getColorXML(element)
{
	if (!element) return 0;
	var colorMode = element.colorMode;
	if (!colorMode)
		return 1;
	var visable = element.visible;
	if(visable === false)
	{
		return 0;
	}
	switch (colorMode)
	{
		case 'none':
			return [0, 1];
			break;
		case 'brightness':
			return [(element.brightness/100), 1];
			break;
		case 'tint':
			return [0, 1];
			break;
		case 'alpha':
			return [0, (element.colorAlphaPercent/100)];
			break;
		case 'advanced':
			return [0, (element.colorAlphaPercent/100)];
			break;
		default:
			alert("54545333");
			return [0, 1];
	}
}
function getSourceXML(element, zIndex, startFrameIndex, layerName, spriteList, exportPng, effectpng, xOffset, yOffset, endFrame, show, newLayer){

	var matrix = element.matrix;
	var startX = getX(element);
	var startY = getY(element);
	var scaleXStart = getMatrixScaleX(matrix);
	var scaleYStart = getMatrixScaleY(matrix);
	var skewXStart = getMatrixSkewX(matrix);
	var skewYStart = getMatrixSkewY(matrix);
	var libraryItem = element.libraryItem;
	if (libraryItem && newLayer) {
		if(!inArray(boneName, layerName))
		{
			effectpng.push(libraryItem);
		}
		else
		{
			exportPng.push(libraryItem);
		}
		
	}
	var name = element.libraryItem.name.split('/');
	var oldRot = element.rotation;
	element.rotation = 0;
	var transPoint = getTransformationPointForElement(element);

	//取得注入点位置
	var x1 = element.transformX;
	var y1 = element.transformY;
	setTransformationPointForElement(element, {x:0, y:0});
	var x2 = element.transformX;
	var y2 = element.transformY;
	setTransformationPointForElement(element, transPoint);
	var leftOffset = roundToTwip(x1 - x2);
	var topOffset = roundToTwip(y1 - y2);
	
	var identityMatrix = {a:1, b:0, c:0, d:1, tx:0, ty:0};
	element.matrix = identityMatrix;

	if (element.elementType != 'text')
		setTransformationPointForElement(element, transPoint);

	var transXNormal = roundToTwip((element.transformX - element.left) / element.width);
	var transYNormal = roundToTwip(1 - (element.transformY - element.top) / element.height);
	element.matrix = matrix;

	if (element.elementType != 'text')
		setTransformationPointForElement(element, transPoint);

	setX(element, startX);
	setY(element, startY);

	element.rotation = oldRot;
	var ggg = getColorXML(element);
	var rr = ggg[1];
	var brightness = ggg[0];
	var startFrameStatus = {
			"positionX" : startX,
			"positionY" : startY,
			"scaleX" : scaleXStart,
			"scaleY" : scaleYStart,
			"skewX" : skewXStart,
			"skewY" : skewYStart,
			"colorMode" : rr,
			"brightness" : brightness,
		};
	
	if(startFrameIndex != 0)
	{
		rr = 0;
	}
	if(!show)
	{
		rr = 0;
	}
	if(!spriteList.hasOwnProperty(layerName))
	{
		spriteList[layerName] = [name[name.length - 1]+"0000", startFrameIndex, zIndex, transXNormal, transYNormal, (startX-xOffset), (yOffset-startY), scaleXStart, scaleYStart, skewXStart, skewYStart, rr, leftOffset, topOffset, endFrame, brightness];
	}
	else
	{
		spriteList[layerName][14] = endFrame;
	}
	return {"exportPng":exportPng, "spriteList":spriteList, "startFrameStatus":startFrameStatus, "effectpng": effectpng};
}
function getLabelXml(frames, startIndex, actionList, asName) {
	var s = '{'
	var ccc = frames.length;
	var name = null;
	var st = true;
	for(var f=0;f<ccc;f++)
	{
		if(name != frames[f].name)
		{
			if(frames[f].name === '')
			{
				frames[f].name = asName;
			}
			if(!st)
			{
				s += (f-1+startIndex)+'],';
			}
			s += '"'+frames[f].name+'":['+(f+startIndex)+',';
			name = frames[f].name;
			st = false;
		}
		else
		{
			continue;
		}
	}
	s += (f-1+startIndex)+']}';
	actionList["label"] = objectMerge(actionList["label"], JSON.parse(s));
	return [actionList, ccc+startIndex];
}
function createTransformInfo(result) {
	return [result.positionX, result.positionY, result.scaleX, result.scaleY, result.skewX, result.skewY, result.colorMode, result.brightness];
}

function statusEqual(status1, status2) {
	if(status1.positionX != status2.positionX) {
		return false;
	}
	else if(status1.positionY != status2.positionY) {
		return false;
	}
	else if(status1.scaleX != status2.scaleX) {
		return false;
	}
	else if(status1.scaleY != status2.scaleY) {
		return false;
	}
	else if(status1.skewX != status2.skewX) {
		return false;
	}
	else if(status1.skewY != status2.skewY) {
		return false;
	}
	else if(status1.colorMode != status2.colorMode) {
		return false;
	}
	else if(status1.brightness != status2.brightness) {
		return false;
	}
	else {
		return true;
	}
}
function getStatusDivise(rotConfig, status1, status2, divice , id) {
	if(divice == id) return status2;
	if(status1.colorMode <= 0)
	{
		return null;
	}
	var XDirect = "clockwise";
	var YDirect = "clockwise";
	var rotX = rotInfo(status1.skewX, status2.skewX, divice, id);
	var rotY = rotInfo(status1.skewY, status2.skewY, divice, id);
	return {
		"positionX" : roundToTwip(status1.positionX + (status2.positionX - status1.positionX) / divice * id),
		"positionY" : roundToTwip(status1.positionY + (status2.positionY - status1.positionY) / divice * id),
		"scaleX" : roundToTwip(status1.scaleX + (status2.scaleX - status1.scaleX) / divice * id),
		"scaleY" : roundToTwip(status1.scaleY + (status2.scaleY - status1.scaleY) / divice * id),
		"skewX" : roundToTwip(status1.skewX + rotX),
		"skewY" : roundToTwip(status1.skewY + rotY),
		"colorMode" : status1.colorMode,
		"brightness" : roundToTwip(status1.brightness + (status2.brightness - status1.brightness) / divice * id),
	};

}
function selectFrame(frameIndex) {
	var dom = fl.getDocumentDOM();
	var timeline = dom.getTimeline();
	timeline.setSelectedFrames(frameIndex, frameIndex, true);
}

function selectLayer(layerIndex)
{
	var dom = fl.getDocumentDOM();
	var timeline = dom.getTimeline();
	timeline.setSelectedLayers(layerIndex, true);
}

function getTransformationPointForElement(element)
{
	var oldSelected = element.selected;
	element.selected = true;
	var pt = element.getTransformationPoint();
	element.selected = oldSelected;
	return pt;
}

function setTransformationPointForElement(element, transPoint)
{
	var oldSelected = element.selected;
	element.selected = true;
	element.setTransformationPoint(transPoint);
	element.selected = oldSelected;
}

function getX(element)
{
	return roundToTwip(element.transformX);
}

function getY(element)
{
	return roundToTwip(element.transformY);
}

function setX(element, x)
{
	element.transformX = x;
}

function setY(element, y)
{
	element.transformY = y;
}

function getMatrixScaleX(matrix)
{
	var angleYRad = Math.atan2(matrix.b, matrix.a);
	var cos = Math.cos(angleYRad);
	var scaleX = matrix.a / cos;
	if (Math.abs(cos) < 1e-12)
		scaleX = matrix.b / Math.sin(angleYRad);
	var scaleRound = 1000;
	scaleX = Math.round(scaleX*scaleRound)/scaleRound;
	return scaleX;
}

function getMatrixScaleY(matrix)
{
	var angleXRad = Math.atan2(-matrix.c, matrix.d);
	var cos = Math.cos(angleXRad);
	var scaleY = matrix.d / cos;
	if (Math.abs(cos) < 1e-12)
		scaleY = -matrix.c / Math.sin(angleXRad);
	var scaleRound = 1000;
	scaleY = Math.round(scaleY*scaleRound)/scaleRound;
	return scaleY;
}

function getMatrixSkewX(matrix)
{
	var angleXRad = Math.atan2(-matrix.c, matrix.d);
	var angleRound = 10;
	var angleX = Math.round(angleXRad * 180/Math.PI * angleRound)/angleRound;
	return angleX;
}

function getMatrixSkewY(matrix)
{
	var angleYRad = Math.atan2(matrix.b, matrix.a);
	var angleRound = 10;
	var angleY = Math.round(angleYRad * 180/Math.PI * angleRound)/angleRound;
	return angleY;
}

function roundToTwip(value)
{
	var vv = Math.pow(10,4);
    return Math.round(value*vv)/vv;
}

function inArray(ar, vl)
{
	for(var i=0;i<ar.length;i++)
	{
		if(ar[i] == vl)
		{
			return 1;
		}
	}
	return 0;
}
function arrayMerge(ar1, ar2)
{
	var tmp = [];
	for(var i =0;i <ar1.length;i++)
	{
		if(!inArray(tmp, ar1[i]))
		{
			tmp.push(ar1[i])
		}
	}
	for(var i =0;i <ar2.length;i++)
	{
		if(!inArray(tmp, ar2[i]))
		{
			tmp.push(ar2[i])
		}
	}
	return tmp;
} 

function arrayRemove(ary, dx)  
{  
	if(isNaN(dx)||dx>ary.length){return false;}  
	for(var i=0,n=0;i<ary.length;i++)  
	{  
		if(ary[i]!=ary[dx])  
		{  
			ary[n++]=ary[i]  
		}  
	}  
	ary.length-=1  
	return ary;
} 

function objectMerge(ob1, ob2)
{
	var tmp = {};
	for(var i in ob1)
	{
		tmp[i] = ob1[i];
	}
	for(var i in ob2)
	{
		tmp[i] = ob2[i];
	}
	return tmp;
}
function stringReplace(source, find, replace)
{
	if (!source || !source.length)
		return '';
	//return source.replace(find, replace);
	return source.split(find).join(replace);
}

function rotInfo(rot1, rot2, divice, id)
{
	var ang = 0;
	var direct = 'clockwise'
	if(rot1 < 0)
	{
		rot1 += 360;
	}
	if(rot2 < 0)
	{
		rot2 += 360;
	}
	if(rot2 < rot1)
	{
		rot2 += 360;
	}
	ang = rot2 - rot1;
	if(ang > 180)
	{
		ang = 360 - ang;
		direct = "counter-clockwise";
	}
	var tt = ang / divice * id;
	if(direct == "counter-clockwise")
	{
		return -tt;
	}
	else
	{
		return tt;
	}
}

function saveMotionXML(contents, png, effectpng, sprite)
{
	if (!contents) {
		return false;
	}
	var fileURL = fl.browseForFolderURL("save", "fffffff");
	if (!fileURL || !fileURL.length) {
		return false;
	}
	if(fileURL.charAt(fileURL.length-1) != '/')
	{
		fileURL += '/';
	}
	var exporter = new SpriteSheetExporter; 
	exporter.beginExport();
	exporter.autoSize = true;
	exporter.allowTrimming = true;
	exporter.allowRotate = false;
	exporter.shapePadding = 2;
	exporter.algorithm = "basic";
	exporter.layoutFormat = "cocos2D v2";
	exporter.stackDuplicateFrames = false;

	var addPng = [];
	var index = 0;
	for (var j = 0; j < png.length; j++) {
		if(!inArray(addPng, png[j].name))
		{
	        exporter.addSymbol(png[j]);
	        addPng.push(png[j].name);
		}
	}

	var name = fl.getDocumentDOM().name.split(".")[0];
	exporter.exportSpriteSheet(fileURL+'pic/'+name,{format:"png", bitDepth:32, backgroundColor:"#00000000"});
	sprite['picture'] = name;

	exporter.beginExport();
	exporter.autoSize = true;
	exporter.allowTrimming = true;
	exporter.allowRotate = false;
	exporter.shapePadding = 2;
	exporter.algorithm = "basic";
	exporter.layoutFormat = "cocos2D v2";
	exporter.stackDuplicateFrames = false;
	//exporter.sheetHeight = 2048;
	//exporter.sheetWidth = 2048;
	var addPng = [];
	var index = 0;
	for (var j = 0; j < effectpng.length; j++) {
		if(!inArray(addPng, effectpng[j].name))
		{
	        exporter.addSymbol(effectpng[j]);
	        addPng.push(effectpng[j].name);
		}
	}

	name = name+"effect";
	exporter.exportSpriteSheet(fileURL+'pic/'+name,{format:"png", bitDepth:32, backgroundColor:"#00000000"});

	//var ret = '{"bone":'+JSON.stringify(sprite)+', "motion":'+JSON.stringify(contents)+'}';
	if (!FLfile.write(fileURL+'bone/'+name+".skl", JSON.stringify(sprite)))
	{
		alert(CopyMotionErrorStrings.SAVE_ERROR);
		return false;
	}
	if (!FLfile.write(fileURL+'bone/'+name+".motion", JSON.stringify(contents)))
	{
		alert(CopyMotionErrorStrings.SAVE_ERROR);
		return false;
	}
	return true;
}