/**
 * Created by mac on 15/10/9.
 */
var sendBtn = document.getElementById("sendBtn");
var msgsUl = document.getElementById("msgsUl");
var sendFileBtn = document.getElementById("sendFileBtn");
var files = document.getElementById("files");
var userid = $('#usercenter').attr('userId');
var rtc = SkyRTC();

/**********************************************************/
sendBtn.onclick = function(event){
    var msgIpt = document.getElementById("msgIpt"),
        msg = msgIpt.value,
        toSocketId = $('.chatopen').attr('egoo-socketid'),
        toUserId = $('.chatopen').attr('id').replace('chathead_','');
    //广播消息
    //rtc.broadcast(msg);
    //发送消息
    if(!toUserId || toUserId.length === 0){
        return;
    }
    //超过60截取
    if(msg.length > 50){
        var countBr = Math.floor(msg.length / 50 );
        var arr = msg.split('');
        for(var i = 1; i<=countBr; i++ ){
            arr[50*i] += '<br\/>';
        }
        msg = arr.join('');
    }
    rtc.sendMessage(msg,toSocketId);
    msgIpt.value = "";
    //send message append to msgUl
    sendMessageAppendToMsgUl(toUserId,msg);
};

sendFileBtn.onclick = function(event){
    var socketId = $('.chatopen').attr('egoo-socketid');
    if(!socketId){
        return;
    }else{
        rtc.sendFile("fileIpt",socketId);
    }
};
/**********************************************************/


//对方同意接收文件
rtc.on("send_file_accepted", function(sendId, socketId, file){
    var p = document.getElementById("filesend_" + sendId);
    p.innerText = "对方接收" + file.name + "文件，等待发送";

});
//对方拒绝接收文件
rtc.on("send_file_refused", function(sendId, socketId, file){
    var p = document.getElementById("filesend_" + sendId);
    p.innerText = "对方拒绝接收" + file.name + "文件";
});
//请求发送文件
rtc.on('send_file', function(sendId, socketId, file){
    $.ajax({
        url:'/getUseridBySocketid',
        type:'post',
        dataType:'json',
        data:{
            'tempsocketid':socketId
        },
        success: function (data) {
            callback(data);
        }
    });
    function callback(_data){
        var fileMsg = '文件名称：'+file.name+'( '+file.size+' KB )<br\/><div class="file-progress"><div><\/div><\/div><p id="filesend_'+sendId+'"><\/p>';
        sendMessageAppendToMsgUl(_data.userid,fileMsg);
    }

});
//文件发送成功
rtc.on('sended_file', function(sendId, socketId, file){
    var p = document.getElementById("filesend_" + sendId);
    $(p).parent().find('.file-progress').remove();
    p.parentNode.removeChild(p);
});
//发送文件碎片
rtc.on('send_file_chunk', function(sendId, socketId, percent, file){
    var p = document.getElementById("filesend_" + sendId);
    $(p).parent().find('.file-progress div').css('width',percent+'%');
    p.innerText = file.name + "文件正在发送: " + Math.ceil(percent) + "%";
});
//接受文件碎片
rtc.on('receive_file_chunk', function(sendId, socketId, fileName, percent){
    var p = document.getElementById("filereceive_" + sendId);
    $(p).parent().find('.file-progress div').css('width',percent+'%');
    p.innerText = "正在接收" + fileName + "文件：" +  Math.ceil(percent) + "%";
});
//接收到文件
rtc.on('receive_file', function(sendId, socketId, name){
    var p = document.getElementById("filereceive_" + sendId);
    $(p).parent().find('.file-progress').remove();
    p.parentNode.removeChild(p);
});
//发送文件时出现错误
rtc.on('send_file_error', function(error){
    console.log(error);
});
//接收文件时出现错误
rtc.on('receive_file_error', function(error){
    console.log(error);
});
//接受到文件发送请求
rtc.on('receive_file_ask', function(sendId, socketId, fileName, fileSize){

    $.ajax({
        url:'/getUseridBySocketid',
        type:'post',
        dataType:'json',
        data:{
            'tempsocketid':socketId
        },
        success: function (data) {
            callback(data);
        }
    });

    function callback(_data){
        var p,
            fileMsg;
        //is chat head exist
        if(!document.getElementById('chathead_'+_data.userid)){
            //prepend to unreads
            prependUnreads(socketId, function () {
                var userinfo;
                if(_data.username.length > 10){
                    userinfo = _data.username.substring(0,7) + '...';
                }else{
                    userinfo = _data.username;
                }
                return userinfo;
            }(),_data.userid);
        }

        fileMsg = '文件名称：'+fileName+'( '+fileSize+' KB )<br\/><div class="file-progress"><div><\/div><\/div><p id="filereceive_'+sendId+'"><\/p>';

        sendMessageAppendToMsgUl(_data.userid,fileMsg,true);
        if(!document.getElementById('chathead_'+_data.userid) || $('#chathead_'+_data.userid).hasClass('chatclose')){
            $('#msgsUl_'+_data.userid).css('display','none');
        }

        if (window.confirm(_data.name + "用户想要给你传送" + fileName + "文件，大小" + fileSize + "KB,是否接受？")) {
            rtc.sendFileAccept(sendId);
            (document.getElementById('chathead_'+_data.userid)?toggleChatOpen(document.getElementById('chathead_'+_data.userid)): function () {
                appendChatHead(socketId, function () {
                    var userinfo;
                    if(_data.name.length > 10){
                        userinfo = _data.name.substring(0,7) + '...';
                    }else{
                        userinfo = _data.name;
                    }
                    return userinfo;
                }(),_data.userid);
            }());
            $('#unread_'+_data.userid).remove();
        } else {
            rtc.sendFileRefuse(sendId);
        }
    }
});
//成功创建WebSocket连接
rtc.on("connected", function(socket) {
    console.log('WebSocket is connected');

    //同步映射到数据库
    $.ajax({
        url:'/mapTempSocketid',
        type:'post',
        datatype:'json',
        data:{
            'userid':userid,
            'tempsocketid':rtc.me
        },
        success: function (data) {
            console.log(data);
        }
    });
    //console.log(rtc.me);
    rtc.emit('ready');
});

