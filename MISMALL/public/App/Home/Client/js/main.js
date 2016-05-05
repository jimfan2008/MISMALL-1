jQuery(function($) {
	'use strict',
	//Initiat WOW JS
	//new WOW().init();
		// 切换帐号
	$(".switchUser").on("click", function() {
		$.ajax({
			url : ROOTPATH + '/Passport/logout',
			dataType : 'text',
			success : function(r) {
				location.href = APPPATH + "/Unregistered/login.html";
			}
		});

	});

	// 退出登陆
	$(".logout").on("click", function() {
		$.ajax({
			url : ROOTPATH + '/Passport/logout',
			dataType : 'text',
			success : function(r) {
				location.href = APPPATH + "/Unregistered/index.html";
			}
		});

	});
});
