/**
 * 表单解析中间层，调用基础对象（formResolve.base）方法,得到单个控件的基本结构，自身再被上层应用调用
 * @author pzh
 */

define(function(require, exports, module) {
	var apply = {
		/**
		 * 获取整个表单结构对象
		 * 控件结构
		 * @param   json     formJsonData  表单json数据
		 * @param   object   config    控件结构和样式配置文件
		 */
		init : function(formJsonData, config) {
			var $formCtrl;
			var controlLists = formJsonData["controlLists"], ctrlList = formJsonData["tabs"]["tab1"]["ctrlList"];
			var $formStr = $("<form id='form1'   method='post'  name='myForm' data-transition='pop' enctype='multipart/form-data'></form>");
			$.each(ctrlList, function(key, value) {
				var control = controlLists[value];
				var $ctrl = apply.use(control, value, config);

				$formStr.append($ctrl);
			});
			$formCtrl = $formStr;
			return $formCtrl ? $formCtrl : "";
		},
		
		/**
		 * 返回包装后的控件对象
		 * @param {Object} ctrlData 底层控件对象元数据（JSON）
		 * @param {Object} config   用于包装基础控件的外层控件结构和类样式(组成的配置对象,如果不传,将用接口默认)
		 * @param string   ctrlName 控件唯一标识
		 * @return {Object}	单个控件完整结构对象
		 */
		use : function(ctrlData, ctrlName, config) {
			// alert(JSON.stringify(ctrlData));

			if (!ctrlData)
				return false;
			var ctrlType = ctrlData["ctrlType"];

			if (ctrlType == "ctrl-dynamic")
				return ctrlData["attrs"]["content"];
			//动态组件
			var controlTitle = ctrlData["attrs"]["general"]["ctrlTitle"];

			var structor = config ? config["structor"][ctrlType] : apply.config["structor"][ctrlType];

			var classArray = config ? config["classArray"][ctrlType] : apply.config["classArray"][ctrlType];
			if (!classArray)
				classArray = [];
			var $ctrl = null;
			require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
				$ctrl = e.init(ctrlData, structor, ctrlName);
			});
			//获取基础控件对象
			if (ctrlType == "time") {
				var ctrName = $ctrl.find("input").attr("name");
				if (objIsnull($(".formPreViewPage"))) {
					var $ctrHtml = $("[name=" + ctrName + "]").parents(".ctrlWraper").find('.form_date');
					$ctrHtml.datetimepicker({
						language : "zh-CN", //汉化
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						todayHighlight : 1,
						startView : 4,
						minView : 0,
						maxView : 4,
						forceParse : 0
					});
				}
				$ctrl.find('.form_date').datetimepicker({
					language : "zh-CN", //汉化
					weekStart : 1,
					todayBtn : 1,
					autoclose : 1,
					todayHighlight : 1,
					startView : 4,
					minView : 0,
					maxView : 4,
					forceParse : 0
				});
			} else if (ctrlType == "CCImage") {//图片控件可以上传
				//$ctrl.find(".ctrlWraper").append("<input type='file' class='" + ctrlName + "' accept='image/*;capture=camera' style='display:none;'/>");
				$ctrl.find(".ImagePreview>img").before('<input type="file" id="' + ctrlName + '" class="' + ctrlName + '" style="position:absolute;left:0;opacity:0;z-index:100;cursor:pointer;width:100px;height:100px;margin-top:4px" size="1" multiple="" class="ignore" name="file" />');
				var $imgHtml = $ctrl.find(".ImagePreview>img");
				//	$ctrl.undelegate('input', 'change').delegate('input', 'change', function() {
				$ctrl.find("input").on("change", function() {
					$.ajaxFileUpload({
						type : "POST",
						url : APPPATH + "/Index/ajaxUpload",
						secureuri : false,
						fileElementId : ctrlName,
						dataType : 'JSON',
						success : function(data) {
							var json = eval('(' + data + ')');
							$imgHtml.attr('src', json.image);

						},
					});
				});
				//$ctrl.find(".ImagePreview").ImagePreview();
			} else if (ctrlType == "CCUpload") {

			}
			var baseCtrl = $ctrl.find("[isBaseCtrl]").size() > 0 ? $ctrl.find("[isBaseCtrl]") : $ctrl;
			//为基础控件标签添加配置的样式类(传入的class)
			if (classArray.length) {
				var len = classArray.length;
				for (var i = 0; i < len; i++) {
					baseCtrl.addClass(classArray[i]);
				}
			}
			//	if (ctrlType != "CCButton" && $ctrl.find(".fieldTitle").size() > 0)
			//$ctrl.find(".fieldTitle").text(controlTitle);

			return $ctrl;
		},
		
	};
	module.exports = apply;
});
