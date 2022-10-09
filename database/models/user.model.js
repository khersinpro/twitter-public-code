const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = schema({
    username: { type: String, 
        required: [true, "Champ requis"], 
        maxlength: [15, "Pseudo trop long"], 
        minlength: [3, "Pseudo trop court"], 
        unique: true 
    },
    local: {
        email: { type: String, required: true, unique:  true },
        emailToken: { type: String },
        emailVerified: {type: Boolean , default: false},
        password: { type: String, required: true },
        passwordToken: { type: String },
        passwordTokenExpiration: { type:  Date }
    },
    avatar: {type: String, default:'/images/images.png' },
    following: {type:[schema.Types.ObjectId] , ref: 'user'}
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hash(password, 12);
}

// methods permet d'acceder a this ce qui permet de comparer les deux password
userSchema.methods.comparePassword = function(password) { 
    return bcrypt.compare(password, this.local.password);
}

const User = mongoose.model('user', userSchema);

module.exports = User;