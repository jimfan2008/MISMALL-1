/**
 * @author 唐苗
 * @desc 层切换
 * @date 2016-04-14
 */

define(function(require, exports, module) {
	var logicRun = {
		initExe : function(herf) {
			layerSwitch.pageId = herf;
		},

		getLogicRelust : function(json) {
			return ["obj['initExe'](", json["value"], ")"].join("");
		}
	};
	var layerSwitch = {
		/* *
		 *层切换
		 */
		layerSwitch : function($ctrlObj, cJson) {
			// $ctrlObj = $ctrlObj.length ? $ctrlObj : $("[isSubmit]");
			// var pageId = cJson["ctrl"]["pageId"];
			// var formId = cJson["ctrl"]["formId"];
			// var $ctrlObjLogo = $ctrlObj.parents(".ctrl");
			// //判断是否设定了层切换
			// if ($ctrlObjLogo.attr("slideCtrl") == "true") {
				// var existPage = $("#myWeb").find(".layerSwitchPanel div[id=" + pageId + "]").length;
				// ezCommon.formId = formId;
				// //判断层切换内容是否已经加到当前页面中，如果已经加入则不需要再发送页面内容请求信息
				// if (existPage == 0) {
					// if (formId) {
						// var data = {};
						// var pageContent = "";
						// data["pageId"] = pageId;
						// data["siteId"] = SITECONFIG.SITEID;
						// _commonAjax({
							// type : "POST",
							// url : SITECONFIG.ROOTPATH + "/Site/Wechat/getPageContent",
							// data : data,
							// dataType : "json",
							// success : function(data) {
								// if (data) {
									// pageContent = data.pageContent.replace(/CTRLDYNAMIC/g, "compLogic");
									// var contentId = $(pageContent).attr('id');
									// $(".layerSwitchPanelContent").append(pageContent);
									// $(".layerSwitchPanel .wxqyPage").hide();
									// $(".layerSwitchPanel").find("div[id=" + contentId + "]").show();
									// $(".layerSwitchPanel").show().animate({
										// "right" : 0
									// }, 300);
								// }
							// }
						// });
					// }
				// } else {
					// $(".layerSwitchPanel .wxqyPage").hide();
					// $(".layerSwitchPanel").find("div[id=" + pageId + "]").show();
					// $(".layerSwitchPanel").show().animate({
						// "right" : 0
					// }, 300);
// 
				// }
// 
			// }
			return true;
		},
	};
	module.exports = layerSwitch;
});
