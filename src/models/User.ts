import { Schema, model, Document } from "mongoose";
import { PostDocument } from "./Post";

export interface UserDocument extends Document {
    email ?: string;
    password ?: string;
    name ?: string;
    posts ?: PostDocument[];
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "I'm new"
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
});

const User = model('User',userSchema);

export default User;