<?php

/**
 * 查询分析器模块控制器
 * 接收查询分析器中操作方法数据
 */
class QueryAction extends BaseAction {
	private $_site_id;
	private $_project_id;
	private $_model;
	/**
	 * 构造方法
	 */
	// public function __construct() {
		// parent :: __construct();
		// $this -> _initialize();
	// }
// 	
	/**
	 * 回调方法 初始化
	 
    protected function _initialize() {
    
    	if (!session('uid'))
			$this -> redirect("/Index/index");
		if(session("siteId")){
    		$this->siteId = session('siteId');
			$siteId  = session('siteId');
			$pid = M("user_site")->where("id='$siteId'")->find();
			session("pid",$pid[0]['userProjectId']);
			
    	}
    }*/
	

	/**
	 * 回调方法 初始化
	 */
	protected function _initialize() {
		parent::_initialize();
		$this->_site_id = I('siteId', 0,"intval");
		if(!$this->_site_id){
			$this->ajaxError("siteId参数错误");
		}
		$this->_project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');
		if(!$this->_project_id){
			$this->ajaxError("项目不存在！");
		}
		$this->_model = D('query');
	}
	
	/**
	 * 首页
	 */
	public function dataFilter() {
		$flow_id = I('get.flowid', 0, 'intval');
		$this->assign("siteId",I('get.siteId'));
		$this -> flowID = $flow_id;
		$this -> display();
	}
	
	/**
	 *  新查询设置首页
	 */
	public function dataFilterNew() {
		$flow_id = I('get.flowid', 0, 'intval');
		$this->assign("siteId",I('get.siteId'));
		$this -> flowID = $flow_id;
		$this -> display();
	}
	
	/**
	 * 提供当前流程下所有的表单及表单表格数据表名称信息
	 * @param		string		$flow_id 当前流程ID
	 * @return		json		返回查询到的数据表信息
	 */
	public function getFlowDataTable() {
		$flow_id = I('post.flowId', 0, 'intval');
		
		D("Query")->changeDB($this->_project_id);
		echo $this->ajaxSuccess(D('Query') -> getAllFlowDataTable($flow_id));
	}

	/**
	 * 提供选中数据表的存储数据信息
	 * @param	string	$table_name 选中表单或是表单表格名称
	 * @param	string	$condition_str 查询过滤条件
	 * @return	json	返回表单或是表格的存储数据信息
	 */
	public function getDataTableDataInfo() {
		$table_name = I('post.table_name', '', 'trim');
		$condition_str = I('post.condition_str', '', 'trim');
		$tname = I('post.tname', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getDataTableDataInfo($table_name, $condition_str, $tname));
	}

	/**
	 * 保存表单设计器的查询设置
	 * @param	int			$querier_id 当前查询ID
	 * @param	int			$flow_id 当前流程ID
	 * @param	string		$xml_str 查询设置xml数据
	 * @param	string		$querier_name 当前查询名称
	 * @param	string		$tables_name 当前查询数据表名称
	 * @return	int			
	 */
	public function saveAQuerierData() {
		$querier_id = I('post.dataSetId', 0, 'intval');
		$flow_id = I('post.flowId', 0, 'intval');
		$json_data = I('post.json', '', 'trim');
		$querier_name = I('post.dataSetName', '', 'trim');
		$dataset_tables = I('post.dataSetTables', '', 'trim');

		$json_obj = (array)json_decode($json_data);
		$json_obj['sql'] = base64_decode($json_obj['sql']);
		$json_data = json_encode($json_obj);
		
		$dataset_tables_array = (array)json_decode($dataset_tables);
		$query_tables = implode(',', $dataset_tables_array);
		
		D("Query")->changeDB($this->_project_id);
		echo $this->ajaxSuccess(D('Query') -> saveAQuerierData($querier_id, $flow_id, $json_data, $querier_name, $query_tables),"success","JSON");
	}
	
