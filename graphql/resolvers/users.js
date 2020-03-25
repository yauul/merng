const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
    validateRegisterInput,
    validateLoginInput
} = require("../../utils/validators");
const User = require("../../models/User");
const { SECRET_KEY } = require("../../config/config");

const generateToken = user => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username
        },
        SECRET_KEY,
        { expiresIn: "1h" }
    );
};

module.exports = {
    Mutation: {
        async register(
            _,
            { registerInput: { username, email, password, confirmPassword } },
            context,
            info
        ) {
            try {
                // Validator logic
                const { valid, errors } = validateRegisterInput(
                    username,
                    email,
                    password,
                    confirmPassword
                );

                if (!valid) {
                    throw new UserInputError("Errors", errors);
                }

                const userExists = await User.findOne({ username });

                if (userExists) {
                    throw new UserInputError("Username is taken", {
                        errors: {
                            username: "This username is taken"
                        }
                    });
                } else {
                    password = await bcrypt.hash(password, 12);

                    const newUser = new User({
                        email,
                        username,
                        password,
                        createdAt: new Date().toISOString()
                    });

                    const res = await newUser.save();

                    console.log(res);

                    const token = generateToken(res);
                    return {
                        ...res._doc,
                        id: res._id,
                        token
                    };
                }
            } catch (err) {
                console.log(err);
            }
            // Validate user data
            // Test User Exists
            // Hash password and create auth token
        },
        async login(_, { username, password }) {
            try {
                const { errors, valid } = validateLoginInput(
                    username,
                    password
                );

                if (!valid) {
                    throw new UserInputError("Errors", errors);
                }

                const user = await User.findOne({ username });

                if (!user) {
                    errors.general = "User not found";
                    throw new UserInputError("User not found", { errors });
                }

                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    errors.general = "Wrong credentials";
                    throw new UserInputError("Wrong credentials", { errors });
                }

                const token = generateToken(user);
                return {
                    ...user._doc,
                    id: user._id,
                    token
                };
            } catch (err) {
                console.log(err);
            }
        }
    }
};
