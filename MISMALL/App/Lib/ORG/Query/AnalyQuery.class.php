<?php

/**
 * 解析表单设计器的xml数据，扩展类
 * 获取表单设计器一些条件和控制
 *
 * @author	cc
 */

final class AnalyQuery {

	private $xml = '';		// 定义表单xml数据对象

	/**
	 * 构造函数
	 */
	public function __construct($xml_str) {
		$this -> xml = simplexml_load_string(str_replace('\\"', '"', $xml_str));
	}
	
	/**
	 * 获取查询的字段标题信息
	 * @return	array 	返回字段的标题信息，一维数组
	 */
	public function getTableTitleExist() {
		$control = $this -> xml -> xpath("field");
		$title = (string)$control[1] -> attributes() -> name;
		$data = array('title' => $title);
		
		return $data ? $data : array();
	}

	/**
	 * 获取右侧title信息
	 * @return	array 	返回查询的字段信息，二维数组
	 */
	public function getAllFieldsInfo() {
		$fields = $this -> xml -> xpath("fields/field");

		$fields_array = array();
		$i = 0;
		foreach ($fields as $value) {
			$fields_array[$i]['name'] 	= (string)$value -> name;
			$fields_array[$i]['value'] 	= (string)$value -> value;
			$fields_array[$i]['display']= (string)$value -> display;
			$fields_array[$i]['type'] 	= (string)$value -> type;
			$fields_array[$i]['sorted'] = (string)$value -> sorted;
			$fields_array[$i]['sorttype'] = (string)$value -> sorttype;
			$fields_array[$i]['group'] = (string)$value -> group;
			$fields_array[$i]['sortvalue'] = (string)$value -> sortvalue;
			++$i;
		}
		unset($value);
		
		return $fields_array ? $fields_array : array();
	}

	/**
	 * 获取右侧conditions查询条件信息
	 * @return 	array 	返回查询中的条件信息，二维数组
	 */
	public function getAllConditionsInfo() {
		$conditions = $this -> xml -> xpath("fields/field");
		
		$condition_array = array();
		$i = 0;
		foreach ($conditions as $value) {
			$condition_array[$i]['name'] = (string)$value -> name;
			$condition_array[$i]['value'] = (string)$value -> value;
			$condition_array[$i]['display'] = (string)$value -> display;
			$condition_array[$i]['conditions'] = $value -> conditions;
			++$i;
		}
		unset($value);
		
		return $condition_array ? $condition_array : array();
	}
	
	/**
	 * 获取查询的sql语句
	 * @return	string	返回查询中的sql语句
	 */
	public function getDataSourceXmlSql() {
        
		return	(string)$this -> xml -> sql;
	}
	
}
?>