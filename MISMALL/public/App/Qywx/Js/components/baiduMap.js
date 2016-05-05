/**
 * @author 范文彬
 * @desc 百度地图
 * @time 2015-06-30
 */
define(function(require, exports, module) {
	var map = {};
	var baiduMap = {
		get : function() {
			return component;
		},
		
		set : function($obj) {

		},

		init : function($obj) {
			require.async("http://api.map.baidu.com/getscript?v=2.0&ak=E7ab13781e2edee9fefc970748efb910&services=&t=20150901171226", function(e) {
				var initHeight = $obj.attr("initHeight"), mapSite = $obj.attr("mapSite"), objId = $obj.children().attr("id");
				map = new BMap.Map(objId);
				baiduMap.updateBaiduMap(mapSite, initHeight);
				$("#setBaiduSite").val(mapSite);
			});

		},

		/**
		 * 加载组件属性
		 */
		loadAttrs : function($sysComp) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(component);
			});
		},

		/**
		 * 设置组件属性
		 */
		setAttrs : function($component) {
			require.async("http://api.map.baidu.com/getscript?v=2.0&ak=E7ab13781e2edee9fefc970748efb910&services=&t=20150901171226", function(e) {
				var initHeight = $component.attr("initHeight"), mapSite = $component.attr("mapSite"), objId = $component.children().attr("id");
				map = new BMap.Map(objId);
				baiduMap.updateBaiduMap(mapSite, initHeight);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
				baiduMap.serachSite(map);
				$("#setBaiduSite").val(mapSite);
			});
		},
		/**
		 * 更新地图数据
		 */
		updateBaiduMap : function(mapSite, initHeight) {

			// 初始化地图,设置城市和地图级别。
			mapSite ? mapSite : mapSite = "北京";
			map.centerAndZoom(mapSite, 12);
			baiduMap.setPlace(map, mapSite);
		},

		serachSite : function(map) {
			var ac = new BMap.Autocomplete(//建立一个自动完成的对象
			{
				"input" : "setBaiduSite",
				"location" : map
			});

			ac.addEventListener("onhighlight", function(e) {//鼠标放在下拉列表上的事件
				var str = "";
				var _value = e.fromitem.value;
				var value = "";
				if (e.fromitem.index > -1) {
					value = _value.province + _value.city + _value.district + _value.street + _value.business;
				}
				str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

				value = "";
				if (e.toitem.index > -1) {
					_value = e.toitem.value;
					value = _value.province + _value.city + _value.district + _value.street + _value.business;
				}
				str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
				baiduMap.G("searchResultPanel").innerHTML = str;
			});

			var myValue;
			ac.addEventListener("onconfirm", function(e) {//鼠标点击下拉列表后的事件
				var _value = e.item.value;
				myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
				ezCommon.Obj.attr("mapSite", myValue);
				baiduMap.G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
				baiduMap.setPlace(map, myValue);
			});

		},

		G : function(id) {
			return $("#" + id);
		},

		setPlace : function(map, myValue) {
			map.clearOverlays();
			//清除地图上所有覆盖物
			function myFun() {
				var pp = local.getResults().getPoi(0).point;
				//获取第一个智能搜索的结果
				map.centerAndZoom(pp, 18);
				map.addOverlay(new BMap.Marker(pp));
				//添加标注
			}

			var local = new BMap.LocalSearch(map, {//智能搜索
				onSearchComplete : myFun
			});
			local.search(myValue);

		}
	};

	var component = {
		html : '<div class="row ctrl" syscomtype="baiduMap" fieldsum="true"  ctrl-type="systemCp"  style=""><div id="allmap" mapSite="北京"  style="height:200px;overflow: hidden;margin:0 auto;"></div><div class = "ctrlIconWraper"></div></div>',
		cName : '百度地图',
		attrs : {
			General : ["setBaiduSite"]
		},
	};

	module.exports = baiduMap;
});
