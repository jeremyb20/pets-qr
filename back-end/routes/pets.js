const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Pet = require('../models/pet');
const cloudinary = require('cloudinary').v2;
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const app = express();
require('dotenv').config();

var fileupload = require('express-fileupload');

app.use(fileupload({
  useTempFiles:true
}));

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET
});

// Register aqui hay ebviar la foto
router.post('/register/new-pet', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newPet = new Pet ({
    petName: obj.petName,
    phone:obj.phone,
    email: obj.email,
    password: obj.password,
    lat: obj.lat,
    lng: obj.lng,
    userState: obj.userState,
    genderSelected:obj.genderSelected,
    photo: result.secure_url == undefined ? obj.image : result.secure_url,
    petStatus: obj.petStatus,
    permissions : {
      showPhoneInfo: true,
      showEmailInfo: true,
      showLinkTwitter: true,
      showLinkFacebook: true,
      showLinkInstagram: true,
      showOwnerPetName: true,
      showBirthDate: true,
      showAddressInfo: true,
      showAgeInfo: true,
      showVeterinarianContact: true,
      showPhoneVeterinarian: true,
      showHealthAndRequirements: true,
      showFavoriteActivities: true,
      showLocationInfo: true
    }
  });

  Pet.addPet(newPet,async(user, done) => {
    try {
      // var smtpTransport = nodemailer.createTransport({
      //   host: 'mail.ticowebmail.com',
      //   port: 25,
      //   secure: false,
      //   logger: true,
      //   debug: true,
      //   ignoreTLS: true,
      //   auth: {
      //     user: 'marco@ticowebmail.com',
      //     pass: 'NTRNTxplr12'
      //   },
      //   tls: {
      //     // do not fail on invalid certs
      //     rejectUnauthorized: false
      //   }
      // });
      // var mailOptions = {
      //   to: newUser.email,
      //   from: 'marco@ticowebmail.com',
      //   subject: 'Node.js Register User',
      //   text: '¡Bienvenido a Yummy Eats! ' + obj.name + ' para iniciar sesion estos serian sus credenciales: correo: ' + obj.email + ' contraseña temporal:'+obj.password 
      // };
      // smtpTransport.sendMail(mailOptions, function (err) {
      //   res.json({ success: true, msg: 'Compañia registrada exitosamente' });
      // });
      res.json({ success: true, msg: 'Compañia registrada exitosamente' });
      } catch (err) {
        res.json({success: false, msg: 'That Email or Username already exisits.!'});
        next(err);
      }
  
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Pet.getUserByUsername(email, (err, pet) => {
    if(err) throw err;
    if(!pet) {
      return res.json({success: false, msg: 'Email not found'});
    }

    Pet.comparePassword(password, pet.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch) {
        const token = jwt.sign({data: pet}, process.env.SECRET, {
          expiresIn: 604800   // 1 week: 604800 1 day //60 one minute 
        });
        res.json({
          success: true,
          token: 'JWT '+token,
          pet: {
            id: pet._id,
            userState: pet.userState,
            petName: pet.petName,
            photo: pet.photo
          }
        })
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});



router.put('/update/updateProfilePet', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const petUpdate = {
    petName: obj.petName,
    ownerPetName: obj.ownerPetName,
    birthDate: obj.birthDate,
    address: obj.address,
    email: obj.email,
    age: obj.age,
    veterinarianContact: obj.veterinarianContact,
    phoneVeterinarian: obj.phoneVeterinarian,
    healthAndRequirements: obj.healthAndRequirements,
    favoriteActivities: obj.favoriteActivities,
    linkTwitter: obj.linkTwitter,
    linkFacebook: obj.linkFacebook,
    linkInstagram: obj.linkInstagram,
    showLocationInfo: obj.showLocationInfo
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
       arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["petName"] = petUpdate.petName;
          element["ownerPetName"] = petUpdate.ownerPetName;
          element["birthDate"] = petUpdate.birthDate;
          element["address"] = petUpdate.address;
          element["email"] = petUpdate.email;
          element["age"] = petUpdate.age;
          element["veterinarianContact"] = petUpdate.veterinarianContact;
          element["phoneVeterinarian"] = petUpdate.phoneVeterinarian;
          element["healthAndRequirements"] = petUpdate.healthAndRequirements;
          element["favoriteActivities"] = petUpdate.favoriteActivities;
          element["linkTwitter"] = petUpdate.linkTwitter;
          element["linkFacebook"] = petUpdate.linkFacebook;
          element["linkInstagram"] = petUpdate.linkInstagram;
          element["showLocationInfo"] = petUpdate.showLocationInfo;
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
});

router.put('/update/updateLocationPet', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const petUpdate = {
    lat: obj.lat,
    lng: obj.lng,
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["lat"] = petUpdate.lat;
          element["lng"] = petUpdate.lng;
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
});

router.put('/update/updatePhotoPetProfile', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newPet = {
    photo: result.secure_url == undefined ? obj.image : result.secure_url
  };

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["photo"] = newPet.photo;
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
});

router.get('/getPetDataList/:id', function(req, res){
  var id = req.params.id;
  Pet.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor contactar a soporte');
      return;
    }

   var pet = {
      petName: results.petName,
      ownerPetName: results.ownerPetName,
      phone: results.phone,
      email: results.email,
      photo: results.photo,
      userState: results.userState,
      lat: results.lat,
      lng: results.lng,
      birthDate: results.birthDate,
      address: results.address,
      age: results.age,
      veterinarianContact: results.veterinarianContact,
      phoneVeterinarian: results.phoneVeterinarian,
      healthAndRequirements: results.healthAndRequirements,
      favoriteActivities: results.favoriteActivities,
      calendar: results.calendar,
      code: results.code,
      petStatus: results.petStatus,
      linkTwitter: results.linkTwitter,
      linkFacebook: results.linkFacebook,
      linkInstagram: results.linkInstagram
    }
    res.json(pet)
  });
});


