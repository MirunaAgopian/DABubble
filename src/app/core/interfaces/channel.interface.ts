export interface Channel {
    id: string,
    name:string,
    description?: string,
    createdAt:number,
    createdBy:string,
    creatorName?:string,
    members: string[]
}