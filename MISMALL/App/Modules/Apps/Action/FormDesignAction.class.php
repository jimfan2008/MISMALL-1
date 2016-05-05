<?php

/**
 * 表单设计模块控制器
 * 接收表单操作数据，提供给表单模型
 */

class FormDesignAction extends BaseAction {

	/**
	 * 获取表单信息数据
	 * @param	int		$fid 表单ID
	 * @return json		返回表单的详细数据
	 */
	public function getFormInfo() {
		$id = I('post.id', 0, 'intval');

		echo json_encode_cn( D('Form') -> getFormInfo($id));
	}

	/**
	 * 获取表单xml数据信息
	 * @param	int		$fid 表单ID
	 * @return xml	返回表单的详细xml数据
	 */
	public function getFormXml() {
		$id = I('post.id', 0, 'intval');
		$frm_info = D('Form') -> getFormInfo($id);

		echo $frm_info['xmlData'];
	}

	/**
	 * 检查保存表单数据记录的唯一性
	 * @param	string	$field_name  表单控件字段名称
	 * @param	string	$field_value 表单控件字段值
	 * @param	int		$form_id	 表单ID
	 * @return	int		返回检查结果，允许写入返回1，不允许返回0
	 */
	public function chkFormDataRecord() {
		$field_name = I('post.cid', '', 'trim');
		$field_value = I('post.value', '', 'trim');
		$form_id = I('post.form_id', 0, 'intval');
		$data_id = I('post.data_id', 0, 'intval');

		echo D('Form') -> chkFormDataRecord($form_id, $data_id, $field_name, $field_value);
	}
    
    /**
     * 获取表单数据信息
     * @param   json    $post_data 接收表单数据信息
     * @return  bool    返回保存成功标识
     */
    public function saveFormDataInfo() {
        $post_data = json_decode(str_replace("\\\"", "\"", I('post.data_str', '', 'trim')));

        $form_id = (int)$post_data -> form_id ? (int)$post_data -> form_id : 0;
        $data_id = (int)$post_data -> data_id ? (int)$post_data -> data_id : 0;
        $flow_id = (string)$post_data -> flow_id;
        $form_data = $post_data -> form_data;

        echo D('Form') -> saveFormDataInfo($form_id, $data_id, $form_data);
    }

	/**
	 * 验证表单标题名称
	 * @param	string		$flow_id 表单所处流程ID
	 * @param	string		$form_name 表单名称
	 * @return	bool		表单验证成功标识，不可用返回false，可用返回true
	 */
	public function chkFormTitle() {
		$flow_id = I('post.flow_id', '', 'trim');
		$form_title = I('post.form_title', '', 'trim');

		echo D('Form') -> chkFormTitle($flow_id, $form_title);
	}

	/**
	 * 查询当前表单的可用数据源
	 * @param	int		$form_id 表单ID
	 * @return	json	返回数据源相信信息
	 */
	public function getExsitSources() {
		$form_id = I('post.formid', '', 'trim');

		echo json_encode_cn( D('Form') -> getExsitSources($form_id));
	}

	/**
	 * 删除当前表单指定数据源
	 * @param	int		$form_id 表单ID
	 * @return	boolen	返回删除成功标识
	 */
	public function delExsitSources() {
		$query_id = I('post.queryid', '', 'trim');

		echo D('Form') -> delExsitSources($query_id);
	}

	/**
	 * 获取当前表单所属的流程
	 * @param	int		$form_id 表单ID
	 * @return	string	返回查询的流程ID
	 */
	public function getFlowID() {
		$form_id = I('post.formid', 0, 'intval');

		echo D('Form') -> getFlowID($form_id);
	}

	/**
	 * 查询数据源设置数据
	 * @param	int		$querier_id 数据源ID
	 * @return	string	返回数据源设置xml数据
	 */
	public function getDataSourceXml() {
		$querier_id = I('post.querier_id', 0, 'intval');

		echo D('Query') -> getDataSourceXml($querier_id);
	}

	/**
	 * 调用数据源数数据并筛选
	 * @param	int		$id 数据源ID
	 * @param	string	$field_name 筛选的字段名
	 * @return	array	返回查询到的指定字段的数据
	 */
	public function filterDataFromQuerier() {
		$id = I('post.id', 0, 'intval');
		$field_name = I('post.field_name', '', 'trim');

		echo json_encode_cn( D('Form') -> filterQuerierData($id, $field_name));
	}

	/**
	 * 获取指定数据源名称及字段名称
	 * @param	int		$querier_id 查询的数据源ID
	 * @param	string	$field 查询的字段
	 * @return	json	返回数据源名称及字段名称
	 */
	public function getAQuerierNameAndField() {
		$querier_id = I('post.querier_id', 0, 'intval');
		$field_name = I('post.field', '', 'trim');

		echo json_encode_cn( D('Query') -> getAQuerierNameAndField($querier_id, $field_name));
	}

	/**
	 * 获取指定的文件上传
	 * @param	string		$file_src 指定上传文件的路径
	 * @param	int			$form_id 当前表单ID
	 * @return	boolen		返回文件上传是否成功标识
	 */
	public function uploadAFile() {
		$file_src = I('post.file_src', '', 'trim');
		$form_id = I('post.form_id', 0, 'intval');

		echo D('Form') -> uploadAFile($form_id, $file_src);
	}

	/**
	 * 根据数据表名查询表单结构查询
	 * @param	string	$table_name 数据表名称
	 * @return	string	返回表单结构xml数据
	 */
	public function getFormXmlByTable() {
		$table_name = I('post.table_name', '', 'trim');

		echo D('Form') -> getFormXmlByTable($table_name);
	}

	/**
	 * 绑定数据源查询数据到表单表格中
	 * @param	string		$query_sql 数据源解析出的sql
	 * @return	string		返回数据
	 */
	public function getTableDataByQuerySql() {
		$query_sql = I('post.sql', '', 'trim');

		$return_data = array();
		$query_data = D('Form') -> querySql($query_sql);
		foreach ($query_data as $value) {
			$data_tmp = implode(',', $value);

			array_push($return_data, $data_tmp);
		}
		unset($value, $query_data);

		print_r($return_data);
	}
	
	/**
	 * 根据系统变量类型查找系统变量信息
	 * @param	string		sysParamType 系统变量类型
	 * @return	stirng 		返回数据
	 */
	public function getSysParamInfo() {
		$sysParamType = I('post.sysParamType', '', 'trim');

		echo D('Form') -> getSysParamInfo($sysParamType);
	}

}
?>