	/**
	 * 更新数据源名称
	 * @param	int			$querier_id 当前查询ID
	 * @param	string		$querier_name 当前查询名称
	 * @return	boolean
	 */
	public function updAQuerierName() {
		$querier_id = I('post.dataSetId', 0, 'intval');
		$querier_name = I('post.dataSetName', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo $this->ajaxSuccess(D('Query') -> updAQuerierName($querier_id, $querier_name),"success","JSON");
	}

	/**
	 * 获取表单设计器的数据
	 * @param	string		$querier_id 查询ID
	 * @return	json 		返回查询的详细json信息
	 */
	public function getExistQuery() {
		$querier_id = I('post.querier_id', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo $this->ajaxSuccess( D('Query') -> getExistQuery($querier_id));
	}

	/**
	 * 获取表单设计器xml的数据
	 * @param	string		xml_str xml信息
	 * @return	json 		返回查询的详细json信息
	 */
	public function getTableTitleExist() {
		$xml_str = I('post.xml_str', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getTableTitleExist($xml_str));
	}

	/**
	 * 获取表单设计器xml的数据
	 * @param	string		xml_str xml信息
	 * @return	json 		返回查询的详细json信息
	 */
	public function getExsitConditions() {
		$xml_str = I('post.xml_str', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getExsitConditions($xml_str));
	}

	/**
	 * 获取数据源的保存名字
	 * @param	string		$querier_id 查询ID
	 * @return	json 		返回查询的详细json信息
	 */
	public function getQueryTableName() {
		$querier_id = I('post.querier_id', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getQueryTableName($querier_id));
	}

	/*
	 * 获取系统变量的表单控件
	 * @param sting   $tid  表单ID
	 * @return json    返回查询的详细json信息
	 * */
	public function getSysFields() {
		$tid = I('post.tid', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getSysFields($tid));
	}

	/*
	 * 通过传过来的xml的frmID查询tableId
	 * @param sting   $frmID  表单ID
	 * @return json    返回查询的详细json信息tableID
	 * */
	public function getTname() {
		$frmID = I('post.frmID', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo D('Query') -> getTname($frmID);
	}
	/*
	 * 通过传过来的xml的frmID查询tableId
	 * @param sting   $frmID  表单ID
	 * @return json    返回查询的详细json信息tableID
	 * */
	public function getTableName() {
		$frmID = I('post.fromID', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo D('Query') -> getTableName($frmID);
	}

	/**
	 * 通过传过来的queryID查询xml
	 * @param 	sting   ID  queryID
	 * @return string    返回查询的详细json信息xmlData
	 * */
	public function getExistXmlInfo() {
		$queryID = I('post.queryID', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo D('Query') -> getExistXmlInfo($queryID);
	}

	/**
	 * 执行查询控件的查询语句
	 * @param	string		$query_sql 执行的sql语句
	 * @param	string		$query_cond 筛选条件
	 * @return	json		执行查询得到的结果集json数据
	 */
	public function querySql() {
		$query_sql = I('post.sql', '', 'trim');
		$query_cond = I('post.cond', '', 'trim');
		$query_cond = json_decode($query_cond);
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Form') -> querySql($query_sql, $query_cond));
	}

	/**
	 * 获取查询表单的xml设置数据
	 * @param	int		$form_id 查询表单的ID
	 * @return	string	返回查询表单的xml数据
	 */
	public function getFormXml() {
		$id = I('post.id', 0, 'intval');
		$frm_info = D('Form') -> getFormInfo($id);
		
		
		echo json_encode( json_decode($frm_info['xmlData']));
	}

	/**
	 * 获取系统变量的信息
	 * @param null
	 * @return json    返回查询的详细json信息系统变量信息
	 * */
	public function getSysParams() {
		//echo $_SESSION['uname'];
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getSysParams());
	}

	/**
	 * 获取当前操作的表单存储数据的数据表名
	 * @param editFname  当前编辑的表单名
	 * @return   str 返回 表单存储数据的数据表名
	 * */
	public function getEditTname() {
		$editFname = I('post.editFname', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo D('Query') -> getEditTname($editFname);
	}

	/**
	 * 获取当前操作的流程的数据表用于多表查询
	 * @param 	flowId  当前编辑的表单所属流程
	 * @return  array 返回 表单存储数据的数据查询方案
	 * */
	public function getTables() {
		$flowId = I('post.flowId', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo D('Query') -> getTables($flowId);
	}

	// 测试
	public function test() {
		$flow_id = I('get.flow_id', '', 'trim');
		$field_words = I('get.field_words', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn(D('Query') -> getQueryPlanLists($flow_id, $field_words));
	}

	/**
	 * 获取输入的字段的模糊匹配信息
	 * @param	string	$keyword 输入的字段信息
	 * @param	int		$flowid 流程ID
	 * @param	json	$json_data 已选字段表
	 * @return	json
	 */
	public function filterQueryFieldInfo() {
		
		$flowid = I('post.flowid', 0, 'intval');
		$json_data = I('post.tableFieldJson', '', 'trim');
		$keyword = I('post.keyword', '', 'trim');
		
		D("Project")->changeDB($this->_project_id);
		$result = json_encode_cn( D('Project') -> filterQueryFieldInfoByKeyword($flowid, $json_data, $keyword));
		if($result){
			$this->ajaxSuccess($result);
		}
	}

	/**
	 * 获取多表查询的方案列表信息
	 * @param	string	$flow_id 当前流程ID
	 * @param	string	$field_words 查询字段
	 * @return	json	返回可能的方案列表信息
	 */
	public function getQueryPlanLists() {
		$flow_id = I('post.flow_id', '', 'trim');
		$field_words = I('post.field_words', '', 'trim');
		
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> getQueryPlanLists($flow_id, $field_words));
	}
	
	/**
	 * 删除指定的数据源
	 * @param	int		$querier_id 数据源ID
	 * @return	boolean
	 */
	public function delAQuerier() {
		$querier_id = I('post.dataSetId', 0, 'intval');
		
		D("Query")->changeDB($this->_project_id);
		echo $this->ajaxSuccess(D('Query') -> delAQuerier($querier_id),"success","JSON");
	}

	/**
	 * 执行sql语句，带出数据集
	 * @param	string	$sql 待执行的sql语句
	 * @return	json 	返回语句执行的查询数据集
	 */
	public function execAQueryPlan() {
		$sql = I('sql', '', 'trim');
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query') -> execAQueryPlan($sql));
	}

	/**
	 * 根据数据表的集合，带出全部字段信息
	 * @param	string	$tables 表单名的集合
	 * @return	json 	返回语句执行的查询数据集
	 */
	public function getConditionFields() {
		$tables = I('post.tables', '', 'trim');
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query')->getConditionFields($tables));
	}
	

	public function externalInterface(){
		$siteId = I("siteId","","intval");
		$this->assign("siteId",$siteId);
		$this->display();
	}

	/**
	 * 
	 * 
	 */
	public function getFormBykb(){
		$querierId = I("post.queryId");
		$rowId = I("post.rowId");
		$config = $this->getConfigBykb();
		D("Query")->changeDB($this->_project_id);
		echo json_encode_cn( D('Query')->getFormBykb($querierId,$config,$rowId));
	}


	/**
	 * 
	 */
	 
	 public function getConfigBykb(){
		//D("Query")->changeDB("ccplatform");
		$pageContent = M('userSite')->where("id='$this->_site_id'")->getField("config");
		return $pageContent;
		
	}
	 
	 
	 
	 
	/**
	 *  获取当前应用下已经建好的数据源
	 *  @author tlj 2016-04-19
	 *  @return Json  数据源 
	 */ 
	public function getAllQueryDataSources(){
		$query = D('Query');
	    $query -> changeDB($this -> _project_id);
	    $dataSources = $query -> getAllQueryDataSources();
		
		if(count($dataSources) > 0){
			$this -> ajaxSuccess($dataSources,'查询成功!');
		}
		else {
			$this -> ajaxError('没有找到匹配的数据!');
		}
	}
	
	/**
	 * 获取当前应用下所有的表字典
	 * @author tlj 2016-04-19
	 * @return Json 所有的表字典信息
	 */
	public function getAllTables(){
		$query = D('Query');
		$query -> changeDB($this -> _project_id);
		$tables = $query -> getAllTables();
		if(count($tables) > 0){
			$this -> ajaxSuccess($tables, '查询成功!');
		}
		else{
			$this -> ajaxError('没找到匹配的数据!');
		}
	}
	
	/**
	 *  验证多表之间是否存在关系
	 *  @author tlj 2016-04-19
	 *  @return Json 表字段及数据
	 */
	public function queryMultiTableData() {
		//$tables = I('post.tables','',NULL);  //获取传递过来的tables
		//$queryParam = strip_tags($_POST['tables']);
		//$queryParam = $_POST['tables'];
		$queryParam = I('post.tables','',''); //第三个如果不为['']则取出来的值为空,[null][NULL][trim]都为空
		
		//$input =& $_POST;
		//print_r($_POST);
		//print_r($queryParam);
		//print_r($queryParam);
	    
		//exit;
		$isQueryData = I('post.isQueryData', '0', 'intval'); //是否获取数据
		
		$tables  = array_column($queryParam, 'formId');
		$selectedField = array_column($queryParam, 'selectedField');
		
		if(!empty($selectedField) && count($selectedField) > 0){
			foreach ($selectedField as $key => $value) {
				foreach ($value as $skey => $svalue) {
					$fields[] = $svalue['fieldId'];
				}
			}
		}
		//$tables = array_values($tables);
		//$stag = implode('-', $tables);
		//if(!$queryData = S($stag)){
			$query = D('Query');
			$query -> changeDB($this ->_project_id);
			$data = $query -> queryMultiTableData($tables, $isQueryData, $fields);
			//如果传入的表存在关系则执行
			if($data['status'] === 200){
				//if(count($tables) > 1 || !$isQueryData)
				$fieldsAlias = $query -> queryFieldsAlias($tables);   //字段别名集合
				
				//print_r($fieldsAlias); exit;
				
			    $queryData['fieldsTile'] = $fieldsAlias;  //字段对应的标题
			    
			    if($isQueryData)
				  $queryData['queryData'] = $data['queryData'];//查询数据
				  
			    $this->ajaxSuccess($queryData, '查询成功');
			} 
			else {
				$this -> ajaxError($data['info']);
			}
		//}
	}

    /**
	 *  保存数据筛选设置
	 *  @author tlj 2016-04-22
	 */
    public function saveQuerier(){
    	//不能用[addslashes][htmlspecialchars]过滤 
    	$querierConfig = I('post.querierConfig', '', ''); 
    	//$querierConfig = $_POST['querierConfig'];
		$querierName = I('post.querierName', '', 'trim');
		$querierId = I('post.querierId', '0', 'intval'); //0-新增  1-修改
		
		$query = D('Query');
		$query -> changeDB($this -> _project_id);
		$result = $query -> saveQuerier($querierName, $querierConfig, $querierId);
		if($result['status'] === 200)
		  $this -> ajaxSuccess('', $result['info']);
		else
		  $this -> ajaxError($result['info']);
		 
    }
	
	/**
	 *  根据数据源ID获取数据
	 *  @author tlj 2016-04-22	
	 */
	public function queryDataByQid(){
		$qid = I('post.qid', '0', 'intval');
		$query = D('Query');
		$query -> changeDB($this -> _project_id);
		$queryData = $query -> queryDataByQid($qid);
        if(count($queryData) > 0)
		   $this -> ajaxSuccess($queryData,'查询成功!');
		else{
			$this -> ajaxError('没有找到匹配的数据!');
		}
	}
	
}
?>