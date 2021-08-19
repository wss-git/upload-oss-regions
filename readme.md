## 批量上传到 OSS

yml 配置
````
edition: 1.0.0
name: buildApp
# access: aliyun-release

services:
  image-test:
    component: wss-git/upload-oss-regions
    props:
      # Region: cn-shenzhen # 上传到指定的单个地区
      # Region: all # 上传到所有地区
      Region: # 上传到指定的多个地区
        - cn-shenzhen
        - cn-hangzhou
      Uri: ./zips # 制定要上传的文件夹
      BucketName: fc-console-gen-{region}-{accountId} # 指定上传的 bucket; 支持 {region} 和 {accountId} 写法
      ObjectPath: create-function-demo-code # 上传到 oss 的哪个目录下
      Ignore: # 指定哪些文件不上传
        - .DS_Store
````
#### BucketName 占位符

- {region}  实际部署中转义成 bucket 所在的区域   
- {accountId} 实际部署中转义成主账号的 uid

#### Region: all 部署的地区

> ['cn-qingdao', 'cn-beijing', 'cn-zhangjiakou',
'cn-hangzhou', 'cn-shanghai', 'cn-shenzhen', 'cn-huhehaote',
'cn-hongkong', 'cn-chengdu', 'ap-southeast-1', 'ap-southeast-2',
'ap-south-1', 'ap-southeast-3', 'ap-southeast-5',
'ap-northeast-1', 'us-west-1', 'us-east-1',
'eu-central-1', 'eu-west-1']

#### 执行指令的参数
- -y: 覆盖 ObjectPath 已经存在的文件
- -n: 不上传 ObjectPath 已经存在的文件
