<?php

/**
 * 查询分析器模型
 * time : 20140116
 */
class QueryModel extends Model {
	/**
	 * 构造函数
	 */
	// public function __construct() {
		// parent::__construct();
		// $this->_initialize();
	// }
	
	public function changeDB($project_id){
		
		$this->db('p' . $project_id, D('PlatForm')->projectDbLink($project_id));
	}
	
	/**
	 * 回调方法 初始化模型
	 */
	protected function _initialize() {
	/*	$project_id = I('session.pid', 0);
		if (!$project_id) {
			echo 0;
			exit();
		}
		$project_info = D('PlatForm')->getAProjectDetails($project_id);
		$this->db('p' . $project_id, D('PlatForm')->projectDbLink($project_id));
		unset($project_info);
	 * */
	}
	
	/**
	 * 获取当前流程下的可用数据源
	 * @param	int		$flow_id 流程ID
	 * @return	array
	 */
	public function getAFlowQuerierList($flow_id, $field = 'ID, querierName') {
		if (!$flow_id) {
			return 0;
		}

		$querier_list = $this->table(C('DB_PREFIX') . 'querier')->where("flowID=" . $flow_id)->field($field)->order("ID DESC")->select();
		return $querier_list;
	}

	/**
	 * 加载查询数据
	 * @param	int			$querier_id 查询ID
	 * @return	array 		返回查询的详细信息，一维数组
	 */
	public function getAQuerierData($querier_id) {
		if (!$querier_id) {
			return 0;
		}

		$querier_info = $this->table(C('DB_PREFIX') . 'querier')->where("ID=" . $querier_id)
		                     ->field('ID, querierName, flowID, queryTables, querierData')->find();
		$querier_data = json_decode($querier_info['querierData']);
		$querier_info['querierData'] = $querier_data;
		unset($querier_data);

		return $querier_info ? $querier_info : array();

	}

	/**
	 * 删除表单指定数据源
	 * @param	int		$querier_id 数据源ID
	 * @return	boolean
	 */
	public function delAQuerier($querier_id) {
		if (!$querier_id) {
			return 0;
		}

		$result = $this->table(C('DB_PREFIX') . 'querier')->where("ID=" . $querier_id . " AND isUsed=0")->delete();

		return $result ? 1 : 0;
	}

	/**
	 * 获取当前流程下所有的表单及表单表格数据表信息
	 * @param	int		$flow_id 当前流程ID
	 * @return	array
	 */
	public function getAllFlowDataTable($flow_id) {
		if (!$flow_id) {
			return 0;
		}

		$data_table_info_tmp = $this->table(C('DB_PREFIX') . 'table_directory AS T')
		                            ->join(C('DB_PREFIX') . 'form_info AS F On T.tableName=F.tableName')
		                            ->where("T.flowID=" . $flow_id)->field('F.ID, T.ID AS tableID, T.tableName, T.tableTitle')
		                            ->order('T.ID')->select();

		$data_table_info = array();
		array_push($data_table_info, array('ID' => '-1', 'tableName' => 'cc_users', 'tableTitle' => '粉丝列表'), array('ID' => -2, 'tableName' => 'cc_wechat_share', 'tableTitle' => '微信分享详情'), array('ID' => -3, 'tableName' => 'cc_more_layout', 'tableTitle' => '制作层数据'), array("ID" => -4, 'tableName' => 'cc_order', 'tableTitle' => "订单信息"));
		foreach ($data_table_info_tmp as $value) {
			$input_control_num = $this->table(C('DB_PREFIX') . 'table_field_directory')
			                          ->where("tableID='" . $value['tableID'] . "' AND controlType<>'CCSearch' AND controlType<>'CCButton' AND controlType<>'CCLabel'")
			                          ->getField('count(ID) as num');

			if ($input_control_num) {
				array_push($data_table_info, $value);
			}
			unset($input_control_num);
		}
		unset($value, $data_table_info_tmp);

		return $data_table_info;
	}

	/**
	 * 检查查询名称
	 * @param	string	$querier_name 查询名称
	 * @return boolean
	 */
	public function chkAQuerierName($querier_name) {
		if ($querier_name == '') {
			return 0;
		}

		$querier_num = $this->table(C('DB_PREFIX') . 'querier')->where("querierName='$querier_name'")->getField('count(ID) AS Num');

		return $querier_num ? 0 : 1;
	}

	/**
	 * 保存表单查询
	 */
	public function saveAQuerierData($querier_id, $flow_id, $json_data, $querier_name, $query_tables) {
		if ($querier_id) {
			return $this->editAQuerierData($querier_id, $json_data, $querier_name, $query_tables);
		} else {
			return $this->addAQuerierData($flow_id, $json_data, $querier_name, $query_tables);
		}
	}

	/**
	 * 新增表单设计器的查询设置
	 * @param	int			$flow_id 当前流程ID
	 * @param	string		$json_data 查询设置数据
	 * @param	string		$querier_name 当前查询名称
	 * @param	string		$query_tables 当前查询数据表名称
	 * @return	int
	 */
	public function addAQuerierData($flow_id, $json_data, $querier_name, $query_tables) {
		if (!$flow_id) {
			return 0;
		}

		$result = $this->chkAQuerierName($querier_name);
		if ($result) {
			$data['querierName'] = $querier_name;
			$data['flowID'] = $flow_id;
			$data['queryTables'] = $query_tables;
			$data['querierData'] = json_addslashes($json_data);
			$data['updateTime'] = time();
			$querier_id = $this->table(C('DB_PREFIX') . 'querier')->data($data)->add();
			unset($data);

			return $querier_id ? $querier_id : 0;
		} else {
			return -1;
		}
	}

	/**
	 * 修改表单设计器的查询设置
	 * @param	int			$querier_id 当前查询ID
	 * @param	string		$json_data 查询设置数据
	 * @param	string		$querier_name 当前查询名称
	 * @param	string		$query_tables 当前查询数据表名称
	 * @return	int			返回查询设置保存成功标识
	 */
	public function editAQuerierData($querier_id, $json_data, $querier_name, $query_tables) {
		if (!$querier_id) {
			return 0;
		}

		$data['querierName'] = $querier_name;
		$data['queryTables'] = $query_tables;
		$data['querierData'] = json_addslashes($json_data);
		$data['updateTime'] = time();
		$result = $this->table(C('DB_PREFIX') . 'querier')->where("ID=" . $querier_id)->data($data)->save();
		unset($data);

		return $result ? $querier_id : 0;
	}

	/**
	 * 更新数据源名称
	 * @param	int			$querier_id 当前查询ID
	 * @param	string		$querier_name 当前查询名称
	 * @return	boolean
	 */
	public function updAQuerierName($querier_id, $querier_name) {
		if (!$querier_id) {
			return 0;
		}

		$data['querierName'] = $querier_name;
		$result = $this->table(C('DB_PREFIX') . 'querier')->where("ID=" . $querier_id)->data($data)->save();
		unset($data);

		return $result ? 1 : 0;
	}

