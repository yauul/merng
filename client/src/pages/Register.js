import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';
import gql from 'graphql-tag';

const Register = () => {
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const onChange = e => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const [adduser, { loading }] = useMutation(REGISTER_USER, {
        update(proxy, result) {
            console.log(result);
        },
        variables: values
    });

    const onSubmit = e => {
        e.preventDefault();
        adduser();
    };

    return (
        <div className="form-container">
            <Form onSubmit={onSubmit} noValidate>
                <Form.Input
                    label="Username"
                    placeholder="Username..."
                    name="username"
                    type="text"
                    value={values.username}
                    onChange={onChange}
                />
                <Form.Input
                    label="Email"
                    placeholder="Email..."
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={onChange}
                />
                <Form.Input
                    label="Password "
                    placeholder="Password..."
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={onChange}
                />
                <Form.Input
                    label="Confirm Password "
                    placeholder="Confirtm Password..."
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    onChange={onChange}
                />
                <Button type="submit" primary>
                    Register
                </Button>
            </Form>
        </div>
    );
};

const REGISTER_USER = gql`
    mutation register(
        $username: String!
        $email: String!
        $password: String!
        $confirmPassword: String!
    ) {
        register(
            registerInput: {
                username: $username
                email: $email
                password: $password
                confirmPassword: $confirmPassword
            }
        ) {
            id
            username
            email
            token
        }
    }
`;

export default Register;
