let express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
let router = express.Router();
let app = express();

let server = require('http').createServer(app);
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended:  false }));
app.use(bodyParser.json());

let list_join = [];
let count = 0;

let enable_camera = [];
let count_camera = 0;


const io = require("socket.io")(server, {
    cors: {
        //allowedHeaders: ["my-custom-header"],
        //credentials: true,
        //origin: "http://localhost:8100",
        //methods: ["GET", "POST"]   
    }
});

app.get('/', (req, res) => {
    res.status(200).send('Hello Yeah!!');
    //res.redirect(`/${uuidv4()}`);
});

io.on('connection', (socket) => {
    // console.log('==== ', socket);
    // socket.on('broadcaster', () => {
    //     broadcaster = socket.id;
    //     console.log("broadcaster ", broadcaster);
    //     io.emit("broadcaster");
    // })
    socket.on('disconnect', function () {
        io.emit('users-changed', { user: socket.username, event: 'left' });
        console.log('Disconnected: ', socket.username);
        if ((count == 0) || (count_camera == 0)) { }
        else{
            for (var i = 0; i < list_join.length; i++) {
                if (list_join[i] === socket.username) {
                    list_join.splice(i, 1);
                    enable_camera.splice(i, 1);
                    i--;
                }
            }
            console.log(list_join);
            count = count - 1;
            count_camera = count_camera - 1;
        }
    });
    socket.on('set-name', (name) => {
        socket.username = name;
        list_join[count] = socket.username;
        count = count + 1;
        io.emit('users-changed', { user: name, event: 'joined' });
        //console.log('Connected: ', list_join);
    });
    socket.on('set-camera', (name, enabled) => {
        for (var i = 0; i < list_join.length; i++) {
            if (list_join[i] == name) {
                enable_camera[i] = enabled;
                count_camera = count_camera + 1;

            }
        }
        console.log('set-camera: ', enable_camera);
    });
    socket.on('request-camera', () => {
        io.emit('request-camera', { user: enable_camera });
        console.log('request-camera: ', enable_camera);
    });
    // socket.on('request-camera', (name) => {
    //     console.log((name));
    //     for( var i = 0; i < list_join.length; i++){                          
    //         if (list_join[i] == name) { 
    //             io.emit('request-camera', {user: enable_camera[i]});  
    //             console.log('request-camera: ',enable_camera[i]); 
    //             break;       
    //         }
    //     }     
    //  });
    socket.on('list-client', () => {
        io.emit('list-client', { user: list_join });
        console.log('list-client: ', list_join);
    });
    socket.on('send-message', (message) => {
        io.emit('message', { msg: message.text, user: socket.username, createdAt: new Date() });
        //io.emit('user-connected', socket.username);
        console.log(socket.username);
    });
});

router.post('/login', (req, res) => {
    const  username  =  req.body.username;
    const  password  =  req.body.password;
    console.log("login req: ",username, password);
    let resData = {};
    resData['response_code'] = 1;
    resData['username'] = username;
    resData['password'] = password;
    resData['message'] = 'Login successfully.';
    res.status(200).json(resData);
})

app.use(router);

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log('listening in http://localhost:' + port);
});