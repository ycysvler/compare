/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const moment = require('moment');

const tools = require('../../utils/tools');
const JobLogic = require('../../db/mongo/dao/job');
const VideoKeyFrameLogic = require('../../db/mongo/dao/videokeyframe');
const videoKeyFrameLogic = new VideoKeyFrameLogic();

const jobLogic = new JobLogic();

module.exports = function (router) {
    // 获取视频列表
    router.get('/job/:videoid', async(ctx) => {
        let ok = tools.required(ctx, ['videoid']);
        if (ok) {
            let videoid = ctx.params.videoid;

            let item = await jobLogic.list(videoid);
            if (item) {
                ctx.body = {code: 200, data: item};
            } else {
                ctx.body = {code: 404, data: item};
            }
        }
    });
    // 添加分组
    router.post('/job', async(ctx) => {
        let ok = tools.required(ctx, ["videoid", "name", "desc"]);
        if (ok) {
            let item = await jobLogic.create(ctx.request.body);
            ctx.body = {code: 200, data: item};
        }
    });
    // 删除视频
    router.delete('/job/:videoid', async(ctx) => {
        let videoid = ctx.params.videoid;
        let items = await jobLogic.removeByIds([videoid]);
        ctx.body = {code: 200, data: items};
    });

    // 获取关键帧列表
    router.get('/job/key/frame/:jobid', async(ctx) => {
        let ok = tools.required(ctx, ['jobid']);
        if (ok) {
            let jobid = ctx.params.jobid;
            let items = await videoKeyFrameLogic.list(jobid);
            ctx.body = {code: 200, data: items};
        }
    });

    // 添加关键帧
    router.post('/job/key/frame', async(ctx) => {
        let ok = tools.required(ctx, ["jobid", "frameno"]);
        if (ok) {
            let item = await videoKeyFrameLogic.create(ctx.request.body);
            ctx.body = {code: 200, data: item};
        }
    });
};