	/**
	 * 替换sql中的系统变量
	 * @param	string	$sql 待执行的sql语句
	 * @return	string
	 */
	public function getSqlSysValue($sql) {
		$sql_array = explode("#", $sql);
		$sql_array_length = count($sql_array);

		if ($sql_array_length > 1) {
			for ($i = 1; $i < $sql_array_length; $i = $i + 2) {
				$condition_sys_value = D('PlatForm')->getSysParamValue($sql_array[$i], 1);
				$sql = str_ireplace("#" . $sql_array[$i] . "#", $condition_sys_value, $sql);
			}
		}
		unset($sql_array);

		return $sql;
	}

	/**
	 * 替换sql中的日期设置
	 * @param	string	$sql 待执行的sql语句
	 * @return	string
	 */
	public function getSqlDateValue($sql) {
		$sql_array = explode("@&", $sql);
		$sql_array_length = count($sql_array);

		if ($sql_array_length > 1) {
			for ($i = 1; $i < $sql_array_length; $i = $i + 2) {
				$field_array = explode("=", $sql_array[$i]);

				$count_num = $field_array[1] ? $field_array[1] : 0;
				switch ($field_array[0]) {
					case 'thisday':
						$condition_date_value = date('Y-m-d', time());
						break;
					case 'thismouthfirstday':
						$condition_date_value = date("Y-m-01", time());
						break;
					case 'thismouthlastday':
						$firstday = date("Y-m-01", time());
						$lastday = date("Y-m-d", strtotime("$firstday + 1 month - 1 day"));
						$condition_date_value = $lastday;
						break;
					case 'preday':
						$today = date('Y-m-d', time());
						$condition_date_value = date('Y-m-d', strtotime("$today - $count_num day"));
						break;
					case 'nextday':
						$today = date('Y-m-d', time());
						$condition_date_value = date('Y-m-d', strtotime("$today + $count_num day"));
						break;
					case 'premonth':
						$today = date('Y-m-d', time());
						$condition_date_value = date('Y-m-01', strtotime("$today - $count_num month"));
						break;
				}
				$sql = str_ireplace("!='@&" . $sql_array[$i] . "@&", " not like '" . $condition_date_value . " %", $sql);
				$sql = str_ireplace("='@&" . $sql_array[$i] . "@&", " like '" . $condition_date_value . " %", $sql);
				$sql = str_ireplace("@&" . $sql_array[$i] . "@&", $condition_date_value, $sql);
			}
		}
		unset($sql_array);

		return $sql;
	}

	/**
	 * 嵌套查询
	 * @param	string		$sql 待执行的sql语句
	 * @return	string
	 */
	public function getNestContition($sql) {
		$sql_array = explode("@@", $sql);
		$sql_array_length = count($sql_array);

		if ($sql_array_length > 1) {
			for ($i = 1; $i < $sql_array_length; $i = $i + 2) {
				$dataset_id = $sql_array[$i];

				$dataset_info = $this->getAQuerierData($dataset_id);
				$datasetObj = $dataset_info['querierData'];
				$dataset_sql = (string) $datasetObj->sql;
				$dataset_sql = "(" . $dataset_sql . ") AS ABC" . $i;

				$sql = str_ireplace("@@" . $sql_array[$i] . "@@", $dataset_sql, $sql);
			}

			$sql = $this->getNestContition($sql);
		}

		return $sql;
	}

	/**
	 * 微信项目ID
	 * @param	string		$sql 待执行的sql语句
	 * @return	string
	 */
	public function getSqlLinkParaValue($sql, $linkParas) {
		$sql_array = explode("@#", $sql);
		$sql_array_length = count($sql_array);
		$linkParas = json_decode($linkParas);

		if ($sql_array_length > 1) {
			for ($i = 1; $i < $sql_array_length; $i = $i + 2) {
				$linkParaValue = $linkParas->$sql_array[$i] ? $linkParas->$sql_array[$i] : 0;
				$sql = str_ireplace("@#" . $sql_array[$i] . "@#", $linkParaValue, $sql);
				unset($linkParaValue);
			}
		}

		return $sql;
	}

	/**
	 * 微信项目ID
	 * @param	string		$sql 待执行的sql语句
	 * @return	string
	 */
	public function getSqlControlValue($sql, $formCtrlJson) {
		$sql_array = explode("$", $sql);
		$sql_array_length = count($sql_array);
		$formCtrlJson = json_decode($formCtrlJson);

		if ($sql_array_length > 1) {
			for ($i = 1; $i < $sql_array_length; $i = $i + 2) {
				$field_name = explode(".", $sql_array[$i]);
				$formCtrlJsonValue = $formCtrlJson->$field_name[1] ? $formCtrlJson->$field_name[1] : 0;
				$sql = str_ireplace("$" . $sql_array[$i] . "$", $formCtrlJsonValue, $sql);
				unset($formCtrlJsonValue);
			}
		}

		return $sql;
	}

	/**
	 * 执行sql语句，带出数据集
	 * @param	string		$sql 待执行的sql语句
	 * @param	json		$linkParas 参数 key-value
	 * @param	json		$formCtrlJson	控件key-value
	 * @param	int			$max_id
	 * @return	array
	 */
	public function execAQueryPlan($sql, $linkParas = '', $formCtrlJson = '', $max_id = 0) {
		if ($sql == '') {
			return 0;
		}

		if (strpos($sql, 'cc_users')) {
			$project_id = session('pid');
			$we_idArr = M('UserSite')->where("userProjectId=" . session('pid'))->find();
			$we_id = $we_idArr['wechatId'];

			$db = M('wechat_applist');
			$getAppAgentId = $db->where("WeId = $we_id AND siteId = '" . $we_idArr['id'] . "'")->find();
			$agentId = $getAppAgentId['agentId'];

			$openidList = M('wechat_app_member')->where("WeId = '$we_id' AND agentId = '$agentId'")->select();

			if (count($openidList)) {
				$openidStr = "";
				foreach ($openidList as $key => $value) {
					$openidStr .= ",'" . $value['openid'] . "'";
				}
				$openidStr = substr($openidStr, 1);
			} else {
				$data['sql'] = array();
				$data['count'] = 0;
				return $data;
			}

			$sql = str_ireplace("1 = 1", "openid in ($openidStr)", $sql);

			$data_lists = M()->query($sql);

		} else if (strpos($sql, 'cc_wechat_share')) {
			$project_id = session('pid');
			$siteId = M('UserSite')->where("userProjectId=" . session('pid'))->getField('id');

			$sql = str_ireplace("1 = 1", "siteId = $siteId", $sql);

			$data_lists = M()->query($sql);
		} else {
			$sql = $this->getNestContition($sql);
			$sql = $linkParas ? $this->getSqlLinkParaValue($sql, $linkParas) : $sql;
			$sql = $formCtrlJson ? $this->getSqlControlValue($sql, $formCtrlJson) : $sql;
			$sql = $this->getSqlSysValue($sql);
			$sql = $this->getSqlDateValue($sql);
			if ($max_id > 0) {
				$sql .= " limit " . $max_id . ", 10";
			}
			$data_lists = $this->query($sql);
		}

		$data_lists_show = array();
		$i = 0;
		foreach ($data_lists as $data_list) {
			$i++;
			$data_temp = array();
			foreach ($data_list as $key => $value) {
				if ($value != '') {
					$data_temp[$key] = $key === 'cc_users_userPhoto' ? $value . '/0' : $value;
				} else {
					$data_temp[$key] = '';
				}
			}
			unset($value);
			array_push($data_lists_show, $data_temp);
		}
		unset($data_temp, $data_list, $data_lists);
		$data['sql'] = $data_lists_show;
		$data['count'] = $i;
		unset($data_lists_show, $i);

		return $data;
	}

