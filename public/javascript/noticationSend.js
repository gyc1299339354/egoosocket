;(function(){
	initStyle();
	//获取数据
	//获取群组数据
	var userid = document.URL.split('?')[1];
	getgroup(userid);
	initmessage();

	//事件初始化
	//群组选择
	$('.grouphead').click(function () {
		if($(this).hasClass('groupopen')){
			return false;
		}else{
			var prebody = $('.groupopen').attr('openlabel');
			$('.'+prebody).css('display','none');
			$('.groupopen').removeClass('groupopen');

			var thisbody = $(this).attr('openlabel');
			$('.'+thisbody).css('display','block');
			$(this).addClass('groupopen');
		}
	});
	//短信模版和历史纪录
	$('.msghistoryhead').click(function () {
		if($(this).hasClass('onselected')){
			return false;
		}else{
			var prebody = $('.onselected').attr('openlabel');
			$('.'+prebody).css('display','none');
			$('.onselected').removeClass('onselected');

			var thisbody = $(this).attr('openlabel');
			$('.'+thisbody).css('display','block');
			$(this).addClass('onselected');
		}
	});

})();
window.onresize = function(){
	initStyle();
};
//页面初始化
function initStyle(){
	//高宽初始化
	var windowHeight = $(window).height();
	var windowWidth = $(window).width();
	$('.layout-center').css('width',windowWidth-554);
	$('.duanxin-body').css('height', windowHeight*0.66-72);
	$('.xinxi-body').css('height', windowHeight*0.66-72);
	$('.msg-body').css('height', windowHeight*0.34-42);
	$('.history-body').css('height', windowHeight*0.34-22);
	$('.group-list').css('height', windowHeight*0.66-97);
	$('.msg-list').css('height', windowHeight*0.34-67);
	$('.center-bottom').css('height',windowHeight - 242);
	$('.center-top-div').css('width',$('.center-top').width()-44);
	$('.center-bottom-title').css('width',$('.center-top').width()-110);
	$('.center-bottom-content').css('width', $('.center-bottom').width()-80);
	$('.center-bottom-content').css('height', $('.center-bottom').height()-110);
	$('.confirm').css('height',windowHeight-201);
	$('.confirm-body').css('height',$('.confirm').height()-79);
}
//获取群组
function getgroup(userid){
	$.ajax({
		url:'/getgroup',
		type:'post',
		dataType:'json',
		data:{userid:userid},
		success:function (data){
			var sms = data.SMS,
				im = data.IM;
			initGroup(sms,'duanxin');
			initGroup(im,'xinxi');
			initgroupevent();
		}
	});
}
//初始化群组页面
var initGroup = function (arraygroup,type) {
	var i,j;

	for(i=0;i<arraygroup.length;i++){
		var name = arraygroup[i].name,
			id = arraygroup[i].id,
			people = arraygroup[i].people;
		var append = '<li class="groupname" openguys="groupguy_group'+i+'"><div class="icon-triangle"><\/div><p userid="'+id+'">'+name+'<\/p><div class="icon-checkbox"><\/div><\/li>';
		for(j=0;j<people.length;j++){
			var guyname = people[j].name,
				guymobile = people[j].mobile?people[j].mobile:'',
				guyid = people[j].id;
			append += '<li class="groupguy groupguy_group'+i+'"><p userid="'+guyid+'" mobile="'+guymobile+'">'+guyname+'<\/p> <div class="icon-checkbox"><\/div> <\/li>';
		}
		$('.'+type+'-body').find('.group-list').append(append);
	}
};
//初始化群组事件
function initgroupevent(){
	//三角形下拉
	$('.icon-triangle').click(function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
		}else{
			$(this).addClass('open');
		}
	});
	//checkbox
	$('.icon-checkbox').click(function () {
		if($(this).hasClass('checked')){
			if($(this).parent().hasClass('groupname')){
				$('.'+$(this).parent().attr('openguys')).find('.icon-checkbox').each(function () {
					var _thisid = $(this).prev('p').attr('userid');
					$('.center-top-div #msg_'+_thisid).remove();
					$(this).removeClass('checked');
				});
			}

			$('.center-top-div #msg_'+$(this).prev('p').attr('userid')).remove();
			$(this).removeClass('checked');
		}else{
			if($(this).parent().hasClass('groupname')){
				$('.'+$(this).parent().attr('openguys')).find('.icon-checkbox').each(function () {
					var _thisid = $(this).prev('p').attr('userid'),
						_thismobile = $(this).prev('p').attr('mobile'),
						_thisname = $(this).prev('p').html();

					appendToMsgDiv('msguser',_thismobile,_thisid,_thisname);
					//if($('#msg_'+_thisid).length===0){
					//	$('.center-top-div').append('<span class="msgdiv msguser" id="msg_'+_thisid+'">'+_thisname+'</span>');
					//}
					$(this).addClass('checked');
				});
			}
			var thisid = $(this).prev('p').attr('userid'),
				thismobile = $(this).prev('p').attr('mobile'),
				thisname = $(this).prev('p').html();
			if(!$(this).parent().hasClass('groupname')){
				appendToMsgDiv('msguser',thismobile,thisid,thisname);
				//$('.center-top-div').append('<span class="msgdiv msguser" id="msg_'+thisid+'">'+thisname+'</span>');
			}
			$(this).addClass('checked');
		}
	});
	//群组下拉
	$('.groupname .icon-triangle').click(function () {
		//jquery array
		var groupguys = $('.'+$(this).parent().attr('openguys'));
		var count = 0 ;
		var countTime = setInterval(function () {
			//show to grouplist
			$(groupguys[count]).toggle('10');
			count++;
			if(count === groupguys.length){
				clearInterval(countTime);
				resetAnimate();
			}
		},10);
	});
}

