
export class ApplicationError extends Error{
    public readonly status: number

    constructor(sts:number , msg:string){
        super(msg);
        this.status = sts;
    }

}