    /**
	 * 根据用户传入的表ID查询数据
	 * @param $tables        表ID 如:array(1,2,3)
	 * @param $isQueryData   是否需要查询数据 0-不需要 1-需要
	 * @param $fields        需要查询的字段信息 
	 * @param $where         查询条件
	 * @return json          查询结果
	 */
    public function queryMultiTableData($tables, $isQueryData = 0, $fields = array(), $where = array()){
    	
		$result['status'] = 200;
		$result['info'] = 'success';
		
    	//根据传入的表ID,找出各自的关系信息
		$tableRelation = $this -> getTableRelation($tables);
		
		//如果选择1张以上表并且关系信息为空, 则表示所选表无任何关系, 直接退出.
		if(count($tables) > 1 && (count($tableRelation) < 1 || empty($tableRelation)) ){
			$result['status'] = 201;
			$result['info'] = '所选表不存在关系,请重新选择!';
			//exit("所选表无任何关系,无结果!");
			return $result;
		}
		
		//找出formId对应的表名 table_directory
		$tablesName = $this -> getTablesNameById($tables);
		$newT = array_column($tablesName, 'tableName', 'ID');

		//获取所有表字段信息
		$tablesField = $this -> getTablesFieldById($tables); 
		
		$existsTable = array();
		$existsField = array();
		
		//只要有一个表与其它表无关系则表示整体没关系
		$haveRelationTables;
		$tableCount = count($tables); 
		$sql;
		$sqlfields = array();   //查询字段信息
		$TbOnArr = array();     //多表查询on信息
		$existsTable = array(); //已经存在关系的表
		 
		//如果传入多张表
		if($tableCount > 1) {
			for($i = 0; $i < $tableCount; $i++){
				for ($j = $i + 1; $j  < $tableCount ; $j ++) {
					 $key1 = $tables[$i].'-'.$tables[$j];
					 $key2 = $tables[$j].'-'.$tables[$i];
					 
					 $flag = true;
					 $relation;
					 foreach ($tableRelation as $relationKey => $relationValue) {
					 	    $flag = true;
						    //if(!is_array($relationValue))
						       // $relValue = json_decode($relationValue['tableRelation'],true);
						 	//如果两表之间存在关系 
							 if (array_key_exists($key1, $relationValue)){       //["0-1"]
							   	$relation = $relationValue;
							 }
							 elseif (array_key_exists($key2, $relationValue)) { //["1-0"]
								$relation = $relationValue;
							 }
							 else{
							 	$flag = false;
							 }
							 
							 if($flag){
							 	$haveRelationTables[] = $tables[$i];
								$haveRelationTables[] = $tables[$j];
							    $haveRelationTables = array_unique($haveRelationTables); // 数组去重
								break;
							 }
					 }
					 
					 //如果[$i]与[$j]存在关系的话
					 if($flag){
						
							$onArr = array(); //每次数组清空
							$onStr = "";
													
							foreach ($relation as $rKey => $rValue) {
								$onl = explode('-', $rValue);
								
								foreach ($onl as $oKey => $oValue) {
									$titField = explode(':', $oValue);
									//获取表字典信息,ID作key,tableName作value
									//$newT = array_column($tablesName, 'tableName', 'ID');
									$onArr[] = $newT[$titField[0]].'.'.$titField[1];
								}
 							}
							$onStr = implode('=', $onArr);
							$TbOnArr[] = $onStr;  //存储连表查询的on信息 
							
							//如果不是第一组,if条件暂时不成立
							if($i > 1000 && $j > 11111){
								//echo "-0-";
							}
							else{
								foreach ($tablesName as $tKey => $tValue) {
									$tid = $tValue['ID'];
									if($tid == $tables[$i])
									{
										$tableName1 = $tValue['tableName'];
										$table1Alias = substr(trim($tableName1), 7);
										//break;
									}
									elseif($tid == $tables[$j]){
										$tableName2 = $tValue['tableName'];
										$table2Alias = substr(trim($tableName2), 7);
									}
								}
								
								$strId1 = $tableName1.'.ID as '.$table1Alias.'_ID';
								$strId2 = $tableName2.'.ID as '.$table2Alias.'_ID';
								
								//将查询字段组装成字符串
								foreach ($tablesField as $tfKey => $tfValue) {
	
									if($tfValue['tableID'] == $tables[$i]){  //&& !array_key_exists($tables[$i], $existsTable)){
										//$sqlFieldStr =	$tableName1.'.'.$tfValue['fieldName'].' as '.$tfValue['fieldTitle'];
										$asStr = $table1Alias.'_'.$tfValue['fieldName'];
										//如果传入的字段信息不为空,并且当前循环字段不在传入字段数组中,则跳过
										if(!empty($fields) && !in_array($asStr, $fields)){
											continue;
										}
										//添加ID字段
										if(!in_array($strId1, $existsField)){
											$sqlfields[] = $strId1;
											$existsField[] = $strId1;
										}
										   
										$sqlFieldStr =	$tableName1.'.'.$tfValue['fieldName'].' as '.$asStr;
									    if(!in_array($sqlFieldStr, $existsField)){
									    	$sqlfields[] = $sqlFieldStr;
										    $existsTable[$tables[$i]] = $tableName1;
										    $existsField[] = $sqlFieldStr;
									    }
									} 
									elseif($tfValue['tableID'] == $tables[$j]){ //&& !array_key_exists($tables[$j], $existsTable)) {
								 		//$sqlFieldStr = $tableName2.'.'.$tfValue['fieldName'].' as '.$tfValue['fieldTitle'];
								 		$asStr = $table2Alias.'_'.$tfValue['fieldName'];
										if(!empty($fields) && !in_array($asStr, $fields))
										   continue;
										
										//添加ID字段
										if(!in_array($strId2, $existsField)){
											$sqlfields[] = $strId2;
											$existsField[] = $strId2;
										}
										
								 		$sqlFieldStr =	$tableName2.'.'.$tfValue['fieldName'].' as '.$asStr;
									    if(!in_array($sqlFieldStr, $existsField)){
									    	$sqlfields[] = $sqlFieldStr;
										    $existsTable[$tables[$j]] = $tableName2;
										    $existsField[] = $sqlFieldStr;
									    }
									}
								}
							}
					 }else{
					 	
					 }
				}
				//将$i表与其它表比较后,如果不存在关系,则用户发起的整个查询无关系
				if(!array_key_exists($tables[$i], $existsTable)){
					$tmpTables = array_column($tablesName, 'tableTitle', 'ID');
					$result['status'] = 202;
					$result['info'] = "表[{$tmpTables[$tables[$i]]}]与其它表没任何关系!";
					unset($tmpTables);
					return $result;
				}
			}
          
			$i = 0;
			foreach ($existsTable as $ekey => $evalue) {
				if($i === 0){
					$fromAndOnArr[] = $evalue;
				}
				else{
					$fromAndOnArr[] = " join ".$evalue;
				    $fromAndOnArr[] = " on ".$TbOnArr[$i-1]; 
				}
				$i++;
			}
			$sql = "select ".implode(",", $sqlfields)." from ".implode(' ', $fromAndOnArr);
		}
		elseif($tableCount == 1) {
			//如果等于1则直接返回单张表数据
			//$newT = array_column($tablesName, 'tableName', 'ID');
			$tableName = substr($tablesName[0]['tableName'], 7);
			$sqlfields[] = "ID as {$tableName}_ID ";
			//将查询字段组装成字符串
			foreach ($tablesField as $key => $value) {
				$sqlfields[] = $value['fieldName'].' as '.$tableName.'_'.$value['fieldName'];
			}
			$sql = "select ".implode(',', $sqlfields)." from ".$tablesName[0]['tableName'];		
		}
		
		//如果存在条件
		if(!empty($where) && count($where) > 0){
			$sql .= ' where '.implode(' and ', $where);
		}
		$result['sql'] = $sql;
		if($isQueryData){
			$queryData = $this -> query(addslashes($sql));
			$result['queryData'] = $queryData;
		}
		return $result;
    }

