<?php
/*
 * function : 运算逻辑的解析
 * time : 201308260855
 * */

//import("ORG.Query.AnalyRule");

class AnalyRuleFormula {
	private $xmlStr;		// xml数据字符串

	private $paras = array();	// 接收传入的实际参数
	private $vars = array();	// 定义逻辑运算返回变量

	//初始化应用信息
	public function __construct($paras) {
		$this -> paras = $paras;	// 接收实际参数,数组类型
	}

	//获取逻辑运算xml数据
	public function getXmlData($id) {

		$xmlData = M('rule_formula') -> where("ruleFormulaID='$id' or ID=$id") -> getField('xmlData');
		$xmlData = str_replace("\\\"", "\"", (string)$xmlData);
		$this -> xmlStr = $xmlData;

		$this -> initVars();
	}

	//获取逻辑运算中 dataSource 的 xml 数据
	public function getDataSource($id) {
		$xmlData = M('querier') -> where("querierID='$id'") -> getField('xmlData');
		$xmldoc = simplexml_load_string($xmlData);
		$sql = (string)$xmldoc -> sql;

		return $sql;
	}

	//获取逻辑运算定义变量初始化变量数组
	public function initVars() {
		$vars = $this -> vars;	//获取变量

		$xmldoc = simplexml_load_string($this -> xmlStr);
		$variables = (array)$xmldoc -> children() -> variables;
		$var_array = $variables['variable'];

		foreach ($var_array as $value) {
			$vars["$value"] = 0;
		}
		unset($value);
		
		$this -> vars = $vars;
	}

	// 对中文参数及变量进行处理
	function convert($CHNString) {
		return mb_convert_encoding($CHNString, 'utf-8', 'gbk');
	}

	
	public function analyzeDataOperate() {
		$xmlStr = $this -> xmlStr;
		$xmldoc = simplexml_load_string($xmlStr);

		$this -> analyzeXmlData($xmldoc -> logicaloperation);

	}

	/**
	 * 以下xml解析步骤
	 *
	 **/

	// 解析逻辑运算xml数据
	public function analyzeXmlData($xmldoc, $data = '') {

		//循环遍历xml数据子节点
		foreach ($xmldoc->children() as $child) {
			$operate = (string)$child -> getName();

			switch($operate) {
				case "logical" :
					$this -> analyzeLogical($child -> logical_if -> logical_if_cond) ? $this -> analyzeXmlData($child -> logical_if -> logical_if_content) : $this -> analyzeXmlData($child -> logical_else);
					break;
				case "foreach" :
					$this -> analyzeForeachContent($child);
					break;
				case "operate" :
					$this -> analyzeOperate($child, $data);
					break;
				case "tableinsert" :
					$this -> analyzTableInsert($child);
					break;
				case "tableupdate" :
					$this -> analyzTableUpdate($child);
					break;
				default :
					return false;
					break;
			}
		}
		unset($child);
	}

	// 解析逻辑运算
	public function analyzeOperate($xmldoc, $data) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$opt_arr = array();
		foreach ($xmldoc->children() as $child) {
			if ((string)$child -> getName() === 'operate_param') {
				if ((string)$child -> operate_param_type == 'rule') {
					$ruleParas = array();

					//循环获取规则参数存入数组
					foreach ($child->operate_param_transfer->children() as $child1) {
						$rptype = $child1 -> logic_param_type;
						$rpname = $child1 -> rule_param_name;
						$rpvalue = $child1 -> logic_param_value;

						if ($rptype == '' || $rptype == 'var') {
							$ruleParas["$rpname"] = $vars["$rpvalue"];
						} else if ($rptype == 'parameter') {
							$ruleParas["$rpname"] = $paras["$rpvalue"];
						}
					}
					unset($child1);

					$ruleValue = $this -> getRuleResult((string)$child -> operate_param_value, $ruleParas);
					array_push($opt_arr, array('type' => 'float', 'value' => $ruleValue));
					unset($ruleParas);
				} else if ((string)$child -> operate_param_type === 'dataSourceColumn') {
					$columnName = (string)$child -> operate_param_value -> attributes() -> cid;
					$pv_arr = array('type' => (string)$child -> operate_param_type, 'value' => $data[$columnName]);
					array_push($opt_arr, $pv_arr);
					unset($child, $pv_arr);
				} else {
					$pv_arr = array('type' => (string)$child -> operate_param_type, 'value' => (string)$child -> operate_param_value);
					array_push($opt_arr, $pv_arr);
					unset($child, $pv_arr);
				}
			} else if ((string)$child -> getName() === 'operate_sign') {
				array_push($opt_arr, (string)$child);
				unset($child);
			}
		}
		unset($child);
		
