/**
 * @author 唐苗
 * @desc 抽奖转盘
 * @time 2015-10-20
 */

define(function(require, exports, module) {
	require("easing");
	require("rotateTurn");
	//文本框控件对外接口
	var LotteryTurn = {
		get : function() {
			return ctrl;

		},
		set : function() {
		},
		init : function($ctrl) {
			$ctrl.find("#lotteryTip").click(function(e) {
				stopEventBubble(e);
				var lotteryView = ezCommon.controlLists[ezCommon.formId][$ctrl.attr("ctrlId")]["attrs"]["general"]["lottery"];
				roll($ctrl, lotteryView);
			});
		},
		/**
		 * 加载控件属性
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(ctrl);
			});
		},
		/**
		 * 设置控件属性
		 */
		setAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.setAttrs(ctrl);
			});
		}
	};
	function GetRandomNum(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		return (Min + Math.round(Rand * Range));

	}

	function roll($ctrl, lotteryView) {
		var angle = 0;
		var area = null;
		var degree = 0;
		var Rand_num = GetRandomNum(1, 99);
		var thanks_num = 0;
		if (lotteryView == "1") {
			switch(Rand_num) {
				case "2":
					area = "win_1";
					degree = 720;
					break;
				case "32":
					area = "win_2";
					degree = 840;
					break;
				case "62":
					area = "win_3";
					degree = 960;
					break;
				default :
					area = "thanks_1";
					thanks_num = GetRandomNum(1, 3);
					if (thanks_num == 1) {
						degree = 780;
					} else if (thanks_num == 2) {
						degree = 900;
					} else if (thanks_num == 3) {
						degree = 1020;
					}
			}
		}
		if (lotteryView == "2") {
			switch(Rand_num) {
				case "2":
					area = "win_1";
					degree = 720;
					break;
				case "32":
					area = "win_2";
					degree = 900;
					break;
				default :
					area = "thanks_2";
					thanks_num = GetRandomNum(1, 4);
					if (thanks_num == 1) {
						degree = 780;
					} else if (thanks_num == 2) {
						degree = 840;
					} else if (thanks_num == 3) {
						degree = 960;
					} else if (thanks_num == 4) {
						degree = 1020;
					}
			}
		}
		if (lotteryView == "3") {
			switch(Rand_num) {
				case "2":
					area = "win_1";
					degree = 720;
					break;
				case "32":
					area = "win_2";
					degree = 840;
					break;
				case "62":
					area = "win_3";
					degree = 960;
					break;
				default :
					area = "thanks_3";
					thanks_num = GetRandomNum(1, 3);
					if (thanks_num == 1) {
						degree = 780;
					} else if (thanks_num == 2) {
						degree = 900;
					} else if (thanks_num == 3) {
						degree = 1020;
					}
			}
		}
		if (lotteryView == "4") {
			switch(Rand_num) {
				case "2":
					area = "win_1";
					degree = 720;
					break;
				case "32":
					area = "win_2";
					degree = 1020;
					break;
				case "62":
					area = "win_3";
					degree = 900;
					break;
				case "82":
					area = "win_4";
					degree = 840;
					break;
				default :
					area = "thanks_4";
					thanks_num = GetRandomNum(1, 2);
					if (thanks_num == 1) {
						degree = 780;
					} else if (thanks_num == 2) {
						degree = 960;
					}
			}
		}
		if (lotteryView == "5") {
			switch(Rand_num) {
				case "2":
					area = "win_1";
					degree = 720;
					break;
				case "32":
					area = "win_2";
					degree = 1020;
					break;
				case "62":
					area = "win_3";
					degree = 960;
					break;
				case "82":
					area = "win_4";
					degree = 900;
					break;
				case "92":
					area = "win_5";
					degree = 840;
					break;
				default :
					area = "thanks_5";
					degree = 780;
			}
		}
		var zhuan = setInterval(function() {
			$ctrl.find("#lotteryTip").unbind();
			angle += 15;
			$ctrl.find("#lotteryImg").rotate(angle);
			if (angle >= degree) {
				clearInterval(zhuan);
				switch(area) {
					case "win_1":
						alert("恭喜您获得一等奖!");
						break;
					case "win_2":
						alert("恭喜您获得二等奖!");
						break;
					case "win_3":
						alert("恭喜您获得三等奖!");
						break;
					case "win_4":
						alert("恭喜您获得四等奖!");
						break;
					case "win_5":
						alert("恭喜您获得五等奖!");
						break;
					case "thanks_1":
					case "thanks_2":
					case "thanks_3":
					case "thanks_4":
					case "thanks_5":
						if (thanks_num == 1) {
							alert("谢谢参与！！");
						} else if (thanks_num == 2) {
							alert("谢谢参与！！");
						} else if (thanks_num == 3) {
							alert("谢谢参与！！");
						} else if (thanks_num == 4) {
							alert("谢谢参与！！");
						} else if (thanks_num == 5) {
							alert("谢谢参与！！");
						}
						break;
					default:
				}
				$ctrl.find("#lotteryTip").bind("click", function(e) {
					stopEventBubble(e);
					var lotteryView = ezCommon.controlLists[ezCommon.formId][$ctrl.attr("ctrlId")]["attrs"]["general"]["lottery"];
					roll($ctrl, lotteryView);
				});
			}
		}, 60);
	}

	var ctrl = {
		html : '<div class="row ctrl" syscomtype="LotteryTurn" fieldsum="true"  ctrl-type="systemCp"  style="width: 338px;height: 338px;position: relative;overflow: hidden;"><div class="zhuanpan"><img id="lotteryImg" src="' + SITECONFIG.PUBLICPATH + '/App/Qywx/Images/lottery1.png"><img id="lotteryTip" src="' + SITECONFIG.PUBLICPATH + '/App/Qywx/Images/four1.gif"></div><div title="删除" class="ctrlIconWraper" style="right:20px;"></div></div>',
		cName : '抽奖转盘',
		attrs : {
			General : ["activityName", "lotteryChance", "lotteryNumber"],
			Validate : ["startTime", "endTime"]
		},
	};
	module.exports = LotteryTurn;
});