//删除其他用户
rtc.on('remove_peer', function(socketId) {
    $.ajax({
        url:'/getUseridBySocketid',
        type:'post',
        dataType:'json',
        data:{
            'tempsocketid':socketId
        },
        success: function (data) {
            callback(data.userid);
        }
    });
    function callback(_userid){
        $('#group_'+_userid).remove();
        $('#chathead_'+_userid).remove();
        $('#msgsUl_'+_userid).remove();
        $('#unread_'+_userid).remove();
    }
});
//接收到文字信息
rtc.on('data_channel_message', function(channel, socketId, message){
    $.ajax({
        url:'/getUseridBySocketid',
        type:'post',
        dataType:'json',
        data:{
            'tempsocketid':socketId
        },
        success: function (data) {
            callback(data);
        }
    });
    function callback(_data){
        var li = document.createElement("li"),
            divicon = document.createElement("div"),
            divmessage = document.createElement("div"),
            msgsUlPeer;
        //is chat head exist
        if(!document.getElementById('chathead_'+_data.userid)){
            //prepend to unreads
            prependUnreads(socketId, function () {
                var userinfo;
                if(_data.username.length > 10){
                    userinfo = _data.username.substring(0,7) + '...';
                }else{
                    userinfo = _data.username;
                }
                return userinfo;
            }(),_data.userid);
        }

        //append to msgul
        msgsUlPeer = appendMsgUl(_data.userid);
        if(!document.getElementById('chathead_'+_data.userid) || $('#chathead_'+_data.userid).hasClass('chatclose')){
            $(msgsUlPeer).css('display','none');
        }

        li.setAttribute('class','li-left')

        divmessage.setAttribute('class','chatmessage');
        divmessage.innerHTML = message;
        divicon.setAttribute('class','user-icon');

        li.appendChild(divicon);
        li.appendChild(divmessage);

        msgsUlPeer.appendChild(li);
        srcollLock(msgsUlPeer);
    }

});
//连接WebSocket服务器
rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], window.location.hash.slice(1),userid);
