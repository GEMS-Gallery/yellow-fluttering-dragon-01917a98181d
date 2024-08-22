import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Category { 'id' : string, 'icon' : string, 'name' : string }
export interface Listing {
  'id' : string,
  'categoryId' : string,
  'title' : string,
  'description' : string,
  'price' : [] | [number],
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'createListing' : ActorMethod<
    [string, string, string, [] | [number]],
    Result
  >,
  'getCategories' : ActorMethod<[], Array<Category>>,
  'getListings' : ActorMethod<[string], Array<Listing>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
