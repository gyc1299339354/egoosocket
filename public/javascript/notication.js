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
        //下标数目
        $('.restnotiction').html(window.notications.length-$(_dom).attr('data-next'));
        if(!_notication[_index+1]){
            $('.close').html('关闭');
        }else{
            $('.close').html('下一条');
        }
    }else{
        //关闭
        //alert('close');
        bound.jSReturnBack();
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
            if(data.length === 0){
                $('.restnotiction').css('display','none');
            }else{
                setNotications(data,nextOrClose);
            }

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
/*
 * 根据userid查询已读的消息推送
 * */
function getReadsByUserid(userid){

    var _userid = '';
    if(userid && typeof userid === 'string'){
        _userid = userid;
    }

    $.ajax({
        url:'/getbenoticationhistorybyuserid',
        type:'post',
        data:{userid:_userid},
        datatype:'json',
        success: function (data) {
            initHistory(data);
        }
    });
}

function initHistory(historyList){
    if(historyList && typeof historyList==='object' && historyList.length !== 0){
        $('.history-list ul').html('');
        for(var i=0;i<historyList.length;i++){
            var append = '<li noticationuuid="'+historyList[i].noticationuuid+'" ><p>'+historyList[i].title+'<\/p><\/li>';
            $('.history-list ul').append(append);
        }
        $('.history-list-ul li').click(function () {
            var uuid = $(this).attr('noticationuuid');

            if(uuid && uuid.length!==0){
                $.ajax({
                    url:'/getnoticationbyuuid',
                    type:'post',
                    data:{uuid:uuid},
                    datatype:'json',
                    success: function (data) {
                        //console.log(data);
                        var _title = data.title,
                            _content = data.content;
                        $('.title').html('<p>'+_title+'<\/p>');
                        $('.noticationbody').html(_content);
                    }
                });
            }
        });
    }else{
        return false;
    }
}

function initstyle() {
    //高宽初始化
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    $('.history-list').css('height',windowHeight-84);
}

/**
 * 初始化
 */
+(function () {
    //http://127.0.0.1:3000/noticationview#userid=
    var parseParams = document.URL.split('?'),
        _userid;

    if(parseParams.length <= 1 ){
        console.log('getUnreadsByUserid error: no userid');
        return false;
    }else{
        var pattern=new RegExp("userid=(.*)|&");
        _userid = pattern.exec(parseParams[1])[1];
        _userid = (_userid.indexOf('&') > 0)?_userid.split('&')[0]:_userid;
        getUnreadsByUserid(_userid);
        //
        getReadsByUserid(_userid);

        window._userid = _userid;
        //初始化页面
        initstyle();
        //点击事件

    }
})();

window.onresize = function(){
    initstyle();
}