    /**
	 *  查询字段别名
	 *  @access public
	 *  @param  $tables 表ID集合
	 *  @return array   字段别名集合
	 */ 
    public function queryFieldsAlias($tables){
     	//$inStr = implode(',', $tables);
		
    	//原始写法
		//$sql = "SELECT t.id, substring(concat_ws('_',t.tableName , f.fieldName),8) as fieldAlias, f.fieldTitle FROM cc_table_directory t join cc_table_field_directory f
        //        on f.tableid = t.id where t.id in({$inStr})";
        
		//预处理方式		
		//$sql = "SELECT t.id, substring(concat_ws('_',t.tableName , f.fieldName),8) as fieldAlias, f.fieldTitle FROM cc_table_directory t join cc_table_field_directory f
          //      on f.tableid = t.id where t.id in(%s)";
          //return $this -> query($sql, $inStr);	
          
          
        //Thinkphp写法  
		$where = array(' t.id ' => array('in', $tables));		
		return $this->table(C('DB_PREFIX').'table_directory t')->join('join '.C('DB_PREFIX').'table_field_directory f on t.id = f.tableid') 
		     -> field("t.id, substring(concat_ws('_',t.tableName , f.fieldName),8) as fieldAlias, f.fieldTitle") -> where($where) -> select();		
				
	    //return $this -> query($sql);
    }

	/**
	 * 执行sql语句，带出数据集
	 * @param	string		$sql 待执行的sql语句
	 * @param	json		$linkParas 参数 key-value
	 * @param	json		$formCtrlJson	控件key-value
	 * @param	int			$max_id
	 * @return	array
	 */
	public function execAQueryPlanBycc($sql, $linkParas = '', $formCtrlJson = '', $max_id = 0) {
		if ($sql == '') {
			return 0;
		}
		$type = json_decode($sql)->type;
		if ($type == "select") {
			$sql = $this->createSelectSql($sql);
		} else if ($type == "layout") {
			$sql = "SELECT cc_more_layout.data as cc_more_layout_data ,cc_more_layout.extend as cc_more_layout_extend from cc_more_layout where cc_more_layout.layId = '" . json_decode($sql)->queryId . "'";
		} else {
			$sql = $this->createSql($sql);
		}
		if (strpos($sql, 'cc_users')) {
			
			$project_id = session('pid');
			$we_idArr = M('UserSite')->where("userProjectId=" . session('pid'))->find();
			$we_id = $we_idArr['wechatId'];

			$db = M('wechat_applist');
			$getAppAgentId = $db->where("WeId = $we_id AND siteId = '" . $we_idArr['id'] . "'")->find();
			$agentId = $getAppAgentId['agentId'];

			$openidList = M('wechat_app_member')->where("WeId = '$we_id' AND agentId = '$agentId'")->select();

			if (count($openidList)) {
				$openidStr = "";
				foreach ($openidList as $key => $value) {
					$openidStr .= ",'" . $value['openid'] . "'";
				}
				$openidStr = substr($openidStr, 1);
			} else {
				return null;
			}

			$sql = $this->getNestContition($sql);
			$sql = $linkParas ? $this->getSqlLinkParaValue($sql, $linkParas) : $sql;
			$sql = $formCtrlJson ? $this->getSqlControlValue($sql, $formCtrlJson) : $sql;
			$sql = $this->getSqlSysValue($sql);
			$sql = $this->getSqlDateValue($sql);
			$sql = str_ireplace("1 = 1", "openid in ($openidStr)", $sql);
			$data_lists = M()->query($sql);
		} else if (strpos($sql, 'cc_wechat_share')) {
			$project_id = session('pid');
			$siteId = M('UserSite')->where("userProjectId=" . session('pid'))->getField('id');

			$sql = str_ireplace("1 = 1", "siteId = $siteId", $sql);
			//print_r($sql);
			$data_lists = M()->query($sql);
		} else if (strpos($sql, 'cc_more_layout')) {
			$project_id = session('pid');
			$siteId = M('UserSite')->where("userProjectId=" . session('pid'))->getField('id');
			$sql = str_ireplace("1 = 1", "siteId = $siteId", $sql);
			$sql = $this->getNestContition($sql);
			$sql = $linkParas ? $this->getSqlLinkParaValue($sql, $linkParas) : $sql;
			$sql = $formCtrlJson ? $this->getSqlControlValue($sql, $formCtrlJson) : $sql;
			$sql = $this->getSqlSysValue($sql);
			$sql = $this->getSqlDateValue($sql);

			$data_lists = $this->query($sql);
			$count = count($data_lists);
			for ($i = 0; $i < $count; $i++) {
				$data_lists[$i]["cc_more_layout_data"] = base64_decode($data_lists[$i]["cc_more_layout_data"]);
			}
		} else if (strpos($sql, 'cc_order.ID')) {
			$project_id = session('pid');
			$siteId = M('UserSite')->where("userProjectId=" . session('pid'))->getField('id');
			//$sql = str_ireplace("1 = 1", "siteId = $siteId", $sql);
			$sql = $this->getNestContition($sql);
			$sql = $linkParas ? $this->getSqlLinkParaValue($sql, $linkParas) : $sql;
			$sql = $formCtrlJson ? $this->getSqlControlValue($sql, $formCtrlJson) : $sql;
			$sql = $this->getSqlSysValue($sql);
			$sql = $this->getSqlDateValue($sql);

			$data_lists = $this->query($sql);
			$count = count($data_lists);
			for ($i = 0; $i < $count; $i++) {
				$data_lists[$i]["cc_more_layout_data"] = base64_decode($data_lists[$i]["cc_more_layout_data"]);
			}
		} else {
			$sql = $this->getNestContition($sql);
			$sql = $linkParas ? $this->getSqlLinkParaValue($sql, $linkParas) : $sql;
			$sql = $formCtrlJson ? $this->getSqlControlValue($sql, $formCtrlJson) : $sql;
			$sql = $this->getSqlSysValue($sql);
			$sql = $this->getSqlDateValue($sql);
 			if ($max_id > 0) {
				$sql .= " limit " . $max_id . ", 10";
			}

			if ($type == "select") {
				$data_lists = $this->query($sql);
			} else {
				$data_lists = $this->execute($sql);
			}
		}

		//echo "sql:".$sql;exit;
		$data_lists_show = array();
		$i = 0;
		foreach ($data_lists as $data_list) {
			$i++;
			$data_temp = array();
			foreach ($data_list as $key => $value) {

				if ($value != '') {

					$data_temp[$key] = $key === 'cc_users_userPhoto' ? $value . '/0' : $value;
					if (strpos($key, 'CCPageBrowse')) {
						//$value  = base64_decode($value)
						$data_temp[$key] = base64_decode($value);
						//print_r();
					}

				} else {
					$data_temp[$key] = '';
				}
			}
			unset($value);
			array_push($data_lists_show, $data_temp);
		}

		unset($data_temp, $data_list);

		if ($type == "select") {
			$data['sql'] = $data_lists_show;
		} else {
			$data['sql'] = $data_lists;
		}
		unset($data_lists_show, $data_lists);

		return $data;
	}

