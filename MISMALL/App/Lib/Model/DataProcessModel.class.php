<?php

/**
 * 数据处理模型，负责表单数据的读取与数据的回写
 * @author : hzq
 * time : 20140507
 */
class DataProcessModel extends Model {
	/**
	 * 构造函数
	 */
	public function __construct() {
		parent::__construct();
		$this->_initialize();
	}

	/**
	 * 回调方法 初始化模型
	 */
	protected function _initialize() {
		$project_id = session('pid');
		$project_info = D('PlatForm')->getAProjectDetails($project_id);
		$this->db('p' . $project_id, D('PlatForm')->projectDbLink($project_id));
		unset($project_info);
	}

	/**
	 * 验证回写请求的名称可用
	 * @param	string	$to_flow 请求回写数据的目标流程ID
	 * @param	string	$dw_name 数据回写请求名称
	 * @return	boolen	名称可用返回1 不然返回0
	 */
	public function checkDataRewriteName($to_flow, $name) {
		if ($to_flow == '' || $name == '') {
			return 0;
		}

		$dw_id = $this->table(C('DB_PREFIX') . 'datacube')->where("toFlow='$to_flow' and cubeName='$name'")->getField('ID');

		return $dw_id ? 0 : 1;
	}

	/**
	 * 添加数据回写请求
	 * @param	array 	回写请求的基本信息
	 * @return	boolen	返回请求添加成功标识
	 */
	public function addADataRewrite($post) {
		$data['cubeID'] = 'cube' . date('YmdHis', time()) . rand(1000, 9999);
		$data['toFlow'] = $post['toFlow'];
		$data['fromFlow'] = $post['fromFlow'];
		$data['fromForm'] = $post['fromForm'];
		$data['xmlData'] = $post['xmlData'];
		$data['cubeName'] = $post['cubeName'];
		$data['status'] = 0;
		$data['createTime'] = time();
		$id = $this->table(C('DB_PREFIX') . 'datacube')->data($data)->add();

		return $id ? 1 : 0;
	}

	/**
	 * 删除指定的回写请求
	 * @param	string	$dw_id 待删除回写请求的ID
	 * @return	boolen	返回回写请求删除成功标识
	 */
	public function delADataWrite($dw_id) {
		if ($dw_id == '') {
			return 0;
		}

		$res = $this->table(C('DB_PREFIX') . 'datacube')->where("ID='$dw_id'")->delete();

		return $res ? 1 : 0;
	}

	/**
	 * 获取发送请求流程下的所有数据回写请求
	 * @param	string	$flow_id 发送请求流程ID
	 * @return	array 	返回流程下的所有的回写请求信息
	 */
	public function getFlowDataRewrite($flow_id) {
		if ($flow_id == '') {
			return 0;
		}

		$data_list = $this->table(C('DB_PREFIX') . 'datacube')->where("fromFlow='$flow_id'")->field('ID, cubeID, cubeName, fromFlow, xmlData,xmlData1,status')->order('ID')->select();

		return $data_list;
	}

	/**
	 * 获取被请求的流程里下还未响应的数据回写请求
	 * @param   int  	$flow_id 被请求的流程ID
	 * @return  array
	 */
	public function getFlowDataRewriteByStatus($flow_id) {
		if (!$flow_id) {
			return 0;
		}

		$data_list = $this->table(C('DB_PREFIX') . 'datacube')->where("toFlow=$flow_id and status='0'")->field('ID, cubeID, cubeName, fromFlow, xmlData,status')->order('ID')->select();

		return $data_list;
	}

	/**
	 * 获取数据回写请求的详细设置
	 * @param	int		$dw_id 回写请求ID
	 * @return	array	返回请求的xml数据
	 */
	public function getDataCubeXmlInfo($dw_id) {
		if ($dw_id == '' || $dw_id == 0) {
			return 0;
		}

		$xml_info = $this->table(C('DB_PREFIX') . 'datacube')->where("ID=$dw_id")->field('xmlData, xmlData1')->find();

		return $xml_info;
	}

	/**
	 * 获取回写请求的参数
	 * @param	string	$dw_id 回写请求ID
	 * @return	array 	返回参数数组
	 */
	public function getFrmDataRewParas($dw_id) {
		if ($dw_id == '') {
			return 0;
		}

		$xml_info = $this->getDataCubeXmlInfo($dw_id);
		$xml_data = str_replace("\\\"", "\"", $xml_info['xmlData']);
		$xmldoc = simplexml_load_string($xml_data);
		$paras = $xmldoc->xpath('parameters/parameter');

		$paras_list = array();
		foreach ($paras as $para) {
			$para_list = array();
			$para_list['name'] = (string) $para->pname->attributes()->name;
			$para_list['title'] = (string) $para->pname;

			array_push($paras_list, $para_list);
		}
		unset($para, $paras, $xml_info);

		return $paras_list;
	}

