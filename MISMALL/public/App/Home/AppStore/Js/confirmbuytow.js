/**
 * @author
 */
$(function() {
	//返回到商品详细页面
	$(".title").click(function() {
		window.location = "shop_detail?id=" + pid;
	});
	$(".pro-img").click(function() {
		window.location = "shop_detail?id=" + pid;
	});
	//支付遇到困难
	$("#btnbuynow").click(function() {
		var ordernum = getUniqueStr();
		var tutext = $("#textUser").val();
		var tdtext = $("#textDay").val();
		if (tutext == "")
			$("#textUser").val(1);
		if (tdtext == "")
			$("#textDay").val(30);
		art.dialog({
			content : $("#tc_window").html(),
			opacity : 0.1,
			resize : false,
			drag : false,
			lock : true,
			title : "确认支付结果",

		});

	});

	function getUniqueStr() {
		var d = new Date();
		var yy = d.getFullYear(), mm = d.getMonth() + 1, dd = d.getDate(), hh = d.getHours(), min = d.getMinutes(), ss = d.getSeconds();
		ms = d.getMilliseconds();
		return "10" + yy + mm + dd + hh + min + ss + ms;
	};

});
	function playno() {
		window.location = GROUPPATH + "/MyCenter/my_order.html";
	}
	
	function playok() {
		window.location = GROUPPATH + "/MyCenter/my_order.html";
	}