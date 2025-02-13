declare namespace Express {
    export interface Request {
        user?: any; // অথবা তুমি নির্দিষ্ট টাইপ দিতে পারো, যেমন: { id: number; role: string }
    }
}
