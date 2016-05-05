<?php
/**
 * 项目整合关联表
 * 
 * @author cjli
 *
 */
class ProjectRelationModel extends Model
{
	
	/**
	 * 检测表单是否已经关联
	 * 
	 * @param string $form1 表单ID
	 * @param string $form2 表单ID
	 * 
	 * @return boolean
	 */
	public function checkExitsForm($form1, $form2)
	{
		if($form1 == '' || $form2 == ''){
			return false;
		}
		$where = array(
			'formID1' => array(array('eq', $form1), array('eq', $form2), 'OR'),
			'formID2' => array(array('eq', $form1), array('eq', $form2), 'OR'),
		);
		$count = $this->where($where)->count('0');
		return (boolean) $count;
	}
	
	/**
	 * 获取关联列表
	 * 
	 * @param int $uid
	 * 
	 * @return array
	 */
	public function getList($uid, $pro_id = 0)
	{
		$where = array(
			'uid' => $uid,
			//'status' => 1,
		);
		
		if($pro_id){
			$map = array(
				'proID1' => $pro_id,
				'proID2' => $pro_id,
				'_logic' => 'OR'
			);
			$where['_complex'] = $map;
		}
		$list = $this->where($where)->field('formID1,formID2,id,status,updateTime')->select();
		//echo $this->getLastSql();
		if($list){
			foreach($list as &$v){
				$v['formNames1'] = $this->getProjectFromNames($v['formID1']);
				$v['formNames2'] = $this->getProjectFromNames($v['formID2']);
			}
			unset($v);
		}
		return $list;
	}
	
	/**
	 * 获取项目模块等名称信息
	 * 
	 * @param string $form_id 表单ID
	 * 
	 * @return array
	 */
	public function getProjectFromNames($form_id)
	{
		$arr = array();

		//表单
		$formInfo = D('Form')->getFormInfo($form_id);
		
		if(!$formInfo){
			return false;
		}
		$arr[] = $formInfo['formTitle'];
		//流程
		$flow_id = $formInfo['flowID'];
		$flowInfo = M('workflow')->where("flowID='$flow_id'")->field('flowName,moduleID')->find();
		if(!$flowInfo){
			return false;
		}
		$arr[] = $flowInfo['flowName'];
		//模块
		$module_id = $flowInfo['moduleID'];
		$moduleInfo = M("modules")->where("moduleID='$module_id'")->field('moduleName,proID,proType')->find();
		if(!$moduleInfo){
			return false;
		}
		$arr[] = $moduleInfo['moduleName'];
		//项目
		$pro_id = $moduleInfo['proID'];
		switch ($moduleInfo['proType'])
		{
			case 2 :
				$pro_name = M('Apps')->where('ID='.$pro_id)->getField('appName');
				break;
			case 0:
			default:
				$pro_name = M('Projects')->where('ID='.$pro_id)->getField('projectName');
		}
		$arr[] = $pro_name;
		return array_reverse($arr);
	}
	
	/**
	 * 添加表单关联
	 * 
	 * @param int $uid
	 * @param int $proId1
	 * @param int $proId2
	 * @param int $form1 表单ID
	 * @param int $form2 表单ID
	 * 
	 */
	public function addRelation($uid, $proId1, $proId2, $form1, $form2)
	{
		$set = array(
			'uid' => $uid,
			'proID1' => $proId1,
			'proID2' => $proId2,
			'formID1' => $form1,
			'formID2' => $form2,
			'status' => 1,
			'updateTime' => time(),
		);
		
		$id = $this->add($set);
		return $id;
	}
	
	/**
	 * 获取关联信息
	 * 
	 * @param int $id 关联ID
	 * 
	 * @return array
	 */
	public function getRelationInfo($id)
	{
		$info = $this->find($id);
		if(!($info && $info['status'])){
			return false;
		}
		
		if($info['data']){
			$info['data'] = unserialize($info['data']);
		}
		//表单1数据
		$info['form1'] = D('Form')->getFormInfo($info['formID1']);
		$info['form1']['fields'] = D('Form')->getFormFieldInfo($info['formID1']);
		$info['form1']['formNames'] = $this->getProjectFromNames($info['formID1']);
		//表单2数据
		$info['form2'] = D('Form')->getFormInfo($info['formID2']);
		$info['form2']['fields'] = D('Form')->getFormFieldInfo($info['formID2']);
		$info['form2']['formNames'] = $this->getProjectFromNames($info['formID2']);
		
		return $info;
	}
	
