<?php
/**
 * 问答控制器
 */
 class WendaAction extends HomeAction
 {
 	
 	
	function login()
	{
		$this -> display();
	}
	function main()
	{
 		//获取用户信息
 		
 		if( ! $_SESSION["uid2"]) {
 			$this->redirect("Wenda/login");
 		}
		$anList = $this->getAnswerList();
		$this -> assign("anList", $anList);
		$this -> display();
	}
	function menu()
	{
		$this -> display();	
	}
	function ask()
	{
		//获取用户信息
 		if( ! $_SESSION["uid2"]) {
 			$this->redirect("Wenda/login");
 		}
		$this -> display();
	}
	function answer()
	{
		$askId = I("get.askid", 0, "intVal");
		$askInfo = D("wenda_ask") -> where("id=$askId") -> find();
		$this -> assign("askInfo", $askInfo);
		$this -> display();
	}
	function problem()
	{
		//获取用户信息
 		if( ! $_SESSION["uid2"]) {
 			$this->redirect("Wenda/login");
 		}
		
		$askList = $this -> getStayAnswer();
		
		$this -> assign("askList",$askList);
		$this -> display();
	}
	/**
	 * 验证登录
	 */
	function isLoginInfo()
	{
		$userEmail = I("post.userEmail", "", "trim");
		$pwd = I("post.pwd", "", "trim");
		$pwd = md5($pwd);
		$data["userEmail"] = $userEmail;
		$data["userPwd"] = $pwd;
		
		$result = D("wenda_user") ->field("id") -> where($data) -> find();
		if($result) {
			$_SESSION["uid2"] = $result["id"];
			echo $result["id"];exit;
		}
		echo 0;
	}
	/**
	 * 保存提问
	 */
	 function saveAsk()
	 {
		$data["title"] = I("post.title", "" ,"trim");
		$data["describe"] = I("post.describe", "" ,"trim");
		$data["price"] = I("post.price", "" ,"trim");
		$data["userId"] = $_SESSION["uid2"];
		
		$userStr = I("post.userStr", "" ,"trim");
		$userList = explode(',', $userStr);
		
	 	$result = D("wenda_ask") ->  add($data);
		
		foreach($userList as $key => $val) {
			$data2["askId"] = $result;
			$data2["appointUserId"] = $val;
			D("wenda_appoint") -> add($data2);
		};
		echo $result;
	 }
	 /**
	  * 取所有用户
	  */
	  function getAllUser()
	  {
	  	$userList = D("wenda_user") -> field("id,surname,name") -> select();
		
		if($userList) {
			echo json_encode_cn($userList);exit;
		}
		echo 0;
	  }
	  /**
	   * 查询待答问题
	   */
	   function getStayAnswer()
	   {
	   	 $userId = $_SESSION["uid2"];
	   	 $answerlist = M() -> table("cc_wenda_appoint as A") -> join("cc_wenda_ask Q on A.askId=Q.id") -> where("appointUserId=$userId and isAnswer=0") -> select();
		 return $answerlist;
	   }
	   /**
	    * 保存回答内容
	    */
	    function saveAnswerInfo() 
	    {
	    	$userId = $_SESSION["uid2"];
	    	$askId = I("post.askId", 0, "intVal");	
	    	$data["userId"] = $userId;
			$data["userAskId"] = $askId;
			$data["content"] = I("post.content", "", "trim");
			$data["createTime"] = time();
			
			$result = D("wenda_answer") -> add($data);
			
			if($result) {
				unset($data);
				$data2["isAnswer"] = 1;
				D("wenda_appoint") -> where("askId=$askId and appointUserId=$userId") -> save($data2);
				echo $result;exit;
			}
			echo 0;
	    }
		/**
		 * 取已回答的问题
		 */
		 function getAnswerList()
		 {
		 	$answerList = M() -> table("cc_wenda_answer as R") -> join("cc_wenda_ask as A on R.userAskId=A.id") -> join("cc_wenda_user as U on U.id=R.userId") -> order ("R.id desc")->select();
		 	return $answerList;
		 }
		
 }
