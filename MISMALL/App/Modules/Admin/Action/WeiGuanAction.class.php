<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------


/**
 * 后台用户控制器
 */
class WeiGuanAction extends AdminAction {

    //static protected $allow = array( 'updatePassword','updateNickname','submitPassword','submitNickname');

    /**
     * 首页
     */
    public function index()
    {
        $this->templateList();
    }
    
    /**
     * 模板列表
     */
    public function templateList()
    {
    	
		
		$result  = D("WeiGuanTemplate")->getTplList();
		 $this->assign('templateList', $result);
		 
		$this->display("template_list");
		return;
		
    }
	
	public function getTplList(){
		
		
		$id = I("id", "",'intval');
		$result = D("WeiGuanTemplate")->getTplList($id);
	}


	 public function addTpl(){
		
		$data['data'] = I("data", '', 'trim');
		$data['title'] =I("title", '', 'trim');
		$data['name'] = I("name", '', 'trim');
		//$time  = time();
		
		$result = D("WeiGuanTemplate") -> addTpl($data);
		
		 echo $result;


	}
	 	/*
	 * 
	 * 修改状态
	 * */
	public function modTplStauts(){
    
    	$id = I("id", "",'intval');
		$status = I('status', "", "trim");
		if($id){
			
			$result  = D("WeiGuanTemplate")->modTplStauts($id,$status);
			
		}
		echo $result;
    }
	public function delTpl(){
    
    	$id = I("id", "",'intval');
		//$status = I('status', "", "trim");
		if($id){
			
			$result  = D("WeiGuanTemplate")->delTpl($id);
			
		}
		echo $result;
    }
    
    /**
     * 添加模板
     */
    public function templateAdd()
    {
    	$id = I("id", "", "trim");
		
        $model = D('WeiGuanTemplate');
        
        $info = array();
			
			
        if(IS_POST) {
        	
			$data['data']  = I("post.data", "", "trim");
			$data['title'] = I("post.title", "", "trim");
			$data['name'] = I("post.name", "", "trim");
			$data['thumb'] = I("post.icon", "", "trim");
			
	 			$re = D("WeiGuanTemplate")->addTpl($data,$id);
			
			echo $re;
            
            
        } else {
        	if($id){
        		$re = D("WeiGuanTemplate")->getTplList($id);
				$this->assign("info", $re);
        	}
          
            $this->display('template_edit');
        }
    }
	
	/*
	 *
	 * 音乐列表
	 */
	 public function musicList(){
	 	
		$musicList = D("WeiGuanTemplate")->getMusicList();
		
		$this->assign("musicList",$musicList);
		$this->display("musicList");
		
	 }
	 /*
	  * @param id   根据id获取
	  * @param type  搜索的时候选择的类型
	  * @param keyword 搜索的关键字
	  * 
	  *  */
	 public function getMusic(){
	 	$id = I('id', "0", "intval");
		$type = I("typeId", "", "trim");
		$key = I("keyword", "", "trim");
		$musicList = D("WeiGuanTemplate")->getMusicList($id, $type, $key);
		
		echo json_encode($musicList);
	 }
	 
	 //新增音乐，修改音乐
	 
	 public function addMusic(){
	 	$data["id"]= I("id","", "trim");
		$model = D('WeiGuanTemplate');
        $info = array();
		$musicType = $model ->getMusicType();
			
        if(IS_POST) {
			$data['']  = I("post.data", "", "trim");
			$data['title'] = I("post.title", "", "trim");
			$data['name'] = I("post.name", "", "trim");
			$data['thumb'] = I("post.icon", "", "trim");
			
	 			$re = $model ->addTpl($data,$id);
			
			echo $re;
            
        } else {
        	if($id){
        		$re = D("WeiGuanTemplate")->getTplList($id);
				$this->assign("info", $re);
				//echo $re; 
        	}
            $this->assign("musicType",$musicType);
            $this->display("music_edit");
        }
		
	 }
    
	//删除音乐
	public function delMusic(){
		
		$id  = I("id","","intval");
		$re  = D("WeiGuanTemplate")->delMusic($id);
		echo $re;
	}
	
