require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")


// const date = require(__dirname + "/date.js");    //Expoting the function from the date.js file
// console.log(date());              // Calling the the value of the function date to show on the terminal.
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));




mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    // await insertData(); // Call your function to insert data here
  })
  .catch(error => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });


//creating the schema 

const Schema = mongoose.Schema;

const itemsSchema = new Schema({
  name: String
});

const listSchema = new Schema({
  name: String,
  items: [itemsSchema]
})
//creating the model

const Item = mongoose.model('Item', itemsSchema);

const List = mongoose.model('List', listSchema);


const item3 = new Item({
  name: "Eat"
});

const item4 = new Item({
  name: "Exercise"
});

const defaultItem = [item3, item4];





app.get("/", async (req, res) => {

  try {

    const items = await Item.find({})
    // console.log(items);
    if (items.length === 0) {
      Item.insertMany(defaultItem)
        .then(() => {
          console.log("Insert the data successfully!!!")
          res.redirect('/');
        })
        .catch(err => {
          console.error(err);
        });

    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
      // redirect('/');
    }

  } catch (err) {
    console.log(err)
  }

  // const day = date.getDate();
  // res.render("list", { listTitle: "Today", newListItems: items })
});


// Made the routing dynamic with the name of the route
app.get('/:customList', async (req, res) => {
  const customList = await _.capitalize(req.params.customList);
  


  const existList = await List.findOne({ name: customList });
  //  console.log(existList.name);
  //  console.log(existList.items);

  if (!existList) {
    const list = new List({
      name: customList,
      items: defaultItem
    });
    await list.save();
    res.redirect('/' + customList);
  } else {
    await res.render("list", { listTitle: existList.name, newListItems: existList.items })
    // res.redirect('/' + customList);
  }



});







app.post("/", async(req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect('/'); 
  }else{
    
    const foundList = await List.findOne({name: listName});

    foundList.items.push(item);
    foundList.save();
    res.redirect('/'+listName);

  }




})


app.post('/delete', async (req, res) => {
  const checkedId = req.body.checkbox;
  const listName =  req.body.listName;



  if (listName === "Today") {
    await Item.deleteOne({ _id: checkedId });
    res.redirect('/');
  } else {
    try {
      const foundList = await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedId } } }
      );
  
      if (foundList) {
        res.redirect('/' + listName);
      } else {
        console.log("List not found");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  



})


app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workItems })
})


app.post("/work", (req, res) => {
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work")
})

app.get("/about", (req, res) => {

  res.render("about")
});


app.listen(3000, () => {
  console.log("server is runninng on the port 3000");
});