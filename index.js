const express = require('express')
const app = express('app')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const session = require('express-session')
const account = require('./account')
const admin = require('./admin')
const groups = require('./groups')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
    secret: 'fullstack-academy',
    resave:true,
    saveUninitialized:true
}))
app.set('view engine', 'ejs')

const init = async() =>{
    const connection =await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'futibaclub'
    })
    
    app.use((req,res,next)=>{
        if(req.session.user){
            res.locals.user = req.session.user
        }
        else{
           res.locals.user = false 
        }
        next()
    })

    app.use(account(connection))
    app.use('/admin', admin(connection))
    app.use('/groups', groups(connection))

    
    app.get('/classification', async (req,res) =>{
                const query = `
                    select
                    users.id,
                    users.name,
                    sum(guessings.score) as score
                    from users
                    left join
                        guessings
                            on guessings.users_id = users.id
                            group by guessings.users_id
                            order by score DESC
                `
                const [rows,fields] = await connection.execute(query)
                classification = rows
                res.render('./classification',{
                    rank: rows
                })
            
    })

    app.listen(3000,err=>{
        console.log('Futiba Club is running...')
    })
}
init()


