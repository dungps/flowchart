const express = require('express');
const http = require('http');
const app = express();
const hbs = require('express-hbs');
const fs = require('fs');
const path = require('path');
const yaml = require('node-yaml');
const favicon = require('serve-favicon');
const crypto = require('crypto');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))

app.engine('hbs', hbs.express4());

app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(favicon(path.resolve(__dirname, 'favicon.ico')));

app.get('/', (req, res, next) => {

    if (!fs.existsSync(path.resolve(__dirname, 'storages'))) {
        fs.mkdirSync(path.resolve(__dirname, 'storages'));
    }

    const secret = 'techevo';
    const hash = crypto.createHmac('sha256', secret).update(new Date().toString()).digest('hex').substr(1, 32);
    
    fs.writeFileSync(path.resolve(__dirname, 'storages', hash), "", 'utf8');

    res.redirect('/' + hash);
});

app.get('/flowcharts.min.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'node_modules', 'flowchart.js', 'release', 'flowchart.min.js'));
})

app.get('/raphael-min.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'node_modules', 'raphael', 'raphael.min.js'));
})

app.get("/:project", (req, res, next) => {
    const content = fs.readFileSync(path.resolve(__dirname, 'storages', req.params.project), {
        encoding: 'utf8'
    });

    return res.render('single', {
        id: req.params.project,
        rawContent: content,
        content: content.replace(new RegExp('\r?\n','g'), '\\n')
    });
});

app.post('/update', (req, res, next) => {
    if (fs.existsSync(path.resolve(__dirname, 'storages', req.body.id))) {
        fs.writeFileSync(path.resolve(__dirname, 'storages', req.body.id), req.body.content, 'utf8');
    }

    res.send('');
})

app.use((err, req, res, next) => {
    res.send("404 not found");
})


http.createServer(app).listen(1102, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log("server is running at port 1102");
});
