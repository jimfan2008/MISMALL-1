<?php
      //header("content-type:text/html;charset=utf-8");
      //importORG("ApiManage.ApiManageEnter");
      //require_once LIB_PATH."ORG/Interface/oss/InterfaceOss.class.php";
      //require_once '@.ORG.Interface.oss.InterfaceOss';
      //import('Interface.oss.InterfaceOss',LIB_PATH.'ORG/','.class.php');
      //header("Content-type: text/html; charset=utf-8");
      
      /**
       *   接口入口类
      */
      class ApiManageAction extends BaseAction 
      {
         // private $return = array('code'=>'200','message'=>'success','data'=>'');
		 // private $path;
		  private $_project_id = 0;
		  private $_site_id = 0;
		  
          protected function _initialize(){
          	/**/
          	//$path = LIB_PATH."ORG/Interface/";
			$this->_site_id = I("post.siteId",0,"intval"); //只限制数字
			//echo $this->_site_id;
			$this->_project_id = D('UserSite')->getSiteInfo($this->_site_id, 'userProjectId');  //获取应用数据库ID
		    if(!$this->_project_id){}
				//$this->ajaxError("项目不存在！");
			
          }
		  
		  /**
		   * 保存api配置信息
		   */
		  public function apiSave(){
			  $data['id'] = I('post.apiId','0');
			  $data['params'] = json_encode($_POST['params']);
			  $data['alias'] = json_encode($_POST['alias']);
			  $data['apiResultJson'] = json_encode($_POST['apiResultJson']);
			  $data['apiName'] = I('post.apiName','');
			  $data['apiUrl'] = I('post.apiUrl','');
			  $data['method'] = I('post.method','GET');
			  
		     // D('ApiManage')->changeDB($this->_project_id); 修改为全局调用
		  	  $result = D("ApiManage")->apiSave($data);
			  echo $result;  

		  }

          /**
		   * 根据apiID删除
		   */
          function deleteApiById(){
          	 $id = I('id','0','intval');
			 //D('ApiManage')->changeDB($this->_project_id);
			 echo D('ApiManage')->deleteApiById($id);
          }
		  
		  /**
		   * 提交api进行审核
		   */
		  function ciAuditApiById(){
		  	 $id = I('id', '0', 'intval');
			 echo D('ApiManage') -> ciAuditApiById($id);
		  }
		  
		  /**
		   * 获取所有的api信息
		   */
		  function getApisInfo()
		  {
		  	//D("ApiManage")->changeDB($this->_project_id);
		  	$where = array('create_user' => session('uid'), 'status' => 2, '_logic' => 'or');
			$order = array('create_time' => 'desc');
			//$field = '*,case when create_user='.session('uid').' then 1 else 0 end as isLock';
		  	$result = D("ApiManage") -> getApisInfo($where, $order, $field);
			$this->ajaxSuccess($result, "apiList", "");
		  }
		  
          
          function index()
          {
          	/**  unzip -o -d /home/sunny myfile.zip
			 *  1.上传zip接口文件
			 *  2.后台处理zip接口文件
			 *  3.注册接口
			 *  4.获取接口列表
			 *  5.前端公共入口方法  ??与前端沟通后实现
			 *  6.接口文件规范
			 *    6.0 压缩包文件目前仅支持zip格式
			 *    6.1 接口文件解压后,包括如下:
			 *        6.1.1 config.xml 文件名不能变
			 *        6.1.2 Interface.class.php, 文件名自定,但类方法必须为静态方法,且需要在config.xml中填写
			 *    6.2 注意config.xml文件节点规则,如示例文件
			 *    6.3 注意Interface.class.php类方法必须为静态方法
			 *    6.4 注意config.xml与Interface.class.php文件关系
			 */    
               $this->display();
          }
		  
		  /**
		   *  接口统一入口
		   */
		  function enter()
		  {
		  	//var data = {"interfaceName":"oss","interfaceEnter":"InterfaceOss","interfaceFunc":"createbucket","bucketName":"aaa","acl":"public-read-write"};
		  	//获取参数
		  	// echo "enter"; exit;
		  	
		  /*	$params = array (
			  'interfaceName' => 'oss',
			  'interfaceEnter' => 'InterfaceOss',
			  'interfaceFunc' => 'createbucket',
			  'bucketName' => 'aaa',
			  'acl' => 'public-read-write',
			); */
		  	
		  	 $params = I("post.");
		  	 /*前三个参数固定不变*/
			 $interfaceName = $params["interfaceName"]; 
			 $interfaceEnter = $params["interfaceEnter"];
			 $interfaceFunc = $params["interfaceFunc"];
			 
			 importORG('ApiManage.'.$interfaceName.'.'.$interfaceEnter);
			 
			 $msg = $interfaceEnter::$interfaceFunc($params);
			 echo $msg;
		  }

		  
		  /**
		   * api动作解析入口
		   */
		  function apiParse()
		  {
		  	    $params = I("post.");
				$apiId = $params['apiId'];
				//根据apiId获取apiManage信息
				//D("ApiManage")->changeDB($this->_project_id);
				$apiManage = D("ApiManage")->getApiById($apiId);
				$url = $apiManage['apiUrl'];
				$method = $apiManage['method'];
				$apiParams = json_decode($apiManage['params'],TRUE);
				
				$isGroup = false; //后续用其它方式标注一下
				foreach ($apiParams as $key => $value){
					if(!$isGroup){
						if($value['isGroup'] == 'true')
						{
							$isGroup = true;
					    }
					}
				}

                $i = 0;
				$query;
	            $header;  //百度api store习惯将部分参数放入HttpHeader中
                if($isGroup && $method == 'POST'){
                	foreach ($apiParams as $key => $value)
					{
						
						$isSet = false;
						//如果等于true 则从页面传过来参数取值
						if($value['isSet'] == 'true'){
							$isSet = true;
						}
						
						
						//判断该参数是否加入HttpHeader中,兼容百度store
						if($value['isHeader'] == 'true'){
							//如果该参数为false,则直接取api配置时信息
							if(!$isSet){
								$header[$i] = $key.':'.$value['val'];
							}
	                        //否则取用户动态传入的参数
							else {
								$header[$i] = $key.':'.$params[$key];
							}
							$i++;
						}else{
							$pvalue;
							if($isSet){
								$pvalue = $params[$key];
							}
							else{
								$pvalue = $value['val'];
							}
							if($value['paramType'] == 'file' && $value['dataType'] == 'base64'){
								//如果等于base64则转换值
								$fileData = file_get_contents($pvalue);
								$pvalue = array(base64_encode($fileData));
							}
							
							//如果是分组参数
							if($value['isGroup'] == 'true'){
								$query['params'][0][$key] = $pvalue;
							}
							else{
								$query[$key] = $pvalue;
							}
						}
					 }
					$ch = curl_init();
					//如果存在将参数加入Header的设置
					if( $header ){
		                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);	
					}
					curl_setopt($ch, CURLOPT_POST, TRUE);
					curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($query));
			    	curl_setopt($ch, CURLOPT_URL, $url);
			    	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				 	$result = curl_exec($ch);
					echo $result;
					
                }else{
					if($apiParams) {
						foreach ($apiParams as $key => $value)
						{
							//判断该参数是否加入HttpHeader中,兼容百度store
							if($value['isHeader'] == 'true'){
								//如果该参数为false,则直接取api配置时信息
								if($value['isSet'] == 'false'){
									$header[$i] = $key.':'.$value['val'];
								}
		                        //否则取用户动态传入的参数
								else {
									$header[$i] = $key.':'.$params[$key];
								}
								$i++;
							}else{
								//如果该参数为false,则直接取api配置时信息
								if($value['isSet'] == 'false'){
									$query[$key] = $value['val'];
								}
		                        //否则取用户动态传入的参数
								else {
									$query[$key] = $params[$key];
								}
							}
						}
					}	
					
					$queryStr = http_build_query($query);
					$ch = curl_init();
					//如果存在将参数加入Header的设置
					if( $header ){
		                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);	
					}
					
					if($method == "GET"){
						if($queryStr){
							$url .= "?".$queryStr;
						}
					}
					else {
						curl_setopt($ch, CURLOPT_POST, TRUE);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $queryStr);
					}
			    	curl_setopt($ch, CURLOPT_URL, $url);
			    	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				 	$result = curl_exec($ch);
					echo $result;
					//$this->ajaxReturn($result, 'JSONCN');
					//$this->ajaxSuccess($result,'api执行结果');
                }
		  }

          /**
		   * api获取执行结果,配置动作结果
		   */
          function apiParseTest(){
          	    $apiParams = I("post.");
				$url = $apiParams['apiUrl'];
				$method = $apiParams['method'];
				//标识是否存在参数分组的情况
				$isGroup = $apiParams['isGroup']; 
				$params = $_POST['params'];
				$header; //Header参数
				$i = 0;
				$data;
				
				//print_r($params);exit;
				
				if($method == 'POST' && $isGroup){
					foreach ($params as $key => $value) {
						if($value['isHeader'] == 'true'){
							$header[$i] = $key.':'.$value['value'];
						}else{
							$pvalue;
							if($value['paramType'] == 'file'){
								//非常量
								if($value['dataType'] == 'base64'){
									//文件二进制
									//$fileData = file_get_contents(C('UPLOAD_PATH').$value['value']);
									$fileData = file_get_contents($value['value']);
									$pvalue = array(base64_encode($fileData));
								}
								else{
									$pvalue = C('UPLOAD_READ').$value;
								}
							}
							else{
								//常量
								$pvalue = $value['value']; 
							}
							
							if($value['isGroup'] == 'true'){
								$data['params'][0][$key] = $pvalue;
							}
							else{
								$data[$key] = $pvalue;
							}
						}
						$i++;
					}
					$ch = curl_init();
					/*$header = array(
				        'Content-Type:application/x-www-form-urlencoded',
				        'apikey: 1b0ed61ba9cca4a0e9aa8604b2ba944c',
				    );*/
					
					$data = json_encode($data);
					
					//echo $data;
					if( $header ){
		                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);	
						//print_r($header);
					}
					
					curl_setopt($ch, CURLOPT_POST, TRUE);
					curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
					
			    	curl_setopt($ch, CURLOPT_URL, $url);
			    	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
					echo curl_exec($ch);
					
				}
				else {  //以下老版本解析方式
					$queryStr = "";
					foreach ($params as $key => $value) {
						if($value['isHeader'] == "true"){
							$header[$i] = $key.':'.$value['value'];
						}else{
							$queryStr .= $key.'='.$value['value'].'&';
						}
						$i++;
					}
					
	                //去掉最后一个字符
					$queryStr = substr($queryStr, 0,strlen($queryStr)-1);
					$ch = curl_init();
					//$url = $apiUrl;
					//如果存在将参数加入Header的设置
					if( $header ){
		                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);	
						//print_r($header);
					}
					//如果是GET形式则无需考虑参数分组的情况
					if($method == "GET"){
						if($queryStr){
							$url .= "?".$queryStr;
							//echo $url;
						}
					}
					else {
						curl_setopt($ch, CURLOPT_POST, TRUE);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $queryStr);
					}
			    	curl_setopt($ch, CURLOPT_URL, $url);
			    	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
					echo curl_exec($ch);
				}
          }
		  
		  /**
		   * 获取api结果配置信息
		   */
		  function getApiResult(){
		  	
		  }
		  
          
		  /**
		   *  xml TO Array
		  */
		  function xml_to_array($xml)                              
		  {                                                        
			  $array = (array)(simplexml_load_string($xml));  
			  /*foreach ($array as $key=>$item){                       
			    $array[$key]  =  $this->struct_to_array((array)$item);      
			  } */                                                     
			  return $array;                                         
		  }
			                                                        
		  function struct_to_array($item) {                        
		  if(!is_string($item)) {                                
			    $item = (array)$item;                                
			    foreach ($item as $key=>$val){                       
			      $item[$key]  =  $this->struct_to_array($val);             
			    }                                                    
			  }                                                      
			  return $item;                                          
		  } 
			  
		  /**
		   *  根据注册接口名称获取config
		   *  $name 注册接口名称
		   */
          function getPathByName($name)
          {
          	//单个接口对应的路径
          	return LIB_PATH."ORG/ApiManage/".$name."/config.xml";
          }
          
		  /**
		   * xml转换成数组
		   */
		  function xmlToArray()
		  {
		  	
		  }
          
          /**
           *  上传压缩文件
           */
          function uploadFile()
          {
              if($_FILES['apiFile'])
              {
                  $path = LIB_PATH."ORG/ApiManage/";
                  $fileName = $path.$_FILES['apiFile']['name'];   //文件名
                  $tempName = $_FILES['apiFile']['tmp_name'];     //临时文件名称               
                  move_uploaded_file($tempName, $fileName);       //上传文件
                  $interfaceName = $_POST['apiName'];   //接口名称
                  $interfacePath = $path.$interfaceName;      //如:Lib/ORG/Interface/接口名称
                  if (!file_exists($interfacePath)) 
                  {
                    sleep(1); //程序休眠一秒
                    if(mkdir($interfacePath,0777) && file_exists($fileName))
                    {
                        $zip=new ZipArchive();
                        if($zip->open($fileName)===TRUE)
                        {
                            $zip->extractTo($interfacePath);
                            $zip->close();
                        }
						//注册接口
						$this->regInterface($interfaceName);
                        //删除上传压缩包
                        unlink($fileName);
                    }
                    else
                    {
                        echo "创建目录失败";
                    }
                  }
              }
			  else{
				 echo "error";	
			   }
              //$this->display('index');
          }
          
          /**
           * 注册接口
          */
          function regInterface($itemName)
          {
          	//$itemName="pay";    
            $path = LIB_PATH."ORG/ApiManage/config.xml";
            $dom = new DOMDocument;
            $dom->load($path);
		 	$root = $dom->documentElement;  //获取根节点
		 	
			/******************************/
			//此处获取item总量,后续找一下直接统计的方法
			$index = 0;
			$items = $root->getElementsByTagName("item");
			foreach ($items as $item) {
				$index++;
			}
			/*****************************/
            
  			//创建属性
			$id = $dom->createAttribute("id");
			$value = $dom->createTextNode($index+1);
			$id->appendChild($value);
			
		    $newItem = $dom->createElement("item",$itemName);
			$newItem->appendChild($id);
			$root->appendChild($newItem);
			$dom->save($path);
			
          }
		  
		  
      }
      
 
 ?>