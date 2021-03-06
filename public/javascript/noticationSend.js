;(function(){
	initStyle();
	//建立socket连接

	//获取数据
	//获取数据
	var userid = document.URL.split('?')[1].split('=')[1];
	if(userid && userid.length !== 0){
		window.thisuserid = userid;
		//群组
		getgroup(userid);
		//短信模版
		initmessage();
		//历史纪录
		inithistory(userid);
	}else{
		return false;
	}


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
	//退格电话号码
	$('#deletenumber').click(function () {
		$('input[name="addmobile"]').val($('input[name="addmobile"]').val().substr(0,$('input[name="addmobile"]').val().length-1));
	});
	//绿色按钮点击事件
	$('.greenbutton').mousedown(function () {
		$(this).css('font-size','12px');
	});
	$('.greenbutton').mouseup(function () {
		$(this).css('font-size','13px');
	});
})();
window.onresize = function(){
	initStyle();
};
var noticationsocket = buildSocket();
noticationsocket.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('?')[0]);
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
	//初始化延迟时间
	var todaytime = new Date(),
		thisyear = todaytime.getFullYear(),
		thismonth = todaytime.getMonth(),
		thisday = todaytime.getDay(),
		thishour = todaytime.getHours(),
		thisminite = todaytime.getMinutes();
	$('input[name="year"]').val(thisyear);
	$('input[name="month"]').val(thismonth);
	$('input[name="day"]').val(thisday);
	$('input[name="hour"]').val(thishour);
	$('input[name="minite"]').val(thisminite);
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
		var append = '<li class="groupname" openguys="groupguy_'+type+'_group'+i+'"><div class="icon-triangle"><\/div><p userid="'+id+'">'+name+'<\/p><div class="icon-checkbox"><\/div><\/li>';
		for(j=0;j<people.length;j++){
			var guyname = people[j].name,
				guymobile = people[j].mobile?people[j].mobile:'',
				guyid = people[j].id;
			append += '<li class="groupguy groupguy_'+type+'_group'+i+'"><p userid="'+guyid+'" mobile="'+guymobile+'">'+guyname+'<\/p> <div class="icon-checkbox"><\/div> <\/li>';
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
//初始化历史记录
function inithistory(userid){
	$.ajax({
		url:'/getnotihistory',
		type:'post',
		data:{userid:userid},
		datatype:'json',
		success: function (data) {
			inithistoryhtml(data);
		}
	});
}
//初始化历史页面
function inithistoryhtml(hislist){
	if(hislist && hislist.length !==0 ){
		$('.history-list').html('');
		var i;
		for(i=0;i<hislist.length;i++){

			var _datetime = new Date(parseInt(hislist[i].datetime)).toLocaleString().replace(',',''),
				_title = (hislist[i].title.length > 10)?hislist[i].title.substring(0,7)+'...':hislist[i].title;

			var append = '<li id="uuid_'+hislist[i].noticationuuid+'"><img src="/images/msg.png" \/><span>'+_title+'<\/span><p>'+_datetime+'<\/p><div class="deletemsgtemplate"><\/div><\/li>';
			$('.history-list').append(append);
			//点击事件
			inithistoryevent($('#uuid_'+hislist[i].noticationuuid));
		}
	}else{
		return false;
	}
}
//初始化历史事件
function inithistoryevent(jquerydom){
	$(jquerydom).click(function () {
		var noticationuuid = $(this).attr('id').replace('uuid_','');

		$('.confirm-list').attr('noticationuuid',noticationuuid);

		if(noticationuuid && noticationuuid.length!==0){
			$.ajax({
				url:'/getnoticationbyuuid',
				type:'post',
				data:{uuid:noticationuuid},
				datatype:'json',
				success: function (data) {
					//console.log(data);
					var _title = data.title,
						_content = data.content,
						_confirms = data.confirms;

					$('input[name="title"]').val(_title);
					$('.center-bottom-content').val(_content);

					if(data.issms){
						//清除
						$('.confirm-list').html('');
						return false;
					}
					//反馈列表
					var confirmList = [];
					for(var keyname in _confirms){
						confirmList.push({
							id:keyname,
							name:_confirms[keyname].name,
							isread:_confirms[keyname].isread
						});
					}
					confirmAnimate(confirmList,100);
				}
			});
		}
	});
}
//发送编辑好的推送消息
function sendNotication(isdelay,issms){
	var _title = $('input[name="title"]').val();
	var _content = $('.center-bottom-content').val();

	//发送保护 内容
	if(!_title || _title.length === 0){
		$('input[name="title"]').addClass('invalidcontent');
		setTimeout(function () {
			$('input[name="title"]').removeClass('invalidcontent')
		},2000);

		return false;
	}
	if(!_content || _content.length === 0){
		$('.center-bottom-content').addClass('invalidcontent');
		setTimeout(function () {
			$('.center-bottom-content').removeClass('invalidcontent')
		},2000);

		return false;
	}

	//获取已选联系人
	//var _confirms = ['shanghaidiaodu'];
	var _confirms = [],
		_confirmsList = [],
		_mobiles = [];

	$('.msgdiv').each(function () {
		if($(this).hasClass('msguser')){
			var _userid = $(this).attr('id').replace('msg_',''),
				//<div class="cssx"><p style="display: none;"></p></div>
				_username = $(this).html().replace(/<div(.*)>/,''),
				_mobile = $(this).attr('mobile');

			_confirms.push(JSON.parse('{"'+_userid+'":"'+_username+'"}'));
			if($(this).attr('mobile').length>0){
				_mobiles.push(_mobile);
			}
			_confirmsList.push({
				id:_userid,
				name:_username
			});

		}else if($(this).hasClass('msgmobile')){
			var _mobile = $(this).attr('id').replace('msg_','');
			_mobiles.push(_mobile);
		}
	});
	//发送保护，人员
	if(_confirms.length === 0 && _mobiles.length === 0){
		$('.center-top-div').addClass('invalidcontent');
		setTimeout(function () {
			$('.center-top-div').removeClass('invalidcontent')
		},2000);

		return false;
	}

	var _data = {
		title:_title,
		content:_content,
		confirms:_confirms,
		mobiles:_mobiles
	};
	//发送者
	if(window.thisuserid){
		_data.noticationwriter = window.thisuserid;
	}else{
		return false;
	}
	//是否短信发送
	if(issms){
		_data.issms = issms;
	}
	//延迟发送
	if(isdelay){
		var sendtimestamp = [$('input[name="year"]').val(),$('input[name="month"]').val(),$('input[name="day"]').val(),$('input[name="hour"]').val(),$('input[name="minite"]').val(),0];
		_data.sendtime = sendtimestamp;
	}
	//动画
	loadingAimate();
	//加入反馈确认表
	if(!issms){
		confirmAnimate(_confirmsList);
	}
	//发送请求
	$.ajax({
		url:'/notication',
		type:'post',
		dataType:'json',
		data:_data,
		success: function (data) {
			//返回uuid
			console.log("返回的推送uuid："+data.uuid);
			//赋值于当前反馈列
			$('.confirm-list').attr('noticationuuid',data.uuid);
			//刷新历史纪录
			inithistory(window.thisuserid);
			//刷数据库（备用）
			//getconfirmByuuid(data.uuid);
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
function confirmAnimate(confirmList,animatetime){
	//清除
	$('.confirm-list').html('');
	//添加到confirm list
	for(var i= 0 ; i<confirmList.length; i++){
		var isreadimg = (confirmList[i].isread)?'/images/confirm.png':'/images/unconfirm.png',
			appendLi = '<li id="confirm_'+confirmList[i].id+'"> <p class="confirm-name">'+confirmList[i].name+'<\/p> <img class="confirm-icon" src="'+isreadimg+'"\/><\/li>';
		$('.confirm-list').append(appendLi);
	}

	var _confirmlist = $('.confirm-list').find('li'),
		_index = 0,
		_animatetime = animatetime || 500;

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
		},_animatetime);
}

/*
* 确认已经反馈的用户
* */
function getconfirmByuuid(uuid,allconfirmed){
	setTimeout(function () {
		var _allconfirmed = allconfirmed || 1;
		if( _allconfirmed === 10 ){
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
					//console.log(data);
					for(var i=0;i<data.length;i++){
						if($('#confirm_'+data[i]).hasClass('confirmed')){
							continue;
						}else{
							$('#confirm_'+data[i]).find('img').attr('src','/images/confirm.png');
							$('#confirm_'+data[i]).addClass('confirmed');
						}
					}
					_allconfirmed++;
					if( $('.confirm-list').find('li').length === $('.confirmed').length ){
						_allconfirmed = 10;
					}

					getconfirmByuuid(uuid,_allconfirmed);
				}
			});
		}
	},2000);
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
	dom.find('p').click(function () {
		var parentDom = $(this).parent().parent();
		if(parentDom.hasClass('msguser')){
			var _id = parentDom.attr('id').replace('msg_','');
			$('p[userid="'+_id+'"]').next('div').removeClass('checked');
			$('.groupname[openguys="groupguy_duanxin_group0"]').find('.icon-checkbox').removeClass('checked');
		}
		parentDom.remove();
	});
}