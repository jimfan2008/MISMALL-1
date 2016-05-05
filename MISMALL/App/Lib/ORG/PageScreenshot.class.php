<?php
/*
 *创建者:皮振华
 *创建时间：2013-10-14
 *生成网页快照，根据网页地址去截取网页（截图），
 *主要用户发布网站时生成网站首页的模板图片.
 *生成的图片转换为缩略图
 */
 class PageScreenshot{
     /**
	  * 截取网页（截图）
	  * 配置：(需要下载/wkhtmltoimage-0.11.0_rc1-static-i386.tar.bz2
	  *       和   命令下载apt-get install openssl build-essential xorg libssl-dev libxrender-dev  ttf-arphic-bsmi00lp ttf-arphic-gbsn00lp xfonts-intl-chinese )
	  * @param string $siteURL 站点地址
	  * @param string $savePath 保存路径
	  * @param string $imgName 图片名
	  * @param boolean $thumb 是否生成缩略图
	  * @param int $targetW 图片宽
	  * @param int $targetH 图片高
	  * @return 1成功 0出错 
	  */
     public function screenshotHtmlPage($siteURL, $savePath, $imgName, $thumb = false, $targetW = 100, $targetH = 100)
     {
         if(!empty($siteURL) && !empty($savePath) && !empty($imgName))
         {
             $imgSavePath = rtrim($savePath, '/') . "/" . $imgName;
             
             if(file_exists($imgSavePath)) {
             	return 1;
             }
             
             set_time_limit(0);
             shell_exec('/var/www/wkhtmltoimage --width 990 --height 840 --quality 10 '.$siteURL.' '.$imgSavePath);
             
             if( file_exists($imgSavePath) ) 
             {
                 if( ! $thumb ) {
                 	return 1;
                 }
                 
                 $paths = explode('.',$imgSavePath); 
                 $thumbnailPath = $paths[0]."_new.". $paths[1];           
                 $count = $this->makeThumbnail($imgSavePath, $thumbnailPath, $targetW, $targetH);
                 if($count > 0) {
                 	@unlink($imgSavePath);
                    return 1;
                 }
             }   
         }
         return 0;
     }
     
     /**
	  * 生成缩略图 只考虑jpg,png,gif格式
	  * @param string $srcImgPath 源图片路径
	  * @param string $targetimgPath 重新生成图片路径
	  * @param int $targetW 图片宽
	  * @param int $targetH 图片高
	  */
     public function makeThumbnail($srcImgPath,$targetImgPath,$targetW,$targetH)
     {
            $imgSize = getimagesize($srcImgPath);
            $imgType = $imgSize[2];
            //@ 使函数不向页面输出错误信息
            switch ($imgType){
                case 1:
                    $srcImg = @ImageCreateFromGIF($srcImgPath);
                    break;
                case 2:
                    $srcImg = @ImageCreateFromJpeg($srcImgPath);
                    break;
                case 3:
                    $srcImg = @ImageCreateFromPNG($srcImgPath);
                    break;
            }
             //取源图象的宽高
            $srcW = ImageSX($srcImg);
            $srcH = ImageSY($srcImg);
            if($srcW>$targetW || $srcH>$targetH){
                
                $targetX = 0;
                $targetY = 0;
                if ($srcW > $srcH){
                    
                    $finaW=$targetW;
                    $finalH=round($srcH*$finaW/$srcW);
                    $targetY=floor(($targetH-$finalH)/2);
                }else{
                    
                    $finalH=$targetH;
                    $finaW=round($srcW*$finalH/$srcH);
                    $targetX=floor(($targetW-$finaW)/2);
                }
              //function_exists 检查函数是否已定义
              //ImageCreateTrueColor 本函数需要GD2.0.1或更高版本
              if(function_exists("ImageCreateTrueColor")){
                  
                $targetImg=ImageCreateTrueColor($targetW,$targetH);
               }else{
                   
                $targetImg=ImageCreate($targetW,$targetH);
                
               }
                $targetX=($targetX<0)?0:$targetX;
                $targetY=($targetX<0)?0:$targetY;
                $targetX=($targetX>($targetW/2))?floor($targetW/2):$targetX;
                $targetY=($targetY>($targetH/2))?floor($targetH/2):$targetY;
                  //背景白色
                $white = ImageColorAllocate($targetImg, 255,255,255);
                ImageFilledRectangle($targetImg,0,0,$targetW,$targetH,$white);
                /*
                       PHP的GD扩展提供了两个函数来缩放图象：
                       ImageCopyResized 在所有GD版本中有效，其缩放图象的算法比较粗糙，可能会导致图象边缘的锯齿。
                       ImageCopyResampled 需要GD2.0.1或更高版本，其像素插值算法得到的图象边缘比较平滑，
                                                                 该函数的速度比ImageCopyResized慢。
                */
                if(function_exists("ImageCopyResampled"))
                {
                    ImageCopyResampled($targetImg,$srcImg,$targetX,$targetY,0,0,$finaW,$finalH,$srcW,$srcH);
                }
                else
                {
                    ImageCopyResized($targetImg,$srcImg,$targetX,$targetY,0,0,$finaW,$finalH,$srcW,$srcH);
                }
                switch ($imgType) {
                    case 1:
                        ImageGIF($targetImg,$targetImgPath);
                        break;
                    case 2:
                        ImageJpeg($targetImg,$targetImgPath);
                        break;
                    case 3:
                        ImagePNG($targetImg,$targetImgPath);
                        break;
                }
                ImageDestroy($srcImg);
                return ImageDestroy($targetImg);
            }
             else //不超出指定宽高则直接复制
            {
                copy($srcImgPath,$targetImgPath);
                return ImageDestroy($srcImg);
            }
     }
     
 }