		//获取逻辑计算中 = 后面的第一个值
		if ($opt_arr[2]['type'] == '' || $opt_arr[2]['type'] == 'var') {
			$tmp = $opt_arr[2]['value'];
			$dengValue = $vars["$tmp"];
		} else if ($opt_arr[2]['type'] == 'parameter') {
			$tmp = $opt_arr[2]['value'];
			$dengValue = $paras["$tmp"];
		} else {
			$dengValue = (string)$opt_arr[2]['value'];
		}

		//先将 = 后面第一个值赋值给结果
		if ($opt_arr[0]['type'] == 'parameter') {
			$paras[$opt_arr[0]['value']] = $dengValue;
			$resValue = $paras[$opt_arr[0]['value']];
		} else if ($opt_arr[0]['type'] == '' || $opt_arr[0]['type'] == 'var') {
			$vars[$opt_arr[0]['value']] = $dengValue;
			$resValue = $vars[$opt_arr[0]['value']];
		}
		unset($dengValue);

		//循环计算后面数值，赋值给结果
		$opt_length = count($opt_arr);
		for ($i = 3; $i < $opt_length; $i++) {
			switch((string)$opt_arr[$i]) {
				case "jia" :
					//判断 + 后面值的类型，参数 or 变量 or 数值
					if ($opt_arr[$i + 1]['type'] == '' || $opt_arr[$i + 1]['type'] == 'var') {
						$addValue = $vars[$opt_arr[$i + 1]['value']];
					} else if ($opt_arr[$i + 1]['type'] == 'parameter') {
						$addValue = $paras[$opt_arr[$i + 1]['value']];
					} else {
						$addValue = $opt_arr[$i + 1]['value'];
					}

					//判断值的类型  日期 or 数值
					if (strpos($resValue, '-')) {
						$resValue = date('Y-m-d', strtotime($resValue) + (float)$addValue * 24 * 60 * 60);
					} else {
						$resValue = (float)$resValue + (float)$addValue;
					}
					unset($addValue);

					//将运算后的结果去更新参数 or 变量
					if ($opt_arr[0]['type'] == 'parameter') {
						$paras[$opt_arr[0]['value']] = $resValue;
					} else {
						$vars[$opt_arr[0]['value']] = $resValue;
					}

					break;
				case "jian" :
					//判断 - 后面值的类型，参数 or 变量 or 数值
					if ($opt_arr[$i + 1]['type'] == '' || $opt_arr[$i + 1]['type'] == 'var') {
						$jianValue = $vars[$opt_arr[$i + 1]['value']];
					} else if ($opt_arr[$i + 1]['type'] == 'parameter') {
						$jianValue = $paras[$opt_arr[$i + 1]['value']];
					} else {
						$jianValue = $opt_arr[$i + 1]['value'];
					}

					//判断值的类型  日期 or 数值
					if (strpos($resValue, '-')) {
						$resValue = date('Y-m-d', strtotime($resValue) - (float)$jianValue * 24 * 60 * 60);
					} else {
						$resValue = (float)$resValue - (float)$jianValue;
					}
					unset($jianValue);

					//将运算后的结果去更新参数 or 变量
					if ($opt_arr[0]['type'] == 'parameter') {
						$paras[$opt_arr[0]['value']] = $resValue;
					} else {
						$vars[$opt_arr[0]['value']] = $resValue;
					}

					break;
				case "cheng" :
					//判断 * 后面值的类型，参数 or 变量 or 数值
					if ($opt_arr[$i + 1]['type'] == '' || $opt_arr[$i + 1]['type'] == 'var') {
						$chengValue = $vars[$opt_arr[$i + 1]['value']];
					} else if ($opt_arr[$i + 1]['type'] == 'parameter') {
						$chengValue = $paras[$opt_arr[$i + 1]['value']];
					} else {
						$chengValue = $opt_arr[$i + 1]['value'];
					}

					$resValue = (float)$resValue * (float)$chengValue;
					unset($chengValue);

					//将运算后的结果去更新参数 or 变量
					if ($opt_arr[0]['type'] == 'parameter') {
						$paras[$opt_arr[0]['value']] = $resValue;
					} else {
						$vars[$opt_arr[0]['value']] = $resValue;
					}

					break;
				case "chu" :
					//判断 / 后面值的类型，参数 or 变量 or 数值
					if ($opt_arr[$i + 1]['type'] == '' || $opt_arr[$i + 1]['type'] == 'var') {
						$chuValue = $vars[$opt_arr[$i + 1]['value']];
					} else if ($opt_arr[$i + 1]['type'] == 'parameter') {
						$chuValue = $paras[$opt_arr[$i + 1]['value']];
					} else {
						$chuValue = $opt_arr[$i + 1]['value'];
					}

					$resValue = (float)$resValue / (float)$chuVvalue;
					unset($chuValue);

					//将运算后的结果去更新参数 or 变量
					if ($opt_arr[0]['type'] == 'parameter') {
						$paras[$opt_arr[0]['value']] = $resValue;
					} else {
						$vars[$opt_arr[0]['value']] = $resValue;
					}

					break;
				default :
					//将结果直接去更新参数 or 变量
					if ($opt_arr[0]['type'] == 'parameter') {
						$paras[$opt_arr[0]['value']] = $resValue;
					} else {
						$vars[$opt_arr[0]['value']] = $resValue;
					}

					break;
			}
		}
		unset($opt_arr);

