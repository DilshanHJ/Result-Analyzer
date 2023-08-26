require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs =require('ejs');
const session = require('express-session');
const mysql = require('mysql');

const fileupload = require('express-fileupload');
const cors = require('cors');
const _ =require('lodash');

const fs = require('fs');
const  fsp = require('fs/promises');


//Express configuration
const app=express();
app.use(session({
    secret:'KeyToEncryptSessions',
    resave:true,
    saveUninitialized:true
}));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(fileupload({createParentPath: true}));
app.use(cors());


//Mysql configuration
const connection = mysql.createConnection({
    host:"localhost",
    database:"RESULTS_ANALYSER",
    user:"root",
    port:"3306",
    password:"root"
});

connection.connect((error)=>{
    if(error){
        console.log(error);
    }else{
        console.log("MySql Server Connrcted Sucsessfully...");

    }

});

function getfromdb(query){
    return new Promise((resolve,reject)=>{
        connection.query(query,(error,result,fields)=>{
            if(error){
                 reject(error);
            }else{
                resolve(result);
            }
        });
    });
}

//////////////////////////////////////////////////////////////////Requests Handilng/////////////////////////////////////////////////

///////////////////////////////////////////////////////////////get requests for pages ////////////////////////////////////////////////////////
let ErrorMessage;
app.get("/",(req,res)=>{
    ErrorMessage="";
    res.render("Login",{ErrorMessage:ErrorMessage});
});

app.get("/admin",(req,res)=>{
    ErrorMessage="";
    res.render("admin-login",{ErrorMessage:ErrorMessage});
});

app.get("/home",async (req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            connection.query('SELECT MODULE_CODE,MODULE_NAME FROM SUBJECT',(error,result1,fields)=>{
                if(error){
                    console.log(error);
                }else{
                    connection.query('SELECT ATTEMPT,REG_NUMBER,MODULE_CODE,GRADE FROM USER_RESULT ORDER BY REG_NUMBER,ATTEMPT,MODULE_CODE',(error,result2,fields)=>{
                        if(error){
                            console.log(error);
                        }else{
                            
                            res.render("admin-home",{subjects:result1,results:result2});
                        }
                    });
                }
            });
            
        }else if(req.session.type==='Student'){

            let l1s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=1 AND SUBJECT.SEMESTER=1;`)
            let l1s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=1 AND SUBJECT.SEMESTER=2;`)
            let l2s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=2 AND SUBJECT.SEMESTER=1;`)
            let l2s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=2 AND SUBJECT.SEMESTER=2;`)
            let l3s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=3 AND SUBJECT.SEMESTER=1;`)
            let l3s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=3 AND SUBJECT.SEMESTER=2;`)
            let l4s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=4 AND SUBJECT.SEMESTER=1;`)
            let l4s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=4 AND SUBJECT.SEMESTER=2;`)

            res.render("user-home.ejs",{reg_number:req.session.reg_number,l1s1:l1s1,l1s2:l1s2,l2s1:l2s1,l2s2:l2s2,l3s1:l3s1,l3s2:l3s2,l4s1:l4s1,l4s2:l4s2});
        }else{
            res.send("Somthing is not right");
        }
    }else{
        res.send("Please login before accesing this page");
    }
});

////////////////////////////////////////////////////////////////get requests for admin pages ///////////////////////////////////////////////////////////////////////
app.get("/admin-home/enter-results",(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            connection.query('SELECT MODULE_CODE,MODULE_NAME FROM SUBJECT',(error,result1,fields)=>{
                if(error){
                    console.log(error);
                }else{
                    connection.query('SELECT ATTEMPT,REG_NUMBER,MODULE_CODE,GRADE FROM USER_RESULT ORDER BY REG_NUMBER,ATTEMPT,MODULE_CODE',(error,result2,fields)=>{
                        if(error){
                            console.log(error);
                        }else{
                            
                            res.render("partials/admin/enter-results/enter-result",{subjects:result1,results:result2});
                        }
                    });
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You are a student");
        }else{
            res.send("Somthing is not right");
        }
    }else{
        res.send("Please login before accesing this page");
    }
});

app.get("/admin-home/results-sheets",(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            res.render("partials/admin/result-sheets/result-sheets");
        }else if(req.session.type==='Student'){
            res.send("You are a student");
        }else{
            res.send("Somthing is not right");
        }
    }else{
        res.send("Please login before accesing this page");
    }
});

