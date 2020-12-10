/** @format */

const { Component } = require('@serverless-devs/s-core');
const ClientProvider = require('./utils/client-provider');
const { REGIONLIST } = require('./utils/constants');

class MyComponent extends Component {
  handlerInput (inputs) {
    const {
      Credentials,
      Properties
    } = inputs;

    return {
      accessKeyId: Credentials.AccessKeyID,
      accessKeySecret: Credentials.AccessKeySecret,
      securityToken: Credentials.SecurityToken,
      accountID: Credentials.AccountID,

      region: Properties.Region,
      bucketName: Properties.BucketName,
      objectPath: Properties.ObjectPath || '',
      ignore: Properties.Ignore || [],
      uri: Properties.Uri
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
    const { Parameters } = this.args(inputs.Args);
    const { y, n } = Parameters;
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
    } = this.handlerInput(inputs);

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