	/**
	 * 编辑关联表单信息
	 * 
	 * @param int $id 关联ID
	 * @param array $data 关联IDs
	 * @param array $selected selected fields
	 * 
	 * @return boolean
	 */
	public function editRelation($id, $data, $selected)
	{
		$info = $this->find($id);
		$form_model = D('Form');
		//表单1数据
		$form1 = $form_model->getFormInfo($info['formID1']);
		$form1_fields = $form_model->getFormFieldInfo($form1['ID']);
		//表单2数据
		$form2 = $form_model->getFormInfo($info['formID2']);
		$form2_fields = $form_model->getFormFieldInfo($form2['ID']);

		//explode selected fields
		$selectArr = array();
		if($selected){
			foreach ($selected as $key => $value) {
				if($value == 1) {
					$field = explode('_', $key);
					$selectArr[$field[0]][$field[1]] = 1;
				}
			}
		}
		//获取表单1中没有连线关联字段
		$noneRelationArray = array();
		foreach($form1_fields as $field) {
			if( (! isset($data[$info['formID1']][$field['fieldName']])) && $selectArr[$info['formID1']][$field['fieldName']]){
				$noneRelationArray[$field['fieldName']] =  $field['controlType'];				
			}
		}
		//把表单1中没关联的字段加入到表单2中
		if(! empty($noneRelationArray)) {

			list($new2_xml, $newRelationArray) = $this->editFormXml($noneRelationArray, $form1['xmlData'], $form2['xmlData']);
			
			$data[$info['formID1']] = array_merge($data[$info['formID1']], $newRelationArray);
			$data[$info['formID2']] = array_flip($data[$info['formID1']]);
			//修改表单2的xml
			$affect = $form_model->updFormStructInfo($form2['ID'], $new2_xml);
			if(!$affect){
				return false;
			}
		} else{
			$new2_xml = $form2['xmlData'];
		}
		//表单2中剩余字段加入表单1中
		$noneRelationArray = array();
		foreach($form2_fields as $field){
			if( (! isset($data[$info['formID2']][$field['fieldName']])) && $selectArr[$info['formID2']][$field['fieldName']]){
				$noneRelationArray[$field['fieldName']] =  $field['controlType'];				
			}
		}
		if(! empty($noneRelationArray)) {

			list($new1_xml, $newRelationArray) = $this->editFormXml($noneRelationArray, $new2_xml, $form1['xmlData']);
			
			$data[$info['formID2']] = array_merge($data[$info['formID2']], $newRelationArray);
			$data[$info['formID1']] = array_flip($data[$info['formID2']]);
			$affect = $form_model->updFormStructInfo($form1['ID'], $new1_xml);
			if(!$affect){
				return false;
			}
		}

		$set = array(
				'data' => serialize($data),
				'updateTime' => time(),
			);
			$this->where( array('id' => $id) )->save( $set );
	}
	
	/**
	 * 修改表单XML
	 * 
	 * @param array $field_name array(字段名称 => 类型)
	 * @param xml $xml1 来源表单xml
	 * @param xml $xml2 修改表单xml
	 * 
	 * @return xml
	 */
	public function editFormXml($fields, $xml1, $xml2)
	{
		$xmlData1 = simplexml_load_string(str_replace('\\"', '"', $xml1));
		$xmlData2 = simplexml_load_string(str_replace('\\"', '"', $xml2));

		$return_relation_array = array();
		//XML2
		$xmlData2 = objectToArray($xmlData2);

		foreach ($fields as $field_name => $field_type) {

			$from_control = $xmlData1 -> xpath("control[@name='".$field_name."']");
			if(!$from_control){
				continue;
			}
			
			//总数+1
			$total_number = $xmlData2['@attributes']['number'];
			$total_number = $total_number + 1;
			$xmlData2['@attributes']['number'] = $total_number;
			
			//总属性数＋1
			if($xmlData2['control'][1]['@attributes']['type'] == "CCTabs"){
				$ccTabs_Property = $xmlData2['control'][1]['property'];
				
				foreach ($ccTabs_Property as $key => $property) {
					/*if($property['@attributes']['name'] == 'CCTabElements'){
						$xmlData2['control'][1]['property'][$key]['@attributes']['value'] += 1;
					} */
					//单控件数＋1
					// else 
						if($property['@attributes']['name'] == 'CCTabNumbers') {
						$numbers = $property['number'];
						$is_has_number = 0;
						foreach ($numbers as $k2 => $number) {
							if($number['@attributes']['name'] == $field_type){
								$xmlData2['control'][1]['property'][$key]['number'][$k2]['@attributes']['value'] += 1;
								$is_has_number = 1;
								break;
							}
						}
						if(! $is_has_number){
							$numbers_count = count($numbers);
							//echo $numbers_count;exit;
							$xmlData2['control'][1]['property'][$key]['number'][$numbers_count] = array(
								'@attributes' => array(
									'name' => $field_type,
									'value' => 1
									)
								);
						}
						break;
					}
					
				}
			}


			//添加属性控件名称
			$control_name = $field_type.$total_number;
			$new_control_array = array(
				'@attributes' => array(
					'value' => $control_name
				)
			);
			$count_property = count($xmlData2['control'][2]['property']);
			$xmlData2['control'][2]['property'][$count_property] = $new_control_array;
						
			//最大控件ID
			$last_control_id = $total_number;

			//$control_name = 'CCTextBox7';
			//$last_control_id = 7;

			
			$insert_xml2_control = objectToArray($from_control[0]);
			$insert_xml2_control['@attributes']['id'] = $total_number;
			$insert_xml2_control['@attributes']['name'] = $control_name;
			//print_r($insert_xml2_control);exit;
			
			$control_count = count($xmlData2['control']);

			$xmlData2['control'][$control_count] = $insert_xml2_control;

			$return_relation_array[$field_name] = $control_name;
			
		}

		//change xml2
		//print_r($xmlData2);exit;

		$xml = $this->arrtoxml($xmlData2);
		return array($xml, $return_relation_array);
	}
	