app.get("/admin-home/analyzed-reports",(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            res.render("partials/admin/analyzed-reports/analyzed-reports");
        }else if(req.session.type==='Student'){
            res.send("You are a student");
        }else{
            res.send("Somthing is not right");
        }
    }else{
        res.send("Please login before accesing this page");
    }
});

app.get("/admin-home/add-new-users",(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            connection.query('SELECT * FROM USER',(error,result,fields)=>{
                if(error){
                    console.log(error);
                }else{
                    connection.query('SELECT * FROM ADMIN',(error,result2,fields)=>{
                        if(error){
                            console.log(error);
                        }else{
                            res.render("partials/admin/add-new-users/add-new-users",{users:result,admins:result2});
                            
                        }
                    });
                    
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You are a student");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before accesing this page");
    }
});

//////////////////////////////////////////////////////////////////////get requests for user pages///////////////////////////////
app.get('/user-home/my-results',async (req,res)=>{
    if(req.session.loggedin){
        let l1s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=1 AND SUBJECT.SEMESTER=1;`)
        let l1s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=1 AND SUBJECT.SEMESTER=2;`)
        let l2s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=2 AND SUBJECT.SEMESTER=1;`)
        let l2s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=2 AND SUBJECT.SEMESTER=2;`)
        let l3s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=3 AND SUBJECT.SEMESTER=1;`)
        let l3s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=3 AND SUBJECT.SEMESTER=2;`)
        let l4s1=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=4 AND SUBJECT.SEMESTER=1;`)
        let l4s2=  await getfromdb(`SELECT USER_RESULT.ATTEMPT,USER_RESULT.MODULE_CODE,USER_RESULT.GRADE FROM USER_RESULT,SUBJECT WHERE USER_RESULT.MODULE_CODE=SUBJECT.MODULE_CODE AND REG_NUMBER=${req.session.reg_number} AND SUBJECT.YEAR=4 AND SUBJECT.SEMESTER=2;`)
            res.render("partials/user/my-results/my-results.ejs",{reg_number:req.session.reg_number,l1s1:l1s1,l1s2:l1s2,l2s1:l2s1,l2s2:l2s2,l3s1:l3s1,l3s2:l3s2,l4s1:l4s1,l4s2:l4s2});
    }else{
        res.send("Please login before accesing this page");
    }
});

app.get('/user-home/results-sheets',(req,res)=>{
    if(req.session.loggedin){
        res.render("partials/user/result-sheets/result-sheets.ejs")
    }else{
        res.send("Please login before accesing this page");
    }
});

app.get('/user-home/gpa-lists',async (req,res)=>{
    if(req.session.loggedin){
        let user = await getfromdb(`SELECT * FROM USER WHERE REG_NUMBER=${req.session.reg_number}`);
        res.render("partials/user/gpa-lists/analyzed-reports.ejs",{user:user[0]});

    }else{
        res.send("Please login before accesing this page");
    }
});

app.get('/user-home/my-profile',async (req,res)=>{
    if(req.session.loggedin){
        let user = await getfromdb(`SELECT * FROM USER WHERE REG_NUMBER=${req.session.reg_number}`);
        res.render("partials/user/my-profile/my-profile.ejs",{user:user[0]});

    }else{
        res.send("Please login before accesing this page");
    }
});




























app.get('/test',(req,res)=>{
    res.render('Test');
});

//////////////////////////////////////////////post requests for login /////////////////////////////////////////////////////

app.post('/login',(req,res)=>{
    let reg_number=req.body.reg_number;
    let password = req.body.password;
    if(reg_number&&password){
        connection.query('SELECT * FROM USER WHERE REG_NUMBER=? AND PASSWORD=?',[reg_number,password],(error,result,fields)=>{
            if(error){
                console.log(error);
            }
            if(result.length>0){
                req.session.loggedin=true;
                req.session.reg_number=reg_number;
                req.session.type='Student';
                res.redirect('/home');
            }else{
                ErrorMessage="Index number or password is incorrect";
                res.render('Login',{ErrorMessage:ErrorMessage});
            }
        })
    }else{
        ErrorMessage="Please enter both index number and password correctly";
        res.render('Login',{ErrorMessage:ErrorMessage});
    }
});

app.post('/admin/login',(req,res)=>{
    let reg_number=req.body.reg_number;
    let password = req.body.password;
    if(reg_number&&password){
        connection.query('SELECT * FROM ADMIN WHERE ADMIN_ID=? AND PASSWORD=?',[reg_number,password],(error,result,fields)=>{
            if(error){
                console.log(error);
            }
            if(result.length>0){
                req.session.loggedin=true;
                req.session.reg_number=reg_number;
                req.session.level=result[0].LEVEL;
                req.session.type='Admin';
                res.redirect('/home');
            }else{
                ErrorMessage="Index number or password is incorrect";
                res.render('admin-login',{ErrorMessage:ErrorMessage});
            }
        })
    }else{
        ErrorMessage="Please enter both index number and password correctly";
        res.render('admin-login',{ErrorMessage:ErrorMessage});
    }
});

//////////////////////////////////////////////post requests for enter results /////////////////////////////////////////////////////

app.post('/admin/enter/result/onebyone',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let attempt =req.body.attempt;
            let module_code = req.body.modulecode;
            let reg_number = req.body.reg_number;
            let marks = req.body.marks;
            let grade = req.body.grade;
            let held = req.body.held;
            connection.query('INSERT INTO USER_RESULT VALUES(?,?,?,?,?,?)',[attempt,reg_number,module_code,grade,marks,held],(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);
                }else{
                    res.redirect("/home");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});

app.post('/admin/enter/result/modulecsv',(req,res)=>{
        if(!req.files){
            res.send(`<div> No file found!</div>`);
        }else{
            let csvdata = req.files.modulecsv.data.toString('utf8');
            csvdata = csvdata.replaceAll('\r','');
            csvdata = csvdata.replaceAll('"','');
            let rows = csvdata.split('\n');
            let queary2 ="INSERT INTO USER_RESULT (ATTEMPT,REG_NUMBER,MODULE_CODE,GRADE,MARK,HELD) VALUES";
            let table=[];
            for(let x=0;x<rows.length-1;x++){
                let row= rows[x].split(',');
                table.push(row);
            }
            for(let x=0;x<rows.length-1;x++){
                if(x==rows.length-2){
                    queary2=queary2+"(" + parseInt(table[x][0])+ "," + parseInt(table[x][1]) + ",'" +table[x][2] +"','"+ table[x][3]+"',"+ parseInt(table[x][4])+ ","+ parseInt(table[x][5])+");";
                }else{
                    queary2=queary2+"(" + parseInt(table[x][0])+ "," + parseInt(table[x][1]) + ",'" +table[x][2] +"','"+ table[x][3]+"',"+ parseInt(table[x][4])+ ","+ parseInt(table[x][5])+"),";
                }
            }
            console.log(queary2);
            connection.query(queary2,(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);
                }else{
                    res.send("Successfully added to the database");
                }
            });
        }
});

//////////////////////////////////////////////post requests for User Management /////////////////////////////////////////////////////

app.post('/admin/enter/users/onebyone',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let reg_number = req.body.reg_number;
            let name = req.body.name;
            let password = req.body.password
            let email = req.body.email;
            let batch_number = req.body.batch;
            let queary=`INSERT INTO USER VALUES(${reg_number},"${name}","${password}","${email}",${batch_number});`;
            connection.query(queary,(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);
                }else{
                    res.send("Successfully added to the database");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});

app.post('/admin/delete/users/',async (req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let reg_number;
            let name;
            if(req.body.reg_number){
                reg_number = req.body.reg_number;
            }else{
                reg_number=0;
            }
            if(req.body.name){
                name = req.body.name;
            }else{
                name="";
            }
            await getfromdb(`DELETE FROM USER_RESULT WHERE REG_NUMBER=${reg_number}`);
            await getfromdb(`DELETE FROM USER_COMBINATION WHERE REG_NUMBER=${reg_number}`);

            let queary=`DELETE FROM USER WHERE REG_NUMBER=${reg_number} OR NAME="${name}";`;
            connection.query(queary,(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);
                     
                }else{
                    res.send("Successfully deleted from the database");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post('/admin/enter/users/csv',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            if(!req.files){
                res.send(`<div> No file found!</div>`);
            }else{
                let csvdata = req.files.users_csv.data.toString('utf8');
                csvdata = csvdata.replaceAll('\r','');
                csvdata = csvdata.replaceAll('"','');
                let rows = csvdata.split('\n');
                let queary = 'INSERT INTO USER (REG_NUMBER,NAME,PASSWORD,EMAIL,BATCH_NUMBER) VALUES';
                let table =[];
                for(let x=0;x<rows.length-1;x++){
                    let row= rows[x].split(',');
                    table.push(row);
                }
                for(let x=0;x<rows.length-1;x++){
                    if(x==rows.length-2){
                        queary=queary+"(" + parseInt(table[x][0])+ ",'" + table[x][1] + "','" +table[x][2] +"','"+ table[x][3]+"'," +parseInt(table[x][4])+");";
                    }else{
                        queary=queary+"(" + parseInt(table[x][0])+ ",'" + table[x][1] + "','" +table[x][2] +"','"+ table[x][3]+"'," +parseInt(table[x][4])+"),";
                    }
                }
                connection.query(queary,(error,result,fields)=>{
                    if(error){
                        res.send(`<div>Error occured:<br>${error}<div/>`); 
                    }else{
                        res.send("Successfully added to the database");
                    }
                });
            }

        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});


app.post('/admin/enter/users/combination/csv',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            if(!req.files){
                res.send(`<div> No file found!</div>`);
            }else{
                let csvdata = req.files.combination_csv.data.toString('utf8');
                csvdata = csvdata.replaceAll('\r','');
                csvdata = csvdata.replaceAll('"','');
                let rows = csvdata.split('\n');
                let queary = 'INSERT INTO USER_COMBINATION (LEVEL,REG_NUMBER,COMBINATION) VALUES';
                let table =[];
                for(let x=0;x<rows.length-1;x++){
                    let row= rows[x].split(',');
                    table.push(row);
                }
                for(let x=0;x<rows.length-1;x++){
                    if(x==rows.length-2){
                        queary=queary+"(" + parseInt(table[x][0])+ "," + parseInt(table[x][1]) + ",'" +table[x][2] +"');";
                    }else{
                        queary=queary+"(" + parseInt(table[x][0])+ "," + parseInt(table[x][1]) + ",'" +table[x][2] +"'),";
                    }
                }
                console.log(queary);
                connection.query(queary,(error,result,fields)=>{
                    if(error){
                        res.send(`<div>Error occured:<br>${error}<div/>`);
                    }else{
                        res.send("Successfully added to the database");
                    }
                });
            }
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});

app.post('/admin/edit/users',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let reg_number = req.body.reg_number;
            let name = req.body.name;
            let password = req.body.password
            let email = req.body.email;
            let batch_number = req.body.batch;
            let queary='UPDATE USER SET ';
            if(name){
                if(!password && !email && !batch_number){
                    queary = queary + "NAME='" + name + "' ";
                }else{
                    queary = queary + "NAME='" + name + "', ";
                }
            }
            if(password){
                if(!email && !batch_number){
                    queary = queary + "PASSWORD='" + password + "' ";
                }else{
                    queary = queary + "PASSWORD='" + password + "', ";
                }
            }
            if(email){
                if(!batch_number){
                    queary = queary + "EMAIL='" + email + "' ";
                }else{
                    queary = queary + "EMAIL='" + email + "', ";
                }
            }
            if(batch_number){
                queary = queary + "BATCH_NUMBER='" + batch_number + "' ";
            }
            queary = queary + "WHERE REG_NUMBER=" + reg_number +";";
            connection.query(queary,(error,result,fields)=>{
                if(error){
                            res.send(`<div>Error occured:<br>${error}<div/>`);
                     
                }else{
                    res.send("Successfully added to the database");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});


app.post('/admin/update/users/combination/onebyone',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let level = req.body.level;
            let reg_number = req.body.reg_number;
            let combination= req.body.combination;
            let queary=`UPDATE USER_COMBINATION SET COMBINATION=${combination} WHERE REG_NUMBER=${reg_number} AND LEVEL=${level}`;
            connection.query(queary,(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);  
                }else{
                    res.send("Successfully Edited");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Edit User Details");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});


app.post('/admin/enter/admins/csv',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            if(!req.files){
                res.send(`<div> No file found!</div>`);
            }else{
                let csvdata = req.files.users_csv.data.toString('utf8');
                csvdata = csvdata.replaceAll('\r','');
                csvdata = csvdata.replaceAll('"','');
                let rows = csvdata.split('\n');

                let queary = 'INSERT INTO ADMIN (ADMIN_ID,NAME,PASSWORD,LEVEL) VALUES';
                let table =[];
                for(let x=0;x<rows.length-1;x++){
                    let row= rows[x].split(',');
                    table.push(row);
                }
                for(let x=0;x<rows.length-1;x++){
                    if(x==rows.length-2){
                        queary=queary+"(" + parseInt(table[x][0])+ ",'" + table[x][1] + "','" +table[x][2] +"'," +parseInt(table[x][3])+");";
                    }else{
                        queary=queary+"(" + parseInt(table[x][0])+ ",'" + table[x][1] + "','" +table[x][2] +"'," +parseInt(table[x][3])+"),";
                    }
                }
                console.log(queary);
                connection.query(queary,(error,result,fields)=>{
                    if(error){
                                res.send(`<div>Error occured:<br>${error}<div/>`);
                         
                    }else{
                        res.send("Successfully added to the database");
                    }
                });
            }
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});

app.post('/admin/enter/admins/onebyone',(req,res)=>{
    if(req.session.loggedin){
        if(req.session.type==='Admin'){
            let admin_id = req.body.admin_id;
            let name = req.body.name;
            let password = req.body.password
            let level = req.body.level;
            let queary=`INSERT INTO ADMIN VALUES(${admin_id},"${name}","${password}",${level});`;
            connection.query(queary,(error,result,fields)=>{
                if(error){
                    res.send(`<div>Error occured:<br>${error}<div/>`);
                     
                }else{
                    res.send("Successfully added to the database");
                }
            });
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else{
       res.send("Please login before Entering Results");
    }
});

//////////////////////////////////////////////post requests for admin Results generation /////////////////////////////////////////////////////

app.post('/admin/result/sheet/generate',async (req,res)=>{
    if(req.session.loggedin && req.body.held && req.body.semester && req.body.year && req.body.combination){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let held = req.body.held;
            let semester = req.body.semester;
            let year = req.body.year;
            let combination =req.body.combination;
            let dep ='ERROR OCCURED';
            if(combination==='1'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS" OR DEPARTMENT="ELTN")'
            }else if(combination==='2'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="ELTN" OR DEPARTMENT="IMGT")'
            }else if(combination==='3'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="IMGT" OR DEPARTMENT="CMIS")'
            }else if(combination==='G-1A'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS" OR DEPARTMENT="ELTN") AND NOT MODULE_CODE LIKE "STAT%" AND GENERAL="A"'
            }else if(combination==='G-1B'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS" OR DEPARTMENT="ELTN") AND NOT MODULE_CODE LIKE "MATH%" AND NOT MODULE_CODE LIKE "MMOD%" AND GENERAL="A"'
            }else if(combination==='G-1C'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS") AND GENERAL="A"'
            }else if(combination==='G-2A'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="ELTN" OR DEPARTMENT="IMGT") AND NOT MODULE_CODE LIKE "STAT%" AND GENERAL="A"'
            }else if(combination==='G-2B'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="IMGT" OR DEPARTMENT="ELTN") AND NOT MODULE_CODE LIKE "MATH%" AND NOT MODULE_CODE LIKE "MMOD%" AND GENERAL="A"'
            }else if(combination==='G-2C'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="ELTN") AND GENERAL="A"'
            }else if(combination==='G-3A'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS" OR DEPARTMENT="IMGT") AND NOT MODULE_CODE LIKE "STAT%" AND GENERAL="A"'
            }else if(combination==='G-3B'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="CMIS" OR DEPARTMENT="IMGT") AND NOT MODULE_CODE LIKE "MATH%" AND NOT MODULE_CODE LIKE "MMOD%" AND GENERAL="A"'
            }else if(combination==='G-3C'){
                dep='(DEPARTMENT="ELPC" OR DEPARTMENT="MATH" OR DEPARTMENT="IMGT") AND GENERAL="A"'
            }else if(combination==='JM-1A'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR2="A"))'
            }else if(combination==='JM-1B'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR2="A"))'
            }else if(combination==='JM-1C'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR2="A"))'
            }else if(combination==='JM-2A'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR2="A"))'
            }else if(combination==='JM-2B'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR2="A"))'
            }else if(combination==='JM-2C'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR2="A"))'
            }else if(combination==='JM-3A'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR2="A"))'
            }else if(combination==='JM-3B'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR2="A"))'
            }else if(combination==='JM-3C'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR2="A"))'
            }else if(combination==='JM-4A'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="CMIS" AND MAJOR2="A"))'
            }else if(combination==='JM-4B'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="ELTN" AND MAJOR2="A"))'
            }else if(combination==='JM-4C'){
                dep='(DEPARTMENT="ELPC" OR MODULE_CODE IN (SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="MATH" AND MAJOR1="A" UNION SELECT MODULE_CODE FROM SUBJECT WHERE DEPARTMENT="IMGT" AND MAJOR2="A"))'
            }else if(combination==='SP-CMIS'){
                dep='((DEPARTMENT="ELPC" OR DEPARTMENT="CMIS") AND SPECIAL="A")'
            }else if(combination==='SP-IMGT'){
                dep='((DEPARTMENT="ELPC" OR DEPARTMENT="IMGT") AND SPECIAL="A")'
            }else if(combination==='SP-ELTN'){
                dep='((DEPARTMENT="ELPC" OR DEPARTMENT="ELTN") AND SPECIAL="A")'
            }else if(combination==='SP-MMST'){
                dep='((DEPARTMENT="ELPC" OR DEPARTMENT="MATH") AND SPECIAL="A")'
            }
            query = `SELECT MODULE_CODE FROM SUBJECT WHERE YEAR=${year} AND SEMESTER=${semester} AND ${dep} ;`;
            let subjects = await getfromdb(query);
            let module_code_identifier='____'+year+semester+'__';
            query =`SELECT USER.REG_NUMBER FROM USER,USER_COMBINATION,USER_RESULT WHERE USER.REG_NUMBER=USER_COMBINATION.REG_NUMBER AND USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER_COMBINATION.COMBINATION='${combination}' AND USER_RESULT.HELD=${held} AND USER_RESULT.MODULE_CODE LIKE '${module_code_identifier}' GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT GRADE FROM USER_RESULT WHERE REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let grade = await getfromdb(query);
                    if(await grade.length>0){
                        student.push(await grade[0].GRADE);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            let datatowrite;
            let stat;
            async function checkexistence(path) {
                try {
                     stat= await fsp.stat(path);
                     return true;
                } catch (err) {
                    console.log(err);
                    return false; 
                }
            }
            async function writetofile(path,datatowrite) {
                try {
                    await fsp.writeFile(path,datatowrite);
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                    
                }
            }
            if(await checkexistence(path)){
            }else{
                datatowrite=`INDEX NUMBER,`
                for(let i=0;i<subjects.length;i++){
                    datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
                }
                datatowrite=datatowrite+'\n';
                for(let i=0;i<resultsheet.length;i++){
                    for(let j=0;j<resultsheet[i].length;j++){
                        datatowrite=datatowrite+resultsheet[i][j]+','
                    }
                    datatowrite=datatowrite+'\n'
                }
                await writetofile(path,datatowrite);
            }
            res.render("partials/admin/result-sheets/result-table",{table:resultsheet,subjects:subjects,held:held,year:year,semester:semester,combination:combination});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' || !req.body.held || !req.body.semester || !req.body.year){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post('/admin/result/sheet/download',async (req,res)=>{
    if(req.session.loggedin && req.body.held && req.body.semester && req.body.year && req.body.combination){
        if(req.session.type==='Admin' ){
            let held = req.body.held;
            let semester = req.body.semester;
            let year = req.body.year;
            let combination =req.body.combination;
            let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            let stat;
            async function checkexistence(path) {
                try {
                     stat= await fsp.stat(path);
                     return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }
            async function writetofile(path,datatowrite) {
                try {
                    await fsp.writeFile(path,datatowrite);
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }
            if(await checkexistence(path)){
                res.download(path);

            }else{
                res.send("<div> Please Generate the result sheet once before downloading it.</div>");
            }
            
        }else if(req.session.type==='Student'){
            res.send("You Dont have Autority to Enter Results");
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || !req.body.held || !req.body.semester || !req.body.year){
       res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});



//////////////////////////////////////////////// Post Requests For Analyzed reports////////////////////////////////////////////////////////////



app.post("/admin/analyzed/report/overallgpa/semester",async (req,res)=>{
    if(req.session.loggedin && req.body.batch && req.body.semester && req.body.year){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            let semester = req.body.semester;
            let year = req.body.year;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE YEAR=${year} AND SEMESTER=${semester};`;
            let subjects = await getfromdb(query);
            let module_code_identifier='____'+year+semester+'__';
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} AND USER_RESULT.MODULE_CODE LIKE '${module_code_identifier}' GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let gpa_sheet=[];
            for(let i=0; i <resultsheet.length; i++){
                let student =[await resultsheet[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet[i].length;j++){
                    if(await resultsheet[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects[j-1].CREDITS*resultsheet[i][j]);
                        cumulative_credit= cumulative_credit+subjects[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                console.log(gpa);
                student.push( gpa.toFixed(2));
                gpa_sheet.push(student);
            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/overall-semester-gpa",{gpa_list:gpa_sheet,level:year,semester:semester, batch:batch});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' &&( !req.body.batch || !req.body.semester || !req.body.year)){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post("/admin/analyzed/report/overallgpa/year",async (req,res)=>{
    if(req.session.loggedin && req.body.batch && req.body.year){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            let year = req.body.year;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE YEAR=${year} AND SEMESTER=1;`;
            let subjects1 = await getfromdb(query);
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE YEAR=${year} AND SEMESTER=2;`;
            let subjects2 = await getfromdb(query);
            let module_code_identifier='____'+year+'___';
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} AND USER_RESULT.MODULE_CODE LIKE '${module_code_identifier}' GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet1 =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects1.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects1[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet1.push(student);
            }
            let gpa_sheet1=[];
            for(let i=0; i <resultsheet1.length; i++){
                let student =[await resultsheet1[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet1[i].length;j++){
                    if(await resultsheet1[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects1[j-1].CREDITS*resultsheet1[i][j]);
                        cumulative_credit= cumulative_credit+subjects1[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                student.push( gpa.toFixed(2));
                gpa_sheet1.push(student);
            }
            let resultsheet2 =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects2.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects2[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet2.push(student);
            }
            let gpa_sheet2=[];
            for(let i=0; i <resultsheet2.length; i++){
                let student =[await resultsheet2[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet2[i].length;j++){
                    if(await resultsheet2[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects2[j-1].CREDITS*resultsheet2[i][j]);
                        cumulative_credit= cumulative_credit+subjects2[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                student.push( gpa.toFixed(2));
                gpa_sheet2.push(student);
            }
            let gpa_sheet=[];
            for(let i=0;i<gpa_sheet1.length;i++){
                let record=[gpa_sheet1[i][0]];
                year_gpa =(parseFloat(gpa_sheet1[i][1]) + parseFloat(gpa_sheet2[i][1]))/2;
                record.push(year_gpa.toFixed(2));
                gpa_sheet.push(record);

            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/overall-year-gpa",{gpa_list:gpa_sheet,level:year, batch:batch});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' &&( !req.body.batch || !req.body.year)){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});


app.post("/admin/analyzed/report/overallgpa/overall",async (req,res)=>{
    if(req.session.loggedin && req.body.batch){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT;`;
            let subjects = await getfromdb(query);
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let gpa_sheet=[];
            for(let i=0; i <resultsheet.length; i++){
                let student =[await resultsheet[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet[i].length;j++){
                    if(await resultsheet[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects[j-1].CREDITS*resultsheet[i][j]);
                        cumulative_credit= cumulative_credit+subjects[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                student.push( gpa.toFixed(2));
                gpa_sheet.push(student);
            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/overall-gpa-overall",{gpa_list:gpa_sheet, batch:batch});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' && !req.body.batch){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post("/admin/analyzed/report/subjectgpa/semester",async (req,res)=>{
    if(req.session.loggedin && req.body.batch && req.body.semester && req.body.year && req.body.subject){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            let semester = req.body.semester;
            let year = req.body.year;
            let subject = req.body.subject;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE YEAR=${year} AND SEMESTER=${semester} AND DEPARTMENT='${subject}';`;
            let subjects = await getfromdb(query);
            let module_code_identifier='____'+year+semester+'__';
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} AND USER_RESULT.MODULE_CODE LIKE '${module_code_identifier}' GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let gpa_sheet=[];
            for(let i=0; i <resultsheet.length; i++){
                let student =[await resultsheet[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet[i].length;j++){
                    if(await resultsheet[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects[j-1].CREDITS*resultsheet[i][j]);
                        cumulative_credit= cumulative_credit+subjects[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                console.log(gpa);
                student.push( gpa.toFixed(2));
                gpa_sheet.push(student);
            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/subject-semester-gpa",{gpa_list:gpa_sheet,level:year,semester:semester, batch:batch,subject:subject});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' &&( !req.body.batch || !req.body.semester || !req.body.year || req.body.subject)){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post("/admin/analyzed/report/subjectgpa/year",async (req,res)=>{
    if(req.session.loggedin && req.body.year && req.body.batch && req.body.subject){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            let subject = req.body.subject;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE YEAR=${year} AND DEPARTMENT='${subject}';`;
            let subjects = await getfromdb(query);
            let module_code_identifier='____'+year+'___';
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} AND USER_RESULT.MODULE_CODE LIKE '${module_code_identifier}' GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let gpa_sheet=[];
            for(let i=0; i <resultsheet.length; i++){
                let student =[await resultsheet[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet[i].length;j++){
                    if(await resultsheet[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects[j-1].CREDITS*resultsheet[i][j]);
                        cumulative_credit= cumulative_credit+subjects[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                console.log(gpa);
                student.push( gpa.toFixed(2));
                gpa_sheet.push(student);
            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/subject-year-gpa",{gpa_list:gpa_sheet,level:year, batch:batch,subject:subject});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' &&( !req.body.batch || !req.body.year || req.body.subject)){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});

app.post("/admin/analyzed/report/subjectgpa/overall",async (req,res)=>{
    if(req.session.loggedin && req.body.batch && req.body.subject){
        if(req.session.type==='Admin' || req.session.type==='Student' ){
            let batch = req.body.batch;
            let subject = req.body.subject;
            query = `SELECT MODULE_CODE,CREDITS FROM SUBJECT WHERE DEPARTMENT='${subject}';`;
            let subjects = await getfromdb(query);
            query =`SELECT USER.REG_NUMBER FROM USER,USER_RESULT WHERE USER.REG_NUMBER=USER_RESULT.REG_NUMBER AND USER.BATCH_NUMBER=${batch} GROUP BY REG_NUMBER ORDER BY REG_NUMBER DESC`;
            let students = await getfromdb(query);
            let resultsheet =[];
            for(let i=0;i<await students.length;i++){
                let student=[await students[i].REG_NUMBER];
                for(let j=0; j<await subjects.length;j++){
                    query =`SELECT RESULT.GPA FROM USER_RESULT,RESULT WHERE RESULT.GRADE=USER_RESULT.GRADE AND REG_NUMBER=${await students[i].REG_NUMBER} AND MODULE_CODE='${await subjects[j].MODULE_CODE}';`
                    let gpa = await getfromdb(query);
                    if(await gpa.length>0){
                        student.push(await gpa[0].GPA);
                    }else{
                        student.push("-");
                    }
                }
                resultsheet.push(student);
            }
            let gpa_sheet=[];
            for(let i=0; i <resultsheet.length; i++){
                let student =[await resultsheet[i][0]];
                let cumulative_credit=0;;
                let gpa=0;
                for(let j=1; j<resultsheet[i].length;j++){
                    if(await resultsheet[i][j]==="-"){

                    }else{
                        gpa = gpa + (subjects[j-1].CREDITS*resultsheet[i][j]);
                        cumulative_credit= cumulative_credit+subjects[j-1].CREDITS;
                        
                    }
                }
                gpa = gpa/cumulative_credit;
                console.log(gpa);
                student.push( gpa.toFixed(2));
                gpa_sheet.push(student);
            }

            // let filename =`Level ${year} Semester ${semester} Combination ${combination} Examination result-Year ${held}`;
            // let path=__dirname +'/public/resultsheets/'+filename+'.csv';
            // let datatowrite;
            // let stat;
            // async function checkexistence(path) {
            //     try {
            //          stat= await fsp.stat(path);
            //          return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false; 
            //     }
            // }
            // async function writetofile(path,datatowrite) {
            //     try {
            //         await fsp.writeFile(path,datatowrite);
            //         return true;
            //     } catch (err) {
            //         console.log(err);
            //         return false;
                    
            //     }
            // }
            // if(await checkexistence(path)){
            // }else{
            //     datatowrite=`INDEX NUMBER,`
            //     for(let i=0;i<subjects.length;i++){
            //         datatowrite=datatowrite+subjects[i].MODULE_CODE+',';
            //     }
            //     datatowrite=datatowrite+'\n';
            //     for(let i=0;i<resultsheet.length;i++){
            //         for(let j=0;j<resultsheet[i].length;j++){
            //             datatowrite=datatowrite+resultsheet[i][j]+','
            //         }
            //         datatowrite=datatowrite+'\n'
            //     }
            //     await writetofile(path,datatowrite);
            // }
            res.render("partials/admin/analyzed-reports/total-subject-gpa",{gpa_list:gpa_sheet, batch:batch,subject:subject});
        }else{
            res.send("Somthing is not right");
        }
    }else if(req.session.type==='Admin' || req.session.type==='Student' &&( !req.body.batch || req.body.subject)){
        res.send("Please fill all the fields");
    }else{
        res.send("Please login before Entering Results");
    }
});
















































































app.listen(3000,()=>{
    console.log("Serever is listening on port 3000...");
});