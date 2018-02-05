const express = require('express')
const app = express.Router()

const crypto = require('crypto')
const alg = 'aes-256-ctr'
const pwd = 'abcdabcd'
function crypt(text){
    const cipher = crypto.createCipher(alg, pwd)
    const crypted = cipher.update(text,'utf8','hex')
    return crypted
}
function decrypt(text){
    const decipher = crypto.createDecipher(alg,pwd)
    const plain = decipher.update(text,'hex','utf8')
    return plain
}


const init = connection =>{
app.get('/',async(req,res) =>{
    const [rows,fields] = await connection.execute('select * from users')
    res.render('home')
})

/*
MODULO CRIAR NOVA CONTA
*/
app.get('/new-account', (req,res) =>{
    res.render('new-account'), {error:false}
})
app.post('/new-account', async(req,res)=>{
    const [rows,fields] = await connection.execute('select * from users where email = ?', [req.body.email])
     if(rows.length === 0){
        //inserir
        const {name, email, passwd} = req.body
        const [inserted,insertedFields] =  await connection.execute('insert into users (name, email, passwd, role) values(?,?,?,?)',[
            name,
            email,
            crypt(passwd),
            'user'
        ])
        const user = {
            id: inserted.insertId,
            name: name,
            role: 'user'
          }
          req.session.user = user
        res.redirect('/')
    }
    else{
        res.render('new-account',{
            error: 'Usuário já existente'
        })
    }
})

/*
MODULO LOGIN
*/
app.get('/login', (req,res) =>{
    res.render('login'), {error:false}
})
app.post('/login',async(req,res)=>{
    const [rows,fields] = await connection.execute('select * from users where email = ?', [req.body.email])
    if(rows.length === 0){
        res.render('login', {error: 'Usuário e/ou senha inválidos.'})
    }
    else{
       if(decrypt(rows[0].passwd) === req.body.passwd){
           const userDb = rows[0]
           const user = {
             id: userDb.id,
             name: userDb.name,
             role: userDb.role
           }
           req.session.user = user
           res.redirect('/')
       }
       else{
        res.render('login', {error: 'Usuário e/ou senha inválidos.'})
       }
    }
})

/*
MODULO LOGOUT
*/
app.get('/logout',(req,res)=>{
    req.session.destroy(err=>{
        res.redirect('/')
    })
})

return app
}

module.exports = init