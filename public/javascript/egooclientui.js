/**
 * Created by mac on 15/10/10.
 */
+(function () {
    initmsgsHeight();
    $('.egoo-chat-head-onchat').find('.chatclose').each(function () {
        $(this).click(function () {
            alert('111111');
        });
    });
})();

var egoochatextrafile = document.getElementById('egoo-chat-extra-file');
egoochatextrafile.onclick = function (event) {
    document.getElementById('fileIpt').click();
};
window.onresize = function(){
    initmsgsHeight();
}
function initmsgsHeight(){
    $('#msgs').height($(document).height()-205);
    $('.egoo-group-list').height($('.egoo-group').height()-46);
    $('.egoo-unreads-list').height($('.egoo-unreads').height()-46);
}

/*
*user list
* */
function initUserList(connection) {
    var _userid = connection.userid,
        _username = connection.username,
        _socketid = connection.tempsocketid,
        li,divicons,divname,
        ul = document.getElementById('egoo-group-list-ul');

    divicons = document.createElement('div');
    divname = document.createElement('div');
    li = document.createElement('li');


    li.setAttribute('id','group_'+_userid);
    divicons.setAttribute('class','user-icon');
    divname.setAttribute('class','user-info');
    divname.setAttribute('egoo-usersocket',_socketid);
    if(_username.length > 10){
        _username = _username.substring(0,7) + '...';
    }
    divname.innerText = _username;

    li.appendChild(divicons);
    li.appendChild(divname);
    li.onclick = function (event) {
        var _userid = $(event.target).parent().attr('id').replace('group_',''),
            userinfo = $(event.target).parent().find('.user-info').html(),
            usersocket = event.target.nextElementSibling.getAttribute('egoo-usersocket');

        var ischatExist = false;
        $('.egoo-chat-head-onchat').find('li').each(function () {
            if( $(this).attr('id') === 'chathead_'+_userid ){
                ischatExist = true;
                //chatOpen ('open' , this);
            }
        });
        if(ischatExist){
            toggleChatOpen(document.getElementById('chathead_'+_userid));
            return;
        }else{
            //var urlMatch = /url\((.*)\)/
            //var matchresult = urlMatch.exec(usericonurl)[1];
            appendChatHead(usersocket,userinfo,_userid)
        }
        appendMsgUl(_userid);
    }

    ul.appendChild(li);
}
/*
* srcollLock
* */
function srcollLock(srcolldom){
    srcolldom.scrollTop = srcolldom.scrollHeight;
}
//chat open
function chatOpen (openorclose , dom){
    var funcOpenClose = {
        'open' : function (_dom) {
            $(_dom).removeClass('chatclose');
            $(_dom).addClass('chatopen');
        },
        'close': function (_dom) {
            $(_dom).removeClass('chatopen');
            $(_dom).addClass('chatclose');
        }
    };

    switch (openorclose){
        case 'open' : funcOpenClose.open(dom);break;
        case 'close' : funcOpenClose.close(dom);break;
        default :break;
    }

}
//append to msgsUL
function appendMsgUl(_userid){
    var msgsUlPeer,
        msgs = document.getElementById('msgs');;
    if(document.getElementById('msgsUl_'+_userid)){
        msgsUlPeer = document.getElementById('msgsUl_'+_userid);
        //$(msgsUlPeer).css('display','block');
    }else{
        msgsUlPeer = document.createElement("ul");
        msgsUlPeer.setAttribute('id','msgsUl_'+_userid);
        msgs.appendChild(msgsUlPeer);
    }

    return msgsUlPeer;
}
//append to chat head
function appendChatHead(socketId,userinfo,_userid){
    if(document.getElementById('chathead_'+_userid)){
        return;
    }
    var appendli =  '<li class="chatopen" id="chathead_'+_userid+'" egoo-socketid="'+socketId+'"><div class="user-icon"></div><p>'+userinfo+'</p><div></div><\/li>';
    //append to chat head
    $('.egoo-chat-head-onchat').append(appendli);
    toggleChatOpen(document.getElementById('chathead_'+_userid));
    $('.egoo-chat-head-onchat li:last-child').click(function () {
        if($(this).hasClass('chatopen')){
            return;
        }else{
            var __userid = $(this).attr('id');
            toggleChatOpen(document.getElementById(__userid));
        }
    });
}
//prepend to unread
function prependUnreads(socketId,userinfo,_userid){

    if(document.getElementById('unread_'+_userid)){
        var unreaddom = document.getElementById('unread_'+_userid);

        $(unreaddom).find('.unreadtip').html(Number($(unreaddom).find('.unreadtip').html())+1);
        return;
    }else{
        var prependli = '<li id="unread_'+_userid+'"><div class="user-icon"><\/div><div class="user-info" egoo-usersocket="'+socketId+'">'+userinfo+'<\/div><div class="unreadtip">'+1+'<\/div><\/div>';
        $('#egoo-unreads-list-ul').prepend(prependli);
        $('#egoo-unreads-list-ul li:first-child').click(function () {
            var __userid = $(this).attr('id').replace('unread_',''),
                unreadUserInfo = $(this).find('.user-info').html(),
                unreadsocketid = $(this).find('.user-info').attr('egoo-usersocket'),
                unreadUserIconUrl = $(this).find('.user-icon').css('background');

            var urlMatch = /url\((.*)\)/
            var matchresult = urlMatch.exec(unreadUserIconUrl)[1];

            appendChatHead(unreadsocketid,unreadUserInfo,__userid);
            appendMsgUl(__userid);
            toggleChatOpen(document.getElementById('chathead_'+__userid));
            $(this).remove();
        });
    }
}

//toggle the chatopen
function toggleChatOpen(newDom){
    if(newDom){
        //open chat
        //remove old chatopen dom
        var oldChatOpenDom =  $('.chatopen');
        oldChatOpenDom.removeClass('chatopen');
        oldChatOpenDom.addClass('chatclose');
        var oldChatUserId = oldChatOpenDom.attr('id').replace('chathead_','');
        $('#msgsUl_'+oldChatUserId).css('display','none');

        // add new chatopen Dom

        $(newDom).removeClass('chatclose');
        $(newDom).addClass('chatopen');
        var newChatUserId = $(newDom).attr('id').replace('chathead_','');
        $('#msgsUl_'+newChatUserId).css('display','block');
    }
}

//send message append to msgUl
function sendMessageAppendToMsgUl(toUserId,msg,isleft){
    var li = document.createElement("li"),
        divicon = document.createElement("div"),
        divmessage = document.createElement("div"),
        msgsUlPeer = appendMsgUl(toUserId);

    divmessage.setAttribute('class','chatmessage');
    divmessage.innerHTML = msg;
    divicon.setAttribute('class','user-icon');

    if(isleft){
        li.setAttribute('class','li-left');
        li.appendChild(divicon);
        li.appendChild(divmessage);
    }else{
        li.setAttribute('class','li-right');
        li.appendChild(divmessage);
        li.appendChild(divicon);
    }

    //append to chat msgUl
    msgsUlPeer.appendChild(li);
    srcollLock(msgsUlPeer);
}