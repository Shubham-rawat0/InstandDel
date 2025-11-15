import mongoose from "mongoose";
export declare const User: mongoose.Model<{
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    fullName: string;
    email: string;
    mobile: string;
    role: "user" | "owner" | "deliveryBoy";
    isOtpVerified: boolean;
    googleSignIn: boolean;
    password?: string | null;
    resetOtp?: string | null;
    otpExpires?: number | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=user.model.d.ts.map