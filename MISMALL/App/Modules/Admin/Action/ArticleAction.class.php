<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: huajie <banhuajie@163.com>
// +----------------------------------------------------------------------

import('@.Builder.AdminListBuilder');
import('@.Builder.AdminConfigBuilder');
import('@.Builder.AdminSortBuilder');
/**
 * 后台内容控制器
 */
class ArticleAction extends AdminAction {

	/**
     * 分章列表页
     * 
     * @param $page 分页id
     * @author cjli
     */
    public function index( $page = 1, $pageRows = 20 ){
        //读取数据
        /* 查询条件初始化 */
        $map = array();
        if(isset($_GET['title'])){
            $map['title']  = array('like', '%'.(string)I('title').'%');
        }
        if(isset($_GET['status'])){
            $map['status'] = I('status');
            $status = $map['status'];
        }else{
            $status = null;
            $map['status'] = array('in', '0,1,2');
        }
        if ( isset($_GET['category_id']) ) {
            $map['category_id']    = I('category_id');
        }
        if ( isset($_GET['time-start']) ) {
            $map['update_time'][] = array('egt',strtotime(I('time-start')));
        }
        if ( isset($_GET['time-end']) ) {
            $map['update_time'][] = array('elt',24*60*60 + strtotime(I('time-end')));
        }
        if ( isset($_GET['nickname']) ) {
            $map['uid'] = M('Member')->where(array('nickname'=>I('nickname')))->getField('uid');
        }
	
        // 构建列表数据
        $model = M('Article');

        $list = $model->where($map)->page($page, $pageRows)->order('id DESC,	 sort asc')->select();
        $totalCount = $model->where($map)->count();
        
        //分类
        $categoryList = M('Category')->field('id,title')->where(array('status' => array('gt', 0)))->order('sort')->select();
        $catArr = array();
        if($categoryList){
        	foreach($categoryList as $cat){
        		$catArr[$cat['id']] = $cat['title'];
        	}
        }

        $builder = new AdminListBuilder();
		
        $builder->title('内容列表')
        		->buttonNew(U('edit'))
        		->setStatusUrl(U('setStatus'))->buttonEnable()->buttonDisable()->buttonDelete()
        		->buttonSort(U('sort'))
        		->keyId('id', '编号')
        		->keyLink('title', '标题', 'edit?id=###')
        		->keyMap('category_id', '分类', $catArr)
        		->keyText('sort', '优先级')
        		//->keyUpdateTime()
        		->keyText('view', '浏览')
        		->keyStatus('status', '状态')
        		->keyDoActionEdit('edit?id=###')
        		->data($list)
        		->pagination($totalCount, $pageRows)
        		->display();
    }


    /**
     * 内容编辑页面初始化
     * 
     * @author cjli
     */
    public function edit($id = 0){

        //判断是否为编辑模式
        $isEdit = $id ? true : false;
        
        if($isEdit){
        	$info = M('Article')->find($id);
        	if($info['category_id']){
        		$cateLIst = get_parent_category($info['category_id']);
        		$cate_id = 0;
        		foreach ($cateLIst as $cate){
        			$cate_id .= $cate['id'].',';
        		}
        		$info['category_id'] = substr($cate_id,0,-1);
        	}
        	
        	if(false === $info){
                $this->error('获取内容信息错误');
            }
        }else {
        	$info = array('sort' => 0, 'category_id' => 0, 'link_id' => 0, 'deadline' => 0,  'id' => 0, 'cover_id' => 0, 'view' => 0, 'comment' => 0, 'uid' => is_login());
        }
        
        
        //存草稿
        /*if(C('OPEN_DRAFTBOX') and ($isEdit == false or $info['status'] == 3)){
	        $autoSave = array(
	        	'class' => "btn save-btn",
	        	'id'	=> 'autoSave',
	        	'target-form' => 'form-horizontal',
	        	'url' => U('article/autoSave'),
	        );
        }*/
        
        $attr['class'] = "btn submit-btn ajax-post";
        $attr['id'] = 'submit';
        $attr['type'] = 'submit';
        $attr['target-form'] = 'form-horizontal';
         //显示页面
        $builder = new AdminConfigBuilder();
        $builder
        	->keyGroup( array(1 => '基础', 2 => '扩展') )
            ->title($isEdit ? '编辑内容' : '新增内容')
            ->keyTitle('title', '标题', '文档标题')
            ->keyTree('category_id', '文章分类','', getCategorySelect(0))
            ->keyText('name', '标识', '同一根节点下标识不重复')
            ->keyTextArea('summary', '简介')
            ->keyEditor('description','描述')
            ->keyNumber('sort','优先级','越高排序越靠前', 2)
            ->keyCheckBox('position', '推荐位', '多个推荐则将其推荐值相加', array(1=>'列表推荐', 2=>'频道页推荐', 3=>'首页推荐'), 2)
            ->keyImage('cover_id', '封面', '0-无封面，大于0-封面图片ID，需要函数处理', 2)
            ->keyNumber('view', '浏览量','', 2)
            //->keyNumber('comment', '评论数','', 2)
            //->keyNumber('bookmark', '收藏数','', 2)
            ->keyCreateTime('create_time', '创建时间', null, 2)
            //->keyTime('deadline', '截至时间', '0-永久有效', 2)
            //->keyText('link_id', '外链', '0-非外链，大于0-外链ID,需要函数进行链接与编号的转换', 2)
            //->keyText('template_detail', '详情页显示模板', '参照display方法参数的定义', 2)
            ->keyHidden('id')
            ->keyHidden('uid')
            ->data($info)
            ->buttonSubmit(U('doEdit'))->buttonBack()
            //->button('存草稿', $autoSave)
            ->highlight('index')
            ->display();
    }

