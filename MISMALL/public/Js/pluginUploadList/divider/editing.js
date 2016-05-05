/**
 * @author fwb
 * 分隔符
 */

define(function(require, exports, module) {

	/***********************************/
	/*当页面有多个当前相同组件时需要创建此对象*/
	/***********************************/
	var dividerList = {};

	var divider = {
		get : function() {
			return component;

		},

		/**
		 * 控件的初始设置
		 */
		set : function() {

		},

		/**
		 * 预览和发布后组件解析时的初始化（预览和发布后）
		 **/
		init : function() {
			/*******************************************
			 在此处调用 style.css文件和插件自身所需要用到的js文件
			 所有html结构需要包裹在一个外层容器中，外层容器的class 为 mod-插件名-组件名
			 style.css 为组件的样式文件，在编辑器状态以及发布状态下都会加载
			 在调用css,js文件时请按照如下格式编写代码
			 require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/"+您的文件目录+"style.css", function() {

			 require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/+您的文件目录+editing.js", function() {

			 编写初始化实现的方法
			 do  something
			 });
			 });

			 ******************************************/

		},

		/**
		 * 加载组件属性()
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(component);
			});
		},

		/**
		 * 设置组件属性
		 * **/
		setAttrs : function($compent) {
			var compentId = $compent.attr("ctrlid"), sliderWidth = $compent.attr("sliderWidth");
			if (!sliderWidth) {
				sliderWidth = 50;
			} else {
				$(".mod-divider").find(".value").text(sliderWidth + "%");
			}
			$(".mod-divider-slider").slider({
				orientation : "horizonal",
				range : "min",
				step : 1,
				min : 0,
				max : 100,
				value : sliderWidth,
				slide : function(event, ui) {
					$compent.find("hr").css("width", ui.value + "%");
					$(".mod-divider").find(".value").text(ui.value + "%");
					$compent.attr("sliderWidth", ui.value);
				},
			});
			
		

		},
		
		
		/*******************************************
		 此处编写组件内部处理方法
		 do something
		 ******************************************/
	};

	var component = {
		html : '<div class="row ctrl thirdpartyPlugin" syscomtype="divider" ctrl-type="systemCp"><hr style="width:50%"/></div>',
		cName : '分隔符',
		attrs : {

			/*********************************************/
			/*右边属性自定义*/
			/*所有属性都必须包裹在<div></div>中*/
			/*排列方式可分为一行一列和一行两列两中
			*  一行一列编写为 <div class="col-md-12 basic-small-title"></div>
			* 一行两列编写为 <div class="col-md-6 basic-small-title"></div>*/

			/*********************************************/
			"General" : ['dine', 'title'],
		},
		
		attrList : {
			"dine" : '<div class="mod-divider"><div class="col-md-2 ">宽度</div><div class="col-md-6  mod-divider-slider setSlide slide-left"></div><div class="col-md-2"><span class="value">50%</span></div></div>',
		},
	};

	module.exports = divider;
});

