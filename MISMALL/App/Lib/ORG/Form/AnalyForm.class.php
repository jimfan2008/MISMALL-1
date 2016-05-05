<?php

/**
 * 解析表单xml数据，扩展类
 * 获取表单中的基本属性数据
 * 获取表单控件，各控件属性
 * @author	胡志强
 */

final class AnalyForm {

	private $xml;		// 定义表单xml数据对象

	/**
	 * 构造函数
	 */
	public function __construct($xml_str) {
		$this -> xml = simplexml_load_string(str_replace('\\"', '"', $xml_str));
	}

	/**
	 * 获取表单基础信息
	 * @param	string	$xml_str 表单数据
	 * @return array 	表单信息，一维数组
	 */
	public function getFormBaseInfo() {
		$control = $this -> xml -> xpath("control[@type='CCForm']");
		$form_id = (string)$control[0] -> attributes() -> name;
		$propertys = $control[0] -> property;
		$form_title = (string)$propertys[0] -> attributes() -> value;
		$form_type = (string)$propertys[1] -> attributes() -> value;

		$data = array('formID' => $form_id, 'formTitle' => $form_title, 'formType' => $form_type);

		return $data ? $data : array();
	}

	/**
	 * 获取表单控件信息
	 * @return	array 	返回控件名称集合，一维数组
	 */
	public function getFormControlsInfo() {
		$controls = $this -> xml -> xpath("control[@type='CCTabElements']");

		$fields_array = array();
		foreach ($controls as $control) {
			$propertys = $control -> property;
			foreach ($propertys as $pvalue) {
				$control_name = (string)$pvalue -> attributes() -> value;
				if (substr($control_name, 0, 7) !== 'CCTable') {
					$field['controlName'] = $control_name;
					$control_info = $this -> xml -> xpath("control[@name='" . $field['controlName'] . "']");
					$field['controlType'] = $control_info[0] -> attributes() -> type;
					array_push($fields_array, $field);
				}
			}
			unset($pvalue, $propertys);
		}
		unset($control, $controls);

		return $fields_array;
	}

	/**
	 * 获取各控件详细信息
	 * @param	string	$control_name 控件名称
	 * @return	array 	控件的详细信息，一维数组
	 */
	public function getAControlInfo($control_name = null) {
		if (!$control_name || $control_name == '')
			return false;

		$control = $this -> xml -> xpath("control[@name='" . $control_name . "']");
		$control_type = (string)$control[0] -> attributes() -> type;

		$property_title = $control[0] -> xpath("property[@name='Title']");
		$property_text_format = $control[0] -> xpath("property[@name='TextFormat']");

		$control_info_array = array();
		$control_info_array['fieldName'] = $control_name;
		$control_info_array['fieldTitle'] = (string)$property_title[0] -> attributes() -> value;
		$control_info_array['controlType'] = $control_type;

		if ($control_type === 'CCTextBox') {
			$control_info_array['TextFormat'] = (string)$property_text_format[0] -> attributes() -> value;
		}

		return $control_info_array;
	}
	
	/**
	 * 获取各控件详细的属性设置
	 * @param	string	$control_name 控件名称
	 * @return	array 	控件的详细信息，一维数组
	 */
	public function getAControlProperty($control_name = null) {
		if (!$control_name || $control_name == '')
			return false;

		$control = $this -> xml -> xpath("control[@name='" . $control_name . "']");
		$property_lists = $control[0] -> xpath("property");
		
		return $property_lists;
	}

	/**
	 * 获取下拉框，单选框，复选框控件的元素显示值
	 * @param	string		$control_name 控件名称
	 * @param	int			$control_value 控件元素值
	 * @param	string		返回控件元素的显示值
	 */
	public function getControlItemInfo($control_name = null, $control_value = 0) {
		if (!$control_name || $control_value == 0)
			return false;

		$control = $this -> xml -> xpath("control[@name='" . $control_name . "']");
		$property = $control[0] -> xpath("property[@name='Items']");

	}

	/**
	 * 获取表单内表格基本数据
	 * @return array 	$tables_info_array 表格信息，二维数组
	 */
	public function getFormTableBaseInfo() {
		$control = $this -> xml -> xpath("control[@type='CCTable']");

		$tables_info_array = array();
		foreach ($control as $cvalue) {
			$table_id = (string)$cvalue -> attributes() -> id ? (string)$cvalue -> attributes() -> id : 0;

			$property = $cvalue -> xpath("property[@name='Title']");
			$form_title = (string)$property[0] -> attributes() -> value;
			$property1 = $cvalue -> xpath("property[@name='CCTableElements']");
			$elements = (string)$property1[0] -> attributes() -> value;

			$table_info_array['tableID'] = $table_id;
			$table_info_array['formTitle'] = $form_title;
			$table_info_array['elements'] = $elements;

			array_push($tables_info_array, $table_info_array);
		}
		unset($cvalue);

		return $control ? $tables_info_array : array();
	}

	/**
	 * 获取表单表格的字段信息
	 * @param	string		$tab_elements_id 表格的CCTableElements属性值
	 * @return	array 		$tab_fields_array 表格控件，一维数组
	 */
	public function getTabFieldInfo($tab_elements_id = null) {
		if (!$tab_elements_id || $tab_elements_id == '')
			return false;

		$tab_control = $this -> xml -> xpath("control[@id='" . $tab_elements_id . "']");
		$tab_propertys = $tab_control[0] -> property;

		$tab_fields_array = array();
		foreach ($tab_propertys as $tpvalue) {
			array_push($tab_fields_array, (string)$tpvalue -> attributes() -> value);
		}
		unset($tpvalue);

		return $tab_control ? $tab_fields_array : array();
	}

	/**
	 * 获取表格控件详细信息
	 * @param	string	$control_name 表格控件名称
	 * @return	array 	控件的详细信息，一维数组
	 */
	public function getATabControlInfo($control_name = null) {
		if (!$control_name || $control_name == '')
			return false;

		$tab_control = $this -> xml -> xpath("control[@name='" . $control_name . "']");
		$property_title = $tab_control[0] -> xpath("property[@name='Title']");
		$property_text_format = $tab_control[0] -> xpath("property[@name='TextFormat']");

		$control_type = (string)$tab_control[0] -> attributes() -> type;

		$control_info_array = array();
		$control_info_array['fieldName'] = $control_name;
		$control_info_array['fieldTitle'] = (string)$property_title[0] -> attributes() -> value;
		$control_info_array['controlType'] = $control_type;

		if ($control_type === 'CCTextBox') {
			$control_info_array['TextFormat'] = (string)$property_text_format[0] -> attributes() -> value;
		}

		return $control_info_array;
	}

}
?>