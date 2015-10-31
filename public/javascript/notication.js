//var notications = [
//                    {
//                        noticationuuid:'uuid1',
//                        title:'this is the title1',
//                        noticationContent: 'this is a content1 !'
//                    },
//                    {
//                        noticationuuid:'uuid2',
//                        title:'this is the title2',
//                        noticationContent: 'this is a content2 !'
//                    }
//            ];

//nextOrClose
function nextOrClose(dom){
    var _notication = window.notications;
    var _dom = dom || document.getElementsByClassName('close');
    var _index = $(_dom).attr('data-next') || 0;
    if(_notication[_index]){
        //confirm notication
        confirmNotication(_notication[_index].noticationuuid);
        //show next notications
        showNotication(_notication[_index]);
        $(_dom).attr('data-next',parseInt(_index)+1);
    }else{
        //关闭
        alert('close');
    }
}

//show queue
function showNotication(notication){
    if( notication && typeof notication === 'object' ){
        //
        $('.title p').html(notication.title);
        $('.noticationbody p').html(notication.noticationContent);

    }else{
        //关闭
        alert('close');
    }
}

//设置页面数据队列
function setNotications(notications,callback){
    if(notications && typeof notications === 'object'){
        for(var i in notications){
            if(!notications[i].noticationuuid){
                return 'noticationuuid undefined';
            }else if(!notications[i].title){
                return 'title undefined';
            }else if(!notications[i].noticationContent){
                return 'noticationContent undefined';
            }else{
                window.notications = notications;
                callback();
                return true ;
            }
        }
    }else{
        return "need an object";
    }
}

/*
* ajax util
* */
function ajaxUtil(){

    $.ajax({
        url:'',
        type:'',
        data:'',
        datatype:'json',
        success: function (data) {
            
        }
    });

}


/*
* 根据userid查询未读的消息推送
* */
function getUnreadsByUserid(userid){
    var _userid = '';
    if(userid && typeof userid === 'string'){
        _userid = userid;
    }

    $.ajax({
        url:'/getnoticationbyuserid',
        type:'get',
        data:{userid:_userid},
        datatype:'json',
        success: function (data) {
            setNotications(data,nextOrClose);
        }
    });
}

/**
 * 更新mongo中的未读状态
 */
function confirmNotication(uuid) {
    var _userid;
    if(window._userid){
        _userid = window._userid;
    }
    var _data = {
        userid:_userid,
        uuid:uuid
    };

    $.ajax({
        url:'/noticationconfirm',
        type:'post',
        dataType:'json',
        data:_data,
        success: function (data) {
            console.log(data);
        }
    });
}


/**
 * 初始化
 */
+(function () {
    //http://127.0.0.1:3000/noticationview#userid=
    var parseParams = document.URL.split('#'),
        _userid;

    if(parseParams.length <= 1 ){
        console.log('getUnreadsByUserid error: no userid');
        return false;
    }else{
        var pattern=new RegExp("userid=(.*)|&");
        _userid = pattern.exec(parseParams[1])[1];
        _userid = (_userid.indexOf('&') > 0)?_userid.split('&')[0]:_userid;
        getUnreadsByUserid(_userid);
        window._userid = _userid;

    }
})();


