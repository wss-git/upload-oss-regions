
const OSS = require('ali-oss');
const inquirer = require('inquirer');
const fs = require("fs");
const walkSync = require('walk-sync');
const path = require('path');
const { PUTBUCKETCORS } = require('./constants');
const { spinner } = require('./utils');

class ClientProvider {
  constructor({ region, accessKeyId, accessKeySecret, securityToken }) {
    this.props = {
      region: `oss-${region}`,
      accessKeyId,
      accessKeySecret,
      stsToken: securityToken,
      timeout: 7200000 // 两个小时
    };
    this.ossClient = new OSS({ ...this.props });
  }

  async getOssClient (bucket) {
    const location = await new OSS({ ...this.props, bucket }).getBucketLocation(bucket);
    console.log('use bucket region: %s', location.location);
    console.log('use bucket Name: %s', bucket);
  
    return new OSS({
      ...this.props,
      bucket,
      region: location.location
    });
  }

  async put (bucket, objectPath, uri, { ignore, y, n }) {
    const uploadFiles = [];

    await this.getOrCreate(bucket);
    const paths = await walkSync(uri, { ignore });
    for(const p of paths) {
      const objectName = `${objectPath}/${p}`;
      if (!y) {
        try {
          const result = await this.ossClient.get(objectName);
          if (result.res.status === 200) {
            if (n) {
              console.log(`路径 ${objectName} 已存在，跳过该文件`);
              continue;
            }
            const answers = await inquirer.prompt([{
              name: 'overwrite',
              type: 'confirm',
              message: `路径 ${objectName} 已存在，是否覆盖该文件`
            }]);
            if (!answers.overwrite) { continue }
          }
        } catch (error) {
          if (error.code !== 'NoSuchKey') {
            throw error;
          }
        }
      }
      const fillPath = path.resolve(uri, p);
      const stat = fs.lstatSync(fillPath);
      if (!stat.isDirectory()) {
        await spinner(`上传 ${p}`, async () => {
          await this.ossClient.put(objectName, fillPath);
        });
        uploadFiles.push({
          OSSObjectName: objectName,
          LocalDir: fillPath
        })
      }
    }
    return uploadFiles;
  }

  async getOrCreate(bucket) {
    try {
      await this.ossClient.getBucketInfo(bucket);
    } catch (error) {
      if (error.code == 'NoSuchBucket') {
        await spinner(`Create ${bucket} bucket`, async () => {
          await this.ossClient.putBucket(bucket);
          await this.ossClient.putBucketACL(bucket, 'public-read');
          await this.ossClient.putBucketCORS(bucket, PUTBUCKETCORS);
        });
      } else {
        throw error;
      }
    }
    this.ossClient = await this.getOssClient(bucket);
  }
}

module.exports = ClientProvider;