    /**
     * 更新一条数据
     * @author cjli
     */
    public function doEdit(){
       $id = i('post.id', 0);
    	//判断是否为编辑模式
        $isEdit = $id ? true : false;
        
        $_POST['category_id'] = isset($_POST['category_id3']) && intval($_POST['category_id3']) ? intval($_POST['category_id3']) : (
        						isset($_POST['category_id2']) && intval($_POST['category_id2']) ? intval($_POST['category_id2']) :(
        						isset($_POST['category_id1']) && intval($_POST['category_id1']) ? intval($_POST['category_id1']) : (
        						isset($_POST['category_id0']) && intval($_POST['category_id0']) ? intval($_POST['category_id0']) : 0)));
        						
        unset($_POST['category_id0'], $_POST['category_id1'],$_POST['category_id2'], $_POST['category_id3']);
    	//写入数据库
        $model = D('Article');
    	$data = $model->create();
        if($data){
        	if($isEdit) {
        		if($model->save()){
        			//记录行为
                    action_log('update_article', 'article', $data['id'], UID);
                    $this->success('编辑成功', U('index'));
        		} else {
                    $this->error('编辑失败');
                }
        	} else {
        		unset($data['id']);
	        	$id = $model->add();
	            if($id){
	            	$this->success('新增成功', U('index'));
	                //记录行为
	                action_log('update_article', 'article', $id, UID);
	            } else {
	            	$this->error('新增失败');
	            }
        	}
        } else {
        	$this->error($model->getError());
        }
    }
    
	/**
     * 设置一条或者多条数据的状态
     * @author cjli
     */
    public function setStatus(){
        return parent::setStatus('Article');
    }
    
	/**
     * 排序
     * @author cjli
     */
    public function sort(){
    	$ids = I('get.ids');
        $pid = I('get.pid');

        //获取排序的数据
        $map = array('status'=>array('gt',-1));
        if(!empty($ids)){
            $map['id'] = array('in',$ids);
        }else{
        	if($pid !== ''){
            	$map['category_id'] = $pid;
            }
        }
        $list = M('Article')->where($map)->field('id,title')->order('sort asc,id asc')->select();
    	
    	//显示页面
        $builder = new AdminSortBuilder();
        $builder->title('文章内容排序')
            ->data($list)
            ->buttonSubmit(U('doSort'))->buttonBack()
            ->display();
    }
    
 	/**
     * 排序编辑入库
     * 
     * @param array $ids 编辑IＤ
     */
    public function doSort($ids) {
        $builder = new AdminSortBuilder();
        $builder->doSort('Article', $ids);
    }

    /**
     * 回收站列表
     * @author cjli
     */
    public function recycle(){

        $map['status']  =   -1;
        
        // 构建列表数据
        $model = M('Article');
        $list = $model->where($map)->page($page, $pageRows)->order('sort asc')->select();
        $totalCount = $model->where($map)->count();
        
    	//处理列表数据
        if(is_array($list)){
            foreach ($list as $k=>&$v){
                $v['username']      =   get_nickname($v['uid']);
                $v['category_title'] = 	get_category($v['category_id'],'title');
            }
        }

        $builder = new AdminListBuilder();
        $builder->title('回收站')
        		->setStatusUrl(U('setStatus'))
        		->buttonSort(U('clear'),'清空')
        		->buttonRestore()
        		->keyId('id', '编号')
        		->keyTitle()
        		->keyText('username', '创建者')
        		->keyText('category_title', '分类')
        		->keyUpdateTime('update_time', '删除时间')
        		->keyDoActionRestore()
        		->data($list)
        		->pagination($totalCount, $pageRows)
        		->display();
    }

    /**
     * 写文章时自动保存至草稿箱
     * @author cjli
     */
    public function autoSave(){
        $res = D('Article')->autoSave();
        if($res !== false){
            $return['data']     =   $res;
            $return['info']     =   '保存草稿成功';
            $return['status']   =   1;
            $this->ajaxReturn($return);
        }else{
            $this->error('保存草稿失败：'.D('Article')->getError());
        }
    }

