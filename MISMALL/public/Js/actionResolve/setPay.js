/**
 * @author 柯斌
 * @desc 微信支付
 * @date 2015-06-29
 */
define(function(require,exports,module){
	var setPay = {
		
		/**
		 * 
        * @param {Object} $ctrlObj 当前操作的对象
        * @param {Object} cJson 当前操作对象的json数据
         *  微信支付 
		 */
		setPay : function($ctrlObj, cJson) {
				var rowId = $ctrlObj.closest("[rowId]").attr("rowId"), ctrlId = $ctrlObj.attr("name"), order = "", orderName = "", productsPrice = "", jumpId = "", productsName = "", tableName = '', $row = $ctrlObj.closest("[rowId]"), ctrlIdName = "", ctrlPrice = "", name = "", price = "";
				$.each(cJson["ctrl"], function(key, value) {
					productsPrice = value["productsPrice"];
					productsName = value["productsName"];
					ctrlIdName = value["ctrlIdName"];
					ctrlIdPrice = value["ctrlIdPrice"];
					tableName = value["tableName"];
					jumpId = value["pageId"];
					order = value["ctrlIdOrder"];
					orderName = value["productsOrder"];
				});
				var pageId = $(".selectedForm").parent().attr("id"), payType = "order";
				var orderSn = "";
				if (tableName != "undefined") {
					price = parseFloat($row.find("[fieldname='" + ctrlIdPrice + "'] .fieldContent").text());
					name = $row.find("[fieldname='" + ctrlIdName + "'] .fieldContent").text();
					orderSn = $row.find("[fieldname='" + order + "'] .fieldContent").text();
					payType = "order";
				} else {
					var $name = $(".selectedForm [ctrlId='" + ctrlIdName + "']"), ctrlType = $name.attr("ctrlType") || $name.attr("ctrl-type");
					if (ctrlType == "ctrl-text") {
						name = $name.find("[byctrlalign='true']").text();
					} else if (ctrlType == "CCButton") {
						$name.find("[name='" + ctrlIdName + "']").text();
					} else {
						name = $(".selectedForm [ctrlId='" + ctrlIdName + "'] [name='" + ctrlIdName + "']").val();
					}
					orderSn = $(".selectedForm [ctrlId='" + order + "'] [name='" + order + "']").val();
					price = parseFloat($(".selectedForm [ctrlId='" + ctrlIdPrice + "'] [name='" + ctrlIdPrice + "']").val());
					payType = "pay";
				}

				if (ctrlIdName == "undefined") {
					name = productsName;
				} else {

				}

				if (ctrlIdPrice == "undefined") {
					price = parseFloat(productsPrice);
				}

				if (order == "undefined") {
					orderSn = orderName;
				}

				$.ajax({
					type : "post",
					url : SITECONFIG.ROOTPATH + "/Site/Wechat/order",
					data : {
						"siteId" :SITECONFIG.SITEID,
						"orderType" : payType,
						"pageId" : pageId,
						"rowId" : rowId,
						"jumpId" : jumpId,
						//当前数据Id
						"tableName" : tableName,
						//数据表名
						"productsPrice" : price,
						//商品价格
						"productsName" : name, //商品名称
						"orderSn" : orderSn
					},

					dataType : "json",
					success : function(data) {
						if (data["status"] == "success") {
							if (jumpId == "__blank") {
								jumpId = pageId;
							}
							location.href = encodeURI(SITECONFIG.ROOTPATH + "/Site/Wechat/payment?pageId=" + pageId + "&siteId=" + SITECONFIG.SITEID + "&jumpId=" + jumpId + "&orderSn=" + data["info"] + "&ctrlId=" + ctrlId);

						} else {
							alert(data["info"]);
						}
					}
				});

				return true;
			},
		
	};
	module.exports = setPay;
});
