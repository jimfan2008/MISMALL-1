function initMap() {
	createMap();
	//创建地图
	setMapEvent();
	//设置地图事件
	addMapControl();
	//向地图添加控件
	addMarker();
	//向地图中添加marker
	addPolyline();
	//向地图中添加线
	addRemark();
	//向地图中添加文字标注
}

//创建地图函数：
function createMap() {
	var map = new BMap.Map("dituContent");
	//在百度地图容器中创建一个地图
	var point = new BMap.Point(114.228802, 22.674774);
	//定义一个中心点坐标
	map.centerAndZoom(point, 17);
	//设定地图的中心点和坐标并将地图显示在地图容器中
	window.map = map;
	//将map变量存储在全局
}

//地图事件设置函数：
function setMapEvent() {
	map.enableDragging();
	//启用地图拖拽事件，默认启用(可不写)
	map.enableScrollWheelZoom();
	//启用地图滚轮放大缩小
	map.enableDoubleClickZoom();
	//启用鼠标双击放大，默认启用(可不写)
	map.enableKeyboard();
	//启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl() {
	//向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({
		anchor : BMAP_ANCHOR_TOP_LEFT,
		type : BMAP_NAVIGATION_CONTROL_LARGE
	});
	map.addControl(ctrl_nav);
	//向地图中添加缩略图控件
	var ctrl_ove = new BMap.OverviewMapControl({
		anchor : BMAP_ANCHOR_BOTTOM_RIGHT,
		isOpen : 1
	});
	map.addControl(ctrl_ove);
	//向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({
		anchor : BMAP_ANCHOR_BOTTOM_LEFT
	});
	map.addControl(ctrl_sca);
}

//标注点数组
var markerArr = [{
	title : "川亿电脑公司",
	content : "川亿电脑公司",
	point : "114.229952|22.670789",
	isOpen : 0,
	icon : {
		w : 21,
		h : 21,
		l : 0,
		t : 0,
		x : 6,
		lb : 5
	}
}, {
	title : "水晶之城（公交站）",
	content : "水晶之城公交站，前方三百米有（荷坳地铁站)",
	point : "114.227931|22.674349",
	isOpen : 0,
	icon : {
		w : 21,
		h : 21,
		l : 0,
		t : 0,
		x : 6,
		lb : 5
	}
}];
//创建marker
function addMarker() {
	for (var i = 0; i < markerArr.length; i++) {
		var json = markerArr[i];
		var p0 = json.point.split("|")[0];
		var p1 = json.point.split("|")[1];
		var point = new BMap.Point(p0, p1);
		var iconImg = createIcon(json.icon);
		var marker = new BMap.Marker(point, {
			icon : iconImg
		});
		var iw = createInfoWindow(i);
		var label = new BMap.Label(json.title, {
			"offset" : new BMap.Size(json.icon.lb - json.icon.x + 10, -20)
		});
		marker.setLabel(label);
		map.addOverlay(marker);
		label.setStyle({
			borderColor : "#808080",
			color : "#333",
			cursor : "pointer"
		});

		(function() {
			var index = i;
			var _iw = createInfoWindow(i);
			var _marker = marker;
			_marker.addEventListener("click", function() {
				this.openInfoWindow(_iw);
			});
			_iw.addEventListener("open", function() {
				_marker.getLabel().hide();
			});
			_iw.addEventListener("close", function() {
				_marker.getLabel().show();
			});
			label.addEventListener("click", function() {
				_marker.openInfoWindow(_iw);
			});
			if (!!json.isOpen) {
				label.hide();
				_marker.openInfoWindow(_iw);
			}
		})();
	}
}

//创建InfoWindow
function createInfoWindow(i) {
	var json = markerArr[i];
	var iw = new BMap.InfoWindow("<b class='iw_poi_title' title='" + json.title + "'>" + json.title + "</b><div class='iw_poi_content'>" + json.content + "</div>");
	return iw;
}

