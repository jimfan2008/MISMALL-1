/**
 * @author 柯斌
 * @desc 动作集中调用解析
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var resolve = {
		/**
		 * 动作事件处理
		 * @param    json    operationsJson     事件json
		 * @apram    object  $ctrlComHtml       控件结构对象
		 */
		actionEvent : function(operationsJson, $ctrlComHtml, dataSaveAfter) {
			$.each(operationsJson, function(k, v) {
				if ((k == "dataSave" && !dataSaveAfter) || (k == "pageJump" && !dataSaveAfter)  || (k == "setWXNotice" && !dataSaveAfter)) {
					return;
				}
				var that = "";
				if (k == "leftSliding" || k == "rightSliding" || k == "load") {
					that = $("form");
				} else {
					if (dataSaveAfter == 1) {
						that = $ctrlComHtml.find("[isBaseCtrl]");
					} else if (dataSaveAfter == 2) {
						that = $("[ctrl-type=RADIO]").find("[isBaseCtrl]");
					} else if ($ctrlComHtml.hasClass("thisisField")) {
						$ctrlComHtml.attr("name", $ctrlComHtml.attr("ctrlId"));
						that = $ctrlComHtml;
					} else if ($ctrlComHtml.attr("ctrl-type") == "COLUMN") {
						$ctrlComHtml.attr("name", $ctrlComHtml.attr("ctrlId"));
						that = $ctrlComHtml;
					} else if ($ctrlComHtml.attr("ctrl-type") == "compLogic") {
						var colunit = $("[colunit]", $ctrlComHtml).attr("name", $ctrlComHtml.attr("ctrlId"));
						that = colunit;
					} else {
						that = $ctrlComHtml.find("[isBaseCtrl]");
					}
				}
				var actionJson = ezCommon.getActionJson(v);
				var _event = function($this_ctrl) {
					if (actionJson) {
						if ($this_ctrl) {
							that = $this_ctrl;
						}

						var callBack = callBackEvent(actionJson, that);
						callBack(), callBack = null;
					}
				};
				if (k == "load" || k == "dataSave" || k == "pageJump" || k == "leftSliding"|| k == "rightSliding") {
					_event();
				} else if (k == "change") {
					var name = that.attr("name");
					if(name != undefined) {
						if (name.split("RADIO").length > 1) {
						$("body").find(".itemLabel").click(function(e) {
								var type = e.type;
								_event($(this).find("input"));
							});
						} else {
	
							$("body").on(k, "[name='" + name + "']", function(e) {
								var type = e.type;
								_event($(this));
							});
						}
					}
					
				} else {
					var name = that.attr("name"), rf = true;
					rf = name ? that.attr("name").indexOf("RADIO") < 0 : false;
					if (rf) {
						$("body").off(k + "." + name).on(k + "." + name, "[name='" + name + "']", function(e) {
							var type = e.type;
							if ((e.keyCode == "13" && type == "keydown") || type == "click") {
								_event($(this));
							}
						});
					} else {

						that.unbind(k).on(k, function(e) {
							var type = e.type;
							if ((e.keyCode == "13" && type == "keydown") || type == "click") {
								_event($(e.target));
							}
						});

					}

				}
			});
		},
	};

	/**
	 * 获取具体动作json数据
	 * @param    Obj	actionjson 动作json
	 * @param    Obj     $ctrlObj	当前操作对像
	 */
	function callBackEvent(actionJson, $ctrlObj) {
		//actionJson= JSON.parse(actionJson);
		var sort = actionJson["sort"], i = 0;
		return function callBack() {
			if (!sort[i])
				return;
			var cJson = actionJson["actionList"][sort[i]];
			var funName = cJson["type"];
			require.async("./"+funName+".js?version="+SITECONFIG.VERSION,function(e){
				var r = e[funName]($ctrlObj, cJson, sort[i]);
				if (r) {
					i++;
					callBack();
				} else {
					throw new Error("方法最后没有返回值");
				}

			});
		};
	}


	module.exports = resolve;
});
