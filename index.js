const express = require('express');
const dotenv = require ('dotenv');
dotenv.config();

const path = require ('path');
const hbs = require("hbs");
const database = require ('./database/dbConn');
const userData = require ('./models/userSchema');
const bcrypt = require ('bcrypt');

//for organization details storing..
const addOrg = require ('./models/addneworg');
const accountData = require ('./models/accountDetails');
const orglastpageData = require ('./models/orglastpage');

//for main dashboard (crate chart of account)
const createChartData = require ('./models/chartData');

const port = process.env.port || 1000;
const app = express();

//setting tempalte engine
app.set('view engine', 'hbs');
app.set("views", __dirname + "/views");
hbs.registerPartials("views/partials");

//accessing public folder/path
const publiPath = path.join(__dirname, "public");
app.use(express.static(publiPath));

//middlware
app.use(express.urlencoded({extended: false}));



app.get('/',(req,res)=>{
    res.render('index');
})



//redering signup page
app.get('/signup',(req, res)=>{
    res.render('signup');
})

//rendering login page
app.get('/login',(req, res)=>{
    res.render('login');
})

//storing form data in database
app.post('/signup',async(req,res)=>{
    try {
        const sendData = await userData(req.body);
        if(sendData.password === sendData.confPassword){
            const checkEmail = await userData.findOne({email: sendData.email})
            if(checkEmail){
                res.render('signup',{
                    emailMsg : 'Email Already Exit !'
                })
            

            }
            else{
                await sendData.save();
                res.render('login');
               
            }
            
            
        }
        else{
            res.render('signup',{
                message : 'Password Not Mactch !'
            })
        }
        
    } catch (error) {
        // res.status(400).send(`error`);
        res.render('signup',{
            message : 'Please fill all the details 😁'
        })
        
    }
})

// checking user email and password for login page 

app.post('/login',async(req, res)=>{
  try {
    const userPassword = req.body.password;
    const checkEmil = req.body.email;
    const databaseData = await userData.findOne({email:checkEmil});
    const isMatch = await bcrypt.compare(userPassword, databaseData.password)
    if(isMatch){
        res.render('addNewHome')
    }
    else{
        res.render('login',{
            message : 'Invalid Email or Password !'
        })
    } 
    
  } catch (error) {
    // res.status(400).send(`error`)
    res.render('login',{
        message : 'Invalid Email or Password !'
    })
    
  }

})


// add new organization form
app.get('/addneworg',(req,res)=>{
    res.render('addneworg');
})


app.post('/addneworg',async(req,res)=>{
    try {
        const addorganization = await addOrg(req.body);
        await addorganization.save();
        res.render('accountDetails');
        
    } catch (error) {
        res.render('addneworg',{
            message : 'Please fill all the details ! 😁'
        })
        // res.status(400).send(`${error}`)

        
    }
})

//storing account details data in database
app.post('/accountDetails',async(req ,res)=>{
    try {
        const accountDetailsData = await accountData(req.body);
        await accountDetailsData.save();
        res.render('orglastpage')
        
    } catch (error) {
        res.render('accountDetails',{
            message : 'Please fill all the details ! 😁'
        })
        // res.status(400).send(`${error}`)


        
    }

})

//storing  org last page account detailsd ata in database 
app.post('/orglastpage',async(req, res)=>{
   try {
    const lastPage  = await orglastpageData(req.body);
    await lastPage.save();
    res.render('mainDashboard')
    // res.render('orglastpage',{
    //     message : 'our company has successfully recieved your request . our aavatech team will activate your account soon..😊'
    // })
    
   } catch (error) {
    // res.status(400).send(`${error}`);
    res.render('orglastpage',{
        message : 'Please fill all the details 😊'
    })

    
   }

})



//main dashboard form create chart account

//rendering chart of accont page
app.get("/listchart",async(req, res)=>{
    const showData = await createChartData.find({});
    res.render('listchart',{
        showData : showData,
    });
})

//rendering create chart of accounts
app.get('/createChart',async (req ,res)=>{
    const showData = await createChartData.find({});
    // console.log(showData)
    res.render('createChart',{
        showData : showData
    });
})



//post method for crate chart account (storing data in database);

app.post('/createChart',async(req,res)=>{
    try {
        const chartdData = await createChartData(req.body);
        await chartdData.save(); 
        // res.send('your data added ')
        const showData = await createChartData.find({});
        res.render('createChart',{
            showData : showData,
            message : 'Data Added Successfully !'
        })
        
    } catch (error) {
        res.render('createChart',{
            error : 'Please Enter Data !'
        })
        // res.status(400).send(`${error}`);
    }
    
})



// *********** crud operation start from here *****************

// for edit page
app.get('/edit/:id',async(req,res)=>{
    const {id} = req.params;
    const editData = await createChartData.findById({_id:id});
    if(editData == null){
        res.redirect('/')
    }
    else{
        res.render('edit',{
            editData : editData,

        })
    }

}) 

//updating data 

app.post('/update/:id',async(req, res)=>{
   try {
    const {id} = req.params;
    const {description, account1, account2} = req.body;
    const updateData = await createChartData.findByIdAndUpdate({_id:id}, {description, account1, account2}, {new:true});
    const showData = await createChartData.find({});
    res.render('createChart',{
        showData : showData,       
        message : 'Data Updated Successfully !'
    })
    
   } catch (error) {
    
   }
})

//for delete data 
app.get('/delete/:id',async(req,res)=>{
    const {id} = req.params;
    const deleteData = await createChartData.findByIdAndDelete({_id:id});
    const showData = await createChartData.find({});

    res.render('createChart',{
        showData : showData,     
        error : 'Data Deleted Succssfully !'          
       
        
    });
})


// *********** crud operation End from here *****************


// app.use(function(req, res, next){
//     res.status(400).render('404page')
// })



//for 404 page (rendering 404 page )

app.use((req,res)=>{
    res.status(400).render('404page');

})

//for search filtering

app.get('/search/:key', async (req,res)=>{
    let data = await createChartData.find({
        "$or" : [
            {description : {$regex:req.params.key}}
        ]

    })
})












app.listen(port, (req ,res)=>{
    console.log(`Server is running on port no : ${port}`);
})