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

        let r = await tools.diff('diff ./data/v001.txt ./data/v002.txt');
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

        let r = await tools.diff(`diff -c ${file1} ${file2}`);

        let diffs = r.split('\n');

        //console.log(diffs);

        let left={},right={}, groups=[], group={p1:-1,p2:-1,p3:-1,p4:-1};

        let rowType = 0;

        let beginend = {};

        for(let line of diffs){
            if(line === '***************') {
                group={p1:-1,p2:-1,p3:-1,p4:-1};
                groups.push(group);
                continue;
            }

            if(line.search(/\*\*\* (\S*) \*\*\*\*/) !== -1){
                rowType = 1;
                beginend = getBeginEnd(line, /\*\*\* (\S*) \*\*\*\*/);
                //console.log('beginend', beginend);
                continue;
            }
            if(line.search(/\-\-\- (\S*) \-\-\-\-/) !== -1){
                rowType = 2;
                beginend = getBeginEnd(line, /\-\-\- (\S*) \-\-\-\-/);
                //console.log('beginend', beginend);
                continue;
            }

            if(rowType === 1){
                if(line[0] !== ' '){
                    left['row_' + beginend.begin.toString()] = {row:beginend.begin,content:line};

                    if(group.p1 === -1){
                        group.p1 = beginend.begin;
                    }else {
                        group.p4 = beginend.begin;
                    }
                }

                beginend.begin++;
            }
            if(rowType === 2){
                if(line[0] !== ' '){
                    right['row_' + beginend.begin.toString()] = {row:beginend.begin,content:line};

                    if(group.p2 === -1){
                        group.p2 = beginend.begin;
                    }else {
                        group.p3 = beginend.begin;
                    }
                }

                beginend.begin++;
            }
        }


        let v1 = fs.readFileSync(file1);
        let v2 = fs.readFileSync(file2);

        let lines1 = v1.toString().split('\n');
        let lines2 = v2.toString().split('\n');

        lines1 = adapter(lines1, left);
        lines2 = adapter(lines2, right);

        //console.log(lines1);
        console.log('left',left);
        console.log('right',right);
        console.log('groups',groups);

        await ctx.render('index', {left:lines1, right:lines2, groups:JSON.stringify(groups)});
    });

    function adapter(lines, diff){
        let result = [];
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            let d = '';
            if(diff.hasOwnProperty('row_' + (i+1))){
                d = diff['row_' + (i+1)];
            }
            result.push({content:line, diff:d});
        }
        return result;
    }

    function getBeginEnd(line, rex){
        let temp = line.match(rex);
        let nums = temp[1].split(',');
        return {begin:parseInt(nums[0]) , end: parseInt(nums[1]) };
    }

};
