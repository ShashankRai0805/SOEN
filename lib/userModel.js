import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must be at most 50 characters long'],
    },
    password: {
        type: String,
        select: false,
    }
}, {
    timestamps: true
})

userSchema.statics.hashPassword = async function (password){
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function (){
    return jwt.sign({ 
        userId: this._id,
        email: this.email
    }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
}

// Avoid OverwriteModelError in serverless environment
const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;
