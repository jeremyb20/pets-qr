const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passportLocalMongoose = require('passport-local-mongoose');

// User Schema
const PetSchema = mongoose.Schema ({
  petName: {
    type: String
  },
  phone: {
    type: Number,
    require: false
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  lat: {
    type: String,
    require: true
  },
  lng: {
    type: String,
    require: true
  },
  photo: {
    type: String,
    require: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  userState: {
    type: Number,
    require: false
  },
  ownerPetName: {
    type: String,
    require: true
  },
  birthDate: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  age: {
    type: Number,
    require: true
  },
  phoneVeterinarian: {
    type: Number,
    require: true
  },
  veterinarianContact: {
    type: String,
    require: true
  },
  healthAndRequirements: {
    type: String,
    require: true
  },
  favoriteActivities: {
    type: String,
    require: true
  },
  calendar: [{
    title: {
      type: String,
      require: true
    },
    date: {
      type: String,
      require: true
    },
    enddate: {
      type: String,
      require: true
    },
    description: {
      type: String,
      require: true
    }
  }]
}, { autoIndex: false });

PetSchema.plugin(passportLocalMongoose);

const Pet = module.exports = mongoose.model('Pet', PetSchema);

module.exports.getPetById = function(id, callback) {
    Pet.findById(id, callback);
}

module.exports.getUserByUsername = function(email, callback) {
  const query = {email: email}
  Pet.findOne(query, callback);
}

module.exports.addPet = function(newPet, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newPet.password, salt, (err, hash) => {
      if(err) throw err;
      newPet.password = hash;
      newPet.save(callback);
    });
  });
}

module.exports.getUsers = function(users, callback){
  const query = {users: users}
  Pet.find();
}

module.exports.deleteOne = function(req,res){
  Pet.findByIdAndRemove({_id:req.body.id}).then(function(data){
    res.json({success:true,msg:'Se ha eliminado correctamente.'});
  });
}

module.exports.update = function(username, callback){
  Pet.findByIdAndUpdate(username, callback);
}

module.exports.getUserMessage = function(req, callback){
  console.log(req, 'que sale');
  const query = {id: req.body._id}
  Pet.find();
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
