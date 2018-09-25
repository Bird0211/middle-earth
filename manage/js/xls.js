/*
            FileReader共有4种读取方法：
            1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
            2.readAsBinaryString(file)：将文件读取为二进制字符串
            3.readAsDataURL(file)：将文件读取为Data URL
            4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
                         */
var rABS = true; //是否将文件读取为二进制字符串

function importf() {//导入
    var obj = myDropzone;
    if(!obj.files) {
        return;
    }
    var reader = null;
    var oridatas = [];
    for(let i = 0; i < obj.files.length; i++){
        reader = new FileReader();
        var f = obj.files[i];
        reader.fileName = f.name; // file came from a input file element. file = el.files[0];
        (function (i) {
            reader.onload = function(e) {
                var oriFile = {};
                oriFile.data = [];
                oriFile.name = e.target.fileName;

                var data = e.target.result;
                var wb;//读取完成的数据
                if(rABS) {
                    wb = XLSX.read(btoa(fixdata(data)), {//手动转化
                        type: 'base64'
                    });
                } else {
                    wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }
                // 遍历每张表读取
                for (var sheet in wb.Sheets) {
                    if (wb.Sheets.hasOwnProperty(sheet)) {
                        var oridata = {};
                        oridata.name = wb.SheetNames[sheet];
                        oridata.fromTo = wb.Sheets[sheet]['!ref'];
                        oridata.range = wb.Sheets[sheet]['!range'];
                        oridata.manges = wb.Sheets[sheet]['!merges'];
                        oridata.data = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
                        // break; // 如果只取第一张表，就取消注释这行
                        oriFile.data.push(oridata);
                    }
                }
                oridatas.push(oriFile);
            };
        })(i)

        if(rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
    }

    reader.onloadend = function (e) {
        var dateObj = new Date();
        //var year = dateObj.getFullYear();
        var month = dateObj.getMonth()+1;//月  (注意：月份+1)
        var date = dateObj.getDate();//日
        /*var day = dateObj.getDay();
        var hours = dateObj.getHours();//小时
        var minutes = dateObj.getMinutes();//分钟
        var seconds = dateObj.getSeconds();//秒*/
        //导出微商城
        if(oridatas.length == 1)
            downloadExl(format_data(oridatas,true),"xlsx",month + "." + date + "微商城" + ".xlsx");
        if(oridatas.length == 2)
            downloadExl(final_data(oridatas,false),"xlsx",month + "." + date + "MEE-Import" + ".xlsx")
        //导出汇总表
        //downloadExl(total_data(oridatas),"xlsx","批量数据处理表.xlsx");
    }

}

function fixdata(data) { //文件流转BinaryString
    var o = "",
        l = 0,
        w = 10240;
    for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}


var tmpDown; //导出的二进制对象
function downloadExl(data, type,filename) {

    //json = JSON.parse(data);
    var json = data;
    var tmpdata = json[0];
    json.unshift({});
    var keyMap = []; //获取keys
    for (var k in tmpdata) {
        keyMap.push(k);
        json[0][k] = k;
    }
    var tmpdata = [];//用来保存转换好的json
    json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
        v: v[k],
        position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
    }))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => tmpdata[v.position] = {
        v: v.v
    });
    var outputPos = Object.keys(tmpdata); //设置区域,比如表格从A1到D10
    //tmpdata["A1"].s = { font: { sz: 16, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } };//<====设置xlsx单元格样式
    //tmpdata["B1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } };//<====设置xlsx单元格样式

    var tmpWB = {
        SheetNames: ['sheet1'], //保存的表标题
        Sheets: {
            'sheet1': Object.assign({},
                tmpdata, //内容
                {
                    '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] //设置填充区域
                })
        }
    };
    tmpDown = new Blob([s2ab(XLSX.write(tmpWB,
        {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}//这里的数据是用来定义导出的格式类型
    ))], {
        type: ""
    }); //创建二进制对象写入转换好的字节流
    var href = URL.createObjectURL(tmpDown); //创建对象超链接
    var a = document.getElementById("hf");
    a.href = href; //绑定a标签
    //a.download = month + "." + date + "微商城" + ".xlsx";
    a.download = filename;
    a.click(); //模拟点击实现下载
    setTimeout(function() { //延时释放
        URL.revokeObjectURL(tmpDown); //用URL.revokeObjectURL()来释放这个object URL
    }, 100);
}

