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
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
require('dotenv').config();

var fileupload = require('express-fileupload');
const pet = require('../models/pet');

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

router.post('/register/new-petByUserPet', async(req, res) => {
  var id ='60219dea321aed00155e1659';
  const obj = JSON.parse(JSON.stringify(req.body));
  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  const newpet = {
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
    // linkTwitter: obj.linkTwitter,
    // linkFacebook: obj.linkFacebook,
    // linkInstagram: obj.linkInstagram,
    lat: obj.lat,
    lng: obj.lng,
    userState: obj.userState,
    genderSelected:obj.genderSelected,
    photo: result.secure_url == undefined ? obj.image : result.secure_url,
    phone: obj.phone,
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
  }

  var notifications = {
    message: 'El usuario con el correo '+ obj.email+ ' ha registrado un can bajo su dominio',
    userPetName: obj.petName,
    isNewMsg: true,
    dateMsg: new Date(),
    photo: obj.photo,
    idPet: obj._id
  }

  Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { newPetProfile: newpet }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Se ha registrado correctamente el can bajo su correo de perfil!'});
  });

  Pet.findOneAndUpdate({ _id: id }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado al admin');
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
          expiresIn: 86400   // 1 week: 604800 1 day 86400 //60 one minute 
        });
        res.json({
          success: true,
          token: 'JWT '+token,
          pet: {
            id: pet._id,
            userState: pet.userState,
            petName: pet.petName,
            photo: pet.photo,
            email: pet.email,
            idSecond: 0
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
      if(obj.idSecond == 0){
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
      }else {
        arrayPet[0].newPetProfile.forEach(element => {
          if(element._id == obj.idSecond){
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
          }
        })
      }
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
      if(obj.idSecond == 0){
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
      }else{
        arrayPet[0].newPetProfile.forEach(element => {
          if(element._id == obj.idSecond){
            element["lat"] = petUpdate.lat;
            element["lng"] = petUpdate.lng;
            pet.save();
            try {
              res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
            } catch (err) {
              res.json({ success: false, msg: err });
              next(err);
            }
          }
        })
      }
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
       if(obj.idSecond == 0){
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
      }else {
        arrayPet[0].newPetProfile.forEach(element => {
          if (element._id == obj.idSecond) {
            element["photo"] = newPet.photo;
            pet.save();
            try {
              res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
            } catch (err) {
              res.json({ success: false, msg: err });
              next(err);
            }
          }   
        })
      }
     }
   });
});

router.get('/getPetDataList', function(req, res){
  var id = req.query.id;
  var idSecond = req.query.idSecond;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }
    if(idSecond == 0) {
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
        // calendar: results.calendar,
        // code: results.code,
        petStatus: results.petStatus,
        linkTwitter: results.linkTwitter,
        linkFacebook: results.linkFacebook,
        linkInstagram: results.linkInstagram,
        // newPetProfile: results.newPetProfile
      }
      res.json(pet)
    }else {
      if(results!= null) {
          results.newPetProfile.forEach(element => {
          if (element._id == idSecond) {
            var pet = {
              petName: element.petName,
              ownerPetName: element.ownerPetName,
              phone: element.phone,
              email: element.email,
              photo: element.photo,
              userState: element.userState,
              lat: element.lat,
              lng: element.lng,
              birthDate: element.birthDate,
              address: element.address,
              age: element.age,
              veterinarianContact: element.veterinarianContact,
              phoneVeterinarian: element.phoneVeterinarian,
              healthAndRequirements: element.healthAndRequirements,
              favoriteActivities: element.favoriteActivities,
              // calendar: element.calendar,
              // code: element.code,
              petStatus: element.petStatus,
              linkTwitter: element.linkTwitter,
              linkFacebook: element.linkFacebook,
              linkInstagram: element.linkInstagram
            }
            res.json(pet)
          }
        })
      }
      
    }
  });
});

router.get('/getHistoryShopList/:id', function(req, res){
  var id = req.params.id;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }
    if(results.code.length> 0 ){
      var object = [];
      results.code.forEach(item => {
        var product =  {
          comment: item.comment,
          cost: item.cost,
          description: item.description,
          idCan: item.idCan,
          petName: item.petName,
          productName: item.productName,
          status: item.status,
          _id: item._id
        }
        object.push(product);
      })
      res.json(object)
    }
  });
});

