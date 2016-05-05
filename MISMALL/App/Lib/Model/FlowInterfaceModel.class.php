<?php
/**
 * 流程公共接口模型
 */
 class FlowInterfaceModel extends CommonModel
 {
 	/**
	 * 保存设置的流程公共接口
	 * @param    int       $userId     用户ID
	 * @param    array     $params     flow_interface表里字段
	 * @return   int       数据ID
	 */
	 public function saveFlowInterface($userId, $params)
	 {
	 	if(!$params) return 0;
		
		$proId = trim($params["proId"]);
		if(!$proId) return 0;
		
		$flowInterface = M("flow_interface");
		$result = $flowInterface -> where("pro_id=$proId") -> find();
		
		$data["pro_id"] = $proId;
		foreach($params as $key=>$val) {
			if($key == "userInterface") {
				$data["loginPath"] =$val;
			}
			if($key == "tStayA") {
				$data["stayPath"] =$val;
			}
			if($key == "auditPath") {
				$data["auditPath"] =$val;
			}
			if($key == "formStructure") {
				$data["formStructure"] = $val;
			}
			if($key == "steps") {
				$data["steps"] = $val;
			}else {
				$data[$key] = $val;
			}
		}
		if($result)
		{
			return $flowInterface -> where("pro_id=$proId") -> save($data);
		}else
		{
			return $flowInterface -> add($data);
		}
	 }
	 
	 /**
	  * 查询流程项目的公共接口
	  * @param     int        $proId     项目ID
	  * @return    array      单行数据数组
	  */
	  public function getInterfaceByProId($proId)
	  {
	  	if(!$proId) return 0;
		
		return M("flow_interface") -> where("pro_id=$proId") -> find();
	  }
	  
		/**
		 * 根据用户获取流程项目公共接口数据
		 * @param      int       $user_id       用户ID 
		 * @param      int       $flowType     流程项目类型 1为公共接口 0为新建流程项目
		 * @param      string    $projectType  项目类型 
		 * @return     array     数组
		 */
		 function getFlowInterByUserId($user_id, $flowType = 0, $projectType = "")
		 {
		 	if(!$user_id) return 0;
			
			$pro = $this -> table("cc_user_project U") -> join("cc_projects P on U.proID=P.ID") 
													    -> join("cc_flow_interface F on F.pro_id=P.ID") ;
			$pro = $pro -> where("U.userID=$user_id and U.flowType=$flowType and  projectType='$projectType'");
			$proList = $pro -> select();
			return $proList;
		 }
		 /**
		  * 根据项目ID获取公共接口地址
		  * @param      int      $proId     项目ID 
		  * @return     array    单行数组
		  */
		  function getStayPathByProId($proId)
		  {
		  	if(!$proId) return 0;
			
			return M("flow_interface") -> where("pro_id=$proId") -> find();
		  }
		  /**
		   * 获取待审核关联标识
		   * @param      int      $userId    用户ID
		   * @param      int      $proId     项目ID
		   * @return     array    数组
		   */
		   function getUserInterface($userId, $proId)
		   {
		   		if(!$proId) return 0;
				
				return M("user_project") -> where("userID=$userId and proID=$proId") -> find();
		   }
		   	/**
			 * 获取用户应用工厂中所有项目列表
			 * @param	int		$user_id 当前用户ID
			 * @param   string  $pro_type  项目类型
			 * @param   int     $flow_type 流程项目类型
			 * @return	array	$pro_list 用户所有项目的ID，名称数据，二维数组
			 */
			public function getUserFlowProjectList($user_id, $pro_type = "", $flow_type = 0) {
				if (!$user_id)
					return array();
				$pro = $this -> table("cc_user_project U") -> join("cc_projects P on U.proID=P.ID") -> where("U.userID=$user_id");
				if($pro_type)
				{
					$pro = $pro -> where("U.userID=$user_id and U.projectType='$pro_type' and U.flowType=$flow_type");
				}
				$pro_list = $pro -> field('U.proID, P.projectName') -> order('proID') -> select();
		
				return $pro_list ? $pro_list : array();
			}
			/**
			 * 识别电脑还是APP访问网站
			 */
			public function is_mobile_request()  
			{  
		 	  $_SERVER['ALL_HTTP'] = isset($_SERVER['ALL_HTTP']) ? $_SERVER['ALL_HTTP'] : '';  
			  $mobile_browser = '0';  
			  if(preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|iphone|ipad|ipod|android|xoom)/i', strtolower($_SERVER['HTTP_USER_AGENT'])))  
			    	$mobile_browser++;  
			  if((isset($_SERVER['HTTP_ACCEPT'])) and (strpos(strtolower($_SERVER['HTTP_ACCEPT']),'application/vnd.wap.xhtml+xml') !== false))  
		   		    $mobile_browser++;  
			  if(isset($_SERVER['HTTP_X_WAP_PROFILE']))  
			    	$mobile_browser++;  
			  if(isset($_SERVER['HTTP_PROFILE']))  
			    	$mobile_browser++;  
			  $mobile_ua = strtolower(substr($_SERVER['HTTP_USER_AGENT'],0,4));  
			  $mobile_agents = array(  
			        'w3c ','acs-','alav','alca','amoi','audi','avan','benq','bird','blac',  
			        'blaz','brew','cell','cldc','cmd-','dang','doco','eric','hipt','inno',  
			        'ipaq','java','jigs','kddi','keji','leno','lg-c','lg-d','lg-g','lge-',  
			        'maui','maxo','midp','mits','mmef','mobi','mot-','moto','mwbp','nec-',  
			        'newt','noki','oper','palm','pana','pant','phil','play','port','prox',  
			        'qwap','sage','sams','sany','sch-','sec-','send','seri','sgh-','shar',  
			        'sie-','siem','smal','smar','sony','sph-','symb','t-mo','teli','tim-',  
			        'tosh','tsm-','upg1','upsi','vk-v','voda','wap-','wapa','wapi','wapp',  
			        'wapr','webc','winw','winw','xda','xda-' 
			        );  
			  if(in_array($mobile_ua, $mobile_agents))  
			    	$mobile_browser++;  
			  if(strpos(strtolower($_SERVER['ALL_HTTP']), 'operamini') !== false)  
			    	$mobile_browser++;  
			  // Pre-final check to reset everything if the user is on Windows  
			  if(strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'windows') !== false)  
			    	$mobile_browser=0;  
			  // But WP7 is also Windows, with a slightly different characteristic  
			  if(strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'windows phone') !== false)  
			    	$mobile_browser++;  
			  if($mobile_browser>0)  
			    return true;  
			  else
			    return false; 
		    }  
 }
