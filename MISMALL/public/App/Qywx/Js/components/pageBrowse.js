/**
 *
 * @desc 翻页浏览
 * @time 2015-09-21
 */
define(function(require, exports, module) {
	var mySwiper = {};
	var pageBrowse = {

		get : function() {
			return component;
		},
		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {
			//console.log("拖动");
			$obj.find(".colInner").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				tolerance : "pointer",
				connectWith : ".selectedForm , .colInner",
				cursor : "crosshair",
				scroll : false,
				axis : "y",
				start : function(e, ui) {
					var $dragger = ui.item;
				},
				sort : function(e, ui) {
				},
				stop : function(e, ui) {
					//如果是控件排序，则不需要执行添加的逻辑
					var isSorting = ui.item.hasClass("ctrl");
					if (isSorting) {
						return;
					}
					//拖动添加控件
					var ctrlType = ui.item.attr("ctrl-type"), isComponent = ui.item.hasClass("sys-comp");
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js", function(e) {
						if (isComponent) {
							e.loadComponent(ctrlType, ui.item);
						} else {
							e.loadCtrls(ctrlType, ui.item);
						}
					});
				}
			});
		},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj) {
			require.async("pageBrowseCss", function(e) {
				require.async("pageBrowseJs", function(e) {
					mySwiper = new Swiper($obj.find('.swiper-container'), {
						direction : 'vertical',
						pagination : '.swiper-pagination',
						//effect:"fade",
						paginationClickable : true,
						paginationBulletRender : function(index, className) {
							return '<span class="' + className + '">' + (index + 1) + '</span>';
						}
					});
				});
				$(".swiper-slide").css("height", "520px");
				$(".swiper-container").css("height", "520px");
				$("#app").show();

			});
		},
		/**
		 * 加载组件属性
		 */
		loadAttrs : function($sysComp) {
			$("#app").show();
			var ctrlName = "PageBrowse";
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js" + SITECONFIG.VERSION, function(e) {
				e.getAttrs(ctrlName, function(ctrl) {
					//加载控件属性
					ctrl.loadAttrs(ctrl.get());
					//还原属性设置
					ctrl.setAttrs(ctrl.get());
					$(".removeBgImg").hide();
					//加载控件动作
					ctrl.loadAction(ctrlName);
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(ctrlCommon) {
						//还原动作设置
						ctrlCommon.restoreAction("undefined", "load");
					});
					$(".changeBrowse").unbind().click(function() {
						var newAttr = $('<div class="swiper-slide swiper-no-swiping"style=" " ><div class="colInner byCtrlPadding colInne-cent" style="height:100%;width:100%; overflow:auto"></div></div>');
						mySwiper.appendSlide(newAttr);
						pageBrowse.set(newAttr);
					});
					$(".removeBrowse").unbind().click(function() {
						if ($(".swiper-slide ").length > 1) {
							for (var i = 0; i < $(".swiper-slide ").length; i++) {
								if (($(".swiper-slide ")[i].className).match('active')) {
									mySwiper.removeSlide(i);
								}
							}
						} else {
							$(".ctrlIconWraper").click();
						}
					});
				});
			});

		},

		/**
		 * 设置组件属性
		 */
		setAttrs : function() {
			// $(".changeBrowse").unbind().click(function() {
			// var newAttr = $('<div class="swiper-slide swiper-no-swiping"style=" " ><div class="colInner byCtrlPadding colInne-cent" style="height:100%;width:100%; overflow:auto"></div></div>');
			// mySwiper.appendSlide(newAttr);
			// pageBrowse.set(newAttr);
			// });
			// $(".removeBrowse").unbind().click(function() {
			// if($(".swiper-slide ").length>1){
			// for (var i = 0; i < $(".swiper-slide ").length; i++) {
			// if (($(".swiper-slide ")[i].className).match('active')) {
			// mySwiper.removeSlide(i);
			// }
			// }
			// }else{
			// $(".ctrlIconWraper").click();
			// }
			// });
		},
		loadAction : function() {
		},
	};

	var component = {
		html : '<div syscomtype="pageBrowse" fieldsum="true" class="row ctrl" ctrl-type="systemCp"  style="margin:1px 3px 2px 2px ;"><div class="swiper-container"><div class="swiper-wrapper "><div class="swiper-slide swiper-no-swiping"><div class="colInner byCtrlPadding colInne-cent" style="height:100%;width:100%;overflow:auto"></div></div></div></div><div class="ctrlIconWraper" title="删除"></div></div></div>',

		cName : '翻页浏览',
		attrs : {
			General : ["pageBrowse"]
		},
	};

	module.exports = pageBrowse;
});