router.post('/register/newPetEvent', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  let newCalendarEvent = {
    title: obj.title,
    date: obj.date,
    enddate: obj.enddate,
    description: obj.description
  };
  Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { calendar: newCalendarEvent  }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Evento registrado correctamente..!'});
  });
});

router.post('/register/generateQrCodePet', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  var code = 'https://' + req.headers.host + '/myPetCode/' + obj._id;
  var status = 'Ordenando'
  var object = {
    link: code,
    status: status
  }

  var notifications = {
    message: 'El usuario '+ obj.petName+ ' ha solicitado un collar',
    userPetName: obj.petName,
    isNewMsg: true,
    dateMsg: new Date(),
    photo: obj.photo,
    idPet: obj._id
  }

  Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { code: object }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Nuevo codigo Se ha generado correctamente el administrador se va contactar contigo, por mientras ve su estado del codigo en tu perfil!'});
  });

  Pet.findOneAndUpdate({ _id: process.env.ADMIN_ID }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado al admin');
  });
});

router.put('/update/updateStatusQrCodePet', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  var code = 'https://' + req.headers.host + '/myPetCode/' + obj._id;
  var object = {
    link: code,
    status: obj.status
  }

  var notifications = {
    message: 'Se ha cambiado el estado del producto a '+ object.status+'',
    userPetName: 'Admin',
    isNewMsg: true,
    dateMsg: new Date(),
    idPet: req.body._id,
    photo: obj.photo
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["code"].forEach(item => {
            item["status"] = object.status;
            item["link"] = object.link; 
          }) 
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
   Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado correctamente');
  });
});


// Permissions

router.get('/getPermissionsData/:id', function(req, res){
  var id = req.params.id;
  Pet.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor contactar a soporte');
      return;
    }

   var pet = {
     permissions: results.permissions
    }
    res.json(pet)
  });
});

