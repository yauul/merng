import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import PostCard from '../components/PostCard';
import { Grid } from 'semantic-ui-react';

const Home = () => {
    const { loading, data, error } = useQuery(FETCH_POSTS_QUERY);

    if (error) return `Error occured: ${error}`;
    if (loading) return <h1>Loading posts...</h1>;

    return (
        <Grid columns={3}>
            <Grid.Row className="page-title">
                <h1>Recent Posts</h1>
            </Grid.Row>
            <Grid.Row>
                {data &&
                    data.getPosts.map(post => (
                        <Grid.Column
                            style={{ marginBottom: '20px' }}
                            key={post.id}
                        >
                            <PostCard post={post} />
                        </Grid.Column>
                    ))}
            </Grid.Row>
        </Grid>
    );
};

const FETCH_POSTS_QUERY = gql`
    query {
        getPosts {
            id
            body
            createdAt
            username
            commentCount
            likeCount
            likes {
                username
            }
            comments {
                id
                username
                createdAt
                body
            }
        }
    }
`;

export default Home;
