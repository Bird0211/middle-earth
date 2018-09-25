/**
 * Created by bshn on 2017/8/8.
 */


//var baseurl = "http://localhost:8828/services"

var menuhtml = "";
var sys = 1;
manage = {
    getToken:function () {
        return manage.cookie.get("_token");
    },

    setToken:function (token) {
        manage.cookie.set("_token",token,108000);
    },

    getUserName:function () {
        return manage.cookie.get("_username");
    },

    setUserName:function (name) {
        manage.cookie.set("_username",name,108000);
    },

    initMenu:function(token){
        var url = baseurl + "/manage/getusermenu";
        var data = {};
        data.token = token;
        data.sys = sys;
        SendJsonData(url,JSON.stringify(data),true,function (data) {
            if(data.statusCode == 0){
                var menus = data.userMenus;
                setMenu(menus);
                $('#ulmene').html(menuhtml);
            }else {
                alert("用户异常，请重新登录！");
                window.location.href = "/manage/login.html";
            }
        });
    },
    initUserName:function (name) {
        $('.user-info').html(name);
    },
    logout:function () {
        manage.cookie.remove("_token");
        manage.cookie.remove("_username");
        window.location.href = "/manage/login.html";
    },
    resetpwd:function () {
        window.location.href = "/manage/resetpwd.html";
    }

};

manage.cookie = {
    /**
     * 获取cookie指定name值
     */
    get: function (name) {
        var cookie = document.cookie,
            e, p = name + "=",
            b;
        if (!cookie)
            return;
        b = cookie.indexOf("; " + p);
        if (b == -1) {
            b = cookie.indexOf(p);
            if (b != 0)
                return null;
        } else {
            b += 2;
        }
        e = cookie.indexOf(";", b);
        if (e == -1)
            e = cookie.length;
        return decodeURIComponent(cookie.substring(b + p.length, e));
    },
    /**
     * 设置cookie
     *
     *  expires参数可以是js Data()对象或过期的秒数     *
     */
    set: function (name, value, expires, path, domain, secure) {
        var d = new Date();
        if (typeof(expires) == 'object' && expires.toUTCString) {
            expires = expires.toUTCString();
        } else if (parseInt(expires, 10)) {
            d.setTime(d.getTime() + (parseInt(expires, 10) * 1000));
            expires = d.toUTCString();
        } else {
            expires = '';
        }
        document.cookie = name + "=" + encodeURIComponent(value) +
            ((expires) ? "; expires=" + expires : "") +
            ((path) ? "; path=" + path : ";path=/") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
    },
    /**
     * 删除cookie
     */
    remove: function (name, path) {
        this.set(name, '', -1000, path);
    }
};

function setMenu(menus) {

    for(var i = 0 ; i < menus.length; i++){
        var menu = menus[i];
        var subMenu = menu.submenu;


        if(subMenu && subMenu.length > 0){
            menuhtml +=
                '<li class="">'+
                '<a href="#" class="dropdown-toggle">'+
                '<i class="menu-icon fa fa-pencil-square-o"></i>'+
                '<span class="menu-text"> '+menu.name+' </span>'+
                '<b class="arrow fa fa-angle-down"></b>'+
                '</a>'+
                '<b class="arrow"></b>'+
                '<ul class="submenu">';
            setMenu(subMenu);
            menuhtml +=
                '</ul>'+
                '<b class="arrow"></b>'+
                '</li>'
        }else {
            menuhtml += '<li class="">'+
                '<a data-url="page/'+menu.path+'" href="index.html#page/'+menu.path+'">'+
                '<i class="menu-icon fa fa-list-alt"></i>'+
                '<span class="menu-text"> '+menu.name+' </span>'+
                '</a>'+
                '<b class="arrow"></b>'+
                '</li>';
        }
    }

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
            console.log(e);
        }
    });
}
