const express = require('express');
const app = express();
const path = require('path');
let users_json = require(path.join(__dirname, './users.json'));
const fs = require('fs');
const sessions = require('express-session');

app.use(express.json());
app.use(express.urlencoded());

let oneDay = 1000*60*60*24*30;

app.use(sessions({
    secret: "niggers_is_my_fri3nd$$$",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true
}));

app.get('/', function (req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'home.html'), 'utf8');
    myReadStream.pipe(res);
})

app.get('/register', function (req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'register.html'), 'utf8');
    myReadStream.pipe(res);
})

app.post('/register', function (req, res){
    let user_name = req.body.login;
    let user_password = req.body.password;

    console.log("login = ", user_name);
    console.log("password = ", user_password);

    let is_login = false;

    for (var key in users_json){
        if (key == user_name){
            is_login = true;
        }
    }

    if (is_login == true){
        //res.send(`Такой пользователь уже есть, попробуйте другое имя`);
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Такой пользователь уже есть, попробуйте другое имя</p>
                <button><a href="/register">Попробовать снова</a></button>
                <button><a href="/">Вернуться на главную</a></button>
            </body>
            </html>
        `);
    }else{
        //res.send('Регистрация прошла успешно');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Регистрация прошла успешно</p>
                <button><a href="/">Вернуться на главную</a></button>
            </body>
            </html>
        `);
        users_json[user_name] = {
            password: user_password
        }

        req.session.userid = user_name;

        write_json();
    }
})


app.get('/write', function (req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'write_msg.html'), 'utf8');
    myReadStream.pipe(res);
})

app.post('/write', function (req, res){
    if (req){

        console.log("users_json = ", users_json);

        let user = req.body.user_name;
        let msg = `${req.body.text_area}(анонимно)`;

        console.log("user = ", user, "  ", "msg = ", msg);

        let is_found = false;
        let counter_of_msg = 0;

        new Promise(function (resolve, reject){
            for (var key in users_json){
                if (user == key){
                    console.log(key, "!=", user);
                    is_found = true;

                    if (users_json[key] == {}){
                        users_json[key].msg1 = `${msg}`;
                    }else{
                        for (var key2 in users_json[key]){
                            counter_of_msg++;
                        }

                        let c_msg = `msg${counter_of_msg}`;

                        users_json[key][c_msg] = msg;
                    }
                }
            }

            if (is_found==false){
                reject();
            }

            resolve();
        }).then(async ()=>{
            await write_json();
            await console.log(users_json);
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Письмо отправлено успешно</p>
                <button><a href="/">Вернуться на главную</a></button>
            </body>
            </html>
        `);
        }).catch((err)=>{
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Такого пользователя нет</p>
                <button><a href="/">Вернуться на главную</a></button>
            </body>
            </html>
            `);
            console.log(err);
        })
    }
})


app.get('/login', function (req, res){
    if (req.session.userid){
        res.redirect('/home');
    }else{
        res.writeHead(200, {'Content-Type': 'text/html'});
        var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'login.html'), 'utf8');
        myReadStream.pipe(res);
    }

})

app.post('/login', function (req, res) {
    let user_name = req.body.login;
    let user_password = req.body.password;

    let is_in_users = false;
    for (let key in users_json){
        if (key==user_name && (users_json[key].password == user_password)){
            is_in_users = true;
        }
    }

    if (is_in_users == true){
        req.session.userid = user_name;
        res.redirect('/home');
    }else{
        res.redirect('/');
    }
})

app.get('/home', function (req, res){

    if (req.session.userid){
        res.writeHead(200, {'Content-Type': 'text/html'});
        var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'user_home.html'), 'utf8');
        myReadStream.pipe(res);
    }else{
        res.redirect('/');
    }


})

app.post('/home', function (req, res){

    if (req.session.userid){
        if (req.body.action == "get_msgs"){
            let arr = [];
            let user_name = req.session.userid;

            for (let key in users_json){
                if (key==user_name){
                    for (let key2 in users_json[key]){
                        if (key2!="password"){
                            arr.push(users_json[key][key2]);
                        }

                    }
                }
            }

            console.log(arr);

            res.send({arr: arr});
        }

        if (req.body.action == "clean"){

            let user_name = req.session.userid;

            for (let key in users_json){
                if (key == user_name){
                    console.log(user_name);
                    let user_password = users_json[key].password;
                    console.log("user_password", user_password);
                    users_json[key] = {"password": user_password};


                }
            }

            res.send({});

            write_json();
        }
    }else{
        res.redirect('/');
    }
})

app.get('/user_write', function (req, res){

    if (req.session.userid){
        res.writeHead(200, {'Content-Type': 'text/html'});
        var myReadStream = fs.createReadStream(path.join(__dirname, './htmls', 'user_write_msg.html'), 'utf8');
        myReadStream.pipe(res);
    }else{
        res.redirect('/');
    }


})


app.post('/user_write', function (req, res){
    if (req){

        console.log("users_json = ", users_json);

        let user = req.body.to_user_name;
        let msg = `${req.body.text_area}(от пользователя '${req.session.userid}')`;

        console.log("user = ", user, "  ", "msg = ", msg);

        let is_found = false;
        let counter_of_msg = 0;

        new Promise(function (resolve, reject){
            for (var key in users_json){
                if (user == key){
                    console.log(key, "!=", user);
                    is_found = true;

                    if (users_json[key] == {}){
                        users_json[key].msg1 = `${msg}`;
                    }else{
                        for (var key2 in users_json[key]){
                            counter_of_msg++;
                        }

                        let c_msg = `msg${counter_of_msg}`;

                        users_json[key][c_msg] = msg;
                    }
                }
            }

            if (is_found==false){
                reject();
            }

            resolve();
        }).then(async ()=>{
            await write_json();
            await console.log(users_json);
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Письмо отправлено успешно</p>
                <button><a href="/home">Вернуться в личный кабинет</a></button>
            </body>
            </html>
        `);
        }).catch((err)=>{
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Title</title>
            </head>
            <body>
                <p>Такого пользователя нет</p>
                <button><a href="/home">Вернуться в личный кабинет</a></button>
            </body>
            </html>
            `);
            console.log(err);
        })
    }
})


app.get('/json', function (req, res){
    dirnpath = `${path.join(__dirname, '/users.json')}`;
    res.download(dirnpath);
})



function write_json(){
    let data = JSON.stringify(users_json);
    fs.writeFile(`${path.join(__dirname, './users.json')}`, data, ()=>{
        console.log('clean users.json secsesful');
    })
}




app.listen(3000);