//初始化短信模版
function initmessage(){
	$.ajax({
		url:'/getmessage',
		type:'post',
		dataType:'json',
		success:function (data){
			var msgList = data.msgList;
			initmsghtml(msgList);
			initmsgevent();
		}
	});
}
//初始化短信模版页面
function initmsghtml(msgList){
	if(msgList){
		var i,
			append = '';
		for(i=0;i<msgList.length;i++){
			var msgcontent = msgList[i].content,
				msgid = msgList[i].id,
				msgtitle = msgList[i].title;
			append += '<li><p>'+msgtitle+'<\/p><span>'+msgcontent+'<\/span><div class="deletemsgtemplate" msgid="'+msgid+'"><\/div><\/li>'
		}
		$('.msg-list').append(append);
	}
}
//初始化短信事件
function initmsgevent(){
	$('.msg-list li p').click(function () {
		var thistitle = $(this).html(),
			thiscontent = $(this).parent().find('span').html();

		$('input[name="title"]').val(thistitle);
		$('.center-bottom-content').val(thiscontent);

	});
}
//发送编辑好的推送消息
function sendNotication(){
	var _title = $('input[name="title"]').val();
	var _content = $('.center-bottom-content').val();
	//获取checked
	//var _confirms = ['shanghaidiaodu'];
	var _confirms = [];
	var _confirmsList = [];
	$('.checked').each(function () {
		_confirms.push($(this).prev('p').attr('userid'));
		_confirmsList.push({
			id:$(this).prev('p').attr('userid'),
			name:$(this).prev('p').html()
		});
	});


	var _data = {
		title:_title,
		content:_content,
		confirms:_confirms
	};
	//动画
	loadingAimate();
	//加入反馈确认表
	confirmAnimate(_confirmsList);
	//发送请求
	$.ajax({
		url:'/notication',
		type:'post',
		dataType:'json',
		data:_data,
		success: function (data) {
			//返回uuid
			getconfirmByuuid(data.uuid);
		}
	});
}

//loading animate
function loadingAimate(){
	var count = 0 ;
	var timecount = setInterval(function () {
						var loadli = $('.loading-ul').find('li')[count%10];
						//if(count%10 === 0){
						//	$('.loading-ul').find('li').addClass('unloading-div');
						//}
						$(loadli).find('div').removeClass('unloading-div');
						count++;
						if(count === 11){
							clearInterval(timecount);
							resetAnimate();
						}
					},500);
}

