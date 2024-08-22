import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Category { 'id' : string, 'icon' : string, 'name' : string }
export interface Reply {
  'id' : string,
  'content' : string,
  'createdAt' : Time,
  'authorPrincipal' : Principal,
  'topicId' : string,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Time = bigint;
export interface Topic {
  'id' : string,
  'categoryId' : string,
  'title' : string,
  'content' : string,
  'createdAt' : Time,
  'authorPrincipal' : Principal,
}
export interface _SERVICE {
  'createReply' : ActorMethod<[string, string], Result>,
  'createTopic' : ActorMethod<[string, string, string], Result>,
  'getCategories' : ActorMethod<[], Array<Category>>,
  'getReplies' : ActorMethod<[string], Array<Reply>>,
  'getTopics' : ActorMethod<[string], Array<Topic>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
