import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import List "mo:base/List";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";

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
  stable var listingsArray: [Listing] = [];
  stable var nextListingId: Nat = 0;

  // In-memory state
  var listings = HashMap.HashMap<Text, Listing>(0, Text.equal, Text.hash);

  // Helper functions
  func generateId() : Text {
    let id = Nat.toText(nextListingId);
    nextListingId += 1;
    id
  };

  func textToFloat(t : Text) : ?Float {
    let digits = "0123456789";
    let decimals = ".";

    func isDigit(c : Char) : Bool {
      Text.contains(digits, #char c)
    };

    var int : Float = 0;
    var frac : Float = 0;
    var div : Float = 1;
    var isNegative = false;
    var seenDecimal = false;

    for (c in t.chars()) {
      if (c == '-' and int == 0 and frac == 0) {
        isNegative := true;
      } else if (isDigit(c)) {
        let d = Float.fromInt(Nat32.toNat(Char.toNat32(c) - 48));
        if (seenDecimal) {
          frac += d / div;
          div *= 10;
        } else {
          int := int * 10 + d;
        };
      } else if (c == '.' and not seenDecimal) {
        seenDecimal := true;
      } else {
        return null;
      };
    };

    let result = int + frac;
    ?( if (isNegative) -result else result )
  };

  func parsePrice(price: ?Text) : Result.Result<Float, Text> {
    switch (price) {
      case (null) { #ok(0) };
      case (?p) {
        switch (textToFloat(p)) {
          case (null) { #err("Invalid price format") };
          case (?float) { #ok(float) };
        };
      };
    };
  };

  // Public functions
  public query func getCategories() : async [Category] {
    categoriesArray
  };

  public func createListing(categoryId: Text, title: Text, description: Text, price: ?Text) : async Result.Result<Text, Text> {
    let parsedPrice = parsePrice(price);
    switch (parsedPrice) {
      case (#err(e)) { return #err(e) };
      case (#ok(p)) {
        let id = generateId();
        let newListing: Listing = {
          id;
          categoryId;
          title;
          description;
          price = ?p;
        };
        listings.put(id, newListing);
        listingsArray := Array.append(listingsArray, [newListing]);
        #ok(id)
      };
    };
  };

  public query func getListings(categoryId: Text) : async [Listing] {
    Array.filter(listingsArray, func (l: Listing) : Bool { l.categoryId == categoryId })
  };

  // Initialize categories
  system func preupgrade() {
    listingsArray := Iter.toArray(listings.vals());
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
    listings := HashMap.fromIter<Text, Listing>(
      Iter.map<Listing, (Text, Listing)>(
        listingsArray.vals(),
        func (listing : Listing) : (Text, Listing) {
          (listing.id, listing)
        }
      ),
      listingsArray.size(),
      Text.equal,
      Text.hash
    );
  };
}