	/**
	 * 获取数据源带出数据并带出点赞数据
	 * @param	int		$comp_id 组件ID
	 * @return array
	 */
	public function getAQueryDataWithZan($comp_ids, $sql, $linkParas = '', $formCtrlJson = '', $max_id = 0) {
		$data = $this->execAQueryPlan($sql, $linkParas = '', $formCtrlJson = '', $max_id = 0);
		$comp_id_lists = explode(',', $comp_ids);

		$zan_records = array();
		foreach ($comp_id_lists as $comp_id) {
			$zan_record = D('Project')->getAllZanRecords($comp_id);
			$zan_records = $zan_record ? array_merge($zan_records, $zan_record) : $zan_records;
			unset($zan_record);
		}
		unset($comp_id);

		$data_temp = array();
		foreach ($data['sql'] as $value) {
			foreach ($comp_id_lists as $comp_id) {
				$value[$comp_id] = D('Project')->getZanRecord($value['ID'], $comp_id);
			}
			unset($comp_id);
			$value['isZan'] = in_array($value['ID'], $zan_records) ? 1 : 0;

			array_push($data_temp, $value);
		}
		unset($value, $data, $comp_id_lists);
		$data['sql'] = $data_temp;
		unset($data_temp);

		return $data;
	}

	/*
	 * 处理数据源的增删改json结构
	 * @param $sqlJson  json结构
	 * */
	public function createSql($sqlJson) {
		$obj = json_decode($sqlJson);

		$type = $obj->type;
		$table = $obj->tableName;
		$fields = $obj->field;
		$where = $obj->where;
		$autoType = $obj->autoType;

		$fieldStr = "";
		$addField = "";
		$addValue = "";
		$whereStr = "";
		//print_r($fields);
		if ($type == "insert") {
			$aa = explode(",", $fields[0]->fieldValue);
			$count = count($aa);
			$count2 = count($fields);

			$str = "";
			for ($i = 0; $i < $count; $i++) {
				$str = $str . "(";
				for ($n = 0; $n < $count2; $n++) {
					$vals = $fields[$n]->fieldValue;
					$valArr = explode(",", $vals);
					$str = $str . "'" . $valArr[$i] . "',";
				}
				$str = substr($str, 0, strlen($str) - 1);
				$str = $str . "),";

			}
			$str = substr($str, 0, strlen($str) - 1);
		}
		foreach ($fields as $v) {
			if ($type == "insert") {
				$f = $v->fieldName;
				$va = $v->fieldValue;

				$addField = $addField . ", " . $f . " ";
				$addValue = $addValue . ", '" . $va . "' ";
			} else if ($type == "update") {
				$f = $v->fieldName;
				$va = $v->fieldValue;
				if ($autoType == "add") {
//自增
					$fieldStr = $fieldStr . " AND " . $f . "=" . $f . "+" . $va . "  ";
				} elseif ($autoType == 'dec') {
					$fieldStr = $fieldStr . " AND " . $f . "=" . $f . "-" . $va . "  ";
				} else {

					$fieldStr = $fieldStr . " AND " . $f . "='" . $va . "'  ";
				}

			} else if ($type == "delete") {
				print_r("asd");
				$f = $v->fieldName;
				$va = $v->fieldValue;
				$valArr = explode(",", $va);
				print_r($valArr);
				$whereStr = "";
				foreach ($valArr as $value) {
					$whereStr = $whereStr . " or " . $f . "='" . $value . "' ";
				}
				$whereStr = substr($whereStr, 3);
				$fieldStr = $fieldStr . " AND " . $whereStr;

			}
		}

		$addField = substr($addField, 2);
		$addValue = substr($addValue, 2);
		$fieldStr = substr($fieldStr, 5);
		foreach ($where as $key => $value) {
			$fieldName = $value->fieldName;
			$fieldValue = $value->fieldValue;
			$logic = $value->arith;
			$linklogic = $value->logic;

			$valArr = explode(",", $fieldValue);
			$wheres = "";
			$logic = $this->replaceLogic($logic);
			foreach ($valArr as $value) {
				$wheres = $wheres . " or " . $fieldName . $logic . "'" . $value . "' ";
			}
			$wheres = substr($wheres, 3);
			$whereStr = $whereStr . " " . $linklogic . " (" . $wheres . ")";
		}

		//echo $type;

		if ($whereStr) {
			$whereStr = " WHERE " . $whereStr;
		}
		if ($type == "delete") {
			$sql = "delete FROM " . $table . $whereStr;
		} else if ($type == "insert") {
			$sql = "INSERT INTO " . $table . " (" . $addField . ") values " . $str;
		} else if ($type == "update") {
			$sql = "UPDATE " . $table . " SET " . $fieldStr . $whereStr;
		}
		return $sql;
	}

	public function object_array($array) {
		if (is_object($array)) {
			$array = (array) $array;
		}
		if (is_array($array)) {
			foreach ($array as $key => $value) {
				$array[$key] = $this->object_array($value);
			}
		}
		return $array;
	}

