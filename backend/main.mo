import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import List "mo:base/List";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Result "mo:base/Result";

actor {
  // Types
  type Category = {
    id: Text;
    name: Text;
    icon: Text;
  };

  type Listing = {
    id: Text;
    categoryId: Text;
    title: Text;
    description: Text;
    price: ?Float;
  };

  // Stable variables
  stable var categoriesArray: [Category] = [];
  stable var nextListingId: Nat = 0;

  // In-memory state
  let listings = HashMap.HashMap<Text, Listing>(0, Text.equal, Text.hash);

  // Helper functions
  func generateId() : Text {
    let id = Nat.toText(nextListingId);
    nextListingId += 1;
    id
  };

  // Public functions
  public query func getCategories() : async [Category] {
    categoriesArray
  };

  public func createListing(categoryId: Text, title: Text, description: Text, price: ?Float) : async Result.Result<Text, Text> {
    let id = generateId();
    let newListing: Listing = {
      id;
      categoryId;
      title;
      description;
      price;
    };
    listings.put(id, newListing);
    #ok(id)
  };

  public query func getListings(categoryId: Text) : async [Listing] {
    Iter.toArray(Iter.filter(listings.vals(), func (l: Listing) : Bool { l.categoryId == categoryId }))
  };

  // Initialize categories
  system func preupgrade() {
    // No need to do anything as we're using stable variables
  };

  system func postupgrade() {
    if (categoriesArray.size() == 0) {
      categoriesArray := [
        { id = "electronics"; name = "Electronics"; icon = "laptop" },
        { id = "furniture"; name = "Furniture"; icon = "chair" },
        { id = "clothing"; name = "Clothing"; icon = "shirt" },
        { id = "books"; name = "Books"; icon = "book" },
      ];
    };
  };
}