		$this -> paras = $paras;	// 将参数重写回
		$this -> vars = $vars;		//将变量重写回
	}

	//获取规则的运算结果
	public function getRuleResult($ruleid, $paras) {
		$ruleObj = new Rule();
		$ruleObj -> getRuleById($ruleid);
		$result = $ruleObj -> getRuleRegResult($paras);
		unset($ruleObj);

		return $result;
	}

	//解析逻辑判断，获取 true or false，true 执行 if 内容， false 执行 else 内容
	public function analyzeLogical($xmldoc) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$logic_condition = $xmldoc -> logic_condition;

		//if条件为空，则直接返回 false
		if (count($logic_condition) == 0)
			return false;

		$left_xml = $logic_condition -> logic_condition_left;
		$center_opt = (string)$logic_condition -> logic_condition_center;
		$right_xml = $logic_condition -> logic_condition_right;

		if ($center_opt == "and") {
			return $this -> analyzeLogical($left_xml) && $this -> analyzeLogical($right_xml);
		} else if ($center_opt == "or") {
			return $this -> analyzeLogical($left_xml) || $this -> analyzeLogical($right_xml);
		} else {
			$lf_type = (string)$left_xml -> logic_condition_left_type;
			$rg_type = (string)$right_xml -> logic_condition_right_type;

			$lf_value = (string)$left_xml -> logic_condition_left_value;
			$rg_value = (string)$right_xml -> logic_condition_right_value;

			//如果参数类型是参数，使用实际参数值替换xml中的参数
			$lf_value = $lf_type == 'parameter' ? $paras["$lf_value"] : $lf_value;
			$rg_value = $rg_type == 'parameter' ? $paras["$rg_value"] : $rg_value;

			//如果参数类型是变量，获取变量值替换xml中的参数
			$lf_value = $lf_type == '' || $lf_type == 'var' ? $vars["$lf_value"] : $lf_value;
			$rg_value = $rg_type == '' || $rg_type == 'var' ? $vars["$rg_value"] : $rg_value;

			//判断是否日期，将日期转为时间戳
			$lf_value = strpos($lf_value, '-') ? strtotime($lf_value) : $lf_value;
			$rg_value = strpos($rg_value, '-') ? strtotime($rg_value) : $rg_value;

			switch($center_opt) {
				case "=" :
					return $lf_value == $rg_value;
					break;
				case "≯" :
					return (float)$lf_value > (float)$rg_value;
					break;
				case "≯=" :
					return (float)$lf_value >= (float)$rg_value;
					break;
				case "≮" :
					return (float)$lf_value < (float)$rg_value;
					break;
				case "≮=" :
					return (float)$lf_value <= (float)$rg_value;
					break;
				default :
					return false;
					break;
			}
		}
	}

	//解析逻辑循环，获取循环条件，条件为 true 执行 foreachcontent 循环体
	public function analyzeForeachCondition($xmldoc) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$foreach_cond = $xmldoc -> foreach_cond;

		if ($foreach_cond -> children() -> getName() == 'dataSource') {
			$data_source = (string)$xmldoc -> foreach_cond -> dataSource;

			$sql = $this -> getDataSource("$data_source");
			$sql = str_replace('≮', '<', $sql);
			$sql = str_replace('≯', '>', $sql);

			foreach ($paras as $key1 => $value1) {
				$key1 = '@' . $key1 . '@';
				$sql = str_replace("%" . $key1 . "%", "'%" . $value1 . "%'", $sql);
				$sql = str_replace($key1, "'" . $value1 . "'", $sql);
			}
			unset($value1);

			foreach ($vars as $key2 => $value2) {
				$key2 = '!' . $key2 . '!';
				$sql = str_replace("%" . $key2 . "%", "'%" . $value2 . "%'", $sql);
				$sql = str_replace($key2, "'" . $value2 . "'", $sql);
			}
			unset($value2);
			
			$data_list = M() -> query($sql);
			unset($sql);

			foreach ($data_list as $val) {
				$this -> analyzeXmlData($xmldoc -> foreach_content, $val);
			}
			unset($data_list);
		} else {
			$condition = array();	// 初始化条件数组

			$logic_condition = $xmldoc -> foreach_cond -> logic_condition;

			$left_xml = $logic_condition -> logic_condition_left;
			$center_opt = (string)$logic_condition -> logic_condition_center;
			$right_xml = $logic_condition -> logic_condition_right;

			$lf_type = (string)$left_xml -> logic_condition_left_type;
			$rg_type = (string)$right_xml -> logic_condition_right_type;

			$lf_value = (string)$left_xml -> logic_condition_left_value;
			$rg_value = (string)$right_xml -> logic_condition_right_value;

			//如果参数类型是参数，使用实际参数值替换xml中的参数
			$lf_value = $lf_type == 'parameter' ? $paras["$lf_value"] : $lf_value;
			$rg_value = $rg_type == 'parameter' ? $paras["$rg_value"] : $rg_value;

			//如果参数类型是变量，获取变量值替换xml中的参数
			$lf_value = $lf_type == '' || $lf_type == 'var' ? $vars["$lf_value"] : $lf_value;
			$rg_value = $rg_type == '' || $rg_type == 'var' ? $vars["$rg_value"] : $rg_value;

			//判断是否日期，将日期转为时间戳
			$lf_value = strpos($lf_value, '-') ? strtotime($lf_value) : $lf_value;
			$rg_value = strpos($rg_value, '-') ? strtotime($rg_value) : $rg_value;

			switch($center_opt) {
				case "=" :
					return $lf_value == $rg_value;
					break;
				case "≯" :
					return (float)$lf_value > (float)$rg_value;
					break;
				case "≯=" :
					return (float)$lf_value >= (float)$rg_value;
					break;
				case "≮" :
					return (float)$lf_value < (float)$rg_value;
					break;
				case "≮=" :
					return (float)$lf_value <= (float)$rg_value;
					break;
				default :
					return false;
					break;
			}
		}
	}

	//解析循环体，计算循环条件
	public function analyzeForeachContent($xmldoc) {
		while ($this -> analyzeForeachCondition($xmldoc)) {
			$this -> analyzeXmlData($xmldoc -> foreach_content);
		}
	}

	//解析将返回数据写入数据表
	public function analyzTableInsert($xmldoc) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$tableinsert_name = (string)$xmldoc -> tableinsert_name;
		$tableinsert_columns = $xmldoc -> tableinsert_columns;

		$data = array();
		foreach ($tableinsert_columns->children() as $child) {
			$table_column_insert = (string)$child -> table_column_insert;
			$table_column_type = (string)$child -> table_column_type;
			$table_column_value = (string)$child -> table_column_value;

			if ($table_column_type == 'parameter') {
				$data["$table_column_insert"] = $paras[$table_column_value];
			} else if ($table_column_type == '' || $table_column_type == 'var') {
				$data["$table_column_insert"] = $vars[$table_column_value];
			} else {
				$data["$table_column_insert"] = $table_column_value;
			}
		}
		unset($child);
		
		$result = M() -> table("$tableinsert_name") -> data($data) -> add();
		//echo M()->getLastSql(),'----test1<br/>';
		unset($data);

		return $result ? "ok" : "error";
	}

	//解析将返回数据更新到数据表
	public function analyzTableUpdate($xmldoc) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$tableupdate_name = (string)$xmldoc -> tableupdate_name;
		$tableupdate_columns = $xmldoc -> tableupdate_columns;

		$data = array();
		foreach ($tableupdate_columns->children() as $child) {
			$table_column_update = (string)$child -> table_column_update;
			$table_column_type = (string)$child -> table_column_type;
			$table_column_value = (string)$child -> table_column_value;

			if ($table_column_value != '') {
				if ($table_column_type == 'parameter') {
					$data["$table_column_update"] = $paras[$table_column_value];
				} else if ($table_column_type == '' || $table_column_type == 'var') {
					$data["$table_column_update"] = $vars[$table_column_value];
				} else {
					$data["$table_column_update"] = $table_column_value;
				}
			}
		}
		unset($child);

		$conds = $this -> analyzTableUpdConds($xmldoc -> tableupdate_conds);		// 获取数据表更新条件设置
		//$conds = '1=2';
		
		$result = M() -> table("$tableupdate_name") -> where($conds) -> data($data) -> save();
		//echo M()->getLastSql(),'----testupdate<br/>';
		unset($data);

		return $result ? "ok" : "error";
	}

	//解析更新表数据设置条件参数
	public function analyzTableUpdConds($xmldoc) {
		$paras = $this -> paras;	// 获取实际传递参数
		$vars = $this -> vars;		// 获取变量值

		$logic_condition = $xmldoc -> logic_condition;

		$left_xml = $logic_condition -> logic_condition_left;
		$center_opt = (string)$logic_condition -> logic_condition_center;
		$right_xml = $logic_condition -> logic_condition_right;

		$lf_type = (string)$left_xml -> logic_condition_left_type;
		$rg_type = (string)$right_xml -> logic_condition_right_type;

		$lf_value = (string)$left_xml -> logic_condition_left_value;
		$rg_value = (string)$right_xml -> logic_condition_right_value;

		//如果参数类型是参数，使用实际参数值替换xml中的参数
		$lf_value = $lf_type == 'parameter' ? $paras["$lf_value"] : $lf_value;
		$rg_value = $rg_type == 'parameter' ? $paras["$rg_value"] : $rg_value;

		//如果参数类型是变量，获取变量值替换xml中的参数
		$lf_value = $lf_type == '' || $lf_type == 'var' ? $vars["$lf_value"] : $lf_value;
		$rg_value = $rg_type == '' || $rg_type == 'var' ? $vars["$rg_value"] : $rg_value;

		switch($center_opt) {
			case "or" :
				return $this -> analyzTableUpdConds($left_xml) . ' or ' . $this -> analyzTableUpdConds($right_xml);
				break;
			case "and" :
				return $this -> analyzTableUpdConds($left_xml) . ' and ' . $this -> analyzTableUpdConds($right_xml);
				break;
			case "=" :
				return $lf_value . "='" . $rg_value . "'";
				break;
			case "≯" :
				return $lf_value . '>' . $rg_value;
				break;
			case "≯=" :
				return $lf_value . '>=' . $rg_value;
				break;
			case "≮" :
				return $lf_value . '<' . $rg_value;
				break;
			case "≮=" :
				return $lf_value . '<=' . $rg_value;
				break;
			default :
				return '0';
				break;
		}
	}

}
?>