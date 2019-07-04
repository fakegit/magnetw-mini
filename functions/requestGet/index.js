// 云函数入口文件
const got = require('got');

// 云函数入口函数
exports.main = async(event, context) => {
  const {
    uri,
    params
  } = event
  console.log(params)
  const {
    body
  } = await got(uri, {
    baseUrl: 'http://yoursite.com',
    json: true,
    query: params
  });
  return body
}