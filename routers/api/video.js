/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const moment = require('moment');

const tools = require('../../utils/tools');
const uploadFile = require('../../utils/upload');
const VideoLogic = require('../../db/mongo/dao/video');
const VideoKeyFrameLogic = require('../../db/mongo/dao/videokeyframe');
const VideoSourceFrameLogic = require('../../db/mongo/dao/videosourceframe');

const videoLogic = new VideoLogic();
const videoKeyFrameLogic = new VideoKeyFrameLogic();
const videoSourceFrameLogic = new VideoSourceFrameLogic();

module.exports = function (router) {
    // 获取视频列表
    router.get('/video', async (ctx) => {
        let items = await videoLogic.list();
        ctx.body = {code: 200, data: items};
    });
    // 获取视频列表
    router.get('/video/:id', async (ctx) => {
        let ok = tools.required(ctx, ['id']);
        if(ok){
            let id = ctx.params.id;
        }
        let item = await videoLogic.single(id);
        if(item){
            ctx.body = {code: 200, data: item};
        }else{
            ctx.body =  {code: 404, data: item};
        }

    });
    // 上传视频
    router.post('/video', async (ctx) => {
        let ok = tools.required(ctx, ["group", "fps",  "desc"]);
        if (ok) {
            let desc = ctx.request.query['desc'];
            let group = ctx.request.query['group'];
            let fps = ctx.request.query['fps'];

            let serverFilePath = path.join(__dirname, '../../public');

            // 上传文件事件
            let f = await uploadFile(ctx, {
                fileType: 'videos',          // 上传之后的目录
                path: serverFilePath
            });
            // 文件名
            let filename = path.basename(f.path);
            // 消息体
            let body = {"fps": fps, "group": group, "name": filename, "desc": desc};
            // 添加数据
            let item = await videoLogic.create(body);

            ctx.body = {code: 200, data: item};
        }
    });
    // 删除视频
    router.delete('/video', async (ctx) => {
        let items = await videoLogic.removeByIds(ctx.request.body);
        ctx.body = {code: 200, data: items};
    });


};
