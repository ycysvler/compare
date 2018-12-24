const inspect = require('util').inspect;
const path = require('path');
const fs = require('fs');
const os = require('os');
const jschardet = require("jschardet");
const encoding = require('encoding');
const Busboy = require('busboy');

/**
 * 同步创建文件目录
 * @param  {string} dirname 目录绝对地址
 * @return {boolean}        创建目录结果
 */
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/**
 * 获取上传文件的后缀名
 * @param  {string} fileName 获取上传文件的后缀名
 * @return {string}          文件后缀名
 */
function getSuffixName(fileName) {
    let nameList = fileName.split('.');
    return nameList[nameList.length - 1];
}

/**
 * 上传文件
 * @param  {object} ctx     koa上下文
 * @param  {object} options 文件上传参数 fileType文件类型， path文件存放路径
 * @return {promise}
 */
function uploadFile(ctx, options) {
    let req = ctx.req;
    let res = ctx.res;
    let busboy = new Busboy({headers: req.headers});

    // 获取类型
    let fileType = options.fileType || 'common';
    let filePath = path.join(options.path, fileType);
    let mkdirResult = mkdirsSync(filePath);

    return new Promise((resolve, reject) => {
        //console.log('文件上传中...');

        let result = {
            files:[],
            success: false,
            formData: {},
        };

        // 解析请求文件事件
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            let fileName = Math.random().toString(16).substr(2) + '.' + getSuffixName(filename);
            let _uploadFilePath = path.join(filePath, fileName);
            let saveTo = path.join(_uploadFilePath);

            //file = encoding.convert(file,'utf8','gbk');

            let stream = fs.createWriteStream(saveTo, {encoding:'utf8'});

            //监听data事件，接收传过来的文件，如果文件过大，此事件将会执行多次，此方法必须写在file方法里
            file.on('data', function (data) {
                //console.log('data', data);

            });

            // 文件写入事件结束
            file.on('end', function () {

                result.success = true;
                result.message = '文件上传成功';
                //result.path = _uploadFilePath;
                result.files.push(_uploadFilePath);

                //console.log('文件上传成功！');
            });

            // 文件保存到制定路径
            file.pipe(stream);

        });

        // 解析表单中其他字段信息
        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            console.log('表单字段数据 [' + fieldname + ']: value: ' + inspect(val));
            result.formData[fieldname] = inspect(val);
        });

        // 解析结束事件
        busboy.on('finish', function () {
            console.log('文件上结束');

            setTimeout(()=>{
                for(let file of result.files){
                    var buff = fs.readFileSync(file);
                    var info = jschardet.detect(buff);

                    if (info.encoding == "GB2312" || info.encoding == "ascii") {
                        let resultBuffer = encoding.convert(buff, "UTF-8", info.encoding);
                        fs.writeFileSync(file, resultBuffer, "utf8");
                    }
                }

                resolve(result);}, 10);

        });

        // 解析错误事件
        busboy.on('error', function (err) {
            console.log('文件上出错');
            reject(result);
        });

        //将流链接到busboy对象
        req.pipe(busboy);
    })
}

module.exports = uploadFile;
