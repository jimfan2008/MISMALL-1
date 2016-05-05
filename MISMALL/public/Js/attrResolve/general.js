/**
 * @author 柯斌
 * @desc 常规属性解析
 */
define(function(require,exports,module){
	var general = {
		/**
			 * 常规属性
			 * @param     json    generalAttr     常规属性json对象
			 * @param     object  $ctrlHtml       控件基本结构
			 */
			general : function(generalAttr, $ctrlHtml) {
				if (generalAttr) {
					$.each(generalAttr, function(k, v) {
						$ctrlHtml.find("button").attr("btn-width", "100");
						$ctrlHtml.find("button").attr("btn-round", "0");

						switch (k) {
							case "ctrlTitle":
								var ctrlTitle = $ctrlHtml.find(".fieldTitle");
								if (ctrlTitle)
									ctrlTitle.text(v);
								break;
							case "tip":
								var ctrlTip = $ctrlHtml.find(".ctrlproInfo");
								if (ctrlTip)
									ctrlTip.text(v);
								break;
							case "backgroundColor":
								if ($ctrlHtml.find("button")) {
									$ctrlHtml.find("button").css("background", v);
									break;
								} else if ($ctrlHtml.find("input")) {
									$ctrlHtml.find("input").css("background", v);
									break;
								}
							case "fontBackgroundColor":
								$ctrlHtml.find("button").css("color", v);
								break;
							case "ClickColor":
								if ($ctrlHtml.find("button"))
									$ctrlHtml.attr("data-ClickColor", v);
								break;
							case "isSubmit":
								$ctrlHtml.find("button").attr("issubmit", "true");
								//$ctrlHtml.find("button").text("提交");
								break;
							case "unit":
								var ctrlUnit = $ctrlHtml.find(".unit");
								if (ctrlUnit)
									$ctrlHtml.find(".ctrlWraper").find(">div").addClass("input-group").find(">span").removeAttr("style");
								ctrlUnit.text(v);
								break;
							case "isRdOnly":
								$ctrlHtml.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled", "disabled").css("background", "#f5f5f5");
								break;
							case "isEdit":
								$ctrlHtml.find(".ctrlWraper .form-control").removeAttr("readonly");
								break;
							case "isHidden":
								/** 如果是设计器页面则半透明控件，否则隐藏控件**/
								if (objIsnull($("#ctrlArea"))) {
									$ctrlHtml.find(".formCtrl").css("opacity", "0.2");
								} else {
									$ctrlHtml.find(".formCtrl").hide();
								}
								break;
							case "DisEnabled":
								$ctrlHtml.find(".ctrlWraper .btn").attr("disabled", "disabled");
								break;
							case "isBorder":
								$ctrlHtml.find(".formCtrl").find("input").css("border", "none");
								break;
							case "isTitleElse":
								$ctrlHtml.find(".fieldTitle").css("display", "none");
								$ctrlHtml.find(".col-xs-9").removeClass("col-xs-9").addClass("col-xs-12");

								break;
							case "isTitle":
								if (v == 0) {
									$ctrlHtml.find(".fieldTitle").css("display", "block");
									$ctrlHtml.find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-9");

								} else if (v == 1) {
									$ctrlHtml.find(".fieldTitle").css("display", "none");
									$ctrlHtml.find(".col-xs-9").removeClass("col-xs-9").addClass("col-xs-12");
								}
								break;
							case "selectedView":
								if (v == 0) {
									$ctrlHtml.find(".ctrlWraper").removeClass("btnRadio circleRadio").addClass("initRadio");
									$ctrlHtml.find(".ctrlWraper .itemLabel").removeClass("buttonType radioImgOval").addClass("radioImg");
								} else if (v == 1) {
									$ctrlHtml.find(".ctrlWraper").removeClass("initRadio circleRadio ").addClass("btnRadio");
									$ctrlHtml.find(".ctrlWraper .itemLabel").removeClass("radioImg radioImgOval").addClass("buttonType");
								} else if (v == 2) {
									$ctrlHtml.find(".ctrlWraper").removeClass("initRadio btnRadio").addClass("circleRadio");
									$ctrlHtml.find(".ctrlWraper .itemLabel").removeClass("radioImg buttonType").addClass("radioImgOval");
								}

							case "btnAlign":
								$("#siteContent").css({
									"display" : "block",
									"opacity" : 1
								});
								var name = $ctrlHtml.find(".btn").attr("name");
								var $btn = $(".btn[name='" + name + "']"), btnWidth = $btn.innerWidth(), ctrlWraperWidth = $btn.closest(".formCtrl").outerWidth(), center = Math.floor((ctrlWraperWidth - btnWidth) / 2), right = ctrlWraperWidth - btnWidth;
								$btn = $ctrlHtml.find(".btn[name='" + name + "']");
								if (v == 0) {
									$btn.parent().css({
										"text-align" : "left"
									});
									$btn.attr("data-align", "left");
									$ctrlHtml.find("btn-align-set a").css({
										"background" : "#f6f6f6",
										"color" : "#000"
									});
									$ctrlHtml.find("btn-align-set").find(".btnAlign0").css({
										"background" : "#017AD2",
										"color" : "#fff"
									});
								} else if (v == 1) {
									$btn.parent().css({
										"text-align" : "center"
									});
									$btn.attr("data-align", "mid");
									$ctrlHtml.find("btn-align-set a").css({
										"background" : "#f6f6f6",
										"color" : "#000"
									});
									$ctrlHtml.find("btn-align-set").find(".btnAlign1").css({
										"background" : "#017AD2",
										"color" : "#fff"
									});
								} else if (v == 2) {
									$btn.parent().css({
										"text-align" : "right"
									});
									$ctrlHtml.find("btn-align-set a").css({
										"background" : "#f6f6f6",
										"color" : "#000"
									});
									$btn.attr("data-align", "right");
									$ctrlHtml.find("btn-align-set").find(".btnAlign2").css({
										"background" : "#017AD2",
										"color" : "#fff"
									});
								}
								break;
							case "btnRound":
								$ctrlHtml.find("button").css("border-radius", v + "px").attr("btn-round", v);
								break;
							case "btnWidthChange":

								$ctrlHtml.find("button").css("width", v + "%").attr("btn-width", v);
								break;
							case "btnImgChange":
								$ctrlHtml.find("button").attr("haveImage", v);
								$ctrlHtml.find("button").css("backgroundImage", "url(" + v + ")");
								break;
							case "addChoose":
								if (v == 1) {
									var option = '<option value="__blank" selected = "selected">---请选择---</option>';
									if ($ctrlHtml.find("select option[value='__blank']").length <= 0) {
										if ($ctrlHtml.find("select option").length > 0) {
											$ctrlHtml.find("select option:first").before(option);
										} else {
											$ctrlHtml.find("select").append(option);
										}

									}
								}
								break;
						}
						/*
						* 按钮点击后颜色综合处理（start）
						*/
						//默认未设置点击颜色为白色
						$ctrlHtml.find("button").attr("data-ClickColor", "#ccc");
						//默认未设置背景颜色颜色为灰色
						$ctrlHtml.find("button").attr("data-bgColor", "#2795D0");
						//判断是否为预览页面
						if (!objIsnull($("#formSave"))) {
							//设置点击离开后背景颜色
							if (k == 'backgroundColor') {

								$ctrlHtml.find("button").css("background", v);
								$ctrlHtml.find("button").attr("data-bgColor", v);
								//取出dataClick属性中存的data-ClickColor值
								var clickColor = $ctrlHtml.find("button").attr("dataClick");
								$ctrlHtml.find("button").attr("data-ClickColor", clickColor);
								//将当前按钮背景颜色存入dataBg属性中
								var bgColor = $ctrlHtml.find("button").attr("data-bgColor");
								$ctrlHtml.find("button").attr("dataBg", bgColor);
							}
							//设置点击时背景颜色
							if (k == 'ClickColor') {

								$ctrlHtml.find("button").attr("data-ClickColor", v);
								//取出dataBg属性中存的data-bgColor值
								var bgColor = $ctrlHtml.find("button").attr("dataBg");
								$ctrlHtml.find("button").attr("data-bgColor", bgColor);
								//将当前按钮点击颜色存入dataClick属性中
								var clickColor = $ctrlHtml.find("button").attr("data-ClickColor");
								$ctrlHtml.find("button").attr("dataClick", clickColor);
							}
							//预览页面点击颜色事件触发
							$("body").find(".formCtrl").parent().unbind("click").click(function(e) {
								//preventDefault(e);
								//stopEventBubble(e);
								var $preClick = $('body').find("[clickFlag='true']");
								var clickColor = $(this).find("button").attr("data-ClickColor");
								var isImage = $preClick.find("button").attr("haveImage");
								if (!isImage) {
									$preClick.find("button").css("background", $preClick.find("button").attr("data-bgColor"));
								} else {
									$preClick.find("button").css("backgroundImage", "url(" + isImage + ")");
								}
								$(this).find("button").css("background", clickColor);
								$('body').find("[ctrltype='CCButton']").removeAttr("clickFlag");
								$(this).find("[ctrltype='CCButton']").attr("clickFlag", true);
							});
						}
						/*
						 * 按钮点击后颜色综合处理（end）
						 */
					});
				}
			}
	};
	module.exports = general;
});
