const helper = require("./helper.js");
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handlePost = (e, onPostAdded) => {
    e.preventDefault();
    helper.hideError();

    const title = e.target.querySelector('#postTitle').value;
    const content = e.target.querySelector('#postContent').value;

    if(!content){
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {title, content}, onPostAdded);
    return false;
};

const PostForm = (props) => {
    return(
        <form id="postForm"
            onSubmit={(e) => handlePost(e, props.triggerReload)}
            name="postForm"
            action="/maker"
            method="POST"
            className="postForm"
        >
            <label htmlFor="title">Title: </label>
            <input id="postTitle" type="text" name="title" placeholder="Post Title" />
            <label htmlFor="content">Content: </label>
            <input id="postContent" type="text" name="content" placeholder="Post Content" />
            <input className="makePostSubmit" type="submit" value="Make Post"/>
        </form>
    );
};

const deletePost = async (PostId, triggerReload) => {
    try {
        const response = await fetch('/deletePost', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: postId }),
        });
        if (response.ok) {
            triggerReload();
        } else {
            console.error('Failed to delete Post');
        }
    } catch (err) {
        console.error('Error deleting Post:', err);
    }
};

const PostList = (props) => {
    const [posts, setPost] = useState(props.posts);

    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getPosts');
            const data = await response.json();
            setPosts(data.posts);
        };
        loadPostsFromServer();
    }, [props.reloadPosts]);

    if(posts.length === 0){
        return (
            <div className="PostList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    const postNodes = posts.map(post => {
        return (
            <div key={post.id} className="post">
                <img src="/assets/img/account.jpg" alt="post face" className="postFace" />
                <h3 className="PostTitle">{post.title}</h3>
                <h3 className="PostContent">Age: {post.content}</h3>
                <button onClick={() => deletePost(post._id, props.triggerReload)} className="deleteButton">
                Delete Post
                </button>
            </div>
        );
    });

    return(
        <div className="postList">
            {postNodes}
        </div>
    );
};

const App = () => {
    const [reloadPosts, setReloadPosts] = useState(false);

    const triggerReload = () => {
        setReloadPosts((prev) => !prev); // Toggle the state to trigger a reload
    };

    return (
        <div>
            <div id="makePost">
                <PostForm triggerReload={() => setReloadPosts(!reloadPosts)} />
            </div>
            <div id="posts">
                <PostList posts={[]} reloadPosts={reloadPosts} triggerReload={triggerReload}/>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;