/**
 * 平台通用函数或方法,仅限于平台各模块内部使用
 * @author cy
 * 2014-10-14
 */
var tableNames = {};
var ezCommon = {
	//存储撤销恢复页面Id
	pageIdURdo : [],
	str : [],
	sty : [],
	pageSize : 0,
	ctrlActionCache : {},
	//缓存当前应用所有数据集
	cacheDataSource : [],
	//缓存数据源字段
	cacheQueryField : {},
	//加载是否显示  默认是显示
	isLoadShow : true,
	//缓存加载参数数据
	cacheLinkData : "",
	//记录下获取参数数据标识
	paramJson : "",
	recordQueryId : {},
	//是否开启debug
	DEBUG : true,

	data : null,

	//微信主菜单json对象
	menuJson : {},
	//页面管理JSON
	pageMenuJson : {
		"pageMgr" : [],
		"pageManage" : [],
		"pageMenu" : []
	},

	//表单JSON
	controlLists : {},

	//微信菜单唯一性
	menuNameNum : 0,
	//控件name唯一性，往后叠加
	ctrlNameNum : {},
	//动作标识序号
	actionNameNum : {},
	Obj : null,
	formId : 0,
	fdCtrl : null,
	dataObj : null,
	editor : null,
	changeImage : null,
	//kindEditor富文本对象全局
	kindEditorObj : null,
	//需要保存的页面pageId 集合 (包含拖动pagaManage.js中,新增，update,delete （formjson.js中） 四个动作)
	needSavePage : [],
	apiManageJsonCache : {}, //add by tlj 2015-11-12
	tableRelationJson : {}, //add by tlj 2016-3-10

	/**
	 * debug函数
	 */
	deBug : function(msg, fileName, lineNum) {
		if (ezCommon.DEBUG) {
			var date = new Date(), y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), h = date.getHours(), mi = date.getMinutes(), mm = date.getSeconds();
			mim = date.getTime();

			m = ("" + m).length <= 1 ? "0" + m : m;
			d = ("" + d).length <= 1 ? "0" + d : d;
			h = ("" + h).length <= 1 ? "0" + h : h;
			mi = ("" + mi).length <= 1 ? "0" + mi : mi;
			mm = ("" + mm).length < 1 ? "0" + mm : mm;

			timeStr = " --  " + y + "/" + m + "/" + d + "/ " + h + ":" + mi + ":" + mm + ":" + mim;

		}
	},

	//定位栏固定在头部时，重置Form高度
	resetFormHeight : function() {
		var myWebH = isMobile() ? $(window).height() : $("#myWeb").height();
		topNavH = parseInt($(".topNavWraper:visible").css("height")) || 0, bottomNavH = parseInt($(".bottomNavWraper:visible").css("height")) || 0;
		ezCommon.deBug("计算Form高度", "ezCommon", 83);
		$(".selectedForm").height(myWebH - topNavH - bottomNavH);
	},

	//鼠标移入控件时，显示拖动手柄
	ctrlMouseOver : function() {
		$(".ctrl").mouseover(function(e) {
			stopEventBubble(e);
			$(this).css({
				"outline" : "0 none",
				"box-shadow" : "0 0 0 1px #37a1ec"
			});
			$(this).find(" > .dyna-handle, > .ctrlIconWraper").css({
				"display" : "block"
			});
		});

		$(".ctrl").mouseout(function(e) {
			stopEventBubble(e);
			$(this).css({
				"outline" : "",
				"box-shadow" : "none"
			});
			$(this).find(" > .dyna-handle, > .ctrlIconWraper").css({
				"display" : "none"
			});
		});
	},

	/**
	 * 判断用户是否登录
	 */
	isLogin : function() {
		var b = false;
		$.ajax({
			url : ROOTPATH + "/Passport/isLogin",
			cache : false,
			async : false,
			success : function(data) {
				if (data != 0 && data != "0") {
					b = true;
				}
			}
		});
		return b;
	},

	/**
	 * 判断站点ID是否为空
	 */
	isSiteNull : function() {
		var siteid = 0;
		var bVal = false;
		if (esValidate.validateNull(SITEID) && SITEID != 0) {
			siteid = SITEID;
			$.ajax({
				type : "POST",
				url : ROOTPATH + "/Editor/Editor/isUserSite",
				data : {
					"siteId" : siteid
				},
				cache : false,
				async : false,
				success : function(data) {
					if (data > 0)
						bVal = true;
				}
			});
		}
		if (bVal) {
			return siteid;
		} else {
			return 0;
		}
	},

	/**
	 * 更新控件序号（在创建控件或组件时调用，以便生成新的ID号）
	 */
	updateCtrlIndex : function() {
		if (ezCommon.ctrlNameNum[ezCommon.formId]) {
			ezCommon.ctrlNameNum[ezCommon.formId]++;
		} else {
			ezCommon.ctrlNameNum[ezCommon.formId] = 1;
		}
	},

	/**
	 * 设置导航
	 */
	setNav : function() {

		$(".setNavWraper").each(function() {
			//更新控件序号
			ezCommon.updateCtrlIndex();
			var index = ezCommon.ctrlNameNum[ezCommon.formId];
			$(this).find("input[type = 'text']").attr("id", "nav-color-" + index);
		});

		$(".removeNavBtn").click(function() {
			if (confirm("确定要删除该导航菜单吗？")) {
				$nav = $(this).parent().parent();
				$nav.children().not($(this).parent()).remove();
				$nav.hide();
				//重新计算Form高度
				ezCommon.resetFormHeight();

				var pageid = $("#myWeb").find(".wxqyPage:visible").attr("id");
				if ($.inArray(pageid, ezCommon.needSavePage) == -1 && pageid != undefined) {
					ezCommon.needSavePage.push(pageid);
				}
			}
		});

		var $topNav = $(".topNavWraper"), $bottomNav = $(".bottomNavWraper");
		var topBgId = $(".navBgColor", $topNav).next("input").attr("id");
		var bottomBgId = $(".navBgColor", $bottomNav).next("input").attr("id");
		$("#" + topBgId).spectrum({
			color : "transparent",
			showAlpha : true,
			showInitial : true,
			showInput : true,
			showPalette : true,
			allowEmpty : true,
			chooseText : "确定",
			cancelText : "取消",
			change : function(color, colors) {
				$topNav.css("background-color", color);
			},
			move : function(color) {
				$topNav.css("background-color", color.toHslString());
			},
			hide : function(color) {
				$topNav.css("background-color", color.toHslString());
			},
			palette : [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)", "rgba(255,0,0,0)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)", "rgb(19, 79, 92)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]]
		});

		$("#" + bottomBgId).spectrum({
			color : "transparent",
			showAlpha : true,
			showInitial : true,
			showInput : true,
			showPalette : true,
			allowEmpty : true,
			chooseText : "确定",
			cancelText : "取消",
			change : function(color, colors) {
				$bottomNav.css("background-color", color);
			},
			move : function(color) {
				$bottomNav.css("background-color", color.toHslString());
			},
			hide : function(color) {
				$bottomNav.css("background-color", color.toHslString());
			},
			palette : [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)", "rgba(255,0,0,0)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)", "rgb(19, 79, 92)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]]
		});
	},

	/**
	 * 为栏位设置ID值（这里区别于分栏控件的ctrlId,而是其内部colInner的ID，用于组件内部）
	 */
	setColInnerId : function($colInner) {
		//更新控件序号
		ezCommon.updateCtrlIndex();
		var index = ezCommon.ctrlNameNum[ezCommon.formId], columnId = "column" + ezCommon.formId + index;
		$colInner.attr("columnIdx", columnId);

	},

	/**
	 * 表单动作中的运算
	 */
	Reckon : {
		calu : {
			accAdd : function(arg1, arg2) {
				var r1, r2, m;
				try {
					r1 = arg1.toString().split(".")[1].length;
				} catch(e) {
					r1 = 0;
				}
				try {
					r2 = arg2.toString().split(".")[1].length;
				} catch(e) {
					r2 = 0;
				}
				m = Math.pow(10, Math.max(r1, r2));
				return (arg1 * m + arg2 * m) / m;
			},
			accSub : function(arg1, arg2) {
				var r1, r2, m, n;
				try {
					r1 = arg1.toString().split(".")[1].length;
				} catch(e) {
					r1 = 0;
				}
				try {
					r2 = arg2.toString().split(".")[1].length;
				} catch(e) {
					r2 = 0;
				};
				m = Math.pow(10, Math.max(r1, r2));
				//动态控制精度长度
				n = (r1 >= r2) ? r1 : r2;
				return ((arg1 * m - arg2 * m) / m).toFixed(n);
			},
			accMul : function(arg1, arg2) {
				var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
				try {
					m += s1.split(".")[1].length;
				} catch(e) {
				}
				try {
					m += s2.split(".")[1].length;
				} catch(e) {
				}
				return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
			},
			accDiv : function(arg1, arg2) {
				var t1 = 0, t2 = 0, r1, r2;
				try {
					t1 = arg1.toString().split(".")[1].length;
				} catch(e) {
				}
				try {
					t2 = arg2.toString().split(".")[1].length;
				} catch(e) {
				}
				with (Math) {
					r1 = Number(arg1.toString().replace(".", ""));
					r2 = Number(arg2.toString().replace(".", ""));
					return (r1 / r2) * pow(10, t2 - t1);
				}
			}
		}
	},

	addValidateMethod : function() {
		$.validator.addMethod("cardid", function(value, element) {
			return this.optional(element) || ezCommon.validator(value);
		}, "请输入有效的身份证号码");
		$.validator.addMethod("telephone", function(value, element) {
			return this.optional(element) || /(^(0[0-9]{2,3}\-{0,1})?([2-9][0-9]{6,7})+(\-[0-9]{2,4})?$)|(^((\(\d{3}\))|(\d{3}\-))?(^[0]{0,1}1[358]\d{9})$)/.test(value);
		}, "请输入有效的电话号码");
		$.validator.addMethod("integer", function(value, element) {
			return /(^\+?0$)|(^\-?0$)|(^\+?[1-9][0-9]*$)|(^\-?[1-9][0-9]*$)/.test(value);
		}, "请输入有效的整数");
		$.validator.addMethod("decimal", function(value, element) {
			return /(^\+?0$)|(^\-?0$)|(^\+?[1-9][0-9]*$)|(^\-?[1-9][0-9]*$)|(^\-?[1-9][0-9]*\.[0-9]*$)|(^\-?[0-9]{1}\.[0-9]*$)|(^\+?[1-9][0-9]*\.[0-9]*$)|(^\+?[0-9]{1}\.[0-9]*$)/.test(value);
		}, "请输入有效的小数");
		$.extend($.validator.messages, {
			required : "必填字段",
			email : "请输入正确格式的电子邮件",
			date : "请输入合法的日期",
			dateISO : "请输入合法的日期 (ISO).",
			number : "请输入合法的数字",
			maxlength : $.validator.format("请输入一个长度最多是 {0} 的字符串"),
			minlength : $.validator.format("请输入一个长度最少是 {0} 的字符串"),
			rangelength : $.validator.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
		});
	},

	/**
	 *
	 */
	validator : function(_412) {
		if (_412.length == 15) {
			var reg = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
			var bSplit = _412.match(reg);
			//Check the date of birth is correct
			var birth = new Date('19' + bSplit[2] + '-' + bSplit[3] + '-' + bSplit[4]);
			var boolBirth = birth.getYear() == Number(bSplit[2]) && (birth.getMonth() + 1) == Number(bSplit[3]) && birth.getDate() == Number(bSplit[4]);
			return boolBirth;
		} else if (_412.length == 18) {
			_412 = _412.toUpperCase();
			var reg = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
			var bSplit = _412.match(reg);
			//Check the date of birth is correct
			var birth = new Date(bSplit[2] + '-' + bSplit[3] + '-' + bSplit[4]);
			var boolBirth = birth.getFullYear() == Number(bSplit[2]) && (birth.getMonth() + 1) == Number(bSplit[3]) && birth.getDate() == Number(bSplit[4]);
			if (!boolBirth) {
				return false;
			} else {
				//Efficacy verification code
				var nTemp = 0;
				var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
				var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
				for ( i = 0; i < 17; i++) {
					nTemp += _412.substr(i, 1) * arrInt[i];
				}
				var valnum = arrCh[nTemp % 11];
				return valnum == _412.substr(17, 1);
			}
		} else {
			return false;
		}
	},

	/**
	 * 页面保存方法定义
	 */
	pageSave : function() {
		// 判断用户是否登录
		if (common.isLogin()) {
			//判断站点ＩＤ　
			$(".saveAuto").slideDown("slow");
			if (common.isSiteNull() > 0) {
				$(".saveAuto").find(".loadingSave").show();
				$(".saveAuto").find(".saveSuccess").hide();
				//获取需要保存的页面内容
				$("#editArea .page-wraper").find(".ez-selected").removeClass("ez-selected");

				//保存页面信息 柯斌
				var $pages = $("#editArea .page-wraper").clone();
				for (var i = 0; i < $pages.size(); i++) {
					var $page = $($pages[i]);
					$page.find("[ctrl-type='compLogic']").each(function() {//提取页面中的各动态组件的结构，不保存组件数据
						var toSaveDynaCompHtml = CTRL.getDynaTpl($(this));
						$(this).replaceWith(toSaveDynaCompHtml);
					});
					var pageContentHtml = $page.wrap("<div/>").parent().html();
					$page.unwrap("<div/>");
					EDITOR.pageSaveFile($page.attr("id"), pageContentHtml, "", "");
				}

				if (ezValidate.validateNull(Global.ezSite.SiteConfig)) {
					var siteconfig = JSON.stringify(Global.ezSite.SiteConfig);
					EDITOR.pageSaveFile("config", siteconfig, "", "");
				}
			} else {
				$(".saveAuto").slideDown("slow");
				$(".saveAuto").find(".loadingSave").hide();
				$(".saveAuto").find(".saveSuccess").text("囧,找不到站点了！").css("color", "#FFF").show();
			}
		} else {
			alert("登录已过期！");
		}
	},

	/**
	 * 删除页面或组件方法定义
	 * @param  page       string      页面或组件id号
	 * @param  component  integer     0-页面   1-组件
	 */
	pageRemoveFile : function(page, siteId, component) {
		$.ajax({
			url : SITECONFIG.ROOTPATH + "/Editor/Editor/deleteTemplateFile",
			type : "POST",
			data : {
				"siteId" : siteId,
				"page" : page,
				"component" : component,
			},
			cache : false,
			success : function(data) {
				if (data > 0) {
					//TODO　成功后处理
					$("#myCompList").find("[dataid = '" + page + "']").fadeOut(function() {
						$(this).remove();
					});
				}
			}
		});
	},

	/**
	 * 获取Form表单信息
	 */
	getFormInfo : function() {
		$.ajax({
			type : "post",
			url : ROOTPATH + "/Designer/FormDesign/getFormListForSite",
			data : {
				siteid : Global.ezSite.SiteId
			},
			async : false,
			dataType : "JSON",
			success : function(r) {
				Global.ezSite.formInfo = r;
			}
		});
	},

	/**
	 * 获取动态和静态控件属性值
	 * @param    object     ctrlStyle      动态组件或静态控件对象
	 * @return   string     属性设置html
	 */
	getSettingNodeAttr : function(ctrlStyle) {
		var list = ctrlStyle, strHTML = "";
		if (list.length > 0) {
			function getAttr(array) {
				$.each(array, function(nK, nV) {
					if ( typeof nV == "object") {
						strHTML += '<div class="settingItem ">';
						getAttr(nV);
						strHTML += "</div>";
					} else {
						strHTML += esAttrLib["subMenu"][nV];
					}
				});
			}


			$.each(list, function(key, value) {
				if (value.length == 2) {
					if (((value[0].match(/margin/g) && value[1].match(/margin/g)) || (value[0].match(/border/g) && value[1].match(/border/g)) || value[0].match(/padding/g) && value[1].match(/padding/g)) && value.length == 2) {
						strHTML += '<div class="settingItem sliderSpring">';
					} else {
						strHTML += '<div class="settingItem ">';
					}
				} else {
					strHTML += '<div class="settingItem ">';
				}
				getAttr(value);
				strHTML += "</div>";
			});
		}
		return strHTML;
	},

	/**
	 * 获取指定表单的指定字段的数据
	 */
	getFormFieldData1 : function(formId, fieldsArray) {
		var fieldData = null;
		$.ajax({
			url : ROOTPATH + "/Editor/Project/getProjectFormDataList",
			type : "POST",
			data : {
				"formId" : formId,
				"fields" : fieldsArray
			},
			cache : false,
			async : false,
			dataType : "JSON",
			success : function(fData) {
				fieldData = fData;
			}
		});
		return fieldData;
	},

	/**
	 * 获取指定表单的指定字段的数据
	 */
	getFormFieldData : function(formId, fieldsArray, where) {
		var fieldData = [];
		$.ajax({
			url : SITECONFIG.ROOTPATH + "/FormData/getFormDataInfo",
			type : "POST",
			data : {
				"id" : formId,
				"fields" : fieldsArray,
				"where" : where
			},
			cache : false,
			async : false,
			dataType : "JSON",
			success : function(fData) {
				if (fData) {
					fieldData = fData;
				}
			}
		});
		return fieldData;
	},

	/**
	 * 读取配置文件
	 */
	getConfig : function(url, siteId) {
		return ezCommon.getPageFile(siteId, "config");
	},

	/**
	 * 读取页面文件信息
	 */
	getPageFile : function(siteId, pageId) {
		var returnData = null;
		if (ezCommon.isSiteNull() > 0) {
			$.ajax({
				url : GROUPPATH + "/Editor/loadPage",
				data : {
					"siteId" : siteId, //SITEID,
					"page" : pageId

				},
				type : 'POST',
				dataType : "json",
				cache : false,
				async : false,
				success : function(data) {
					if (data) {
						returnData = data.pageContent;
					} else {
						returnData = 0;
					}
				}
			});
		}
		return returnData;
	},

	/**
	 * 幻灯片
	 */
	slider : function() {
		var unslider = $('.banner').unslider({
			speed : 500, //  The speed to animate each slide (in milliseconds)
			delay : 3000, //  The delay between slide animations (in milliseconds)
			complete : function() {
			}, //  A function that gets called after every slide animation
			keys : true, //  Enable keyboard (left, right) arrow shortcuts
			//dots: true,               //  Display dot navigation
			fluid : false,
			arrows : true,
			fluid : true,
		});

		var slides = $('.banner'), i = 0;
		slides.on('swipeleft', function(e) {
			unslider.prev();
		}).on('swiperight', function(e) {
			unslider.next();
		});
	},

	/**
	 * 颜色Html
	 * @param string txt:提示文字
	 * @param string id:选择容器的ID
	 */
	ColorHtml : function(txt, id) {
		return '<div class="ez-panel-item h30 ' + id + '">' + '<span class="ez-left-align">' + txt + '</span>' + '<input type="text" id="' + id + '" class="ez-left" /><br>' + '</div>';
	},

	/**
	 * 判断控件是否设置了动作
	 */
	isSetAction : function(ctrlName) {
		if (ctrlName == "pageForm") {//检测页面是否存在动作
			var rightsliding = $("#ctrlArea").find(".selectedForm").attr("rightsliding");
			var leftsliding = $("#ctrlArea").find(".selectedForm").attr("leftsliding");
			var load = $("#ctrlArea").find(".selectedForm").attr("load");
			if (rightsliding || leftsliding || load) {
				return true;
			}
			return false;
		}
		if (ctrlName == undefined || ctrlName.match(/compLogic/g))
			return false;
		var cJson = Global.ezV.controlLists, cOpt = cJson[Global.ezV.formId][ctrlName]["operations"], eventNum = 0;
		//记录控件设置的事件个数
		if (cOpt) {
			for (var i in cOpt) {
				eventNum++;
			}
		}
		if (cOpt && eventNum) {
			return true;
		}
		return false;
	},

	setpageSelected : function() {
		if (!$("#myWeb").hasClass("pageSelected")) {
			$("#myWeb").addClass("pageSelected");
		}
	},
	/**
	 * 设置控件选中样式。因此，获取当前选中的控件的方式为：$(".ctrlSelected");
	 * @param	$ctrl	被选中的控件对象
	 */
	setCtrlSelected : function($ctrl, trur) {
		ezCommon.Obj = $ctrl;
		//按ctrl键点击控件时
		if (trur) {
			var valu;
			//按ctrl键点击控件时判断当前控件是否选择(没选择时)

			if (!$ctrl.hasClass("ctrlSelected")) {
				$ctrl.addClass("ctrlSelected");
				//去除头部点中添加的红色虚线
				$(".selectedForm").parent().css("outline", "none");
				$("#myWeb").removeClass("pageSelected ");
			} else {
				//选中时
				$ctrl.removeClass("ctrlSelected ");
			}
			var valu = $(".ctrlSelected");
			ezCommon.sty.splice(0, ezCommon.sty.length);
			$.each(valu, function(k, v) {
				ezCommon.sty.push($(v).attr("ctrl-type"));
			});
		} else {
			//直接点击控件时
			if (!$ctrl.hasClass("ctrlSelected")) {
				$(".ctrlSelected").removeClass("ctrlSelected");
				$ctrl.addClass("ctrlSelected");
				var c = $ctrl.attr("ctrlId");
				$('[ctrlid=' + c + ']').addClass("ctrlSelected");
				//alert(d);
				//去除头部点中添加的红色虚线
				$(".selectedForm").parent().css("outline", "none");
				$("#myWeb").removeClass("pageSelected ");
			} else {
				$(".ctrlSelected").removeClass("ctrlSelected");
				$ctrl.addClass("ctrlSelected");
				//去除头部点中添加的红色虚线
				$(".selectedForm").parent().css("outline", "none");
				$("#myWeb").removeClass("pageSelected ");
			}
			var valu = $(".ctrlSelected");
			ezCommon.sty.splice(0, ezCommon.sty.length);
			ezCommon.sty.push($(".ctrlSelected").attr("ctrl-type"));
		}
	},
	/*
	 * 撤销恢复按钮禁用可用控制
	 */
	stackUI : function(pageLogo) {
		var undo = $(".undo"), redo = $(".redo");
		undo.attr("disabled", !ezCommon.pageIdURdo[pageLogo].canUndo());
		redo.attr("disabled", !ezCommon.pageIdURdo[pageLogo].canRedo());
	},
	/*
	 * 撤销恢复相关事件
	 */
	undoEvent : function(pageLogo) {
		ezCommon.pageIdURdo[pageLogo].changed = function() {
			ezCommon.stackUI(pageLogo);
		};
		ezCommon.stackUI(pageLogo);
		$(document).keydown(function(event) {
			if (event.ctrlKey && event.keyCode == 90 && ezCommon.pageIdURdo[pageLogo].canUndo()) {
				$(".right-menu").hide();
				ezCommon.pageIdURdo[pageLogo]["undo"]();
			} else if (event.ctrlKey && event.keyCode == 89 && ezCommon.pageIdURdo[pageLogo].canRedo()) {
				$(".right-menu").hide();
				ezCommon.pageIdURdo[pageLogo]["redo"]();
			}
		});
		$(".undo, .redo").unbind("click").click(function() {
			var what = $(this).attr("class");
			ezCommon.pageIdURdo[pageLogo][what]();
			$(".right-menu").hide();
		});
	},
	/**
	 * 保存提示移动和PC各一种提示
	 * @param {String} tipInfo 提示内容
	 */
	showSaveResult : function(tipInfo) {
		var $tipWrap = $(".tipWrap").html(tipInfo);
		$tipWrap[0].style.display = "block";
		setTimeout(function() {
			$(".tipWrap").slideUp("fast");
		}, 1000);
		if (isMobile()) {
			$(".tipWrap").css({
				"width" : "40%",
				"font-size" : "15px",
				"top" : "40%"
			});
		}
	},

	/**
	 * 模拟thinkPHP的U函数
	 */
	U : function(url, params, is_first_domain) {
		var URL_HTML_SUFFIX = ".html";
		var domain = window.location.host;
		var is_sub_domain = false;
		var website = '';

		//二级域名
		wsArray = domain.split('.');
		if (wsArray.length == 3 && wsArray[0] != 'www') {
			is_sub_domain = true;
		}
		//获取一级域名
		if (is_first_domain) {
			domain = 'www.' + wsArray[1] + '.' + wsArray[2];
		}
		//去掉第一个'/'
		if ('/' == url.substr(0, 1)) {
			url = url.substr(1);
		}

		urlArr = url.split('/');
		//一级域名要加APP项目目录
		if (urlArr.length < 3 && !is_sub_domain) {
			if ('/' == APPPATH.substr(0, 1)) {
				APPPATH = APPPATH.substr(1);
			}
			website = APPPATH + '/';
		}
		website = website + url;
		//其他参数
		if (params) {
			website = website + '/' + params.replace(/=/g, "/").replace(/&/g, "/") + URL_HTML_SUFFIX;
		}
		return 'http://' + domain + '/' + website;
	},

	/**
	 * 根据数据源Id获取数据源字段
	 */
	getQueryField : function(queryId, type) {
		var fieldList = {};
		if (ezCommon.cacheQueryField[queryId]) {
			fieldList = ezCommon.cacheQueryField[queryId];
		} else {
			_commonAjax({
				type : "POST",
				url : SITECONFIG.ROOTPATH + '/FormData/getAQuerierData',
				data : {
					'dsId' : queryId,
					"siteId" : SITECONFIG.SITEID,
					"type" : type
				},
				dataType : 'json',
				async : false,
				success : function(data) {
					if (data) {
						fieldList = data;
						ezCommon.cacheQueryField[queryId] = fieldList;
					}
				}
			});
		}
		return fieldList;
	},

	/**
	 * 根据数据集ID和要查询的字段，获取指定数据集，指定字段的数据
	 */
	queryFieldData : function(dsId, field) {
		var queryData = null;
		var linkParaJson = 0;
		if ( typeof (linkParas) != "undefined") {
			linkParaJson = linkParas ? linkParas : 0;
		}
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"fieldName" : field, //按钮点赞"zan"或者评分"pingfen"没有就是空的
				"datasetId" : dsId,
				"linkParas" : linkParaJson
			},
			url : SITECONFIG.ROOTPATH + "/FormData/getAQueryFieldValue",
			dataType : 'json',
			async : false,
			success : function(r) {
				queryData = r;
			}
		});
		return queryData;
	},

	/**
	 * 根据sql查询数据
	 *searchType 为1的时候最后返回的数据不一样  带赞的信息 暂时用这个区分
	 */
	querySqlData : function(sql, searchType, count, praiseComp) {

		var b64 = new Base64();
		var sql = b64.encode(sql);

		var queryData = null;
		var linkParaJson = 0;
		if ( typeof (linkParas) != "undefined") {
			linkParaJson = linkParas ? linkParas : 0;
		}
		var praise = 0;
		if ( typeof (praiseComp) != "undefined") {
			praise = praiseComp ? praiseComp : 0;
		}
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"sql" : sql,
				"linkParas" : linkParaJson,
				"praiseComp" : praise,
				"siteId" : SITECONFIG.SITEID
			},
			//url : SITECONFIG.ROOTPATH + "/FormData/execAQueryPlan_New",
			url : SITECONFIG.ROOTPATH + "/FormData/execAQueryPlan",
			dataType : 'json',
			async : false,
			success : function(r) {
				queryData = r;
			}
		});
		if (searchType != 0) {

			if (count == 1) {
				var $queryData = [];
				$queryData['sql'] = queryData['sql'];
				$queryData['count'] = queryData['count'];

			} else {
				return queryData['sql'];
			}

		}

		if (count == 1) {
			var $queryData = {};
			$queryData['sql'] = queryData['sql'];
			$queryData['count'] = queryData['count'];
			return $queryData;
		}
		return queryData;
	},

	/**
	 * 根据表ID查询数据 tlj
	 */
	querySqlDataByTid : function($tables) {
		var queryData;
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"tables" : $tables,
				"siteId" : SITECONFIG.SITEID
			},
			url : SITECONFIG.ROOTPATH + "/FormData/execAQueryPlan",
			dataType : 'json',
			async : false,
			success : function(data) {
				queryData = data;
			}
		});
		return queryData;
	},

	/**
	 * 执行增删查改
	 */
	curd : function(opts, searchType, count, praiseComp) {
		var b64 = new Base64();
		var sql = b64.encode(JSON.stringify(opts)), queryData = [];
		var linkParaJson = 0;
		if (SITECONFIG.linkParas != "undefined") {
			linkParaJson = SITECONFIG.linkParas ? SITECONFIG.linkParas : 0;
		}
		var praise = 0;
		if ( typeof (praiseComp) != "undefined") {
			praise = praiseComp ? praiseComp : 0;
		}
		_commonAjax({
			type : "POST",
			processData : true,
			data : {
				"sqlJson" : sql,
				"linkParas" : linkParaJson,
				"praiseComp" : praise,
				"siteId" : SITECONFIG.SITEID
			},
			url : SITECONFIG.ROOTPATH + "/FormData/execAQueryPlanBycc",
			dataType : 'json',
			async : false,
			success : function(r) {
				queryData = r;
				
			}
		});

		if (objIsnull(queryData)) {
			if (searchType != 0) {
				if (count == 1) {
					var $queryData = [];
					$queryData['sql'] = queryData;
					//$queryData['count'] = queryData['count'];
				} else {
					return queryData;
				}

			}

			if (count == 1) {
				var $queryData = {};
				$queryData['sql'] = queryData;
				//$queryData['count'] = queryData['count'];
				return $queryData;
			}
		}
		return queryData;
	},

	/**
	 * 获取链接参数
	 * @param toPageID String 目标页面Id
	 */
	getLinkParam : function(toPageID, fromPageID) {
		var linkParam = {}, isStatus = 0;
		if (ezCommon.paramJson != "") {
			if (ezCommon.paramJson["toPageID"] == toPageID && ezCommon.paramJson["fromPageID"] == fromPageID) {
				isStatus = 1;
			}
		}
		ezCommon.paramJson = {
			"toPageID" : toPageID,
			"fromPageID" : fromPageID
		};
		if (isStatus == 0) {
			_commonAjax({
				type : "POST",
				data : {
					"toPageID" : toPageID,
					"fromPageID" : fromPageID,
					"siteId" : SITECONFIG.SITEID
				},
				url : SITECONFIG.ROOTPATH + "/FormData/getPageLinkData",
				dataType : 'json',
				async : false,
				success : function(r) {
					linkParam = r;
				}
			});
			ezCommon.cacheLinkData = linkParam;
		} else {
			linkParam = ezCommon.cacheLinkData;
		}
		return linkParam;
	},

	/**
	 * @desc 获取链接参数值
	 * @param v 页面参数json
	 */
	getLinkParamValue : function(v) {

		var url = decodeURI(location.href), val = "";
		var urlParamArray = url.split("/"), ctrlId = "";
		for (var i = 0; i < urlParamArray.length; i++) {
			if (urlParamArray[i] == "ctrlId") {
				ctrlId = urlParamArray[i + 1];
			}
		}

		if (v["paramValue"][ctrlId]) {
			var paramType = v["paramValue"][ctrlId]["paramType"], paramCtrl = v["paramValue"][ctrlId]["ctrl"], val = "";
			if (paramType == "constant") {
				val = v["paramValue"][ctrlId]["paramVal"];
			} else if (paramType == "form") {
				if (paramCtrl.indexOf("DROPDOWN") > 0) {
					val = $("[name='" + paramCtrl + "']").find("option:selected").val();
				} else if (paramCtrl.indexOf("TEXTBOX") > 0 || paramCtrl.indexOf("TEXTAREA")) {
					val = $("[name='" + paramCtrl + "']").val();
				}
				for (var i = 0; i < urlParamArray.length; i++) {
					if (urlParamArray[i] == v["paramName"]) {
						val = URLDecode(urlParamArray[i + 1]);
					}
				}

			} else if (paramType == "controls") {
				var $obj = $("[ctrlid='" + paramCtrl + "']", $(".selectedForm"));
				val = $obj.find("div:first").text();
				for (var i = 0; i < urlParamArray.length; i++) {
					if (urlParamArray[i] == v["paramName"]) {
						val = URLDecode(urlParamArray[i + 1]);
					}
				}
			} else if (paramType == "currDataID") {
				var rowId = $ctrlHtml.closest("[rowid]").attr("rowid"), val = 0;
				if (rowId) {
					val = rowId;
				}
				for (var i = 0; i < urlParamArray.length; i++) {
					if (urlParamArray[i] == v["paramName"]) {
						val = URLDecode(urlParamArray[i + 1]);
					}
				}
			} else if (paramType.match(/compLogic/g) || paramType.match(/customComponent/)) {
				for (var i = 0; i < urlParamArray.length; i++) {
					if (urlParamArray[i] == v["paramName"]) {
						val = URLDecode(urlParamArray[i + 1]);
					}
				}
			}
		}

		return val;
	},

	/**
	 * 更新图表数据
	 */
	updateChartData : function($container) {
		var categoriesObj = eval($container.attr("categories"));
		var data = eval($container.attr("series"));
		var titleTextStr = $container.attr("titleText");
		var yAxisStr = $container.attr("yAxis");
		var i = 0, len = data.length, dataObj = [];
		for (; i < len; i++) {
			var obj = {};
			obj["color"] = data[i]["color"];
			obj["y"] = ezCommon.queryFieldData(data[i]["y"][0], data[i]["y"][1]);
			dataObj.push(obj);
		}

		var para = {
			chart : {
				type : 'column',
				renderTo : $container.attr("id")
			},
			colors : ['#7cb5ec'],
			title : {
				text : titleTextStr
			},
			xAxis : {
				categories : categoriesObj,
				labels : {
					rotation : 0,
					align : 'right',
					style : {
						fontSize : '18px',
						fontFamily : 'Verdana, sans-serif'
					}
				}
			},
			yAxis : {
				min : 0,
				title : {
					text : yAxisStr
				},
				labels : {
					style : {
						fontSize : '18',
						fontFamily : 'Verdana, sans-serif'
					}
				}
			},
			credits : {
				enabled : false // remove high chart logo hyper-link
			},
			legend : {
				enabled : false
			},
			tooltip : {
				pointFormat : '得分',
			},
			series : [{
				name : '得分',
				data : dataObj,
				dataLabels : {
					enabled : true,
					rotation : -90,
					color : '#000',
					align : 'right',
					x : 4,
					y : 10,
					style : {
						fontSize : '16px',
						fontFamily : 'Verdana, sans-serif',
					}
				}
			}]
		};
		var chart = new Highcharts.Chart(para);
	},

	/**
	 * 获取系统变量值
	 * @param {Object} sysParamType 系统变量类型
	 */
	getSysParam : function(sysParamType) {
		var sys = "";
		_commonAjax({
			url : SITECONFIG.ROOTPATH + "/FormData/getSysParamValue ",
			type : "post",
			data : {
				sysParamType : sysParamType,
				siteId : SITECONFIG.SITEID
			},
			dataType : "json",
			async : false,
			success : function(data) {
				sys = data;
			}
		});
		return sys;
	},

	/**
	 * 获取当前站点或流程下的所有表单
	 */
	getFormListData : function() {
		var flowId = 1, formListJson = null;
		_commonAjax({
			type : "POST",
			url : SITECONFIG.APPPATH + "/Query/getFlowDataTable",
			data : {
				"siteId" : SITECONFIG.SITEID,
				"flowId" : 1
			},
			dataType : "json",
			async : false,
			success : function(result) {
				if (result)
					formListJson = result;
			},
			error : function(r) {
				alert(r + "错误信息");
			}
		});
		return formListJson;
	},

	/**
	 * 根据表单ID获取表单所有字段
	 */
	getFormFieldsData : function(formId) {
		var fieldListJson = [];
		if (formId) {
			_commonAjax({
				type : "POST",
				processData : false,
				data : {
					"formId" : formId,
					"siteId" : SITECONFIG.SITEID
				},
				url : SITECONFIG.ROOTPATH + "/FormData/getAFormFiledsInfo",
				dataType : 'json',
				async : false,
				success : function(r) {
					fieldListJson = r;
				}
			});
		}
		return fieldListJson;
	},

	/**
	 * 获取当前项目所有数据源
	 */
	getAllFlowQuerier : function() {
		var allQuerier = null;
		$.ajax({
			type : "post",
			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				'flowId' : 1,
				"siteId" : SITECONFIG.SITEID
			},
			async : false,
			dataType : "json",
			success : function(r) {
				if (r) {
					allQuerier = r;
				}
			}
		});
		return allQuerier;
	},

	/**
	 *  获取相似数据源
	 * @param {Object} queryId 数据源ID
	 * @param {Object} field 待比较数据源字段
	 */
	getSameDataSourceList : function(queryId, field) {
		var sameQuerier = null;
		_commonAjax({
			url : SITECONFIG.ROOTPATH + "/FormData/getSameDataSourceList",
			data : {
				'siteId' : SITECONFIG.SITEID,
				'queryId' : queryId,
				'field' : JSON.stringify(field)
			},
			async : false,
			dataType : "json",
			success : function(r) {
				if (r) {
					sameQuerier = r;
				}
			}
		});
		return sameQuerier;
	},

	/**
	 * 获取当前表单所有控件值
	 */
	getCurrFormValueList : function() {
		var form = {};
		var tableName = "";
		var $form = $("form[id=" + ezCommon.formId + "]"), formId = ezCommon.formId;
		if (tableNames.formId) {
			tableName = tableNames.formId;
		} else {
			_commonAjax({
				url : SITECONFIG.ROOTPATH + "/FormData/getFormInfo",
				type : "post",
				data : {
					'id' : $form.attr("id"),
					'siteId' : SITECONFIG.SITEID
				},
				async : false,
				dataType : "json",
				success : function(r) {
					if (r) {
						tableNames.formId = r["tableName"];
						tableName = r["tableName"];
					}
				}
			});
		}

		$.each($form.find(".ctrl"), function() {
			var ctrlid = $(this).attr("ctrlid");
			form[tableName + "." + ctrlid] = $(this).find("[name='" + ctrlid + "']").val();
		});
		return form;
	},

	/**
	 * 获取切换层信息
	 * @param lay_id 层Id
	 */
	getMoreLayout : function(lay_id, pageId) {
		var openid = openId || "", siteId = temp_siteId || 0, rdata = [];
		$.ajax({
			type : "post",
			url : APPPATH + "/Qywx/Project/getMoreLayout",
			data : {
				"layId" : lay_id,
				"siteId" : SITECONFIG.SITEID,
				"pageId" : pageId,
				"openid" : openid
			},
			async : false,
			dataType : "json",
			success : function(data) {
				if (data != -1 || data != -2) {
					if (data) {
						rdata = data;
					}
				}
			}
		});

		return rdata;
	},

	/**
	 *  定位面板
	 */
	panal : function(ctrlId, formPageId, toPageId) {
		var paramJson = ezCommon.getLinkParam(null, formPageId), paramNameStr = "";
		if (paramJson.length > 0) {
			$.each(paramJson, function(key, value) {
				var formPageId = value["fromPageID"], toPageId = value["toPageID"];
				if (value["linkData"]) {
					$.each(value["linkData"], function(k, v) {
						if (!v["paramValue"][ctrlId]) {
							paramNameStr += '<li formPageId="' + formPageId + '" toPageId = "' + toPageId + '" paramName="' + v["paramName"] + '">' + v["paramKey"] + '</li>';
						}
					});
				}
			});
			paramNameStr = '<div id="followPanal"  style="position:absolute;z-index:9999;display:none"><ul class="menu-item "  style="position:absolute;z-index:9999;">' + paramNameStr + '</ul></div>';
			$("#followPanal").remove();
			$("body").append(paramNameStr);
		}

		return paramJson;
	},

	/**
	 * 跟随定位
	 * $obj 被跟随对象
	 * $followPanal 跟随对象
	 */
	followPanal : function($obj, $followPanal) {
		onValueChange($obj[0], function() {
			if ($obj.attr("restore") != "true") {
				$obj.attr("dataType", "constant");
				$obj.removeAttr("formPageId");
				$obj.removeAttr("toPageId");
				$obj.removeAttr("paramName");
			}
		});
		$followPanal.hide();
		$obj.unbind("click").click(function() {
			var $this = $(this), offset = $this.offset(), offsetTop = offset.top, offsetLeft = offset.left, width = $this.width(), height = $this.height();
			$followPanal.css({
				"top" : offsetTop + height + 10,
				"left" : offsetLeft,
				"width" : width,
				"display" : "block"
			});

			$("li", $followPanal).unbind("click").click(function() {
				$obj.val($(this).text());
				$obj.attr("dataType", "sameName");
				$obj.attr("formPageId", $(this).attr("formPageId"));
				$obj.attr("toPageId", $(this).attr("toPageId"));
				$obj.attr("paramName", $(this).attr("paramName"));
			});

			document.onmousemove = function(event) {
				if ($followPanal.size() == 1) {
					var ev = event || window.event;
					var add = 50, offset = $followPanal.offset(), t = offset.top, l = offset.left, h = $(".menu-item", $followPanal).height(), w = $followPanal.width();
					if ($followPanal.find(".menuChild:visible").size() > 0) {
						if ((ev.pageX < (l - add) || ev.pageX > (l + w ) || ev.pageY < (t - add) || ev.pageY > (t + h + add))) {
							$followPanal.hide();
						}
					} else {
						if ((ev.pageX < (l - add) || ev.pageX > (l + w + add) || ev.pageY < (t - add) || ev.pageY > (t + h + add))) {
							$followPanal.hide();
							document.onmousemove = null;
						}

					}
				} else {
					document.onmousemove = null;
				}

			};
		});

	},

	/**
	 * 获取动作设置结构
	 */
	getActionSetHtml : function(ctrlType) {
		var str = '<div class="panel panel-default actionPanel"><div class="panel-body"><div class="actionHead"><span class="actionTitle"></span><button type="button" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><a href="" class="a-hide-show" data-toggle="collapse"></a> <span class="addLogic" style="float:right; color: #f5a6af;cursor: pointer;margin-right: 17px;display:none">添加逻辑处理</span></div><div class="actionWarp"></div></div>';
		var $action = $(str);
		$action.find(".actionWarp").append(ctrlType);
		return $action;
	},

	/**
	 * 移除动作和收缩动作
	 */
	actionClose : function(obj) {
		obj.find("hr").parent().click(function() {
			obj.find(".actionWarp").slideToggle();
		});
		obj.find(".close").click(function() {
			obj.remove();
		});
	},

	/**
	 * 获取具体动作json数据
	 * @param     string     actionId	动作Id
	 * @return    json		 actionjson 动作json
	 */
	getActionJson : function(actionId) {
		if (actionId) {
			var actionJson = ezCommon.ctrlActionCache[actionId];
			if (!actionJson) {
				var data = {};
				data["action_id"] = actionId;
				data["siteId"] = SITECONFIG.SITEID;
				_commonAjax({
					type : "POST",
					url : SITECONFIG.ROOTPATH + "/FormData/getFormActionData",
					data : data,
					async : false,
					dataType : "json",
					success : function(result) {
						if (result) {
							actionJson = JSON.parse(result);
							ezCommon.ctrlActionCache[actionId] = actionJson;
						}
					},
				});
			}
			return actionJson;
		}
	},

	/**
	 * 滑出面板里选项的单击事件绑定
	 */
	inputPanelItemClick : function($itemLabel) {
		$itemLabel.click(function(e) {
			preventDefault(e);
			stopEventBubble(e);
			var $this = $(this);
			var $inputPanel = $this.closest(".inputPanel");
			var $ctrl = $inputPanel.data("ctrl");

			var ctrlName = $ctrl.attr("ctrlId");
			var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
			var $selectedItem = $inputPanel.find(".itemLabel.onChecked");
			if (selectLimit == "1") {
				$inputPanel.find(".itemLabel").removeClass("onChecked");
				//单选或复选按钮选中时,移出选中的类(class)
				$this.addClass("onChecked");
			} else if ($selectedItem.length < selectLimit) {
				if ($this.hasClass("onChecked")) {
					$this.removeClass("onChecked");
					$this.find("input[type='checkbox']").removeAttr("checked");
					var name = $this.find("input").attr("name");
					var value = "";
					var itemValue = $(this).find("span").text();
					value += itemValue + ",";
					value = value.substring(0, value.length - 1);
					var $structure = $ctrl.find("input[name = '" + name + "']");
					$.each($structure, function() {
						var str = value.split(",");
						for (var i = 0; i < str.length; i++) {
							if ($(this).next("span").text() == str[i]) {
								$(this).removeAttr("checked");
							}
						}
					});

				} else {
					$this.addClass("onChecked");
					$this.find("input[type='checkbox']").attr("checked", "checked");
					var name = $this.find("input").attr("name");
					var value = "";
					$inputPanel.find(".itemLabel.onChecked").each(function() {
						var itemValue = $(this).find("span").text();
						value += itemValue + ",";
					});
					value = value.substring(0, value.length - 1);
					var $structure = $ctrl.find("input[name = '" + name + "']");
					$.each($structure, function() {
						var str = value.split(",");
						for (var i = 0; i < str.length; i++) {
							if ($(this).next("span").text() == str[i]) {
								$(this).attr("checked", "checked");
							}
						}
					});
				}
			} else if ($this.hasClass("onChecked")) {
				$this.removeClass("onChecked");
				$this.find("input[type='checkbox']").removeAttr("checked");
			}

		});
	},

	getValueTypeValue : function(type) {
		var value;
		switch(type) {
			case "currDataID" :
				break;
			case "controls" :
				break;
			case "form" :
				break;
			case "constant" :
				break;
			case "systemParam" :
				break;
			case "" :
				break;
		}

		return value;
	},

	/**
	 *保存页面参数
	 */
	savePageParam : function(actionName, jumpJson, actionType) {
		if (actionType == "pageJump" || actionType == "setWXNotice" || actionType == "setPay" || actionType == "generatedQrcode") {//页面跳转json数据需要另外保存,以便数据筛选条件要处理
			var paramJson = JSON.parse(jumpJson);
			var paramItem = "", toPageId = "";
			if (actionType == "pageJump" || actionType == "generatedQrcode") {
				paramItem = paramJson[actionName]["paramItem"];
				toPageId = paramJson[actionName]["ctrl"]["pageId"];

			} else if (actionType == "setPay") {
				paramItem = paramJson[actionName]["paramItem"];
				toPageId = paramJson[actionName]["pageId"];
			} else {
				var paramJSON = paramJson[actionName]["ctrl"];

				$.each(paramJSON, function(k, v) {
					$.each(v, function(nk, nv) {
						if (nk == "paramItem") {
							paramItem = nv;
						} else if (nk == "pageId") {
							toPageId = nv;
						}
					});
				});
			}
			var formPageId = $(".selectedForm").parent().attr("id");
			var data = {}, ctrlId = ezCommon.Obj.attr("ctrlId"), dataLink = [], linkData = [], flag = 0;
			var paramJsonList = ezCommon.getLinkParam(null, formPageId);

			$.each(paramJsonList, function(key, value) {
				if (value["fromPageID"] == formPageId && value["toPageID"] == toPageId) {
					if (value["linkData"]) {
						dataLink = value["linkData"];
					}
					return false;
				}
			});
			if (paramItem.length > 0) {
				$.each(paramItem, function(key, value) {
					var paramKey = value["paramKey"], restore = value["restore"], paramName = value["paramName"], paramNameType = value["paramValue"][ctrlId]["paramNameType"];
					if (paramNameType == "sameName") {
						$.each(dataLink, function(k, v) {
							flag = 1;
							if (v["paramKey"] == paramKey) {
								v["paramValue"][ctrlId] = value["paramValue"][ctrlId];
							}
						});
					} else if (restore == "true" && dataLink.length > 0) {
						flag = 1;
						for (var i = 0; i < dataLink.length; i++) {
							if (dataLink[i]["paramName"] == paramName) {
								dataLink[i]["paramKey"] = paramKey;
								dataLink[i]["paramValue"][ctrlId] = value["paramValue"][ctrlId];
							}
						}
					} else {
						flag = 1;
						dataLink.push(value);
					}

				});
			}

			if (dataLink.length > 0) {
				for (var i = 0; i < dataLink.length; i++) {
					var deleteFlag = true;
					$.each(paramItem, function(key, value) {
						if (dataLink[i]["paramName"] == value["paramName"]) {
							deleteFlag = false;

						}
					});
					if (deleteFlag) {
						if (dataLink[i]["paramValue"][ctrlId]) {
							flag = 1;
							delete dataLink[i]["paramValue"][ctrlId];
							if (!objIsnull(dataLink[i]["paramValue"])) {
								dataLink.splice(i, 1);
							}
						}
					}

				};

				paramItem = JSON.stringify(dataLink);
			}
			if (flag && toPageId != "0") {
				data["fromPageID"] = $(".wxqyPage:visible").attr("id");
				data["toPageID"] = toPageId;
				data["actionID"] = actionName;
				data["linkData"] = paramItem;
				data['siteId'] = SITECONFIG.SITEID;
				$.ajax({
					type : "POST",
					url : SITECONFIG.ROOTPATH + "/FormData/savePageLinkData",
					data : data,
					success : function(result) {
						$("#ctrlActionList .paramKey").attr("restore", "true");
					}
				});
			}

		}
	},

	/**
	 * 获取api配置信息 add by tlj 2015-12-01
	 * @param {Object} apiId
	 */
	getApiManageJson : function(apiId) {
		//apiId 可以用来过滤指定apiManage配置,这里要考虑????
		//目前这里获取所有的apiManage信息,与动作设置中api列表共用数据

		//如果没有缓存则获取
		if (ezCommon.apiManageJsonCache.data == undefined) {
			var data = {
				"siteId" : SITECONFIG.SITEID
			};
			$.ajax({
				type : "post",
				url : SITECONFIG.APPPATH + "/ApiManage/getApisInfo",
				async : false,
				dataType : "json",
				data : data,
				success : function(data) {
					if (data && data.status == "success") {
						ezCommon.apiManageJsonCache = data;
					}
				}
			});
		}
		return ezCommon.apiManageJsonCache;
	}
};

