import type { Request, Response } from "express";
export declare const signUp: (req: any, res: any) => Promise<any>;
export declare const signIn: (req: any, res: any) => Promise<any>;
export declare const signOut: (req: any, res: any) => Promise<any>;
export declare const sendOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const googleAuth: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map