	//修改music
	public function modMusicStauts(){
		$id = I("id", "",'intval');
		$status = I('status', "", "trim");
		if($id){
			
			$result  = D("WeiGuanTemplate")->modMusic($id,$status);
			
		}
		echo $result;
	}
    /**
     * 编辑模板
     * @param int $id 编号
     */
    public function templateEdit($id=0)
    {
        $model = D('UserSite');
        
        $info = array();
        if($id) {
            $info = $model->getSiteInfo($id);
            if(!$info) {
                $this->error('编辑模板不存在');
            }
            /*if($info['file_id']) {
                $info['file'] = M('File')->find($info['file_id']);
            }*/
        }

        if(IS_POST) {
            $result = $model->templateUpdate();
            if(!$result) {
                $this->error($model->getError());
            } else {
                $this->success('编辑模板成功', U('Template/templateList'));
            }
            
        } else {
            $template_category_list = D('UserSite')->getUserSiteCategoryTree(0,'id,parentId,nameCN', true);
            $this->assign('template_category_list', $template_category_list);
            $this->assign('info', $info);
            $this->display('template_edit');
        }
    }
    
    /**
     * 删除模板
     */
    public function templateRemove()
    {
        $id = I('get.id', '');
        
        if(!$id) {
            $this->error('无效模板ＩＤ');
        }
        
        $model = D('UserSite');
        $info = $model->getSiteInfo($id);
        if(!$info) {
            $this->error('删除模板不存在');
        }
        
        $model->deleteSite($id);
        
        $this->success('模板删除成功');
    }
    
    /**
     * 模板类型列表
     */
    public function templateTypeList()
    {
        $tree = D('UserSite')->getUserSiteCategoryTree(0,'id,nameCN,nameEN,nameTW,sort,parentId,status');
        $this->assign('tree', $tree);

        C('_SYS_GET_CATEGORY_TREE_', true); //标记系统获取分类树模板
        $this->meta_title = '模板分类管理';
        //dump($template_type_list);exit;
        $this->display('template_type_list');
    }
    
   /* 编辑分类 */
    public function templateTypeEdit($id = null, $pid = 0)
    {
        $Category = D('UserSite');

        if(IS_POST){ //提交表单
            if(false !== $Category->userSiteCategoryUpdate()){
                $this->success('编辑成功！', U('Ｔemplate/templateTypeList'));
            } else {
                $error = $Category->getError();
                $this->error(empty($error) ? '未知错误！' : $error);
            }
        } else {
            $cate = '';
            if($pid){
                /* 获取上级分类信息 */
                $cate = $Category->getUserSiteCategoryInfo($pid, 'id,nameCN,status');
                if(!($cate && 1 == $cate['status'])){
                    $this->error('指定的上级分类不存在或被禁用！');
                }
            }

            /* 获取分类信息 */
            $info = $id ? $Category->getUserSiteCategoryInfo($id) : '';

            $this->assign('info',       $info);
            $this->assign('category',   $cate);
            $this->meta_title = '编辑分类';
            $this->display('template_type_edit');
        }
    }

    /* 新增分类 */
    public function templateTypeAdd($pid = 0)
    {
        $Category = D('UserSite');

        if(IS_POST){ //提交表单
            if(false !== $Category->userSiteCategoryUpdate()){
                $this->success('新增成功！', U('Ｔemplate/templateTypeList'));
            } else {
                $error = $Category->getError();
                $this->error(empty($error) ? '未知错误！' : $error);
            }
        } else {
            $cate = array();
            if($pid){
                /* 获取上级分类信息 */
                $cate = $Category->getUserSiteCategoryInfo($pid, 'id,nameCN,status');
                if(!($cate && 1 == $cate['status'])){
                    $this->error('指定的上级分类不存在或被禁用！');
                }
            }

            $info['status'] = 1;
            /* 获取分类信息 */
            $this->assign('info',       $info);
            $this->assign('category', $cate);
            $this->meta_title = '新增模板分类';
            $this->display('template_type_edit');
        }
    }
    
    /**
     * 模板分类操作
     * @param $type
     */
    public function templateTypeOperate($type='move')
    {
        //检查操作参数
        if(strcmp($type, 'move') == 0){
            $operate = '移动';
        }elseif(strcmp($type, 'merge') == 0){
            $operate = '合并';
        }else{
            $this->error('参数错误！');
        }
        $from = intval(I('get.from'));
        empty($from) && $this->error('参数错误！');

        //获取分类
        $map = array('status'=>1, 'id'=>array('neq', $from));
        $list = M('UserSiteCategory')->where($map)->field('id,nameCN')->select();

        $this->assign('type', $type);
        $this->assign('operate', $operate);
        $this->assign('from', $from);
        $this->assign('list', $list);
        $this->meta_title = $operate.'模板分类';
        $this->display('template_type_operate');
    }
    