router.get('/getAllProfileList/:id', function(req, res){
  var id = req.params.id;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }
    let object = [];

    results.newPetProfile.forEach(item => {
      var test = {
        id: item._id,
        petName : item.petName,
        photo: item.photo
      }

      object.push(test);
    })

    var pet = {
      petName: results.petName,
      photo: results.photo,
      newPetProfile: object
    }

    res.json(pet)
  });
});

router.get('/getCalendarData/:id/:idSecond', function(req, res){
  var id = req.params.id;
  var idSecond = req.params.idSecond;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }

    if(idSecond == 0) {
      var pet = {
        calendar: results.calendar
       }
       res.json(pet)
    }else {
      results.newPetProfile.forEach(element => {
        if (element._id == idSecond) {
          var pet = {
            calendar: element.calendar
          }
          res.json(pet)
        }
      })
    }
  });
});

router.get('/getLocationInfo/:id/:idSecond', function(req, res){
  var id = req.params.id;
  var idSecond = req.params.idSecond;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }

    if(idSecond == 0) {
      var pet = {
        lat: results.lat,
        lng: results.lng,
        photo: results.photo
       }
       res.json(pet)
    }else {
      results.newPetProfile.forEach(element => {
        if (element._id == idSecond) {
          var pet = {
            lat: results.lat,
            lng: results.lng,
            photo: results.photo
           }
          res.json(pet)
        }
      })
    }
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
  if(obj.idSecond == 0) {
    Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { calendar: newCalendarEvent } }, { new: true }).then(function (data) {
      res.json({ success: true, msg: 'Evento registrado correctamente..!' });
    });
  }else {
    Pet.findOne({_id: req.body._id }, (err, pet) => {
      if (!pet) {
        return res.json({success:false,msg: 'Usuario no encontrado'});
      }
      if(pet != null) {
         var arrayPet = [];
        arrayPet.push(pet);
        arrayPet[0].newPetProfile.forEach(element => {
          if (element._id == obj.idSecond) {
             element["calendar"].push(newCalendarEvent);
            pet.save();
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
  }
});

router.put('/update/updatePetEvent', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  let updateCalendarEvent = {
    title: obj.title,
    date: obj.date,
    enddate: obj.enddate,
    description: obj.description
  };
  if(obj.idSecond == 0) {
    Pet.findOne({_id: req.body._id }, (err, pet) => {
      if (!pet) {
        return res.json({success:false,msg: 'Usuario no encontrado'});
      }
      if(pet != null) {
         var arrayPet = [];
        arrayPet.push(pet);
        arrayPet[0].calendar.forEach(element => {
          if (element._id == obj.idEventUpdate) {
            element["title"] = updateCalendarEvent.title;
            element["date"] = updateCalendarEvent.date;
            element["enddate"] = updateCalendarEvent.enddate;
            element["description"] = updateCalendarEvent.description;
            
            pet.save();
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
  }else {
    Pet.findOne({_id: req.body._id }, (err, pet) => {
      if (!pet) {
        return res.json({success:false,msg: 'Usuario no encontrado'});
      }
      if(pet != null) {
         var arrayPet = [];
        arrayPet.push(pet);
        arrayPet[0].newPetProfile.forEach(element => {
          if (element._id == obj.idSecond) {
             element["calendar"].forEach(item => {
              item["title"] = updateCalendarEvent.title;
              item["date"] = updateCalendarEvent.date;
              item["enddate"] = updateCalendarEvent.enddate;
              item["description"] = updateCalendarEvent.description;
              
              pet.save();
              try {
                res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
              } catch (err) {
                res.json({ success: false, msg: err });
                next(err);
              }
             })
          }   
        })
      }
    });
  }
});

router.post('/register/generateQrCodePet', async(req, res) => {
  var id ='60219dea321aed00155e1659';
  const obj = JSON.parse(JSON.stringify(req.body));
  const objProducts = JSON.parse(obj.products);

  objProducts.forEach(item => {
    if(item.idCan == obj._id){
      item.link = 'https://' + req.headers.host + '/myPetCode/' + obj._id +'/'+ 0
    }else {
      item.link = 'https://' + req.headers.host + '/myPetCode/' + obj._id +'/'+ item.idCan
    }
  })

  var notifications = {
    message: 'El usuario '+ obj.petName+ ' ha solicitado un collar',
    userPetName: obj.petName,
    isNewMsg: true,
    dateMsg: new Date(),
    photo: obj.photo,
    idPet: obj._id
  }

  Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { code: objProducts }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Su compra se generado correctamente, el administrador se va contactar contigo, por mientras ve su estado del codigo en tu perfil!'});
  });

  Pet.findOneAndUpdate({ _id: id }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado al admin');
  });
});

router.put('/update/updateStatusQrCodePet', async(req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  var object = {
    status: obj.status
  }


  var notifications = {
    message: 'Se ha cambiado el estado del producto a '+ object.status+' Favor de revisar en (Mi carrito de compras)',
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
            if(item["_id"] == obj.idItemSelected){
              item["status"] = object.status;
              pet.save();
              try {
                res.json({ success: true, msg: 'Se ha actualizado correctamente..!' });
              } catch (err) {
                res.json({ success: false, msg: err });
                next(err);
              }
            }
          }) 
      })
     }
   });
   Pet.findOneAndUpdate({ _id: req.body._id }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado correctamente');
  });
});


