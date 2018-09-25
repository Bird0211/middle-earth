/**
 * Created by bshn on 2017/8/8.
 */
$(function(){

    var token = manage.getToken();
    var name = manage.getUserName();

    if(token){
        manage.initMenu(token);
        manage.initUserName(name);
    }else {
        //window.location.href = "/manage/login.html";
    }



});