	/*
	 * 创建查询的sql,前端不在拼sql
	 * */
	public function createSelectSql($sqlJson) {
		$obj = json_decode($sqlJson);
		$mark = $obj->mark;
		$queryId = $obj->queryId;
		$form = $obj->form;
		$where = $obj->where;
		$layId = $obj->layId;
		$limit = $obj->limit?$obj->limit:0;
		
		$sort = $obj->sort; //更改排序的时候
		$relation = $obj->relation; //组件嵌套的时候有
		$delLimit = $obj->delLimit; //删除限制

		if ($queryId) {
			$sql_obj = $this->getAQuerierData($queryId);

		}

		//$sqls = json_decode($sql_obj['querierData']);
		$sqlStr = $sql_obj['querierData']->sql;
		$aa = ($sql_obj['querierData']);
		$array = $this->object_array($sql_obj['querierData']);

		$whereCond = $array['whereJson']['condJson'];
		//exit;
		//$whereCond = $aa->whereJson->condJson;

		$form = $this->object_array($form);
		foreach ($whereCond as $key => $value) {
			$va = $value[0]['nodeType'];
			$trueVal = $form[$va];
			$sqlStr = str_replace("$" . $va . "$", $trueVal, $sqlStr);
		}
		if ($mark == "true") {
			$whereStr = "";
			foreach ($where as $key => $value) {
				$fieldName = $value->fieldName;
				$fieldValue = $value->fieldValue;
				$logic = $value->arith;
				$linklogic = $value->logic;

				$whereStr = $whereStr . " " . $linklogic . " " . $fieldName . $this->replaceLogic($logic) . "'" . $fieldValue . "' ";
			}
			$sqlStr = "select * from ( " . $sqlStr . ") as dataTable where " . $whereStr;
		}
		if (!empty($layId)) {
			//$sqlStr = $sqlStr."  layId = '".$layId."'";
			$sqlStr = str_replace("cc_more_layout.layId='layId'", "cc_more_layout.layId='" . $layId . "'", $sqlStr);
		}
		
		if($limit!=0){
			$cutSqlByLimit = explode("limit", $sqlStr);
			$cutSqlByLimit[1] = $limit;
			$sqlStr = $cutSqlByLimit[0]." limit ".$limit;
		}
		if ($relation) {
//组件嵌套的时候
			$dsId = $relation->dsId;
			$subDsId = $relation->subDsId;
			$parentId = $relation->parentId;
			$conninfo = $this->getTwoDataSetConn($dsId, $subDsId);
			/*

			subLimit = " limit " + subSql.split("limit")[1];
			}
			newSql = subSql.split("limit")[0] + " and " + connInfo + "" + parentId + subLimit; */
			$cutSqlByLimit = explode("limit", $sqlStr);
			
			$sqlStr = $cutSqlByLimit[0] . " AND " . $conninfo . "" . $parentId . " limit " . $cutSqlByLimit[1];
		}

		if ($sort) {
//排序的时候
			$cutSqlByOrder = explode("order by", $sqlStr);
			if ($sort == "ASC") {
				$cutSqlByOrder[1] = str_replace("DESC", "ASC", $cutSqlByOrder[1]);
			} else if ($sort == "DESC") {
				$cutSqlByOrder[1] = str_replace("ASC", "DESC", $cutSqlByOrder[1]);
			}
			$sqlStr = $cutSqlByOrder[0] . " order by " . $cutSqlByOrder[1];

		}
		if ($delLimit) {
			$cutSqlByLimit = explode("limit", $sqlStr);
			$sqlStr = $cutSqlByLimit[0];
		}
		return $sqlStr;
	}

	/*
	 * 逻辑符号替换
	 * */
	public function replaceLogic($str) {
		$comparison = array('eq' => '=', 'neq' => '<>', 'gt' => '>', 'egt' => '>=', 'lt' => '<', 'elt' => '<=', 'notlike' => 'NOT LIKE', 'like' => 'LIKE', 'in' => 'IN', 'notin' => 'NOT IN');
		return $comparison[$str];
	}

	/**
	 * 对比数据源
	 * @param		int		$datasetid1 外层数据源id
	 * @param		int		$datasetid2 内层数据源id
	 * @return 		string
	 */
	public function getTwoDataSetConn($datasetid1, $datasetid2) {
		$dataset_info1 = $this->getAQuerierData($datasetid1);
		$table_list1 = $dataset_info1['queryTables'];
		unset($dataset_info1);
		$table1_array = explode(",", $table_list1);

		$dataset_info2 = $this->getAQuerierData($datasetid2);
		$table_list2 = $dataset_info2['queryTables'];
		unset($dataset_info2);

		$query_cond = '';
		$table2_array = explode(",", $table_list2);
		foreach ($table2_array as $table2) {
			$conns_info = D('Project')->getAFormConnectedForms($table2);

			foreach ($conns_info as $value) {
				if (in_array($value['conn_table'], $table1_array)) {
					$query_cond = $value['conn_info_table1'] . $value['conn_info_center'];
					break;
				}
			}
			unset($value, $conns_info);
		}
		unset($table2, $table2_array, $table1_array);

		return $query_cond;
	}

	/**
	 * 获取数据
	 * @param	int		$dataset_id
	 * @param	string	$field_name
	 * @param	json	$linkParas
	 * @return
	 */
	public function getAQueryFieldValue($dataset_id, $field_name, $linkParas) {
		if (!$dataset_id || $field_name == '') {
			return 0;
		}

		$query_info = $this->getAQuerierData($dataset_id);
		$sql_str = (string) $query_info['querierData']->sql;
		unset($query_info);
		$data_info = $this->execAQueryPlan($sql_str, $linkParas);
		$query_data = $data_info['sql'];
		unset($data_info);

		return $query_data[0]["$field_name"] ? $query_data[0]["$field_name"] : 0;
	}

	/**
	 * 根据规则ID获取规则参数
	 * @param	string	$ruleid 规则ID
	 * @return	array
	 */
	public function getParametersByRuleID($ruleid) {
		if ($ruleid == '') {
			return 0;
		}

		$rule = M('rule')->where("ruleID='$ruleid'")->getField('xmlData');
		if ($rule) {
			$xml = simplexml_load_string(str_replace("\\\"", "\"", trim($rule)));
			$params = array();
			foreach ($xml->parameters[0]->parameter as $param) {
				$p['name'] = (string) $param->name[0];
				$p['desc'] = (string) $param->input[0];
				$params[] = $p;
			}
			unset($param);

			return $params;
		} else {
			return array();
		}
	}