// Permissions

router.get('/getPermissionsData/:id/:idSecond', function(req, res){
  var id = req.params.id;
  var idSecond = req.params.idSecond;
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }

    if(idSecond == 0) {
      var pet = {
        permissions: results.permissions
       }
       res.json(pet)
    }else {
      results.newPetProfile.forEach(element => {
        if (element._id == idSecond) {
          var pet = {
            permissions: element.permissions
          }
          res.json(pet)
        }
      })
    }
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
      if(object.idSecondary == 0 ){
        arrayPet.push(pet);
        arrayPet.forEach(element => {
          if(element["permissions"].length == 0){
            element["permissions"].push(object);
          }
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
      }else{
        arrayPet.push(pet.newPetProfile);
        arrayPet.forEach(element => {
          element.forEach(item => {
            if(item._id == object.idSecondary){
              item["permissions"].forEach(val => {
                val["showPhoneInfo"] = object.showPhoneInfo;
                val["showEmailInfo"] = object.showEmailInfo;
                val["showLinkTwitter"] = object.showLinkTwitter;
                val["showLinkFacebook"] = object.showLinkFacebook;
                val["showLinkInstagram"] = object.showLinkInstagram;
                val["showOwnerPetName"] = object.showOwnerPetName;
                val["showBirthDate"] = object.showBirthDate;
                val["showAddressInfo"] = object.showAddressInfo;
                val["showAgeInfo"] = object.showAgeInfo;
                val["showVeterinarianContact"] = object.showVeterinarianContact;
                val["showPhoneVeterinarian"] = object.showPhoneVeterinarian;
                val["showHealthAndRequirements"] = object.showHealthAndRequirements;
                val["showFavoriteActivities"] = object.showFavoriteActivities;
                val["showLocationInfo"] = object.showLocationInfo;
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
        })
      }
     }
   });
});

// Permissions




// admin 

router.get('/getAllPets', function(req, res){
    Pet.find({}, function(err, pets){
    if(err){
      res.json({ success: false, msg: err });
      next();
    }
    const object = [];
    pets.forEach(item => {
      var newPetObject = [];
      if(item.newPetProfile.length>0){
        item.newPetProfile.forEach(element => {
          var pet  = {
            idPet: element._id,
            petName: element.petName,
            email: element.email,
            phone: element.phone,
            age: element.age,
            birthDate: element.birthDate,
            ownerPetName: element.ownerPetName,
            petStatus: element.petStatus
          }
          newPetObject.push(pet);
        })
      }
      
      var test = {
        idPet: item._id,
        petName: item.petName,
        email: item.email,
        phone: item.phone,
        age: item.age,
        birthDate: item.birthDate,
        ownerPetName: item.ownerPetName,
        petStatus: item.petStatus,
        newPetProfile: (newPetObject.length > 0)? newPetObject: null
      }  
      object.push(test);
    })
    res.json(object)
  });
});

// router.get('/getAllPets', function(req, res){
//   Pet.find({}, function(err, pets){
//   if(err){
//     res.json({ success: false, msg: err });
//     next();
//   }
//   const object = [];
//   pets.forEach(item => {
//     var test = {
//       idPet: item._id,
//       petName: item.petName,
//       email: item.email,
//       phone: item.phone,
//       age: item.age,
//       birthDate: item.birthDate,
//       ownerPetName: item.ownerPetName,
//       petStatus: item.petStatus
//     }  
//     object.push(test);
//   })
//   res.json(object)
// });
// });

router.get('/getAllCodePetsList', function(req, res){
  Pet.find({}, function(err, pets){
  if(err){
    res.json({ success: false, msg: err });
    next();
  }
  const object = [];
  // pets.forEach(item => {
  //   if(item.code.length> 0){
  //     var it = {
  //       showPanel: true,
  //       email: item.email,
  //       code: item.code
  //     }
  //     object.push(it);
  //   }
  // })

  pets.forEach(item => {
    if(item.code.length> 0){
      item.code.forEach(value => {
        var val = {
          comment: value.comment,
          cost: value.cost,
          description: value.description,
          email: value.email,
          idCan: value.idCan,
          idPrincipal: value.idPrincipal,
          link: value.link,
          petName: value.petName,
          petPhoto: value.petPhoto,
          productName: value.productName,
          status: value.status,
          showPanel: true,
          _id: value._id
        }
        object.push(val);
      })
    }
  })
  res.json(object)
});
});

router.get('/lost/getAllLostPets', function(req, res){
  Pet.find({}, function(err, pets){
  if(err){
    res.json({ success: false, msg: err });
    next();
  }
  var arrayObj = []
  pets.forEach((item)=> {
    if(item.petStatus == 'Perdido'){
      item.code.forEach(val=> {
        if(item._id == val.idCan){
          var object = {
            link : val.link,
            photo:val.petPhoto,
            petName: val.petName
          }
          arrayObj.push(object);
        }
        
      });
    }
    if(item.newPetProfile.length>0) {
      item.newPetProfile.forEach(value => {
        if(value.petStatus == 'Perdido'){
          item.code.forEach(f=> {
            if(value._id == f.idCan){
              var object = {
                link : f.link,
                photo: f.petPhoto,
                petName: f.petName
              }
              arrayObj.push(object);
            }
          })
        }
      })
    }
  })
  res.json(arrayObj);
});
});


router.get('/getAdminDataList', function(req, res){
  var id ='60219dea321aed00155e1659';
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
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

router.get('/getAllProductShopList', function(req, res){
  var id ='60219dea321aed00155e1659';
  Pet.findById(id, function(err, results){
    if(err){
      res.json({ success: false, msg: err });
      return;
    }

    if(results.productsList.length> 0 ){
      var pet = {
        productsList: results.productsList
      }
      res.json(pet)
    }
  });
});

router.post('/register/new-product', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  let newProductList = {
    productName: obj.productName,
    size: obj.size,
    color: obj.color,
    cost: obj.cost,
    description: obj.description,
    quantity: obj.quantity
  };

  Pet.findOneAndUpdate({ _id: obj._id }, { $push: { productsList: newProductList }},{new: true}).then(function(data){
    res.json({success:true,msg: 'Nuevo codigo Se ha generado correctamente el administrador se va contactar contigo, por mientras ve su estado del codigo en tu perfil!'});
  });

});


router.put('/update/new-product', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  let newProductList = {
    productName: obj.productName,
    size: obj.size,
    color: obj.color,
    cost: obj.cost,
    description: obj.description,
    quantity: obj.quantity,
    idProduct: obj.idProduct
  };

  await Pet.findOne({_id: obj._id }, (err, pet) => {
    if (!pet) {
      return res.json({success:false,msg: 'Usuario no encontrado'});
    }
     if(pet != null) {
       var arrayPet = [];
      arrayPet.push(pet);
      arrayPet.forEach(element => {
          element["productsList"].forEach(item => {
            if(item._id == newProductList.idProduct){
              item["productName"] = newProductList.productName;
              item["size"] = newProductList.size;
              item["color"] = newProductList.color;
              item["cost"] = newProductList.cost;
              item["description"] = newProductList.description;
              item["quantity"] = newProductList.quantity;
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


router.put('/register/registerPhotoPetProduct', async(req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));

  const result = await cloudinary.uploader.upload(req.file != undefined? req.file.path: obj.image);
  let newPet = {
    idProduct : obj.idProduct,
    isFistPhoto : obj.isFistPhoto,
    photo: result.secure_url == undefined ? obj.image : result.secure_url
  };

  await Pet.findOne({_id: obj._id }, (err, pet) => {
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
      res.json({ success: false, msg: err });
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
      if(obj.idSecondary == 0 ){
        arrayPet.push(pet);
        arrayPet.forEach(element => {
          element["petStatus"] = reportPetLost.petStatus;
          if (element["petStatusReport"].length > 0) {
            var indexToRemove = 0;
            var numberToRemove = 1;
            element["petStatusReport"].splice(indexToRemove, numberToRemove);
          }
          element["petStatusReport"].push(reportPetLost)

          pet.save();
          try {
            res.json({ success: true, msg: 'Se ha reportado correctamente.. al administrador del sitio!' });
          } catch (err) {
            res.json({ success: false, msg: err });
            next(err);
          }
        })
      }else{
        pet.newPetProfile.forEach(element => {
          if(element._id == obj.idSecondary){
            console.log('paso')
            element["petStatus"] = reportPetLost.petStatus;
            if (element["petStatusReport"].length > 0) {
              var indexToRemove = 0;
              var numberToRemove = 1;
              element["petStatusReport"].splice(indexToRemove, numberToRemove);
            }
            element["petStatusReport"].push(reportPetLost)
  
            pet.save();
            try {
              res.json({ success: true, msg: 'Se ha reportado correctamente.. al administrador del sitio!' });
            } catch (err) {
              res.json({ success: false, msg: err });
              next(err);
            }
          }
        })
      }
     }
   });

  Pet.findOneAndUpdate({ _id: String(process.env.ADMIN_ID) }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
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

   Pet.findOneAndUpdate({ _id: String(process.env.ADMIN_ID) }, { $push: { notifications: notifications  }},{new: true}).then(function(data){
    console.log('Se ha enviado correctamente');
  });
});

// reports


router.post('/forgot', (req, res, next) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        Pet.findOne({ email: obj.email }, (err, user) => {
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
      var smtpTransport = nodemailer.createTransport({
        host: process.env.ZOHO_HOST,
        port: process.env.ZOHO_PORT,
        secure: true,
        logger: true,
        debug: true,
        auth: {
          user: process.env.ZOHO_USER,
          pass: process.env.ZOHO_PASSWORD
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });

      const handlebarOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve(__dirname, "views"),
          defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, "views"),
        extName: ".handlebars",
      };
      
      smtpTransport.use(
        "compile",
        hbs(handlebarOptions)
      );

      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
      var mailOptions = {
        to: user.email,
        from: '	soporte@localpetsandfamily.com',
        subject: 'LocalPetsAndFamily restablecimiento de la contraseña',
        attachments: [
          {filename: 'localpetslogo.jpg', path:'./src/assets/localpetslogo.jpg'}
        ],
        template: 'index',
        context: {
          text: 'Recibe esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.\n\n' +
          'Haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso:\n\n' +
          'Si no lo solicitó, ignore este correo electrónico y su contraseña permanecerá sin cambios.\n',
          link: (req.headers.host == 'localhost:8080')? 'https://localhost:4100/reset-pets/' + token  : 'https://' + req.headers.host + '/reset-pets/' + token,
          textLink: 'Ir al enlace'
        } 
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, msg: 'Se ha enviado un correo electrónico a ' + user.email + ' con más instrucciones. favor de revisar la carpeta de spam si no ves el correo en tu bandeja principal'});
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset-pets/:token', (req, res) => {
  Pet.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.json({success:false,msg: err});
    }else{
      res
      .status(200)
      .json({ user: user, token: req.params.token });
    }
  });
});


router.post('/reset-pets/', function(req, res) {
  req.params.token = req.body.token;
  async.waterfall([
    function(done) {
      Pet.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return  res.json({success:false,msg: 'El token de restablecimiento de contraseña no es válido o ha caducado..'});
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
        host: process.env.ZOHO_HOST,
        port: process.env.ZOHO_PORT,
        secure: true,
        logger: true,
        debug: true,
        auth: {
          user: process.env.ZOHO_USER,
          pass: process.env.ZOHO_PASSWORD
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });
    
      const handlebarOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve(__dirname, "views"),
          defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, "views"),
        extName: ".handlebars",
      };
      
      smtpTransport.use(
        "compile",
        hbs(handlebarOptions)
      );

      smtpTransport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
    
      var mailOptions = {
        to: user.email,
        from: '	soporte@localpetsandfamily.com',
        subject: 'LocalPetsAndFamily restablecimiento de la contraseña',
        attachments: [
          {filename: 'localpetslogo.jpg', path:'./src/assets/localpetslogo.jpg'}
        ],
        template: 'index',
        context: {
          text: 'La contraseña de su correo ' + user.email + ' ha sido actualizada satisfactoriamente.\n',
          link: 'https://www.localpetsandfamily.com/login-pets',
          textLink: 'Ir a iniciar sesión'
        } 
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success:true,msg: 'Su contraseña ha sido actualizada satisfactoriamente.'});
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
});



module.exports = router;
