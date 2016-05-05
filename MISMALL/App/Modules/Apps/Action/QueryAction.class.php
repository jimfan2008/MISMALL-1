<?php

/**
 * 查询分析器模块控制器
 * 接收查询分析器中操作方法数据
 */
class QueryAction extends BaseAction {

	
	/**
	 * 获取表单设计器的数据
	 * @param	string		$querier_id 查询ID
	 * @return	json 		返回查询的详细json信息
	 */
	public function getExistQuery(){
		$querier_id = I('post.querier_id', '', 'trim');

		echo json_encode_cn( D('Query') -> getExistQuery($querier_id));
	}
	/**
	 * 获取表单设计器xml的数据
	 * @param	string		xml_str xml信息
	 * @return	json 		返回查询的详细json信息
	 */
	public function getTableTitleExist(){
		$xml_str = I('post.xml_str', '', 'trim');
		echo json_encode_cn( D('Query') -> getTableTitleExist($xml_str));
	} 
	
	/**
	 * 获取表单设计器xml的数据
	 * @param	string		xml_str xml信息
	 * @return	json 		返回查询的详细json信息
	 */
	public function getExsitConditions(){
		$xml_str	= I('post.xml_str', '', 'trim');
		
		echo json_encode_cn(D('Query') ->getExsitConditions($xml_str));
	}
	
	/**
	 * 获取数据源的保存名字
	 * @param	string		$querier_id 查询ID
	 * @return	json 		返回查询的详细json信息
	 */
	public function getQueryTableName(){
		$querier_id = I('post.querier_id', '', 'trim');

		echo json_encode_cn( D('Query') -> getQueryTableName($querier_id));
	}
	
	/*
	 * 获取系统变量的表单控件
	 * @param sting   $tid  表单ID
 	 * @return json    返回查询的详细json信息
	 * */
	 public function getSysFields(){
	 	$tid	= I('post.tid', '', 'trim');
		
		echo json_encode_cn(D('Query')->getSysFields($tid));
	 }
	 
	 /*
	 * 通过传过来的xml的frmID查询tableId
	 * @param sting   $frmID  表单ID
 	 * @return json    返回查询的详细json信息tableID
	 * */
	 public function getTname(){
	 	$frmID = I('post.frmID', '', 'trim');
		
		echo D('Query')->getTname($frmID);
	 }
	 
	 /**
	 * 通过传过来的queryID查询xml
	 * @param sting   ID  queryID
 	 * @return json    返回查询的详细json信息xmlData
	 * */
	 public function getExistXmlInfo(){
	 	$queryID = I('post.queryID', '', 'trim');
		echo D('Query')->getExistXmlInfo($queryID);
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

		echo $frm_info['xmlData'];
	}
	
	/*
	 * 获取系统变量的信息
	 * @param null
 	 * @return json    返回查询的详细json信息系统变量信息
	 * */
	public function getSysParams() {
		echo json_encode_cn(D('Query')->getSysParams());
	}
	
}
?>