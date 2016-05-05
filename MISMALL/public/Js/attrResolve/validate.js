/* @author 柯斌
 * @desc 验证属性解析
 * @date 2015-06-29
 */

define(function(require, exports, module) {
	var validate = {

		/**
		 * 验证
		 * @param     json     validateAttr   验证属性json对象
		 * @param     object   $ctrlHtml      控件基本结构
		 */

		validate : function(validateAttr, $ctrlHtml) {

			var ctrlName = $ctrlHtml.find("[isbasectrl]").attr("name");
			var option = {};
			$.each(validateAttr, function(k, v) {
				switch (k) {
					case "isqequired":
						option[ctrlName] = {
							required : true
						};
						$.extend(true, validate.validateOpts['rules'], option);
						break;
					case "uniqueness":

						option[ctrlName] == {};

						$ctrlHtml.find("input").attr(k, "true");
						break;
					case "textFormat":
						option[ctrlName] = {};
						switch (v) {
							case "email":
								option[ctrlName]['email'] = true;
								break;
							case "integer":
								option[ctrlName]['integer'] = true;
								break;
							case "decimal":
								option[ctrlName]["decimal"] = true;
								break;
							case "cardid":
								option[ctrlName]["cardid"] = true;
								break;
							case "telephone":
								option[ctrlName]["telephone"] = true;
								break;
							case "text":
								break;
						}

						$.extend(true, validate.validateOpts['rules'], option);
						break;
					case "minLength":
						var min = validateAttr["minLength"];
						var max = validateAttr["maxLength"];
						if (min && !max) {
							option[ctrlName] = {
								minlength : v
							};
							$.extend(true, validate.validateOpts['rules'], option);
						}
						break;
					case "maxLength":
						var min = validateAttr["minLength"];
						var max = validateAttr["maxLength"];
						if (min && max) {
							option[ctrlName] = {
								rangelength : [min, max]
							};
						} else if (max) {
							option[ctrlName] = {
								maxlength : max
							};
						}
						$.extend(true, validate.validateOpts['rules'], option);
						break;
					case "startTime":
					case "endTime":
					case "dateFormat":
						var startTime = validateAttr["startTime"];
						var endTime = validateAttr["endTime"];
						var dateFormat = validateAttr["dateFormat"]["format"];
						var _timeCtrlBind = function(dateFormat, startTime, endTime) {
							var ctrName = $ctrlHtml.find("input").attr("name");
							/***判断是是否是预览页面解析***/
							if (objIsnull($(".formPreViewPage"))) {
								$("[name=" + ctrName + "]").parents(".ctrlWraper").find('.form_date').datetimepicker("remove").datetimepicker({
									language : "zh-CN",
									weekStart : 1,
									format : dateFormat,
									startDate : startTime,
									endDate : endTime,
									startView : validateAttr["dateFormat"]["startView"],
									minView : validateAttr["dateFormat"]["minView"],
									maxView : validateAttr["dateFormat"]["maxView"],
									todayBtn : 1,
									autoclose : 1,
									todayHighlight : 1
								});
							}
							$ctrlHtml.find('.form_date').datetimepicker("remove").datetimepicker({
								language : "zh-CN",
								weekStart : 1,
								format : dateFormat,
								startDate : startTime,
								endDate : endTime,
								startView : validateAttr["dateFormat"]["startView"],
								minView : validateAttr["dateFormat"]["minView"],
								maxView : validateAttr["dateFormat"]["maxView"],
								todayBtn : 1,
								autoclose : 1,
								todayHighlight : 1
							});
						};
						if (startTime || endTime || dateFormat) {
							dateFormat = dateFormat ? dateFormat : false;
							startTime = startTime ? startTime : false;
							endTime = endTime ? endTime : false;
							_timeCtrlBind(dateFormat, startTime, endTime);
						}
						break;
				}
			});

			//增加验证方法
			validate.addValidateMethod();
		},

		addValidateMethod : function() {
			require.async(SITECONFIG.PUBLICPATH + "/Js/vaildate/jquery.validate.js", function() {

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
					maxlength : $.validator.format("请输入长度最多是 {0} 的字符串"),
					minlength : $.validator.format("请输入长度最少是 {0} 的字符串"),
					rangelength : $.validator.format("请输入长度介于 {0} 和 {1} 之间的字符串"),
				});
			});
		},

		/*
		 * 验证数据的唯一性
		 * @param formId 表单ID
		 * @param formDataId  修改数据的ID 没有则表示增加新数据
		 **/
		validateQueness : function(formId,formDataId) {
			var bool = true;
			$("input[uniqueness=true]").each(function() {
				var $this = $(this);
				var cid = $this.attr("name");
				var value = $this.val();
				$.ajax({
					url : SITECONFIG.ROOTPATH + "/FormData/chkFormDataRecord",
					type : 'post',
					data : {
						siteId : SITECONFIG.SITEID,
						cid : cid,
						value : value,
						form_id : formId,
						formData_id :formDataId
					},
					async : false,
					dataType : 'json',
					success : function(result) {
						 $this.parents(".row").find(".uniquenessError").remove();
						if (result["data"] == "0") {
							$this.parents(".ctrlWraper").after("<span class='error uniquenessError' style=' fontvalidateOpts-weight: bold;'>数据已经存在</span>");
							setTimeout(function(){
								$(".uniquenessError").remove();
							},1000);
							bool = false;
						}
					}
				});
			});
			return bool;
		},

		/**
		 * 增加控件验证方法和数据保存 目前值做新增加数据 ， 修改数据暂为完成，是否考虑表单重复提交问题
		 */
		validateOpts : {

			rules : {

			},
			submitHandler : function(form) {
				if ($("#formSave").attr("id")) {
					$("#formSave").click();
				}
				//var fdEditor = require('./fd.editor');
				var data = {}, formid = ezCommon.formId, //表单ID

				bool = validate.validateQueness(formid), formDataId = $("form").attr('formDataId');

				// 表单数据ID
				if (bool) {
					var ajaxData = require("ajaxData");
					ajaxData.saveFormData();
				}
			},
			errorPlacement : function(error, element) {
				if (element.is(":radio")) {
					error.appendTo(element.parent().parent("div"));
				} else if (element.is(":checkbox")) {
					error.appendTo(element.parent().parent("div"));
				} else if (element.is("textarea")) {
					element.parent().after(error);
				} else if (element.is(":text")) {
					element.parent().after(error);
				}
				if (!error.text() == "" && !objIsnull(element.nextAll("i"))) {
					element.after('<i class="form-control-feedback glyphicon glyphicon-remove" ></i>');
				} else {
					element.nextAll("i").removeClass("glyphicon-ok").addClass("glyphicon-remove");
				}
				error.parent().find(".validsuccess").remove();
			},
			//设置验证触发事件
			onfocusout : function(element) {
				$(element).valid();
			},
			//设置验证成功提示格式
			success : function(e) {
				var controlName = e.attr("for");
				if (!objIsnull(e.prev().find("i"))) {
					e.prev().find("[name=" + controlName + "]").after('<i class="form-control-feedback glyphicon glyphicon-ok" ></i>');
				} else {
					e.prev().find("i").removeClass("glyphicon-remove").addClass("glyphicon-ok");
				}
				e.remove();
			}
		},

	};

	module.exports = validate;
});
;