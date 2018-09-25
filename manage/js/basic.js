
function SendData(url, data,async ,callBack) {
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        // contentType: "application/json",
        // headers: {'Content-Type': 'application/json'},
        cache: false,
        data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("EncryptType", "NONE");
        },
        success: function (data) {
            // $("body").Loading("hide");
            return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

function getData(url,callBack) {
    jQuery.ajax({
        type: "get",
        async: true,
        dataType: "json",
        url: url,
        timeout: 25000,
        // contentType: "application/json",
        // headers: {'Content-Type': 'application/json'},
        cache: false,
        // data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("EncryptType", "NONE");
        },
        success: function (data) {
            // $("body").Loading("hide");
            return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

function SendJsonData(url, data,async ,callBack) {
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        contentType: "application/json",
        // headers: {'Content-Type': 'application/json'},
        cache: false,
        data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("EncryptType", "NONE");
        },
        success: function (data) {
            // $("body").Loading("hide");
            return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

