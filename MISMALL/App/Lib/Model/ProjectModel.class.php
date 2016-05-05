<?php

/**
 * 表单模型，自定义表单的数据表操作方法
 * @author : 胡志强
 * time : 201410
 */

class ProjectModel extends Model {
	protected $project_id = 0;
	protected $project_name = '';

	/**
	 * 构造函数
	 */
	// public function __construct() {
	//
	// $this->_initialize();
	// }

	/**
	 * 回调方法 初始化模型
	 */
	// protected function _initialize() {
	// if (session('pid')) {
	// $this->project_id = session('pid');
	// } else {
	// echo 0;
	// exit();
	// }
	//
	// $project_info = D('PlatForm')->getAProjectDetails($this->project_id);
	// $this->project_name = $project_info['projectName'];
	// $this->db('p' . $this->project_id, D('PlatForm')->projectDbLink($this->project_id));
	// unset($project_info);
	// }
	//切换数据库
	public function changeDB($project_id) {
		$this -> db('p' . $project_id, D('PlatForm') -> projectDbLink($project_id));
	}

	/**
	 * 获取项目的模块信息
	 * @return	array
	 */
	public function getModuleLists() {
		$mdl_list = $this -> table(C('DB_PREFIX') . 'modules') -> field('ID, moduleName') -> order('ID') -> select();

		return $mdl_list;
	}

	/**
	 * 获取项目的流程信息
	 * @param	int		$mdl_id 模块ID
	 * @return	array
	 */
	public function getFlowLists($mdl_id) {
		if (!$mdl_id) {
			return 0;
		}

		$flow_list = $this -> table(C('DB_PREFIX') . 'workflow') -> where("moduleID=" . $mdl_id) -> field('ID, flowName') -> order('ID') -> select();

		return $flow_list;
	}

	/**
	 * 获取项目的表单信息
	 * @param	int		$flow_id 流程ID
	 * @return	array
	 */
	public function getFormLists($flow_id, $form_type = 0) {
		if (!$flow_id) {
			return 0;
		}

		$frm_lists = $this -> table(C('DB_PREFIX') . 'form_info') -> where("flowID=$flow_id and formType=$form_type") -> field('ID, formTitle') -> order('ID') -> select();

		return $frm_lists;
	}

	/**
	 * 获取当前项目的结构信息
	 * @param	int		$get_form 带出表单结构
	 * @return	array
	 */
	public function getAProjectStructure($get_form = 0, $form_type = 0) {
		$pro_struct = array();
		// 定义项目下列表结构
		$mdl_list = $this -> getModuleLists();
		$i = 0;
		foreach ($mdl_list as $value) {
			$pro_struct[$i]['ID'] = $value['ID'];
			$pro_struct[$i]['moduleName'] = $value['moduleName'];
			$flow_list = $this -> getFlowLists($value['ID']);

			$pro_struct1 = array();
			$j = 0;
			foreach ($flow_list as $value1) {
				$pro_struct1[$j]['ID'] = $value1['ID'];
				$pro_struct1[$j]['flowName'] = $value1['flowName'];
				if ($get_form) {
					// 带出表单结构
					$form_list = $this -> getFormLists($value1['ID'], $form_type);
					$pro_struct1[$j]['child'] = (array)$form_list;
					unset($form_list);
				}
				++$j;
			}
			unset($value1, $flow_list);

			$pro_struct[$i]['child'] = $pro_struct1;
			unset($flow_list);
			++$i;
		}
		unset($value, $mdl_list);

		$pro_struct_info['projectName'] = $this -> project_name;
		$pro_struct_info['child'] = $pro_struct;
		unset($pro_struct);

		return $pro_struct_info;
	}

	/**
	 * 添加模块到当前项目
	 * @param	string	$mdl_name 添加的模块名称
	 * @return	array
	 */
	public function addAModuleForProject($mdl_name) {
		if ($mdl_name == '') {
			return 0;
		}
		// 验证模块名及项目不能为空

		$data['moduleName'] = $mdl_name;
		$data['moduleStatus'] = 1;
		$mdl_id = $this -> table(C('DB_PREFIX') . 'modules') -> data($data) -> add();

		$mdl_info = $data;
		$mdl_info['ID'] = $mdl_id;
		unset($data);

		return $mdl_id ? $mdl_info : 0;
	}

	/**
	 * 添加流程到当前模块
	 * @param	int		$mdl_id 当前模块ID
	 * @param	string	$flow_name 添加流程名称
	 * @return	array
	 */
	public function addAflowForModule($mdl_id, $flow_name) {
		if ($flow_name == '' || $mdl_id == 0) {
			return 0;
		}
		// 验证流程名及模块ID不能为空

		$data['flowName'] = $flow_name;
		$data['moduleID'] = $mdl_id;
		$data['createTime'] = time();
		$flow_id = $this -> table(C('DB_PREFIX') . 'workflow') -> data($data) -> add();

		$flow_info = $data;
		$flow_info['ID'] = $flow_id;
		unset($data);

		return $flow_id ? $flow_info : 0;
	}

