/**
 * 建立socket连接
 * @param server
 * @param userid
 */
var buildSocket = function  (){

	/**
	 * 事件处理器
	 * @constructor
	 */
	function EventEmitter() {
		this.events = {};
	}
	//绑定事件函数
	EventEmitter.prototype.on = function(eventName, callback) {
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(callback);
	};
	//触发事件函数
	EventEmitter.prototype.emit = function(eventName, _) {
		var events = this.events[eventName],
			args = Array.prototype.slice.call(arguments, 1),
			i, m;

		if (!events) {
			return;
		}
		for (i = 0, m = events.length; i < m; i++) {
			events[i].apply(null, args);
		}
	};

		
	var notisocket = function () {

	};

	notisocket.prototype = new EventEmitter();

	notisocket.prototype.connect = function (server) {
		var socket = new WebSocket(server),
			room = 'notication',
			that = this;

		socket.onopen = function () {
			//连接上后发送id
			socket.send(JSON.stringify({
				"eventName": "__join",
				"data": {
					"room": room
				}
			}));
		};
		//触发 触发器 对应的注册的事件
		socket.onmessage = function(message) {
			var json = JSON.parse(message.data);
			if (json.eventName) {
				that.emit(json.eventName, json.data);
			}
		};

		//事件注册
		//连接上后将临时socketid存在对应的userid下
		this.on('_peers', function(data) {
			//获取返回的socketid
			that.me = data.you;
			//对应至数据库的tempnoticationsocketid
			$.ajax({
				url:'/maptotempnoticationsocketid',
				type:'post',
				data:{userid:window.thisuserid,tempnoticationsocketid:that.me},
				datatype:'json',
				success: function (data) {
					//console.log(data);
					if(data.result){
						console.log('socket id 存放成功 ！');
					}else{
						console.log('socket id 存放失败 ！');
					}
				}
			});
		});
		//确认反馈
		this.on('onconfirm', function (data) {
			//console.log("socket返回的："+data);
			var _uuid = data.uuid,
				_userid = data.userid;

			//判断当前的noticationuuid是否是xxxx
			if( _uuid === $('.confirm-list').attr('noticationuuid') ){
				$('#confirm_'+_userid).find('img').attr('src','/images/confirm.png');
			}else{
				return false;
			}
		});
	};
	return new notisocket();
};