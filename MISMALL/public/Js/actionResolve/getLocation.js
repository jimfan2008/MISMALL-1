/**
 * @author 柯斌
 * @desc 获取地理位置
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var getLocation = {
		
		/**
		 * 获取地理位置
		 */
		getLocation : function($ctrlObj, cJson) {
		
			var address = "";
			//获取地理位置
			wx.getLocation({
				success : function(res) {
					wxLbs = res;
					wxLbs.latitude = res.latitude;
					// 纬度，浮点数，范围为90 ~ -90
					wxLbs.longitude = res.longitude;
					// 经度，浮点数，范围为180 ~ -180。
					var accuracy = res.accuracy;
					// 位置精度
					var speed = res.speed;
					// 速度，以米/每秒计
					//latlng=22.667231,114.218430
					$.ajax({
						url : "http://maps.google.cn/maps/api/geocode/json?latlng=" + res.latitude + "," + res.longitude + "&sensor=true",
						success : function(res) {
							address = res["results"][0]["formatted_address"].split("邮政编码")[0];
							var ctrl = cJson["ctrl"];
							$.each(ctrl, function(key, value) {
								if (value["dataType"] == "form") {
									$("[name ='" + value["valueType"] + "']").val(address);
								} else if (value["dataType"] == "controls") {
									$("[ctrlId='" + value["valueType"] + "']").find("[byctrlalign]").html(address);
								}
							});
						},
						error : function() {
							alert("获取地理位置失败");
						}
					});
				},
				cancel : function() {
					alert("cancle");
					// 用户取消获取地理位置后执行的回调函数
				},
				fail : function(res) {
					alert(JSON.stringify(res) + "fail");
				}
			});

			return true;

		}
	};
	module.exports = getLocation;
});
