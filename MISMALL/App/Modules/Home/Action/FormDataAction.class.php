<?php

/**
 * 公共表单数据控制器，统一操作表单数据
 *
 */

class FormDataAction extends BaseAction {
	private $_site_id;
	private $_project_id;
	/**
	 * 回调方法 初始化
	 */
	protected function _initialize() {
		parent::_initialize();
		$this->_site_id = I('post.siteId', 0,"intval");
		if(!$this->_site_id){
			$this->ajaxError("siteId参数错误");
		}
		$this->_project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');
		if(!$this->_project_id){
			$this->ajaxError("项目不存在！");
		}
	}
	
	/*
	 * 获取外部接口的url并且解析
	 * @param $url 外部的url 调用可以得到固定格式的数据
	 * 
	 * */
	public function  getOpenAPIUrl(){
		$url = $_POST["url"];
		$count = M("openapi")->where("url='$url'")->find();
		if(count($count)>0){
		//	echo 0;
			//exit;
		}
		importORG('Curl');
		$openJSON = Curl::get($url);
		$dataArr = objectToArray(json_decode($openJSON));
		 
		 $name = $dataArr['name'];
			
			$tb_name = "cc_tb".time().random(0,10000);
			//print_r(json_encode_cn($dataArr['jsons']));
			D("Project")->changeDB($this->_project_id);
			$check = D("Project")->checkOpenApiUrl($url);
			
			$sql = "CREATE TABLE IF NOT EXISTS " . $tb_name . " (ID int(12) unsigned NOT NULL AUTO_INCREMENT,";
			$sql .= " hitNum int(12) unsigned NOT NULL DEFAULT 0, enterUser int(12) unsigned NOT NULL DEFAULT 0,";
			$sql .= " enterTime int(8) unsigned NOT NULL DEFAULT 0, shStatus tinyint(4) unsigned NOT NULL DEFAULT 0,";
			$fieldstr =" ";
			foreach ($dataArr["jsons"]["fieldInfo"] as $key => $value) {
					switch($value['fieldType']){
						case "text":
							$type="text";
							break;
						
						default :
							$type  = "varchar(255)";
							break;
					}
				$fieldstr .=" " .$value["fieldName"].",";
				$sql .= " " .$value["fieldName"]." ".$type."  DEFAULT 0,";
			}
			$sql .= " PRIMARY KEY (ID)) ENGINE=InnoDB DEFAULT CHARSET=utf8";
			//print_r($dataArr["jsons"]['fieldInfo']);
			if(1==1 || empty($check)){//不存在就建表  存在就忽略
				D("Project")->changeDB($this->_project_id);
				$re = D("Project")->testApi($dataArr["siteId"],$sql);
				$addOpenApiUrl = D("Project")-> addOpenApiUrl($name,$url,$tb_name,$dataArr["jsons"]['fieldInfo']);
			
				//D("Project")->saveFields($dataArr["jsons"]['fieldInfo']);
			}else{//否则就是新增数据而已
				$tb_name=$check;
			}
			
			//插入数据
			$values = "";
			$i=0;
			$sql="";
			$time = time();
			$uid = $_SESSION["uid"];
			foreach ($dataArr["jsons"]["fieldValue"] as $k => $v) {
				$i++;
				$array_temp =implode(",",$v);
				$values.=",(";
				foreach ($v as $m => $n) {
					$values .= "'".$n."',";
				}
				$values .=" 0,".$time.",".$uid.",0)";
				if($i%4==0){
					$values = substr($values, 1);
					print_r($sql);
					$sql = "INSERT INTO ".$tb_name." (".$fieldstr."hitNum,enterTime,enterUser,shStatus) VALUES ".$values;
					D("Project")->execsql($sql);
					$values="";
				}
				
			}
			if(isset($values)){}
			$values = substr($values, 1);
			$sql = "INSERT INTO ".$tb_name." (".$fieldstr."hitNum,enterTime,enterUser,shStatus) VALUES ".$values;
		//	print_r($sql);
			D("Project")->execsql($sql);
			
			$hitNum=0;
			$enterTime = time();
			$enterUser  = $_SESSION['uid']?$_SESSION:0;
			$shStatus = 0;
		
	}
	 public function alsData(){
		 	/*
			 $url = $_POST["url"];
						 importORG('Curl');
						 $openJSON = Curl::get($url);
						 $dataArr = objectToArray(json_decode($openJSON));
						 */
			 
		 	//$dataArr = I("post.","", null);
		 	
			$dataArr= $_POST;
			print_r($dataArr);
			$url = $_POST['url'];
			$name = $dataArr['name'];
			
			$tb_name = "cc_tb".time().random(0,10000);
			//print_r(json_encode_cn($dataArr['jsons']));
			D("Project")->changeDB($this->_project_id);
			$check = 	D("Project")->checkOpenApiUrl($url);
			
			
			$sql = "CREATE TABLE IF NOT EXISTS " . $tb_name . " (MID int(12) unsigned NOT NULL AUTO_INCREMENT,";
			$sql .= " hitNum int(12) unsigned NOT NULL DEFAULT 0, enterUser int(12) unsigned NOT NULL DEFAULT 0,";
			$sql .= " enterTime int(8) unsigned NOT NULL DEFAULT 0, shStatus tinyint(4) unsigned NOT NULL DEFAULT 0,";
			$fieldstr =" ";
			foreach ($dataArr["jsons"]["fieldInfo"] as $key => $value) {
				
					switch($value['fieldType']){
						case "text":
							$type="text";
							break;
						
						default :
							$type  = "varchar(255)";
							break;
					}
				$fieldstr .=" " .$value["fieldName"].",";
				$sql .= " " .$value["fieldName"]." ".$type."  DEFAULT 0,";
			}
			$sql .= " PRIMARY KEY (MID)) ENGINE=InnoDB DEFAULT CHARSET=utf8";
			print_r($sql);
			//print_r($dataArr["jsons"]['fieldInfo']);
			if(1==1 || empty($check)){//不存在就建表  存在就忽略
				D("Project")->changeDB($this->_project_id);
				$re = D("Project")->testApi($dataArr["siteId"],$sql);
				$addOpenApiUrl = D("Project")-> addOpenApiUrl($name,$url,$tb_name,$dataArr["jsons"]['fieldInfo']);
			
				//D("Project")->saveFields($dataArr["jsons"]['fieldInfo']);
			}else{//否则就是新增数据而已
				$tb_name=$check;
			}
			
			
			//插入数据
			$values = "";
			$i=0;
			$sql="";
			$time = time();
			$uid = $_SESSION["uid"];
			foreach ($dataArr["jsons"]["fieldValue"] as $k => $v) {
				$i++;
				$array_temp =implode(",",$v);
				$values.=",(";
				foreach ($v as $m => $n) {
					$values .= "'".$n."',";
				}
				$values .=" 0,".$time.",".$uid.",0)";
				if($i%4==0){
					$values = substr($values, 1);
					print_r($sql);
					$sql = "INSERT INTO ".$tb_name." (".$fieldstr."hitNum,enterTime,enterUser,shStatus) VALUES ".$values;
					D("Project")->execsql($sql);
					$values="";
				}
				
			}
			if(isset($values)){}
			$values = substr($values, 1);
			$sql = "INSERT INTO ".$tb_name." (".$fieldstr."hitNum,enterTime,enterUser,shStatus) VALUES ".$values;
		//	print_r($sql);
			D("Project")->execsql($sql);
			
			$hitNum=0;
			$enterTime = time();
			$enterUser  = $_SESSION['uid']?$_SESSION:0;
			$shStatus = 0;
			 
				
		 }

