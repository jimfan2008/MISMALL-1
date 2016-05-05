<?php
/**
 * 微观应用列表
 */
class WeiGuanTemplateModel extends Model
{	
	//add
	public function addTpl($data,$id){
		// $time  = time();
		// $data["visits"]		= 0;//
		// $data['share'] 		= 0;
		// $data['createTime'] 	= $time;
		// $data["updateTime"] 	= $time;
		// $data["status"]  	= 1;
		
		$data["count"]		= 0;//
		$data["status"]  	= 1;
		$db = M("wei_guan_template");
		if($id){
			
			$result = $db-> where("id = '$id'") -> save($data);
		}else{
			$result = $db->add($data);
		}
		

		//$result = $this->add($data);
		return $$result;


	}
	//delete
	public function delTpl($id){
		$db = M("wei_guan_template");
		$data['status'] = "-1";  
		$result = $db->where("id  = '$id'")->save($data);
		return $result;
	}

	//select   one or all
	public function getTplList($id){
		
		
		$db = M("wei_guan_template");
		if($id!=0){
			$result = $db ->where(" id = '$id' ")->find();
		}else{
			$result = $db ->where(" status > -1 ")->select();
		}
		//pinrt_r($result);
		return $result;
	}
	public function getTplInfo($id){
		$tplId = "weiguan_tpl_".$id;
		
	}

	public  function modTpl(){

	}
	public  function modTplStauts($id,$status){
		
		$data['status'] = $status;  
		$db = M("wei_guan_template");
		$result= $db ->where("id='$id'")->save($data);
		
		unset($data);
		return $result;
		
	}
	
	//获取音乐列表
	/*
	 * 
	 * $type 类型
	 * $key 搜索的关键字
	 * */
	public function getMusicList($id, $type,$key){
		$db = M("wei_guan_music");
		if($id){
			$re = $db -> where("id = '$id'")->find();
			return $re;
		}
		$where="";
		if($type){
			$where += " AND type='$type'";
		}
		if($key){
			$where += " AND title like %".$key."%";
		}
		$re = $db -> where("status = 1".$where)->select();
		return $re;
	}
	
	//新增音乐
	public function addMusic($data){
		
		$data['status'] = 1;
		$data['addTime'] = time();
		$db = M("wei_guan_music");
		$re = $db -> add($data);
	}
	
	//删除音乐
	public function delMusic($id){
		if(!$id){
			return;
		}
		
		$db = M("wei_guan_music");
		$data['status']= -1;
		$re = $db ->where("id='$id'") -> save($data);
		//print_r($db->getLastSql());
		return $id;
	}
	
	//修改mod
	public function modMusic($id,$status){
		if(!id)
		return;
	
		$data['status'] =$status;
		$db = M("wei_guan_music");
		$re = $db -> where("id = '$id'")->save($data);
		return $re;
	}
	
	//获取音乐分类
	public function getMusicType(){
		$db = M("wei_guan_music_type");
		$re = $db -> where("status = 1")->select();
		return $re;
	}
	
	

}