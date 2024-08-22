export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Category = IDL.Record({
    'id' : IDL.Text,
    'icon' : IDL.Text,
    'name' : IDL.Text,
  });
  const Time = IDL.Int;
  const Reply = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'createdAt' : Time,
    'authorPrincipal' : IDL.Principal,
    'topicId' : IDL.Text,
  });
  const Topic = IDL.Record({
    'id' : IDL.Text,
    'categoryId' : IDL.Text,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'createdAt' : Time,
    'authorPrincipal' : IDL.Principal,
  });
  return IDL.Service({
    'createReply' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'createTopic' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'getCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'getReplies' : IDL.Func([IDL.Text], [IDL.Vec(Reply)], ['query']),
    'getTopics' : IDL.Func([IDL.Text], [IDL.Vec(Topic)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
