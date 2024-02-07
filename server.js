const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const app = express();
const env =require("dotenv");
env.config();
 // connect database
const db = new pg.Client({
   user: "postgres",
   host: "localhost",
   database:DATABASE,
   password:POSTGRE_PASSWORD,
   port: 5432,
});
db.connect();
const port = 8000;

//Middleware
app.use(bodyParser.urlencoded({extended : true}));
app.use('/public/',express.static( __dirname+'/public/'));
app.set('views', __dirname + '/views');
app.set('view engine','ejs');

//Routes
app.get("/",async(req,res)=>{
    let userID = req.query.user;
    let filter = req.query.filter;
    let price = req.query.price;
   const url = `/?user=${userID}`;
    // becomes array 
  
    if(!filter && !price){
      result = await db.query("SELECT * FROM books");
    }
    else if(!price){
       result = await db.query("SELECT * FROM books JOIN keywords ON keywords.book_id = books.book_id WHERE word =$1",[filter]);
    }else if(!filter){
      result = await db.query("SELECT * FROM books  WHERE books.price >=$1",[price]);
    }
    let books = result.rows;
  console.log(userID);
    if(userID) res.render("index.ejs", {books: books ,userID : userID ,url:url});
    else {
      
      res.render("index.ejs",{books:books,url: url}); 
    }
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});
app.post("/login",async(req,res)=>{
  const email =req.body.email;
    const password = req.body.password;
    if( email.length !==0 && password.length !==0){
      let result = await db.query("SELECT * FROM users WHERE users.email =$1",[email]);
      // console.log(result.rows);
      if(result.length !==0){
          const founduser =result.rows[0];
        if( founduser.password == password){
          const userID = result.rows[0].id;
         res.redirect(`/?user=${userID}`);
        } else{
        const error = " INCORRECT CREDENTIALS";
        res.render("login.ejs",{error :error});
       }
  
      }
     else{
      const error = " INCORRECT CREDENTIALS";
      res.render("login.ejs",{error :error});
     }
    }else{
      const error = "Empty fields .Try again.";
      res.render("login.ejs",{error :error});
    }
    
});
app.post("/signup",async(req,res)=>{
    const email =req.body.email;
    const password = req.body.password;
  
    let result = await db.query("SELECT id FROM users ORDER BY id DESC");
  
    let users = result.rows[0].id;
   const userID = users +1;
   if( email.length !==0 && password.length !==0 ){
       db.query("SELECT * FROM users WHERE users.email =$1 ",[email],).then(result =>{
              if( result.rows.length !==0){
                const error ="Account already exists.Try again with a new username or a email";
                res.render("signup.ejs",{error:error});
              }else{
                throw "e";
              }    
       }).catch(async function(e){
           console.log(e);
         
           await db.query("INSERT INTO users (email ,password) VALUES ( $1 ,$2)", [email,password]);
         
          res.redirect(`/?user=${userID}`);
           });
    }
    else{
      const error ="Empty fields. Try again"
      res.render("signup.ejs",{error:error});
    }    
});

app.get("/cart", async(req,res)=>{
    const userID= req.query.user;
    const bookID =req.query.book;
  await  db.query("INSERT INTO carts(book_id,user_id) VALUES($1,$2)",[bookID,userID]);
  res.redirect(`/?user=${userID}`);
});
app.get("/showcart",async(req,res)=>{
    const userID = req.query.user;
      const result =db.query("SELECT * FROM books JOIN carts ON carts.book_id = books.book_id WHERE carts.user_id =$1",[userID]);
      if(result.rows.length !==0){
        const books =result.rows;
        let total =0;
        books.forEach((book)=>{
            total += book.price;
      });
        res.render( "Cart.ejs",{books:books,total:total,userID:userID});
        }else{
        
          res.render( "Cart.ejs" ,{error : "You have no books in your cart"});
        }
       
      
});
app.post("/write",async(req,res)=>{
    
    const review = req.body.review;
    const userID = req.body.user;
    const bookID = req.body.book;
   await db.query("INSERT INTO reviews(book_id,user_id,reviewbyid,review )VALUES ($1,$2,$3,$4)",[bookID,userID,userID,review]);
   if(!userID) res.redirect(`/reviews?book=${bookID}`);
   else res.redirect(`/reviews?book=${bookID}&user=${userID}`);
});
app.get("/reviews", async(req,res)=>{
    const bookID = req.query.book;
    const userID = req.query.user;
   
  let result = await db.query("SELECT * FROM reviews WHERE book_id =$1",[bookID]);
  console.log(result);
       if(result.rows.length ===0) {
        let error = "No reviews yet";
        if(userID) res.render("reviews.ejs",{error: error,bookID:bookID,userID:userID});
        else res.render("reviews.ejs",{error: error,bookID:bookID});
  
       }
     else{  
      let reviews = result.rows;
      if(userID) res.render("reviews.ejs",{reviews:reviews,userID:userID,bookID:bookID});
       else  res.render("reviews.ejs",{reviews:reviews,bookID:bookID});
      }

});
app.get("/delete",async(req,res)=>{

    const bookID = req.query.book;
    const userID = req.query.user;
    
     await db.query("DELETE FROM carts WHERE carts.user_id =$1 AND carts.book_id =$2",[userID,bookID]);

    res.redirect(`/showcart?user=${userID}`); //link works

});
app.post("/search",async(req,res)=>{
  const search = req.body.search;
  const userID = req.body.user;
  db.query("SELECT * FROM books WHERE books.title =$1 OR books.author =$2",[search,search]).then((result)=>{
     let books = result.rows;
     if(userID) res.render("index.ejs",{books:books,userID:userID});
     else  res.render("index.ejs",{books:books});
  }).catch((err)=>{
    const error="None of the searches match";
    if(userID) res.render("index.ejs",{books:books,userID:userID});
    else  res.render("index.ejs",{error:error});
  });
});
app.get("/profile",async(req,res)=>{
  
  const userID = req.body.item;
  const result2 = await db.query("SELECT * FROM users WHERE id=$1  ",[userID]);
  
  res.render("profile.ejs",{});

});
app.get("/order",async(req,res)=>{
  const userID = req.query.user;
  const bookID = req.query.book;
  await db.query("INSERT INTO orders(book_id,user_id)VALUES($1,$2)",[userID,bookID]);
  res.redirect(`/?user=${userID}`);

});
app.get("/showorders",async(req,res)=>{
  const userID = req.query.user;
  const result = await db.query("SELECT * FROM books JOIN orders ON books.book_id = orders.book_id WHERE orders.user_id = $1",[userID]);
  if(result.rows.length !==0){
     const orders = result.rows;
     res.render("order.ejs",{orders:orders});
  }
})
app.listen( port , ()=>{
    console.log(`Server is listening on ${port}`);
});