    /**
     * 模板分类操作－数据库
     * @param strign $type
     */
    public function templateTypeOperateSave($type='move')
    {
        $to = I('post.to');
        $from = I('post.from');
        $Model = M('UserSiteCategory');
        
        switch($type) {
            case 'move' : 
                        $to = I('post.to');
                        $from = I('post.from');
                        $res = $Model->where(array('id'=>$from))->setField('parentId', $to);
                        if($res !== false){
                            $this->success('分类移动成功！', U('templateTypeList'));
                        }else{
                            $this->error('分类移动失败！');
                        }
                        break;
            case 'mreg' : 
                        //合并文档
                        $res = M('UserSite')->where(array('siteCategoryId'=>$from))->setField('siteCategoryId', $to);
                
                        if($res){
                            //删除被合并的分类
                            $Model->delete($from);
                            $this->success('合并分类成功！', U('templateTypeList'));
                        }else{
                            $this->error('合并分类失败！');
                        }
                break;
            case 'remove' : 
                        $cate_id = I('id');
                        if(empty($cate_id)){
                            $this->error('参数错误!');
                        }
                
                        //判断该分类下有没有子分类，有则不允许删除
                        $child = $Model->where(array('parentId'=>$cate_id))->field('id')->select();
                        if(!empty($child)){
                            $this->error('请先删除该分类下的子分类');
                        }
                
                        //判断该分类下有没有内容
                        $template_list = M('UserSite')->where(array('siteCategoryId'=>$cate_id))->field('id')->select();
                        if(!empty($template_list)){
                            $this->error('请先删除该分类下的模板');
                        }
                
                        //删除该分类信息
                        $res = $Model->delete($cate_id);
                        if($res !== false){
                            //记录行为
                            action_log('update_tempalte_type', 'TemplateType', $cate_id, UID);
                            $this->success('删除分类成功！');
                        }else{
                            $this->error('删除分类失败！');
                        }
                break;
            default : 
                $this->error('未知操作');
        }
    }
    
    /**
     * 网站类型列表
     */
    public function siteTypeList()
    {
        $this->display('site_type_list');
    }
    
    /**
     * 网站类型添加
     */
    public function siteTypeAdd()
    {
        $this->display('site_type_edit');
    }
    
    /**
     * 网站类型编辑
     */
    public function siteTypeEdit()
    {
        $site_type_id = 0;
        $this->display('site_type_edit');
    }
    
    /**
     * 系统图片管理
     */
    public function systemImageManager()
    {
        $imageTypeList= C('TEMPLATE_SYSTEM_IMAGE_TYPE');
        $imageList = array();
        
        if(is_array($imageTypeList)) {
            foreach($imageTypeList as $type_key => $type_value) {
                $map = array(
                    'imgTypeId' => $type_key
                );
                $image = M('SystemImage')->where($map)->find();
                $imageCount = D('SystemImage')->getSystemImageCount($map);
                $imageList[] = array(
                    'imgTypeId' => $type_key,
                    'imgTypeName' => $type_value,
                    'info' => $image ? $image : array(),
                    'count' => $imageCount
                );
            }
        }
        
        $this->assign('imageList', $imageList);
        $this->display('system_image_manager');
    }
    
    public function systemImageList()
    {
        $imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');
        
        $imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
        $title = isset($_REQUEST['title']) ? $_REQUEST['title'] : '';
        
        $map = array(
            'imgTypeId' => $imgTypeId,
        );
        
        if($title){
            $mag['imgName'] = array('like', '%'.$title.'%');
        }
        
        $imageList   =   $this->lists('SystemImage', $map);

        int_to_string($imageList);

        $this->assign('imageList', $imageList);
        $this->assign('imageTypeList', $imageTypeList);
        $this->assign('imgTypeId', $imgTypeId);
        
        $this->display('system_image_list');
    }
    
    public function systemImageAdd()
    {
        $imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');
        
        $imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
        $this->assign('imageTypeList', $imageTypeList);
        $this->assign('imgTypeId', $imgTypeId);
        
        $this->display('system_image_add');
    }
    
