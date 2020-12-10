const CONTEXT = 'CONTEXT';

const PUTBUCKETCORS = [
	{
		allowedOrigin: '*',
		allowedHeader: '*',
		allowedMethod: [
			'GET',
		],
	}
];

const REGIONLIST = ['cn-qingdao', 'cn-beijing', 'cn-zhangjiakou',
'cn-hangzhou', 'cn-shanghai', 'cn-shenzhen', 'cn-huhehaote',
'cn-hongkong', 'cn-chengdu', 'ap-southeast-1', 'ap-southeast-2',
'ap-south-1', 'ap-southeast-3', 'ap-southeast-5',
'ap-northeast-1', 'us-west-1', 'us-east-1',
'eu-central-1', 'eu-west-1'];

module.exports = {
	CONTEXT,
	PUTBUCKETCORS,
	REGIONLIST
}
