<?php
/**
 * 平台提供的网站设计图片元素管理
 * 
 * @author cjli
 *
 */
class SystemImageModel extends Model
{
	const SYSTEM_BACKGROUND_IMAGE = 1; //网站背景图片
	
	/**
	 * 获取系统图片列表
	 * @param array $post 获取条件
	 * @param int $page 第几页
	 * @param int $pageRow　每页多少个
	 * @return array
	 */
	public function getSystemImageList($post, $page = 0, $pageRows = 20)
	{
		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'imgName' => isset($post['imgName']) && $post['imgName'] ? array('like', '%'.$post['imgName'].'%') : NULL,
			'imgTypeId' => isset($post['imgTypeId']) ? intval($post['imgTypeId']) : NULL,
			'userId' => isset($post['userId']) ? intval($post['userId']) : NULL,
		);
		
		foreach($where as $key => $val ) {
			if(is_null($val)) {
				unset($where[$key]);
			}
		}
		
		//分页
		if($page) {
			$this->page($page, $pageRows);
		}
		$imageList = $this->select();
		foreach($imageList as &$img) {
			$img['imgThumb'] = getImageUrl($img['imgUrl'], 60, 60, true);
			$img['imgUrl'] = getImageUrl($img['imgUrl']);
			$img['imgId'] = $img['id'];
		}
		unset($img);
		
		return $imageList ? $imageList : array();
	}
	
	/**
	 * 获取系统图片总数
	 * @param array $post 获取条件
	 * @return int 个数
	 */
	public function getSystemImageCount($post)
	{
		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'imgName' => isset($post['imgName']) && $post['imgName'] ? array('like', '%'.$post['imgName'].'%') : NULL,
			'imgTypeId' => isset($post['imgTypeId']) ? intval($post['imgTypeId']) : NULL,
			'userId' => isset($post['userId']) ? intval($post['userId']) : NULL,
		);
		
		foreach($where as $key => $val ) {
			if(is_null($val)) {
				unset($where[$key]);
			}
		}
		
		return $this->where($where)->count();
	}
}