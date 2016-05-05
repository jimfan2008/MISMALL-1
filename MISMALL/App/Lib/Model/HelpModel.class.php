<?php

/**
 * 帮助中心模型，负责处理帮助文档的类型，文档数据
 * 
 */
class HelpModel extends CommonModel {
	 //首先做一个类内的变量，存储一下相关的数组：
	 public $tree = null;
	/**
	 * 获取分类的子类
	 * @param	int		$cid 分类ID
	 * @return	array
	 */
	public function getHelpCate($cid) {
		if ($cid == 0 || $cid == '')
			return 0;
		
		$cate_list = M('category') -> where("pid='$cid' AND status=1") -> field('id, title') -> order('sort') -> select();
		
		return  $cate_list ? $cate_list : array();
	}
	
	
	/**
	 * 获取子类的文档列表
	 * @param	int		$cid 子类ID
	 * @return	array
	 
	public function getHelpTitle($cid) {
		if ($cid == 0 || $cid == '')
			return 0;
		
		$art_list = M('article') -> where("category_id=$cid") -> field('id, title') -> order('id') -> select();
		
		return $art_list ? $art_list : array();

	}*/
	 
 //获取帮助中心左边菜单方法
		public function getHelpLeftMenu() {
			$res = M('category')->field("title,id")->order("sort DESC")->select();
			//$data = $this->createtree($res);
			$res2 = M('article')->where("status=1")->order("sort DESC")->field("title,id,category_id")->select();
			//$result = M('category')->table(C("DB_PREFIX")."article as A")->join(C("DB_PREFIX")."category AS B on A.category_id=B.id")->field("B.id,B.title as menu_title,A.id,A.title,A.category_id")->select();
			//$res = $this->tree;
			$data = array();
			foreach ($res as $k => $v) {
			$data[$v['id']]=$v;
			}
			foreach ($res2 as $key => $value) {
			$data[$value["category_id"]]["article"][]=$value;
			}
			$data2= array();
			foreach ($data as $m => $n) {
			$data2[] = $n;
			}
			$res["article"]=$res2;
			return $data2;
		}

	 //这里是递归方法
	 private function createtree(array $data = null, $lv = 1) {
	        for ($i = 0; $i < count($data); $i++) {
	            $data[$i]['lv'] = $lv;
	            $this->tree[$i] = $data[$i];
	            $res = M('category')->where('pid='.$data[$i]['id'].' AND status=1' )->order("sort")->select();
				 $this->tree[$i]["subMenu"]=$res;
	           // $this->createtree($res, ($lv + 1));
	        }
			//return $data;
	 }
	
	
	
	
}
?>