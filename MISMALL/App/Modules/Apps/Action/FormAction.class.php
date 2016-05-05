<?php

/**
 * 前端表单模块控制器
 * time : 20140119
 */
class FormAction extends BaseAction {

	public function index() {
		$this -> formid = I('get.formid', 0, 'intval');
		$this -> display();
	}

	public function indextest() {
		$this -> formid = I('get.formid', 0, 'intval');
		$this -> display();
	}

	public function edit() {
		$this -> formid = I('get.formid', 0, 'intval');
		$this -> dataid = I('get.dataid', 0, 'intval');
		$this -> display();
	}

	public function view() {
		$this -> formid = I('get.formid', 0, 'intval');
		$this -> dataid = I('get.dataid', 0, 'intval');
		$this -> display();
	}

	public function lists() {
		$this -> formid = I('get.formid', 0, 'intval');
		$this -> display();
	}

	/**
	 * 获取表单xml数据信息
	 * @param	int	$id 表单ID
	 * @return xml	返回表单的详细xml数据
	 */
	public function getFormXml() {
		$id = I('post.id', 0, 'intval');
		$frm_info = D('Form') -> getFormInfo($id);

		echo $frm_info['xmlData'];
	}

	/**
	 * 提供前端表单字段信息
	 * @param	int		$form_id 表单ID
	 * @return json 	$field_info 表单存储数据信息
	 */
	public function getFormFieldInfo() {
		$id = I('post.formid', 0, 'intval');

		echo json_encode_cn( D('Form') -> getFormFieldInfo($id));
	}

	/**
	 * 获取表单存储数据记录数
	 * @param	int		$form_id 表单ID
	 * @return	int		表单的记录数
	 */
	public function getFormDataRecordsNum() {
		$id = I('post.formid', 0, 'intval');

		echo D('Form') -> getFormDataRecordsNum($id);
	}

	/**
	 * 提供表单数据到前端
	 * @param	int		$form_id 表单ID
	 * @return json 	$form_info 表单存储数据信息
	 */
	public function getFormDataInfo() {
		$id = I('post.formid', 0, 'intval');
		$page = I('post.page', 1, 'intval');
		$records = I('post.records', 50, 'intval');

		echo json_encode_cn( D('Form') -> getFormDataInfo($id, $page, $records));
	}

	/**
	 * 删除表单数据记录
	 * @param	int		$form_id 要删除数据的表单ID
	 * @param 	array 	$id_arr 要删除的表单数据ID的集合
	 * @return	int 	数据删除成功标识，成功返回1，失败返回0
	 */
	public function delFormDataRecord() {
		$post_data = json_decode(str_replace("\\\"", "\"", I('post.data_str', '', 'trim')));

		$form_id = (string)$post_data -> formid;
		$ids_arr = (array)$post_data -> ids_arr;
		echo D('Form') -> delFormDataRecord($form_id, $ids_arr);
	}

	/**
	 * 获取表单单条记录详细信息
	 * @param	int		$form_id 表单ID
	 * @param	int		$record_id 表单记录ID
	 * @return	json 	返回单条记录详细信息
	 */
	public function getAFormDataInfo() {
		$form_id = I('post.formid', 0, 'intval');
		$record_id = I('post.recordid', 1, 'intval');

		echo json_encode_cn( D('Form') -> getAFormDataInfo($form_id, $record_id));
	}

	/**
	 * 保存表单数据信息
	 * @param	json	$post 表单数据信息， json数据
	 * @return	bool	返回保存成功标识
	 */
	public function saveFormDataInfo() {
		$post_data = json_decode(str_replace("\\\"", "\"", I('post.data_str', '', 'trim')));

		$form_id = (string)$post_data -> form_id;
		$data_id = (string)$post_data -> data_id;
		$form_data = $post_data -> form_data;

		echo D('Form') -> saveFormDataInfo($form_id, $data_id, $form_data);
	}

	/**
	 * 提供表单单条记录中表格数据信息
	 * @param	int		$form_id 表单ID
	 * @param	int		$table_id 表单表格的登记ID
	 * @param	int		$frm_record_id 表单的记录ID
	 * @return	json	返回读取的表格的信息记录
	 */
	public function getAFormRecordTableDataInfo() {
		$form_id = I('post.formid', 0, 'intval');
		$table_id = I('post.tableid', 0, 'intval');
		$frm_record_id = I('post.frm_record_id', 0, 'intval');

		echo json_encode_cn( D('Form') -> getAFormRecordTableDataInfo($form_id, $table_id, $frm_record_id));
	}

	/**
	 * 查询表单中单个表格所有数据
	 * @param	int		$form_id 表单ID
	 * @param	int		$table_id 表单表格的登记ID
	 * @return	json	返回读取的表格的信息记录
	 */
	public function getFormTableDataInfo() {
		$form_id = I('post.formid', 0, 'intval');
		$table_id = I('post.tableid', 0, 'intval');

		echo json_encode_cn( D('Form') -> getFormTableDataInfo($form_id, $table_id));
	}

	/**
	 *
	 */
	public function getFormImage() {

	}

	/**
	 * 调用数据源数数据并筛选
	 * @param   int     $id 数据源ID
	 * @param   string  $field_name 筛选的字段名
	 * @return  array   返回查询到的指定字段的数据
	 */
	public function filterDataFromQuerier() {
		$id = I('post.id', 0, 'intval');
		$field_name = I('post.field_name', '', 'trim');

		echo json_encode_cn( D('Form') -> filterQuerierData($id, $field_name));
	}

}
?>