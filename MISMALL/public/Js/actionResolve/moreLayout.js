/**
 * @author 柯斌
 * @desc 绑定制作层
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var moreLayout = {
		/*
		 * 绑定制作层
		 */
		moreLayout : function($ctrlObj, cJson) {
			var queryId = 0, field = null;
			$.each(cJson["ctrl"], function(key, value) {
				queryId = value["queryId"];
				field = value["field"];
			});

			var url = decodeURI(location.href), paraArray = url.split("/"), layId = "";
			for (var i = 0; i < paraArray.length; i++) {
				if (paraArray[i] == "layId") {
					layId = paraArray[i + 1];
				}
			}
			if (queryId) {
				var jsonParam = {
					"type" : "select",
					"queryId" : queryId, //
					"form" : ezCommon.getCurrFormValueList(),
					"where" : {
						//"fieldName" : "layId",
						//"fieldValue" : layId,
						//"logic" : "and",
						//"arith" : "eq"
					},
					"mask" : false //是否有子查询 无
				};
				var data = ezCommon.curd(jsonParam);
				if (data.length > 0) {
					var html = data[0]["cc_more_layout_data"], formId = data[0]["cc_more_layout_extend"];
					var $html = $(html).removeClass("editor-layer-switch").addClass("layer-switch").attr("syscomtype", "layer-switch");
					var htmlList = [];
					$.each(data, function(key, value) {
						htmlList.push(value[field]);
					});

					var $htmlList = $(htmlList.join(""));

					if ($("body").find("form .layer-switch").length > 0) {
						var index = $htmlList.find(".wxqyPage").length + 1;
						var $vgPage_notLast = $(".myForm").addClass("swiper-container").find(".layer-switch:first .wxqyPage:not(:last)");
						$vgPage_notLast.remove();
						//移除掉除最后一页提交页面外的所有页面，用于制作层数据更新（显示下一条数据）
						$(".myForm").addClass("swiper-container").find(".layer-switch:first .wxqyPage:first").removeClass("layer_1").addClass("layer_" + index).attr("layerval", index).before($htmlList);
					} else {
						$(".myForm").addClass("swiper-container").append($html);
					}

					if (formId) {
						$(".myForm").attr("id", formId);
						formResolve.base.saveFormData();
						var formData = ezCommon.getFormJsonData(formId);
						Global.ezForm.controlLists[formId] = formData["controlLists"];
						var ctrlList = formData["tabs"]["tab1"]["ctrlList"];
						$.each(ctrlList, function(key, value) {
							var structor = $("form [ctrlId='" + value + "']");
							var ctrlData = Global.ezForm.controlLists[formId][value];
							//formResolve.base.init(ctrlData, structor, value);
							var operationsJson = ctrlData["operations"];
							if (operationsJson) {
								formResolve.base.getActionSetting.actionEvent(ctrlData["operations"], structor);
							}
						});
					}
					$(".teamMember").removeClass("teamMember");
					//项目点评时，图片不可以更换
					$(".editImgBtn").remove();

					//去掉文字编辑虚线
					$('.vgPage [ctrl-type="ctrl-text"]').css("border", "0");

					//层切换
					var $layer = $(".layer-switch");
					var layerLen = $layer.length;
					if (layerLen > 0) {
						$layer.css({
							"width" : "",
							"height" : "",
							"transition-duration" : "",
							"transform" : ""
						});
						$layer.find(".vgPage").css({
							"width" : "100%",
							"height" : "100%"
						});
						$layer.find(".markLayer").remove();
						$("form").css({
							"height" : "100%",
							"padding" : "0"
						}).addClass("swiper-container");
						$layer.addClass("swiper-wrapper");
						$layer.find(".ctrlIconWraper").remove();
						$layer.find(".pageFigure").css({
							"height" : "0"
						});
						$layer.find(".layer_1").css({
							"height" : "100%"
						});
						$layer.find(".vgPage:first").show();
						var num = $layer.find(".pageFigure").length;
						var arrow = '<section class="ms-arrow-bottom"><div class = "lastPageTip">最后一页</div><div class="upArrow"><img src="' + PUBLIC_PATH + '/Images/ms-up-arrow.png" /></div></section>';
						var $layerParent = $layer.parent();
						var isArrow = $layerParent.find(".ms-arrow-bottom").length;
						if (!isArrow) {
							$layerParent.append(arrow);
						}
						if (temp_siteId == '1286') {
							var lastPageContent = $("#layerLastPage").html();
							$layer.append(lastPageContent);
						}
						/*$(".swiper-wrapper").find("div[Vishiden = true]").each(function(index) {
						 $(this).addClass("vgPage").show().css("opacity", "1");
						 });*/
						$("form").find(".wxqyPage").show().css({
							"opacity" : "1"
						}).addClass("vgPage");

						ezCommon.setMainHeight();

						require.async("idangerousSwiper", function() {
							var mySwiper = new Swiper('.swiper-container', {
								speed : 250,
								//transforms3d : true,
								//slidesPerView : 1,
								preventLinks : false,
								mode : 'vertical',
								removeResizeEvent : false,
								onSlideNext : function() {

								},
								onSlideChangeEnd : function() {
									var layid = $(".swiper-slide-visible").attr("layerval"), maxlayid = $(".vgPage:visible").length;
									if (layid == maxlayid) {
										$(".arrow .upArrow").hide();
										$(".arrow .lastPageTip").show();
										$(".ms-arrow-bottom").css("animation-play-state", "paused");
									} else {
										$(".ms-arrow-bottom .upArrow").show();
										$(".ms-arrow-bottom .lastPageTip").hide();
										$(".ms-arrow-bottom").css("animation", "running");
									}
								}
							});
						});
						if ($(".is-input")[0]) {
							$(".is-input").remove();
							$(".is-arrow-wrap").remove();
							$("#prveInputContent").css({
								"position" : "absolute",
								"left" : "50%",
								"top" : "-20px"
							}).show();
						}
					}
				} else {
					alert("~哦~，亲,没有数据了！");
				}
			}
			return true;
		},
	};
	module.exports = moreLayout;
});
