<?php
header('content-type:text/html;charset=utf8');
//模拟当前登录用户 后续会从外面传递进来
//$userName="tanglj";

/*
 * ezApp入口方法,进行页面跳转
 */
class BuildAppAction extends Action 
{
	var $APPID="201406171530251111";  //默认应用ID(用作临时图片名称)
	var $fileType=".png";             //默认图片类型
	public function __construct() 
	{
		 //echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
		parent::__construct();
		//产生随机数 
		$this->GenerationRandomNum();
	}
	
    public function index()
    {
	  //$this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px }</style><div style="padding: 24px 48px;"> <h1>:)</h1><p>欢迎使用 <b>ThinkPHP</b>！</p></div><script type="text/javascript" src="http://tajs.qq.com/stats?sId=9347272" charset="UTF-8"></script>','utf-8');
	  $this->display();
    }
	
	
	/**
	 * 创建用户对应的目录
	 */
	public function createUserDir($userName)
	{
		//echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
		
		//当前用户对应的目录,注:创建目录时 一定要给绝对路径
		$FolderPath =$_SERVER['DOCUMENT_ROOT'].C('EZAPP_APPS_SAVEDIRECTORY').$userName; 
		
		//检查当前用户是否存在对应的目录
		if(!is_dir($FolderPath))
		{
			mkdir($FolderPath,0777);	
		}
		//将ezApp目录下的Templete文件夹复制到当前目录下
		$this->copyDir($_SERVER['DOCUMENT_ROOT'].C('EZAPP_TEMPLETE_SAVEDIRECTORY'),$FolderPath); 
	}
	
	
	/**
	 * 产生随机数 年月日时分秒+四位随机数
	 */
	function GenerationRandomNum()
	{
		 $this->APPID = date(YnjGis).rand(1000, 9999);
	}
	
	/**
	 * 复制文件
	 */ 
	function copyDir($source, $destination)
	{
		if (!is_dir($source))
		{
			exit("The Source Directory Is Not Exist!");
		}

		if (!is_dir($destination))
		{
			mkdir($destination, 0700, true);
		}
		$handle = opendir($source);
		while (false !== ($file = readdir($handle)))
		{
			if ($file != "." && $file != ".." && $file != '.svn')
			{
				is_dir("$source/$file")?
				$this->copyDir("$source/$file", "$destination/$file"):
				copy("$source/$file", "$destination/$file");
			}
		}
		closedir($handle);
	}
	
