/**
 * @author 柯斌
 * @desc 选项属性解析
 * @date 2015-06-29
 */
 
define(function(require,exports,module){
	var item = {
			/**
			 * 选项
			 * @param     json     itemAttr       选项属性json对象
			 * @param     object   $ctrlHtml      控件基本结构
			 */
			item : function(itemAttr, $ctrlHtml) {
				$.each(itemAttr, function(k, v) {
					if (k == 'checked' && !$.isEmptyObject(v)) {
						if ($ctrlHtml.find(">div:first").attr("ctrlType") == "CCRadio") {
							$.each(v, function(i, n) {
								$ctrlHtml.find(".radio-inline").eq(i).addClass("onChecked");
								$ctrlHtml.find("input[type=radio]").eq(i).attr("checked", "checked");
							});
						} else if ($ctrlHtml.find(">div:first").attr("ctrlType") == "CCCheckBox") {
							$.each(v, function(i, n) {
								$ctrlHtml.find(".checkbox-inline").eq(i).addClass("onChecked");
								$ctrlHtml.find("input[type=checkbox]").eq(i).attr("checked", "checked");
							});
						}

					} else if (k == "itemRank") {//分多列排序
						if (v < 4) {
							$ctrlHtml.find(".itemLabel").addClass("col-md-" + 12 / v + " col-xs-" + 12 / v);
							$ctrlHtml.find(".itemLabel:gt(0)").css("margin-left", "0px");
						}
					}
				});

			}
	};
	module.exports = item;
});
