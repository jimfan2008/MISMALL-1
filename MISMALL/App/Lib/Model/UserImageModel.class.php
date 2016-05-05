<?php
/**
 * 用户图片模型
 *
 * @author cjli
 *
 */
class UserImageModel extends Model {
	/**
	 * 获取用户图片类型列表
	 * @param int $user_id 用户ID
	 * @param string $file_type 文件类型 默认为 null图片
	 * @return array
	 */
	public function getUserImageTypeList($user_id, $file_type = null) {
		$type = trim($type);
		$user_id = intval($user_id);
		if (!$user_id) {
			return false;
		}
		$image_type_model = M('user_image_type');
		$image_type_model->field('id,imgTypeName,addTime');

		$map = array(
			'userId' => $user_id,
			'fileType' => $file_type,
		);
		$image_type_model->where($map)->order('sort DESC, id DESC');
		$imageTypeList = $image_type_model->select();
		return $imageTypeList;
	}

	/**
	 * 添加用户图片类型
	 * @param int $user_id 用户ID
	 * @param string $type_name 类型名称
	 * @param string $file_type 文件类型 默认为 null图片
	 * @return int 类型ID
	 */
	public function addUserImageType($user_id, $type_name, $file_type = null) {
		$set = array(
			'userId' => $user_id ? intval($user_id) : 0,
			'imgTypeName' => $type_name ? trim($type_name) : '',
			'fileType' => $file_type,
			'sort' => 99, //TODO　暂时无排序
			'addTime' => time(),
		);

		//如果用户ＩＤ为０或者类型名称为空
		if (!($set['userId'] && $set['imgTypeName'])) {
			return false;
		}

		$image_type_model = M('user_image_type');
		$type_id = $image_type_model->add($set);

		return $type_id;
	}

	/**
	 * 编辑用户图片类型
	 * @param int $user_id 用户ID
	 * @param int $type_id 类型ID
	 * @param string $type_name 类型名称
	 * @return boolean
	 */
	public function editUserImageType($user_id, $type_id, $type_name) {
		if (!intval($type_id) || empty($type_name)) {
			return false;
		}

		$image_type_model = M('user_image_type');

		//判断该用户的图片类型是否存在
		$map = array(
			'userId' => $user_id,
			'id' => array('neq', $type_id),
			'imgTypeName' => $type_name,
		);
		$have_count = $image_type_model->where($map)->count();
		if ($have_count) {
			return false;
		}
		//入库
		$affect = $image_type_model->where(array('id' => $type_id))->save(array('imgTypeName' => $type_name));
		return true;
	}

	/**
	 * 删除用户图片类型
	 * @param int $user_id 用户ID
	 * @param int $type_id 类型ID
	 * @return boolean
	 */
	public function deleteUserImageType($user_id, $type_id) {
		$image_type_model = M('user_image_type');
		$map = array(
			'userId' => $user_id,
			'id' => $type_id,
		);
		$affect = $image_type_model->where($map)->delete();
		//TODO没有删除图片
		return $affect;
	}

	/**
	 * 获取用户图片列表
	 * @param array $post 查模板条件
	 * @param int||null $page 从第几页开始, 默认查全部
	 * @param int $pageRows 每页的个数
	 * @return array
	 */
	public function getUserImageList($post, $page = null, $pageRows = 10) {
		$where = array(
			'imgTypeId' => isset($post['imgTypeId']) ? intval($post['imgTypeId']) : null,
			'userId' => isset($post['userId']) ? intval($post['userId']) : null,
			'fileType' => isset($post['fileType']) ? $post['fileType'] : '',
			'siteId' => isset($post['siteId']) ? intval($post['siteId']) : 0,
		);

		foreach ($where as $key => $val) {
			if (is_null($val)) {
				unset($where[$key]);
			}
		}

		$img_model = M('user_image');
		$img_model->field('id,imgUrl,imgName,imgTypeId,addTime');
		if ($page) {
			$img_model->page($page, $pageRows);
		}
		$imageList = $img_model->where($where)->order("id desc")->select(); //加载图片顺序 ljp
		if ($imageList) {
			foreach ($imageList as &$img) {
				if (!$file_type) {
					$img['imgThumb'] = getImageUrl($img['imgUrl'], 150, 150, true);
				}
				if(C("UPLOAD_URL")=="/uploads/"){//判断是否是本地
					$img['imgUrl'] = $img['imgUrl'];
				}else{
					$img['imgUrl'] = getImageUrl($img['imgUrl']);
				}
			}
		}
		unset($img);
		return $imageList;
	}

	/**
	 * 获取用户图片数量
	 * @param array $post 查模板条件
	 */
	public function getUserImageCount($post) {
		$where = array(
			'imgTypeId' => isset($post['imgTypeId']) ? intval($post['imgTypeId']) : null,
			'userId' => isset($post['userId']) ? intval($post['userId']) : null,
			'fileType' => isset($post['fileType']) ? $post['fileType'] : '',
			'siteId' => isset($post['siteId']) ? intval($post['siteId']) : 0,
		);

		foreach ($where as $key => $val) {
			if (is_null($val)) {
				unset($where[$key]);
			}
		}

		$img_model = M('user_image');
		$count = $img_model->where($where)->count();
		return $count;
	}

	/**
	 * 添加用户图片
	 * @param array $post	入库信息
	 * @return int
	 */
	public function addUserImage($post) {
		$set = array(
			'imgUrl' => isset($post['imgUrl']) ? $post['imgUrl'] : '',
			'imgName' => isset($post['imgName']) ? $post['imgName'] : '',
			'imgTypeId' => isset($post['imgTypeId']) ? intval($post['imgTypeId']) : 0,
			'fileType' => isset($post['fileType']) ? $post['fileType'] : '',
			'userId' => isset($post['userId']) ? intval($post['userId']) : 0,
			'siteId' => isset($post['siteId']) ? intval($post['siteId']) : 0,
			'addTime' => time(),
		);
		$img_model = M('user_image');
		$id = $img_model->add($set);
		return $id;
	}

	/**
	 * 删除用户图片
	 * @param int $img_id 图片ID
	 * @return number|number
	 */
	public function deleteUserImage($img_id) {
		$img_model = M('user_image');
		$imgUrl = $img_model->where(array('id' => $img_id))->getField('imgUrl');
		if (!empty($imgUrl)) {
			
			//删除阿里云上面的图片
			$object = str_replace("http://qjwd.oss-cn-shenzhen.aliyuncs.com/", "", $imgUrl);
			importORG('Upload.Driver.Aliyun');
			$OSS = new Aliyun();
			$bucketArr = C("UPLOAD_TYPE_CONFIG");
			$bucket   = $bucketArr['bucket'];
			
			$result = $OSS->delete_buckets($bucket,$object);
			//删除原图片
			/*$img_src = getImagePath($imgUrl);
			if (file_exists($img_src)) {
			@unlink($img_src);
			}
			//删除缩略图片
			$img_thumb = getImagePath($imgUrl, 150, 150);
			if (file_exists($img_thumb)) {
			@unlink($img_thumb);
			}*/
			$img_model->delete($img_id);
			return true;
		} else {
			return false;
		}
	}
}