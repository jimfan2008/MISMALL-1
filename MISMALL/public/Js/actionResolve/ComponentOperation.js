/**
 * @author 
 * @desc   组件运算
 * @date   2016-04-24
 */

define(function(require, exports, module) {
	var ComponentOperation = {
		ComponentOperation: function($ctrlObj, cJson) {
			sum = 1, fillType = cJson["ctrl"]["aluName"], ctrlType = cJson["ctrl"]["resultName"];
			var ctrlJson = cJson["ctrl"]["compName"];
			var $form = $ctrlObj.parents("form");
			//var str =$form.find("div[fieldName ="+ctrlJson+"]").find(".fieldContent").text();
			var str = $form.find("div[fieldname =" + ctrlJson + "]");
			$.each(str, function() {
				$that = $(this);
				str = $that.find(".fieldContent").text();
				if (typeof str == "undefined") {
					str = 0;
				} else {
					str = isNaN(parseFloat(str)) ? 0 : parseFloat(str);
				}
				if (fillType == "相加") {
					sum = ezCommon.Reckon.calu.accAdd(sum, str);
					var oop = sum - 1;
					$("[name='" + ctrlType + "']").val(oop);
				} else if (fillType == "相乘") {
					sum = ezCommon.Reckon.calu.accMul(sum, str);
					var oop = sum;
					$("[name='" + ctrlType + "']").val(oop);

				}
				console.log(str)
			});

			return true;
		},

	};
	module.exports = ComponentOperation;
});