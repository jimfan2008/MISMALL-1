/**
 * @description  属性面板的 选项的操作设置
 * @author cjli
 * @date 2015-06-29
 */

define(function(require, exports, module) {

	var formJson = require("../formJson.js");

	var item = {

		item : function(ctrl) {
			if (!ctrl)
				return;
			ezCommon.deBug("加载[" + ctrl.cName + "]控件item属性设置文件", "public/Js/Qywx/attribute/item", 10);

			var selectObj = $("body").find(".ctrlSelected");
			var ctrlName = selectObj.attr("ctrlid");
			var attrType = "item";
			var addWhereObj = $(".ItemAttr").find(".itemControl");
			var ctrlType = selectObj.attr("ctrl-type"), ctrlId = selectObj.attr("ctrlid");
			//标题值改变

			//还原属性
			if (ctrlType == "CHECKBOX" || ctrlType == "DROPDOWN"  ||ctrlType == "pick") {
				var itemAttr = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"][attrType];
				//还原选项
				var itemsListHtml = "";
				$.each(itemAttr['items'], function(i, v) {
					itemsListHtml += '<div class="col-md-6 itemDiv" itemId = "' + i + '"  style="padding-left:0;padding-top:5px"><div class="input-group"><span class="input-group-addon"><input type="checkbox"></span><input class="form-control input-sm" type="text" value="' + v.key + '"><div class="deleteItem"></div></div></div>';
				});
				$(".itemControl").empty().append(itemsListHtml);
			}
			var itemObj = $(".itemControl").find("input[type=text]");

			$.each(itemObj, function() {
				item.itemsEdit($(this), ctrlName, attrType);
			});

			//新增选项
			$("#addItem").unbind("click").on("click", function(e) {
				//每个选项的唯一ID号
				var itemId = numRand("item", 8);

				var itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"][attrType];
				var itemIndex = itemJson['itemnum'], attrItems = ++itemJson['itemnum'];
				var itemVal = itemText = '选项' + attrItems;
				//addWhereObj.find("input[type='checkbox']")
				//读取json  此处为item计数的
				var newAttrItem = $('<div class="col-md-6 itemDiv" itemId = "' + itemId + '" style="padding-left:0;padding-top:5px;"><div class="input-group"><span class="input-group-addon"> <input type="checkbox"></span><input type="text" class="form-control input-sm" value="选项' + attrItems + '"><div class="deleteItem"></div></div></div>');
				addWhereObj.append(newAttrItem);

				//分三种情况添加item到主设计器

				if (ctrlType == "DROPDOWN") {
					selectObj.find("select").append('<option value="' + itemVal + '">' + itemVal + '</option>');
				} else if (ctrlType == "CHECKBOX" ) {
					var $newItemHtml = $('<label name="CHECKBOX3" class="checkbox-inline itemLabel buttonType ' + itemId + '" isbasectrl="true"></label>');
					$newItemHtml.append('<input type="checkbox" value="' + itemVal + '"><span>' + itemText + '</span>');
					$newItemHtml.removeClass("onChecked");
					selectObj.find(".ctrlWraper .itemLabel:last").after($newItemHtml);
					
					$newItemHtml.click(function(e){
						preventDefault(e);
						stopEventBubble(e);
						var $this = $(this);
						var $ctrl = $this.closest(".ctrl");
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/CHECKBOX.js", function(e) {
							e.itemCheck($this,$ctrl);
						});
					});
				} else if (ctrlType == "pick") {
					//增加选项到pick的属性中。fzy-2016-04-12
					var $newItemHtml = $('<label name="CHECKBOX3" class="checkbox-inline itemLabel buttonType ' + itemId + '" isbasectrl="true"></label>');
					$newItemHtml.append('<input type="checkbox" value="' + itemVal + '"><span>' + itemText + '</span>');
					$newItemHtml.removeClass("onChecked");
					selectObj.find(".ctrlWraper .itemLabel:last").after($newItemHtml);
					
					$newItemHtml.click(function(e){
						preventDefault(e);
						stopEventBubble(e);
						var $this = $(this);
						var $ctrl = $this.closest(".ctrl");
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/pick.js", function(e) {
							e.itemCheck($this,$ctrl);
						});
					});

				}
				var itemLen = itemJson['items'].length;
				//新增items到json
				var optItem = {
					"key" : itemVal,
					"val" : itemVal,
				};
				itemJson['items'][itemId] = optItem;

				item.itemsEdit($(".itemControl").find("input[type='text']:last"), ctrlName, attrType);
				
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});				
			});

			//分多列显示  多选项布局new样式
			$("#itemRank").find("label.rankLabel").on('click', function() {
				var $selectedvalue = $(this).attr("val");
				$("#itemRank").find(".rankDiv label").removeClass("on");
				$(this).find(".rankDiv label").addClass("on");
				var $class = "col-md-" + Math.floor(12 / $selectedvalue);
				var $class2 = "col-xs-" + Math.floor(12 / $selectedvalue);
				var reg = /col-md-\d{1,2}/;
				var reg2 = /col-xs-\d{1,2}/;
				//微小屏幕显示
				var classObj = selectObj.find(".ctrlWraper .itemLabel");
				var aa = classObj.attr("class");
				if (reg.exec(aa)) {//if  col-md-* 类存在的话就替换否则添加
					classObj.attr("class", classObj.attr("class").replace(reg, $class));
					classObj.attr("class", classObj.attr("class").replace(reg2, $class2));
				} else {
					classObj.addClass($class);
					classObj.addClass($class2);
				}
				selectObj.find(".ctrlWraper .itemLabel:gt(0)").css("margin-left", "0px");
				//更新json
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.update(ctrlName, attrType, "selectLimit", $selectedvalue);
				});

			});

			//原来的多选项排序布局 可以删除
			$("#itemRank").find("input[name='inlineRadioOptions']").unbind("change").on("change", function() {
				var $selectedvalue = $(this).val();

				var $class = "col-md-" + Math.floor(12 / $selectedvalue);
				var $class2 = "col-xs-" + Math.floor(12 / $selectedvalue);
				var reg = /col-md-\d{1,2}/;
				var reg2 = /col-xs-\d{1,2}/;
				//微小屏幕显示
				var classObj = selectObj.find(".ctrlWraper .itemLabel");

				if ($selectedvalue <= 3) {
					var aa = classObj.attr("class");
					if (reg.exec(aa)) {//if  col-md-* 累存在的话就替换否则添加
						classObj.attr("class", classObj.attr("class").replace(reg, $class));
						classObj.attr("class", classObj.attr("class").replace(reg2, $class2));
					} else {
						classObj.addClass($class);
						classObj.addClass($class2);
					}
					selectObj.find(".ctrlWraper .itemLabel:gt(0)").css("margin-left", "0px");
				} else {
					classObj.attr("class", classObj.attr("class").replace(reg, ""));
					classObj.attr("class", classObj.attr("class").replace(reg2, ""));
					selectObj.find(".ctrlWraper .itemLabel:gt(0)").css("margin-left", "10px");
				}
				formJson.update(ctrlName, attrType, "itemRank", $selectedvalue);

			});
			$(".ItemAttr .selectLimit select").unbind("change").on("change", function() {
				var firstLimit = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"][attrType];
				firstLimit['selectLimit'] = $(this).val();

			});
		},

		/**
		 * 重新计算index 也就是个数重新计算
		 * 单选和多选的重新计算
		 * type可以分为item 和 checked  就是item的数量排序和被选中的重新赋值
		 */
		itemsReindex : function(type, itemIdx) {//type可以分为item 和 checked  就是item的数量排序和被选中的重新赋值
			var doms = $(".right-menu").find(".itemControl .itemDiv"), items = [];
			$.each(doms, function(index) {
				var $_this = $(this);
				if (type == "item") {
					var trueVal = $_this.find("input.form-control").val();
					var item = {
						"key" : trueVal,
						"val" : trueVal,
						"id" : itemIdx
					};
					items.push(item);
				} else {
					if ($_this.find("input[type='checkbox']").prop("checked"))
						items.push(index);
				}
			});
			return items;
		},

		/**
		 * 单选按钮和复选框,下拉框,绑定值改变事件，包含新增的
		 */
		itemsEdit : function(inputDom, ctrlName, attrType) {//ctrlName控件名称 attrType=="Item"
			var $_this = inputDom, selectObj = ezCommon.Obj, ctrlType = selectObj.attr("ctrl-type");

			if (ctrlName == undefined) {
				return;
			}
			
			var itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]['attrs'][attrType], addWhereObj = $(".setAttrs").find(".itemControl");
			
			onValueChange(inputDom[0], function() {
				var itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]['attrs'][attrType];
				var itemObjs = $(".ItemAttr  .setAttrs").find(".itemControl").find("input[type=text]");
				var index = itemObjs.index($_this), itemIndex = null;
				var newVal = $_this.val();
				var itemid = $_this.closest("[itemid]").attr("itemid");
				if (ctrlType == "DROPDOWN") {
					var selectOption = selectObj.find("option").eq(index);
					itemIndex = selectOption.attr("value");
					selectOption.text(newVal);
					selectOption.attr("value", newVal);
				} else {
					var $item = ezCommon.Obj.find("." + itemid);
					$item.find("span").text(newVal);
					$item.find("input").val(newVal);

				}
				itemJson['items'][itemid]["key"] = newVal;
				itemJson['items'][itemid]["val"] = newVal;
				
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			});
			
			//选项删除(dropdown,checkbox)
			$(".deleteItem").unbind("click").on("click", function() {//删除item
				var $_this = $(this);
				var itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]['attrs'][attrType];
				var itemsDelete = $(".setAttrs").find(".itemControl .itemDiv");
				var $attrItem = $_this.closest("[itemid]");
				var index = itemsDelete.index($_this);
				var thisId = $attrItem.attr("itemid");
				var delVal = null;
				if (itemsDelete.length == 1) {
					alert("至少保留一项！");
					return;
				}
				$(this).parent().parent().remove();
				if (ctrlType == "DROPDOWN") {
					delVal = selectObj.find(".ctrlWraper").find("option").eq(index).attr("value");
					selectObj.find(".ctrlWraper").find("option").eq(index).remove();
				} else {
					var $item = selectObj.find(".ctrlWraper ." + thisId);
					delVal = $item.find("input").val();
					$item.remove();
				}
				delete itemJson['items'][thisId];
				//删除item信息
				itemJson['checked'] = item.itemsReindex("checked");
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			});
			
			var selectLimit = $(".ItemAttr").find(".selectLimit").find("select").val();
			$(".basicElementView").find(".itemControl input[type='checkbox']").unbind("click,change").on("click", function(e) {//绑定选中事件
				//绑定选中事件
				e.stopPropagation();
				var $_this = $(this), itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]['attrs'][attrType], index = addWhereObj.find("input[type='checkbox']").index($(this)), itemSelect = "";

				if (selectObj.attr("ctrl-type") == "CHECKBOX") {
					var settingItem = $(".basicElementView .itemControl").find("input[type='checkbox']"), selectSetItem = settingItem.eq(index), objItem = selectObj.find(".ctrlWraper").find("label"), selectObjItem = objItem.eq(index);
					var selectLimit = $(".ItemAttr").find(".selectLimit").find("select").val();
					var hasSelect = -1;
					addWhereObj.find("input[type='checkbox']").each(function() {
						if ($(this).prop("checked")) {++hasSelect;
						}
					});
					if (hasSelect >= selectLimit) {
						$_this.prop("checked", false);
						alert('最多选择' + selectLimit + '项');
					}
					if (selectLimit == "1") {
						var itemLabelObj = selectObj.find(".itemLabel");
						if ($(this).prop("checked")) {
							$(".basicElementView").find("input[type='checkbox']").prop("checked", false);

							$(this).prop("checked", true);
							// selectObjItem.find("input[type='checkbox']").click();
							selectObj.find(".onChecked").removeClass("onChecked");
							selectObjItem.addClass("onChecked");
							itemJson['checked'] = {};

							itemJson['checked'][index] = "1";
						} else {
							selectObjItem.hasClass("onChecked") ? selectObjItem.removeClass("onChecked") : "";
							selectObjItem.find("input").prop("checked", false);
							delete itemJson['checked'][index];
						}
						var state = $(this).prop("checked");
						if (state) {
							addWhereObj.find("input[type='checkbox']").removeAttr("checked");
							$(this).prop("checked", state);
						}

						var itemlist = selectObj.find(".ctrlWraper").find("input");
						itemlist.removeAttr("checked");
						itemlist.eq(index).prop("checked", $(this).prop("checked"));

						itemlist.each(function(n) {
							if ($(this).prop("checked")) {
								itemJson['checked'][$(this).attr('value')] = "1";
							} else {
								delete itemJson['checked'][$(this).attr('value')];
							}
						});
					} else {
						if ($(this).prop("checked")) {
							selectObjItem.hasClass("onChecked") ? "" : selectObjItem.addClass("onChecked");
							selectObjItem.find("input").prop("checked", true);
							itemJson['checked'][index] = "1";
						} else {
							selectObjItem.hasClass("onChecked") ? selectObjItem.removeClass("onChecked") : "";
							selectObjItem.find("input").prop("checked", false);
							delete itemJson['checked'][index];
						}
						var selectObjItem = selectObj.find(".ctrlWraper").find("input").eq(index);
						if (selectObjItem.prop("checked")) {

						}
						selectObjItem.prop("checked", $(this).prop("checked"));
						selectObj.find(".ctrlWraper").find("input").each(function(i) {
							if ($(this).prop("checked")) {
								itemJson['checked'][$(this).attr('value')] = "1";
							} else {
								delete itemJson['checked'][$(this).attr('value')];
							}
						});
					}

				} else {
					var state = $(this).prop("checked");
					if (state) {
						addWhereObj.find("input[type='checkbox']").removeAttr("checked");
						$(this).prop("checked", state);
					}
					if (selectObj.attr("ctrl-type") == "DROPDOWN") {
						if ($(this).prop("checked")) {
							itemJson['checked'] = {};

							itemJson['checked'][index] = "1";
						} else {
							delete itemJson['checked'][index];
						}
						var itemlist = selectObj.find(".ctrlWraper").find("option");
						itemlist.removeAttr("selected");
						itemlist.eq(index).prop("selected", $(this).prop("checked"));
						itemlist.each(function() {
							if ($(this).prop("selected")) {

								itemJson['checked'][$(this).attr('value')] = "1";
							} else {
								delete itemJson['checked'][$(this).attr('value')];
							}
						});
					}
				}

			});
		}
	};
	
	
	
	module.exports = item;
});
