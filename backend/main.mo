import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor {
  type Category = {
    id: Text;
    name: Text;
    icon: Text;
  };

  type Topic = {
    id: Text;
    categoryId: Text;
    title: Text;
    content: Text;
    authorPrincipal: Principal;
    createdAt: Time.Time;
  };

  type Reply = {
    id: Text;
    topicId: Text;
    content: Text;
    authorPrincipal: Principal;
    createdAt: Time.Time;
  };

  stable var categoriesArray: [Category] = [];
  stable var topicsArray: [Topic] = [];
  stable var repliesArray: [Reply] = [];
  stable var nextTopicId: Nat = 0;
  stable var nextReplyId: Nat = 0;

  var topics = HashMap.HashMap<Text, Topic>(0, Text.equal, Text.hash);
  var replies = HashMap.HashMap<Text, Reply>(0, Text.equal, Text.hash);

  func generateId(prefix: Text, counter: Nat) : Text {
    prefix # Nat.toText(counter)
  };

  public shared(msg) func createTopic(categoryId: Text, title: Text, content: Text) : async Result.Result<Text, Text> {
    let topicId = generateId("topic_", nextTopicId);
    nextTopicId += 1;
    let newTopic: Topic = {
      id = topicId;
      categoryId = categoryId;
      title = title;
      content = content;
      authorPrincipal = msg.caller;
      createdAt = Time.now();
    };
    topics.put(topicId, newTopic);
    topicsArray := Array.append(topicsArray, [newTopic]);
    #ok(topicId)
  };

  public shared(msg) func createReply(topicId: Text, content: Text) : async Result.Result<Text, Text> {
    let replyId = generateId("reply_", nextReplyId);
    nextReplyId += 1;
    let newReply: Reply = {
      id = replyId;
      topicId = topicId;
      content = content;
      authorPrincipal = msg.caller;
      createdAt = Time.now();
    };
    replies.put(replyId, newReply);
    repliesArray := Array.append(repliesArray, [newReply]);
    #ok(replyId)
  };

  public query func getCategories() : async [Category] {
    categoriesArray
  };

  public query func getTopics(categoryId: Text) : async [Topic] {
    Array.filter(topicsArray, func (t: Topic) : Bool { t.categoryId == categoryId })
  };

  public query func getReplies(topicId: Text) : async [Reply] {
    Array.filter(repliesArray, func (r: Reply) : Bool { r.topicId == topicId })
  };

  system func preupgrade() {
    topicsArray := Iter.toArray(topics.vals());
    repliesArray := Iter.toArray(replies.vals());
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
    topics := HashMap.fromIter<Text, Topic>(
      Iter.map<Topic, (Text, Topic)>(
        topicsArray.vals(),
        func (topic : Topic) : (Text, Topic) {
          (topic.id, topic)
        }
      ),
      topicsArray.size(),
      Text.equal,
      Text.hash
    );
    replies := HashMap.fromIter<Text, Reply>(
      Iter.map<Reply, (Text, Reply)>(
        repliesArray.vals(),
        func (reply : Reply) : (Text, Reply) {
          (reply.id, reply)
        }
      ),
      repliesArray.size(),
      Text.equal,
      Text.hash
    );
  };
}
