/**
 * @author fwb
 * @desc 富文本编辑器
 * @time 2015-10-14
 */
define(function(require, exports, module) {
	var kindeditorObj = {};
	var cusKindEditor = {

		get : function() {
			return component;

		},
		set : function($obj) {
		},
		init : function($obj) {
			//var editor;
			var id = $obj.find("textarea[name=content]").attr("id");
			//这是删除是通过页面保存没有进行初始化的富文本， 避免添加一个还原出两个富文本
			if ($obj.find(".ke-container-default").length > 0) {
				$obj.children(":first").remove();
			}
			ezCommon.kindEditorObj = null;
			require.async(SITECONFIG.PUBLICPATH + "/Js/kindeditor/themes/default/default.css", function() {
				require.async(SITECONFIG.PUBLICPATH + "/Js/kindeditor/kindeditor.js", function() {
					ezCommon.kindEditorObj = KindEditor.create('#' + id, {
						width : "100%",
						resizeType : 1,
						allowPreviewEmoticons : false,
						allowImageUpload : true,
						uploadJson : SITECONFIG.ROOTPATH + "/Apps/WechatPublic/kindEditorAjaxUpload", //图片上传后的处理地址
						 //上传文件后执行的回调函数,获取上传图片的路径
						afterUpload : function(url) {
						},
						items : ['fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', '|', 'emoticons', 'image', 'link'],
						afterCreate : function() {
							this.sync();
						},
						afterBlur : function() {
							this.sync();
						}
					});

				});
			});

		},
		//加载组件属性
		loadAttrs : function($obj) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(component);
			});

		},
		//设置组件属性
		setAttrs : function($obj) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.setAttrs($obj);
			});

		},
	};
	var component = {
		html : '<div class="row ctrl" syscomtype="cusKindEditor" fieldsum="true"  ctrl-type="systemCp"  style=""><textarea id="content_1"  name="content"></textarea><div class = "ctrlIconWraper"></div></div>',
		cName : '富文本',
		attrs : {
			General : ["title"],
		},
	};

	module.exports = cusKindEditor;

});
