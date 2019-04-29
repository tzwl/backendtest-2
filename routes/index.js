const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Tag = require('../models/Tag')
const Transaction = require('mongoose-transactions') 
const transaction = new Transaction()
const transaction1 = new Transaction()
const pdf = require('pdfkit')
const fs = require('fs')

var path = require('path');


//handle login route
router.get('/', (req, res) => {
  res.render('login')
})

//handle signup route
router.get('/signup', (req, res) => {
  res.render('signup',{
    user: "",
    skill:""
  })
})

//register user route
router.post('/signup',(req,res)=>{
  
  const user = "User";
  const tag = "Tag";
  
  var num = "";  
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var nameformat = /^[a-zA-Z]+$/;
  var phformat = /[+][(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*/;
  let msg =[];

  //input validation
  if(!req.body.password||!req.body.firstname||!req.body.lastname||!req.body.email){     
    msg[msg.length]='all fields must be filled';      
  }
      
  if(!req.body.email.match(mailformat)){
    msg[msg.length]='email is invalid'; 
    console.log("email wrong")
  }
  if(!req.body.firstname.match(nameformat)||!req.body.lastname.match(nameformat)){
    msg[msg.length]='name must be alphabet'; 
  }
  if(!req.body.phonenum.match(phformat)){
    msg[msg.length]='phone is invalid'; 
    console.log("phone wrong")
  }
  if(!req.body.skill){
    msg[msg.length]='skill must select';  
    console.log("no skill") 
  }
  
  async function start () {
    console.log(req.body)    
    
    try {

        //get total documents from User collection
        await User.countDocuments({}, function (err, count) {
          num = req.body.firstname+"-"+req.body.lastname+"-"+(count+1);          
        });

        var userdata = { 
          Login:num,
          password: req.body.password,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          gender: req.body.gender,
          email: req.body.email,
          phonenum: req.body.phonenum,
          isadmin: false
        }
        
        //insert into database
        const usertran = transaction.insert(user, userdata)
        const tagtran = transaction.insert(tag, {name: req.body.skill.toString(),userid: usertran})
       
        const final = await transaction.run()
        transaction.clean()
        res.render('signup',{
          user: "",
          skill: "",
          errorMessage:msg,
          successMessage:"Successfully Registered. Your Login ID is "+userdata.Login
        })
    } catch (error) {
        // console.error(error)
        const rollbackObj = await transaction.rollback().catch(console.error)
        transaction.clean()
        res.render('signup',{
          user: userdata,
          skill: req.body.skill,
          errorMessage:msg
        }) 
           
    }
}
 
start()
  
})

router.get('/login',async(req,res)=>{
  
  var loginid = req.query.loginid;
  var psw = req.query.password;
  var tagarr = {};
  var myDoc = new pdf;
  console.log(loginid)
  console.log(psw)

  await Tag.find({},(error,data)=>{
      
    data.forEach(value=>{
      // console.log(value.userid)
      tagarr[value.userid]=value.name
  
    })
  })
   
  User.findOne({Login:loginid,password:psw},(err,data)=>{
    if(data){
      req.session.loginid = loginid
         
      if(data.isadmin == true){
        //create document to download
        myDoc.pipe(fs.createWriteStream('user.pdf'));
        User.find({},(error,data)=>{         
          data.forEach(value => {
               
            var content ="ID : "+value._id+"\nLogin : "+value.Login+"\nPassword : "+value.password+"\nFirst Name : "+value.firstname+"\nLast Name : "+value.lastname+"\nGender : "+value.gender+"\nEmail : "+value.email+"\nPhone Number : "+value.phonenum+"\nIsadmin : "+value.isadmin+"\nSkill : "+tagarr[value._id]+"\nCreatedAt : "+value.createdAt+"\nUpdatedAt : "+value.updatedAt+"\n\n";
            myDoc.font('Times-Roman')
              .fontSize(15)
              .text(content,50);
          });
                    
          myDoc.end();
        })
      } 
              
      res.render("top",{
        flag: data.isadmin
      })
      
    }else{
      // res.send("Fail")
      res.render("login",{
        inputid: req.query.loginid,
        errorMessage: "User doesnot exist"
      })
    }
  })
})


router.get('/edit',(req,res)=>{
  
  User.findOne({Login:req.session.loginid},(err,data)=>{
    if(data){
      Tag.findOne({userid:data._id},(err,data1)=>{
        if(data1){
          res.render("edit",{
            user: data,
            skill:data1.name
          })
        }

      })
      
    }else{
      res.send("Error in edit")
    }
    
  })
  
})

//edit user route
router.post('/edit', (req,res)=>{
  
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var nameformat = /^[a-zA-Z]+$/;
  var phformat = /[+][(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*/;
  let msg =[];
  var userid = "";
  var tagid = "";
  var admin_flg = "";
  var user = "User";
  var tag = "Tag";
  var sessionlogin = req.session.loginid

  //input validation
  if(!req.body.password||!req.body.firstname||!req.body.lastname||!req.body.email){ 
    msg[msg.length]='all fields must be filled';      
  }
      
  if(!req.body.email.match(mailformat)){
    msg[msg.length]='email is invalid'; 
    console.log("email wrong")
  }
  if(!req.body.firstname.match(nameformat)||!req.body.lastname.match(nameformat)){
    msg[msg.length]='name must be alphabet'; 
  }
  if(!req.body.phonenum.match(phformat)){
    msg[msg.length]='phone is invalid';
    console.log("phone wrong")
  }
  if(!req.body.skill){
    msg[msg.length]='skill must select';  
    console.log("no skill") 
  }

  

  async function start () {
    try {
      await User.findOne({Login:sessionlogin},(err,data)=>{
        if(data){
          userid = data._id
          admin_flg = data.isadmin
        }
      })       
    
      await Tag.findOne({userid:userid._id},(err,data1)=>{
        if(data1){          
          tagid = data1._id                    
        }
      })
      
      
      var userdata = { 
        Login:sessionlogin,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender,
        email: req.body.email,
        phonenum: req.body.phonenum,
        isadmin: admin_flg
      }
      
      var tagdata = {
        name: req.body.skill.toString(),
        userid:userid
      }
             
        transaction1.update(user, userid, userdata) 
        transaction1.update(tag, tagid, tagdata)
        
        const final = await transaction1.run()
        transaction1.clean()

        res.render("edit",{
          user: userdata,
          skill: req.body.skill,
          errorMessage:msg,
          successMessage: "You have successfully updated!"
        })
        
    } catch (error) {
        // console.error(error)
        const rollbackObj = await transaction1.rollback().catch(console.error)
        transaction1.clean()  
        res.render("edit",{
          user: userdata,
          skill: req.body.skill,
          errorMessage: msg
        })
    }
  }

  start()
  
})

router.get('/top',async(req,res)=>{
  var tagarr = {};
  var myDoc = new pdf;
  
  await Tag.find({},(error,data)=>{
      
    data.forEach(value=>{
      // console.log(value.userid)
      tagarr[value.userid]=value.name
  
    })
  })
   
  User.findOne({Login:req.session.loginid},(err,data)=>{
    if(data){
    
      if(data.isadmin == true){
        //create document to download
        myDoc.pipe(fs.createWriteStream('user.pdf'));
        User.find({},(error,data)=>{         
          data.forEach(value => {
               
            var content ="ID : "+value._id+"\nLogin : "+value.Login+"\nPassword : "+value.password+"\nFirst Name : "+value.firstname+"\nLast Name : "+value.lastname+"\nGender : "+value.gender+"\nEmail : "+value.email+"\nPhone Number : "+value.phonenum+"\nIsadmin : "+value.isadmin+"\nSkill : "+tagarr[value._id]+"\nCreatedAt : "+value.createdAt+"\nUpdatedAt : "+value.updatedAt+"\n\n";
            myDoc.font('Times-Roman')
              .fontSize(15)
              .text(content,50);
          });
                    
          myDoc.end();
        })
      } 
      
      // res.redirect("/login?loginid="+data.Login+"&password="+data.password)    
      res.render("top",{
        flag: data.isadmin
      })

    }else{
      res.send("Error in top")
    }
  })
  
})

router.get('/logout',(req,res)=>{
  console.log(req.session)
  if(req.session){
    // delete session object
    req.session.destroy()
  }
  res.redirect("/")
})

router.get('/download',(req,res)=>{
      
  var file = path.join("./", 'user.pdf');
  res.download(file, function (err) {
    if (err) {
        console.log("Error");
        console.log(err);
    } else {
        
        console.log("Success");
    }
  }); 
  
})

module.exports = router