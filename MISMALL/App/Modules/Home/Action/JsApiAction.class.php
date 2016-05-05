<?php
    class JsApiAction extends HomeAction{
    	
    	 /**
           *  上传压缩文件
           */
          function uploadFile()
          {
          	print_r($_FILES);
			print_r($_POST);
              if($_FILES['file'])
              {
                  $path = LIB_PATH."ORG/JsApi/";
                  $fileName = $path.$_FILES['file']['name'];   //文件名
                  $tempName = $_FILES['file']['tmp_name'];     //临时文件名称               
                  move_uploaded_file($tempName, $fileName);       //上传文件
                  $JsApiName = $_POST['apiName'];   //接口名称
                  $apiPath = $path.$JsApiName;      //如:Lib/ORG/Interface/接口名称
                  if (!file_exists($apiPath)) 
                  {
                    sleep(1); //程序休眠一秒
                    if(mkdir($apiPath,0777) && file_exists($fileName))
                    {
                        $zip=new ZipArchive();
                        if($zip->open($fileName)===TRUE)
                        {
                            $zip->extractTo($apiPath);
                            $zip->close();
                        }
						//注册接口
						//$this->regInterface($JsApiName);
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
    }
?>