	var $buildResult;
	/*
	 * 生成app
	 */
	public function buildApp()
	{
		if(IS_POST)
		{
		   $userName = $_POST["userName"];
           $appName = $_POST["appName"];
           $webUrl = $_POST["webUrl"];
		   $splashImgPath = $_POST["splashImgPath"];     //启动页面图片名称
		   $appIcoPath = $_POST['appIcoPath'];           //应用桌面图标地址,如/cycc/uploads/Avatar/539ff781cc801_100_100.png
		   $appTitle = $_POST['appTitle'];
		   $appType = $_POST['appType'];                 //appType 用于区分本地测试与其它项目调用 本地测试为1  其它为空
		}
		else {  //主要考虑其它成员本地测试
		   $userName = $_GET["userName"];
           $appName = $_GET["appName"];
           $webUrl = $_GET["webUrl"];
		   $splashImgPath = $_GET["splashImgPath"];   //启动页面图片名称
		   $appIcoPath = $_GET['appIcoPath'];     
		   $appTitle = $_GET['appTitle'];
		   $appType = $_GET['appType'];                //appType 用于区分本地测试与其它项目调用  本地测试为1  其它为空
		}
		

		$webUrl = I('webUrl', '', 'trim');
		$appTitle = I('appTitle', '', 'trim');
		$site_id = I('siteId', 0, 'intval');
		
        $userName = session("uname");
		$appName = D('UserSite') -> getSiteInfo($site_id, 'sitePath');
    

		$this->createUserDir($userName);
		
		$buildResult['appTitle'] = $appTitle;
		
		//Apps存放所有用户生成的App
	    $strUserNameAppPath = $_SERVER['DOCUMENT_ROOT'].C('EZAPP_APPS_SAVEDIRECTORY').$userName;

	    //将用户输入的应用名称替换掉默认名称 注:每个用户对应的目录都存在两个.sh文件
	    $strCreateApp=file_get_contents($strUserNameAppPath."/CreateApp.sh");
	    $strReleaseApp=file_get_contents($strUserNameAppPath."/ReleaseApp.sh");
	
	    //替换应用生成路径
	    $strCreateApp=str_replace("/var/www/MyFirstAndroid",$strUserNameAppPath."/".$appName,$strCreateApp); 
		//替换默认的应用名称
	    $strCreateApp=str_replace("MyFirstAndroid",$appName,$strCreateApp);
		//回写更改的内容
	    file_put_contents($strUserNameAppPath."/CreateApp.sh",$strCreateApp);
	
	    //替换ReleaseApp文件中默认应用路径
	    $strReleaseApp=str_replace("/var/www/MyFirstAndroid",$strUserNameAppPath."/".$appName,$strReleaseApp);
		//回写更改的内容
	    file_put_contents($strUserNameAppPath."/ReleaseApp.sh",$strReleaseApp);
	        
	    //首先执行创建项目的命令 
		exec("sh ".$strUserNameAppPath."/CreateApp.sh",$output);
	
	    $strTempletePath = $_SERVER['DOCUMENT_ROOT'].C('EZAPP_TEMPLETE_SAVEDIRECTORY');

		//复制ant.properties到项目下面
		copy($strUserNameAppPath."/ant.properties",$strUserNameAppPath."/".$appName."/ant.properties");
		
	   //操作AndroidManifest.xml文件      
	   copy($strTempletePath."/AndroidManifest.xml",$strUserNameAppPath."/".$appName."/AndroidManifest.xml");
	   $strManifest = file_get_contents($strUserNameAppPath."/".$appName."/AndroidManifest.xml");
	   $strManifest = str_replace("@appName@",$appName,$strManifest);    
	   file_put_contents($strUserNameAppPath."/".$appName."/AndroidManifest.xml",$strManifest);		   

	   //复制布局文件(main.xml)
	   copy($strTempletePath."/main.xml",$strUserNameAppPath."/".$appName."/res/layout/main.xml");
	   
	   //复制启动画面(splash.xml)
	   copy($strTempletePath."/splash.xml",$strUserNameAppPath."/".$appName."/res/layout/splash.xml");
	   
	   //操作src目录下的java文件
	   copy($strTempletePath."/ActivityDemo.java",$strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/".$appName.".java");
	   $strActivity = file_get_contents($strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/".$appName.".java");
	   $strActivity = str_replace("@appName@",$appName,$strActivity);  
       $strActivity = str_replace("@WEBURL@",$webUrl,$strActivity);   
	   file_put_contents($strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/".$appName.".java",$strActivity);
	   
	   //操作src目录下的java文件
	   copy($strTempletePath."/splash.java",$strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/splash.java");
	   $strSplashJava = file_get_contents($strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/splash.java");
	   $strSplashJava = str_replace("@appName@",$appName,$strSplashJava);   
	   file_put_contents($strUserNameAppPath."/".$appName."/src/tang/jz/".$appName."/splash.java",$strSplashJava);
	   
	   //操作string资源文件
	   $strString = file_get_contents($strUserNameAppPath."/".$appName."/res/values/strings.xml"); 
	   $strString = str_replace($appName, $appTitle, $strString);  //将默认的英文改成自定义(中文或其它)标题
	   file_put_contents($strUserNameAppPath."/".$appName."/res/values/strings.xml", $strString);
	   
	   //如果用户无上传图片的权限,则使用默认的启动图片  /cycc/uploads/ezApp/20146181414387488.png
	   if($appType) //本地调用
	   {
	   	   if(!empty($splashImgPath))  
	       {
	   	 	 copy($_SERVER['DOCUMENT_ROOT'].C('UPLOAD_PATH').$splashImgPath,
	         $strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
		   }
		   else
		   {
		   	  //默认使用系统内置图片
			  copy($strTempletePath."/splash.png",$strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
		   }
		    
		   //复制应用图标,如果没有上传则使用默认图标  /cycc/uploads/Avatar/539ff781cc801_100_100.png
		   if(!empty($appIcoPath))
		   {
		   	  copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-mdpi/ic_launcher.png");	
				 
		      copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-ldpi/ic_launcher.png");	  
			   
		      copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-hdpi/ic_launcher.png");
		   }    
	   }
	   else  //其它项目调用  区别在于启动图片与桌面图标的图片路径不同
	   {
	   	   if(!empty($splashImgPath))  
	       {
	   	 	   copy($splashImgPath,$strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
		   }
		   else
		   {
		   	  //默认使用系统内置图片
			  copy($strTempletePath."/splash.png",$strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
		   }
		    
		   //复制应用图标,如果没有上传则使用默认图标  /cycc/uploads/Avatar/539ff781cc801_100_100.png
		   if(!empty($appIcoPath))
		   {
		   	  copy($appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-mdpi/ic_launcher.png");	
				 
		      copy($appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-ldpi/ic_launcher.png");	  
			   
		      copy($appIcoPath,
		        $strUserNameAppPath."/".$appName."/res/drawable-hdpi/ic_launcher.png");
		   }    
	   }
	   
		//文件复制成功后执行第二步
       exec("sh ".$strUserNameAppPath."/ReleaseApp.sh",$output);  
       //生成二维码
	   $this->buildQRCode($userName,$appName,$strUserNameAppPath,$appTitle);
	}

	/**
	 * 上传启动页面对应的图片
	 */
	public function uploadSplash()
    {
		$result = array('error' => 1,'message' => '','img_url'=>'','img_Name'=>'');
		//如果用户选择了图片
		if($_FILES['img_Splash']['name'])
		{
			try{
				$savePath = $_SERVER['DOCUMENT_ROOT'].C('UPLOAD_APPPATH'); //图片保存地址
				$filetype = $_FILES['img_Splash']['type'];              //图片类型  
				$flag=0;
				//目前只支持png图片类型
				switch ($filetype) {
					case 'image/png':
						$filetype=".png";
						break;
					case 'image/jpeg':
						$filetype=".jpg";
						break;
					case 'image/gif':
						$filetype=".gif";
						break;
					default:
						$result['message']='系统不支持'.$filetype.'类型的图片';
						$flag=1;
						break;
				}
				
				if($flag)  //如果不符合类型则退出
				{
					echo json_encode($result);
					exit;
				}
				$this->fileType = $fileype;  //保存为当前对象属性,供应用编译时调用

				//获取用户上传的图片类型
				 $strNewFileName = $savePath.$this->APPID.$filetype;
				 
				 //查看新文件名是否存在
				 if(file_exists($strNewFileName))
				 {
				 	//如果存在则重新生成文件名
				 }
				 else
				 {
		           move_uploaded_file($_FILES['img_Splash']['tmp_name'], $strNewFileName);
				   $result['error'] = 0;
				   $result['message'] = 'success';
				   $result['img_url'] = C('UPLOAD_APPPATH').$this->APPID.$filetype; //图片地址
				   $result['img_Name'] = $this->APPID.$filetype;
				 }
		      
			}catch(Exception $error)
			{
				$result['message'] = '上传图片出错了!'; 
				echo json_encode($result);
			}
		}
		else
		{
			$result['message']='No files are selected';
		}			
		 echo json_encode($result); 
    }

    /**
	 * 生成二维码
	 */
    function buildQRCode($userName,$appName,$strUserNameAppPath,$appTitle)
    {
    	//导入文件
	   include($strUserNameAppPath.'/phpqrcode.php'); 
		   
	   /* 二维码对应的文件  服务器版 
	   $data = DOMAIN_NAME.'ezApp/Apps/'.$userName.'/'
	           .$appName.'/bin/'.$appName.'-release.apk'; 
	   $apkPath = $_SERVER['DOCUMENT_ROOT'].'/ezApp/Apps/'.$userName.'/'.$appName.'/bin/'.$appName
                  .'-release.apk'; 	   */
			   
			   
	  /* 本地测试用 */
	  $data = 'http://'.$_SERVER['SERVER_NAME'].'/web/'.'ezApp/Apps/'.$userName.'/'
           .$appName.'/bin/'.$appName.'-release.apk';     	  
      //apk路径 
      $apkPath = $_SERVER['DOCUMENT_ROOT'].'/web/'.'ezApp/Apps/'.$userName.'/'.$appName.'/bin/'.$appName
      .'-release.apk';
	   
	  
	  if(file_exists($apkPath))
	  {
		   // 生成的文件名 
		   //$filename = $errorCorrectionLevel.'|'.$matrixPointSize.'.png'; 
		   $filename = $userName."-".$appName.'.png'; 
		   // 纠错级别：L、M、Q、H 
		   $errorCorrectionLevel = 'L';  
		   // 点的大小：1到10 
		   $matrixPointSize = 6;  
		   QRcode::png($data, $filename, $errorCorrectionLevel, $matrixPointSize, 2); //生成的图片默认存在 /var/www/cycc下
		   
		   //将生成的图片加上logo
		   $logo = $strUserNameAppPath.'/logo.png';
	       $QR = $_SERVER['DOCUMENT_ROOT'].__ROOT__.'/'.$filename;
	       if($logo !== FALSE)
	       {
				$QR = imagecreatefromstring(file_get_contents($QR));
				$logo = imagecreatefromstring(file_get_contents($logo));
				$QR_width = imagesx($QR);
				$QR_height = imagesy($QR);
				$logo_width = imagesx($logo);
				$logo_height = imagesy($logo);
				$logo_qr_width = $QR_width / 5.1;
				$scale = $logo_width / $logo_qr_width;
				$logo_qr_height = $logo_height / $scale;
				$from_width = ($QR_width - $logo_qr_width) / 2.0;
				imagecopyresampled($QR, $logo, $from_width, $from_width, 0, 0, $logo_qr_width, $logo_qr_height, $logo_width, $logo_height);
			}
			imagepng($QR,$filename);
		
		   //将生成的二维码图片移动到对应的应用目录下
		   $strOldName=$_SERVER['DOCUMENT_ROOT'].__ROOT__."/".$filename;
		   $strNewName=$strUserNameAppPath."/".$appName."/".$filename;
		   rename($strOldName,$strNewName);
		   
		   //返回二维码对应的路径
		   //echo C('EZAPP_APPS_SAVEDIRECTORY').$userName."/".$appName."/".$filename;
		   
		   $buildResult['result'] = 1;  //1-成功  0-失败
		   $buildResult['appQRCodeImg'] = C('EZAPP_APPS_SAVEDIRECTORY').$userName."/".$appName."/".$filename;
		   $buildResult['appTitle'] = $appTitle;
	  }
      else 
      {
      	  $buildResult['result'] = 0;
	  }
	  echo json_encode($buildResult);   
    }
	
	
	function test()
	{
        echo $_GET('callback').'("Hello,everyone!")';	
	}
	
	/*
	 * 生成app
	 */
	public function buildAppNew()
	{
		if(IS_POST)
		{
		   $userName = $_POST["userName"];
	       $appName = $_POST["appName"];
		   $splashFileName = $_POST["splashFileName"];   //启动页面图片名称
		   $appIcoPath = $_POST['appIcoPath'];           //应用桌面图标地址,如/cycc/uploads/Avatar/539ff781cc801_100_100.png
		   $appTitle = $_POST['appTitle'];
		   $ctrlsHTML = $_POST['ctrlsHTML'];  //用户添加的所有控件信息
		}
		else {  //主要考虑其它成员本地测试
		   $userName = $_GET["userName"];
	       $appName = $_GET["appName"];
		   $splashFileName = $_GET["splashFileName"];   //启动页面图片名称
		   $appIcoPath = $_GET['appIcoPath'];     
		   $appTitle = $_GET['appTitle'];
		   $ctrlsHTML = $_GET['ctrlsHTML'];  //用户添加的所有控件信息
		}
		$this->createUserDir($userName);
		
		//Apps存放所有用户生成的App
	    $strUserNameAppPath = $_SERVER['DOCUMENT_ROOT'].C('EZAPP_APPS_SAVEDIRECTORY').$userName;

	    //存放模版文件的目录
	    $strTempletePath = $_SERVER['DOCUMENT_ROOT'].C('EZAPP_TEMPLETE_SAVEDIRECTORY');
		
        //将模版应用复制到用户目录下
        $this->copyDir($strTempletePath.'/HyBirdAppDemo', $strUserNameAppPath.'/'.$appName);
 
	   //操作string.xml资源文件
	   $strString = file_get_contents($strUserNameAppPath."/".$appName."/res/values/strings.xml"); 
	   $strString = str_replace("@appTitle@", $appTitle, $strString);  //将默认的英文改成自定义(中文或其它)标题
	   file_put_contents($strUserNameAppPath."/".$appName."/res/values/strings.xml", $strString);
	   
	   //操作build.xml资源文件,修改默认的apk文件名称
	   $strString = file_get_contents($strUserNameAppPath."/".$appName."/build.xml"); 
	   $strString = str_replace("@apkName@", $appName, $strString);  //将默认的英文改成自定义(中文或其它)标题
	   file_put_contents($strUserNameAppPath."/".$appName."/build.xml", $strString);
	   
	   
	   //如果用户无上传图片的权限,则使用默认的启动图片  /cycc/uploads/ezApp/20146181414387488.png
	   if(!empty($splashFileName))  
	   {
	   	 copy($_SERVER['DOCUMENT_ROOT'].C('UPLOAD_PATH').$splashFileName,
	       $strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
	   }
	   else
	   {
	   	  //默认使用系统内置图片
		  copy($strTempletePath."/splash.png",$strUserNameAppPath."/".$appName."/res/drawable-hdpi/splash.png");
	   }
	    
	   //复制应用图标,如果没有上传则使用默认图标  /cycc/uploads/Avatar/539ff781cc801_100_100.png
	   if(!empty($appIcoPath))
	   {
	   	  copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
	        $strUserNameAppPath."/".$appName."/res/drawable-mdpi/ic_launcher.png");	
			 
	      copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
	        $strUserNameAppPath."/".$appName."/res/drawable-ldpi/ic_launcher.png");	  
		   
	      copy($_SERVER['DOCUMENT_ROOT'].$appIcoPath,
	        $strUserNameAppPath."/".$appName."/res/drawable-hdpi/ic_launcher.png");
	   }    

	    //将用户添加的控件信息添加到页面
	    $strIndexHTML=file_get_contents($strUserNameAppPath."/".$appName."/assets/www/index.html");
	    $strIndexHTML=str_replace("@content@",$ctrlsHTML,$strIndexHTML);
	    file_put_contents($strUserNameAppPath."/".$appName."/assets/www/index.html",$strIndexHTML);
	   
	   
	   //将用户输入的应用名称替换掉默认名称 注:每个用户对应的目录都存在两个.sh文件
	    $strReleaseApp=file_get_contents($strUserNameAppPath."/ReleaseApp.sh");
	    //替换ReleaseApp文件中默认应用路径
	    $strReleaseApp=str_replace("/var/www/MyFirstAndroid",$strUserNameAppPath."/".$appName,$strReleaseApp);
		//回写更改的内容
	    file_put_contents($strUserNameAppPath."/ReleaseApp.sh",$strReleaseApp);
		
		//文件复制成功后执行第二步
       exec("sh ".$strUserNameAppPath."/ReleaseApp.sh",$output);  
       //生成二维码
	   $this->buildQRCode($userName,$appName,$strUserNameAppPath);
	}
}