//reset animate
function resetAnimate(){
	$('.loading-ul').find('li').find('div').addClass('unloading-div');
}

/*
* 反馈确认动画
* [{id:'',name:''}]
* */
function confirmAnimate(confirmList){
	//添加到confirm list
	for(var i= 0 ; i<confirmList.length; i++){
		var appendLi = '<li id="confirm_'+confirmList[i].id+'"> <p class="confirm-name">'+confirmList[i].name+'<\/p> <img class="confirm-icon" src="/images/unconfirm.png"\/><\/li>';
		$('.confirm-list').append(appendLi);
	}

	var _confirmlist = $('.confirm-list').find('li');
	var _index = 0;
	var animatecount =	setInterval(function () {
			$(_confirmlist[_index]).addClass('animated');
			$(_confirmlist[_index]).addClass('fadeInRightBig');
			$(_confirmlist[_index]).css('display','block');
			$(_confirmlist[_index])
				.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
					$(this).removeClass('animated');
					$(this).removeClass('fadeInRightBig');
				});
			_index++;
			if( _index === _confirmlist.length ){
				clearInterval(animatecount);
			}
		},500);
}

/*
* 确认已经反馈的用户
* */
function getconfirmByuuid(uuid,allconfirmed){
	setTimeout(function () {
		if(allconfirmed){
			return;
		}else{
			var _data = { 'uuid' : uuid };
			$.ajax({
				url: '/getconfirmedbyuuid',
				type: 'post',
				dataType: 'json',
				data: _data,
				success: function (data) {
					//返回已经确认的 userid
					//["",""]
					console.log(data);
					for(var i=0;i<data.length;i++){
						if($('#confirm_'+data[i]).hasClass('confirmed')){
							continue;
						}else{
							$('#confirm_'+data[i]).find('img').attr('src','/images/confirm.png');
							$('#confirm_'+data[i]).addClass('confirmed');
						}
					}

					if( $('.confirm-list').find('li').length === $('.confirmed').length ){
						allconfirmed = true;
					}
					getconfirmByuuid(uuid,allconfirmed);
				}
			});
		}
	},1000);
}

function appendToMsgDiv(type,mobile,id,name){
	var append = '',
		_id;
	if(type==='msguser'){
		var _mobile = (mobile)?mobile:'';
		_id = 'msg_'+id;
		append = '<span class="msgdiv '+type+'" id="'+_id+'" mobile="'+_mobile+'">'+name+'<div class="cssx"><p><\/p></div><\/span>';

	}else if(type==='msgmobile'){
		_id = 'msg_'+mobile;
		append = '<span class="msgdiv '+type+'" id="'+_id+'">'+mobile+'<div class="cssx"><p><\/p></div><\/span>';
	}

	if($('#'+_id).length===0){
		$('.center-top-div').append(append);
		initMsgDivEvent($('#'+_id));
	}else{
		return false;
	}
}

/*
* 添加电话至中上区div内
* */
function addmobile(){
	var mobileNumber = $('input[name="addmobile"]').val();
	var mobileReg = !!mobileNumber.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
	if(mobileReg !== false){
		appendToMsgDiv('msgmobile',mobileNumber);
		//$('.center-top-div').append('<span class="msgdiv msgmobile" id="msg_'+mobileNumber+'">'+mobileNumber+'<p class="cssx"><\/p><\/span>');
		//initMsgDivEvent($('#msg_'+mobileNumber));
	}
}

/**
 * 添加备选人的事件设定
 * @param dom
 * dom is jquery obj
 */
function initMsgDivEvent(dom){
	//备选人鼠标划过事件
	dom.hover(function () {
		$(this).css('color','white');
		$(this).find('p').css('display','inline-block');
	}, function () {
		$(this).css('color','rgb(145, 145, 145)');
		$(this).find('p').css('display','none');
	});
	//删除备选人事件

}