router.put('/update/updatePetPermissions', async(req, res, next) => {
  const object = JSON.parse(JSON.stringify(req.body));
  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["permissions"].forEach(item => {
            item["showPhoneInfo"] = object.showPhoneInfo;
            item["showEmailInfo"] = object.showEmailInfo;
            item["showLinkTwitter"] = object.showLinkTwitter;
            item["showLinkFacebook"] = object.showLinkFacebook;
            item["showLinkInstagram"] = object.showLinkInstagram;
            item["showOwnerPetName"] = object.showOwnerPetName;
            item["showBirthDate"] = object.showBirthDate;
            item["showAddressInfo"] = object.showAddressInfo;
            item["showAgeInfo"] = object.showAgeInfo;
            item["showVeterinarianContact"] = object.showVeterinarianContact;
            item["showPhoneVeterinarian"] = object.showPhoneVeterinarian;
            item["showHealthAndRequirements"] = object.showHealthAndRequirements;
            item["showFavoriteActivities"] = object.showFavoriteActivities;
            item["showLocationInfo"] = object.showLocationInfo;
          }) 
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
});

// Permissions




// admin 

router.get('/admin/getAllPets', function(req, res){
    Pet.find({}, function(err, pets){
    if(err){
      res.send('something went really wrong');
      next();
    }
    res.json(pets)
  });
});

router.get('/admin/lost/getAllLostPets', function(req, res){
  Pet.find({}, function(err, pets){
  if(err){
    res.send('something went really wrong');
    next();
  }
  var arrayObj = []
  pets.forEach((item)=> {
    if(item.petStatus == 'Perdido'){
      arrayObj.push(item)
    }
  })
  res.json(arrayObj);
});
});


router.get('/admin/getAdminDataList', function(req, res){
  var id = process.env.ADMIN_ID;
  Pet.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor revisar admin');
      return;
    }

   var pet = {
      petName: results.petName,
      ownerPetName: results.ownerPetName,
      phone: results.phone,
      email: results.email,
      photo: results.photo,
      userState: results.userState,
      lat: results.lat,
      lng: results.lng,
      birthDate: results.birthDate,
      address: results.address,
      age: results.age,
      veterinarianContact: results.veterinarianContact,
      phoneVeterinarian: results.phoneVeterinarian,
      healthAndRequirements: results.healthAndRequirements,
      favoriteActivities: results.favoriteActivities,
      calendar: results.calendar,
      code: results.code,
      petStatus: results.petStatus,
      notifications: results.notifications
    }
    res.json(pet)
  });
});

router.get('/admin/getAllProductList', function(req, res){
  var id = process.env.ADMIN_ID;
  Pet.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor revisar admin');
      return;
    }

   var pet = {
      productsList: results.productsList
    }
    res.json(pet)
  });
});

router.post('/admin/register/new-product', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  let newProductList = {
    productName: obj.productName,
    size: obj.size,
    color: obj.color,
    cost: obj.cost,
    description: obj.description,
    quantity: obj.quantity
  };

  Pet.findOneAndUpdate({ _id: process.env.ADMIN_ID }, { $push: { productsList: newProductList }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Nuevo codigo Se ha generado correctamente el administrador se va contactar contigo, por mientras ve su estado del codigo en tu perfil!'});
  });

});

router.put('/admin/register/registerPhotoPetProduct', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newPet = {
    idProduct : obj.idProduct,
    isFistPhoto : obj.isFistPhoto,
    photo: result.secure_url == undefined ? obj.image : result.secure_url
  };

  await Pet.findOne({_id: process.env.ADMIN_ID }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["productsList"].forEach(item => {
            if(item._id == newPet.idProduct){
              if(newPet.isFistPhoto == 'true'){
                item["firstPhoto"] = newPet.photo;
              }
              if(newPet.isFistPhoto == 'false'){
                item["secondPhoto"] = newPet.photo; 
              }
            }
          }) 
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });

});

// admin

//Notifications 
router.get('/notifications/getNotificationsList/:id', function(req, res){
  var id = req.params.id;
  Pet.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor revisar admin');
      return;
    }
    res.json(results.notifications)
  });
});



router.put('/update/updateNotificationsList', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  var object = {
    isNewMsg: obj.isNewMsg,
    idItem: obj.idItem
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["notifications"].forEach(item => {
            if(item._id == object.idItem){
              item["isNewMsg"] = false;
            }
          }) 
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });
});



//Notifications


