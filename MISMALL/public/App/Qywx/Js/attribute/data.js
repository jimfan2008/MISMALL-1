/**
 * @description 属性数据设置
 * @author cjli
 * @date 2015-06-29
 */

define(function(require, exports, module) {
	var ajaxData = require("../ajaxData");
	var formJson = require("../formJson.js");
	var data = {
			/**
			 * 还原控件的数据属性
			 * $control  object  当前控件
			 * ctrl  object   每个控件对应的文件对象
			 */
			data : function(ctrl) {
				//在设置页面时，ctrl是undefined，所以此时要过滤掉
				if(!ctrl || !ctrl["attrs"])return;
				ezCommon.deBug("加载[" + ctrl.cName + "]控件data属性设置文件", "public/Js/Qywx/attribute/data", 11);
					var $control = ezCommon.Obj;
					ctrlType = $control.attr("ctrl-type"),
					ctrlName = $control.attr("ctrlId"),
					dataValue = ctrl["attrs"]["Data"];
					if(ctrlName==undefined){
						return;
					}
				if(dataValue != undefined){
					if (dataValue.length>0) {
						require.async("./dataBase.js",function(e){
							e.init(ctrlType,$("#"+dataValue[0]),true);
						});
					};
				}else{
					$(".set-ctrl-data .default-content .DataAttr .commonData").hide();
				}
				/**
				 * 拍照控件属性栏[下拉框]值改变事件
				 */
				$("#boundCtrlList").change(function() {
					var boundObjId = $(this).val();
					//硬件返回值要绑定的对象ID
					formJson.update(ctrlName, "data", "boundObj", boundObjId);
				});
			},
			
			/**
			 * @param dataJson Object 当前控件对应的json
			 * @desc 还原数据属性 
			 */
			restoreAttrData : function ($control,dataJson,$dataDefalue){
				var type = dataJson["type"],value="";
				if(type == "systemParam"){
					var sys = ezCommon.getSysParam(dataJson["value"]["id"]);
					$dataDefalue.attr({
						"dataType" : "systemParam",
						"valueType" : type
					}).val(sys);
					$dataDefalue.next().remove();
					$dataDefalue.removeAttr("queryId field ctrlId ctrlType");
					$control.find("[isbasectrl]").val(sys);
	
					//这里本来就是在控件被点击事件里调用的，下面又触发点击事件，设置数据属性才需要这里的点击事件，数据还原也这样吗？（柯斌？）
					//$(".set-ctrl-data .default-content .DataAttr #"+dataJson["value"]["id"]).click();
				}else if(type == "randomNum"){
					$dataDefalue.attr({
						"dataType" : "randomNum",
						"valueType" : "randomNum"
					});
					var randNum = new Date().getTime() + numRand("", true);
					$dataDefalue.val(randNum);
					$control.find("input").val(randNum);
				}else if(type == "defined"){
					var userValue = dataJson["value"]["value"];
					$dataDefalue.attr({
						"dataType" : "defined",
						"valueType" : "defined"
					});
					$dataDefalue.val(userValue);
					$control.find("input").val(userValue);
				}else if(type == "form"){
					$(".set-ctrl-data .default-content .DataAttr [ctrlid='"+dataJson["value"]["id"]+"']").click();
				}else if(type == "dataSource"){
					
				}else if(type == ""){
					
				}
			}
		};
	
	/**
	 * 拼接数据绑定或默认值弹出面板结构
	 */
	function getDataSetPanel(){
		var html = '';
		var ctrlType = $selectObj.attr("ctrl-type");
		var ctrlId = $selectObj.attr("ctrlId");
	}
	
	function systemParam(){
		
	}
	
	module.exports = data;
});
