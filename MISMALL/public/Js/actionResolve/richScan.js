/**
 * @author 黄向腾
 * @desc 扫一扫
 * @date 2016-04-14
 */
define(function(require, exports, module) {


	var richScan = {
		richScan: function($ctrlObj, cJson) {
			var ctrlName = $ctrlObj.attr('name');
			var valueType = cJson['ctrl']['valueType'];
			wx.scanQRCode({
				desc: 'scanQRCode desc',
				needResult: 1,
				scanType: ["qrCode", "barCode"],
				success: function(res) {
					var result = res.resultStr
					
					$("[name='"+valueType+"']").val(result.substr(result.indexOf(",")+1));
				
				}
			
			});
			
		},
	};
	
	module.exports = richScan;
});