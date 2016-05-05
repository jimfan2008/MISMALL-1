/**
 * @author 樊智勇
 * @desc 滑动滑动选择控件
 * @time 2016-04-11
 */

define(function(require, exports, module) {

	//选项框控件对外接口
	var pick = {

		get : function() {

			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {
			$obj.find(".ctrlWraper").sortable({
				placeholder : "ui-state-highlight"
			});
		},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj) {
			var $selectedForm = $(".selectedForm");
			$obj.find(".ctrlValue,.formInputArrow").click(function() {
		//	$("#myWeb").on("click", ".imFormCtrl ", function(e){
				var fieldTitle = $(this).parent().find(".fieldTitle").html();
				var $inputPanel = $selectedForm.next(".inputPanel");
				var $ipTitle = $inputPanel.find(".ipTitle");
				var $ipEditBox = $inputPanel.find(".ipEditBox");
				$ipTitle.html("选择" + fieldTitle);
				var $itemLabelClone = $obj.find(".itemLabel").clone();
				$itemLabelClone.appendTo($ipEditBox.empty());
				//绑定滑出式输入面板中选项的单击事件
				ezCommon.inputPanelItemClick($itemLabelClone);
				$inputPanel.data("ctrl", $obj);
				if ($selectedForm.hasClass("slideInputForm")) {
					$selectedForm.next(".inputPanel").show().animate({
						"right" : 0
					}, 300);
				}
			});

			$obj.find(".itemLabel").unbind("click").click(function(e) {
				preventDefault(e);
				stopEventBubble(e);
				var $this = $(this);
				var $ctrl = $this.closest(".ctrl");
				itemClick($this, $ctrl);
			});
		},

		/**
		 * 选项单击选中和反选功能对外接口
		 */
		itemCheck : function($itemLabel, $ctrl) {
			itemClick($itemLabel, $ctrl);
		},

		/**
		 * 加载控件属性
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(ctrl);
			});
		},

		/**
		 * 加载控件动作
		 */
		loadAction : function(ctrlType) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAction(ctrlType);
			});
		},

		/**
		 * 设置控件属性
		 */
		setAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.setAttrs(ctrl);
			});
		}
	};

	var ctrl = {

		html : '<div class="row ctrl imFormCtrl" ctrl-type="pick"><label class="control-label fieldTitle col-xs-3">滑动选择</label><div class="ctrlWraper col-xs-8 input-group"><input type="text" isbasectrl="true" id="open" name="滑动选择" class="ctrlisrdonly form-control" ></input></div><span class="help-block ctrlproInfo" style="margin-left:90px;"></span><div class = "ctrlValue"></div><div class = "formInputArrow">&gt;</div><div class = "ctrlIconWraper"></div></div>',
		cName : '滑动选择',
		attrs : {

			General : ["title", "proInfo", "isHidden"],
			Item : ["addItem", "items"]
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
						"addLogic" : "逻辑处理",
						"autoCalc" : "自动运算",
						"autoFill" : "自动填充",
						"callRule" : "调用规则",
						"ctrlHideOrShow" : "控件显示隐藏",
						"oneTouchDial" : "一键拨号",
						"setOperationMsgTip" : "操作提示",
						"unlockOrLocking" : "控件锁定解锁",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "组件数据更新",
						"componentUpdateData" : "数据更新",
						"dataSourceUpdate" : "数据源更新",
						"deleteData" : "删除数据",
						"moreLayout" : "绑定制作层",
					},
					"wx" : {
						"attention" : "关注公众号",
						"generatedQrcode" : "生成二维码",
						"getLocation" : "获取地理位置",
						"playRedEnvelope" : "发红包",
						"sendMessage" : "发送消息",
						"setPay" : "微信支付",
						"setWXNotice" : "微信通知"
					}
				}
			},
			/*
			 change : {
			 title : "值改变",
			 action : {
			 "base" : {
			 "pageJump" : "页面跳转",
			 "autoCalc" : "自动运算",
			 "autoFill" : "自动填充",
			 "callRule" : "调用规则",
			 "ctrlHideOrShow" : "控件显示隐藏",
			 "oneTouchDial" : "一键拨号",
			 "setOperationMsgTip" : "操作提示",
			 "unlockOrLocking" : "控件锁定解锁",
			 },
			 "data" : {
			 "addNewData" : "新增数据",
			 "componentUpdate" : "组件数据更新",
			 "componentUpdateData" : "数据更新",
			 "dataSourceUpdate" : "数据源更新",
			 "deleteData" : "删除数据",
			 "moreLayout" : "绑定制作层",
			 },
			 "wx" : {
			 "attention" : "关注公众号",
			 "generatedQrcode" : "生成二维码",
			 "getLocation" : "获取地理位置",
			 "playRedEnvelope" : "发红包",
			 "sendMessage" : "发送消息",
			 "setPay" : "微信支付",
			 "setWXNotice" : "微信通知"
			 }
			 }
			 }*/
		}
	};

	/**
	 * 选项控件中的各选项单击事件
	 */
	function itemClick($this, $ctrl) {
		var ctrlName = $ctrl.attr("ctrlId");
		var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
		var $ctrlWrapper = $ctrl.find(".ctrlWraper");
		var $selectedItem = $ctrlWrapper.find(".itemLabel.onChecked");
		var $allChecked = $ctrlWrapper.find("input[type='checkbox']:checked");
		var $thisCheckBox = $this.find("input[type='checkbox']");
		if (selectLimit == "1") {
			$ctrlWrapper.find(".itemLabel").removeClass("onChecked");
			//单选或复选按钮选中时,移出选中的类(class)
			$this.addClass("onChecked");
			$allChecked.removeAttr("checked");
			$thisCheckBox.attr("checked", "checked");
		} else if ($selectedItem.length < selectLimit) {
			if ($this.hasClass("onChecked")) {
				$this.removeClass("onChecked");
				$thisCheckBox.removeAttr("checked");
			} else {
				$this.addClass("onChecked");
				$thisCheckBox.attr("checked", "checked");
			}
		} else if ($this.hasClass("onChecked")) {
			$this.removeClass("onChecked");
			$thisCheckBox.removeAttr("checked");
		}
	}

	/**
	 * 滑出面板里选项的单击事件绑定
	 */
	function inputPanelItemClick($itemLabel) {
		$itemLabel.click(function(e) {
			preventDefault(e);
			stopEventBubble(e);
			var $this = $(this);
			var $inputPanel = $this.closest(".inputPanel");
			var $ctrl = $inputPanel.data("ctrl");

			var ctrlName = $ctrl.attr("ctrlId");
			var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
			var $selectedItem = $inputPanel.find(".itemLabel.onChecked");
			if (selectLimit == "1") {
				$inputPanel.find(".itemLabel").removeClass("onChecked");
				//单选或复选按钮选中时,移出选中的类(class)
				$this.addClass("onChecked");
			} else if ($selectedItem.length < selectLimit) {
				if ($this.hasClass("onChecked")) {
					$this.removeClass("onChecked");
				} else {
					$this.addClass("onChecked");
				}
			} else if ($this.hasClass("onChecked")) {
				$this.removeClass("onChecked");
			}

		});
	}


	module.exports = pick;
});
