const fs = require("fs");
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

       let r = await tools.git('diff ./data/v001.txt ./data/v002.txt');
       console.log('git' ,r);
       ctx.body = r;
    });

    router.get('/t1', async(ctx)=>{
        let v1 = fs.readFileSync('./data/v001.txt');
        console.log('t1' ,v1);
        ctx.body = v1.toString();
    });

    router.get('/t2', async(ctx)=>{
        let v1 = fs.readFileSync('./data/v001.txt');
        let v2 = fs.readFileSync('./data/v002.txt');

        let lines1 = v1.toString().split('\n');
        let lines2 = v2.toString().split('\n');

       await ctx.render('index',{lines1, lines2});
    });
};