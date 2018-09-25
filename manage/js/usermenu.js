/**
 * Created by bshn on 2017/8/9.
 */
$(function(){



    $('#search').on("click",function () {
        var username = $('#username').val();
        if(username==''){
            toastr.info("请输入用户名！ ");
            return ;
        }
        var data = {};
        data.username = username;
        data.sys = sys;
        SendJsonData(baseurl+"/manage/getMenuByUserName",JSON.stringify(data),true,function (data) {
            if(data.statusCode == 0){
                var userMenus = data.userMenus;
                var allMenus = data.allMenus;
                if(!userMenus || userMenus.length <= 0){
                    $('#usermenulist').html('<div class="dd-empty"></div>');
                }else
                    $('#usermenulist').html(getMenus(userMenus));

                if(!allMenus || allMenus.length <= 0){
                    $('#menulist').html('<div class="dd-empty"></div>');
                }else
                    $('#menulist').html(getMenus(allMenus));
            }else {
                toastr.info(data.description);
                $('#menulist').empty();
                $('#usermenulist').empty();
            }
        });
    });

    $('#commit').on("click",function () {
        var menuIds = [];
        $('#usermenulist .dd-list li').each(function () {
            menuIds.push($(this).attr("data-id"))
            //eventIds += $(this).attr("data-id")+",";
        });

        var data = {};
        data.username = $('#username').val();
        data.menuId = menuIds;
        data.sys = sys;

        SendJsonData(baseurl+"/manage/editusermenu",JSON.stringify(data),true,function (data) {
            if(data.statusCode == 0){
                toastr.success("设置成功");
            }else {
                toastr.info(data.description);
            }

        })
    });


    function getMenus(menus) {
        var content = "";
        if(!menus || menus.length <= 0)
             return content;

        for(var i = 0; i < menus.length;i++){
            var info = menus[i];
            content +=
                '<li class="dd-item " data-id="'+info.id+'">'+
                '<div class="dd-handle">'+info.name+'</div>';

            if(info.submenu && info.submenu.length > 0){
            content += '<ol class="dd-list">';
                content +=  getMenus(info.submenu);
                content += '</ol>';
            }

            content += '</li>';
        }
        return content;
    }



});