	/**
	 * 更新模块名称
	 * @param	int		$mdl_id 待更新模块ID
	 * @param	string	$new_name 新名称
	 * @return	boolean
	 */
	public function updAModuleName($mdl_id, $new_name) {
		if (!$mdl_id) {
			return 0;
		}

		$data['moduleName'] = $new_name;
		$res = $this -> table(C('DB_PREFIX') . 'modules') -> where("ID=" . $mdl_id) -> data($data) -> save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 更新流程名称
	 * @param	int		$flow_id 待更新流程ID
	 * @param	string	$new_name 新名称
	 * @return	boolean
	 */
	public function updAFlowName($flow_id, $new_name) {
		if (!$flow_id) {
			return 0;
		}

		$data['flowName'] = $new_name;
		$res = $this -> table(C('DB_PREFIX') . 'workflow') -> where("ID=" . $flow_id) -> data($data) -> save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 更新表单名称
	 * @param	int		$form_id 表单ID
	 * @return	boolean
	 */
	public function updateFormName($form_id, $form_title) {
		if (!$form_id) {
			return 0;
		}

		$res = $this -> table(C('DB_PREFIX') . 'form_info , ' . C('DB_PREFIX') . 'table_directory') -> where(C('DB_PREFIX') . "form_info.tableName=" . C('DB_PREFIX') . "table_directory.tableName AND " . C('DB_PREFIX') . "form_info.ID=" . $form_id) -> data(array(C('DB_PREFIX') . "form_info.formTitle" => $form_title, C('DB_PREFIX') . "table_directory.tableTitle" => $form_title)) -> save();

		return $res ? 1 : 0;
	}

	/**
	 * 获取指定表单登记信息
	 * @param	int/string		$form 	表单ID/表单table
	 * @return	array
	 */
	public function getFormInfo($form) {
		if (!$form) {
			return 0;
		}

		$where = is_numeric($form) ? "ID=" . $form : "tableName='" . $form . "'";
		$form_info = $this -> table(C('DB_PREFIX') . 'form_info') -> where($where) -> field('ID, flowID, formTitle, tableName, formData') -> find();

		return $form_info;
	}

	/**
	 * 获取指定表单字段信息
	 * @param	int		$id 表单ID
	 * @return	array
	 */
	public function getAFormFiledsInfo($formid) {
		if (!$formid) {
			return 0;
		} else if ($formid === -1) {
			$form_info = array( array('fieldName' => 'userPhoto', 'fieldTitle' => '头像'), array('fieldName' => 'openid', 'fieldTitle' => '粉丝ID'), array('fieldName' => 'userName', 'fieldTitle' => '昵称'), array('fieldName' => 'sex', 'fieldTitle' => '性别'), array('fieldName' => 'country', 'fieldTitle' => '国家'), array('fieldName' => 'province', 'fieldTitle' => '省份'), array('fieldName' => 'city', 'fieldTitle' => '城市'), );
		} else if ($formid === -2) {
			$form_info = array( array('fieldName' => 'WeId', 'fieldTitle' => '微信ID'), array('fieldName' => 'siteId', 'fieldTitle' => '网站ID'), array('fieldName' => 'pageId', 'fieldTitle' => '页面ID'), array('fieldName' => 'layId', 'fieldTitle' => '层ID'), array('fieldName' => 'pid', 'fieldTitle' => '父级ID'), array('fieldName' => 'openid', 'fieldTitle' => '用户openid'), array('fieldName' => 'userName', 'fieldTitle' => '用户名称'), array('fieldName' => 'code', 'fieldTitle' => '随机标识码'), array('fieldName' => 'shareTime', 'fieldTitle' => '分享时间'), array('fieldName' => 'Latitude', 'fieldTitle' => '纬度'), array('fieldName' => 'Longitude', 'fieldTitle' => '经度'), array('fieldName' => 'Precision', 'fieldTitle' => '地理位置'), array('fieldName' => 'Province', 'fieldTitle' => '省'), array('fieldName' => 'City', 'fieldTitle' => '市'), array('fieldName' => 'District', 'fieldTitle' => '区'), array('fieldName' => 'Address', 'fieldTitle' => '地址'), );
		} else if ($formid === -3) {
			$form_info = array( array('fieldName' => 'layId', 'fieldTitle' => '层ID'), array('fieldName' => 'siteId', 'fieldTitle' => '应用ID'), array('fieldName' => 'pageId', 'fieldTitle' => '页面ID'), array('fieldName' => 'openid', 'fieldTitle' => '微信用户openid'), array('fieldName' => 'extend', 'fieldTitle' => '表单ID'), array('fieldName' => 'data', 'fieldTitle' => '层数据'), array('fieldName' => 'addTime', 'fieldTitle' => '新增时间'), array('fieldName' => 'updateTime', 'fieldTitle' => '修改时间'), );
		} else if ($formid === -4) {
			$form_info = array( array('fieldName' => 'productId', 'fieldTitle' => '商品表ID'), array('fieldName' => 'productName', 'fieldTitle' => '商品名称'), array('fieldName' => 'productPrice', 'fieldTitle' => '单价'), array('fieldName' => 'productNumber', 'fieldTitle' => '商品数量'), array('fieldName' => 'orderSn', 'fieldTitle' => '订单号'), array('fieldName' => 'orderPrice', 'fieldTitle' => '订单价格'), array('fieldName' => 'openid', 'fieldTitle' => '用户ID'), array('fieldName' => 'isPay', 'fieldTitle' => '是否支付'), array('fieldName' => 'updateTime', 'fieldTitle' => '修改时间'), );
		} else {
			$form_info = $this -> table(C('DB_PREFIX') . 'table_field_directory') -> where("formID=$formid") -> field('fieldName, fieldTitle, controlType') -> select();
		}

		return $form_info;
	}

	/**
	 * 获取表单字典信息
	 * @param		string		$table_name 表单数据表名称
	 * @return		array
	 */
	public function getFrmDictInfo($table_name) {
		if (!$table_name || $table_name == '') {
			return 0;
		}

		$frm_dict_info = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("tableName='" . $table_name . "'") -> field('ID, tableName, TableTitle, flowID') -> find();

		return $frm_dict_info;
	}

	/**
	 * 保存表单信息
	 * @param	int 	$id 表单ID
	 * @param	int 	$flow_id 流程编号
	 * @param	string 	$form_title 表单标题
	 * @param	string 	$json_data 表单设置json数据信息
	 * @return	boolean
	 */
	public function saveFormInfo($flow_id, $id, $form_title, $json_data) {

		if ($id || $json_data != '') {
			// 修改表单
			return $this -> updFormStructInfo($id, $json_data);
		} else {
			// 添加表单
			return $this -> addFormStructInfo($flow_id, $form_title);
		}
	}

	/**
	 * 添加表单结构信息
	 * @param	int 	$flow_id 表单所属流程编号
	 * @param	string 	$xml_str 表单设置xml数据信息
	 * @param	string  $modulesId  模块ID
	 * @return	int		$id 添加成功返回表单ID
	 */
	public function addFormStructInfo($flow_id, $form_title) {
		if (!$flow_id || $form_title == '') {
			return 0;
		}
		// 1，添加表单的 form_info 登记信息
		$data['formTitle'] = $form_title;
		$data['mainFormID'] = 0;
		$data['flowID'] = $flow_id;
		$data['createUser'] = I('session.uid', 0);
		$data['createTime'] = time();
		$data['tableName'] = 'cc_tbfm' . date('YmdHis', time()) . rand(1000, 9999);
		$id = $this -> table(C('DB_PREFIX') . 'form_info') -> data($data) -> add();
		$form_table_name = $data['tableName'];
		unset($data);

		// 2，添加表单字典表 table_directory 信息
		$data['tableName'] = $form_table_name;
		$data['tableTitle'] = $form_title;
		$data['flowID'] = $flow_id;
		$data['isBaseTable'] = 0;
		$data['isMasterTable'] = 1;
		$this -> table(C('DB_PREFIX') . 'table_directory') -> data($data) -> add();
		unset($data);

		// 3，建立表单数据表
		$sql = "CREATE TABLE IF NOT EXISTS " . $form_table_name . " (ID int(12) unsigned NOT NULL AUTO_INCREMENT,";
		$sql .= " hitNum int(12) unsigned NOT NULL DEFAULT 0, enterUser int(12) unsigned NOT NULL DEFAULT 0,";
		$sql .= " enterTime int(8) unsigned NOT NULL DEFAULT 0, shStatus tinyint(4) unsigned NOT NULL DEFAULT 0,";
		$sql .= " PRIMARY KEY (ID)) ENGINE=InnoDB DEFAULT CHARSET=utf8";
		$this -> execute($sql);
		unset($sql);

		return $id ? $id : 0;
	}

	/**
	 * 更新表单结构信息
	 * @param	int			$id 表单ID
	 * @param	string		$json_data 表单设置json数据信息
	 * @return	bool		返回表单更新成功标识
	 */
	public function updFormStructInfo($id, $json_data) {
		if ($json_data == '') {
			return 0;
		}

		// 1，将json对象化
		$jsonObj_all = json_decode($json_data);

		// 循环表单设置数据，依次解析
		foreach ($jsonObj_all as $id => $jsonObj) {
			$form_json_data = json_encode_cn($jsonObj);
			// 2，更新表单 form_info 登记信息
			$data['alterUser'] = I('session.uid', 0);
			$data['alterTime'] = time();
			//$data['formData'] = json_addslashes($form_json_data);
			$data['formData'] = $form_json_data;
			$tableTitle = $jsonObj->tabs->tab1->page;
			$data['formTitle'] = $tableTitle;
			//print_r($jsonObj->tabs->tab1->page);
			$this -> table(C('DB_PREFIX') . 'form_info') -> where("ID=" . $id) -> data($data) -> save();
			S("formJson_" . $this -> project_id . '_' . $id, $data['formData']);
			// 修改表单json数据缓存
			unset($data);

			$frm_info = $this -> getFormInfo($id);
			// 获取更新后表单登记信息
			//更新table_directory 中的表名
			$updateData = array(
				'tableTitle' =>$tableTitle
			);
			$this -> table(C('DB_PREFIX') . 'table_directory') -> where("tableName='" . $frm_info['tableName'] . "'") -> data($updateData) -> save();
			unset($updateData,$tableTitle);
			// 获取表单 table_directory tableID
			$form_table_id = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("tableName='" . $frm_info['tableName'] . "'") -> getField('ID');

			// 4，更新表单字段 table_field_directory 信息
			$this -> table(C('DB_PREFIX') . 'table_field_directory') -> where("formID=" . $id) -> delete();
			$notCtrlArr = array('BUTTON', 'COLBOX', 'IMAGEBOX', 'TEXT', 'COLUMN', 'customComponent', 'pageForm');
			foreach ($jsonObj->controlLists as $key => $value) {
				
				if (!in_array($value -> ctrlType, $notCtrlArr)) {
					$data['formID'] = $id;
					$data['tableID'] = $form_table_id;
					$data['fieldName'] = $key;
					$data['fieldTitle'] = $value -> attrs -> general -> ctrlTitle;
					$data['controlType'] = $value -> ctrlType;
					$this -> table(C('DB_PREFIX') . 'table_field_directory') -> data($data) -> add();
					unset($data);
				}
			}
			unset($value);

			// 5，更新表单数据表结构
			$sql = "DESC " . $frm_info['tableName'];
			// 读取表单数据表结构信息
			$frm_fields_info = $this -> query($sql);
			unset($sql);

			// 获取表单旧的控件字段名称信息，压入堆栈
			$old_frm_field_arr = array();
			foreach ($frm_fields_info as $field_info) {
				array_push($old_frm_field_arr, $field_info['Field']);
			}
			unset($field_info, $frm_fields_info);

			$new_frm_field_arr = array('ID', 'hitNum', 'enterUser', 'enterTime', 'shStatus');
			foreach ($jsonObj->controlLists as $key => $value) {
				if (!in_array($value -> ctrlType, $notCtrlArr)) {
					$field_name = $key;
				
					array_push($new_frm_field_arr, $field_name);
					// 设置新的控件字段名称堆栈
					switch ($value->ctrlType) {
						case 'CCTextBox' :
							if ($value -> attrs -> validate -> textFormat == 'integer') {
								$field_type = 'int(10)';
							} else if ($value -> attrs -> validate -> textFormat == 'decimal') {
								$field_type = 'float';
							} else {
								$field_type = 'varchar(255)';
							}

							if ($field_name == 'CCTextBoxCover')// 悬浮小球
							{
								$field_type = 'int(10)';
							}
							$jsonObj->hasInput = 1;
							break;
						case 'CCTime' :
							$field_type = 'varchar(30)';
							$jsonObj->hasInput = 1;
							break;
						//$field_type = 'timestamp';
						//break;
						case 'CCRemark' :
						case 'CCUpload' :
						case 'CCEditor' :
						case 'CCPageBrowse' :
							$field_type = 'text';
							break;
						case 'BUTTON' :
						case 'COLBOX' :
						case 'IMAGEBOX' :
						case 'TEXT' :
						case 'COLUMN' :
						case 'customComponent' :
						case 'pageForm' :
							break;
						default :
							$field_type = 'varchar(255)';
							$jsonObj->hasInput = 1;
							break;
					}

					// 修改或是添加表单数据表控件字段信息
					if (in_array($field_name, $old_frm_field_arr)) {
						$sql = "ALTER TABLE " . $frm_info['tableName'] . " CHANGE " . $field_name . " " . $field_name . " " . $field_type . " NOT NULL";
					} else {
						$sql = "ALTER TABLE " . $frm_info['tableName'] . " ADD " . $field_name . " " . $field_type . " NOT NULL";
					}
					$this -> execute($sql);
					unset($sql);
				}
				
				// 添加数据源调用或是动作调用记录
				$databind = (string)$value -> attrs -> data -> dataBind -> type;
				if ($databind) {
					$data['formID'] = $id;
					$data['formControl'] = $key;
					$data['dataSetID'] = (string)$value -> attrs -> data -> dataBind -> value -> id;
					$data['queryField'] = (string)$value -> attrs -> data -> dataBind -> value -> queryField;
					$data['addTime'] = time();
					$this -> table(C('DB_PREFIX') . 'action_records') -> data($data) -> add();
					unset($data);
				}
				$operations = $value -> operations;
				if ($operations) {
					//dump($operations);
					foreach ($operations as $actType => $actID) {
						$data['formID'] = $id;
						$data['formControl'] = $key;
						$data['actionID'] = $actID;
						$data['addTime'] = time();
						$this -> table(C('DB_PREFIX') . 'action_records') -> data($data) -> add();
						//echo $this -> getLastSql();
						unset($data);
					}
				}

			}
			unset($value);
			//重新保存结构  新增了是否有输入控件信息；
				$data_jsons = json_encode($jsonObj);
				$datas['formData'] = $data_jsons;
				$res = $this -> table(C('DB_PREFIX') . 'form_info') -> where("ID=" . $id) -> data($datas) -> save();
			// 删除表单数据表中已经删除的控件的字段
			foreach ($old_frm_field_arr as $old_field_value) {
				if (!in_array($old_field_value, $new_frm_field_arr)) {
					$sql = "ALTER TABLE " . $frm_info['tableName'] . " DROP column " . $old_field_value;
					//print_r($sql);
					//exit;
					$this -> execute($sql);
					unset($sql);

					// 删除已不存在控件的动作事件
					$this -> delControlAction($id, $old_field_value);
				}
			}
			unset($old_field_value, $old_tab_field_arr, $new_tab_field_arr);
		}
		unset($id, $jsonObj, $jsonObj_all);

		return 1;
	}

	/**
	 * 删除指定表单
	 * @param	int		$form_id 表单ID
	 * @return	boolean
	 */
	public function delAForm($form_id, $page_id) {
		if (!$form_id) {
			return 0;
		}

		$frm_info = $this -> table(C('DB_PREFIX') . 'form_info') -> where("ID=$form_id OR mainFormID=$form_id") -> field('ID, tableName') -> order('ID') -> select();

		foreach ($frm_info as $fvalue) {
			// 1，删除表单数据表
			$sql = "DROP TABLE IF EXISTS " . $fvalue['tableName'];
			$this -> execute($sql);
			unset($sql);

			// 2 删除表单所有字段信息表
			$this -> table(C('DB_PREFIX') . 'table_field_directory') -> where("formID=" . $fvalue['ID']) -> delete();

			// 3，删除表单字典信息
			$this -> table(C('DB_PREFIX') . 'table_directory') -> where("tableName='" . $fvalue['tableName'] . "'") -> delete();

			// 4，删除表单关联的数据源
			$this -> table(C('DB_PREFIX') . 'querier') -> where("queryTables like '%" . $fvalue['tableName'] . "%'") -> delete();
		}
		unset($fvalue, $frm_info);

		// 5, 删除表单控件的动作事件
		$this -> delControlAction($form_id);

		// 6，删除表单登记信息
		$this -> table(C('DB_PREFIX') . 'form_info') -> where("ID=$form_id or mainFormID=$form_id") -> delete();

		// 7 删除设置的页面参数
		$this -> table(C("DB_PREFIX") . 'link_params') -> where("fromPageID = '$page_id' or  toPageID = '$page_id'") -> delete();

		// 8 删除页面模板内容
		$this -> table(C("DB_PREFIX") . 'site_template') -> where("name = '$page_id'") -> delete();
		return 1;
	}

	/**
	 * 删除指定表单动作事件
	 * @param	int		$form_id 表单ID
	 * @return boolean
	 */
	public function delControlAction($form_id) {
		if (!$form_id) {
			return 0;
		}

		$form_data = $this -> table(C('DB_PREFIX') . 'form_info') -> where("ID=" . $form_id) -> getField('formData');
		$jsonObj = json_decode($form_data);
		unset($form_data);

		foreach ($jsonObj->controlLists as $control_list) {
			foreach ($control_lists->operations as $operation) {
				$action_data = $this -> table(C('DB_PREFIX') . 'form_action') -> where("ID=" . $operation) -> getField('actionData');
				$action_data = json_decode($action_data);
				foreach ($action_data->actionList as $key => $action_list) {
					$this -> table(C('DB_PREFIX') . 'link_params') -> where("actionID='" . $key . "' and toPageID='" . $action_list -> ctrl -> pageId . "'") -> delete();
				}
				unset($action_list, $action_data);

				$this -> table(C('DB_PREFIX') . 'form_action') -> where("ID=" . $operation) -> delete();
			}
			unset($operation);
		}
		unset($control_list, $jsonObj);

		return 1;
	}

	/**
	 * 检查保存表单数据记录的唯一性
	 * @param	int		$form_id	表单ID
	 * @param	int		$data_id 	数据行ID
	 * @param	string	$field_name  表单控件字段名称
	 * @param	string	$field_value 表单控件字段值
	 * @return	int		返回检查结果，允许写入返回1，不允许返回0
	 */
	public function chkFormDataRecord($form_id, $data_id = 0, $field_name = '', $field_value = '') {
		if ($form_id == 0) {
			return 0;
		}

		$frm_info = $this -> getFormInfo($form_id);
		$record_id = $this -> table($frm_info['tableName']) -> where($field_name . "='" . $field_value . "'") -> getField('ID');
		unset($frm_info);

		return $record_id && $record_id != $data_id ? 0 : 1;
	}

	/**
	 * 保存表单数据信息
	 *
	 * @param	int 	$form_id 表单ID
	 * @param	int		$frm_data_id 表单数据记录ID
	 * @param	json	$form_data 表单数据信息，json对象
	 * @param	boolean $is_sync 是否同步
	 *
	 * @return	bool 	返回数据保存成功标识
	 */
	public function saveFormDataInfo($form_id, $frm_data_id = 0, $form_data = array(), $is_sync = true) {
		//跨项目数据同步
		if ($is_sync) {
			//D('App://Qywx/ProjectRelation')->syncFormData($form_id, $frm_data_id, $form_data);
		}
		$frm_info = $this -> getFormInfo($form_id);

		if (!$frm_data_id) {
			$frm_data['enterUser'] = I('session.uid', 0);
			$frm_data['enterTime'] = time();
			$frm_data_id = $this -> table($frm_info['tableName']) -> data($frm_data) -> add();
		}

		foreach ($form_data as $key => $value) {
			if (substr($key, 0, 8) === 'CCUpload') {
				$c_value = str_replace("\\/", "/", json_encode_cn($value));
				$frm_data[$key] = $c_value;
			} else if (substr($key, 0, 7) === 'CCImage') {
				$isCompressPic = strpos($frm_info['formData'], "isCompressPic");
				// 解析图片是否需要压缩
				$frm_data[$key] = $value;
				/*$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				 $file_name = '';
				 for ($i = 0; $i < 12; $i++) {
				 $file_name .= $chars[mt_rand(0, strlen($chars) - 1)];
				 }
				 $save_path = date('Y', time()) . "/" . date('m', time()) . "/";
				 D('PlatForm')->createFileDir(C('UPLOAD_PATH') . $save_path);

				 if (substr($value, 1, 7) === 'uploads') {
				 if (strpos($value, "_150_auto")) {
				 if ($isCompressPic) {
				 // 压缩上传图片
				 $frm_data[$key] = $value;
				 } else {
				 $img_path_arr = explode('.', $value);
				 $img_path_arr1 = explode('_', $img_path_arr[0]);
				 $frm_data[$key] = $img_path_arr1[0] . "." . $img_path_arr[1];
				 unset($img_path_arr1, $img_path_arr);
				 }
				 } else {
				 if ($isCompressPic) {
				 // 压缩上传图片
				 $img_thumb = getThumbImage(substr($value, 9), 150, 'auto', false, false);
				 $frm_data[$key] = $img_thumb ? substr($img_thumb, 1) : '';
				 } else {
				 $frm_data[$key] = $value;
				 }
				 }

				 } else {
				 preg_match('/^(data:\s*image\/(\w+);base64,)/', $value, $result);
				 $new_file = C('UPLOAD_PATH') . $save_path . $file_name . "." . $result[2];
				 $save_result = file_write($new_file, base64_decode(str_replace($result[1], '', $value)));
				 $frm_data[$key] = $new_file ? substr($new_file, 1) : '';

				 if ($isCompressPic) {
				 // 压缩上传图片
				 $img_thumb = getThumbImage($save_path . $file_name . "." . $result[2], 150, 'auto', false, false);
				 $frm_data[$key] = $img_thumb ? substr($img_thumb, 1) : '';
				 }
				 }*/
			} else {
				$frm_data[$key] = $value;
			}
		}
		unset($value);

		$this -> table($frm_info['tableName']) -> where("ID=" . $frm_data_id) -> data($frm_data) -> save();
		unset($frm_data, $frm_info);

		return 1;
	}

	/**
	 * 验证表单标题名称
	 * @param	int			$flow_id 表单所处流程ID
	 * @param	string		$form_name 表单名称
	 * @return	boolean
	 */
	public function chkFormTitle($flow_id, $form_name = '') {
		if (!$flow_id || $form_name == '') {
			return 0;
		}

		$res = $this -> table(C('DB_PREFIX') . 'form_info') -> where("flowID=$flow_id AND formTitle='$form_name'") -> field('ID') -> find();

		return $res ? 0 : 1;
	}

	/**
	 * 获取表单字段信息
	 * @param	int		$id 表单ID/tableID
	 * @return array
	 */
	public function getFormFieldInfo($id) {
		if ($id === 0 || $id === '') {
			return 0;
		}

		$field_info = $this -> table(C('DB_PREFIX') . 'table_field_directory') -> where("formID=$id OR tableID=$id") -> field('ID, fieldName, fieldTitle, controlType') -> order('ID') -> select();

		return $field_info;
	}

	/**
	 * 获取表单存储数据记录数
	 * @param	int		$form_id 表单ID
	 * @return	int
	 */
	public function getFormDataRecordsNum($form_id = 0) {
		if (!$form_id) {
			return 0;
		}

		$frm_info = $this -> getFormInfo($form_id);
		$frm_data_num = $this -> table($frm_info['tableName']) -> getField('count(ID) as Num');
		unset($frm_info);

		return $frm_data_num;
	}

	/**
	 * 获取前端表单存储数据信息
	 *
	 * @param	int		$form_id 表单ID
	 * @param	int		$page 当前页面，默认第一页
	 * @param	int		$records 单页显示条数，默认50
	 * @param	string	$fields 查询字段 多字段用,分隔
	 *
	 * @return array 	$form_info 表单存储数据信息 二维数组
	 */
	public function getFormDataInfo($form_id, $page = 1, $records = 50, $fields = '', $cond_value = '') {
		if (!$form_id) {
			return 0;
		}

		$frm_info = $this -> getFormInfo($form_id);
		$this -> table($frm_info['tableName']);
		if (empty($fields)) {
			//$fields = $this -> getAFormControlList($form_id);

			$this -> field(array('hitNum', 'enterUser', 'enterTime', 'shStatus'), true);
		} else {
			array_unshift($fields, 'ID');
			$this -> field($fields);
		}
		if (is_array($cond_value) && $cond_value) {
			$where = array();
			foreach ($cond_value as $field => $value) {
				$where[$field] = $value;

			}
		}
		$this -> where($where);

		if ($page) {
			$this -> limit($records) -> page($page);
		}
		$this -> order('ID DESC');
		$frm_data = $this -> select();
		//echo $this -> getLastSql();
		unset($frm_info);

		return $frm_data;
	}

	/**
	 * 删除前端的表单存储信息记录
	 * @param	int		$form_id 要删除数据的表单ID
	 * @param 	array 	$id_arr 要删除的表单数据ID的集合
	 * @return	boolean
	 */
	public function delFormDataRecord($form_id, $ids_arr = array()) {
		if (!$form_id || empty($ids_arr)) {
			return 0;
		}

		$frm_info = $this -> getFormInfo($form_id);
		$tabs_table_info = $this -> table(C('DB_PREFIX') . 'form_info') -> where("mainFormID=" . $form_id) -> field('tableName') -> order('ID') -> select();
		// 获取表单中表格的数据表名称

		foreach ($ids_arr as $value) {
			foreach ($tabs_table_info as $tab_table_info) {
				$this -> table($tab_table_info['tableName']) -> where("formDataAddID=" . $value) -> delete();
			}
			unset($tab_table_info);

			$this -> table($frm_info['tableName']) -> where("ID=" . $value) -> delete();
		}
		unset($value);

		return 1;
	}

	/**
	 * 获取表单单条记录详细信息
	 *
	 * @param	int		$form_id 表单ID
	 * @param	int		$record_id 表单记录ID
	 * @param	string	$fields 查询字段 多字段用,分隔
	 *
	 * @return	array 	返回单条记录详细信息
	 */
	public function getAFormDataInfo($form_id, $record_id, $fields = '') {
		if ($form_id * $record_id == 0) {
			return 0;
		}

		$frm_info = $this -> getFormInfo($form_id);
		$this -> table($frm_info['tableName']);
		if (empty($fields)) {
			$this -> field(array('hitNum', 'enterUser', 'enterTime', 'shStatus'), true);
		} else {
			array_unshift($fields, 'ID');
			$this -> field($fields);
		}
		$frm_data = $this -> where("ID=" . $record_id) -> find();
		unset($frm_info);

		return $frm_data;
	}

	/**
	 * 保存控件的数据操作动作
	 * @param	int				$id 当前表单动作ID
	 * @param	string			$json_data 数据操作的json设置数据
	 * @return	int/boolean		添加成功返回数据ID，修改返回记录修改成功与否标识
	 */
	public function saveFormActionData($id, $json_data = '') {
		if ($json_data == '') {
			if ($id === 0) {
				return 0;
			}

			$res = $this -> table(C('DB_PREFIX') . 'form_action') -> where("ID=" . $id) -> delete();
		} else {
			$data['actionData'] = json_addslashes($json_data);
			$data['addTime'] = time();

			if ($id === 0) {
				$res = $this -> table(C('DB_PREFIX') . 'form_action') -> data($data) -> add();
			} else {
				$res = $this -> table(C('DB_PREFIX') . 'form_action') -> where("ID=" . $id) -> data($data) -> save();
			}
			unset($data);
		}

		return $res ? $res : 0;
	}

	/**
	 * 获取控件的动作设置
	 * @param	int			$id 动作ID
	 * @return	array		返回动作设置数据
	 */
	public function getFormActionData($id) {
		if (!$id) {
			return 0;
		}

		$action_info = $this -> table(C('DB_PREFIX') . 'form_action') -> where("ID=" . $id) -> field('ID, actionData') -> find();

		return $action_info;
	}

	/**
	 * 根据得到的参数更新数据
	 * @param	string		updatetableid 表单  updatetablecid 控件 updatetype 类型  updatevalue 值
	 *                      condition 条件控件   symbol 条件符号     conditionval 条件值
	 * @return	stirng 		返回数据
	 */
	public function getUpdateDataM($updatetableid, $updatetablecid, $updatetype, $updatevalue, $condition, $symbol, $conditionval) {
		if ($updatetableid == '' || $updatetablecid == '' || $updatetype == '' || $updatevalue == '') {
			return 0;
		}

		switch ($symbol) {
			case '1' :
				$symbol = '=';
				break;
			case '2' :
				$symbol = '>';
				break;
			case '3' :
				$symbol = '<';
				break;
			case '4' :
				$symbol = 'like';
				break;
		}
		$frm_table = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("ID='$updatetableid'") -> getField('tableName');
		if ($symbol === 'like') {
			switch ($updatetype) {
				case 'form' :
				case 'sysParam' :
				case 'string' :
					$res = $this -> table($frm_table) -> where("$condition like '%$conditionval%'") -> setField($updatetablecid, $updatevalue);
					break;
				case '+' :
					if (is_numeric($updatevalue)) {
						$res = $this -> table($frm_table) -> where("$condition like '%$conditionval%'") -> setInc($updatetablecid, $updatevalue);
					}
					break;
				case '-' :
					if (is_numeric($updatevalue)) {
						$res = $this -> table($frm_table) -> where("$condition like '%$conditionval%'") -> setDec($updatetablecid, $updatevalue);
					}
					break;
			}
		} else {
			switch ($updatetype) {
				case 'form' :
				case 'sysParam' :
				case 'string' :
					$res = $this -> table($frm_table) -> where("$condition $symbol '$conditionval'") -> setField($updatetablecid, $updatevalue);
					break;
				case '+' :
					if (is_numeric($updatevalue)) {
						$res = $this -> table($frm_table) -> where("$condition $symbol '$conditionval'") -> setInc($updatetablecid, $updatevalue);
					}
					break;
				case '-' :
					if (is_numeric($updatevalue)) {
						$res = $this -> table($frm_table) -> where("$condition $symbol '$conditionval'") -> setDec($updatetablecid, $updatevalue);
					}
					break;
			}
		}
		return $res ? 1 : 0;
	}

	/**
	 * 根据formid得到tableid
	 * @param	int			$formid
	 * @return	int
	 */
	public function getTableIdByFormId($formid) {
		if (!$formid) {
			return 0;
		}

		$table_id = $this -> table(C('DB_PREFIX') . 'table_directory AS T') -> join(C('DB_PREFIX') . 'form_info AS F ON F.tableName=T.tableName') -> where("F.ID=" . $formid) -> getField('T.ID');

		return $table_id;
	}

	/**
	 * 根据tableid得到formid
	 * @param	int			$tableid
	 * @return	int
	 */
	public function getFormIdByTableId($tableid) {
		if (!$tableid) {
			return 0;
		}

		$form_id = $this -> table(C('DB_PREFIX') . 'table_directory AS T') -> join(C('DB_PREFIX') . 'form_info AS F ON F.tableName=T.tableName') -> where("T.ID=" . $tableid) -> getField("F.ID");

		return $form_id;
	}

	/**
	 * 根据tableid获取表单信息
	 * @param	string		$tableid 表单tableid
	 * @return	array
	 */
	public function getFormTableByTableId($tableid) {
		if (!$tableid) {
			return 0;
		}

		$table_info = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("ID=" . $tableid) -> field('tableName, tableTitle, flowID') -> find();

		return $table_info;
	}

	/**
	 * 根据表单ID和控件ID获取控件名称
	 * @param	int		$tableId 表单ID
	 * @param	string	$columnId 控件ID
	 * @return	string
	 */
	public function getColumnName($tableId, $columnId) {
		if (is_null($tableId) || empty($tableId) || is_null($columnId) || empty($columnId)) {
			return 0;
		}

		$table_ID = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("tableName='$tableId'") -> getField('ID');
		if (!$table_ID) {
			return 0;
		}

		$columnName = $this -> table(C('DB_PREFIX') . 'table_field_directory') -> where("tableID='$table_Id' and fieldName='$columnId'") -> getField('fieldTitle');

		return $columnName ? $columnName : '';
	}

	/**
	 * 删除指定接口
	 * @param	int		$interface_id 接口ID
	 * @return boolean
	 */
	public function delAInterface($interface_id) {
		if (!$interface_id) {
			return 0;
		}

		$res = $this -> table(C('DB_PREFIX') . 'interface') -> where("ID=" . $interface_id) -> delete();

		return $res ? 1 : 0;
	}

	/**
	 * 获取接口数据源ID
	 * @param	int		$接口ID
	 * @return string
	 */
	public function getDataSourceId($interface_id) {
		if ($interface_id == 0) {
			return 0;
		}

		$dataSourceID = M('interface') -> where("ID=$interface_id") -> getField('dataSourceID');

		return $dataSourceID ? $dataSourceID : '';
	}

	/**
	 * 获取当前流程发出的所有的接口请求
	 * @param   string  $flowid 流程ID
	 * @return  array
	 */
	public function getInterfaceListByFlowId($flowid) {
		if ($flowid == '') {
			return 0;
		}

		$interface_list = M('interface') -> where("flowID='$flowid'") -> field('ID, interfaceID, interfaceName, flowID, flowName,fixState') -> order('ID') -> select();

		return $interface_list ? $interface_list : array();
	}

	/**
	 * 获取单选、多选、下列的显示值
	 * @param	int/string	$form 表单ID/表单数据表
	 * @param	string		$field_name 字段名
	 * @param	string		$field_value 字段存储值
	 * @return	string
	 */
	public function getFieldShowValue($form, $field_name, $field_value) {
		if (!$form || $field_value == '') {
			return $field_value;
		}

		if (S("$this->project_id.$form.$field_name")) {
			if (S("$this->project_id.$form.$field_name") === 'dataSource') {
				return $field_value;
			}

			$field_items = json_decode(S("$this->project_id.$form.$field_name"));
		} else {
			$form_info = $this -> getFormInfo($form);
			$json_obj = json_decode($form_info['formData']);
			unset($form_info);
			$field_items = $json_obj -> controlLists -> $field_name -> attrs -> item -> items;
			$field_data_from = (string)$json_obj -> controlLists -> $field_name -> attrs -> data -> dataBind -> type;

			$field_data_from ? S("$this->project_id.$form.$field_name", $field_data_from) : S("$this->project_id.$form.$field_name", json_encode_cn($field_items));
		}
		$field_value_show_array = array();
		$field_value_array = explode(',', $field_value);
		foreach ($field_value_array as $value) {
			array_push($field_value_show_array, $field_items -> $value);
		}
		unset($value, $field_value_array);

		$field_value_show = '';
		$field_value_show = implode(', ', $field_value_show_array);
		unset($field_value_show_array, $field_items, $json_obj);

		return $field_value_show;
	}

	/**
	 * 获取组件列表
	 * @param	int		$type
	 * @return array
	 */
	public function getComponentList($type = 0) {
		$comp_lists = $this -> table(C('DB_PREFIX') . 'components') -> where("type=" . $type) -> order('ID DESC') -> select();

		return $comp_lists;
	}

	/**
	 * 获取组件详细
	 *
	 * @param 	mixed 	$name 组件标识或者ID
	 * @param	array
	 */
	public function getComponentInfo($name) {
		if (is_numeric($name)) {
			$where['ID'] = $name;
		} else {
			$where['name'] = $name;
		}

		$components_info = $this -> table(C('DB_PREFIX') . 'components') -> where($where) -> find();

		if ($components_info && $components_info['data']) {
			$components_info['data'] = unserialize($components_info['data']);
		}

		return $components_info;
	}

	/**
	 * 保存组件
	 * @param 	array $post_data
	 * @return int
	 */
	public function saveComponent($post_data) {
		$data = array('name' => isset($post_data['name']) ? trim($post_data['name']) : '', 'title' => isset($post_data['title']) ? trim($post_data['title']) : '', 'data' => isset($post_data['data']) ? serialize($post_data['data']) : '', 'type' => isset($post_data['type']) ? intval($post_data['type']) : '', 'addTime' => time(), );

		if (empty($data['name'])) {
			return false;
		}

		if ($comp_info = $this -> getComponentInfo($data['name'])) {
			$comp_id = $comp_info['ID'];
			$this -> table(C('DB_PREFIX') . 'components') -> where(array('ID' => $comp_id)) -> data($data) -> save();
		} else {
			$set['addTime'] = time();
			$comp_id = $this -> table(C('DB_PREFIX') . 'components') -> data($data) -> add();
		}
		unset($data);

		return $comp_id;
	}

	/**
	 * 删除组件
	 * @param mixed $name 组件标识或者ID
	 * @return	boolean
	 */
	public function deleteComponent($name) {
		if (is_numeric($name)) {
			$where['ID'] = $name;
		} else {
			$where['name'] = $name;
		}
		$res = $this -> table(C('DB_PREFIX') . 'components') -> where($where) -> delete();

		return $res ? 1 : 0;
	}

	/*
	 * 删除页面的设置的跳转参数
	 * @param mixed $name 组件标识或者ID
	 * @return	boolean
	 * */
	public function deleteLinkParam($page, $site_id) {
		$where['fromPageID'] = $page;
		$res = $this -> table(C('DB_PREFIX') . 'link_params') -> where($where) -> delete();
		return $res ? 1 : 0;
	}

	/**
	 * 获取输入的字段的模糊匹配信息
	 * @param	string	$keyword 输入的字段信息
	 * @param	string	$flow_id 流程ID
	 * @return	array	字段信息
	 */
	public function getAFlowFieldsInfo($flow_id, $keyword = '') {
		if ($flow_id == '') {
			return 0;
		}

		$keyword_field = $keyword === '' ? "" : " AND F.fieldTitle like '%$keyword%'";
		$field_titles = $this -> table(C('DB_PREFIX') . 'table_field_directory AS F') -> join(C('DB_PREFIX') . 'table_directory AS T on T.ID=F.tableID') -> where("T.flowID='$flow_id' $keyword_field") -> distinct(TRUE) -> field('F.fieldTitle,T.tableTitle,T.tableName,F.fieldName') -> select();

		return $field_titles;
	}

	/**
	 * 获取当前流程下的数据表
	 * @param	string	$flow_id 流程ID
	 * @return	array	字段信息
	 */
	public function getAFlowTablesInfo($flow_id) {
		if ($flow_id == '') {
			return 0;
		}

		$table_lists = $this -> table(C('DB_PREFIX') . 'table_field_directory AS F') -> join(C('DB_PREFIX') . 'table_directory AS T on T.ID=F.tableID') -> where("T.flowID='$flow_id' $keyword_field") -> distinct(TRUE) -> field('T.tableName') -> select();

		return $table_lists;
	}

	/**
	 * 获取指定表单的关联表单
	 * @param	int/string	表单ID/表单数据表
	 * @return 	array
	 */
	public function getAFormConnectedForms($form) {
		if (!$form) {
			return 0;
		}

		$form_info = $this -> getFormInfo($form);
		$this_table = $form_info['tableName'];
		$json_obj = json_decode($form_info['formData']);
		//表单json
		unset($form_info);

		$connected_info = array();
		foreach ($json_obj->controlLists as $key => $value) {
			$data_source = $value -> attrs -> data;
			if ($data_source) {
				$data_source_id = (int)$data_source -> dataBind -> value -> id;
				$connected_table = $this -> table(C('DB_PREFIX') . 'querier') -> where("ID=" . $data_source_id) -> getField('queryTables');

				if (is_null($connected_table)) {
					continue;
				}

				$temp_array['conn_table'] = $connected_table;
				$temp_array['conn_info_table1'] = $this_table . '.' . $key;
				$temp_array['conn_info_center'] = '=';
				$temp_array['conn_info_table2'] = $connected_table . '.ID';

				array_push($connected_info, $temp_array);
				unset($temp_array);
			}
		}
		unset($key, $value, $json_obj);

		return $connected_info;
	}

	/**
	 * 获取表单的关联表单信息
	 * @param	int		$flow_id
	 * @param	string	表单数据表名称
	 * @return 	array
	 */
	public function getAFlowConnectedForms($flow_id, $table) {
		if (!$flow_id || !$table) {
			return 0;
		}

		$flow_table_lists = $this -> getAFlowTablesInfo($flow_id);
		$connected_info['tables_list'] = array($table);
		$connected_info['table_info'] = array();
		foreach ($flow_table_lists as $flow_table) {
			$form_info = $this -> getFormInfo($flow_table['tableName']);
			$this_table = $flow_table['tableName'];
			$json_obj = json_decode($form_info['formData']);
			//表单json
			unset($form_info);

			foreach ($json_obj->controlLists as $key => $value) {
				$data_source = $value -> attrs -> data;
				if ($data_source) {
					$data_source_id = (int)$data_source -> dataBind -> value -> id;
					$connected_table = $this -> table(C('DB_PREFIX') . 'querier') -> where("ID=" . $data_source_id) -> getField('queryTables');
					if (!in_array($this_table, $connected_info['tables_list'])) {
						array_push($connected_info['tables_list'], $this_table);
					}
					if (!in_array($connected_table, $connected_info['tables_list'])) {
						array_push($connected_info['tables_list'], $connected_table);
					}
					$temp_array['table_conn'] = array($this_table, $connected_table);
					$temp_array['join_on'] = $this_table . '.' . $key . '=' . $connected_table . '.ID';

					array_push($connected_info['table_info'], $temp_array);
					unset($temp_array);
				}
			}
			unset($key, $value, $json_obj);
		}
		unset($flow_table, $flow_table_lists);

		return $connected_info;
	}

	/**
	 * 获取指定表单的关联表单
	 * @param	int/string	表单ID/表单数据表
	 * @return 	array
	 */
	public function getAFormConnectedFormsBycc($form) {
		if (!$form) {
			return 0;
		}

		$form_info = $this -> getFormInfo($form);
		//print_r($form_info);
		$this_table = $form_info['tableName'];

		$json_obj = json_decode($form_info['formData']);
		//表单json
		//print_r($json_obj);
		unset($form_info);
		$connected_tables = array($this_table);
		$connected_conns = array();
		$connArr = array();
		foreach ($json_obj->controlLists as $key => $value) {
			//print_r($json_obj->controlLists);
			//print_r($value);
			//dump($value->attrs->data->defaultValue->type);
			$data_source = $value -> attrs -> data;
			$default_value = $data_source -> defaultValue;
			if ($data_source && $default_value) {
				//$this_table.'.'.$key;
				array_push($connected_conns, $this_table . '.' . $key);
				$data_source_id = (int)$default_value -> value -> id;
				$connected_table = $this -> table(C('DB_PREFIX') . 'querier') -> where("ID=" . $data_source_id) -> getField('queryTables');
				$queryField = $default_value -> value -> queryField;
				$queryField = substr_replace($queryField, ".", 25, 1);

				$connStr = $queryField . '=' . $this_table . '.' . $key;
				//$connStr =  $this_table.'.'.$key .'='.$connected_table.'.ID';//ID关联的时候用的
				array_push($connArr, $connStr);
				array_push($connected_conns, $connected_table . '.ID');
				array_push($connected_tables, $connected_table);
			}
		}
		unset($key, $value, $json_obj, $connStr);

		$connected_info['tables'] = $connected_tables;
		$connected_info['conns'] = $connected_conns;
		unset($connected_tables, $connected_conns);
		//print_r($connArr);
		return $connArr;
		//return $connected_info;
	}

	/**
	 * @author cc new
	 *
	 * 获取相应的关联字段信息
	 * @param	int		$flow_id 当前流程ID
	 * @param	json	$json_data 数据表信息
	 * @param	string	$keyword 关键字
	 * @return	array
	 */
	public function filterQueryFieldInfoByKeyword($flow_id, $json_data, $keyword = '') {
		if (!$flow_id) {
			return 0;
		}

		$fields_info = $this -> getAFlowFieldsInfo($flow_id, $keyword);
		//keyword所在表的信息包含表名表ID field名称fieldname

		$fields_array = array();
		$json_obj = json_decode($json_data);

		$lenTables = count($json_obj);
		//带进来的表的数量
		if ($lenTables == 1) {
			$selectTable = $json_obj[0];
		}
		$result = array();

		if ($keyword == '') {
			$fields_info = array();
			foreach ($json_obj as $value) {
				$temp_array['tableName'] = $value;
				array_push($fields_info, $temp_array);
			}
			unset($value);
		}

		//每次循环单个
		//print_r($fields_info);
		//print_r($json_obj);
		//return;

		foreach ($fields_info as $key => $value) {

			$value['connInfo'] = array();

			if (!in_array($value['tableName'], $json_obj)) {
				$tableArr = $json_obj;
				//带进来的表  当为勾选两个表查询的时候fields_info和$json_obj 除了就够不同之外没别的了
				array_push($tableArr, $value['tableName']);

				$connResultArr = array();
				$connArr = array();
				foreach ($tableArr as $m) {

					$connected_tables = $this -> getAFormConnectedFormsBycc($m);
					//
					//print_r($connected_tables."ccccc");
					$connectedArr = array();
					$table_temps = array();

					foreach ($connected_tables as $p) {

						$mark = 0;
						//用于标记条件两边的表是否是查询的结果集中的
						$table_not_exsit = "";
						foreach ($tableArr as $n) {

							if (strstr($p, $n)) {
								$mark += 1;

							} else {
								$table_not_exsit = $n;

							}
						}

						if ($mark == 2) {
							//关联条件两边的表同时在需要结果集中
							array_push($connectedArr, $p);
						}

						if ($mark == 1) {

							//存起来表的结构
							//
							$tabs = explode("=", $p);
							$ftab = explode(".", $tabs[0]);
							if (!in_array($ftab[0], $tableArr)) {
								array_push($table_temps, $ftab[0]);
							}

							$ftab = explode(".", $tabs[1]);
							if (!in_array($ftab[0], $tableArr)) {
								array_push($table_temps, $ftab[0]);
							}

							foreach ($table_temps as $s) {
								$connected_temps_tables = $this -> getAFormConnectedFormsBycc($s);
							}

							$second_conn = "";
							//中间关系
							foreach ($connected_temps_tables as $k) {
								if (strstr($k, $table_not_exsit)) {
									$second_conn = $k;
									break;
								}
							}
							unset($k, $connected_temps_tables, $table_not_exsit);

							array_push($value['connInfo'], $second_conn);
							array_push($value['connInfo'], $p);

							unset($ftab, $tabs);

						}

					}

					array_unique($connectedArr);
					//print_r($connectedArr);
					if (count($connectedArr) == 0) {

					}

					//print_r($table_temps);//有关联关系的表集合
					//echo "string";
					//print_r($json_obj);//带进来的表
					if ($connectedArr == null) {
						$temp = array_unique(array_merge($table_temps, $tableArr));
						$diff_arr = array_diff($temp, $tableArr);
						//print_r($diff_arr );
						if ($diff_arr) {
							$connected_tables_mid_temp = array();
							foreach ($diff_arr as $k => $v) {
								$connected_tables_mid = $this -> getAFormConnectedFormsBycc($v);
								$connected_tables_mid_temp = array_merge($connected_tables_mid, $connected_tables_mid_temp);
								if (in_array(needle, haystack)) {

								}
							}

						}

					} else {
						if ($connectedArr != null) {
							foreach ($connectedArr as $vv) {

								array_push($value['connInfo'], $vv);
							}
						}

						unset($connectedArr);
					}

				}

				$result[] = $value;

			} else if ($lenTables <= 1) {
				$result[] = $value;
			} else if ($lenTables > 1) {

				//多表勾选会经过这里
				$tableArr = $json_obj;
				//带进来的表
				//array_push($tableArr, $value['tableName']);
				//print_r("expression");
				$connResultArr = array();

				foreach ($tableArr as $m) {

					$connected_tables = $this -> getAFormConnectedFormsBycc($m);
					$connectedArr = array();
					$table_temps = array();

					foreach ($connected_tables as $p) {

						$mark = 0;
						//用于标记条件两边的表是否是查询的结果集中的
						$table_not_exsit = "";
						foreach ($tableArr as $n) {

							if (strstr($p, $n)) {
								$mark += 1;
							} else {
								$table_not_exsit = $n;
							}
						}

						if ($mark == 2) {
							//关联条件两边的表同时在需要结果集中
							array_push($connectedArr, $p);
						}

						if ($mark == 1) {

							//存起来表的结构
							//
							$tabs = explode("=", $p);
							$ftab = explode(".", $tabs[0]);
							if (!in_array($ftab[0], $tableArr)) {
								array_push($table_temps, $ftab[0]);
							}

							$ftab = explode(".", $tabs[1]);
							if (!in_array($ftab[0], $tableArr)) {
								array_push($table_temps, $ftab[0]);
							}

							foreach ($table_temps as $s) {
								$connected_temps_tables = $this -> getAFormConnectedFormsBycc($s);
							}

							$second_conn = "";
							//中间关系
							foreach ($connected_temps_tables as $k) {
								if (strstr($k, $table_not_exsit)) {
									$second_conn = $k;
									break;
								}
							}
							unset($k, $connected_temps_tables, $table_not_exsit);

							array_push($value['connInfo'], $second_conn);
							array_push($value['connInfo'], $p);

							unset($ftab, $tabs);
						}

					}

					array_unique($connectedArr);

					//echo "string";
					if ($connectedArr) {

						foreach ($connectedArr as $vv) {

							array_push($value['connInfo'], $vv);
						}
					}

					unset($connectedArr);

				}

				$arr = array_unique($value['connInfo']);

				$value['connInfo'] = array();
				//print_r($arr);
				foreach ($arr as $key => $val) {
					if (empty($val)) {
						continue;
					}

					//带进来有两个表是判断是否有直接关联，有的话有直接关联有的话就直接用直接关联
					if ($lenTables == 2) {
						$mark2 = 0;
						foreach ($json_obj as $vv) {
							if (strstr($val, $vv)) {
								$mark2 += 1;
							}

						}
						if ($mark2 == 2) {
							unset($value['connInfo']);
							$value['connInfo'][] = $val;

							break;
						}
						unset($mark2);
					}

					$value['connInfo'][] = $val;
				}

				//array_filter($value['connInfo']);
				$result[] = $value;
				//print_r($result);
			}

		}

		//print_r($result);
		$count_result = count($result);
		for ($i = 0; $i < $count_result; $i++) {

			$tables_temp_array = array();

			if ($json_obj && count($result[$i]["connInfo"]) == 0) {
				unset($value, $result[$i]["connInfo"]);
				$result[$i]["connInfo"] = '';
				unset($result[$i]);
				continue;
			}

			foreach ($result[$i]["connInfo"] as $key => $value) {
				$table_fields_array = explode("=", $value);
				$table_temp_array = explode(".", $table_fields_array[0]);
				array_push($tables_temp_array, $table_temp_array[0]);
				$table_temp_array = explode(".", $table_fields_array[1]);
				array_push($tables_temp_array, $table_temp_array[0]);
				unset($table_temp_array, $table_fields_array);
			}
			unset($value);

			$table_count_array = array_count_values($tables_temp_array);
			$table_count_array = array_flip($table_count_array);
			krsort($table_count_array);
			foreach ($table_count_array as $key => $value) {
				$main_table = $value;
				break;
			}
			unset($key);

			$from = $main_table;
			foreach ($result[$i]["connInfo"] as $key => $value) {
				$table_fields_array = explode("=", $value);
				$table_temp_array = explode(".", $table_fields_array[0]);
				if ($main_table == $table_temp_array[0]) {
					$table_temp_array = explode(".", $table_fields_array[1]);
				}
				$from .= " left join " . $table_temp_array[0] . " on " . $value;
			}
			unset($value, $result[$i]["connInfo"]);

			$result[$i]["connInfo"] = $from;
		}

		return $result;
	}

	/**
	 * 获取流程下的所有的表单及表格数据表信息
	 * @param	string	$flow_id 当前流程ID
	 * @return	array 	返回流程下数据表信息
	 */
	public function getFlowFormTable($flow_id) {
		if (!$flow_id) {
			return 0;
		}

		$table_list = $this -> table(C('DB_PREFIX') . 'table_directory') -> where("flowID=$flow_id") -> field('ID as tableID, tableName, tableTitle as tableTitleName') -> order('ID') -> select();

		return $table_list ? $table_list : array();
	}

	/**
	 * 对浏览记录评分
	 * @param	int		$record_id 记录ID
	 * @param	int		$score 评分
	 * @return	boolean
	 */
	public function updRecordScore($record_id, $score) {
		if (!$record_id || !$score) {
			return 0;
		}

		$data['userID'] = I('session.uid', 0);
		$data['recordID'] = $record_id;
		$data['score'] = $score;
		$data['addTime'] = time();
		$result = $this -> table(C('DB_PREFIX') . 'pingfen') -> data($data) -> add();
		unset($data);

		return $result ? 1 : 0;
	}

	/**
	 * 获取当前信息评分
	 * @param	int		$record_id 记录ID
	 * @return	int
	 */
	public function getRecordScore($record_id) {
		if (!$record_id) {
			return 0;
		}

		$score = $this -> table(C('DB_PREFIX') . 'pingfen') -> where("recordID=" . $record_id) -> getField('SUM(score) as num');

		return $score ? $score : 0;
	}

	/**
	 * 获取当前点赞信息
	 * @param	int			$record_id 记录ID
	 * @param	string		$comp_id
	 * @return	int
	 */

	public function updZanRecord($record_id, $comp_id) {
		if (!$record_id || $comp_id == '') {
			return 0;
		}

		$data['userID'] = session('wechat_openid') ? session('wechat_openid') : session('uid');
		$data['recordID'] = $record_id;
		$data['compID'] = $comp_id;
		$data['addTime'] = time();

		$result = $this -> table(C('DB_PREFIX') . 'jizan') -> data($data) -> add();
		unset($data);

		return $result ? $result : 0;
	}

	/**
	 * 获取当前赞的数量
	 * @param	int		$record_id 记录ID
	 * @param	string	$comp_id 组件ID
	 * @return	int
	 */
	public function getZanRecord($record_id, $comp_id) {
		if (!$record_id || $comp_id == '') {
			return 0;
		}

		$zanNum = $this -> table(C('DB_PREFIX') . 'jizan') -> where("recordID=$record_id and compID='$comp_id'") -> getField('count(ID) as num');

		return $zanNum ? $zanNum : 0;
	}

	/**
	 * 获取用户赞过的所有的记录
	 * @param	string		$comp_id
	 * @return	array
	 */
	public function getAllZanRecords($comp_id) {
		if ($comp_id == '') {
			return 0;
		}

		$user_id = session('wechat_openid') ? session('wechat_openid') : session('uid');
		$record_lists = $this -> table(C('DB_PREFIX') . 'jizan') -> where("userID='$user_id' and compID='$comp_id'") -> getField('recordID', TRUE);

		return $record_lists ? $record_lists : 0;
	}

	/**
	 * 建立聊天组件数据表
	 * @return	boolean
	 */
	public function createChatTable() {
		$sql = <<<sql
			CREATE TABLE IF NOT EXISTS `cc_chat_messages` (
			  `ID` int(12) NOT NULL AUTO_INCREMENT COMMENT '索引列',
			  `userID` varchar(50) NOT NULL COMMENT '发表用户',
			  `messageContent` varchar(255) NOT NULL COMMENT '发表内容',
			  `addTime` int(10) NOT NULL COMMENT '时间',
			  PRIMARY KEY (`ID`)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='聊天组件表'
sql;
		$result = $this -> execute($sql);
		unset($sql);

		return 1;
	}

	/**
	 * 保存聊天内容
	 * @param	string 		$user_id 用户
	 * @param	string		$message_content 聊天内容
	 * @return	boolean
	 */
	public function saveChatMessage($user_id, $message_content) {
		if ($user_id == '') {
			return 0;
		}

		$data['userID'] = $user_id;
		$data['messageContent'] = $message_content;
		$data['addTime'] = time();
		$id = $this -> table(C('DB_PREFIX') . 'chat_messages') -> data($data) -> add();

		return $id ? $id : 0;
	}

	/**
	 * 获取新的聊天
	 * @param	int		$max_id 现有聊天的最大ID
	 * @param	int		$weId 微信ID
	 * @return	array
	 */
	public function getNewChatMessage($max_id, $weId) {
		$message_info = $this -> table(C('DB_PREFIX') . 'chat_messages') -> where("ID>" . $max_id) -> field('ID, userID, messageContent, addTime') -> order('ID') -> select();
		$maxID = 0;
		$message_lists = array();
		foreach ($message_info as $value) {
			$maxID = $value['ID'];

			$user_info = D('Apps/WechatMp') -> getMemberInfo($weId, $value['userID']);
			$value['userName'] = $user_info['userName'];
			$value['headImg'] = urlencode($user_info['userPhoto'] . '/0');
			unset($value['ID'], $value['userID']);
			array_push($message_lists, $value);
		}
		unset($value);

		$message['maxID'] = $maxID;
		$message['lists'] = $message_lists;
		unset($message_lists);

		return $message_info ? $message : 0;
	}

	/**
	 * 获取最新的记录
	 * @param	int		$dataset_id 数据集ID
	 * @param	int		$max_id 现有记录的最大ID
	 * @return	array
	 */
	public function getNewRecord($dataset_id, $max_id = 0, $linkParas = '', $formCtrlJson = '') {
		if (!$dataset_id) {
			return 0;
		}

		$dataset_info = D('Query') -> getAQuerierData($dataset_id);
		$sql_str = (string)$dataset_info['querierData'] -> sql;
		$sql_array = explode("limit", $sql_str);
		unset($dataset_info);

		$sql = "SELECT * FROM (" . $sql_array[0] . ") AS ABC " . " ORDER BY ID ";
		$data_info = D('Query') -> execAQueryPlan($sql, $linkParas, $formCtrlJson, $max_id);
		unset($sql_array);

		$query_data = $data_info['sql'];
		unset($data_info);

		$maxID = $max_id;
		$record_lists = array();
		foreach ($query_data as $value) {
			++$maxID;
			//$maxID = $value['ID'];   //huzhiqiang
			array_push($record_lists, $value);
		}
		unset($value);

		$record['maxID'] = $maxID;
		$record['lists'] = $record_lists;
		unset($record_lists);

		return $record;
	}

	/**
	 * 存储内页链接信息
	 * @param	string		$fromPageID
	 * @param	string		$toPageID
	 * @param	string		$actionID
	 * @param	json		$linkData
	 * @return	boolean
	 */
	public function savePageLinkData($fromPageID, $toPageID, $actionID = '', $linkData = '', $ctrlID = '') {
		if ($fromPageID == '' || $toPageID == '') {
			return 0;
		}

		$data['fromPageID'] = $fromPageID;
		$data['toPageID'] = $toPageID;
		$data['actionID'] = $actionID;
		$data['linkData'] = $linkData;
		$data['ctrlID'] = $ctrlID;

		// $del = $this->table(C('DB_PREFIX').'link_params')->where("fromPageID ='$fromPageID' AND actionID ='$actionID' ")->delete();
		// $result = $this->table(C('DB_PREFIX') . 'link_params')->data($data)->add();
		$re = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID ='$fromPageID' AND toPageID ='$toPageID' ") -> find();
		if ($re) {
			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID ='$fromPageID' AND toPageID ='$toPageID'") -> save($data);
		} else {
			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> data($data) -> add();
		}

		unset($data);

		return $result ? 1 : 0;
	}

	/**
	 * 获取内页链接信息
	 * @param	string		$fromPageID
	 * @param	string		$toPageID
	 * @param	string		$actionID
	 * @return	array
	 */
	public function getPageLinkData($fromPageID, $toPageID, $actionID = '') {
		$where = array();
		if ($fromPageID) {
			$where['fromPageID'] = $fromPageID;
		}
		if ($toPageID) {
			$where['toPageID'] = $toPageID;
		}
		if (empty($where)) {
			return 0;
		}

		$link_info = $this -> table(C('DB_PREFIX') . 'link_params') -> where($where) -> field('fromPageID,toPageID, actionID, linkData,ctrlID') -> order('ID') -> select();
		$link_data = array();
		foreach ($link_info as $value) {
			$value['linkData'] = json_decode($value['linkData']);
			array_push($link_data, $value);
		}
		unset($value, $link_info);

		return $link_data ? $link_data : 0;
	}

	/**
	 * 编辑内页链接数据
	 * @param	string		$actionID
	 * @param	string		$toPageID
	 * @param	string		$fromPageID
	 * @param	json		$linkData
	 * @return	boolean
	 */
	public function updPageLinkData($fromPageID, $toPageID, $actionID, $linkData) {
		if ($actionID) {
			if ($fromPageID == '') {
				return 0;
			}

			$data['toPageID'] = $toPageID;
			$data['linkData'] = $linkData;
			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID='$fromPageID' and actionID='$actionID'") -> data($data) -> add();
		} else {
			if ($fromPageID == '' || $toPageID == '') {
				return 0;
			}

			$data['linkData'] = $linkData;
			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID='$fromPageID' and toPageID='$toPageID'") -> data($data) -> add();

		}
		unset($data);

		return $result ? 1 : 0;
	}

	/**
	 * 删除内页链接数据
	 * @param	string		$actionID
	 * @param	string		$toPageID
	 * @param	string		$fromPageID
	 */
	public function delPageLinkData($fromPageID, $toPageID, $actionID) {
		if ($actionID) {
			if ($fromPageID == '') {
				return 0;
			}

			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID='$fromPageID' and actionID='$actionID'") -> delete();
		} else {
			if ($fromPageID == '' || $toPageID == '') {
				return 0;
			}

			$result = $this -> table(C('DB_PREFIX') . 'link_params') -> where("fromPageID='$fromPageID' and toPageID='$toPageID'") -> delete();
		}

		return $result ? 1 : 0;
	}

	/*
	 * 获取当前开发者卖出的订单信息
	 *
	 *
	 * */
	public function getSaledOrder() {
		$uid = session("uid");
		//trade_info  userSite 对应的isShare代表出售的
		$getMyShare = M("user_site") -> where("userId = '$uid' AND isShare=3") -> field("id") -> select();
		$shareArr = array();
		foreach ($getMyShare as $key => $value) {
			array_push($shareArr, $value['id']);
		}

		$map['releaseID'] = array('IN', $shareArr);
		$info = M('trade_info');
		$result = $info -> where($map) -> order("id DESC") -> select();
		//print_r($info->getLastSql());
		//print_r($result);

		return $result;

	}

	//制作层组件编辑数据
	public function editMoreLayout($site_id, $page_id, $openid, $data, $lay_id, $extend = '', $compayName = '', $jobName = '') {
		if (empty($lay_id)) {
			return false;
		}
		$sql = <<<EOF
CREATE TABLE IF NOT EXISTS `cc_more_layout` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '数据ID',
  `layId` varchar(50) NOT NULL COMMENT '层应用ID',
  `siteId` int(10) unsigned NOT NULL COMMENT '网站ID',
  `pageId` varchar(12) NOT NULL,
  `openid` varchar(32) NOT NULL COMMENT '微信openid',
  `data` text NOT NULL COMMENT '层应用所有内容',
  `extend` varchar(200) NOT NULL COMMENT '扩展备用',
  `addTime` int(11) unsigned NOT NULL COMMENT '添加时间',
  `updateTime` int(11) unsigned NOT NULL COMMENT '更新时间',
  `compayName` varchar(50) NOT NULL COMMENT '公司名称',
  `jobName` varchar(50) NOT NULL COMMENT '职位',
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='多层应用' AUTO_INCREMENT=1 ;
EOF;
		$this -> execute($sql);
		$set = array('siteId' => $site_id, 'pageId' => $page_id, 'openid' => $openid, 'data' => $data, 'extend' => $extend, //formId
		'jobName' => $jobName, 'compayName' => $compayName, 'updateTime' => time(), );
		//$count = $this->table(C('DB_PREFIX') . 'more_layout')->where('layId="' . $lay_id . '"')->count();
		//if ($count) {
		//$affact = $this->table(C('DB_PREFIX') . 'more_layout')->where('layId="' . $lay_id.'"')->save($set);
		//} else {
		$set['addTime'] = time();
		$set['layId'] = $lay_id;
		$affact = $this -> table(C('DB_PREFIX') . 'more_layout') -> add($set);
		//}
		return $affact;
	}

	//获取制作层组件数据
	public function getMoreLayout($condition = array(), $page = NULL, $pageRow = 20) {
		$where = array('siteId' => '', 'pageId' => '', 'openid' => '', 'extend' => '', 'layId' => '', );
		if (empty($condition)) {
			return array();
		}
		foreach ($where as $key => $val) {
			$where[$key] = isset($condition[$key]) ? $condition[$key] : '';
			if (empty($where[$key])) {
				unset($where[$key]);
			}
		}
		if (empty($where)) {
			return array();
		}
		if ($page) {
			$list = $this -> table(C('DB_PREFIX') . 'more_layout') -> page($page, $pageRow) -> where($where) -> order("ID DESC") -> select();
		} else {
			$list = $this -> table(C('DB_PREFIX') . 'more_layout') -> where($where) -> order("ID DESC") -> select();
		}
		if ($list) {
			foreach ($list as &$lay) {
				$lay["data"] = base64_decode($lay["data"]);
			}
			unset($lay);
		}
		return $list;
	}

	/**
	 * 新增订单，如果没有表就创建新的项目订单表
	 * @param  array
	 * @return string orderSN
	 */
	public function insertProjectOrder($condition) {
		$sql = <<<EOF
CREATE TABLE IF NOT EXISTS `cc_order` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `formId` varchar(32) NOT NULL COMMENT '表单ID',
  `productId` int(10) unsigned NOT NULL COMMENT '商品表ID',
  `productName` varchar(200) NOT NULL COMMENT '商品名称',
  `productPrice` decimal(10,2) unsigned NOT NULL COMMENT '单价',
  `productNumber` smallint(3) unsigned NOT NULL COMMENT '商品数量',
  `orderSn` varchar(32) NOT NULL COMMENT '订单编号',
  `orderPrice` decimal(10,2) unsigned NOT NULL COMMENT '订单价格',
  `openid` varchar(32) NOT NULL COMMENT '用户openid',
  `orderType` VARCHAR(20) NOT NULL DEFAULT 'order' COMMENT '支付类型:订单，充值',
  `isPay` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否支付',
  `createTime` int(11) unsigned NOT NULL COMMENT '创建时间',
  `updateTime` int(11) unsigned NOT NULL COMMENT '更新时间',
  `payTime` int(11) unsigned NOT NULL COMMENT '支付时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='项目订单表' AUTO_INCREMENT=1 ;
EOF;
		$this -> execute($sql);
		$set = array('productName' => '', 'productPrice' => '', 'openid' => '', );
		if (empty($condition)) {
			return false;
		}

		foreach ($set as $key => $val) {
			$set[$key] = isset($condition[$key]) ? $condition[$key] : '';
			if (empty($set[$key])) {
				return false;
			}
		}

		$set['productNumber'] = isset($condition['productNumber']) ? intval($condition['productNumber']) : 1;
		$set['orderSn'] = isset($condition['orderSn']) && $condition['orderSn'] ? trim($condition['orderSn']) : unquire_rand(32);
		$set['orderPrice'] = $set['productPrice'] * $set['productNumber'];
		$set['isPay'] = 0;
		$set['createTime'] = time();
		$set['updateTime'] = time();
		$set['payTime'] = time();
		$set['orderType'] = isset($condition['orderType']) ? trim($condition['orderType']) : 'order';
		if ($set['orderType'] == 'order') {
			$set['formId'] = isset($condition['formId']) ? trim($condition['formId']) : '';
			$set['productId'] = isset($condition['productId']) ? trim($condition['productId']) : 0;
		}

		if ($this -> getProjectOrderInfo($set['orderSn'])) {
			$set['orderSn'] = unquire_rand(32);
		}

		$affact = $this -> table(C('DB_PREFIX') . 'order') -> add($set);
		//echo $this->getLastSql();exit;
		if ($affact) {
			return $set['orderSn'];
		} else {
			return false;
		}
	}

	/**
	 * 修改订单信息
	 * @param  string $order_sn 订单号
	 * @param  array $fields   修改字段数组
	 * @return boolean
	 */
	public function editProjectOrder($order_sn, $fields) {
		if (empty($order_sn) || !is_array($fields)) {
			return false;
		}
		$where = array('orderSn' => $order_sn, );
		$order_info = $this -> getProjectOrderInfo($order_sn);
		if (!$order_info) {
			return false;
		}
		if (isset($fields['isPay'])) {
			$fields['isPay'] = intval($fields['isPay']);
			$fields['payTime'] = time();
		}
		$fields['updateTime'] = time();

		$affact = $this -> table(C('DB_PREFIX') . 'order') -> where($where) -> save($fields);
		return $affact;
	}

	/**
	 * 获取订单详细内容
	 * @param  string $order_sn 订单号
	 * @return array
	 */
	public function getProjectOrderInfo($order_sn) {
		$where = array('orderSn' => $order_sn, );
		$order_info = $this -> table(C('DB_PREFIX') . 'order') -> where($where) -> find();
		return $order_info;
	}

	public function getOrderList($condition, $page = NULL, $pageRow = 20) {

	}

	public function getViewPower($openid) {
		return;
		/*
		 $getWxUser = $this->table(C('DB_PREFIX') . 'order')->where("openid='$openid'")->order("id DESC")->find();
		 $time = time();
		 if ($getWxUser[0]['startTime'] <= $time && $getWxUser[0]['endTime'] = ＞$time) {
		 return 1;
		 } else {
		 $startTime = strtotime(date('Y-m-d' . '00:00:00', time()));//当天的0点
		 $endTime = strtotime(date('Y-m-d' . '23:59:59', time()));//当天的24点
		 $db = $this->M("view")->where("viewTime >'$startTime' AND viewTime <'$endTime'")->count();
		 if (count < 3) {
		 $data["openid"] = $openid;
		 $data["viewTime"] = time();
		 $this->M("view")->add($data);
		 return 2;//免费用户三条还没看完可以继续看
		 } else {
		 return 0; //免费用户只能看三条/每天
		 }
		 }
		 */
	}

	/**
	 * 支付日志
	 */
	public function insertPayLog($condition) {
		$sql = <<<EOF
CREATE TABLE `cc_pay_log`(
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`order_sn` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '支付订单号',
	`order_type` VARCHAR(20) NOT NULL DEFAULT 'order' COMMENT '支付类型:订单，充值',
	`order_amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
	`order_payment` VARCHAR(20) NOT NULL COMMENT '支付方式',
	`openid` varchar(32) NOT NULL COMMENT '用户openid',
	`create_time` INT(11),
	`update_time` INT(11),
	`status` TINYINT(2) DEFAULT 0 COMMENT '支付状态,0:未付,1:已付',
	PRIMARY KEY (`id`),
	UNIQUE INDEX `order_sn` (`order_sn`),
	INDEX `order_type` (`order_type`) );
EOF;
		$this -> execute($sql);
		$set = array('order_sn' => '', 'order_amount' => '', 'openid' => '', );
		if (empty($condition)) {
			return false;
		}
		foreach ($set as $key => $val) {
			$set[$key] = isset($condition[$key]) ? $condition[$key] : '';
			if (empty($set[$key])) {
				return false;
			}
		}
		//如果已经存在则直接跳过
		$log = $this -> getPayLog($set['order_sn']);
		if ($log) {
			return true;
		}

		$set['order_type'] = isset($condition['order_type']) ? $condition['order_type'] : 'order';
		$set['order_payment'] = isset($condition['order_payment']) ? $condition['order_payment'] : 'wxpay';

		$set['status'] = 0;
		$set['create_time'] = time();
		$set['update_time'] = time();

		$affact = $this -> table(C('DB_PREFIX') . 'pay_log') -> add($set);
		//echo $this->getLastSql();
		return $affact ? true : false;
	}

	/**
	 * 修改支付记录信息
	 * @param  string $order_sn 订单号
	 * @param  array $fields   修改字段数组
	 * @return boolean
	 */
	public function editPayLog($order_sn, $fields) {
		if (empty($order_sn) || !is_array($fields)) {
			return false;
		}
		$where = array('order_sn' => $order_sn, );

		//如果已经存在则直接跳过
		$log = $this -> getPayLog($order_sn);
		if (!$log) {
			return false;
		}

		if (isset($fields['status'])) {
			$fields['status'] = intval($fields['status']);
		}
		$fields['update_time'] = time();

		$affact = $this -> table(C('DB_PREFIX') . 'pay_log') -> where($where) -> save($fields);
		return $affact;
	}

	/**
	 * 获取支付记录信息
	 */
	public function getPayLog($order_sn) {
		$info = $this -> table(C('DB_PREFIX') . 'pay_log') -> where(array('order_sn' => $order_sn)) -> find();
		return $info;
	}

	/*
	 * 获取自己转发被分享的条数
	 *
	 * */
	public function getOneShareRecord() {
		$user = I("param.user.", "", "trim");

	}

	/*
	 *获取表单数据
	 * */
	public function getDataByTable($table, $field, $limit, $page, $sort) {

		$count = $this -> table($table) -> field($field) -> count();

		//如果要获取的记录超过了总记录 返回第一页数据
		if ($count < $limit * ($page - 1)) {

			$aa = floor(floor($count) / floor($limit));
			$page = ceil($aa);
			//$page=1;
		}
		if ($sort == "") {
			$sort = "ID DESC";
		} else {
			$sort = str_replace(".", " ", $sort);
		}
		$info = $this -> table($table) -> field($field) -> order($sort) -> page($page . "," . $limit) -> select();
		//print_r($this->getLastSql());
		$dataArr = array("totalCount" => $count, "items" => $info, );

		return $dataArr;
	}

	/*
	 * 删除一条或者多条记录
	 * @param	int		formId 表单ID
	 * @param	int		records 表单记录ID
	 *
	 * */
	public function delFormRecord($formId, $records) {
		//$records=explode(",", $records);
		$tableArr = $this -> getFormInfo($formId);
		$table = $tableArr["tableName"];
		unset($tableArr);
		$where = 'ID in(' . $records . ')';

		$info = $this -> table($table) -> where($where) -> delete();
		return $info;
	}

	/*
	 * 保存页面content的
	 *
	 * */
	public function savePageTpl($page, $content, $site_id) {
		$data = array("siteId" => $site_id, "name" => $page, "content" => ($content), "createTime" => time(), "updateTime" => time(), "type" => $type ? $type : 2, //0:网站模板,1:组件,2:菜单页面模板，3内页模板，4
		);
		$userInfo = D("UserSite") -> getSiteInfo($site_id);
		$re = $this -> table(C('DB_PREFIX') . "site_template") -> where("name = '$page'") -> find();

		if ($re) {
			$result = $this -> table(C('DB_PREFIX') . "site_template") -> where("name = '$page'") -> save($data);
		} else {

			$result = $this -> table(C('DB_PREFIX') . "site_template") -> add($data);
		}
		return $result;
	}

	/*
	 * 获取保存的页面content
	 * */
	public function getPageContent($page, $siteId) {
		$re = $this -> table(C('DB_PREFIX') . "site_template") -> where("name = '$page'") -> getField("content");
		return $re;
	}

	/*
	 *
	 * 获取需要复制的模板
	 * */
	public function getSiteTpl() {
		$re = $this -> table(C('DB_PREFIX') . "site_template") -> select();
		return $re;
	}

	//新增到当前模板
	public function saveSiteTpl($get_tpl_records) {
		$re = $this -> table(C("DB_PREFIX") . "site_template") -> add($get_tpl_records);
		//$this->table(C("DB_PREFIX")."site_template")->where("id!=''")->sav
		return $re;
	}

	/*
	 *
	 * */
	public function getFormDataByRowId($rowId, $formId) {
		$table = $this -> table(C('DB_PREFIX') . "table_directory") -> where("ID='$formId'") -> getField("tableName");
		return $this -> table($table) -> where("ID = $rowId") -> find();

	}

	/**
	 * 修改表单的名字
	 */
	public function updateTableName($data) {
		unset($data['siteId']);
		$id = $data["ID"];
		$result = $this -> table(C('DB_PREFIX') . "table_directory") -> where("ID='$id'") -> save($data);
		unset($data);
		return $result;
	}
	
	/**
	 * 记录组件的名字
	 * 
	 */
	 public function addCompRecord($post){
	 	$data['name'] 	= $post['siteId'];
		$data['title']		= $post['name'];
		$data['componentId'] = $post["componentId"];
		$data['data']	   	= "记录组件的名字专用";
		$data['type']		= "自定义组件";
		$data['addTime'] 	= time();
		$re = $this->table(C('DB_PREFIX')."components")->add($data);
		return $re; 
	 }
	 
	 /**
	 * 对比组件的名字
	 * 
	 */
	 public function getCompRecord($post){
	 	$siteId	= $post['siteId'];
		$title		= $post['name'];
		if(!empty($post["componentId"])){
			$componentId =  $post["componentId"];
			$re = $this->table(C('DB_PREFIX')."components")->where("name='$siteId' AND title='$title' AND componentId !='$componentId'")->select();
			$result = count($re)>1?1:0;
		}else{
			
			$re = $this->table(C('DB_PREFIX')."components")->where("name='$siteId' AND title='$title'")->select();
			return count($re)?1:0;
		}
	 }
	 
	 /**
	  *  保存多表关系
	  *  @param $form_id       当前表ID 0-新增 1-修改
	  *  @param $tableRelation 多表关系信息
	  *  @return array        保存结果	
	  */
	 public function saveMultiTableRelation($form_id, $json_data){
	 	
		$formSetArr = json_decode($json_data,true);
		//根据form Json_data找出表之间的关系
		foreach ($formSetArr as $key => $value) {
			$fkId = $key;
			foreach ($value as $key1 => $value1) {
				if($key1 === 'controlLists'){   
					foreach ($value1 as $key2 => $value2) {
						if($key2 !== 'undefined'){
							foreach ($value2 as $key3 => $value3) {
								foreach ($value3 as $key4 => $value4) {
									if($key4 === 'validate'){
										foreach ($value4 as $key5 => $value5) {
											if(is_array($value5)){
												$pkId = $value5['formId']; 
												$ctrlId = $value5['ctrlId'];
												if(!empty($pkId)){
													$rKey = "{$fkId}-{$pkId}";
													$rValue = "{$fkId}:{$key2}-{$pkId}:{$ctrlId}";
													$tableRelation[][$rKey] = $rValue;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
    	//查看是否已经存在关系设置
		$isExistRelation = $this -> table(C('DB_PREFIX').'table_relation')-> where(array('formId' => $form_id)) -> getField('formId');
		
		//修改
		if(count($isExistRelation) > 0){
			//修改
			$where['formid'] = $form_id;
		    $data['tableRelation'] = json_encode($tableRelation);
		    return $this -> table( C('DB_PREFIX'). 'table_relation') -> data($data) -> where($where) -> save();
		}
		else{
			if($tableRelation){
				//新增
				$data['formid'] = $form_id;
			    $data['tableRelation'] = json_encode($tableRelation);
			    return $this -> table( C('DB_PREFIX'). 'table_relation') -> data($data) -> add();
			}
			
		}
		
	 }
	 
	 /**
	  *  部署购买后应用
	  *  @param $user_id  当前用户ID
	  *  @param $order_no 订单编号
	  *  @return 部署后标识  1-成功  0-失败
	  */
	 public function deplayAApp($user_id, $order_no){
	 	//添加project信息
	 	//$data['createUser'] = 
	 	//$this->
	 }

}
?>