/**
 * 心跳
 *
 * Created by VLER on 2018/7/18.
 */
const moment = require('moment');
const tools  = require('../../utils/tools');

module.exports = function (router) {
    router.get('/heartbeat', async (ctx) => {
        ctx.body = {
            code: 200,
            date: moment().format("YYYY-MM-DD hh:mm:ss")
        };
    });

    router.post('/tt', async(ctx)=>{
       console.log(ctx.request.body);

       let r = await tools.git('diff v001.txt');
       console.log('git' ,r);
       ctx.body = r;
    });
};