//创建一个Icon
function createIcon(json) {
	var icon = new BMap.Icon("http://app.baidu.com/map/images/us_mk_icon.png", new BMap.Size(json.w, json.h), {
		imageOffset : new BMap.Size(-json.l, -json.t),
		infoWindowOffset : new BMap.Size(json.lb + 5, 1),
		offset : new BMap.Size(json.x, json.h)
	});
	return icon;
}

//标注线数组
var plPoints = [{
	style : "solid",
	weight : 4,
	color : "#f00",
	opacity : 0.6,
	points : ["114.227931|22.674349", "114.227652|22.67344", "114.227778|22.673198", "114.229377|22.672965", "114.228542|22.672189", "114.228371|22.671906", "114.228362|22.671331", "114.228353|22.671172", "114.228569|22.67103", "114.2297|22.670772", "114.229898|22.670755", "114.229853|22.670747"]
}, /*{
 style : "solid",
 weight : 4,
 color : "#f00",
 opacity : 0.6,
 points : ["114.226718|22.672289", "114.226215|22.670439", "114.226197|22.670439"]
 }, {
 style : "solid",
 weight : 4,
 color : "#f00",
 opacity : 0.6,
 points : ["114.226062|22.67063", "114.226188|22.670447", "114.226529|22.670639"]
 }, {
 style : "solid",
 weight : 4,
 color : "#f00",
 opacity : 0.6,
 points : ["114.227032|22.674332", "114.228263|22.676241", "114.22794|22.676149", "114.228263|22.676249", "114.228299|22.675933"]
 }, {
 style : "solid",
 weight : 4,
 color : "#f00",
 opacity : 0.6,
 points : ["114.227562|22.673532", "114.227598|22.673532", "114.227652|22.673465", "114.227778|22.673532"]
 },*/
{
	style : "solid",
	weight : 4,
	color : "#f00",
	opacity : 0.6,
	points : ["114.228614|22.673215", "114.228694|22.67309", "114.228497|22.673023"]
}, {
	style : "solid",
	weight : 4,
	color : "#f00",
	opacity : 0.6,
	points : ["114.228308|22.672056", "114.228362|22.671914", "114.228614|22.671964"]
}, {
	style : "solid",
	weight : 4,
	color : "#f00",
	opacity : 0.6,
	points : ["114.229826|22.670872", "114.229898|22.670747", "114.229826|22.670689"]
}];
//向地图中添加线函数
function addPolyline() {
	for (var i = 0; i < plPoints.length; i++) {
		var json = plPoints[i];
		var points = [];
		for (var j = 0; j < json.points.length; j++) {
			var p1 = json.points[j].split("|")[0];
			var p2 = json.points[j].split("|")[1];
			points.push(new BMap.Point(p1, p2));
		}
		var line = new BMap.Polyline(points, {
			strokeStyle : json.style,
			strokeWeight : json.weight,
			strokeColor : json.color,
			strokeOpacity : json.opacity
		});
		map.addOverlay(line);
	}
}

//文字标注数组
var lbPoints = [{
	//point : "114.226161|22.671597",
	//content : "横岗方向（永湖地铁站）"
}, {
	//point : "114.227518|22.675566",
	//content : "龙岗方向（龙岗线荷坳地铁站）"
}];
//向地图中添加文字标注函数
function addRemark() {
	/*for (var i = 0; i < lbPoints.length; i++) {
	 var json = lbPoints[i];
	 var p1 = json.point.split("|")[0];
	 var p2 = json.point.split("|")[1];
	 var label = new BMap.Label("<div style='padding:2px;'>" + json.content + "</div>", {
	 point : new BMap.Point(p1, p2),
	 offset : new BMap.Size(3, -6)
	 });
	 map.addOverlay(label);
	 label.setStyle({
	 borderColor : "#999"
	 });
	 }*/
}