	/**
	 * 更新逻辑运算
	 * @param	string	$logicid 逻辑运算ID
	 * @param	string	$xmlStr 逻辑运算的设置xml数据
	 * @return boolean
	 */
	public function updateRuleFormula($logicid, $xmlStr) {
		if ($logicid == '' || $xmlStr == '') {
			return 0;
		}

		$data['xmlData'] = $xmlStr;
		$res = M('rule_formula')->where("ruleFormulaID")->data($data)->save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 执行指定的逻辑运算
	 * @param	int		$ruleid 逻辑运算的ID
	 * @param	array 	$paras_arr 逻辑运算的参数信息
	 * @return boolean
	 */
	public function execALogicOperation($ruleid, $paras_arr) {
		if ($ruleid == 0) {
			return 0;
		}

		if (is_null($paras_arr) || empty($paras_arr)) {
			$paras_arr = array();
		}

		$rfObj = new AnalyRuleFormula($paras_arr);
		$rfObj->getXmlData($ruleid);
		$rfObj->analyzeDataOperate();
		unset($rfObj);
	}

	/**
	 * 保存接口设置
	 * @param	array 	$data 设置信息
	 * @return boolean
	 */
	public function addAInterfaceQuest($data) {
		$data['interfaceID'] = 'i' . date('YmdHis', time()) . rand(1000, 9999);
		$data['createTime'] = time();

		$res = M('interface')->data($data)->add();

		return $res ? 1 : 0;
	}

	/**
	 * 根据状态获取当前流程下的接口请求
	 * @param	string	$flowid 流程ID
	 * @param	int		$state 接口状态
	 * @return	array
	 */
	public function getInterfaceListByFlow($flowid, $state = 0) {
		if ($flowid == '') {
			return 0;
		}

		$interface_list = $this->table(C('DB_PREFIX') . 'interface')->where("oFlowID='$flowid' and fixState=$state")->field('ID, interfaceID, interfaceName, interfaceVersion, flowID, flowName, createTime')->order('ID')->select();

		return $interface_list;
	}

	/**
	 * 获取当前流程所有的接口请求，不根据状态
	 * @param   string  $flowid 流程ID
	 * @return  array
	 */
	public function getInterfaceListByFlowId($flowid) {
		$interface_list = M('interface')->where("oFlowID='$flowid'")->field('ID, interfaceID, interfaceName, flowID, flowName,fixState')->order('ID')->select();

		return $interface_list ? $interface_list : array();
	}

	/**
	 * 获取指定接口数据信息
	 * @param	int/string	$iid 接口ID
	 * @return	array
	 */
	public function getAInterfaceData($iid) {
		if ($iid == 0 || $iid == '') {
			return 0;
		}

		$interface_info = M('interface')->where("ID=$iid or interfaceID='$iid'")->field('ID, interfaceID, interfaceName, flowID, flowName, oFlowID, oFlowName, fixState, createTime, xmlData, dataSourceID')->find();

		return $interface_info ? $interface_info : array();
	}

	/**
	 * 处理接口请求
	 * @param	int/string	$iid 接口ID
	 * @param	string		$querier_id 数据源ID
	 * @return	boolean
	 */
	public function modifyInterfaceState($iid, $querier_id) {
		if ($iid == 0 || $iid == '' || $querier_id == '') {
			return 0;
		}

		$data['fixState'] = 1;
		$data['dataSourceID'] = $querier_id;

		$res = M('interface')->where("ID=$iid or interfaceID='$iid'")->data($data)->save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 更新接口xml数据
	 * @param	int/string	$iid 接口ID
	 * @param	string		$xmlData 接口xml
	 * @return	boolean
	 */
	public function updateInterfaceXml($iid, $xmlData) {
		if ($iid == 0 || $iid == '') {
			return 0;
		}

		$data['xmlData'] = $xmlData;
		$res = M('interface')->where("ID=$iid or interfaceID='$iid'")->data($data)->save();
		unset($data);

		return $res ? 1 : 0;
	}

	/*
	 * 获取wx模板的数据
	 * @return array  个人模板和系统模板
	 */

	public function getWxTpl() {
		$uid = $_SESSION['uid'];
		$db = M("wx_muban");
		$result = $db->where("userID = '$uid' or type = 1 ")->field("ID,name,title,type")->select();

		return $result;
	}
	
	public function getFormBykb($queryId,$config,$rowId){
		$result = $this->table(C("DB_PREFIX")."querier")->where("id = '$queryId'")->field("queryTables")->select();
		$tableName = $result[0]["queryTables"];
		$formInfo = $this->table(C("DB_PREFIX")."form_info")->where("tableName = '$tableName'")->field("ID,formData,tableName")->select();
		$formId = $formInfo[0]["ID"];
		$pageId = $this->getPageId($config, $formId);
		$pageContent = $this->table(C("DB_PREFIX")."site_template")->where("name='$pageId'")->field("content")->select();
		$fieldList = $this->table(C("DB_PREFIX")."table_field_directory")->where("formID='$formId'")->field("fieldName")->select();
		
		$len=count($fieldList);
		$fieldStr = array();
  		for($i=0;$i<$len;$i++){
			array_push($fieldStr,$fieldList[$i]["fieldName"]);
		}
		$fieldStr =implode(",",$fieldStr);
		$dataList = $this->table("$tableName")->where("ID='$rowId'")->field($fieldStr)->select();
		$info["page"] = $pageContent[0]["content"];
		$info["info"] = json_decode($formInfo[0]["formData"]);
		$info["data"] = $dataList;
		$info["formId"] = $formId;
		//print_r($pageContent[0]["content"]);
		return $info;
	}
	
	function getPageId($config,$formId){
		$config = json_decode($config);
		$pageMgr = $config->pageMgr;
		$pageManage = $config->pageManage;
		$pageMenu = $config->pageMenu;
		
		for($i =0 ;$i<count($pageMgr);$i++){
			if($pageMgr[$i]->formId == $formId){
				return $pageMgr[$i]->page;
			}
		}
		for($i =0 ;$i<count($pageManage);$i++){
			if($pageManage[$i]->formId == $formId){
				return $pageManage[$i]->page;
			}
		}
		for($i =0 ;$i<count($pageMenu);$i++){
			if($pageMenu[$i]->formId == $formId){
				return $pageMenu[$i]->page;
			}
		}
		
	}
	
	/**
	  *  获取表关系信息
	  *  @param $tables 待查询的表列表
	  *  @return array   表关系数据
	  */
	 public function getTableRelation($tables){
		$whereData['formid'] = array('in', $tables);
		$relations = $this -> table(C('DB_PREFIX').'table_relation') -> where($whereData) -> select();
		$relations = array_column($relations, 'tableRelation');
		
		//将{"2-6":"2:TEXTBOX2-6:TEXTBOX2"}与[{"11-10":"11:TEXTBOX3-10:TEXTBOX2"},{"11-9":"11:TEXTBOX4-9:TEXTBOX2"}]组成数组
		foreach ($relations as $key => $value) {
			if(strpos($value, ',') > -1){
			 	$tmpArr = json_decode($value, true);
				foreach ($tmpArr as $skey => $svalue) {
					$srelas[] = $svalue;
				}
			}
			else{
				$tmpArr = json_decode($value,true);
				$srelas[] = $tmpArr[0];
			}
		}
		unset($whereData, $relations, $tmpArr);
	    return $srelas;
	 }
	 
	 /**
	  *  根据表ID获取表名
	  *  @param  $tables 表ID
	  *  @return array   表字典信息
	  */
	 public function getTablesNameById($tables){
		$whereData['id'] = array('in', $tables);
		return $this -> table(C('DB_PREFIX'). 'table_directory') -> where($whereData) -> limit(count($tables)) -> select();
	 }
	 
	 /**
	  * 根据表ID获取字段信息
	  * @param  $tables 表ID
	  * @return array   表字段字典信息
	 */
	 public function getTablesFieldById($tables){
	 	$whereData['tableID'] =  array('in', $tables);
		return $this -> table(C('DB_PREFIX'). 'table_field_directory') -> where($whereData) -> select();
	 }
	 
	 /**
	  *  获取已经设置好的数据源
	  *  @author tlj 2016-04-19
	  *  @return array 数据源
	  */             
	 public function getAllQueryDataSources(){
	 	$queriers = $this -> table(C('DB_PREFIX').'querier') -> field('id, querierName, queryTables, querierConfig') -> select();
		
		//将[querierConfig]存储的Json转成数组,否则[querierConfig]字段会变成字符串
		foreach ($queriers as $key => $value) {
			foreach ($value as $skey => $svalue) {
				if($skey === 'querierConfig')
				  $queriers[$key][$skey] = json_decode($svalue, true);
			}
		}  
		return $queriers;
	 }
	 
	 /**
	 * 获取当前应用下所有的表字典
	 * @author tlj 2016-04-19
	 * @return array 所有的表字典信息
	 */
	 public function getAllTables(){                         
	 	 return $this -> table(C('DB_PREFIX').'table_directory') -> field('id,substring(tableName,8) as tableName,tableTitle') -> select();
	 }
	 
	 /**
	 *  根据数据源ID获取数据
	 *  @author tlj 2016-04-22	
	 */
	 public function queryDataByQid($querierId = 0){
	 	if(empty($querierId))
		   return 0;
		
	 	$where['id'] = $querierId; 
		$querier = $this -> table(C('DB_PREFIX').'querier') -> where($where) -> getField('querierSql');
		//与上同样的效果
		//$querier = $this -> table(C('DB_PREFIX').'querier') -> field('querierSql') -> where($where) -> find();
		
		$querier = json_decode($querier['querierSql'], true);
		$sql = $querier['sql'];
		unset($querier);
		return $this -> query($sql);
	 }
	 
	 /**
	  *  保存查询设置
	  *  @author tlj 20160425
	  *  @param $querierName   查询名称
	  *  @param $querierConfig 查询设置配置文件
	  *  @param $querierId     查询ID  0-新增  非0-修改
	  *  @return array 保存结果
	  */
	 public function saveQuerier($querierName, $querierConfig, $querierId = 0){
	 	
		$result['status'] = 200;
		$result['info'] = '新增成功';
		if($querierId)
			$result['info'] = '修改成功';
			
	 	$tables = array_column($querierConfig, 'formId');
		$selectedField = array_column($querierConfig, 'selectedField');
		$querierWhere = array_column($querierConfig, 'where');
		
		//处理查询字段
		foreach ($selectedField as $tKey => $tValue) {
			foreach ($tValue as $stKey => $stValue) {
				$fields[] = $stValue['fieldId'];
			}
		}
		
		$routineOpts = array('=', '>', '<', '<>', '>=', '<=');  //常规比较符
		$specialOpts = array('like', 'not like', 'in');         //特殊比较符
		
		//处理查询条件
		foreach ($querierWhere as $qKey => $qValue) {
			foreach ($qValue as $sKey => $sValue) {
				$field = $sValue['fieldId'];           //字段名
				$dataType = $sValue['dataType'];       //字段数据类型, 常量[input],系统变量[system],表单控件值[form],数据源字段值[querier]
				$compareChar = $sValue['relation'];    //比较符
				
				//$value = strip_tags(str_check($sValue['value']));  //对用户输入的值进入转义 common.php
				
				//根据数据类型[dataType]获取值
				switch (strtolower($dataType)) {
					case 'input': //常量
						$value = strip_tags(str_check($sValue['value']));  //对用户输入的值进入转义 common.php
						break;
					case 'system': //系统变量分为[用户ID][用户名称][系统时间]
						switch (strtolower($sValue['fieldVal'])) {
							case 'staffid':
								$value = '@@QJWD&STAFFID@@';
								break;
							case 'username':
								$value = '@@QJWD&USERNAME@@';
								break;
							case 'sysdbdatetime':
								$value = '@@QJWD&SYSTEMTIME@@';
							    break;
						}
						break;
					/*case 'querier': //现有数据源,有了多表关联,此处可以屏蔽
					    $value = '[QJWD@QUERIER@1@FIELD]';
					    break;*/
					case 'form':  //表单控件需前端传输
					    $value = '@@QJWD&FORM&TEXTBOX1@@';
					    //$ajaxParam['dataType'] = 'form';
						//$ajaxParam['ctrlName'] = 'TextBox1';
						break;
					case 'pageparam': //页面参数也可直接取
					    $value = '@@QJWD&PAGEPARAM&PARAMNAME@@';
					   // $ajaxParam['dataType'] = 'pageParam';
					  //  $ajaxParam['paramName'] = 'userName';
						break;
				}
				
                //如果是普通操作符
				if(in_array($compareChar, $routineOpts)){
					$field = str_replace('_', '.', $field); //将[_]替换成[.]
					$where[] = "cc_tbfm{$field}{$compareChar}'{$value}'";
				}
				elseif (in_array($compareChar, $specialOpts)) {
					//特殊运算
					switch (strtolower($compareChar)) {
						case 'in':
							$where[] = "cc_tbfm{$field} in ('{$value}')";
							break;
						case 'notin':
						    $where[] = "cc_tbfm{$field} not in ('{$value}')";
							break;
						case 'like':
							$where[] = "cc_tbfm{$field} like '%{$value}%')";
							break;
					}
				}  
				//存储前端调用时需要传入的参数
				//$ajaxParams[] = $ajaxParam;
			}
		}
		
		$multiTableResult = $this -> queryMultiTableData($tables, 0, $fields, $where);
		
		$querierData['querierName'] = $querierName;
		$querierData['flowId'] = 1;
		$querierData['queryTables'] = implode(',', $tables);
		$querierData['querierConfig'] = json_encode($querierConfig);
		//$sql = $multiTableResult['sql'];
		//if(!get_magic_quotes_gpc())
		//	$sql = addslashes($sql);
		$querierData['querierSql'] = $multiTableResult['sql']; //转义sql单引号
		$querierData['updateTime'] = time();
		$querierData['isUsed'] = 0;
		
		if($querierId){ //修改
			$saveResult = $this -> table(C('DB_PREFIX').'querier') -> data($querierData) -> where(array('id' => $querierId)) -> save();
		}
		else { //新增
			$saveResult = $this -> table(C('DB_PREFIX').'querier') -> data($querierData) -> add();
		}
		
		if(!$saveResult){
			$result['status'] = 201;
		    $result['info'] = '新增失败';
			if($querierId)
				$result['info'] = '修改失败';
		}
		unset($multiTableResult, $querierData);  
		return $result;
	 }
     
	 /**
	  * 获取数据组件数据源
	  * @author tlj 2016-04-26
	  * @param  $queryConfig  组件绑定数据源时参数
	  * @return array         查询结果
	  */
     public function queryDataForCompLogic($queryConfig){
     	//{"type":"select","queryId":"1","form":{},"where":"","mask":false}
     	$queryConfig = json_decode($queryConfig, true);
		$querierSql = $this -> table(C('DB_PREFIX').'querier') -> where(array('ID' => $queryConfig['queryId'])) -> getField('querierSql');
		
		switch (strtolower($queryConfig['type'])) {
			case 'select':
                //执行查询时,sql语句中可能存在变量
			    $result = $this -> query($querierSql); //保存时已经对sql进行了转义
				break;
			default:
				break;
		}
		
		unset($queryConfig,$querierSql);
		return $result;
     }
}
?>