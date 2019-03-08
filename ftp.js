let sftp = require('ssh2-sftp-client');
let sshc = require('ssh2').Client;
var ftpclient = new sftp();

ftpclient.connect({
    host: '118.24.130.214',
    port: 22,
    user: 'root',
    password: 'Pi314159',
});//.then(() => {
//     return ftpClient.put('../13.zip','server/123.zip',false);
// }).then(() => {
//     console.log('upload succeeded!')
// }).catch((err) => {
//     console.log(err);
// })

var sshclient = new sshc();
sshclient.connect({
    host: '118.24.130.214',
    port: 22,
    user: 'root',
    password: 'Pi314159',
});

sshclient.on('ready',() => {
    console.log('ssh connect succeed!!!');
    var uu = sshclient.exec('cd server',{},() => {
        console.log('zzzzz');
        console.log(uu);
    });
    // console.log(uu);
})
// sshClient.on('ready'){}

