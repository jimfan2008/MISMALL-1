/**
 * @author 陈川
 * @desc 上传图片
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//图片控件对外接口
	var IMAGE = {

		get : function() {

			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {
		},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj) {
			var ctrlId = $obj.attr("ctrlid");
			$obj.find("input").addClass(ctrlId).attr("id", ctrlId);
			$obj.undelegate('#' + ctrlId, 'change').delegate('#' + ctrlId, 'change', function() {
				var pictureSize = $obj.attr("uploadpicturesize");
				var pictureUnit = $obj.attr("pictureUnit");
				if (!checkImgFile(this,pictureSize, pictureUnit)) {
					return;
				}
				var fd = new FormData();
				var url = SITECONFIG.ROOTPATH + "/Apps/WechatPublic/ajaxUpload";
				fd.append(this.name, this.files[0]);
				upload(fd, url, $obj);
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
		 * 加载控件动作
		 */
		loadAction : function(ctrlType) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAction(ctrlType);
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

	function upload(fd, url, $obj) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		var $ProgressData = $obj.find('#imgBoxProgressData');
		var $ProgressBar = $obj.find('#imgBoxProgressBar');
		$ProgressData.html("0%").show();
		$ProgressBar.html("").width(0).show();
		xhr.upload.onprogress = function(ev) {
			var percent = 0;
			if (ev.lengthComputable) {
				percent = 100 * ev.loaded / ev.total;
				var finalPercent = parseInt(percent);
				if (finalPercent == 100) {
					$ProgressBar.html("请稍候...");
				}
				$ProgressData.html(finalPercent + '%');
				$ProgressBar.width(percent);
			}
		};
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = xhr.responseText;
				var json = JSON.parse(data);
				$obj.find("img").attr('src', json.image).unbind("load").bind("load", function() {
					setTimeout(function() {
						$ProgressData.fadeOut();
						$ProgressBar.fadeOut();
					}, 1000);
				});
			}
		};
		xhr.send(fd);
	}

	var ctrl = {

		html : '<div class="row ctrl imFormCtrl" ctrl-type="IMAGE"><label class="control-label fieldTitle col-xs-3">图片</label><div class="ctrlWraper col-xs-9"><a class="ImagePreview" href="javascript:;"><input type="file"  style="position:absolute;left:15px;opacity:0;z-index:100;cursor:pointer;width:100px;height:100px;" size="1" multiple="" class="ignore" name="file" /><img isBaseCtrl="true" src= "' + SITECONFIG.PUBLICPATH + '/App/Qywx/Images/upimg.png" class="img_avatar"  style="cursor:pointer; width:100px; height:100px;margin-left:30px"></a><div id = "imgBoxProgressData"></div><div id = "imgBoxProgressBar"></div></span></div><div class = "ctrlIconWraper"></div></div>',
		cName : '上传图片',
		attrs : {
			General : ["title", "isHidden", "addFiledTitle", "uploadPictureSize"],
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
						"addLogic" : "逻辑处理",
						"autoCalc" : "自动运算",
						"autoFill" : "自动填充",
						"callRule" : "调用规则",
						"ctrlHideOrShow" : "控件显示隐藏",
						"oneTouchDial" : "一键拨号",
						"setOperationMsgTip" : "操作提示",
						"unlockOrLocking" : "控件锁定解锁",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "组件数据更新",
						"componentUpdateData" : "数据更新",
						"dataSourceUpdate" : "数据源更新",
						"deleteData" : "删除数据",
						"moreLayout" : "绑定制作层",
					},
					"wx" : {
						"attention" : "关注公众号",
						"generatedQrcode" : "生成二维码",
						"getLocation" : "获取地理位置",
						"playRedEnvelope" : "发红包",
						"sendMessage" : "发送消息",
						"setPay" : "微信支付",
						"setWXNotice" : "微信通知",
						"richScan" : "扫一扫"
					}
				}
			},
		}
	};

	module.exports = IMAGE;
});
