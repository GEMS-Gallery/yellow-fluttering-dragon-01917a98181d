export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Category = IDL.Record({
    'id' : IDL.Text,
    'icon' : IDL.Text,
    'name' : IDL.Text,
  });
  const Listing = IDL.Record({
    'id' : IDL.Text,
    'categoryId' : IDL.Text,
    'title' : IDL.Text,
    'description' : IDL.Text,
    'price' : IDL.Opt(IDL.Float64),
  });
  return IDL.Service({
    'createListing' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Float64)],
        [Result],
        [],
      ),
    'getCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'getListings' : IDL.Func([IDL.Text], [IDL.Vec(Listing)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
