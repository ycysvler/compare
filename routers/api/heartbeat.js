const fs = require("fs");
const path = require("path");
const moment = require('moment');
const tools = require('../../utils/tools');

module.exports = function (router) {
    router.get('/heartbeat', async (ctx) => {
        ctx.body = {
            code: 200,
            date: moment().format("YYYY-MM-DD hh:mm:ss")
        };
    });

    router.post('/tt', async (ctx) => {
        console.log(ctx.request.body);

        let r = await tools.git('diff ./data/v001.txt ./data/v002.txt');
        console.log('git', r);
        ctx.body = r;
    });

    router.get('/t1', async (ctx) => {
        let v1 = fs.readFileSync('./data/v001.txt');
        console.log('t1', v1);
        ctx.body = v1.toString();
    });

    router.get('/t2', async (ctx) => {
        let file1 = path.join(__dirname, "../../data/v001.txt");
        let file2 = path.join(__dirname, "../../data/v002.txt");

        console.log('file1', file1);
        console.log('file2', file2);

        let r = await tools.git(`diff ${file1} ${file2}`);
        console.log('git', r);

        let v1 = fs.readFileSync(file1);
        let v2 = fs.readFileSync(file2);

        let lines1 = v1.toString().split('\n');
        let lines2 = v2.toString().split('\n');

        await ctx.render('index', {lines1, lines2});
    });
};
