/**
 * Mis Mall设计器属性库
 * @author 陈毅
 * 2015-05-06
 */

var ATTRLIB = {
	//常规属性库
	General : {
		//控件标题
		title : '<div class="col-md-6 basic-small-title titleCtrl"><label>标题</label><input type="text" class="form-control input-sm" id="ctrlTitle"  placeholder="未命名"></div>',

		//单位
		unit : '<div class="col-md-6 basic-small-title"><label>单位</label><input type="text" class="form-control input-sm" id="unit"  maxlength="10"></div>',

		//提示信息
		proInfo : '<div class="col-md-6 basic-small-title"><label>框外提示</label><input type="text" class="form-control input-sm" id="tip" maxlength="20"></div>',
       
        //内部提示
		placeholder: '<div class="col-md-6 basic-small-title"><label>框内提示</label><input type="text" class="form-control input-sm" id="InnerTip"  placeholder=""></div>',

		//布局
		layout : '<div class="col-md-12 attr-list layout" id="attrLayout"><label class="col-md-12">布局</label><div class="col-md-12">' + '<label class="col-md-3"><div class="layouts"><label class="clum1"></label></div></label><label class="col-md-4">' + '<div class="layouts"><label class="clum2"></label><label class="clum2"></label></div></label><label class="col-md-4"><div class="layouts"><label class="clum3"></label><label class="clum3"></label><label class="clum3"></label></div></label></div></div></div>',

		//是否只读
		isRdOnly : '<div class="col-md-6 basic-small-title"><label class="col-md-4 basic-left">只读</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isRdOnly"/></div></div>',

		//是否隐藏
		isHidden : '<div class="col-md-6 basic-small-title" style = "clear:left"><label class="col-md-6 basic-left">隐藏</label><div class="col-md-6 select-position" ><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isHidden" /></div></div>',
        //添加数据标题
        addFiledTitle : '<div class="col-md-12 fieldDataProperty basic-small-title" style="display:none;"><div class="col-md-4" style="padding:0px;"><span style="display:block;height:100%;line-height:2">标题显示</span></div><div class="col-md-6" style="margin-left:10px"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="addFiledTitle" checked/></div></div>',
	    //可编辑
		isEdit : '<div class="col-md-12"><label class="col-md-3">可编辑</label><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isEdit" /></div></div><div class="col-md-12"><hr /></div>',
		
		//是否有边框
		isBorder : '<div class="col-md-6 basic-small-title "><label class="col-md-4 basic-left">边框</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch  " data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isBorder" checked/></div></div>',
		
		isTitle : '<div class="col-md-12 basic-small-title "><label class="basic-left" style = "float:left;padding:0 15px">形状</label><div class="inputSet"><label class="col-md-3"><a class="inputType0"><div class="inputStyle0">AB</div></a></label><label class="col-md-3"><a class="inputType1"><div class="inputStyle1"></div></a></label><label class="col-md-3 style-three"><span class="inputStyle2">AB</span><a class="inputType2"></a></label><br style="clear:both"></div></div>',
		
		//是否禁用
		isEnabled : '<div class="col-md-6 basic-small-title"><label class="col-md-4 basic-left">禁用</label><div class="col-md-6 button-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="DisEnabled" /></div></div>',
       	
		//是否为提交按钮
		isSubmit:'<div class="col-md-6 basic-small-title"><label class="col-md-4 basic-left">提交</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isSubmit"/></div></div>',
		
		//添加请选择, "isHidden"
		addChoose : '<div class="col-md-6 basic-small-title"><label class="col-md-6 basic-left">添加选择</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="addChoose" /></div></div>',
	    //设置图片大小
        uploadPictureSize : '<div style="clear:left" class="col-md-12 basic-small-title"><label class="col-md-4 basic-left">图片大小上限</label><div class="col-md-8 select-position"><input type="text" class="form-control input-sm" id="uploadPictureSize" style="width:100px"><select style="height:30px" id="pictureUnit"><option>请选择单位</option><option>K</option><option>M</option></select></div></div>',
        //设置上传图片裁剪框尺寸
        setTheFrameSize : '<div style="clear:left" class="col-md-12 basic-small-title"><label class="col-md-4 basic-left">设置裁剪尺寸</label><div class="col-md-8 select-position">宽:&nbsp;<input type="text" class="form-control input-sm" id="frameWidth" style="width:80px">高:&nbsp;<input type="text" class="form-control input-sm" id="frameHeight" style="width:80px"></div></div>',

	    //图片数据来源
		isFormData: '<div class="col-md-12 basic-small-title "><label class="col-md-6 basic-left">指定图片</label><div class="col-md-6 select-position" style="margin-left:-130px"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isFormData" /></div></div>',
		
		
　　		//图片是否压缩
		isCompressPic: '<div class="col-md-6 basic-small-title "><label class="col-md-6 basic-left">压缩</label><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isCompressPic" /></div></div>',
   		
   		//设置标题
	    setCompName : '<div class="row editName"><div class="col-md-3"><span style="display:block;height:100%;line-height:2">标题</span></div><div class="col-md-8"><input type="text" class="form-control input-sm setCompName" id="setCompName"/></div></div>',

		//编辑文本
		editText : '<div class="row editText"><div class="col-md-2"><span style="display:block;height:100%;line-height:2">内容</span></div><div class="col-md-10"><textarea rows="2" class="form-control ctrlisrdonly" id="editText"></textarea></div></div>',
	   
	    //百度地图详细地址
	    "setBaiduSite" : '<div class="row baidumap"><div class="col-md-4"><span style="display:block;height:100%;line-height:2">详细地址：</span></div><div class="col-md-8" ><input type="text" value="北京" class="form-control setCompName setBaiduSiteInput" id="setBaiduSite"/><div id="searchResultPanel" style="border:1px solid #C0C0C0;width:150px;height:auto; display:none;"></div></div></div>',	
	   
	    //百度地图组件高度
        "baiduHeight" : '<div class="row baidumap"><div class="col-md-4"><span style="display:block;height:100%;line-height:2">高度设定：</span></div><div class="col-md-8" ><input type="text" class="form-control setHeight" value="200" /></div></div><div class="row baidumap"><div class="col-md-4"><button class="btn btn-primary btn setBaiduSiteButton">定位</button></div></div>',
	   
	    //自定义组件设置列数属性
	    "setDynaCols" : '<div class="col-md-6 basic-small-title"><label>设置组件列数</label><select class="setDynaCols form-control input-sm"><option value="1">一列</option><option value="2">两列</option><option value="3">三列</option></select></div>',
	    
	    //自定义组件定时刷新属性
	    "refreshData" : '<div class="row customcomponent"><div class="col-md-4"><span style="display:block;height:100%;line-height:2">定时刷新</span></div><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="refreshData" /></div></div><div class="setRefreshData row"><div class="row"><div class="col-md-4"><span style="display: block;height: 100%;line-height: 2">新记录排序:</span></div><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="sortData" /></div></div></div><div class="row"><div class="col-md-4"><span style="display: block;height: 100%;line-height: 2">是否数据累加:</span></div><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isAppendData" /></div></div></div><div class="refreshTimerWrap"><span> 时间间隔</span><input type="text" id="dynaFreshTime" class="btn"><span>秒</span></div></div>',
	    
	     //自定义组件首次加载数据属性
        "is_firstloaddata" :  '<div class="col-md-6 basic-small-title "><label class="col-md-8 basic-left">首次加载数据</label><div class="col-md-6 select-position" ><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="firstloaddata" /></div></div>',
        
        //自定义组件钩选数据属性
         "checkedData" :'<div class="col-md-7 basic-small-title "><label class="col-md-5 basic-left">勾选数据</label><div class=" select-position" ><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="checkedData" /></div></div>',
         
        //自定义组件修改按钮
         "modifyDataBtn" : '<div class="col-md-12 basic-small-title"><button class="btn  modifyDataBtn" type="button">绑定数据</button></div>',
       	//轮播图
       	"swiper" : '<div class="col-md-5 basic-small-title"></div>',
       	//奖项数量设置
       	"lotteryNumber" :'<div class="col-md-12" style="padding-top:10px"><label class="col-md-4 basic-small-title item-left">奖项数量设置</label><div class="col-md-8 lotteryLimit" style="margin-top:10px"><select class="form-control input-sm"><option value="1">数量为1</option><option value="2">数量为2</option><option value="3">数量为3</option><option value="4">数量为4</option><option value="5">数量为5</option></select></div></div>',
	    //抽奖次数设置
		"lotteryChance" : '<div class="col-md-12" style="padding-top:10px"><label class="col-md-4 basic-small-title item-left">抽奖次数设置</label><div class="col-md-8 lotteryChance" style="margin-top:10px"><select class="form-control input-sm"><option value="1">每天三次</option><option value="2">每周三次</option><option value="3">整个周期三次</option></select></div></div>',
	    //活动名称
		"activityName" : '<div class="col-md-12" style="padding-top:10px"><label class="col-md-4 basic-small-title item-left">活动名称</label><label class="col-md-8" style="margin-top:10px;"><input type="text" class="form-control input-sm" id="activityName"  placeholder="未命名"></label></div>',
		//修改表单数据
		"formDataUpdate" : '<div class="col-md-12 basic-small-title" style="display:none"><label class="col-md-4 basic-left">修改表单数据</label><div class="col-md-6 button-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="formDataUpdate" /></div></div>',
	},
	
	style : {

		//样式
		selectedView : '<div class="col-md-12  basic-small-title "><label style="float:left;padding:0 15px" class="basic-left">样式</label><div style="margin-top:6px" class="radioset"><label class="col-md-3"><a style="position: relative; border: 1px solid rgb(204, 204, 204); border-radius: 50%; padding: 0px 8px;" class="radioType0"><div style="position: absolute; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: rgb(136, 136, 136) none repeat scroll 0% 0%; left: 4px;"></div></a><span style="padding-left:10px;margin-top:-5px">AB</span></label><label class="col-md-4"><a class="radioType1"><div style="height: 20px; border: 1px solid rgb(85, 85, 85); text-align: center; width: 65px;">AB</div></a></label><label class="col-md-3"><a class="radioType1"><div style="height: 20px; border: 1px solid rgb(85, 85, 85); text-align: center; border-radius: 50%; width: 65px;">AB</div></a></label><br style="clear:both"></div></div>',
		//固定定位栏在头部以及底部
		fixedColbox:'<div class="col-md-12  basic-small-title "><label style="float:left;padding:0 15px" class="basic-left">定位方式</label><div style="margin-top:6px" class="radioset"><label class="col-md-3"><span style="width:60px;height:20px;border:1px solid #ccc;display:block;text-align:center;font-weight:normal;color:black" id="fixedTop">头部</span></label><label class="col-md-3"><span style="width:60px;height:20px;border:1px solid #ccc;display:block;text-align:center;font-weight:normal;color:black" id="fixedBottom">底部</span></label><br style="clear:both"></div></div>',

		//背景颜色
		bgColor : '<div class="ez-panel-item h30 pure-bg-color basic-small-title" style = "width:30%;"><span class="ez-left-align">背景</span><input type="text" class="ez-left setColor" id="pure-bg-color" style="display: none;"><br></div>',
		
		//文本颜色
		textColor : '<div class="ez-panel-item h30 text-color basic-small-title" style = "width:30%;" ><span class="ez-left-align">文字</span><input type="text" class="ez-left setColor" id="text-color" style="display: none;"><br></div>',
		
		//边框颜色
		borderColor : '<div class="ez-panel-item h30 border-bg-color basic-small-title" style = "width:30%;"><span class="ez-left-align">边框</span><input type="text" class="ez-left setColor" id="border-bg-color" style="display: none;"><br></div>',
        //点击颜色
		clickColor : '<div class="ez-panel-item h30 border-bg-color basic-small-title"><span class="ez-left-align">点击颜色</span><input type="text" class="ez-left setColor" id="button-click-color" style="display: none;"><br></div>',

		//文本对齐
		textAlign : '<div class="ez-panel-item h30 basic-small-title"  style="width:100%"><span class="ez-text-align" style="margin-left:15px;">对齐</span><span style="float:left;margin-left:45px;width:72%" class="ez-left"><div class="setAlign ui-buttonset" id="main-text-align"><input type="radio" name="radio" id="main-text-align-left"  class="ui-helper-hidden-accessible"><label for="main-text-align-left" class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left" role="button" aria-disabled="false"><span class="ui-button-text">左</span></label><input type="radio" name="radio" id="main-text-align-center" class="ui-helper-hidden-accessible"><label for="main-text-align-center" class="ui-button ui-widget ui-state-default ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">中</span></label><input type="radio" name="radio" id="main-text-align-right" class="ui-helper-hidden-accessible"><label for="main-text-align-right" class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-right" role="button" aria-disabled="false"><span class="ui-button-text">右</span></label></div></span></div>',
		//按钮对齐
		buttonAlign : '<div class="ez-panel-item h30 basic-small-title" style="width:100%"><span class="ez-text-align" style="margin-left:15px;">对齐</span><span style="float:left;margin-left:18px;width:72%" class="ez-left"><div class="setAlign ui-buttonset" id="main-text-align"><input type="radio" name="radio" id="main-text-align-left"  class="ui-helper-hidden-accessible"><label for="main-text-align-left" class=" ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left" role="button" aria-disabled="false"><span class="ui-button-text">左</span></label><input type="radio" name="radio" id="main-text-align-center" class="ui-helper-hidden-accessible"><label for="main-text-align-center" class="ui-button ui-widget ui-state-default ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">中</span></label><input type="radio" name="radio" id="main-text-align-right" class="ui-helper-hidden-accessible"><label for="main-text-align-right" class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-right" role="button" aria-disabled="false"><span class="ui-button-text">右</span></label></div></span></div>',
		//文字大小
		fontSize : '<div class="ez-setting-content" style="margin-top:20px;margin-bottom:20px"><span class="ez-text-align" style="float:left" >文字大小</span><div id="size-slider" class="ez-left ez-slider setSlide slide-left"></div><span class="ez-spinner" ><input type="text" id="size-spinner" class="setSpinner slideValue "/></span></div>',
		
		//文本行高lineheight-slider
		"lineHeight" : '<div class="ez-setting-content"><span class="ez-text-align" style="float:left" >文本行高</span><div id="lineheight-slider" class="ez-left ez-slider setSlide slide-left"></div><span class="ez-spinner" ><input type="text" id="lineheight-spinner" class="setSpinner slideValue "/></span></div>',
		
		//图片大小
		"pictureWidth" : '<div class="ez-setting-content"> <span class="ez-text-align" style="float:left"> 图片大小</span><div id="pictureSize-slider" class="ez-left ez-slider setSlide"  style=""></div><span class="ez-spinner" ><input type="text" id="pictureSize-spinner" class="setSpinner slideValue"/></span></div>',
		//文字加粗
	    "fontWeight" : '<div class="row font-bold basic-small-title" style="margin-left:15px;width:90%;margin-top:-5px;margin-bottom:12px;"><div class="col-md-2" style="padding :0"><span style="display:block;height:100%;line-height:2">文字加粗</span></div><div class="col-md-6"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isFontWeight"/></div></div>',  
		"isTitleElse" : '<div class="col-md-7 basic-small-title hideOrShowTitle" style="float: right; margin-bottom: 12px; margin-top: -34px; margin-right: -36px;"><label class="col-md-5 basic-left">隐藏标题</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="isTitleElse"/></div></div>',
		//文字字体
		fontFamily : '<div class="ez-setting-content"><span class="ez-text-align" style="float:left;margin-top:4px">文字字体</span><select class="ez-select font-family" style="margin-left:20px"><option value="宋体">宋体</option><option value="微软雅黑">微软雅黑</option><option value="隶体">隶体</option>①		<option value=“仿宋”>仿宋</option><option value=“新宋体”>新宋体</option><option value=“黑体”>黑体</option><option value=“楷体”>楷体</option><option value=“David”>David</option><option value=“DFKai-SB”>DFKai-SB</option></select></div>',
		//边框大小
		borderWidth : '<div class="ez-setting-content borderWidthStyle"> <span class="ez-text-align" style="float:left"> </span><div id="border-slider" class="ez-left ez-slider setSlide slide-left"  style="margin-left:100px"></div><span class="ez-spinner" ><input type="text" id="border-spinner" class="setSpinner slideValue"/></span></div>',

        borderSingle : '<div class="ez-setting-content borderWidthStyle"><div class="borderRadius"><div class="borderSingle"><span class="">左</span><span class="ez-spinner" ><input type="text" id="borderLeft-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="e">上</span><span class="ez-spinner" ><input type="text" id="borderTop-spinner" class="setSpinnerSingle slideValue"/></span></div></div><div class="borderWidth"><div class="borderSingle"><span class="">右</span><span class="ez-spinner" ><input type="text" id="borderRight-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="">下</span><span class="ez-spinner" ><input type="text" id="borderBottom-spinner"class="setSpinnerSingle slideValue"/></span></div></div></div>',

        //圆角
		borderRadius : '<div class="ez-setting-content borderRadiusStyle" style="display:none"><span class="ez-text-align" style="float:left"></span><div id="radius-slider" class="ez-left ez-slider setSlide slide-left" style="margin-left:100px"></div><span class="ez-spinner" ><input type="text" id="radius-spinner" class="setSpinner slideValue"/></span></div>',
		
		//边框 圆角 四边单独设
		"borderRadiusSingle" : '<div class="ez-setting-content borderRadiusStyle" style="display:none"><div id="radiusSetting"><div class="inputLeft"><span class="ez-spinner radiusTop" ><input type="text" id="radiusLeft-spinner" class="setSpinnerSingle slideValue marginLeft"/></span><span class="ez-spinner radiusBottom" ><input type="text" id="radiusRight-spinner" class="setSpinnerSingle slideValue marginRight"/></span></div><div class="inputRight"><span class="ez-spinner radiusTop" ><input type="text" id="radiusTop-spinner" class="setSpinnerSingle slideValue marginLeft"/></span><span class="ez-spinner radiusBottom" ><input type="text" id="radiusBottom-spinner" class="setSpinnerSingle slideValue marginRight"/></span></div></div></div>',
		
		//外边距
		margin  : '<div class="ez-setting-content marginStyle" style="display:none"><span class="ez-text-align" style="float:left" ></span><div id="margin-slider" class="ez-left ez-slider setSlide slide-left" style="margin-left:100px"></div><span class="ez-spinner" ><input type="text" id="margin-spinner" class="setSpinner slideValue"/></span></div>',
		
		marginSingle : '<div class="ez-setting-content marginStyle" style="display:none"><div class="borderRadius"><div class="borderSingle"><span class="">左</span><span class="ez-spinner" ><input type="text" id="marginLeft-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="">上</span><span class="ez-spinner" ><input type="text" id="marginTop-spinner" class="setSpinnerSingle slideValue"/></span></div></div><div class="borderWidth"><div class="borderSingle"><span class="">右</span><span class="ez-spinner" ><input type="text" id="marginRight-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="">下</span><span class="ez-spinner" ><input type="text" id="marginBottom-spinner"class="setSpinnerSingle slideValue"/></span></div></div></div>',
		
		//内边距
		padding : '<div class="ez-setting-content paddingStyle" style="display:none"><span class="ez-text-align" style="float:left" ></span><div id="padding-slider" class="ez-left ez-slider setSlide slide-left" style="margin-left:100px"></div><span class="ez-spinner" ><input type="text" id="padding-spinner" class="setSpinner slideValue"/></span></div>',
		paddingSingle : '<div class="ez-setting-content paddingStyle" style="display:none"><div class="borderRadius"><div class="borderSingle"><span class="">左</span><span class="ez-spinner" ><input type="text" id="paddingLeft-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="">上</span><span class="ez-spinner" ><input type="text" id="paddingTop-spinner" class="setSpinnerSingle slideValue"/></span></div></div><div class="borderWidth"><div class="borderSingle"><span class="">右</span><span class="ez-spinner" ><input type="text" id="paddingRight-spinner" class="setSpinnerSingle slideValue"/></span></div><div class="borderSingle"><span class="">下</span><span class="ez-spinner" ><input type="text" id="paddingBottom-spinner"class="setSpinnerSingle slideValue"/></span></div></div></div>',
		
		//水平阴影
		  shuiping : '<div class="col-md-6 basic-small-title"><label>水平阴影</label><input type="number" value="0" class="form-control input-sm" id="shuiping"  maxlength="10"></div>',
		//垂直阴影
		  chuizhi : '<div class="col-md-6 basic-small-title"><label>垂直阴影</label><input type="number" value="0" class="form-control input-sm" id="chuizhi"  maxlength="10"></div>',
		//模糊距离
		  chicun : '<div class="col-md-6 basic-small-title"><label>模糊距离</label><input type="number" value="0" class="form-control input-sm" id="chicun"  maxlength="10"></div>',
		//阴影颜色
          yanse : '<div class="ez-panel-item h30 shadow-color basic-small-title" style = "width:30%;" ><span class="ez-left-align">阴影颜色</span><input type="text" class="ez-left setColor" id="shadow-color" style="display: none;"><br></div>',
		//阴影变化
		  bianhua: '<div class="col-md-6 basic-small-title"><label>颜色变化</label><input type="number" value="0" class="form-control input-sm" id="bianhua"  maxlength="10"></div>',
		
		//四边变换
		fourChangeStyle:'<div class="col-md-12" style="margin-top:10px;"><div style="width:380px;height:50px;" class="sliderSpring"><ul id="sliderSpring" class="nav nav-tabs nav-justified" role="tablist"><li value="borderWidthStyle" role="presentation" style="background:#EEEEEE"><a href="#">边框大小</a></li><li value="paddingStyle" role="presentation"><a href="#">内边距</a></li><li value="marginStyle" role="presentation"><a href="#">外边距</a></li><li value="borderRadiusStyle" role="presentation"><a href="#">圆角大小</a></li></ul></div></div>',
		
		//分栏栏位数设置
		colsSetting : '<div class="row colsSetting"><div class="col-md-5" ><span style="display:block;height:100%;line-height:3; margin-top: 10px;">栏位设置</span></div><div class="colsPreList col-md-7"><span><i type="cols12-0" cols ="1"></i></span><span><i type="cols6-6" cols="2"></i></span><span><i type="cols4-4-4" cols = "3"></i></span></div></div><div class = "colsSlider" style="margin-top:10px"><div id ="cols-slider" class="slider" data-role="slider"></div></div></div>',
				
        //定位栏宽度
       	"boxWidth" : '<div class="ez-setting-content boxWidth"> <span class="ez-text-align" style="float:left">宽度 </span><div id="colbox-slider" class="ez-left ez-slider setSlide slide-left"  style="margin-left:70px"></div><span class="ez-spinner" ><input type="text" id="colbox-spinner" class="setSpinner slideValue"/></span></div>',
        
		//更换图片按钮(页面)
		"changepageImg" : '<div class="ez-panel-item col-md-12"><span style="margin-top:16px;float:left" class="">&nbsp;</span><span style="margin-left: 50px; margin-top: -15px; float: left; width: 150px;" class=""><button class="changeBackgroundImg" style="margin-left:-30px ;margin-top: -90px;   border-radius:0px;border-bottom:0px;border-right:0px;background:#009DD9;width:80px;height:25px;color:white">更换图片</button><button style=" margin-top: -90px; border-radius: 0px; border-bottom: 0px none; border-right: 0px none; background:#ccc; width: 88px; height: 25px; color: white;" class="removeBgImg">取消背景图片</button></span></div>',
		
		//更换图片按钮(展示图片)
		"changeImg" : '<div class="ez-panel-item col-md-12"><span style="width:90px;margin-top:16px;float:left" class="">更换图片</span><span style="margin-left: 100px; margin-top: -15px; float: left; width: 100px;" class=""><button class="changeBackgroundImg" style="margin-left:-30px ;margin-top: -90px;   border-radius:0px;border-bottom:0px;border-right:0px;background:#009DD9;width:80px;height:25px;color:white">更换图片</button></span></div>',
       //添加删除按钮
		"changeBrowse" : '<div class="ez-panel-item col-md-12"><span style="width:90px;margin-top:16px;float:left" class=""></span><span style="margin-left: 100px; margin-top: -15px; float: left; width: 147px;" class=""><button class="changeBrowse" style="margin-left:-73px ;margin-top: -90px;   border-radius:0px;border-bottom:0px;border-right:0px;background:#009DD9;width:80px;height:25px;color:white">添加页面</button><button style=" margin-left:33px ;margin-top: -90px;   border-radius:0px;border-bottom:0px;border-right:0px;background:#009DD9;width:80px;height:25px;color:white" class="removeBrowse">删除页面</button></span></div>',
		
		//更换图片
		"changeImage" : '<div class="ez-settings-content changeImageContent" style="padding-bottom:75px;min-height:360px;display:none;">'
				+'<div class="change-image-top">'
					+'<p class="desc">上传您自己的图片<br>'
					+'你可以上传2MB以下，格式为：.jpg，.gif，.png的图片</p>'
					+'<p class="btn-upload">'
						+'<button id = "selectLocalImg">上传图片</button>'
					+'</p>'
					+'<p style = "display:none;"><input id="image_upload" name="image_upload" type="file" multiple="true" style = "display:none;"></p>'
					+'<div id="progress"><div id="bar"></div></div>'
					+'<div id="persent"><span id = "persentData">0</span><span class = "unit">%</span></div>'
				+'</div>'
				+'<div id="selectAll" style="z-index:110;float:right;position:relative;top:8px;width:150px">'
					+'<div class="check-div" style="width:20px;padding:4px 12px; box-sizing: content-box;">'
						+'<input class="check" type="checkbox">'
						+'<a class="delta-icon"></a>'
					+'</div>'
					+'<div class="selectAll-setting" style="display:none;">'
                        +'<a class="delta-div"></a>'
                        +'<div class="select-div">'
                            +'<a style="border-bottom:1px solid #ECECEC;">全选</a>'
                            +'<a>反选</a>'
                        +'</div>'
                    +'</div>'
					+'<div class="check-div" style="position:absolute;width:40px;top:0px;right:50px; box-sizing: content-box;padding:4px 0;">&nbsp'
						+'<a href="javascript:void(0);" class="delete" title="删除">&nbsp</a>'
					+'</div>'
				+'</div>'
				+'<div id="tabs" style="width:'+(($(window).width()*0.75)-55)+'px;padding-left:10px;padding-right:10px;">'
					+'<ul>'
						+'<li><a href="#my-image">我的图片</a></li>'
						+'<li><a href="#system-image">系统图片</a></li>'
						+'<li><a href="#system-glyphicon">系统图标</a></li>'
						+'<li></li>'
					+'</ul>'
					+'<div id="my-image">'
						+'<div style="border-right:1px solid #AAAAAA;float:left;width:18%;height:100%;">'
							+'<div class="my-image-type">'
								+'<ul>'
									+'<li id="my-image-all"><p class="image-type-name"><span>全部图片</span><span id="total-image-number">(0)</span></p></li>'
								+'</ul>'
							+'</div>'
							+'<div id="add-folder" class="ez-button-s check-div" style="display:none">添加文件夹</div>'
						+'</div>'
						+'<div id="image-list" style="width:'+(($(window).width()*0.7)-200)+'px;height:100%;">'
							
						+'</div>'
						+'<div class="pagination" id="my_image_page"></div>'
					+'</div>'
					+'<div id="system-image"><div id="system-imglist">'
					
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
						+'<div style="width:151.025px;" class="image-item"><div data-original="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" style="background: transparent url(&quot;http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg&quot;) no-repeat scroll center center / auto 100%; width: 149.025px; display: block;" src="http://img.woyaogexing.com/2015/12/09/c904d6aa41545f90!600x600.jpg" imgid="8086" class="img"><div style="float:left;" class="check"><input type="checkbox"></div></div><div class="del-div"><a title="删除" class="delete" href="javascript:void(0);">&nbsp;</a></div><div title="QQ图片20151026083827.jpg" class="title">QQ图片20151026083827.jpg</div></div>'
					+'</div></div>'
					+'<div id="system-glyphicon" style="overflow-y:scroll">'
					+'<div class="ui-tabs-panel ui-widget-content ui-corner-bottom" id= "glyphicon-list" ><p style="display: none" id="code"></p><table class="table table-bordered"><tbody><tr><td><span class="glyphicon glyphicon-asterisk" style="color: rgb(255, 140, 60);"> Asterik</span></td><td><span class="glyphicon glyphicon-plus" style="color: rgb(255, 140, 60);"> Plus</span></td><td><span class="glyphicon glyphicon-euro" style="color: rgb(255, 140, 60);"> Euro</span></td><td><span class="glyphicon glyphicon-envelope" style="color: rgb(255, 140, 60);"> Envelope</span></td><td><span class="glyphicon glyphicon-pencil" style="color: rgb(255, 140, 60);"> Pencil</span></td><td><span class="glyphicon glyphicon-glass" style="color: rgb(255, 140, 60);"> Glass</span></td></tr><tr><td><span class="glyphicon glyphicon-music" style="color: rgb(255, 140, 60);"> Music</span></td><td><span class="glyphicon glyphicon-search" style="color: rgb(255, 140, 60);"> Search</span></td><td><span class="glyphicon glyphicon-heart" style="color: rgb(255, 140, 60);"> Heart</span></td><td><span class="glyphicon glyphicon-star" style="color: rgb(255, 140, 60);"> Star</span></td><td><span class="glyphicon glyphicon-star-empty" style="color: rgb(255, 140, 60);"> Empty</span></td><td><span class="glyphicon glyphicon-user" style="color: rgb(255, 140, 60);"> User</span></td></tr><tr><td><span class="glyphicon glyphicon-film" style="color: rgb(255, 140, 60);"> Film</span></td><td><span class="glyphicon glyphicon-th-large" style="color: rgb(255, 140, 60);"> Th large</span></td><td><span class="glyphicon glyphicon-th" style="color: rgb(255, 140, 60);"> Th</span></td><td><span class="glyphicon glyphicon-th-list" style="color: rgb(255, 140, 60);"> List</span></td><td><span class="glyphicon glyphicon-ok" style="color: rgb(255, 140, 60);"> Okay</span></td><td><span class="glyphicon glyphicon-remove" style="color: rgb(255, 140, 60);"> Remove</span></td></tr><tr><td><span class="glyphicon glyphicon-zoom-in" style="color: rgb(255, 140, 60);"> Zoom in</span></td><td><span class="glyphicon glyphicon-zoom-out" style="color: rgb(255, 140, 60);"> Zoom out</span></td><td><span class="glyphicon glyphicon-off" style="color: rgb(255, 140, 60);"> Off</span></td><td><span class="glyphicon glyphicon-signal" style="color: rgb(255, 140, 60);"> Signal</span></td><td><span class="glyphicon glyphicon-cog" style="color: rgb(255, 140, 60);"> Cog</span></td><td><span class="glyphicon glyphicon-trash" style="color: rgb(255, 140, 60);"> Trash</span></td></tr><tr><td><span class="glyphicon glyphicon-home" style="color: rgb(255, 140, 60);"> Home</span></td><td><span class="glyphicon glyphicon-file" style="color: rgb(255, 140, 60);"> File</span></td><td><span class="glyphicon glyphicon-time" style="color: rgb(255, 140, 60);"> Time</span></td><td><span class="glyphicon glyphicon-road" style="color: rgb(255, 140, 60);"> Road</span></td><td><span class="glyphicon glyphicon-download-alt" style="color: rgb(255, 140, 60);"> Download alt</span></td><td><span class="glyphicon glyphicon-download" style="color: rgb(255, 140, 60);"> Download</span></td></tr><tr><td><span class="glyphicon glyphicon-upload" style="color: rgb(255, 140, 60);"> Upload</span></td><td><span class="glyphicon glyphicon-inbox" style="color: rgb(255, 140, 60);"> Inbox</span></td><td><span class="glyphicon glyphicon-play-circle" style="color: rgb(255, 140, 60);"> Play circle</span></td><td><span class="glyphicon glyphicon-repeat" style="color: rgb(255, 140, 60);"> Repeat</span></td><td><span class="glyphicon glyphicon-refresh" style="color: rgb(255, 140, 60);"> Refresh</span></td><td><span class="glyphicon glyphicon-list-alt" style="color: rgb(255, 140, 60);"> List alt</span></td></tr><tr><td><span class="glyphicon glyphicon-lock" style="color: rgb(255, 140, 60);"> Lock</span></td><td><span class="glyphicon glyphicon-flag" style="color: rgb(255, 140, 60);"> Flag</span></td><td><span class="glyphicon glyphicon-headphones" style="color: rgb(255, 140, 60);"> Headphones</span></td><td><span class="glyphicon glyphicon-volume-off" style="color: rgb(255, 140, 60);"> Volume-off</span></td><td><span class="glyphicon glyphicon-volume-down" style="color: rgb(255, 140, 60);"> Volume-down</span></td><td><span class="glyphicon glyphicon-volume-up" style="color: rgb(255, 140, 60);"> Volume-up</span></td></tr><tr><td><span class="glyphicon glyphicon-qrcode" style="color: rgb(255, 140, 60);"> Qrcode</span></td><td><span class="glyphicon glyphicon-barcode" style="color: rgb(255, 140, 60);"> Barcode</span></td><td><span class="glyphicon glyphicon-tag" style="color: rgb(255, 140, 60);"> Tag</span></td><td><span class="glyphicon glyphicon-tags" style="color: rgb(255, 140, 60);"> Tags</span></td><td><span class="glyphicon glyphicon-book" style="color: rgb(255, 140, 60);"> Book</span></td><td><span class="glyphicon glyphicon-bookmark" style="color: rgb(255, 140, 60);"> Bookmark</span></td></tr><tr><td><span class="glyphicon glyphicon-print" style="color: rgb(255, 140, 60);"> Print</span></td><td><span class="glyphicon glyphicon-camera" style="color: rgb(255, 140, 60);"> Camera</span></td><td><span class="glyphicon glyphicon-font" style="color: rgb(255, 140, 60);"> Font</span></td><td><span class="glyphicon glyphicon-bold" style="color: rgb(255, 140, 60);"> Bold</span></td><td><span class="glyphicon glyphicon-italic" style="color: rgb(255, 140, 60);"> Italic</span></td><td><span class="glyphicon glyphicon-text-height" style="color: rgb(255, 140, 60);"> Text-height</span></td></tr><tr><td><span class="glyphicon glyphicon-text-width" style="color: rgb(255, 140, 60);"> Text-width</span></td><td><span class="glyphicon glyphicon-align-left" style="color: rgb(255, 140, 60);"> Align-left</span></td><td><span class="glyphicon glyphicon-align-center" style="color: rgb(255, 140, 60);"> Align-center</span></td><td><span class="glyphicon glyphicon-align-right" style="color: rgb(255, 140, 60);"> Align-right</span></td><td><span class="glyphicon glyphicon-align-justify" style="color: rgb(255, 140, 60);"> Align-justify</span></td><td><span class="glyphicon glyphicon-list" style="color: rgb(255, 140, 60);"> List</span></td></tr><tr><td><span class="glyphicon glyphicon-indent-left" style="color: rgb(255, 140, 60);"> Indent-left</span></td><td><span class="glyphicon glyphicon-indent-right" style="color: rgb(255, 140, 60);"> Indent-right</span></td><td><span class="glyphicon glyphicon-facetime-video" style="color: rgb(255, 140, 60);"> Facetime-video</span></td><td><span class="glyphicon glyphicon-picture" style="color: rgb(255, 140, 60);"> Picture</span></td><td><span class="glyphicon glyphicon-map-marker" style="color: rgb(255, 140, 60);"> Map-marker</span></td><td><span class="glyphicon glyphicon-adjust" style="color: rgb(255, 140, 60);"> Adjust</span></td></tr><tr><td><span class="glyphicon glyphicon-tint" style="color: rgb(255, 140, 60);"> Tint</span></td><td><span class="glyphicon glyphicon-edit" style="color: rgb(255, 140, 60);"> Edit</span></td><td><span class="glyphicon glyphicon-share" style="color: rgb(255, 140, 60);"> Share</span></td><td><span class="glyphicon glyphicon-check" style="color: rgb(255, 140, 60);"> Check</span></td><td><span class="glyphicon glyphicon-move" style="color: rgb(255, 140, 60);"> Move</span></td><td><span class="glyphicon glyphicon-step-backward" style="color: rgb(255, 140, 60);"> Step-backward</span></td></tr><tr><td><span class="glyphicon glyphicon-fast-backward" style="color: rgb(255, 140, 60);"> Fast-backward</span></td><td><span class="glyphicon glyphicon-backward" style="color: rgb(255, 140, 60);"> Backward</span></td><td><span class="glyphicon glyphicon-play" style="color: rgb(255, 140, 60);"> Play</span></td><td><span class="glyphicon glyphicon-pause" style="color: rgb(255, 140, 60);"> Pause</span></td><td><span class="glyphicon glyphicon-stop" style="color: rgb(255, 140, 60);"> Stop</span></td><td><span class="glyphicon glyphicon-forward" style="color: rgb(255, 140, 60);"> Forward</span></td></tr><tr><td><span class="glyphicon glyphicon-fast-forward" style="color: rgb(255, 140, 60);"> Fast-forward</span></td><td><span class="glyphicon glyphicon-step-forward" style="color: rgb(255, 140, 60);"> Step-forward</span></td><td><span class="glyphicon glyphicon-eject" style="color: rgb(255, 140, 60);"> Eject</span></td><td><span class="glyphicon glyphicon-chevron-left" style="color: rgb(255, 140, 60);"> Chevron-left</span></td><td><span class="glyphicon glyphicon-chevron-right" style="color: rgb(255, 140, 60);"> Chevron-right</span></td><td><span class="glyphicon glyphicon-plus-sign" style="color: rgb(255, 140, 60);"> Plus-sign</span></td></tr><tr><td><span class="glyphicon glyphicon-minus-sign" style="color: rgb(255, 140, 60);"> Minus-sign</span></td><td><span class="glyphicon glyphicon-remove-sign" style="color: rgb(255, 140, 60);"> Remove-sign</span></td><td><span class="glyphicon glyphicon-ok-sign" style="color: rgb(255, 140, 60);"> Ok-sign</span></td><td><span class="glyphicon glyphicon-question-sign" style="color: rgb(255, 140, 60);"> Question-sign</span></td><td><span class="glyphicon glyphicon-info-sign" style="color: rgb(255, 140, 60);"> Info-sign</span></td><td><span class="glyphicon glyphicon-screenshot" style="color: rgb(255, 140, 60);"> Screenshot</span></td></tr><tr><td><span class="glyphicon glyphicon-remove-circle" style="color: rgb(255, 140, 60);"> Remove-circle</span></td><td><span class="glyphicon glyphicon-ok-circle" style="color: rgb(255, 140, 60);"> Ok-circle</span></td><td><span class="glyphicon glyphicon-ban-circle" style="color: rgb(255, 140, 60);"> Ban-circle</span></td><td><span class="glyphicon glyphicon-arrow-left" style="color: rgb(255, 140, 60);"> Arrow-left</span></td><td><span class="glyphicon glyphicon-arrow-right" style="color: rgb(255, 140, 60);"> Arrow-right</span></td><td><span class="glyphicon glyphicon-arrow-up" style="color: rgb(255, 140, 60);"> Arrow-up</span></td></tr><tr><td><span class="glyphicon glyphicon-arrow-down" style="color: rgb(255, 140, 60);"> Arrow-down</span></td><td><span class="glyphicon glyphicon-share-alt" style="color: rgb(255, 140, 60);"> Share-alt</span></td><td><span class="glyphicon glyphicon-exclamation-sign" style="color: rgb(255, 140, 60);"> Exclamation-sign</span></td><td><span class="glyphicon glyphicon-gift" style="color: rgb(255, 140, 60);"> Gift</span></td><td><span class="glyphicon glyphicon-leaf" style="color: rgb(255, 140, 60);"> Leaf</span></td><td><span class="glyphicon glyphicon-fire" style="color: rgb(255, 140, 60);"> Fire</span></td></tr><tr><td><span class="glyphicon glyphicon-eye-open" style="color: rgb(255, 140, 60);"> Eye-open</span></td><td><span class="glyphicon glyphicon-eye-close" style="color: rgb(255, 140, 60);"> Eye-close</span></td><td><span class="glyphicon glyphicon-warning-sign" style="color: rgb(255, 140, 60);"> Warning-sign</span></td><td><span class="glyphicon glyphicon-plane" style="color: rgb(255, 140, 60);"> Plane</span></td><td><span class="glyphicon glyphicon-calendar" style="color: rgb(255, 140, 60);"> Calendar</span></td><td><span class="glyphicon glyphicon-random" style="color: rgb(255, 140, 60);"> Random</span></td></tr><tr><td><span class="glyphicon glyphicon-comment" style="color: rgb(255, 140, 60);"> Comment</span></td><td><span class="glyphicon glyphicon-magnet" style="color: rgb(255, 140, 60);"> Magnet</span></td><td><span class="glyphicon glyphicon-chevron-up" style="color: rgb(255, 140, 60);"> Chevron-up</span></td><td><span class="glyphicon glyphicon-chevron-down" style="color: rgb(255, 140, 60);"> Chevron-down</span></td><td><span class="glyphicon glyphicon-retweet" style="color: rgb(255, 140, 60);"> Retweet</span></td><td><span class="glyphicon glyphicon-shopping-cart" style="color: rgb(255, 140, 60);"> Shopping-cart</span></td></tr><tr><td><span class="glyphicon glyphicon-folder-close" style="color: rgb(255, 140, 60);"> Folder-close</span></td><td><span class="glyphicon glyphicon-folder-open" style="color: rgb(255, 140, 60);"> Folder-open</span></td><td><span class="glyphicon glyphicon-resize-vertical" style="color: rgb(255, 140, 60);"> Resize-vertical</span></td><td><span class="glyphicon glyphicon-resize-horizontal" style="color: rgb(255, 140, 60);"> Resize-horizontal</span></td><td><span class="glyphicon glyphicon-hdd" style="color: rgb(255, 140, 60);"> Hdd</span></td><td><span class="glyphicon glyphicon-bullhorn" style="color: rgb(255, 140, 60);"> Bullhorn</span></td></tr><tr><td><span class="glyphicon glyphicon-bell" style="color: rgb(255, 140, 60);"> Bell</span></td><td><span class="glyphicon glyphicon-certificate" style="color: rgb(255, 140, 60);"> Certificate</span></td><td><span class="glyphicon glyphicon-thumbs-up" style="color: rgb(255, 140, 60);"> Thumbs-up</span></td><td><span class="glyphicon glyphicon-thumbs-down" style="color: rgb(255, 140, 60);"> Thumbs-down</span></td><td><span class="glyphicon glyphicon-hand-right" style="color: rgb(255, 140, 60);"> Hand-right</span></td><td><span class="glyphicon glyphicon-hand-left" style="color: rgb(255, 140, 60);"> Hand-left</span></td></tr><tr><td><span class="glyphicon glyphicon-hand-up" style="color: rgb(255, 140, 60);"> Hand-up</span></td><td><span class="glyphicon glyphicon-hand-down" style="color: rgb(255, 140, 60);"> Hand-down</span></td><td><span class="glyphicon glyphicon-circle-arrow-right" style="color: rgb(255, 140, 60);"> Circle-arrow-right</span></td><td><span class="glyphicon glyphicon-circle-arrow-left" style="color: rgb(255, 140, 60);"> Circle-arrow-left</span></td><td><span class="glyphicon glyphicon-circle-arrow-up" style="color: rgb(255, 140, 60);"> Circle-arrow-up</span></td><td><span class="glyphicon glyphicon-circle-arrow-down" style="color: rgb(255, 140, 60);"> Circle-arrow-down</span></td></tr><tr><td><span class="glyphicon glyphicon-globe" style="color: rgb(255, 140, 60);"> Globe</span></td><td><span class="glyphicon glyphicon-wrench" style="color: rgb(255, 140, 60);"> Wrench</span></td><td><span class="glyphicon glyphicon-tasks" style="color: rgb(255, 140, 60);"> Tasks</span></td><td><span class="glyphicon glyphicon-filter" style="color: rgb(255, 140, 60);"> Filter</span></td><td><span class="glyphicon glyphicon-briefcase" style="color: rgb(255, 140, 60);"> Briefcase</span></td><td><span class="glyphicon glyphicon-fullscreen" style="color: rgb(255, 140, 60);"> glyphicon-fullscreen</span></td></tr><tr><td><span class="glyphicon glyphicon-dashboard" style="color: rgb(255, 140, 60);"> Dashboard</span></td><td><span class="glyphicon glyphicon-paperclip" style="color: rgb(255, 140, 60);"> Paperclip</span></td><td><span class="glyphicon glyphicon-heart-empty" style="color: rgb(255, 140, 60);"> Heart-empty</span></td><td><span class="glyphicon glyphicon-link" style="color: rgb(255, 140, 60);"> Link</span></td><td><span class="glyphicon glyphicon-phone" style="color: rgb(255, 140, 60);"> Phone</span></td><td><span class="glyphicon glyphicon-pushpin" style="color: rgb(255, 140, 60);"> Pushpin</span></td></tr><tr><td><span class="glyphicon glyphicon-usd" style="color: rgb(255, 140, 60);"> Usd</span></td><td><span class="glyphicon glyphicon-gbp" style="color: rgb(255, 140, 60);"> GBP</span></td><td><span class="glyphicon glyphicon-sort" style="color: rgb(255, 140, 60);"> Sort</span></td><td><span class="glyphicon glyphicon-sort-by-alphabet" style="color: rgb(255, 140, 60);"> Sort-by-alphabet</span></td><td><span class="glyphicon glyphicon-sort-by-alphabet-alt" style="color: rgb(255, 140, 60);"> Sort-by-alphabet-alt</span></td><td><span class="glyphicon glyphicon-sort-by-order" style="color: rgb(255, 140, 60);"> Sort-by-order</span></td></tr><tr><td><span class="glyphicon glyphicon-sort-by-order-alt" style="color: rgb(255, 140, 60);"> Sort-by-order-alt</span></td><td><span class="glyphicon glyphicon-sort-by-attributes" style="color: rgb(255, 140, 60);"> Sort-by-attributes</span></td><td><span class="glyphicon glyphicon-sort-by-attributes-alt" style="color: rgb(255, 140, 60);"> Sort-by-attributes-alt</span></td><td><span class="glyphicon glyphicon-unchecked" style="color: rgb(255, 140, 60);"> Unchecked</span></td><td><span class="glyphicon glyphicon-expand" style="color: rgb(255, 140, 60);"> Expand</span></td><td><span class="glyphicon glyphicon-collapse-down" style="color: rgb(255, 140, 60);"> Collapse-down</span></td></tr><tr><td><span class="glyphicon glyphicon-collapse-up" style="color: rgb(255, 140, 60);"> Collapse-up</span></td><td><span class="glyphicon glyphicon-log-in" style="color: rgb(255, 140, 60);"> Log-in</span></td><td><span class="glyphicon glyphicon-flash" style="color: rgb(255, 140, 60);"> Flash</span></td><td><span class="glyphicon glyphicon-log-out" style="color: rgb(255, 140, 60);"> Log-out</span></td><td><span class="glyphicon glyphicon-new-window" style="color: rgb(255, 140, 60);"> New-window</span></td><td><span class="glyphicon glyphicon-record" style="color: rgb(255, 140, 60);"> Record</span></td></tr><tr><td><span class="glyphicon glyphicon-save" style="color: rgb(255, 140, 60);"> Save</span></td><td><span class="glyphicon glyphicon-open" style="color: rgb(255, 140, 60);"> Open</span></td><td><span class="glyphicon glyphicon-saved" style="color: rgb(255, 140, 60);"> Saved</span></td><td><span class="glyphicon glyphicon-import" style="color: rgb(255, 140, 60);"> Import</span></td><td><span class="glyphicon glyphicon-export" style="color: rgb(255, 140, 60);"> Export</span></td><td><span class="glyphicon glyphicon-send" style="color: rgb(255, 140, 60);"> Send</span></td></tr><tr><td><span class="glyphicon glyphicon-floppy-disk" style="color: rgb(255, 140, 60);"> Floppy-disk</span></td><td><span class="glyphicon glyphicon-floppy-saved" style="color: rgb(255, 140, 60);"> Floppy-saved</span></td><td><span class="glyphicon glyphicon-floppy-remove" style="color: rgb(255, 140, 60);"> Floppy-remove</span></td><td><span class="glyphicon glyphicon-floppy-save" style="color: rgb(255, 140, 60);"> Floppy-save</span></td><td><span class="glyphicon glyphicon-floppy-open" style="color: rgb(255, 140, 60);"> Floppy-open</span></td><td><span class="glyphicon glyphicon-credit-card" style="color: rgb(255, 140, 60);"> Credit-card</span></td></tr><tr><td><span class="glyphicon glyphicon-transfer" style="color: rgb(255, 140, 60);"> Transfer</span></td><td><span class="glyphicon glyphicon-cutlery" style="color: rgb(255, 140, 60);"> Cutlery</span></td><td><span class="glyphicon glyphicon-header" style="color: rgb(255, 140, 60);"> Header</span></td><td><span class="glyphicon glyphicon-compressed" style="color: rgb(255, 140, 60);"> Compressed</span></td><td><span class="glyphicon glyphicon-earphone" style="color: rgb(255, 140, 60);"> Earphone</span></td><td><span class="glyphicon glyphicon-phone-alt" style="color: rgb(255, 140, 60);"> Phone-alt</span></td></tr><tr><td><span class="glyphicon glyphicon-tower" style="color: rgb(255, 140, 60);"> Tower</span></td><td><span class="glyphicon glyphicon-stats" style="color: rgb(255, 140, 60);"> Stats</span></td><td><span class="glyphicon glyphicon-sd-video" style="color: rgb(255, 140, 60);"> Sd-video</span></td><td><span class="glyphicon glyphicon-hd-video" style="color: rgb(255, 140, 60);"> Hd-video</span></td><td><span class="glyphicon glyphicon-subtitles" style="color: rgb(255, 140, 60);"> Subtitles</span></td><td><span class="glyphicon glyphicon-sound-stereo" style="color: rgb(255, 140, 60);"> Sound-stereo</span></td></tr><tr><td><span class="glyphicon glyphicon-sound-dolby" style="color: rgb(255, 140, 60);"> Sound-dolby</span></td><td><span class="glyphicon glyphicon-sound-dolby" style="color: rgb(255, 140, 60);"> Sound-dolby</span></td><td><span class="glyphicon glyphicon-sound-5-1" style="color: rgb(255, 140, 60);"> Sound-5-1</span></td><td><span class="glyphicon glyphicon-sound-6-1" style="color: rgb(255, 140, 60);"> Sound-6-1</span></td><td><span class="glyphicon glyphicon-sound-7-1" style="color: rgb(255, 140, 60);"> Sound-7-1</span></td><td><span class="glyphicon glyphicon-copyright-mark" style="color: rgb(255, 140, 60);"> Copyright-mark</span></td></tr><tr><td><span class="glyphicon glyphicon-registration-mark" style="color: rgb(255, 140, 60);"> Registration-mark</span></td><td><span class="glyphicon glyphicon-cloud-download" style="color: rgb(255, 140, 60);"> Cloud-download</span></td><td><span class="glyphicon glyphicon-cloud-upload" style="color: rgb(255, 140, 60);"> Cloud-upload</span></td><td><span class="glyphicon glyphicon-tree-conifer" style="color: rgb(255, 140, 60);"> Tree-conifer</span></td><td><span class="glyphicon glyphicon-tree-deciduous" style="color: rgb(255, 140, 60);"> Tree-deciduous</span></td><td></td></tr></tbody></table></div>'
					+'</div>'
					+'<div class="change-image-bottom" style="width:'+(($(window).width()*0.75)-70)+'px;box-sizing: content-box;">'
						+'<span class="select-image-name"></span>'
						+'<button class="check-div" type="button" style="width:120px; height:32px; background-color: #00acff; color:#fff; border-radius:3px; cursor:pointer; font-size:15px;margin-left:12px;">更换图片</button>'
					+'</div>'
					// +'<div class="button" style="width:100%; height:100%;line-height:40px;overflow: hidden;cursor:pointer;
					// text-align: center;">我的按钮</div>'	+'</div>'
			+'</div>',
		//指定按钮宽度
	   	btnWidthChange: '<div class="ez-setting-content col-md-12 basic-small-title"><span class="ez-text-align btn-width-slider" style="float:left" >宽度</span><div id="btn-width-slider" class="ez-left ez-slider setSlide slide-left" style="margin-left:19px"></div><span class="ez-spinner" ><input type="text" id="btn-width-spinner" class="setSpinner slideValue btn-width-spinner "/></span></div>',
		
		//切换控件输入方式
		formInputType : '<div class="col-md-12 basic-small-title"><label class="col-md-4 basic-left">表单输入方式</label><div class="col-md-8 text-format" ><select id="formInputType" class="form-control input-sm"><option value="default">默认方式</option><option value="slide">滑出式</option></select></div></div>'
	},

	//验证属性库
	Validate : {

		//必填项
		qequired : '<div class="col-md-12"><hr /></div><div class="col-md-6 basic-small-title button-position-top" ><label class="col-md-4 basic-left">必填</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info"   type="checkbox" name="isQequired" /></div></div>',

		//文本格式
		textFormat : '<div class="col-md-12 basic-small-title"><label class="col-md-3 basic-left">文本格式</label><div class="col-md-9 text-format" ><select id="textFormat" class="form-control input-sm"><option value="text">纯文本</option><option value="email">邮箱</option><option value="integer">整数</option><option value="decimal">小数</option><option value="cardid">身份证</option><option value="telephone">电话</option></select></div></div>',

		//最短字符
		minLength : '<div class="col-md-6 basic-small-title" hidden><label>最短字符</label><input id="minLength" type="text" class="form-control input-sm"  maxlength="4"></div>',

		//最长字符
		maxLength : '<div class="col-md-6 basic-small-title" hidden><label>最长字符</label><input id="maxLength" type="text" class="form-control input-sm"  maxlength="4"></div>',

		//唯一性
		uniqueness : '<div  class="col-md-6 basic-small-title button-position-top"><label class="col-md-4 basic-left" >唯一</label><div class="col-md-6 select-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info"  type="checkbox" name="unIqueness"/></div></div>',

		//日期格式
		dateFormat : '<div class="col-md-12 basic-small-title"><label class="col-md-3 basic-left">日期格式</label><div class="col-md-9"><select class="form-control input-sm" id="dateFormat"><option status="6" value="yyyy-MM-dd HH:mm:ss">年-月-日 时:分:秒</option><option status="0" value="yyyy-MM-dd HH:mm">年-月-日 时:分</option><option status="1" value="yyyy-MM-dd HH">年-月-日 时</option><option status="2" value="yyyy-MM-dd">年-月-日</option><option status="3" value="yyyy-MM">年-月</option><option status="4" value="yyyy">年</option><option status="5" value="HH:mm:ss">时:分:秒</option></select></div></div>',
		
		//起始时间
		startTime : '<div class="col-md-12"><hr /></div><div class="col-md-12 basic-small-title item-top"><label class="col-md-3 basic-left control-label">起止日期</label><div class="col-md-9"><div id="startTime" class="input-group date " ><input type="text"  size="12" class="form-control input-sm"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div></div></div>',
		
		//结束时间
		endTime : '<div class="col-md-12 basic-small-title"><label class="col-md-3 basic-left control-label">结束日期</label><div class="col-md-9"><div id="endTime" class="input-group date " ><input type="text"  size="12" class="form-control input-sm"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div></div></div>',
       //选择表单
		selectTable : '<div class="col-md-6 basic-small-title" style="border: 1px solid #ccc;border-right:0;margin-left: 12px;height: 62px"><label class="col-md-6 basic-left" style="margin-left: -15%">选择表单</label><div class="col-md-12 text-format" style="margin-left: -15%"><select id="selectTable" class="form-control input-sm"><option value="text">请选择表单</option></select></div></div>',
		 //选择控件
		selectCtrl : '<div class="col-md-8 basic-small-title" style="border: 1px solid #ccc;border-left: 0;width:45%;margin-left: -10%;height: 62px"><label class="col-md-10 basic-left">选择字段</label><div class="col-md-12 text-format" style="margin-left: -8%"><select id="selectCtrl" class="form-control input-sm"><option value="text">请选择字段</option></select></div></div>',
	},

	//选项属性库
	Item : {
		//选项列表
		items : '<div class="col-md-12 itemControl" ><label class="col-md-12 basic-small-title item-left">选项列表</label><div class="col-md-6 itemDiv" style="padding-left:0;padding-top:5px"><div class="input-group"><span class="input-group-addon">' + ' <input type="checkbox"></span><input type="text" class="form-control input-sm" value="选项1"><div class="deleteItem"></div></div></div><div class="col-md-6 itemDiv" style="padding-left:0;padding-top:5px"><div class="input-group"><span class="input-group-addon">' + ' <input type="checkbox"></span><input type="text" class="form-control input-sm" value="选项2"><div class="deleteItem"></div></div></div></div>',

		addItem : '<div class="col-md-12 " style="padding-top:10px"><button id="addItem" type="button" class="btn btn-default input-sm" style="background:#009DD9;color:white"><span class="glyphicon glyphicon-plus"></span>新增选项</button></div>',

		//选项控制
		checkNum : '<div class="col-md-12" style="padding-top:10px"><label class="col-md-3 basic-small-title item-left">选项控制</label><div class="col-md-9 selectLimit" style="margin-top:10px"><select class="form-control input-sm"><option value="1000">多选</option><option value="1">最多选1项</option><option value="2">最多选2项</option><option value="3">最多选3项</option><option value="4">最多选4项</option></select></div></div>',

		//排列方式
		arrangement : '<div class="col-md-12"><label style="margin-bottom:10px" class="col-md-3 basic-small-title item-left">排列</label><div id="itemRank" style="padding-left:0;" class="col-md-12"><div class="col-md-12"><label val="1" class="col-md-4 rankLabel"><div class="rankDiv"><label class="clumrank1"></label></div></label><label val="2" class="col-md-4 rankLabel"><div class="rankDiv"><label class="clumrank2"></label><label class="clumrank2"></label></div></label><label val="3" class="col-md-4 rankLabel"><div class="rankDiv"><label class="clumrank3"></label><label class="clumrank3"></label><label class="clumrank3"></label></div></label></div></div></div>',

	},

	//数据属性库
	Data : {

		//默认值
		defaultValue : '<div class="col-md-10"><label class="col-md-4 default-design">默认内容</label><div class="col-md-9"><input id="defaultValue" type="text" class="form-control input-sm"></div></div>',

		//填充表格数据
		tableDataBind : '',

		//绑定数据
		dataBind : '<div class="col-md-10"><label class="col-md-4 default-design">绑定数据</label><div class="col-md-9"><input id="dataBind" type="text" class="form-control input-sm"></div></div>',

		//ezApp硬件调用成功后返回值绑定到指定控件
		boundDataToCtrl : '<div class="col-md-8"><label id="boundCtrlListTip">硬件调用后返回值绑定到:</label><select id="boundCtrlList" class="form-control input-sm"><option value="0">-请选择控件-</option></select></div>',
		
		//保存组件模板
		"saveNewTpl":"<div class='ez-context-menu-item saveNewTpl'>保存组件模板</div><div class='subMenuWrap'></div>",
		
		//页面跳转
		"addLink" : "<div class='ez-context-menu-item addLink'>页面跳转</div><div class='subMenuWrap'></div>",
	},

	//app端属性库--暂时没有设置
	setApp : {

	}
};
