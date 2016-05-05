/**
 * @author 陈毅
 * @desc 中间控制器,不处理复杂业务逻辑，只负责中间调度，具体实现，分散到各个逻辑模块中
 * @date 2015-05-04
 */

define(function(require, exports, module) {

	var allCtrls = {};

	var CONTROLER = {

		/**
		 * @desc
		 * @param ctrlType string 控件类型
		 * @param ctrlObj object 被拖动的对象
		 */
		loadCtrls : function(ctrlType, ctrlObj) {
			var uri = "controls/";
			if(ctrlType == "compLogic"){
				uri = 'components/';
			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/"+uri + ctrlType + ".js", function(e) {
				allCtrls[ctrlType] = e;
				add(ctrlType, ctrlObj);
			});
		},

		/**
		 * @param ctrlType string 系统组件类型
		 * @param ctrlObj object 被拖动的对象
		 */
		loadComponent : function(componentType, componetObj) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + componentType + ".js", function(e) {
				//TODO 组件加完后的处理，与组件相关的逻辑请在此调用
				allCtrls[componentType] = e;
				//缓存组件对象
				componentAdd(componentType, componetObj);
			});
		},

		/**
		 * 加载第三方插件
		 * @param ctrlType string 系统组件类型
		 * @param ctrlObj object 被拖动的对象
		 */
		loadThirdpartyComponent : function(thirdpartyComponentType, thirdpartyComponetObj) {
			require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/" + thirdpartyComponentType + "/style.css", function() {
				require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/" + thirdpartyComponentType + "/editing.js", function(e) {
					//TODO 组件加完后的处理，与组件相关的逻辑请在此调用
					allCtrls[thirdpartyComponentType] = e;
					//缓存第三方组件对象
					thirdpartyComponentAdd(thirdpartyComponentType, thirdpartyComponetObj);
				});
			});
		},

		/**
		 *  @param customComponet object 将封装好的组件放到当前选中的页面上
		 */
		loadcustomComponent : function($compLogic) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				//TODO 组件加完后的处理，与组件相关的逻辑请在此调用
				allCtrls["compLogic"] = e;
				onCtrlDroped("compLogic", $compLogic);
				//初始化当前组件属性
				e.loadAttrs();
				//设置当前组件属性
				e.setAttrs($compLogic);
			});
		},

		/**
		 * @desc 加載控件数据属性
		 */
		getAttrs : function(ctrlType, func) {
			loadCtrlObj(ctrlType, func);
		},

		/**
		 * @desc 加載组件数据属性 判断是自定义组件还是系统组件
		 */
		getCustomComponentAttrs : function(ctrlType, func) {
			if (ctrlType == "compLogic") {
				loadCustomComponentObj(ctrlType, func);
			} else {
				loadSystemComponentsObj(ctrlType, func);
			}
		},

		/**
		 * @desc 向分栏或定位兰中拖动控件
		 */
		ctrSortable : function($ctrl) {
			$ctrl.find(".colInner").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				tolerance : "pointer",
				connectWith : ".selectedForm , .colInner",
				cursor : "crosshair",
				scroll : false,
				axis : "y",
				start : function(e, ui) {
					var $dragger = ui.item;
					console.log("controler");
				},
				sort : function(e, ui) {
				},
				stop : function(e, ui) {

					//如果是控件排序，则不需要执行添加的逻辑
					var isSorting = ui.item.hasClass("ctrl");
					var ctrlType = ui.item.attr("ctrl-type"), isComponent = ui.item.hasClass("sys-comp");
					if (isSorting) {
						return;
					}
					//拖动添加控件
					if (isComponent) {
						CONTROLER.loadComponent(ctrlType, ui.item);
					} else {
						CONTROLER.loadCtrls(ctrlType, ui.item);
					}
				}
			});

		},
	};

	/**
	 * @desc 页面还原,控件单击,还原控件属性时,先加载对应的控件文件,然后缓存,回调
	 * @param ctrlType String 控件类型
	 */
	function loadCtrlObj(ctrlType, func) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
			allCtrls[ctrlType] = e;
			if (func) {
				func(e);
			}
		});
	}

	/**
	 * @desc 页面还原,系统组件单击,还原系统组件属性时,先加载对应的系统组件文件,然后缓存,回调
	 * @param ctrlType  String 系统组件
	 */
	function loadSystemComponentsObj(componetType, func) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + componetType + ".js", function(e) {
			allCtrls[componetType] = e;
			if (func) {
				func(e);
			}
		});
	}

	/**
	 * @desc 页面还原,自定义组件单击,还原自定义组件属性时,先加载对应的自定义组件文件,然后缓存,回调
	 * @param ctrlType = 'customComponent' String 自定义组件
	 */
	function loadCustomComponentObj(ctrlType, func) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
			allCtrls[ctrlType] = e;
			if (func) {
				func(e);
			}
		});

	}

	/**
	 * @desc 控件添加
	 * @param {Object} dragger 拖动原始对象
	 * @param {Object} ctrlObj 真实控件对象
	 */
	function add(ctrlType, dragger) {
		var ctrl = allCtrls[ctrlType], $ctrl = $(ctrl.get().html);
		dragger.replaceWith($ctrl);
		onCtrlDroped(ctrlType, $ctrl);
		ctrl.loadAttrs();
		ctrl.setAttrs(ctrl.get());
		ctrl.loadAction(ctrlType);
		$("#set-ctrl-basic").click();
		var pageLogoId = $(".selectedForm").parent().attr("id");
		var colInnerObj = "";
		var colInnerType = "";
		if ($ctrl.parent().hasClass("colInner")) {
			var colunmID = $ctrl.parent(".colInner").attr("columnidx");
			if (colunmID) {
				colInnerObj = colunmID;
				colInnerType = "column";
			} else {
				colInnerObj = $ctrl.parent(".colInner");
				colInnerType = "colbox";
			}
		}
		var nextObjId = $ctrl.next().attr("ctrlId");

		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
			e.addCtrlUndo(colInnerType, colInnerObj, $ctrl, nextObjId, pageLogoId);
		});
		if ($(".selectedForm").hasClass("slideInputForm") && $ctrl.attr("ctrl-type") == 'TIME') {
			$(".ctrlValue").show();
		}

	}

	/**
	 * @desc 组件添加
	 * @param {Object} dragger 拖动原始对象
	 * @param {Object} ctrlObj 真实控件对象
	 */
	function componentAdd(componentType, dragger) {
		var component = allCtrls[componentType], $component = $(component.get().html);
		//将当前组件添加到页面上
		dragger.replaceWith($component);
		onCtrlDroped(componentType, $component);
		ezCommon.setCtrlSelected($component);
		//初始化当前组件属性
		if (objIsnull(component.loadAttrs)) {
			component.loadAttrs($component);
		}
		//设置当前组件属性
		if (objIsnull(component.setAttrs)) {
			component.setAttrs($component);
		}
		if (objIsnull(component.loadAction)) {
			component.loadAction(componentType);
		}
		
		if ($(".selectedForm").hasClass("slideInputForm")) {
			$(".ctrlValue").show();
		}
	}

	/**
	 * @desc 组件添加
	 * @param {Object} dragger 拖动原始对象
	 * @param {Object} ctrlObj 真实控件对象
	 */
	function thirdpartyComponentAdd(thirdpartyComponentType, dragger) {
		var thirdpartyComponent = allCtrls[thirdpartyComponentType], $thirdpartyComponent = $(thirdpartyComponent.get().html);
		//将当前组件添加到页面上
		dragger.replaceWith($thirdpartyComponent);
		onCtrlDroped(thirdpartyComponentType, $thirdpartyComponent);
		ezCommon.setCtrlSelected($thirdpartyComponent);
		//初始化当前组件属性
		thirdpartyComponent.loadAttrs($thirdpartyComponent);
		thirdpartyComponent.setAttrs($thirdpartyComponent);

	}

	/**
	 * @desc 当控件被添加到界面时，所有需要处理的逻辑
	 */
	function onCtrlDroped(ctrlType, $ctrl) {
		//更新控件序号
		ezCommon.updateCtrlIndex();
		//当前控件设置为选中状态
		ezCommon.setCtrlSelected($ctrl);
		var ctrl = allCtrls[ctrlType], index = ezCommon.ctrlNameNum[ezCommon.formId], title = ctrl.get().cName + index, ctrlId = ctrlType + index;
		//如果是自定义组件则先获取名字
		if (ctrlType == "compLogic") {
			title = $ctrl.find(".dynamicName").text();
		}
		//如果当前控件是系统组件， 则给每个组件加上ID
		if ($ctrl.attr("ctrl-type") == "systemCp") {

			switch(ctrlType) {
				case "baiduMap":
				case "swiper" :
					$ctrl.children(":first").attr("id", ctrlId);
					break;
			}
		}
		$ctrl.attr("ctrlId", ctrlId).find(".fieldTitle").html(title);
		//每个控件（.ctrl）中的表单控件（如input select等）都有一个共同的属性:isbasectrl
		$ctrl.find("[isbasectrl]").attr("name", ctrlId);

		//如果当前表单输入模式为滑出式输入，则控件添加时，要修改控件的部分样式
		if ($(".selectedForm").hasClass("slideInputForm") && $ctrl.hasClass("imFormCtrl") && $ctrl.attr("ctrl-type") != "IMAGE") {
			$ctrl.addClass("slideOutInput").find(".fieldTitle,.formInputArrow").show().css("padding-bottom", "8px");
			$ctrl.addClass("slideOutInput").find(".ctrlValue").show();
		}
		ctrl.set($ctrl);
		ctrl.init($ctrl);

		if (ctrl.onDropped) {
			ctrl.onDropped($ctrl);
		}
	
		//重新计算Form高度
		ezCommon.resetFormHeight();
		
		//控件在鼠标移入时，显示拖动手柄
		ezCommon.ctrlMouseOver();
		
		//是否添加到了组件中
		$isDropInComp = $ctrl.closest("[ctrl-type='compLogic']");
		//如果控件添加到了组件中
		if ($isDropInComp.length) {
			var $colInner = $ctrl.closest("[colunit]");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				//组件其他列一同添加
				e.autoAddCtrl($ctrl, $colInner, $isDropInComp);
			});
		}

		//添加控件JSON节点
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.add(ctrlType, ctrlId, title, function(itemId1, itemId2) {
				$ctrl.find(".ctrlWraper .itemLabel:first").addClass(itemId1);
				$ctrl.find(".ctrlWraper .itemLabel:last").addClass(itemId2);
			});
		});
		//数据属性的显示和隐藏
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
			if (ctrlType == "TEXTBOX" || ctrlType == "TEXTAREA" || ctrlType == "DROPDOWN" || ctrlType == "TIME") {
				e.showDataSetting();
			} else {
				e.hideDataSetting();
			}
		});

	}


	module.exports = CONTROLER;
});
