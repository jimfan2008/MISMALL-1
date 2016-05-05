/**
 * @author 柯斌
 * @desc 修改数据
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var modifyData = {
		/**
		 * 修改数据
		 */
		modifyData : function($ctrlObj, cJson) {
			var rowId = $ctrlObj.closest("[rowId]").attr("rowId"), ctrlId = $ctrlObj.attr("name");
			var pageName = "preview";
			if (isWeiXin()) {
				pageName = "index";
			}
			/*******如果是通过页面参数的方式则不需要跳转******/
			$.each(cJson["ctrl"], function(key, value) {
				var pageId = value["pageId"], tableName = value["tableName"], recordId = value["recordId"];
				if (recordId == "currDataID") {
					window.location.href = encodeURI(URLPATH + "/" + pageName + "/siteId/" + temp_siteId + "/pageId/" + pageId + "/rowId/" + rowId);
				} else if (recordId == "pageParam") {

				}

			});
			return true;

		},
	};
	module.exports = modifyData;
});
