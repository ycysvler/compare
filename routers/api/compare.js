const fs = require("fs");
const path = require("path");
const tools = require('../../utils/tools');
const uploadFile = require('../../utils/upload');
const jschardet = require("jschardet");
const encoding = require('encoding');

module.exports = function (router) {

    router.get('/index',async(ctx)=>{
        await ctx.render('index');
    });

    router.post('/upload', async(ctx)=>{
        let serverFilePath = path.join(__dirname, '../../public');

        // 上传文件事件
        let f = await uploadFile(ctx, {
            fileType: 'file',          // 上传之后的目录
            path: serverFilePath
        });

        // let file1 = f.files[0];
        // let file2 = f.files[1];
        console.log('file1', f.files[0]);
        console.log('file2', f.files[1]);



        let file1 = path.join(__dirname, "../../data/v001.txt");
        let file2 = path.join(__dirname, "../../data/v002.txt");

        file1 = f.files[0];
        file2 = f.files[1];


        let leftRows = fs.readFileSync(file1).toString().split('\n');
        let rightRows = fs.readFileSync(file2).toString().split('\n');


        let r = await tools.diff(`diff ${file1} ${file2}`);

        console.log(r);

        let diffs = r.split('\n');

        let diffrows = getLeftRightDiffRows(diffs);

        leftRows = adapter(leftRows, diffrows.leftRows);
        rightRows = adapter(rightRows, diffrows.rightRows);

        let statistics = {
            left:`相对变化${diffrows.leftRows.length}行`,
            right:`相对变化${diffrows.rightRows.length}行`
        };

        console.log( diffrows.leftRows);
        await ctx.render('compare', {left: leftRows, right: rightRows, groups: JSON.stringify(diffrows.relations), statistics:statistics});
    });

    router.get('/c', async (ctx) => {
        let file1 = path.join(__dirname, "../../data/v001.txt");
        let file2 = path.join(__dirname, "../../data/v002.txt");

        let leftRows = fs.readFileSync(file1).toString().split('\n');
        let rightRows = fs.readFileSync(file2).toString().split('\n');


        let r = await tools.diff(`diff ${file1} ${file2}`);

        let diffs = r.split('\n');

        let diffrows = getLeftRightDiffRows(diffs);

        leftRows = adapter(leftRows, diffrows.leftRows);
        rightRows = adapter(rightRows, diffrows.rightRows);

        // console.log('left',leftRows);
        // console.log("right",rightRows);
        // console.log('diffrows.relations', diffrows.relations);

        await ctx.render('compare', {left: leftRows, right: rightRows, groups: JSON.stringify(diffrows.relations)});
    });

    function adapter(rows, diffs) {
        let result = [];
        for (let i = 0; i < rows.length; i++) {
            result.push({index: i, content: rows[i], type: ''});
        }

        for (let row of diffs) {
            result[row.row - 1]['type'] = row.type;
        }
        return result;
    }

    function getLeftRightDiffRows(rows) {
        let groups = [], group = {};
        let result = {leftRows: [], rightRows: [], relations: []};
        for (let row of rows) {
            if(row === '\\ 文件尾没有 newline 字符')
                continue;
            if (row[0] === '<' || row[0] === '>' || row[0] === '-') {
                group.rows.push(row);
            } else if (row) {
                // new group
                group = {rows: [], head: splitLeftRight(row)};
                groups.push(group);
            }
        }

        for (let item of groups) {
            let t = getLeftRightRelation(item);
            result.rightRows = result.rightRows.concat(t.rightRows);
            result.leftRows = result.leftRows.concat(t.leftRows);
            result.relations = result.relations.concat(t.relations);
        }
        return result;
    }


    // 获取左右行
    function getLeftRightRelation(group) {
        let leftRows = [], rightRows = [], relations = [];

        // 映射关系
        let relation = {
            p1: group.head.leftBegin,
            p2: group.head.rightBegin,
            p3: group.head.rightEnd,
            p4: group.head.leftEnd
        };

        // 修改情况调整坐标
        if(group.head.type === 'c'){
            relation.p1--;
            relation.p2--;
        }
        // 删除情况调整坐标
        if(group.head.type === 'd'){
            relation.p1--;
        }
        // 添加情况调整坐标
        if(group.head.type === 'a'){
            relation.p2--;
        }

        for (let row of group.rows) {
            if (row[0] === '<') {
                leftRows.push({row: group.head.leftBegin, content: row, type: group.head.type});
                group.head.leftBegin++;
            }
            if (row[0] === '>') {
                rightRows.push({row: group.head.rightBegin, content: row, type: group.head.type});
                group.head.rightBegin++;
            }
        }

        if (group.head.type === 'a') {
            leftRows.push({row: group.head.leftBegin, content: '', type: 'a'});
        }
        if (group.head.type === 'd') {
            rightRows.push({row: group.head.rightBegin, content: '', type: 'd'});
        }



        relations.push(relation);

        let data= {"leftRows": leftRows, "rightRows": rightRows, "relations": relations};
        return data;
    }

    // 获取左右列开始行
    function splitLeftRight(head) {
        let temps = [];
        let result = {leftBegin: -1, rightBegin: -1, content: head, type: 'c'};
        if (head.indexOf('a') > -1) {
            temps = head.split('a');
            result.type = 'a';
        }
        if (head.indexOf('c') > -1) {
            temps = head.split('c');
            result.type = 'c';
        }
        if (head.indexOf('d') > -1) {
            temps = head.split('d');
            result.type = 'd';
        }

        console.log(head);
        // 获取分组的开始时间，结束时间
        result.leftBegin = getBeginRow(temps[0]).begin;
        result.leftEnd = getBeginRow(temps[0]).end;
        result.rightBegin = getBeginRow(temps[1]).begin;
        result.rightEnd = getBeginRow(temps[1]).end;

        return result;
    }

    // 提取起始行数字
    function getBeginRow(str) {
        let temps = str.split(',');
        console.log('temps', temps);
        let begin, end;
        begin = parseInt(temps[0]);
        end = temps.length > 1 ? parseInt(temps[1]) : parseInt(temps[0]);
        return {begin, end};
    }

};
