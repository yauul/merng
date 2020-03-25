const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/checkAuth");
module.exports = {
    Query: {
        getPosts: async () => {
            try {
                const posts = await Post.find({}).sort({ createdAt: -1 });
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error("Post not found");
                }
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        createPost: async (_, { body }, context) => {
            try {
                if (body.trim() === "") {
                    throw new UserInputError("Body must not be empty");
                }
                const user = checkAuth(context);

                const newPost = new Post({
                    body,
                    user: user.id,
                    username: user.username,
                    createdAt: new Date().toISOString()
                });

                const post = await newPost.save();

                context.pubsub.publish("NEW_POST", {
                    newPost: post
                });

                return post;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
        },
        deletePost: async (_, { postId }, context) => {
            const user = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return "Post deleted successfuly";
                } else {
                    throw new AuthenticationError("Action not allowed");
                }
            } catch (error) {
                throw new Error(error);
            }
        },
        likePost: async (_, { postId }, context) => {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                if (post.likes.find(like => like.username === username)) {
                    // Post already liked, unlike it
                    post.likes = post.likes.filter(
                        like => like.username !== username
                    );
                } else {
                    // Not liked, like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    });
                }
                await post.save();
                return post;
            } else throw new UserInputError("Post not found");
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, args, { pubsub }) => pubsub.asyncIterator("NEW_POST")
        }
    }
};