// reports
router.post('/report/reportLostPetStatus', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  let reportPetLost = {
    lastPlaceLost: obj.lastPlaceLost,
    date: obj.date,
    petStatus: obj.petStatus,
    descriptionLost: obj.descriptionLost
  };

  var notifications = {
    message: 'Se ha reportado a '+obj.petName +' como '+ reportPetLost.petStatus+'',
    userPetName: obj.petName,
    isNewMsg: true,
    dateMsg: new Date(),
    idPet: req.body._id,
    photo: 'https://cdn2.iconfinder.com/data/icons/cute-husky-emoticon/512/husky_emoji_sad-512.png'
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["petStatus"] = reportPetLost.petStatus;
          if(element["petStatusReport"].length> 0){
            var indexToRemove = 0;
            var numberToRemove = 1;
            element["petStatusReport"].splice(indexToRemove, numberToRemove);
          }
          element["petStatusReport"].push(reportPetLost)
          
          pet.save();
          try {
            res.json({success:true,msg: 'Se ha reportado correctamente.. al administrador del sitio!'});
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });

  Pet.findOneAndUpdate({ _id: process.env.ADMIN_ID }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado correctamente');
  });
});


router.put('/update/updateReportLostPetStatus', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  let newPet = {
    status: obj.petStatus 
  };

  var notifications = {
    message: 'Se ha reportado a '+obj.petName +' como '+ newPet.status+'',
    userPetName: obj.petName,
    isNewMsg: true,
    dateMsg: new Date(),
    idPet: req.body._id,
    photo: 'https://cdn2.iconfinder.com/data/icons/cute-husky-emoticon/512/husky_emoji_happy-512.png'
  }

  await Pet.findOne({_id: req.body._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["petStatus"] = newPet.status;
          if(element["petStatusReport"].length> 0){
            var indexToRemove = 0;
            var numberToRemove = 1;
            element["petStatusReport"].splice(indexToRemove, numberToRemove);
          }
          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
      })
     }
   });

   Pet.findOneAndUpdate({ _id: process.env.ADMIN_ID }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado correctamente');
  });
});

// reports










router.post('/register/newMenu', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const result = await cloudinary.uploader.upload(req.file != undefined ? req.file.path : obj.image);
  let newMenu = {
    foodName: obj.foodName,
    description: obj.description,
    cost: obj.cost,
    idCompany: obj.idCompany,
    photo: result.secure_url == undefined ? obj.image : result.secure_url
  };
  Company.findOneAndUpdate({ _id: req.body.idCompany }, { $push: { newMenu: newMenu  }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Se ha registrado correctamente..!'});
  });
});




// router.get('/profile/getAllUsers', function(req, res){
//     Company.find({}, function(err, users){
//     if(err){
//       res.send('something went really wrong');
//       next();
//     }
//     res.json(users)
//   });
// });

router.get('/getAllMenuList/:id', function(req, res){
  var id = req.params.id;
  Company.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor contactar a soporte');
      next();
    }
    res.json(results.newMenu)
  });
});

router.get('/getCompanyMenu/:id', function(req, res){
  var id = req.params.id;
  Company.findById(id, function(err, results){
    if(err){
      res.send('Algo ocurrio favor contactar a soporte');
      next();
    }
    var objec =[{
      newMenu: results.newMenu,
      petName: results.petName,
      idCompany: results._id
      }  
    ]
    res.json(objec);
  });
});

router.get('/getRestaurantMenuList/', function(req, res){
  Company.find({}, function(err, company){
    const obj = JSON.parse(JSON.stringify(company));
    if(err){
      res.send('Algo ocurrio contacta con el administrador del sitio');
      next();
    }else{
      const list = [];
      obj.forEach(element => {
        if(element.newMenu.length>0){
          var objec ={
            newMenu: element.newMenu.slice(0,4),
            petName: element.petName,
            idCompany: element._id
          }
            list.push(objec)
        }
      })
      res.json(list);
    }
    
  });
});