    /**
     * 移动图片
     */
    public function system_image_move()
    {
        $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
        $imgTypeId = isset($_GET['catid']) ? intval($_GET['catid']) : 1;
        $imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');
        
        $result = array(
            'error' => 1,
            'info' => ''
        );
        
        if(!$id) {
            $result['info'] = '非法操作';
        } else if(! $imageTypeList[$imgTypeId]) {
            $result['info'] = '分类不存在';
        } else {
            $imgInfo = M('SystemImage')->where( array('id' => $id) )->find();
            if( ! $imgInfo ) {
                $result['info'] = '图片不存在';
            } else {
                M('SystemImage')->where( array('id' => $id) )->save( array('imgTypeId' => $imgTypeId) );
                $result['info'] = '移动成功';
                $result['error'] = 0;
            }
        }
        echo json_encode($result);
    }
    
    /**
     * 系统图片重命名
     */
    public function system_image_rename($id)
    {
        $id = intval($id);
        $name = trim($_REQUEST['name']);
        
        $result['ret'] = 0;
        
        $imgInfo = M('SystemImage')->where( array('id' => $id) )->find();
        if($imgInfo){
            $status = M('SystemImage')->where( array('id' => $id) )->save( array('imgName' => $name));
            if($status) {
                $result = array(
                    'ret' => 1,
                    'html' => $name
                );
            }
        }
        echo json_encode($result);
    }
    
    /**
     * 删除系统图片
     */
    public function system_image_confirm_delete()
    {
        $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
        if(!$id) {
            $this->error('非法操作');
        }
        
        $imgInfo = M('SystemImage')->where( array('id' => $id) )->find();
        if(!$imgInfo){
            $this->error('图片不存在');
        }
        
         $affect = M('SystemImage')->delete($id);
         if($affect){
            //删除图片
            $imgPath = getImagePath($imgInfo['imgUrl']);
            @unlink($imgPath);
            $this->success('删除图片成功');
         } else {
            $this->error('删除失败');
         }
    }
    
    /**
     * 批量删除图片
     */
    public function system_image_batch_delete()
    {
        $ids = $_POST['sel_id'];
        $del_ids = array();
        
        $result = array(
            'error' => 1,
            'info' => ''
        );
        
        if(is_array($ids)){
            foreach($ids as $id => $val) {
                if(1 == $val) {
                    $del_ids[] = $id;
                }
            }
            if($del_ids) {
                M('SystemImage')->delete(join(',', $del_ids));
                $result['error'] = 0;
                $result['info'] = '删除成功';
            } else {
                $result['info'] = '请选择要删除的图片';
            }
        } else {
            $result['info'] = '请选择要删除的图片';
        }
        echo json_encode($result);
    }
    
    /**
     * 批量移动图片
     */
    public function system_image_batch_move()
    {
        $ids = $_POST['sel_id'];
        $del_ids = array();
        
        $imgTypeId = isset($_POST['catid']) ? intval($_POST['catid']) : 1;
        $imageTypeList = C('TEMPLATE_SYSTEM_IMAGE_TYPE');
        
        $result = array(
            'error' => 1,
            'info' => ''
        );
        
        if(! is_array($ids)){
            $result['info'] = '请选择要移动的图片';
        } else if(! $imageTypeList[$imgTypeId]) {
            $result['info'] = '分类不存在';
        } else {
            foreach($ids as $id => $val) {
                if(1 == $val) {
                    $del_ids[] = $id;
                }
            }
            if(! $del_ids) {
                $result['info'] = '请选择要移动的图片';
            } else {
                M('SystemImage')->where( array('id' => array('in',join(',', $del_ids))) )->save( array('imgTypeId' => $imgTypeId) );
                $result['info'] = '移动成功';
                $result['error'] = 0;
            }
        }
        
        echo json_encode($result);
    }
    
    /**
     * 上传系统图片
     */
    public function system_image_upload()
    {
        $imgTypeId = isset($_REQUEST['catid']) ? intval($_REQUEST['catid']) : 1;
        
        $return = array(
                'jsonrpc'=>'2.0',
                 'id'=>'id',
                 'result'=>null
            );
        
        $uploads = $this->_upload(C('SYSTEM_IMAGE_UPLOAD'));
        //上传错误
        if($uploads['error']) {
            $return['error'] = array(
                    'code'=> 100,
                    'message'=> $uploads['info'],
            );
        } else {
            //保存图片
            foreach($uploads['info'] as $info) {
                $set = array(
                    'imgUrl' => $info['savename'],
                    'imgName' => $info['name'],
                    'imgTypeId' => $imgTypeId,
                    'userId' => session('admin_user_auth.uid'),
                    'hits' => 0,
                    'status' => 0,
                    'createTime' => time()
                );
                $img_id = M('SystemImage')->add($set);
            }
        }
        echo json_encode($return);
    }

}