	/**
	 * 保存回写请求的处理
	 * @param	array 	$post 回写处理的提交数据
	 * @return	boolen	返回请求更新结果
	 */
	public function saveDataWriteHandel($post) {
		$post['status'] = 1;
		$post['handleTime'] = time();

		$res = $this->table(C('DB_PREFIX') . 'datacube')->data($post)->save();
		return $res ? 1 : 0;
	}

	/**
	 * 获取数据表名
	 * @param	string	$tab_id 数据表ID
	 * @return	string	返回数据表名
	 */
	public function getDataTableName($tab_id) {
		if ($tab_id == '') {
			return 0;
		}

		$table_name = $this->table(C('DB_PREFIX') . 'table_directory')->where("tableID='$tab_id'")->getField('tableName');

		return $table_name;
	}

	/**
	 * 调用回写去更新数据表
	 * @param	string	$table_name 需要更新的数据表名称
	 * @param	array	$data 需要更新的数据
	 * @param	string	$condition 数据更新条件
	 * @return	boolen	返回数据表数据更新成功标识
	 */
	public function updFrmDataRewrite($table_name, $data, $condition) {
		if ($table_name == '' || $condition == '') {
			return 0;
		}

		$res = $this->table($table_name)->where($condition)->data($data)->save();

		return $res ? 1 : 0;
	}

	/**
	 * 解析更新条件，获取 true or false
	 * @param 	obj		$logic_condition 待解析的xml对象
	 * @param	obj		$rel_paras 参数对应真实数据
	 * @return string	返回更新条件
	 */
	public function analyzeUpdateCondition($logic_condition, $rel_paras) {
		// 条件为空，则直接返回 0
		if (count($logic_condition) == 0) {
			return 0;
		}

		$left_xml = $logic_condition->logic_condition_left;
		$center_opt = (string) $logic_condition->logic_condition_center;
		$right_xml = $logic_condition->logic_condition_right;

		if ($center_opt === 'and') {
			return $this->analyzeUpdateCondition($left_xml->logic_condition, $rel_paras) . " AND " . $this->analyzeUpdateCondition($right_xml->logic_condition, $rel_paras);
		} else if ($center_opt === 'or') {
			return "(" . $this->analyzeUpdateCondition($left_xml->logic_condition, $rel_paras) . " OR " . $this->analyzeUpdateCondition($right_xml->logic_condition, $rel_paras) . ")";
		} else {
			$left_value = (string) $left_xml->logic_condition_left_value;
			$right_value = (string) $right_xml->logic_condition_right_value;
			$rel_right_value = $rel_paras[$right_value];

			switch ($center_opt) {
				case '=':
					return $left_value . "='" . $rel_right_value . "'";
					break;
				case '≯':
					return $left_value . ">" . $rel_right_value;
					break;
				case '≯=':
					return $left_value . ">=" . $rel_right_value;
					break;
				case '≮':
					return $left_value . "<" . $rel_right_value;
					break;
				case '≮=':
					return $left_value . "<=" . $rel_right_value;
					break;
				default:
					return 0;
					break;
			}
		}
	}

	/**
	 * 执行指定的数据回写，返回是否成功标识
	 * @param	int		$dw_id 执行的回写的ID
	 * @param	array 	$rel_paras 当前表单控件真实值
	 * @return	boolen	返回回写的执行结果
	 */
	public function execADataWrite($dw_id, $rel_paras) {
		if ($dw_id == 0) {
			return 0;
		}

		$xml_info = $this->getDataCubeXmlInfo($dw_id);
		$xml_data = str_replace("\\\"", "\"", $xml_info['xmlData1']);
		$xmldoc = simplexml_load_string($xml_data);
		$datatables = $xmldoc->table;

		$res = 0;
		// 循环更新 table
		foreach ($datatables as $datatable) {
			$tabid = $datatable->attributes()->id;
			$tabName = $this->getDataTableName($tabid);

			$paras_list = $datatable->xpath("parameters/parameter");
			$conds_list = $datatable->xpath("conditions/logic_condition");

			foreach ($paras_list as $para) {
				$field_name = (string) $para->cname;
				$field_value = (string) $para->pname;

				$data["$field_name"] = $rel_paras[$field_value];
			}
			unset($para, $paras_list);

			$condition = $this->analyzeUpdateCondition($conds_list[0], $rel_paras);
			$res = $this->updFrmDataRewrite($tabName, $data, $condition);
			unset($data);
		}
		unset($datatable, $datatables);

		return $res ? 1 : 0;
	}

}
?>