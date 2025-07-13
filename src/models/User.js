import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum length for password    
    },
   profileImage:{
        type: String,
        default:"",
   }
 }, 
  {timestamps: true}
);

// Hash the password before saving to db
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

// Compare the password with the hashed password
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;    