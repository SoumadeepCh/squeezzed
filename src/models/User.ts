import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return this.provider === 'credentials';
    },
  },
  image: {
    type: String,
    default: null,
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'github'],
    default: 'credentials',
  },
}, {
  timestamps: true,
});

// Note: email index is automatically created by unique: true option

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
