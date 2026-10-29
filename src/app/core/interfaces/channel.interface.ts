/**
 * Represents a channel and its metadata.
 * Stores channel information and member ids.
 */

export interface Channel {
    id: string,
    name:string,
    description?: string,
    createdAt:number,
    createdBy:string,
    creatorName?:string,
    members: string[]
}