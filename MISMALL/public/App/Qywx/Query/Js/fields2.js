
/**
 * @author CC
 * 通过字段多表查询
 * 2014.4.25
 */
var flowId = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
 var byFields = {
 	
 	
 	initGetTable : function(){

 		var strLi = "<li><span style='height:10px;width:130px;float:left'></span><span class='title'><input type='text' value='asd' placeholder='请输入需要信息'/></span></li><li><span class='title'><input type='text' value='asd1' placeholder='请输入需要信息'/></span></li><li><span class='title'><input type='text' value='asd2' placeholder='请输入需要信息'/></span></li>";
 		for (var i = 0; i <= 5; i++) {
 			//$(".right_data_header").append(strLi);
 		};
 		$(".right_data").append("<table><tr><th>1</th></tr><tr><td class='title'><input type='text' placeholder='请输入需要信息' from=''/></td></tr></table>");
 		$('.right_data table').delegate("input:last","focus", function(){
 			$(".ac_results").remove();
 			var sizes = $(this).parent().parent().find("td").size();
 			sizes = sizes*1+1*1;
 			
 			$("<th>"+sizes+"</th>").appendTo(".right_data table tr:first");
 			$("<td class='title'><input type='text' placeholder='请输入需要信息' from=''/></td>").appendTo(".right_data table tr:has(input)");
 			
 		});
 		/*
		 $(".right_data table").delegate("input","blur",function(){
					  var $val = $(this).val();
					  if($val != ""){
						  $(this).parent("td:first").append($val);
						  $(this).remove();
												  }
										  });*/
		 
 		$(".right_data table").find("tr:eq(1)").delegate("td","click",function(){
 			
 			var v = $(this).text();
 			if(v != ""  && $(this).find("input").size() == 0){
 				$(this).empty();
 				$(this).append('<input type="text" value="'+ v +'" placeholder="请输入需要信息"/ from="keyinput">');
 				$(this).find("input:first").val("").focus().val(v);
 				
 			}
 		}).delegate("input","keydown",function(e){//上下移动选择需要的结果
 			
 				var that =$(this);
 		//alert(e.which);
 				if(e.which == 38){
 					
 						var L =$(".ac_results").find("li").length;
 					if($(".ac_results").find("li.on").length == 0){
 						
 						$(".ac_results").find("li:last").addClass("on");
 					}else{
 						if($(".ac_results").find("li.on").prevAll().length ==0){
 							$(".ac_results").find("li").removeClass("on");
 							$(".ac_results").find("li:last").addClass("on");
 						}else{
 							
 							$(".ac_results").find("li.on").prev().addClass("on");
 							$(".ac_results").find("li.on:last").removeClass("on");
 							
 						}
 					}
 					if($(".ac_results").find("li:has(.on)").length==0){
 						
 					}
 					//alert(e.which);//向上
 				}else if (e.which == 40)//乡下
 				{
 					if($(".ac_results").find("li.on").length == 0){
 						$(".ac_results").find("li:first").addClass("on");
 					}else{
 						if($(".ac_results").find("li.on").nextAll().length ==0){
 							$(".ac_results").find("li").removeClass("on");
 							$(".ac_results").find("li:first").addClass("on");
 						}else{
 							$(".ac_results").find("li.on").next().addClass("on");
 							$(".ac_results").find("li.on:first").removeClass("on");
 						}
 					}
 				
 				}else if(e.which == 13){
 					//alert($(".ac_results").find("li.on").text());
 					if($(".ac_results").find("li.on").length != 0){
 						that.val($(".ac_results").find("li.on").text());
 						$(".ac_results").remove();
 					}
 					//此处可以加上搜索结果的函数
 				}
 		}).delegate("input","keyup",function(e){
 			
 			
 				
 			if(e.which>15 && e.which!=38 && e.which!=40){
 				
 			var obj =$(this);
 			byFields.searchFields(obj);
 			
 				
 			}	
 			
 		}).delegate("input:not(:last)", "focus",function(){
 			//alert("sad");
 			var that =$(this);
 			$(".ac_results").delegate("li","click",function(){
 				
 					that.val($(this).text());
 					$(".ac_results").remove();
 				});
 			
 			
 			/*
			*/
			 
 			
 		}).delegate("input:not(:last)","blur", function(){//失去焦点开始查询
 			$(".ac_results *").click(function(e){
 			
        		console.log(e.target);


 			});
 			//$(".ac_results").remove();
 			if($(this).val()!="")
 			byFields.searchResults();//搜索可以的结果
 		});
 		$(".left_Fieldlist").delegate("li","click",function(){
 			$(".left_Fieldlist li").removeClass("current");
 			$(this).addClass("current");
 			var sql =$(this).data("sql");
 			var tables = $(this).data("tables");
 			byFields.getResultByList(sql,tables,"f");//f代表加载筛选字段
 			
 		});
 		
 		$(".right_data table").find("tr:eq(0)").delegate("th", "mouseover", function(){
 			$(this).append("<span class='delete'></span>");
 			//alert($(this).xml);
 			$(this).find("span").on("click",function(){
 				if($(".right_data table").find("tr:eq(0)").find("th").length==1)
 				return;
 				var i = $(".right_data table tr:eq(0)").find("th:has('span')").index();
 				$(".right_data table tr").find("td:eq('"+i+"')").remove();
 				$(this).parent().remove();
 				byFields.getThIndex();
 				
 			});
 		}).delegate("th","mouseleave",function(){
 			$(this).find("span").remove();
 		});
 		//此处是可以在不知道有哪些字段名字的情况下进行查看所有的字段的功能  暂时屏蔽掉
 		$(".right_data table").find("tr:eq(1)").delegate("td", "mouseover", function(index){
 			//$(this).append("<span class='more_fields'></span>");
 			//alert($(this).xml);
 			$(this).find("span").on("click",function(){
 				
 				var i = $(".right_data table tr:eq(0)").find("th:has('span')").index();
 				//$(".right_data table tr").find("td:eq('"+i+"')").remove();
 				//$(this).parent().remove();
 				
 				
 			});
 		}).delegate("td","mouseleave",function(){
 			$(this).find("span").remove();
 		});
 		
		
        
 		var flowId = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
 		var CCname = _getUrlParas('CCname') ? _getUrlParas('CCname') : '';
 		//$(".addFields").find("input:first").val(CCname);
 		//alert(flowId);
 		
 		byFields.initAddCon();
 		byFields.initSearch();//点击或回车方法提交搜索
 		//byFields.initSelectFields();
 	},
 	
 	//搜字段的
	searchFields : function (obj){
		var that =obj; 
 			var $width = obj.css("width");
 			var $top  = obj.offset().top;
 			
 			var $h = obj.css('height');
 			//alert($top+$h);
 			var result = $('<div class="ac_results"><ul></ul></div>');
 				result.css({
 					"width" : $width,
 					"position" : "absolute",
 					"top" : $top+30,
 					"left":obj.offset().left
 				});
 				var typeText  = obj.val();
 				var re = /[\w\u4e00-\u9fa5]/;
 				//var aa  = re.test(typeText);
 				//alert(aa);
 				if(re.test(typeText)){
 					_commonAjax({
 						url  : GROUPPATH + "/Query/filterQueryFieldInfo",
 						data : {
 							flowid  : flowId,
 							keyword : typeText
 						},
 						async : false,
 						dataType : 'text',
 						success : function(r){
 							if( r== "null" || r == "")
 								return;
 							var objJson = JSON.parse(r);
 							$.each(objJson,function(i,o){
 								
	 							result.find("ul").append("<li class=''>"+o+"</li>");
 							});
 						}
 					});
 				}else{
 					
 				}
 				$(".ac_results").remove();
 				
 				obj.attr("from","keyinput");
 				//result.appendTo($(this).parent().after());
 				result.appendTo("body");
 				$(".ac_results").delegate("li","click",function(){
 					that.val($(this).text());
 					$(".ac_results").remove();
 				});
	},
 	//搜结果的,根据关键字搜索可行的方案，默认显示第一个方案
 	searchResults : function (){
 		var flowid = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
 		var keywords ='' ;
 		$(".left_Fieldlist").empty();
 			$(".right_data table").find("tr:eq(1) input:not(:last)").each(function() {
 				
 				if($(this).val() !="") {
 					keywords += $(this).val() +"|";//关键字拼接
 				}
 			});
 			keywords =keywords.substring(0,keywords.length-1);
 			if(keywords){
 				
 			$.ajax({
 				type : "post", 
				data : {
					field_words  : keywords,
					   flow_id   : flowid
				},
				url : GROUPPATH + "/Query/getQueryPlanLists",
				dataType : 'text',
				async : false,
				success : function(r) {
					console.log(r);
					if (r=='[]') {
						console.log("没找到方案！！！");
						$(".right_data table").find("tr:gt(1)").remove();
			 
						return;
					}
					//var test = '[{"main_table":"cc_tbfm201404241638142485","querySql":"SELECT CCTextBox9 FROM cc_tbfm201404241638142485"},{"main_table":"cc_tbfm201404241632204767","querySql":"SELECT CCTextBox5 FROM cc_tbfm201404241632204767"}]';
					var rtest = JSON.parse(r);
					//console.log(keywords);
					//console.log(rtest);
					$(rtest).each(function(i){
						var re = $("<li>方案"+(i*1+1*1)+"</li>");
					//	console.log(rtest[i]);
//						console.log(rtest[i]['queryTables'].length);
						if(rtest[i]['queryTables'].length==25){
							re.data("tables",rtest[i]['queryTables']);
						}else{
							re.data("tables",rtest[i]['queryTables']);
						}
						
						//if(rtest[i]['conn_table']){
							//re.data("tables",rtest[i]['main_table']+"."+rtest[i]["conn_table"]);
						//}else{
							//re.data("tables",rtest[i]['main_table']);
					//	}
						re.data("sql",rtest[i]['querySql']);
						//console.log(rtest[i]['querySql']);
						$(".left_Fieldlist").append(re);
					});
					var Ob = $(".left_Fieldlist").find("li:first");
					var sql = Ob.data("sql");
					var tables = Ob.data("tables"); 
					console.log(tables+"ASDASDASD");
				byFields.getResultByList(sql,tables,"f");//默认加载第一个f代表加载筛选字段
				
					$(".left_Fieldlist").find("li:first").addClass("current");
					system._initGetSql();
				}
			});
			 }else{
			 	$(".right_data table").find("tr:gt(1)").remove();
			 }
 	},
 	//判断是否是可以隐藏表名的
 	tableshow:function(){
 		
 	},
 	//初始化选择字段筛选的   自己手动筛选
 	initSelectFields : function(tables){
 		
 		if($("#right_where_content .moreCon").attr("by")=="more"){
 			
 		
	 		//如果已经初始化了的就不能再一次初始化而要选择OPEN it
	 		if($("#select_fields").hasClass("window-body")){
	 			$("#select_fields table").remove();
	 		}else{
	 			$("#select_fields").empty();
	 		}
	 		
	 		
	 		var tables = tables;
	 		var L = tables.length;
	 			
	 			
	 			var rtable = $("<table></table>");
	 			//var $result= $("#")
	 			$("#select_fields").append(rtable);
	 			
	 			$(".right_where_column>li[add!=add]").each(function(){
	 				
	 				if($(this).hasClass("table")){
	 					
	 					var tr =$("<tr></tr>");
	 					var td = ("<td class='"+ $(this).attr("id") +"' style='width:100px;color:#0E9E12;font-size:16px;' align='left'><input type='checkbox'  name='"+$(this).attr("id")+"' field='main' />"+$(this).text()+"</td><td></td>");
	 					tr.append(td);
	 					rtable.append(tr);
	 				}else{ 
	 					if($(this).css("display")!="none"){
	 						var $names = rtable.find("td:last").prev().attr("class");
	 						rtable.find("td:last").append("<li><input type='checkbox'   value='"+ $(this).attr("fname") +"' field='"+ $(this).attr("ftype") + "' name='" + $names + "' checked/> <a>"+ 
	 						$(this).find("span:first").text() +"</a></li>");
	 					}else{
	 						var $names = rtable.find("td:last").prev().attr("class");
	 						rtable.find("td:last").append("<li><input type='checkbox'   value='"+ $(this).attr("fname") +"' field='"+ $(this).attr("ftype") + "' name='" + $names + "' /> <a>"+ 
	 						$(this).find("span:first").text() +"</a></li>");
	 					}
	 					
	 				}
	 				
	 			});
	 		
	 		//$("#select_fields").append("<input type='checkbox' id='a' />");
	 		if($("#select_fields").hasClass("window-body")){
	 			$("#select_fields").find("div.panel>div").append(rtable);
	 			$("#select_fields").dialog('open');
	 		}else{
	 			$("#select_fields").append(rtable);
	 			$("#select_fields").dialog({
				//iconCls: 'icon-save',	
				title: '选择需要的筛选的字段信息',    
			    width: 600,    
			    height: 300,    
			   //s closed: false,    
			   // cache: false,    
			   // href: 'get_content.php',    
			    modal: true ,
			    resizable:true,
			   
		    	buttons: [{
					text:'确定',
					iconCls:'icon-ok',
					handler:function(){
						var mark = $(".moreCon").attr("by");
						$("#select_fields table:first").find("input[field!=main]").each(function(e){
							
							var name = $(this).attr("name");
							var cvalue = $(this).attr("value");
							if(mark !="single"){//判断是单表还是多表的情况
								if($(this).prop("checked")){
									$("#"+name).nextAll("li[fname="+cvalue+"][tablename="+name+"]").css("display", "block");
								}else{
								
								//alert($("#"+name).nextAll("li[fname="+cvalue+"]:first").text());
									$("#"+name).nextAll("li[fname="+cvalue+"][tablename="+name+"]").css("display", "none");
								}
							//console.log($("#"+name).nextAll("li[tablename="+name+"]").prop("checked").length);
							}else{
								if($(this).prop("checked")){
									$(".right_where_column").find("li[fname="+cvalue+"]").css("display", "block");
								}else{
								
								//alert($("#"+name).nextAll("li[fname="+cvalue+"]:first").text());
									$(".right_where_column").find("li[fname="+cvalue+"]").css("display", "none");
								}
								
								
							}
							
							
						});
						//console.log($("#"+name).nextAll("li[tablename="+name+"]").prop("checked").length);
						//this.dialog("close");
						$("#select_fields").dialog("close");
					}
				},{
					text:'取消',
					iconCls:'icon-cancel',
					handler:function(){
							$("#select_fields").dialog("close");
						}
				}],
				
	 		});
	 		$("#select_fields").css("overflow","auto");
	 		}
	 		$("#select_fields table").delegate("input[field=main]","click",function(){
	 						
						  if($(this).prop("checked")==true){
							  $(this).parent().next().find("input").prop("checked",true);
						  }else{
							  $(this).parent().next().find("input").prop("checked",false);
						  }
	 					});
 		
 		
 		}
 		
 	},
 	
 	getResultByList : function(sql,tables,mark){
 		
			byFields.conditionAdd(); 
 		if(sql){
 			
 			console.log(sql+"<br />");
			var firstArr = new Array();
			
			var secondTr =$(".right_data table").find('tr:eq(1)');
			_commonAjax({
				url : GROUPPATH + '/Query/execAQueryPlan',
				data : {
					sql : sql
				},
				async : false,
				dataType: 'text',
				success : function(r){
					console.log(r+"这是查询之后的结果");
					var resultSize;
					var obj = JSON.parse(r);


					$(obj).each(function(i){
						console.log(obj[i]);
						 resultSize = i;
							for(var k in obj[i]){
								
								try{
									if(typeof(JSON.parse(obj[i][k]))== "number"){
										firstArr.push(obj[i][k]);
									}
									
									$.each(JSON.parse(obj[i][k]),function(n,m){
										
										firstArr.push(m['name']);										
									});
								}catch(e){
									//console.log(obj[i][k]+"dangebiaaoDDD");
									firstArr.push(obj[i][k]);
								}
							}
					});

					var h = 0;
					//console.log(resultSize);
				//	console.log(firstArr);
					var inputSize = secondTr.find("input").size();
					$(".right_data table").find("tr:gt(1)").remove();
					
					for(var l=0;l<=resultSize;l++){
						var tr = $("<tr></tr>");
						for(var j= 0;j<inputSize; j++ ){
							
							if(secondTr.find("input:eq("+j+")").val() !=""){
							
								tr.append("<td>"+ firstArr[h] +"</td>");
								h++;
							}else{
								tr.append("<td></td>");
							}
						}
						$(".right_data table").append(tr);
					}
					
					
				}
			});
			
			
			if(mark=="f")//标记是否是第一次  如果是就会加载筛选字段 如果是F那就要加载
			byFields.getConditionFields(tables);//筛选字段的加载
			$(".moreCon").click(function(){
				
				var tables = $(".left_Fieldlist li.current").data("tables");
				byFields.initSelectFields(tables);
			});
		}
 	},
 	//筛选字段的加载
 	getConditionFields : function  (tables) {
 		console.log(tables+"AAAAAAA");
 		if(tables){
 			var t = tables.split(",");
 			console.log(t);
 		
		   _commonAjax({
		   	url : GROUPPATH + "/Query/getConditionFields",
		   	dataType : 'text',
		   	async : false,
		   	data : {
		   		tables : tables
		   	},
		   	type : 'post', 
		   	success : function(r){
		   		
		   		//console.log(r);
		   		var objField = JSON.parse(r);
		   		var j = 0;
		   		var strConditionTitle;
		   		var strConditionLast = '<select><option value="1">等于</option>' 
												+ '<option value="2">大于等于</option>' 
												+ '<option value="3">小于等于</option>' 
												+ '<option value="4">大于</option>' 
												+ '<option value="5">小于</option>' 
												+ '<option value="6">不等于</option>' 
												+ '<option value="7">包含</option>' 
												+ '</select><input type="text" class="normal" oninput="system.changeDataFromType($(this))" datafrom="" '
												+ 'field="" immark="" value="" /><img class="addCondition" ' 
												+ 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' 
												+ 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
						var strConditionLast1 = '<select><option value="1">等于</option>' 
												+ '<option value="2">大于等于</option>' 
												+ '<option value="3">小于等于</option>' 
												+ '<option value="4">大于</option>' + '<option value="5">小于</option>' 
												+ '<option value="6">不等于</option>' + '<option value="7">包含</option>' 
												+ '</select><input class="easyui-datetimebox"  data-options="editable:false" style="width:210px;height:30px;line-height:30px;font-size:15px;margin-left:0px;"/><img class="addCondition" ' 
												+ 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' 
												+ 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
		   		$(".right_where_column").empty();
		   		for(var i in objField){
		   			$(".right_where_column").append("<li class='table' id='"+ t[j] +"'>"+ i +"表</li>");
		   			
		   			$(objField[i]).each(function(index){
		   				
		   				
		   				if(objField[i][index].controlType.indexOf("CCTime")>=0){
		   					strConditionTitle = '<li add="no" ftype="' + objField[i][index].controlType + '" fname="' + objField[i][index].fieldName + '" tablename="'+ t[j] +'" style="display:none" id="CCTime"><span class="tit" >' + objField[i][index].fieldTitle + '</span>';
		   				
		   					strConditionTitle += strConditionLast1;
		   					$(".right_where_column").append(strConditionTitle);
		   					$.parser.parse($("#CCTime"));//初始化当前的ss 
							$("#CCTime").removeAttr("id");
		   					
		   				}else{
		   					strConditionTitle = '<li add="no" ftype="' + objField[i][index].controlType + '" fname="' + objField[i][index].fieldName + '" tablename="'+ t[j] +'" style="display:none"><span class="tit" >' + objField[i][index].fieldTitle + '</span>';
		   				
		   					strConditionTitle += strConditionLast;
		   					$(".right_where_column").append(strConditionTitle);
		   				}
		   				//$(".right_where_column").append(strConditionTitle);
		   				
		   			});
		   			++j;
		   		}
		   		
		   		byFields.conditionAdd();
		   		system._printSql();
		   		byFields._addSysFields();
		   		
		   	}
		   });
	   }
	 },
	 
	 //筛选条件的增加
	 
	 conditionAdd : function(){
	 	$(".right_where_column .addCondition").on("click", function(e) {
	 		//alert("click");
	 		alert($(e.target).parent().html());
				// EventUtil.stopPropagation(e);
				var mark = true;
				var fname = $(this).parent().attr("fname");
				var tname = $(this).parent().attr("tablename");
				
				$(this).parent().parent().find("li[fname='" + fname + "'][tablename='"+tname+"']").each(function() {
					//如果不是时间为空
					
					if (fname.substr(0, 6) != "CCTime" && $(this).find("input").val() == '') {
						mark = false;
						var obj = $(this).find(".addCuo");
						obj.fadeIn();
						setTimeout(function() {
							obj.fadeOut();
						}, 1000);
					} else if (fname.substr(0, 6) == "CCTime" && $(this).find("input[type=hidden]").val() == "") {//如果是时间为空
						mark = false;
						var obj = $(this).find(".addCuo");
						obj.fadeIn();
						setTimeout(function() {
							obj.fadeOut();
						}, 1000);
					}
				});

				if (mark == true) {
					var fname = $(this).parent().attr("fname");
					var tablename = $(this).parent().attr("tablename");
					var ftype = $(this).parent().attr("ftype");
					
					if (fname.substr(0, 6) == "CCTime") {
						$(this).parent().parent().find("li[fname='" + fname + "'][tablename='"+tablename+"']").last().after('<li fname="' + fname + '" add="add" id="addConditions" tablename="'+ tablename +'" ftype="'
						+ftype+'" >' 
						+ '<span style="background:#fff;" class="tit">&nbsp;</span>' 
						+ '<select style="width:68pt;"><option value="or">或者</option>' 
						+ '<option value="and">并且</option></select>'
						+ '<select><option value="1">等于</option>' 
						+ '<option value="2">大于等于</option>' 
						+ '<option value="3">小于等于</option>' 
						+ '<option value="4">大于</option>' 
						+ '<option value="5">小于</option>' 
						+ '<option value="6">不等于</option>' 
						+ '<option value="7">包含</option>' 
						+ '</select><input  data-options="showSeconds:true,editable:false" class="easyui-datetimebox" ' 
						+ 'style="width:210px;height:30px;line-height:30px;font-size:15px;margin-left:0px;" />' 
						+ '<img class="delCondition" ' 
						+ 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' 
						+ IMAGES_URL + 'icon_sjydel.png" />' 
						+ '<a class="addCuo">请先填写筛选条件</a></li>');
						$.parser.parse($("#addConditions"));//初始化当前的ss 
						$("#addConditions").removeAttr("id");
					} else {
						$(this).parent().parent().find("li[fname='" + fname + "'][tablename='"+tablename+"']").last().after('<li fname="' + fname + '" add="add" tablename="'+tablename+'" ftype="'+ftype+'">' 
						+ '<span style="background:#fff;" class="tit">&nbsp;</span>' 
						+ '<select style="width:68pt;"><option value="or">或者</option>' 
						+ '<option value="and">并且</option></select>' 
						+ '<select><option value="1">等于</option>' 
						+ '<option value="2">大于等于</option>' 
						+ '<option value="3">小于等于</option>' 
						+ '<option value="4">大于</option>' 
						+ '<option value="5">小于</option>' 
						+ '<option value="6">不等于</option>' 
						+ '<option value="7">包含</option>' 
						+ '</select><input type="text" class="normal" '
						+ 'oninput="system.changeDataFromType($(this))" datafrom="" field="" immark="" value="" /><img class="delCondition" ' 
						+ 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' 
						+ IMAGES_URL + 'icon_sjydel.png" />' 
						+ '<a class="addCuo">请先填写筛选条件</a></li>');
					}

					$(".delCondition").on("click", function() {
						$(this).parent().remove();
						system._initGetSql();
					});
					system._printSql();
					//查数据
					
					//初始化鼠标和回车打印sql
					system._addSysFields();
					//增加右键系统变量的
				}
			});
	 },
	 //筛选条件的增加end
 	//条件的增加start
 	initAddCon : function(){
 		//新增元素绑定事件的处理可以参考这里
 		$(".addCon").on("click",function(){
 			$('<span><input type="text" placeholder="输入查询信息" /><img class="delCon" src="/cycc/images/icon_sjydel.png" ></span>').find(".delCon").click(byFields.delAction).end().appendTo($(".addFields"));
 			//$(this).parent().after('<span><input type="text" placeholder="输入查询信息" /><img class="delCon" src="/cycc/images/icon_sjydel.png" ></span>');
 			
 		});
 	
 		
		 
		
 	},
 	dropClick : function (e) {
 		var isClick = false;
 		$(".ac_results").delegate("p","click",function(e){
 				isClick= true;
 					alert($(this).text());
 					var $input = $(e).find("input:first");
 					$input.attr("from", "click");
 					$input.val($(this).text());
 					/*
					 $(this).parents("td:first").text($(this).text());
					 $('.ac_results').remove();*/
					 
 					e.stopPropagation();
 				});
 				return isClick;
 	},
 	
 	//拖动
 	dragGable : function () {
 		
 	},
 	//条件的删除
 	delAction : function (){
 		
 		$(this).parents("span").remove();
 	},
 	//点击和回车事件进行搜索
 	initSearch : function (){
 		$("#searchByField").on("click",function(){//点击提交按钮提交
 			byFields.getSearchValue();
 		});
 		$("#byFields").on("keyup", "input", function(event){//回车事件提交搜索
 			 if(event.keyCode == 13)
 			byFields.getSearchValue();
 			//alert("enter_tijiao");
 		});
 	},
 	
 	getSearchValue : function () {
 		var keyword="";
 		$(".addFields").find("input").each(function(){
 			if($(this).val()!='' )
 			keyword += $(this).val()+"#";
 		});
 		var flowId = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
 		
 		_commonAjax({
 			url : GROUPPATH + '/Query/searchByFields',
 			type : "post",
 			data : {
 				
 				keyword : keyword,
 				flowId  : flowId,
 			},
 			async : false,
 			dataType : 'text',
 			success : function (r){
 				//alert(typeof r);
 				var json_obj = jQuery.parseJSON(r);
 				//var obj = r.text().split(",");
 				$("#clickTable .left_Fieldlist").empty();
 				$(json_obj).each(function(index){
 					$("#clickTable .left_Fieldlist").append("<li id='"+json_obj[index]+"'>方案"+(index*1+1*1)+"</li>");
 				});
 				
 				//$("clickTable .left_Fieldlist").append();
 			}
 		});
 	},
 	
 	
 	/*
     * 获取条件判断的
     * */
      getConditionValue:function(str){
            var v;
            switch(str) {
                case '1':
                    v = "=";
                    break;
                case '2':
                    v = ">=";
                    break;
                case '3':
                    v = "<=";
                    break;
                case '4':
                    v = ">";
                    break;
                case '5':
                    v = "<";
                    break;
                case '6':
                    v = "!=";
                    break;
                case '7':
                    v = "like";
                    break;
            }
            return v;
        },
 	/*
 	 *多表的sql拼接和xml组合
 	 * */
 	
 	getSqlAndXml:function(){
 		
 		
 			
 		//alert("asd");
 		 $('#dlg').dialog({
                    title : '设置数据源',
                    width : 320,
                    height : 170,
                    closed : false,
                    cache : false,
                    modal : true,
                    iconCls : 'icon-save',
                    buttons : [{
                        text : 'Ok',
                        iconCls : 'icon-ok',
                        handler : function() {
                            if ($("#submitsourcename").val() == '') {
                                $("#validTip").css("color", "red");
                            } else{
                            	 var d = new Date();
				                var vYear = d.getFullYear().toString();
				                var vMon = (d.getMonth() + 1).toString();
				                var vDay = d.getDate().toString();
				                var h = d.getHours().toString();
				                var m = d.getMinutes().toString();
				                var se = d.getSeconds().toString();
				                var datestr = vYear + vMon + vDay + h + m + se;
				 				
				 				var tablesName = $(".left_Fieldlist").find("li.current").data("tables");
				 				var  xml_str = "";
				 				var xml_str1 = "";
				 				xml_str1 += '<querier><sourcesname>' + $("#submitsourcename").val() + '</sourcesname>';
				                
				                var $header = "<header>";
				               $(".right_data").find("table:first").find("td.title").each(function(index){
				               		if($(this).find("input").val()){
				               			var htitle ="<title id='t"+(index*1+1*1)+"'>";
				               			
				               			htitle += "<tableTitle>"+$(this).find("input").val()+"</tableTitle>";
				               			htitle += "<from>" + $(this).find("input").attr("from") +"</from>";
				               			htitle +="</title>";
				               			$header += htitle;
				               			
				               		}
				               		
				               	});
				               	$header+="</header>";
				               	xml_str1 +=$header;
				               	xml_str1 += '<maintablename>' + tablesName + '</maintablename>';
				                var $fields = "<fields>";
				                
				                
				 				
				 		$(".right_where_column").find("li:not(.table)").each(function(){
				 			if($(this).find("input:first").val() != ""){
				 				
				 				var	$table = $(this).attr("tablename");
				 				var fieldname = $(this).attr("fname");
				 		
				 			
				 				
				 				
				                //var main_tableId = $(".left_formlist").find("li.current").attr("tid");
				 				
				 				var cons = "";
				 				
				 				
				 				
				 				 if ($(this).attr("add") != "add") {
				                        xml_str += "</conditions></field>";
				                        xml_str += '<field id=" field' + datestr + (Math.ceil(Math.random() * 10000)).toString() + ' ">';
				                        xml_str += '<tablename>' + $table + '</tablename>';
				                        xml_str += '<name>' + $(this).find("span:first").text() + '</name>';
				                        xml_str += '<type>' + $(this).attr("ftype") + '</type>';//类型
				                        xml_str += '<value>' + $(this).attr("fname") + '</value>';//控件名字
				                        xml_str += '<display>' + "byFields" + '</display><conditions>';
				                        if ($(this).attr("fname").substr(0, 6) != "CCTime") {
				                            if ($(this).find("input.normal").val() != '') {
				                                $(this).find("select").val();
				                                xml_str += '<condition><cvalue>' + $(this).find("select").val() + '</cvalue>' + '<showvalue>' + $(this).find("input.normal").val() + '</showvalue>' + '<fieldvalue>' 
				                                + $(this).find("input.normal").attr("field") + '</fieldvalue>' + '<datafrom>' + $(this).find("input.normal").attr("datafrom") + '</datafrom>' + '<immark>' + $(this).find("input.normal").attr("immark") + '</immark>' + '</condition>';
				                            }
				                        } else {
				                            if ($(this).find("input[type=hidden]").val() != '') {
				
				                                xml_str += '<condition><cvalue>' + $(this).find("select").val() + '</cvalue>' + '<showvalue>' + $(this).find("input[type=hidden]").val() + '</showvalue></condition>';
				                            }
				                        }
				                    } else if ($(this).attr("add") == "add") {
				                        if ($(this).attr("fname").substr(0, 6) != "CCTime") {
				                            if ($(this).find("input.normal").val() != '') {
				
				                                xml_str += '<condition><linkvalue>' + $(this).find("select:first").val() + '</linkvalue>' + '<cvalue>' + $(this).find("select:last").val() + '</cvalue>' + '<showvalue>' + $(this).find("input.normal").val() + '</showvalue>' + '<fieldvalue>' + $(this).find("input.normal").attr("field") + '</fieldvalue>' + '<datafrom>' + $(this).find("input.normal").attr("datafrom") + '</datafrom>' + '<immark>' + $(this).find("input.normal").attr("immark") + '</immark>' + '</condition>';
				                            }
				                        } else {
				                            if ($(this).find("input[type=hidden]").val() != '') {
				                                xml_str += '<condition><linkvalue>' + $(this).find("select:first").val() + '</linkvalue>' + '<cvalue>' + $(this).find("select:last").val() + '</cvalue>' + '<showvalue>' + $(this).find("input[type=hidden]").val() + '</showvalue></condition>';
				                            }
				                        }
				                    }
				                    
				 				/*if($(this).attr("add")=="no"){
				 					cons = + ") and ("+$table+"."+fieldname+" ";
				 					cons = + byFields.getConditionValue($(this).find("select:first").val())+"'"+$(this).find("input:first").val()+"'";
				 					
				 				}else{
				 					cons = +$(this).find("select:first").val()+" "+$table+"."+fieldname;
				 					cons += byFields.getConditionValue($(this).find("select:get(1)").val())+"'"+$(this).find("input:first").val()+"'";
				 					
				 				}
				 				alert(cons);*/
				 			}
				 			
				 			
				 		});
				 		xml_str += '</conditions></field>';
				 		xml_str  = xml_str.substring(21);
				 		$fields  += xml_str+"</fields>";
				 		xml_str1 = xml_str1+$fields;
				 		var sql = $("#sqlresult").text()+$("#sqltable").text()+$("#sqlwhere").text();
				 		
				 		
				 		xml_str1 +="<sql>"+$("#sqlresult").text()+$("#sqlwhere").text()+"</sql></querier>";
				 		var tables_name = $(".left_formlist").find("li.current").data("tables");
                        var querier_name = $("#submitsourcename").val();
                        var formid = _getUrlParas('formid') ? _getUrlParas('formid') : '';
                        var querier_id = _getUrlParas('querier_id') ? _getUrlParas('querier_id') : '';
                        var flowid = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
                       
                        if (querier_id != "") {
                            _commonAjax({
                                processData : false,
                                data : {
                                    flow_id : flowid,
                                    xml_str : xml_str1,
                                    querier_name : querier_name,
                                    tables_name : tables_name,
                                    querier_id : querier_id,
                                    form_id : formid
                                },
                                url : GROUPPATH + "/Query/editAQuerierData",
                                dataType : 'text',
                                async : true,
                                success : function(result) {
                                    if (result) {
                                        window.parent.bid = result; 
                                        window.parent.qname = querier_name;
                                        parent.$('#win').window('close');
                                        
                                    }
                                }
                            });
                        } else {
                            _commonAjax({
                                processData : false,
                                data : {
                                    flow_id : flowid,
                                    xml_str : xml_str1,
                                    querier_name : querier_name,
                                    tables_name : tablesName,
                                    form_id : formid
                                },
                                async : true,
                                url : GROUPPATH + "/Query/saveAQuerierData",
                                dataType : 'text',
                                success : function(result) {
                                    if (result) {
                                        window.parent.bid = result; 
                                        window.parent.qname = querier_name;
                                        parent.$('#win').window('close');
                                    }
                                }
                            });
                        }
                            }
                        }
                    }, {
                        text : 'Cancel',
                        handler : function() {
                            $('#dlg').dialog('close');
                        }
                    }]

                });
 		return;
 		
 	},
 	/*
	 * 为列表横向添加序号
	 */
	getThIndex:function(){
		$(".right_data table tr:eq(0) th").each(function(){
			$(this).text($(this).index()+1);
		});
	},
	//增加系统变量插件
	_addSysFields : function() {
		var editTname = system.initGetTname();
		$(".right_where_column").find("input.normal").on("keydown", function(e) {
			$(this).parent();
			//判断首行是否为空
			$("#mm").menu("hide");
			var kc = system.getKeyCode(e);
			if ((kc == 8 || kc == 46) && $(this).attr("immark") != "true") {
				$(this).val("");
				$(this).attr("immark", "true");
			}

		});
		

		$(".right_where_column").find("input.normal").on("keyup", function(e) {
			var kc = system.getKeyCode(e);
			if (kc == 13) {
				system._initGetSql();
			}
			$(this).attr("value", $(this).val()).attr("field", $(this).val());
		});

		$(".right_where_column").find("input.normal").on("click", function(e) {
			
			var obj = $(this);
			//e.preventDefault();
			//obj.attr("immark", "false");
			if(obj.attr("immark") == "false"){
				obj.nextAll().blur();
				obj.val(obj.val()).select();
			}
			
			obj.focus();
			

			$('#mm').menu({
				onClick : function(item) {
					obj.attr("immark", "false");
					var type = $("#" + item.id).parent().attr("type");
					if (type == undefined) {
						type = $("#" + item.id).attr("type");
						if (item.id == "null") {
							
							obj.val('');
							obj.attr({
								"datafrom" : "null",
								"field" : "",
								"value" : ""
							});
						}
						

					} else {
						
						switch(type) {
							case "sysParam":
								obj.val(item.text);
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
								break;
							case "form":
								obj.val("表单中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});

								break;
							case "table":
								obj.val("表格中【"+item.text+"】的值");
								obj.attr({
									"datafrom" : type,
									"field"    :item.id,
									"value"	   : obj.val()
								});
								break;
						}
							system._initGetSql();
					}

					//输出两次是因为失去焦点的时候又查询了一次
					//system._initGetSql();

				}
			});
			$('#mm').menu('show', {
				left : $(this).offset().left + 80,
				top : $(this).offset().top + 30
			});

		});
		
		$(".right_where_column").find("input.validatebox-text").on("click", function(e) {
			
			var obj = $(this);
			//e.preventDefault();
			obj.attr("immark", "false");
			obj.nextAll().blur();
			obj.focus();
			obj.val(obj.val()).select();

			$('#mm').menu({
				onClick : function(item) {

					var type = $("#" + item.id).parent().attr("type");
					if (type == undefined) {
						type = $("#" + item.id).attr("type");
						if (item.id == "null") {
							obj.val("");
							obj.attr({
								"datafrom" : "null",
								"field" : "",
								"value" : ""
							});
						}
						

					} else {
						switch(type) {
							case "sysParam":
								obj.val(item.text);
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
								break;
							case "form":
								obj.val("表单中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
							case "table":
								obj.val("表格中【"+item.text+"】的值");
								obj.attr({
									"datafrom" : type,
									"field"    :item.id,
									"value"	   : obj.val()
								});

								break;
						}
							system._initGetSql();
					}

					//输出两次是因为失去焦点的时候又查询了一次
					//system._initGetSql();

				}
			});
			$('#mm').menu('show', {
				left : $(this).offset().left + 80,
				top : $(this).offset().top + 30
			});

		});
	},
	//初始化sql
	_initGetSql : function(){
		
		//var strResult = '';//结果集
		//需要查找获取的字段
		var strWhere = " (1 = 1 ";
		$(".right_where_column").find("li:not(.table)").each(function() {
			//判断是否隐藏了
			if ($(this).css("display") != "none") {//现在加了筛选条件的隐藏所以隐藏条件不会参与筛选 start筛选

				//需要判断是否是带时间插件的

				//alert($(this).attr("add"));
				var strTname = $(this).attr("tablename");
				if ($(this).attr("fname").substring(0, 6) != "CCTime" && $(this).find("input").val() != '' && $(this).attr("add") != "add") {//不为空 第一条 不是时间
					//strResult += strTname+"."+$(this).attr("fname") + ' , ';
					var link_str = system.getConditionValue($(this).find("select").val());
					if (link_str != "like") {
						switch($(this).find("input").attr("datafrom")) {
							case "input":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '" + $(this).find("input").val() + "' ";
								break;
							case "sysParam":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '#" + $(this).find("input").attr("field") + "#' ";
								break;
							case "form":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '$" + $(this).find("input").attr("field") + "$' ";
								break;
							case "table":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '$" + $(this).find("input").attr("field") + "$' ";
								break;
							case "null":
								break;
						}
					} else {//相似的时候
						switch($(this).find("input").attr("datafrom")) {
							case "input":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '%" + $(this).find("input").val() + "%' ";
								break;
							case "sysParam":
								strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '%#" + $(this).find("input").attr("field") + "#%' ";
								break;
							case "form":
								strWhere += ") and (" +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '%$" + $(this).find("input").attr("field") + "$%' ";
								break;
							case "table":
								strWhere += ") and (" +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " " + link_str + " '%$" + $(this).find("input").attr("field") + "$%' ";
								break;
							 case "null":
								break;

						}
					}

				} else if ($(this).attr("fname").substring(0, 6) != "CCTime" && $(this).find("input").val() != '' && $(this).attr("add") == "add") {//不是时间 不为空 且为增加的条件

					if ($(this).prevAll("li[add=no]").eq(0).find("input").val() == '') {
						//alert($(this).prev("li[add=no]").eq(0).find(".addCuo").val());
						var errorObj = $(this).prevAll("li[add=no]").eq(0).find(".addCuo");
						errorObj.fadeIn().text("第一行不能为空！");
						/*setTimeout(function(){
						 errorObj.fadeOut();
						 },1500);*/

					}
					var strlianjie = $(this).find("select:first").val();
					var link_str = system.getConditionValue($(this).find("select:last").val());
					if (link_str != "like") {
						switch($(this).find("input").attr("datafrom")) {
							case "input":
								strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + "'" + $(this).find("input").val() + "'";
								break;
							case "sysParam":
								strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + "#" + $(this).find("input").attr("field") + "#";
								break;
							case "form":
								strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + " $" + $(this).find("input").attr("field") + "$ ";
								break;
							case "table":
								strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + " $" + $(this).find("input").attr("field") + "$ ";
								break;
							case "null":
								break;

						}
					} else {//相似的时候
						switch($(this).find("input").attr("datafrom")) {
							case "input":
								strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + "'%" + $(this).find("input").val() + "%'";
								break;
							case "sysParam":
								strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + "'%#" + $(this).find("input").attr("field") + "#%'";
								break;
							case "form":
								strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
								break;
							case "table":
								strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
								break;
							case "null":
								break;

						}
					}

				} else if ($(this).attr("fname").substring(0, 6) == "CCTime" && $(this).find("input[type=hidden]").val() != '' && $(this).attr("add") != "add") {//时间 非空 非增加
					//strResult += strTname+"."+ strTname+"."+ $(this).attr("fname") + ' , ';

					switch($(this).find("select").val()) {
						case '1':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " = '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '2':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " >= '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '3':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " <= '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '4':
							strWhere += ") and (" +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " > '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '5':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " < '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '6':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " != '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '7':
							strWhere += ") and (" + byFields.getTrueValue(strTname,$(this).attr('fname')) + " like '%" + $(this).find('input[type=hidden]').val() + "%' ";
							break;
					}
				} else if ($(this).attr("fname").substring(0, 6) == "CCTime" && $(this).find("input[type=hidden]").val() != '' && $(this).attr("add") == "add") {//时间 非空 增加

					if ($(this).prevAll("li[add=no]").eq(0).find("input[type=hidden]").val() == '') {
						//alert($(this).prev("li[add=no]").eq(0).find(".addCuo").val());
						var errorObj = $(this).prevAll("li[add=no]").eq(0).find(".addCuo");
						errorObj.fadeIn().text("第一行不能为空！");
						/*setTimeout(function(){
						 errorObj.fadeOut();
						 },1500);*/

					}
					var strlianjie = $(this).find("select:first").val();

					switch($(this).find("select:last").val()) {
						case '1':
							strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + " = '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '2':
							strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " >= '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '3':
							strWhere += " " + strlianjie + " " + byFields.getTrueValue(strTname,$(this).attr('fname')) + " <= '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '4':
							strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " > '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '5':
							strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " < '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '6':
							strWhere += " " + strlianjie + " " +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " != '" + $(this).find('input[type=hidden]').val() + "' ";
							break;
						case '7':
							strWhere += " " + strlianjie + ' ' +  byFields.getTrueValue(strTname,$(this).attr('fname')) + " like '%" + $(this).find('input[type=hidden]').val() + "%' ";
							break;
					}
				} else if ($(this).attr("add") != "add") {
					//strResult += strTname+"."+$(this).attr("fname") + ' , ';
				}

			}//隐藏判断end
		});//循环完毕
		
		strWhere += ')';
		
		$("#sqltable").text("");
		var $s = $(".left_Fieldlist").find("li.current").data("sql");
		$("#sqlresult").text($s);
		if($s){
			if($s.indexOf("WHERE")>-1){
				
				$("#sqlwhere").text(" AND  "+strWhere);
			}else{
				$("#sqlwhere").text(" WHERE  "+strWhere);
			}
		}
		
		var sql = $("#sqlresult").text()+$("#sqlwhere").text();
		var tables = $(".left_Fieldlist").find("li.current").data("tables");
		console.log($(".left_Fieldlist").find("li.current").data("sql"));
		
		byFields.getResultByList(sql,tables,"t");//t代表是否重新加载筛选字段,T代表不加载f代表加载
		
	},
	//对dropdown，radio，checkbox等的替换处理
	getTrueValue:function($table_name, $field_name){
		var $fieldname = $field_name.substring(0, 7);
		var newArr = ["CCRadio", "CCCheck", "CCDropD"];
		if(newArr.toString().indexOf($fieldname) > -1) {
			return 'SUBSTR(' + $table_name + '.' + $field_name + ', INSTR(' + $table_name + '.' + $field_name + ", 'name')+7, INSTR(" + $table_name + '.' + $field_name + ", '}')-INSTR(" + $table_name + '.' + $field_name + ", 'name')-8)";				// 处理操作
		}else{
			return $table_name + '.' + $field_name; 
		}
		//var $fieldname = substr($field_name, 0, 7);
		//var $control_filter = array("CCRadio", "CCCheck", "CCDropD");

		
	}
 };