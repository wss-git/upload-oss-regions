/** @format */

const { commandParse, help, getCredential } = require('@serverless-devs/core');
const ClientProvider = require('./utils/client-provider');
const { REGIONLIST } = require('./utils/constants');

class MyComponent {
  async handlerInput (inputs) {
    let {
      credentials,
      props,
      project = {},
    } = inputs;
    if (!(credentials && credentials.AccessKeyID)) {
      credentials = await getCredential(project.access);
    }

    return {
      accessKeyId: credentials.AccessKeyID,
      accessKeySecret: credentials.AccessKeySecret,
      securityToken: credentials.SecurityToken,
      accountID: credentials.AccountID,

      region: props.Region,
      bucketName: props.BucketName,
      objectPath: props.ObjectPath || '',
      ignore: props.Ignore || [],
      uri: props.Uri
    }
  }

  getBucketName(bucket, region, accountID, isMultiple) {
    let b = bucket.replace(/\{region\}/, region);
    b = b.replace(/\{accountId\}/, accountID);
    if (isMultiple && bucket === b) {
      throw new Error(`region 地区多选时，BucketName 需要动态配置，例如：bucket-{region}-{accountId}`)
    }
    return b;
  }

  async upload(inputs) {
    const { Parameters = {} } = commandParse(inputs.args) || {};
    const { y, n, h } = Parameters;
    if (h) {
      return help({
        header: 'Options',
        optionList: [
          {
            name: 'y',
            description: '覆盖 ObjectPath 已经存在的文件',
            type: Boolean,
          },
          {
            name: 'n',
            description: '不上传 ObjectPath 已经存在的文件',
            type: Boolean,
          },
        ],
      });
    }

    if (y && n) {
      throw new Error('-y 和 -n 不能同时存在');
    }

    const {
      accessKeyId,
      accessKeySecret,
      accountID,

      region,
      bucketName,
      objectPath,
      ignore,
      uri
    } = await this.handlerInput(inputs);

    if (!region) {
      throw new Error('Region 是必填项');
    }
    const isAll = region === 'all';
    const isString = typeof region === 'string';
    let regions = region;
    if (isAll) {
      regions = REGIONLIST;
    } else if (isString){
      regions = [region];
    }

    const output = {};
    for (const r of regions) {
      const b = this.getBucketName(bucketName, r, accountID, isAll || !isString);
      const clientProvider = new ClientProvider({ region: r, accessKeyId, accessKeySecret });
      output[r] = await clientProvider.put(b, objectPath, uri, { ignore, y, n });
    }
    return output
  }
}
module.exports = MyComponent;