	/**
	 * 获取当前系统变量类型
	 */
	public function getSysParamType() {
		
		$result = D('PlatForm')->getSysParamType();
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("类型不存在！");
		}
	}

	/**
	 * 获取系统变量值
	 * @param	string		$sys_param_type 系统变量类型
	 * @return	string
	 */
	public function getSysParamValue() {
		$sys_param_type = I('post.sysParamType', '', 'trim');

		$result = D('PlatForm')->getSysParamValue($sys_param_type);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("变量值为空！");
		}
		
	}

	/**
	 * 获取当前用户的所有项目
	 * @param	int		$user_id 当前用户ID
	 * @return	json
	 */
	public function getAllProjects() {
		$user_id = I('session.uid', 0);
		$site_id = I('session.ez_site_id', 0);

		$result = D('PlatForm')->getAllProjectsInfo($user_id, $site_id);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无项目！");
		}
	}

	/**
	 * 获取默认操作项目
	 * @return	int
	 */
	public function getDefaultProject() {
		$user_id = I('session.uid', 0);
		$project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');
		if($project_id){
			$this->ajaxSuccess($project_id);
		}else{
			$this->ajaxError("暂无项目！");
		}
	}

	/**
	 * 获取项目结构信息
	 * @param	int		$get_form 带出表单结构
	 * @return 	json
	 */
	public function getAProjectStructure() {
		$get_form = I('post.get_form', 0, 'intval');
		$form_type = I('post.form_type', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->getAProjectStructure($get_form, $form_type);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无结构信息！");
		}
	}

	/**
	 * 获取指定项目登记信息
	 * @param	int		$project_id 指定项目ID
	 * @return	json
	 */
	public function getAProjectDetails() {
		$project_id = I('post.proId', 0, 'intval');
		$project = D('PlatForm')->getAProjectDetails($project_id);
		if($project){
			$this->ajaxSuccess($project);
		}else{
			$this->ajaxError("暂无项目！");
		}
	}

	/**
	 * 获取项目表单信息
	 * @param	int		$flow_id 流程ID
	 * @return	json
	 */
	public function getFormLists() {
		$flow_id = I('post.flowId', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$flow = D('Project')->getFormLists($flow_id);
		if($flow){
			$this->ajaxSuccess($flow);
		}else{
			$this->ajaxError("暂无表单！");
		}
	}

	/**
	 * 获取表单信息数据
	 * @param	int		$frm_id 表单ID
	 * @return json
	 */
	public function getFormInfo() {
		$frm_id = I('post.id', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$formInfo = D('Project')->getFormInfo($frm_id);
		if($formInfo){
		$formInfo['formData'] = json_decode($formInfo['formData']);
			$this->ajaxSuccess($formInfo);
		}else{
			$this->ajaxError("暂无表单！");
		}
	}

	/**
	 * 获取单个表单信息数据
	 * @param	int		$form_id 表单ID
	 * @return json
	 */
	public function getAFormFiledsInfo() {
		$frm_id = I('post.formId', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$info = D('Project')->getAFormFiledsInfo($frm_id);
		if($info){
			$this->ajaxSuccess($info);
		}else{
			$this->ajaxError("暂无表单！");
		}
	}

	/*
	 * 通过formid获取表单的整个信息
	 * @param int $form_id 表单ID
	 * @return  json
	 */
	public function getAFormData() {

		$frm_id = I('post.formId', 0, 'intval');
		$limit = I("post.limit", "20", "intval");
		$page = I("post.page", 1, "intval");
		$sort = I("post.sort", "", "trim");
		D("Project")->changeDB($this->_project_id);
		$formJson = D('Project')->getFormInfo($frm_id);
		$table = $formJson["tableName"];
		
		$fieldJson = D('Project')->getAFormFiledsInfo($frm_id);

		$fields = "ID";
		foreach ($fieldJson as $key => $value) {
			$fields = $fields . ", " . $value['fieldName'];
		}

		$result = D('Project')->getDataByTable($table, $fields, $limit, $page, $sort);
		if($result){
			//特殊插件没有用通用的返回格式
			echo json_encode($result);
		}else{
			$this->ajaxError("暂无表单信息！");
		}
	}

	/**
	 * 获取表单设置数据信息
	 * @param	int		$frm_id 表单ID
	 * @return string	返回表单的详细设置数据
	 */
	public function getFormJsonData() {
		$frm_id = I('post.id', 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$frm_info = D('Project')->getFormInfo($frm_id);
		
		$form_data = $frm_info['formData'];
		unset($frm_info);
		if($form_data){
			$this->ajaxSuccess($form_data,"表单json","");
		}else{
			$this->ajaxError("暂无表单数据！");
		}
	}

	/**
	 * 删除一个表单
	 * @param	int		$id 表单ID
	 * @return	boolean
	 */
	public function delAForm() {
		$form_id = I('post.form_id', 0, 'intval');
		$page_id = I('post.pageId', "", "trim");
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->delAForm($form_id, $page_id);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("删除表单失败");
		}
	}

	/*
	 * 删除一条或者多条记录
	 * @param	int		formId 表单ID
	 * @param	int		records 表单记录ID
	 * */
	public function delFormRecord() {
		$from_id = I("post.formId", "", "intval");
		$records = I("post.records", "", "trim");
		D("Project")->changeDB($this->_project_id);
		$result = D("Project")->delFormRecord($from_id, $records);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("删除表单记录失败！");
		}
	}

	/**
	 * 获取当前流程下可用数据源
	 * @param	int		$flow_id 流程ID
	 * @return	json
	 */
	public function getAllFlowQuerier() {
		$flow_id = I('post.flowId', 1, 'intval');
		
		D("Query")->changeDB($this->_project_id);
		$querylist = D('Query')->getAFlowQuerierList($flow_id);
		$this->ajaxSuccess($querylist);

	}

	/**
	 * 获取指定的动作设置
	 * @param	int		$action_id 动作ID
	 * @return	string
	 */
	public function getFormActionData() {
		$action_id = I('post.action_id', 0, 'intval');
		
		D("Project")->changeDB($this->_project_id);
		$action_info = D('Project')->getFormActionData($action_id);
		$this->ajaxSuccess($action_info['actionData']);
	}

	/**
	 * 读取表单设计器的数据
	 * @param	string		$querier_id 查询ID
	 * @return	json 		返回查询的详细json信息
	 */
	public function getAQuerierData() {
		$querier_id = I('post.dsId', '', 'trim');
		$type =I("post.type","","trim");
		
		D("Query")->changeDB($this->_project_id);
		$result = D('Query')->getAQuerierData($querier_id,$type);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无数据！");
		}
	}

	/**
	 * 执行sql语句，带出数据集
	 * @param	string	$sql 待执行的sql语句
	 * @return	json 	返回语句执行的查询数据集
	 */
	public function execAQueryPlan() {
		$sql = base64_decode(I('post.sql', '', 'trim'));
		$linkParas = I('post.linkParas', '', 'trim');
		$compIds = I('post.praiseComp', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		if($compIds){
			$result = D('Query')->getAQueryDataWithZan($compIds, $sql, $linkParas);
		}else {
			$result = D('Query')->execAQueryPlan($sql, $linkParas);
		}
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无数据集！");
		}
	}
    
	

	/**
	 * 执行sql语句，带出数据集
	 * @param	string	$sql 待执行的sql语句
	 * @return	json 	返回语句执行的查询数据集
	 */
	public function execAQueryPlanBycc() {
		$queryConfig = base64_decode(I('post.sqlJson', '', 'trim'));
		$linkParas = I('post.linkParas', '', 'trim');
		$compIds = I('post.praiseComp', '', 'trim');
		
		$query = D('Query');
		$query -> changeDB($this -> _project_id);
		$result = $query -> queryDataForCompLogic($queryConfig);

		if($result){
			$this -> ajaxSuccess($result, '查询成功');
		}else{
			$this -> ajaxError("暂无数据集！");
		}
	}

	/**
	 * 获取表单存储数据
	 * @param	int		$form_id 表单ID
	 * @param	int		$page 当前页面，默认第一页
	 * @param	int		$records 单页显示条数，默认50
	 * @param	string	$fields 查询字段 多字段用,分隔
	 * @return json
	 */
	public function getFormDataInfo() {
		$form_id = I('post.id', 0, 'intval');
		$page = I('post.page', 1, 'intval');
		$records = I('post.records', 50, 'intval');
		$fields = I('post.fields', '', 'trim');
		$where = I('post.where', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->getFormDataInfo($form_id, $page, $records, $fields, $where);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无数据！");
		}
	}

	/**
	 * 获取单个表单的关联表单
	 * @param	int		$form_id 表单ID
	 * @return	json
	 */
	public function getAFormConnectedForms() {
		$form_id = I('post.id', 0, 'intval');
		$keywords = I('post.keyword', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->getAFormConnectedForms($form_id);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无关联表单！");
		}
	}

	/**
	 * 检查保存表单数据记录的唯一性
	 * @param	string	$field_name  表单控件字段名称
	 * @param	string	$field_value 表单控件字段值
	 * @param	int		$form_id	 表单ID
	 * @return	boolean
	 */
	public function chkFormDataRecord() {
		$field_name = I('post.cid', '', 'trim');
		$field_value = I('post.value', '', 'trim');
		$form_id = I('post.form_id', 0, 'intval');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->chkFormDataRecord($form_id, 0, $field_name, $field_value);
		$this->ajaxSuccess($result);
	}

	/**
	 *
	 * 保存控件的数据操作动作
	 * @param	int			$action_id 当前表单ID
	 * @param	string		$json_data 数据操作的json设置数据
	 * @return	int/boolen	添加成功返回数据ID，修改返回记录修改成功与否标识
	 */
	public function saveFormActionData() {
		$action_id = I('post.action_id', 0, 'intval');
		$json_data = I('post.json_data', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->saveFormActionData($action_id, $json_data);
		$this->ajaxSuccess($result);
	}

	/**
	 * 保存表单基本信息
	 * @param	array 	$post 接收ajax对象
	 * @return	boolean
	 */
	public function saveFormInfo() {
		$flow_id = I('post.flow_id', 0, 'intval');
		$form_id = I('post.form_id', 0, 'intval');  //0-新增  非0-修改
		$form_title = I('post.form_title', '', 'trim');
		$json_data = I('post.json_data', '', 'trim');
		//$tableRelation = I('post.tableRelation', '', 'trim');

		//如果session失效则重建
		$site_id = I('post.siteId', 0, 'intval');
		if (!I('session.pid', 0) && $site_id) {
			$project_id = D('UserSite')->getSiteInfo($site_id, 'userProjectId');
			session('pid', $project_id);
		}
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->saveFormInfo($flow_id, $form_id, $form_title, $json_data);
		
		if(!empty($json_data)){
			//{"11-10":"11:TEXTBOX3-10:TEXTBOX1","11-9":"11:TEXTBOX4-9:TEXTBOX1"}
		   //保存表与表之间的关系 前端单事件执行多个操作,可以考虑事务
		   D('Project') -> saveMultiTableRelation($form_id, $json_data);
		}
		
		$this->ajaxSuccess($result);
	}

	/**
	 * 修改表单名称
	 * @param	int		$form_id 表单ID
	 * @return	boolean
	 */
	public function updateFormName() {
		$form_id = I('post.form_id', 0, 'intval');
		$form_title = I('post.form_title', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->updateFormName($form_id, $form_title);
		$this->ajaxSuccess($result);
	}

	/**
	 * 保存表单数据信息
	 * @param	json	$post_data 接收表单数据信息
	 * @return	boolean
	 */
	public function saveFormDataInfo() {
		$post_data = json_decode(I('post.data_str', '', 'trim'));

		$form_id = (int) $post_data->form_id ? (int) $post_data->form_id : 0;
		$data_id = (int) $post_data->data_id ? (int) $post_data->data_id : 0;
		$form_data = $post_data->form_data;
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->saveFormDataInfo($form_id, $data_id, $form_data);
		$this->ajaxSuccess($result);
	}

	/**
	 * 对比数据源
	 * @param		int		$datasetid1 外层数据源id
	 * @param		int		$datasetid2 内层数据源id
	 * @return 		string
	 */
	public function getTwoDataSetConn() {
		$datasetid1 = I('post.datasetid1', 0, 'intval');
		$datasetid2 = I('post.datasetid2', 0, 'intval');
		
		D("Query")->changeDB($this->_project_id);
		$result = D('Query')->getTwoDataSetConn($datasetid1, $datasetid2);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("对比失败");
		}
	}

	/**
	 * 保存上传文件，返回文件存储地址
	 * @param	obj			上传文件对象
	 * @return	json
	 */
	public function uploadifyFile() {
		if (empty($_FILES)) {
			$this->ajaxError('上传为空！');
		}

		$upload = $this->_upload(C('EZFORM_UPLOAD'));
		// 设置附件上传目录

		if ($upload['error']) {
			// 上传错误提示错误信息
			$this->ajaxError($upload['info']);
		} else {
			// 上传成功 获取上传文件信息
			$file_info = $upload['info'][0];

			$data['filename'] = $file_info['name'];
			$data['filepath'] = trim($file_info['url'], '.');
			unset($file_info);

			$this->ajaxSuccess($data);
		}
	}

	/**
	 * 更新点赞类组件记录
	 * @param	int			$record_id  主表记录的ＩＤ
	 * @param	string		$comp_id
	 * @return	boolean
	 */
	public function updZanRecord() {
		$record_id = I('post.rowID', 0, 'intval');
		$comp_id = I('post.compID', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->updZanRecord($record_id, $comp_id);
		$this->ajaxSuccess($result);
	}

	/**
	 * 建立聊天组件数据表
	 * @return	boolean
	 */
	public function createChatTable() {
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->createChatTable();
		$this->ajaxSuccess($result);
	}

	/**
	 * 保存聊天内容
	 * @param	string 		$user_id 用户
	 * @param	string		$message_content 聊天内容
	 * @return	boolean
	 */
	public function saveChatMessage() {
		$message_content = I('post.message_content', '', 'trim');
		$user_id = I('post.openId', '', 'trim');
		//$user_id = 'osGGTt2vUYLWX7361RReu4Xj4Ucg';
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->saveChatMessage($user_id, $message_content);
		$this->ajaxSuccess($result);
	}
	/*
	 * 从模板导入到微信编辑器中
	 */
	public function getWxTplData() {
		$name = I("post.name", '', 'trim');
		$url = "wxsite/Template/Tpl/" . $name;

		$mb_info = M("wx_muban")->where("name='$name'")->field("title, jsonData")->find();
		D("Project")->changeDB($this->_project_id);
		$frm_id = D('Project')->saveFormInfo(1, 0, $mb_info['title'], '');
		if ($frm_id) {
			//$form_info = D('Project') -> getFormInfo($mb_info['jsonData']);
			D('Project')->saveFormInfo(1, $frm_id, $mb_info['title'], '{"' . $frm_id . '":' . $mb_info['jsonData'] . '}');
			unset($form_info);
		}
		$result['jsonData'] = $mb_info["jsonData"];
		unset($mb_info);

		$result['formID'] = $frm_id;
		$result['pageContent'] = file_get_contents($url); //获取文件内容
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("无模板信息！");
		}

	}

	/**
	 * 获取新的记录
	 * @param	int		$dataset_id 数据源ID
	 * @param	int		$max_id 现有聊天的最大ID
	 * @return	array
	 */
	public function getNewMessage() {
		$dataset_id = I('post.dataset_id', 0, 'intval');
		$max_id = I('post.max_id', 0, 'intval');
		$we_id = I('post.we_id', 0, 'intval');
		$formCtrlJson = I('post.formCtrlJson', '', 'trim');
		$linkParas = I('post.linkParas', '', 'trim');
	
		D("Project")->changeDB($this->_project_id);
		if ($dataset_id) {
			$result = D('Project')->getNewRecord($dataset_id, $max_id, $linkParas, $formCtrlJson);
		} else {
			$result = D('Project')->getNewChatMessage($max_id, $we_id);
		}

		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无记录！");
		}
	}

	/**
	 * 存储内页链接信息
	 * @param	string		$fromPageID
	 * @param	string		$toPageID
	 * @param	json		$linkData
	 * @return	boolean
	 */
	public function savePageLinkData() {
		$fromPageID = I('post.fromPageID', '', 'trim');
		$toPageID = I('post.toPageID', '', 'trim');
		$actionID = I('post.actionID', '', 'trim');
		$linkData = I('post.linkData', '', 'trim');
		$ctrlID = I("post.ctrlID", "", 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->savePageLinkData($fromPageID, $toPageID, $actionID, $linkData, $ctrlID);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("链接保存失败！");
		}
	}

	/**
	 * 获取内页链接信息
	 * @param	string		$toPageID
	 * @param	string		$actionID
	 * @return	json
	 */
	public function getPageLinkData() {
		$fromPageID = I('post.fromPageID', '', 'trim');
		$toPageID = I('post.toPageID', '', 'trim');
		$actionID = I('post.actionID', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->getPageLinkData($fromPageID, $toPageID, $actionID);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无内页链接信息！");
		}
	}

	/**
	 * 编辑内页链接数据
	 * @param	string		$actionID
	 * @param	string		$toPageID
	 * @param	string		$fromPageID
	 * @param	json		$linkData
	 * @return	boolean
	 */
	public function updPageLinkData() {
		$fromPageID = I('post.fromPageID', '', 'trim');
		$toPageID = I('post.toPageID', '', 'trim');
		$actionID = I('post.actionID', '', 'trim');
		$linkData = I('post.linkData', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->updPageLinkData($fromPageID, $toPageID, $actionID, $linkData);
		$this->ajaxSuccess($result);
	}

	/**
	 * 删除内页链接数据
	 * @param	string		$fromPageID
	 * @param	string		$toPageID
	 * @param	string		$actionID
	 * @return	boolean
	 */
	public function delPageLinkData() {
		$fromPageID = I('post.fromPageID', '', 'trim');
		$toPageID = I('post.toPageID', '', 'trim');
		$actionID = I('post.actionID', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = D('Project')->delPageLinkData($fromPageID, $toPageID, $actionID);
		$this->ajaxSuccess($result);
	}

	/**
	 * 获取用户微信上传图片
	 * @param	int		$site_id
	 * @return	json
	 */
	public function getWechatUserImageList() {
		$form_id = I('post.form_id', 0, 'intval');
		
		D("Project")->changeDB($this->_project_id);
		$form_info = D("Project")->getFormInfo($form_id);
		$form_data = json_decode($form_info['formData']);
		unset($form_info);

		$site_info = D('UserSite')->getSiteInfo($this->_site_id);
		$img_list = M('WechatMessageImage')->where("WeId=" . $site_info['wechatId'] . " and FromUserName='" . session('wechat_openid') . "'")
		                                   ->order('id DESC')->field('PicUrl')->select();
		$project_id = $site_info['userProjectId'];
		unset($site_info);

		$pro_info = D('PlatForm')->getAProjectDetails($project_id);
		foreach ($form_data->controlLists as $key => $value) {
			if ($value->ctrlType === 'CCImage') {
				$isFormData = (string) $isFormData = $value->attrs->general->isFormData;
				if ($isFormData && $isFormData != 'false') {
					$isFormDataArr = explode(".", $isFormData);
					$form_info = D("Project")->getFormInfo($isFormDataArr[0]);
					$mObj = M()->db('p' . $project_id, D('PlatForm')->projectDbLink($project_id));
					$img_list = $mObj->table($form_info['tableName'])->field($isFormDataArr[1] . " AS PicUrl")->order('ID DESC')->select();
					unset($mObj);
				}
			}
		}
		unset($value, $form_data);

		$image_list = array();
		foreach ($img_list as $value) {
			array_push($image_list, urlencode($value['PicUrl']));
		}
		unset($value, $img_list, $pro_info);
		if($image_list){
			$this->ajaxSuccess($image_list);
		}else{
			$this->ajaxError("暂无图片！");
		}
	}

	/**
	 * 获取数据
	 * @param	int		$datasetId
	 * @param	string	$fieldName
	 * @return	string
	 */
	public function getAQueryFieldValue() {
		$dataset_id = I('post.datasetId', 0, 'intval');
		$field_name = I('post.fieldName', '', 'trim');
		$linkParas = I('post.linkParas', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		$result = D('Query')->getAQueryFieldValue($dataset_id, $field_name, $linkParas);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无数据！");
		}
	}

	/*
	 * 获取wx模板的数据
	 * @return json 个人模板和系统模板
	 */
	public function getWxTpl() {
		D("Query")->changeDB($this->_project_id);
		$result = D("Query")->getWxTpl();
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无wx模板数据！");
		}
	}

	/**
	 * 发送消息到微信
	 * @param	int			$siteId
	 * @param	int			$userId
	 * @param	string		$content
	 * @return
	 */
	public function sentMessageToWechat() {
		$user_id = I('post.userId', 0, 'intval');
		$send_content = I('post.content', '', 'trim');

		$weId = D('UserSite')->getSiteInfo($this->_site_id, 'wechatId');
		$wechat_info = D('Apps/Wechat')->getInfoById($weId);

		$FromUserName = M('Users')->where("ID=" . $user_id)->getField('openid');

		//发送消息
		importORG('Wechat.WechatBase');
		importORG('Wechat.Message');
		$message = new Message($wechat_info['app_id'], $wechat_info['app_secret']);
		$result = $message->sendMessage($send_content, $FromUserName, 'text');
		if ($result === FALSE) {
			$this->ajaxError($message->getErrorInfo());
		}
		unset($wechat_info);
		$this->ajaxSuccess('','发送成功和！');
	}

	/**
	 * 获取相似数据源
	 *
	 * @author jerlisen
	 * @return JSON
	 *
	 */
	public function getSameDataSourceList() {
		$querier_id = I('param.queryId', 0, 'intval');
		$data = I('param.field', '', 'trim');

		$return = array(
			'status' => 0,
			'info' => '',
		);

		if (empty($data) || $querier_id == 0) {
			$this->ajaxError('参数错误');
			
		}

		$data = objectToArray(json_decode($data));

		 D("Query")->changeDB($this->_project_id);
		$querier = D('Query')->getAQuerierData($querier_id);
		if (!$querier) {
			$this->ajaxError('数据源不存在');
		}

		$queryList = D('Query')->getAFlowQuerierList($querier['flowID'], true);
		if (!$queryList) {
			$this->ajaxError('数据源不存在');
		}

		$same_arr = array();

		//循环所有数据源
		foreach ($queryList as $q) {
			if (!$q['querierData']) {
				continue;
			}
			$is = 0;
			//循环查询数据
			foreach ($data as $qd) {
				//循环数据源中的所有字段
				$query_data = objectToArray(json_decode($q['querierData']));
				foreach ($query_data['selectFields'] as $qs) {
					//比较字段ID和表名都相同时为存在
					if ($qs['fieldId'] == $qd['fieldId'] && $qs['tableName'] == $qd['tableName']) {
						$is = 1;
						break;
					} else {
						$is = 0;
					}
				}
				if ($is == 0) {
					break;
				}
			}
			if ($is == 1) {
				$same_arr[] = array(
					'ID' => $q['ID'],
					'querierName' => $q['querierName'],
				);
			}

		}

		if (empty($same_arr)) {
			$this->ajaxSuccess('','没有相似的数据源');
		} else {
			$this->ajaxSuccess($same_arr);
		}
	}
	
	/*
	 * 根据记录Id获取表单数据
	 * @param  ROWid 
	 * @param formiD  
	 * @param siteId 
	 * */
	public function  getFormDataByRowId(){
		$rowId = I("post.rowId", "", "intval");
		$formId = I("post.formId","","intval");
		D("Project")->changeDB($this->_project_id);
		$result = D("Project")->getFormDataByRowId($rowId,$formId);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("暂无数据！");
		}
	}
	
	/*
	 * 获取新增页面和翻页浏览页面模板
	 * @param int type=1时加载翻页浏览的模板8个  type=2 时加载新增页面的模板3个
	 */
	 public function getLayoutTplList(){
	 	$type = I("post.type","","intval");
	 	$where =array('type'=>$type);
	 	$db=M("layout_templete");
	 	$re = $db->field("id,title,imgurl")->where($where)->select();
	 	unset($db);
		echo json_encode_cn($re);
	 }
	 
	 /**
	  * 更新表单的名字  
	  * @param string tableTitle 表单名字   
	  * @param int   ID  表单ID
	  * 
	  */
	  public function updateTableName(){
	  	$data = $_POST;
		
		D("Project")->changeDB($this->_project_id);
		$result = D("Project")->updateTableName($data);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("修改名字失败！");
		}
	  }
	  
	  /*
	   * 记录组件
	   * @param $title
	   * @param name 
	   * 
	   * */
	  public function addCompRecord(){
		  	$data = $_POST;
			D("Project")->changeDB($this->_project_id);
			$result = D("Project")->addCompRecord($data);
			if($result){
				$this->ajaxSuccess($result);
			}else{
				$this->ajaxError("失败");
			}
	  }
		
		 /*
	   * 记录组件
	   * @param $title
	   * @param name 
	   * 
	   * */
	  public function getCompRecord(){
	  	$data = $_POST;
		
		D("Project")->changeDB($this->_project_id);
		$result = D("Project")->getCompRecord($data);
		if($result){
			$this->ajaxSuccess($result);
		}else{
			$this->ajaxError("失败");
		}
	  }
	  
	  
	/**
	 * 获取含有输入字段的表单列表
	 */
	 public function getHasInputformList(){
	 	$siteId = I("post.siteId", 0, 'intval');
		D("Project")->changeDB($this->_project_id);
		$list = D("Project")->getHasInputformList();
	 }
	 
}