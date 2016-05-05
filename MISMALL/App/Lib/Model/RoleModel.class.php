<?php
/**
 * 角色管理模型
 * @author  皮振华
 */
 class RoleModel extends CommonModel
 {
 	/**
	 * 新增部门
 	 * @param   string $commpanyName 部门名称
	 * @param   int    $user_id 当前用户 ID
	 * @param   int    $pro_id  当前项目ID
	 * @param   int    $nodeId  当前节点ID 
	 * @return  int    返回ID 
	 */
	 public function addCommpany($user_id, $commpanyName, $pro_id, $nodeId) 
	 {
	 	
		$data["companyName"] = $commpanyName;
		$data["userID"] = $user_id;
		$data["proId"] = $pro_id;
		$data["nodeId"] = $nodeId;
		$data["createTime"] = NOW_TIME;
		
		$comId = M("company") -> add($data);
		unset($data);
		return $comId;
	 }
	 /**
	  * 获取部门信息
	  * @param   int $pro_id  项目ID 
	  * @param   int $nodeId  部门节点ID
	  * @param   array  返回数组
	  */
	  public function getCommpanyInfo($pro_id, $nodeId = 0)
	  {
		if(!$pro_id) return 0;
		
		$com_info = M("company") -> where("proId=$pro_id and nodeId=$nodeId") -> select();
		
		return $com_info ? $com_info : 0;
	  }
	  /**
	   * 根据部门ID获取部门信息
	   * @param   int    $comId  部门ID
	   * @return  array  返回数组
	   */
	   public function getCompanyById($comId)
	   {
	   	if(!$comId) return 0;
		
		$com_info = M("company") -> where("ID=$comId") -> find();
		
		return $com_info ? $com_info : 0;
	   }
	   /**
	    * 对应部门ID添加职位
	    * @param    int     $comId   部门ID
	    * @param    string  职位名称 
	    * @return   int     添加数据的ID  
	    */
	    public function addJobs($comId, $jobsName)
	    {
			if(!$comId || !$jobsName) return 0;
			
			$data["companyId"] = $comId;
			$data["jobsName"] = $jobsName;
			$data["createTime"] = NOW_TIME;
			
			$jobsId = M("jobs") -> add($data);
			return $jobsId ? $jobsId : 0;
	    }
		/**
		 * 获取部门下所有职位
		 * @param   int    $comId    部门ID
		 * @return  array  返回数组
		 */
		 public function getJobsByComId($comId)
		 {
		 	if(!$comId) return 0;
			
			$jobsList = M("jobs") -> where("companyId=$comId")-> select();
			return $jobsList ? $jobsList : 0;
		 }
		 /**
		  * 获取部门和职位
		  * @param   int   $comId   部门ID
		  * @param   int   $jobsId  职位ID
		  */
		  public function getComJobsInfoById($comId = 0, $jobsId = 0)
		  {
		  	$list  = M() -> table("cc_company c")
						 -> join("cc_jobs j on c.ID = j.companyId");
		 	if($comId && !$jobsId)
		 	{
		 		$list = $list -> where("c.ID=$comId") -> select();
		 	}else if($comId && $jobsId)
		 	{
		 		$list = $list -> where("c.ID=$comId and j.ID=$jobsId") -> find();
		 	}else 
		 	{
		 		$list = 0;
		 	}
			return $list;
		  }
	
 }
 
?>