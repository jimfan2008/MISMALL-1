/**
 * @author 柯斌
 * @desc 组件筛选
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var componentUpdate = {
		/**
		 * 组件筛选
		 */
		componentUpdate : function($ctrlObj, cJson) {
			var query = $ctrlObj.val();
			if ($ctrlObj.attr("name")) {
				if ($ctrlObj.attr("name").split("ubmit").length > 1) {
					query = "";
				}
			}
			if ($ctrlObj.find("option").length && query != "__blank") {
				var $option = $ctrlObj.find("option:selected"), filed = $option.attr("field");
				query = $option.html() + "$$##!!@@**^^%%" + filed;
			}
			$.each(cJson["ctrl"], function(key, value) {
				var $dynamic = $("div[ctrlId='" + value["ctrlId"] + "']");
				var queryId = value["queryId"];
				if ($dynamic.size() > 0) {
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(COMPONENT) {
						ezCommon.pageSize++;
						var row = 1;
						if ($("#siteContent").length) {
							row = 0;
						}
						var newDynamic = COMPONENT.loadPageComponentsData($dynamic, null, null, query, row, ezCommon.pageSize, queryId);
						if (objIsnull(newDynamic) && (newDynamic.attr("ishiden") != "true" || $dynamic.is(":visible"))) {
							newDynamic.show();
						} else {
							$dynamic.hide();
						}
						var $vgPage = newDynamic.find(".vgPage:first");
						var vgPageH = $vgPage.height();
						var colCount = $vgPage.closest("[colunit]").attr("colunit");
						var newH = vgPageH / parseInt(colCount);
						newDynamic.find(".vgPage").css({
							height : newH,
							width : "100%",
							"min-height" : 0
						}).find(".editImgBtn").remove();

						$dynamic.replaceWith(newDynamic);
						$(".onchecked").removeClass("onChecked");
						$(".buttonChecked").removeClass("buttonChecked");
					});
				}
			});
			return true;
		},
	};
	module.exports = componentUpdate;
});