    /**
     * 草稿箱
     * @author cjli
     */
    public function draftBox(){

        $map	=   array('status'=>3,'uid'=>UID);
        
        // 构建列表数据
        $model = M('Article');
        $list = $model->where($map)->page($page, $pageRows)->order('sort asc')->select();
        $totalCount = $model->where($map)->count();
        
    	//处理列表数据
        if(is_array($list)){
            foreach ($list as $k=>&$v){
                $v['username']      =   get_nickname($v['uid']);
                $v['category_title'] = 	get_category($v['category_id'],'title');
            }
        }

        $builder = new AdminListBuilder();
        $builder->title('草稿箱')
        		->setStatusUrl(U('setStatus'))
        		->buttonEnable()->buttonDisable()->buttonDelete()
        		->keyId('id', '编号')
        		->keyTitle()
        		->keyText('username', '创建者')
        		->keyText('category_title', '分类')
        		->keyUpdateTime()
        		->keyDoActionEdit('edit?id=###')
        		//->keyDoAction('Article/setStatus?status=-1&ids=###', '删除')
        		->data($list)
        		->pagination($totalCount, $pageRows)
        		->display();
    }

    /**
     * 清空回收站
     * @author cjli
     */
    public function clear(){
    	$map['status']  =   -1;
        $res = M('Article')->where($map)->delete();
        if($res !== false){
            $this->success('清空回收站成功！');
        }else{
            $this->error('清空回收站失败！');
        }
    }
    
    /**
     * 单页内容
     * @author cjli
     */
    public function pageList(){
	
		// 构建列表数据
        $model = M('Page');
        $list = $model->order('sort asc')->select();

        $builder = new AdminListBuilder();
        $builder->title('内容列表')
        		->buttonNew(U('pageEdit'))
        		->setStatusUrl(U('setPageStatus'))->buttonEnable()->buttonDisable()->buttonDelete()
        		->keyId('id', '编号')
        		->keyLink('title', '标题', 'edit?id=###')
        		//->keyText('sort', '优先级')
        		->keyUpdateTime()
        		->keyStatus('status', '状态')
        		->keyDoActionEdit('pageEdit?id=###')
        		->data($list)
        		->display();
    }


    /**
     * 单页面内容编辑
     * 
     * @author cjli
     */
    public function pageEdit($id = 0){

        //判断是否为编辑模式
        $isEdit = $id ? true : false;
        
        if($isEdit){
        	$info = M('page')->find($id);
        	if(false === $info){
                $this->error('获取内容信息错误');
            }
        }else {
        	$info = array('sort' => 0, 'link_id' => 0, 'id' => 0, 'cover_id' => 0);
        }
         //显示页面
        $builder = new AdminConfigBuilder();
        $builder
            ->title($isEdit ? '编辑页面' : '新增页面')
            ->keyTitle('title', '标题', '页面标题')
            ->keyText('name', '标识', '同一根节点下标识不重复')
            //->keyTextArea('summary', '描述')
            ->keyEditor('description','页面内容')
            ->keyNumber('sort','优先级','越高排序越靠前')
            //->keyImage('cover_id', '封面', '0-无封面，大于0-封面图片ID，需要函数处理')
            //->keyCreateTime('create_time', '创建时间')
            //->keyText('link_id', '外链', '0-非外链，大于0-外链ID,需要函数进行链接与编号的转换')
            //->keyText('template', '详情页显示模板', '参照display方法参数的定义')
            ->keyHidden('id')
            ->data($info)
            ->buttonSubmit(U('doPageEdit'))->buttonBack()
            ->highlight('pageList')
            ->display();
    }

    /**
     * 更新一条数据
     * @author cjli
     */
    public function doPageEdit(){
       $id = i('post.id', 0);
    	//判断是否为编辑模式
        $isEdit = $id ? true : false;
        
    	//写入数据库
        $model = D('Page');
    	$data = $model->create();
        if($data){
        	if($isEdit) {
        		if($model->save()){
        			//记录行为
                    action_log('update_page', 'page', $data['id'], UID);
                    $this->success('编辑成功', U('pageList'));
        		} else {
                    $this->error('编辑失败');
                }
        	} else {
        		unset($data['id']);
	        	$id = $model->add();
	            if($id){
	            	$this->success('新增成功', U('pageList'));
	                //记录行为
	                action_log('update_page', 'page', $id, UID);
	            } else {
	            	$this->error('新增失败');
	            }
        	}
        } else {
        	$this->error($model->getError());
        }
    }
    
	/**
     * 设置一条或者多条数据的状态
     * @author cjli
     */
    public function setPageStatus(){
        return parent::setStatus('Page');
    }
}
