/**
 * @author 柯斌
 * @desc 发红包
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var playRedEnvelope = {
		/*
		 * 发红包
		 **/
		playRedEnvelope : function($ctrlObj, cJson) {
			if (cJson) {
				$.ajax({
					type : "POST",
					url : APPPATH + "/Site/Wechat/senRedPack",
					data : {
						"siteId" : SITEID,
						"proJsonData" : JSON.stringify(cJson["ctrl"]),
					},
					success : function(result) {
						if (result == 'success')
							alert("紅包发送成功");
						else
							alert(result);
					}
				});
				return true;
			}
		},
	};
	module.exports = playRedEnvelope;
});