router.put('/update/updateMenuItemList', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newMenu = {
    foodName: obj.foodName,
    description: obj.description,
    cost: obj.cost,
    _id: obj._id,
    idCompany: obj.idCompany,
    photo: result.secure_url == undefined ? obj.image : result.secure_url
  };

  await Company.findOne({_id: req.body.idCompany }, (err, user) => {
    if (!user) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(user != null) {
       user.newMenu.forEach(element => {
         if(element._id == newMenu._id){
          element["foodName"] = newMenu.foodName;
          element["description"] = newMenu.description;
          element["cost"] = newMenu.cost;
          element["photo"] = newMenu.photo;
          user.save();
           try {
             res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
           } catch (err) {
             res.json({ success: false, msg: err });
             next(err);
           }
         }
       })
     }
   });
});

router.put('/delete/deleteMenuItemList', async(req, res, next) => {
  Company.findOne({_id: req.body.idCompany }, (err, user) => {
    if (!user) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(user != null) {
      for (var i =0; i < user.newMenu.length; i++){
        if (user.newMenu[i]._id == req.body._id) {
          user.newMenu.splice(i,1);
          user.save();
          try {
            res.json({ success: true, msg: 'Se ha eliminado correctamente..!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
          break;
        }
      }
     }
   });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({company: req.company});
});

router.route('/users/:_id')
  .delete(function(req, res){
    Company.remove(req,res);
});

router.put('/profile/updateCompany', (req, res) => {
    Company.findByIdAndUpdate(req.body._id, { $set: req.body }).then(function (data) {
    res.json({ success: true, msg: 'Update success.' });
  });
});

router.get('/mailbox/getMessages/:id', function(req, res){
  var id = req.params.id;
  Company.findById(id, function(err, results){
    if(err){
      res.send('something went really wrong');
      next();
    }
    res.json(results.message)
  });
});

router.post('/mailbox/sendMessage', (req, res, next) => {
    Company.findOneAndUpdate({ _id: req.body.idUserSent }, { $push: { message: req.body  } }).then(function(data){
    res.json({success:true,msg: 'Message sent'});
  });
});


router.post('/forgot', (req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  console.log(obj)
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        Company.findOne({ email: obj.email }, (err, user) => {
        if (!user) {
         return res.json({success:false,msg: 'Email not found'});
        }

        if(user != null) {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
      // var smtpTransport = nodemailer.createTransport({
      //   host: 'mail.ticowebmail.com',
      //   port: 25,
      //   secure: false,
      //   logger: true,
      //   debug: true,
      //   ignoreTLS: true,
      //   auth: {
      //     user: 'marco@ticowebmail.com',
      //     pass: 'NTRNTxplr12'
      //   },
      //   tls: {
      //     // do not fail on invalid certs
      //     rejectUnauthorized: false
      //   }
      // });
      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'jeremybarquero18@gmail.com',
          pass: 'octubre151096'
        }
      });
      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'marco@ticowebmail.com',
        subject: 'Yummy Eats restablecimiento de la contraseña',
        text: 'Recibe esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.\n\n' +
          'Haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso:\n\n' +
          //'http://localhost:4200/reset/' + token + '\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Si no lo solicitó, ignore este correo electrónico y su contraseña permanecerá sin cambios.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, msg: 'Se ha enviado un correo electrónico a ' + user.email + ' con más instrucciones.'});
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', (req, res) => {
    Company.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.json({success:false,msg: err});
    }else{
      res
      .status(200)
      .json({ user: user, token: req.params.token });
    }
  });
});


router.post('/reset/', function(req, res) {
  req.params.token = req.body.token;
  async.waterfall([
    function(done) {
        Company.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return  res.json({success:false,msg: 'Password reset token is invalid or has expired..'});
        }else if(req.body.password === req.body.confirm){
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

            bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);

              bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                user.save(function(err) {
                  done(err, user);
                });
              });
            });
        }else{
          return  res.json({success:false,msg: 'Password do not match..'});
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'mail.ticowebmail.com',
        port: 25,
        secure: false,
        logger: true,
        debug: true,
        ignoreTLS: true,
        auth: {
          user: 'marco@ticowebmail.com',
          pass: 'NTRNTxplr12'
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });
      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'marco@ticowebmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success:true,msg: 'Success! Your password has been changed.'});
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
});



module.exports = router;
