<?php 
/**
 * 表单管理模型
 * @author 皮振华
 */
class FlowFormModel extends CommonModel
{
	/**
	 * 取出流程项目下表单模块
	 * @param    int    proId   流程项目ID
	 * @return   array  返回数组
	 */
	 public function getModulesByProId($proId)
	 {
	 	if(!proId) return 0;
		
		$modules = M("modules") -> where("proID=$proId") -> select();
		return $modules ? $modules : 0;
	 }
	/**
	 * 取出表单模块
	 * @param    int    $mId   流程项目ID
	 * @return   array  返回数组
	 */
	 public function getModulesByMId($mId)
	 {
	 	if(!$mId) return 0;
		
		$modules = M("modules") -> where("moduleID='$mId'") -> find();
		return $modules ? $modules : 0;
	 }
	 /**
	  * 取模块下表单列表 
	  * @param     int    $mId   模块ID 
	  * @return    array  返回数组
	  */
	  public function getFormInfoByMId($mId)
	  {
	  	if(!$mId) return 0;
		
		$formInfo = M("form_info") -> where("modulesId='$mId'") -> select();
		return $formInfo ? $formInfo : 0;  	
	  }
	  /**
	   * 保存流程xml文件
	   * @param    int      $formId  表单ID
	   * @param    string   $xml     xml文件
	   * @param    int      $userId  用户ID
	   * @return   数据ID 
	   */
	   public function saveFlowXml($formId, $xml, $userId)
	   {
	   	if(!$formId) return 0;
		
		$flowId = "flow".date("YmdHis").rand(1000,9999);
		$data["flowID"] = $flowId;
		$data["formID"] = $formId;
		$data["createUser"] = $userId;
		$data["xmlData"] = $xml;  
		
		$fID = M("workflow") -> add($data);
		unset($data);
		if($fID) 
		{
			$data2["flowID"] = $flowId;
			$result = M("formInfo") ->where("ID=$formId") -> save($data2);
			unset($data,$data2);
			return $result;
		}
		return 0;
	   }
	   /**
	    * 更新xml
	    * @param   string    $flowID   流程号
	    * @param   string    $xml      xml结构
	    * @return  数 据ID
	    */
	    public function updateXml($flowId, $xml) 
	    {
	    	if(!$flowId) return 0;
			$data["xmlData"] = $xml;
			$result = M("workflow") ->where("flowID='$flowId'") -> save($data);
			unset($data);
			if($result)
			{
				return $result;
			}
			return 0;
	    }
		/**
		 * 取流程xml结构
		 * @param    string    $flowId     流程ID
		 * @return   array     
		 */
		 public function getFlowXML($flowId)
		 {
		 	if(!$flowId) return "";
			
			$workFlow = M("workflow") -> field("xmlData") -> where("flowID='$flowId'") -> find();
			if($workFlow) {
				return $workFlow;
			}
			return 0;
		 }
} 
?>