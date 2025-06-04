import mongoose from "mongoose";
import { UserInterface } from "../interface/user";

const userSchema = new mongoose.Schema<UserInterface>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v: string) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user'],
            message: '{VALUE} is not supported'
        },
        default: 'user',
        required: true
    }
},{
    timestamps: true,
    versionKey: false
});

const UserModel = mongoose.model<UserInterface>('User', userSchema);


export default UserModel;
