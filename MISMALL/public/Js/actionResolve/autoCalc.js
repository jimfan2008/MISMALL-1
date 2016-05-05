/**
 * @author 柯斌
 * @desc 自动运算
 * @date 2015-06-29
 */

define(function(require,exports,module){
	var autoCalc = {
		autoCalc : function($ctrlObj, cJson) {

				var sum = 0;
				$.each(cJson["ctrl"], function(k, v) {
					var str = "", fillType = "";
					if (k == 0) {
						$.each(v, function(key, value) {
							var str = "";
							if (key.split("RADIO").length > 1) {
								str = $ctrlObj.val();
							} else {
								str = $("[name='" + key + "']").val();
							}
							if ( typeof str == "undefined") {
								str = 0;
							} else {
								str = isNaN(parseFloat(str)) ? 0 : parseFloat(str);
							}
							sum = ezCommon.Reckon.calu.accAdd(sum, str);
						});

					} else {
						$.each(v, function(key, value) {
							var fillType = value;
							var str = "";
							if (key.split("RADIO").length > 1) {
								str = $("[name='" + key + "']:checked").val();
							} else {
								isNaN(key) ? str = $("[name='" + key + "']").val() : str = key;
							}
							if (str != null && str != '') {
								if (fillType == "+") {
									sum = ezCommon.Reckon.calu.accAdd(sum, str);
								} else if (fillType == "-") {
									sum = ezCommon.Reckon.calu.accSub(sum, str);
								} else if (fillType == "×") {
									sum = ezCommon.Reckon.calu.accMul(sum, str);
								} else if (fillType == "÷") {
									if (str == 0) {
										str = 1;
										$("[name='" + key + "']").val(str);
									}
									sum = ezCommon.Reckon.calu.accDiv(sum, str);
								} else if (fillType == "=") {
									var oop = sum;
									$("[name='" + key + "']").val(oop);
								}
							} else {
								if (fillType == "=") {
									var oop = sum;
									$("[name='" + key + "']").val(oop);
								}

							}
						});

					}

				});
				return true;
			},
		
	};
	module.exports = autoCalc;
});
