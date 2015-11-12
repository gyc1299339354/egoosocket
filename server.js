var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	SkyRTC = require('skyrtc').listen(server),
	path = require("path"),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	multipart = require('connect-multiparty'),
	multipartMiddleware = multipart(),
	fs = require('fs'),
	egoomongodb = require("egoomongodb"),
	notication = require("notication");

var port = process.env.PORT || 3001;
server.listen(port);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: '12345',
	name:'egoologin',
	cookie:{
		maxAge: 6000
	},
	resave:false,
	saveUninitialized: true
}));


app.get('/', function(req, res) {
	var comingLogin = req.body;

	var cookies = req.headers.cookie;

	if(req.headers.cookie && req.sessionID === req.headers.cookie.sessionid){
		res.sendfile(__dirname + '/index.html');
	}else{
		res.redirect('/login');
	}

});

app.get('/test', function(req, res) {
	res.sendfile(__dirname + '/test.html');
});

app.get('/egoosocket', function(req, res) {
	res.sendfile(__dirname + '/views/egoosocket.html');
});

app.get('/oulinefile', function(req, res) {
	res.sendfile(__dirname + '/oulinefile.html');
});
app.get('/login', function(req, res) {
	res.sendfile(__dirname + '/login.html');
});
/*
* login
* */
app.post('/loginSession', function (req, res) {
	//console.log(req.body);
	var comingLogin = req.body;
	egoomongodb.validLogin(comingLogin,res);
	//if(user[comingLogin.userid] && user[comingLogin.userid] === comingLogin.password){
	//	req.session[comingLogin.userid] = comingLogin.password;
	//	res.setHeader("Set-Cookie", ['sessionid='+req.sessionID]);
	//	res.sendfile(__dirname + '/index.html.html');
	//}else{
	//	res.redirect('/login');
	//}
});
//登陆后映射socketid到userid
app.post('/mapTempSocketid', function (req, res) {
	egoomongodb.mapTempSocketid(req.body,res);
});
//根据socketid获取userid
app.post('/getUseridBySocketid', function (req,res) {
	egoomongodb.getUseridBySocketid(req.body,res);
});

/*
* 聊天纪录
* */
app.post('/msgrecord', function (req,res) {
	var incomingdata = req.body;
	if(incomingdata.confirm){
		setTimeout(egoomongodb.confirmSendMsg(incomingdata,res),
			1000);
	}else{
		egoomongodb.recordSendMsg(incomingdata,res);
	}
});


/*
*	file outline upload
*/
app.post('/outlinefile',multipartMiddleware, function (req,res) {

	var tmp_path = req.files.egoooutlinefile.path;
	var target_path = './public/egoooutlinefiles/' + req.files.egoooutlinefile.name;

	fs.rename(tmp_path,target_path, function (err) {
		if(err) throw  err;
		res.send('File uploaded to: ' + target_path + ' - ' + req.files.egoooutlinefile.size + ' bytes');
		//fs.unlink(tmp_path);
	});

});

SkyRTC.rtc.on('new_connect', function(socket) {
	console.log('创建新连接');
});

SkyRTC.rtc.on('remove_peer', function(socketId) {
	//egoomongodb.clearTempSocketid(socketId);
});

SkyRTC.rtc.on('new_peer', function(socket, room) {
	console.log("新用户" + socket.id + "加入房间" + room);
});

SkyRTC.rtc.on('socket_message', function(socket, msg) {
	console.log("接收到来自" + socket.id + "的新消息：" + msg);
});

SkyRTC.rtc.on('ice_candidate', function(socket, ice_candidate) {
	console.log("接收到来自" + socket.id + "的ICE Candidate");
});

SkyRTC.rtc.on('offer', function(socket, offer) {
	console.log("接收到来自" + socket.id + "的Offer");
});

SkyRTC.rtc.on('answer', function(socket, answer) {
	console.log("接收到来自" + socket.id + "的Answer");
});

SkyRTC.rtc.on('error', function(error) {
	console.log("发生错误：" + error.message);
});

//消息推送
app.post('/notication', function (req, res) {
	notication.insertAndpost(req.body,res);
});
//发送短信
//app.get('/sendsms', function (req, res) {
//
//});
//消息发送制定页
app.get('/noticationsend', function (req,res) {
	res.sendfile(__dirname + '/views/noticationSend.html');
});
//消息推送主页面
app.get('/noticationview', function (req,res) {
	res.sendfile(__dirname + '/views/notication.html');
});
//消息推送查询userid接口
app.get('/getnoticationbyuserid', function (req, res) {
	//var userid = req.query.userid;
	notication.getNoticationByUserid(req.query.userid,res);
});
//确认被推送的消息:一个一个来
app.post('/noticationconfirm', function (req,res) {
	notication.confirmNotication(req.body,res,SkyRTC.rtc);
});
//已确认消息的用户
app.post('/getconfirmedbyuuid', function (req, res) {
	notication.getconfirmed(req.body.uuid,res);
});
//获取群组
app.post('/getgroup', function (req, res) {
	var userid = req.body.userid;
	notication.getgroup(userid,res);
});
//获取短信模版
app.post('/getmessage', function (req, res) {
	notication.getmessage(res);
});
//获取用户的推送纪录
app.post('/getnotihistory', function (req, res) {
	notication.getnotihistorybyuserid(req.body.userid,res);
});
//获取用户被推送的消息纪录
app.post('/getbenoticationhistorybyuserid',function(req,res){
	notication.getbenoticationhistorybyuserid(req.body.userid,res);
});
//获取推送详情
app.post('/getnoticationbyuuid', function (req, res) {
	notication.getnoticationbyuuid(req.body.uuid,res);
});
//对应至数据库的tempnoticationsocketid
app.post('/maptotempnoticationsocketid', function (req, res) {
	notication.maptotempnoticationsocketid(req.body,res);
});