function s2ab(s) { //字符串转字符流
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
// 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
function getCharCol(n) {
    let temCol = '',
        s = '',
        m = 0;
    while (n > 0) {
        m = n % 26 + 1;
        s = String.fromCharCode(m + 64) + s;
        n = (n - m) / 26;
    }
    return s;
}

function checkFiles(files) {
    for(let i = 0; i < files.length - 1; i++){
        if(files[i].name == files[files.length-1].name)
            return false;
    }
    return true;
}

var reg = new RegExp('"',"g");

//格式化数据
function format_data(ori_datas,isFilter) {
    if(ori_datas == null)
        return;

    var filtermodel;
    if(isFilter){
        filtermodel = getFilterModel();
    }

    var format_data = [];
    if(ori_datas.length == 1){
        var filename = ori_datas[0].name;
        if(filename.indexOf("订单发货明细表") < 0) {
            toastr.error("文件错误！请上传订单发货明细表");
            return;
        }

        var wb = ori_datas[0].data;
        var sheet = wb[0];
        var data = sheet.data;
        var start_row = -1;
        var order_data = {};
        for(var i = 0; i<data.length; i++){
            var d = data[i];
            for(var item in d){
                var jValue=d[item];//key所对应的value
                if(jValue.indexOf('行号,订单编号') > -1) {
                    start_row = i;
                    break;
                }

                if(jValue.indexOf('合计') > -1) {
                    start_row = -1;
                    break;
                }
                if(i > start_row && start_row > -1) {
                    var values = jValue.split(',');
                    var order = values[1].trim().replace(reg, "");
                    var name = values[2].trim().replace(reg, "");
                    var phone = values[9].trim().replace(reg, "");
                    var addr = values[8].trim().replace(reg, "");
                    var content = values[3].trim().replace(reg, "");
                    var num = values[5].trim().replace(reg, "");
                    var express = values[10].trim().replace(reg, "");
                    if(express != null && express != ''){   //存在物流公司 则跳过
                        continue;
                    }
                    if(isFilter && filter_order(content,filtermodel)){
                        continue;
                    }

                    if(order_data[order]) {
                        var o = order_data[order];
                        o.num = Number(o.num)+ Number(num);
                        o.content = o.content + content +" X "+ num + " ; ";
                        order_data[order] = o;
                    } else {
                        var o = {};
                        o.name = name;
                        o.phone = phone;
                        o.addr = addr;
                        o.num = num;
                        o.content = content +" X "+ num + "; ";
                        order_data[order] = o;
                    }
                }

            }
        }
//运单编号	订单编号	收件人	收件人联系电话	收货人详细地址	寄件人电话	内件品名1 总数量	*实际重量（kg）
        if(order_data) {
            for(var item in order_data){
                var o = order_data[item];
                var d = {};
                d["运单编号"] = "";
                d["订单编号"] = item;
                d["收件人"] = o.name;
                d["收件人联系电话"] = o.phone;
                d["收货人详细地址"] = o.addr;
                d["寄件人电话"] = "3PL";
                d["内件品名1"] = o.content;
                d["总数量"] = o.num;
                d["*实际重量（kg）"] = "";
                format_data.push(d);
            }
        }

    }
    return format_data;
}

function filter_order(content,filterModel) {
    //读取文件内容
    if(!filterModel || filterModel == '')
        return false;

    var models = filterModel.split('\n');
    return models.includes(content);
}

function getFilterModel() {
    var url = "/manage/html/filter.txt";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;
    return dataString;
}


//格式化数据
function total_data(ori_datas) {
    if(ori_datas == null)
        return;

    var format_data = [];
    if(ori_datas.length == 1){
        var filename = ori_datas[0].name;
        if(filename.indexOf("订单发货明细表") < 0) {
            toastr.error("文件错误！请上传订单发货明细表");
            return;
        }

        var wb = ori_datas[0].data;
        var sheet = wb[0];
        var data = sheet.data;
        var start_row = -1;
        var order_data = {};
        var all_data = [];
        var spl_data = [];
        for(var i = 0; i<data.length; i++){
            var d = data[i];
            for(var item in d){
                var jValue=d[item];//key所对应的value
                if(jValue.indexOf('行号,订单编号') > -1) {
                    start_row = i;
                    break;
                }

                if(jValue.indexOf('合计') > -1) {
                    start_row = -1;
                    break;
                }

                if(i > start_row && start_row > -1) {
                    var values = jValue.split(',');
                    var order = values[1].trim().replace(reg, "");
                    //var name = values[2].trim().replace(reg, "");
                    //var phone = values[9].trim().replace(reg, "");
                    //var addr = values[8].trim().replace(reg, "");
                    var content = values[3].trim().replace(reg, "");
                    var num = values[5].trim().replace(reg, "");
                    var express = values[10].trim().replace(reg, "");
                    if(express != null && express != ''){   //存在物流公司 则跳过
                        continue;
                    }
                    var detail = {};
                    detail.name = content;
                    detail.order = order;
                    detail.num = num;
                    detail.remark = content +" * "+ num;
                    all_data.push(detail);

                    if(order_data[order]) {
                        var o = order_data[order];
                        o.order = order;
                        o.num = Number(o.num)+ Number(num);
                        o.content = o.content + content +"*"+ num + ",";
                        order_data[order] = o;
                    } else {
                        var o = {};
                        o.order = order;
                        o.num = num;
                        o.content = content +"*"+ num + ",";
                        order_data[order] = o;
                    }
                }
            }
        }

        for(var key in order_data){
            spl_data.push(order_data[key]);
        }

        if(all_data && spl_data) {
            var i = 0;
            for(var k = 0;k < all_data.length; k++){
                var item = all_data[k];
                var d = {};
                d["订单编号"] = item.order;
                d["商品名称"] = item.name;
                d["数量"] = item.num;
                d["辅助"] = item.remark;
                d[""] = "";
                if(spl_data.length <= i) {
                    d["订单编号 "] = "";
                    d["商品名称 "] = "";
                    d["数量 "] = "";
                }else {
                    d["订单编号 "] = spl_data[i].order;
                    d["商品名称 "] = spl_data[i].content;
                    d["数量 "] = spl_data[i].num;
                    i++;
                }

                format_data.push(d);
            }
        }

    }
    return format_data;
}


function final_data(ori_datas) {
    if(ori_datas == null || ori_datas.length < 2)
        return;

    var f_data = [];
    var express_data = {};
    var base_data = [];
    for(var f = 0; f < ori_datas.length; f++){
        var file_data = ori_datas[f];
        var wb = file_data.data;
        var sheet = wb[0];
        var data = sheet.data;
        var filename = file_data.name;
        if(filename.indexOf("订单发货明细表") < 0) {
            //物流订单
            for(var i = 0; i<data.length; i++){
                var d = data[i];
                let order;
                let express;
                for(var item in d){
                    if(item == '订单编号') {
                        order = d[item];
                    }
                    if(item == '运单编号') {
                        express = d[item];
                    }
                    if(order && express){
                        express_data[order] = express.trim().replace(reg, "");
                        break;
                    }
                }
            }
        }else {
            var rownum = -1;
            var start_row = -1;
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                for (var item in d) {
                    //基本信息
                    rownum ++;
                    var jValue = d[item];//key所对应的value
                    if (jValue.indexOf('行号,订单编号') > -1) {
                        start_row = rownum;
                        continue;
                    }

                    if (jValue.indexOf('合计') > -1) {
                        start_row = -1;
                        continue;
                    }

                    if (rownum > start_row && start_row > -1) {
                        var values = jValue.split(',');
                        var order = values[1].trim().replace(reg, "");
                        var name = values[2].trim().replace(reg, "");
                        var phone = values[9].trim().replace(reg, "");
                        var addr = values[8].trim().replace(reg, "");
                        var id_num = values[12].trim().replace(reg, "");        //身份证号
                        var content = values[3].trim().replace(reg, "");
                        var num = values[5].trim().replace(reg, "");
                        var sku = values[4].trim().replace(reg, "");
                        var express = values[10].trim().replace(reg, "");
                        if (express != null && express != '') {   //存在物流公司 则跳过
                            continue;
                        }
                        var detail = {};
                        detail.name = name;
                        detail.order = order;
                        detail.num = num.toString();
                        detail.id_num = id_num;
                        detail.content = content;
                        detail.addr = addr;
                        detail.phone = phone;
                        detail.sku = sku;
                        base_data.push(detail);
                    }
                }
            }
        }
    }
    if(express_data && base_data.length > 0) {
        var data0 = base_data[0];
        var oder0 = data0.order.trim().replace(reg, "");
        for(var item in base_data){
            var data = base_data[item];
            var order = data.order.trim().replace(reg, "");
            var expId = express_data[order];

            if(!expId || expId == null || expId == ''){
                continue;
            }

            var format_data = {};

            format_data[oder0+" "] = order;
            format_data[data0.name] = data.name;
            format_data[data0.id_num] = data.id_num;
            format_data[data0.addr] = data.addr;
            format_data[data0.phone+" "] = data.phone;
            format_data[data0.sku+" "] = data.sku;
            format_data[data0.content] = data.content;
            format_data[data0.num] = data.num;
            format_data[express_data[oder0] + " "] = expId;

            f_data.push(format_data);
        }
    }

    return f_data;
}