	/**
	 * 表单xml数组转xml
	 */
	private function arrtoxml($arr)
	{
    	$xml = '<controls number="'.$arr['@attributes']['number'].'">';
    
	    foreach ($arr['control'] as $key => $val) {
	        $xml .='<control';
	        //控件属性
	        if(isset($val['@attributes']) && $val['@attributes']) {
	        	foreach($val['@attributes'] as $k => $v){
	        		$xml .=  ' '. $k.'="'.$v.'"';
	        	}
	        	$xml .='>';
	        }
	        //属性下的值列表
	        if(is_array($val['property'])){
	        	foreach ($val['property'] as $kp => $vp) {
	        		$xml .='<property';
	        		//只有一个属性值
	        		if($kp === '@attributes'){
	        			foreach ($vp as $vpk => $vpv) {
	        				$xml .=  ' '. $vpk.'="'.$vpv.'"';
	        			}
	        			$xml .='/>';
	        			continue;
	        		}
	        		
	        		if(isset($vp['@attributes']) && $vp['@attributes']) {
			        	foreach($vp['@attributes'] as $k => $v){
			        		$xml .=  ' '. $k.'="'.$v.'"';
			        	}
			        }
			        unset($vp['@attributes']);
			        if(! empty($vp)){
			        	$xml .='>';
			        } else {

			        	$xml .='/>';
			        }

			        if(isset($vp['number']) && $vp['number']){
			        	foreach ($vp['number'] as $kn => $vn) {
			        		$xml .='<number';
			        		if(isset($vn['@attributes']) && $vn['@attributes']) {
					        	foreach($vn['@attributes'] as $k => $v){
					        		$xml .=  ' '. $k.'="'.$v.'"';
					        	}
					        } else{
					        	foreach($vn as $k => $v){
					        		$xml .=  ' '. $k.'="'.$v.'"';
					        	}
					        }
					        $xml .='/>';
			        	}
			        	$xml .='</property>';
			        }

			        if(isset($vp['item']) && $vp['item']){
			        	foreach ($vp['item'] as $ki => $vi) {
			        		$xml .='<item value="'.($ki+1).'">'.$vi.'</item>';
			        		
			        	}
			        	$xml .='</property>';
			        }
	        	}
	        	$xml .='</control>';
	        }
	    }
	    $xml .='</controls>';
	    return $xml;
	}
	
	/**
	 * 获取关联表单修改
	 * 
	 * @param int $form_id 表单ID
	 * 
	 * @return array
	 */
	public function getRelationForm( $form_id )
	{
		$where = array(
			'formID1' => array('eq', $form_id),
			'formID2' => array('eq', $form_id),
			'_logic'  => 'OR'
		);
		return $this->where($where)->find();
	}
	
	/**
	 * 同步表单数据
	 * 
	 * @param int $form_id 表单ID
	 * @param	int		$frm_data_id 表单数据记录ID
	 * @param	json	$form_data 表单数据信息，json对象
	 * 
	 * @return mixed
	 */
	public function syncFormData($form_id, $frm_data_id = 0, $form_data = array())
	{
		//获取关联信息
		$relation_info = $this->getRelationForm($form_id);
		if(! $relation_info){
			return false;
		}

		//另一表单ID
		$relation_form_id = $relation_info['formID1'] ? $relation_info['formID1'] : $relation_info['formID2'];
		//关联字段
		$relation_form_data = unserialize($relation_info['data']);
		if( empty($relation_form_data) ) {
			return false;
		}

		$form_data = (array)$form_data;
		
		//对应表单的字段及值
		$new_form_data = array();
		foreach( $relation_form_data[$relation_form_id] as $rel_field => $rel_value){

			$new_form_data[$rel_field] = $form_data[$rel_value];
		}

		 return D('Form')->saveFormDataInfo($relation_form_id, $frm_data_id, (object)$new_form_data, false);
	}

}