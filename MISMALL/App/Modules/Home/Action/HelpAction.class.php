<?php
/**
 * 帮助文档
 */
class HelpAction extends HomeAction {
	
	/*
	public function index() {
			$cateInfo = D('Article')->getCategoryInfo('helpCenter');
			if(!$cateInfo){
				$this->error('鍒嗙被涓嶅瓨鍦紒');
			}
			$cateList = D('Article')->getCategoryTree($cateInfo['id']);
			
			$this->assign('cateList', $cateList);
			$this->display();
		}*/
	public function index(){
		
		$this->display();
	}
	
	/**
	 * 获取分类的子类
	 * @param	int		$cid 分类ID
	 * @return	json
	 */
	public function getHelpCate() {
		$cid = I('post.cid', 0, 'intval');
		
		echo json_encode_cn( D('Help') -> getHelpCate($cid));
	}
	
	/**
	 * 获取子类下文档列表
	 * @param	int		$cid 子类ID
	 * @return	json
	 */
	public function getHelpTitle() {
		$cid = I('post.cid', 0, 'intval');
		$page = I('post.page', 0, 'intval');
		if($cid){
			$pageRows = 200;			
		}else{
			$pageRows = 20;
		}
		
		$title = I('post.title', '');
		
		$where = array(
			'category_id' => $cid,
		);
		if($title){
			$where['title'] = $title;
		}
		$page = $page ? $page : 1;
		
		$count = D('Article')->getArticleCount($where);
		$list = D('Article')->getArticleList($where, $page, $pageRows,"id,uid,name,title,category_id,summary");
		$return = array(
			'total' => $count,
			'list' => $list,
		);
		
		echo json_encode_cn( $return );
	}
	
	public function getDetail(){
		$id = I('post.aid', 0, 'intval');
		
		$info = D('Article')->field('title,description')->detail($id);
		
		echo json_encode_cn($info);
		//$this->assign('info', $info);
		//$this->display('help_detail');
	}
	
	/*
	 * 获取帮助菜单级联分类
	 * */
	 
	 public function getCategary(){
	 	$re = D("Help")->getHelpLeftMenu();
		//unset($re[0],$re[1],$re[2],$re[3],$re[4]);
		echo json_encode_cn($re);
		
	 }
	 
	
		 
	 
}