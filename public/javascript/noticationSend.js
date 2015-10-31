+(function(){
	initStyle();
	//事件初始化
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
			$(this).removeClass('checked');
		}else{
			$(this).addClass('checked');
		}
	});
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