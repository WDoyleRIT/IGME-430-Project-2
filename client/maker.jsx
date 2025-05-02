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

const deletePost = async (postId, triggerReload) => {
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
    const [posts, setPosts] = useState(props.posts);

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
                <h3 className="PostContent">{post.content}</h3>
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

const UserList = (props) => {
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetch('/getAccounts');
                if (!response.ok) {
                    throw new Error('Failed to fetch user list');
                }
                const data = await response.json();
                setUsers(data.accounts);
            } catch (error) {
                console.error(error);
            }
        };

        getUsers();
    }, []);

    const followUser = (index) => {
        setUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
    };

    const userNodes = users.map((user, index) => (
        <div key={index} className="user">
            <h3 className="userName">{user}</h3>
            <button onClick={() => followUser(index)} className="followButton">
                Follow
            </button>
        </div>
    ));

    return (
        <div className="userList">
            {userNodes}
        </div>
    );
};

const PremiumButton = (props) => {
    const [isPremium, setIsPremium] = React.useState(false);

    const buyPremium = async () => {
        try {
            const response = await fetch('/buyPremium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to upgrade to premium');
            }

            const data = await response.json();
            alert(data.message);
            setIsPremium(true);
        } catch (error) {
            console.error(error);
            alert('An error occurred while upgrading to premium.');
        }
    };

    if (isPremium) {
        return null; 
    }

    return (
        <button onClick={buyPremium} className="premiumButton">
            Buy W Premium Now
        </button>
    );
};

const buyPremium = async () => {
    try {
        const response = await fetch('/buyPremium', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to upgrade to premium');
        }

        const data = await response.json();
        console.log(data.message);
        alert('You are now a premium user!');
    } catch (error) {
        console.error(error);
        alert('An error occurred while upgrading to premium.');
    }
};

const App = () => {
    const [reloadPosts, setReloadPosts] = useState(false);

    const triggerReload = () => {
        setReloadPosts((prev) => !prev);
    };

    return (
        <div>
            <div id="makePost">
                <PostForm triggerReload={() => setReloadPosts(!reloadPosts)} />
            </div>
            <div id="posts">
                <PostList posts={[]} reloadPosts={reloadPosts} triggerReload={triggerReload}/>
            </div>
            <div id="users">
                <UserList triggerReload={() => setReloadPosts(!reloadPosts)} />
            </div>
            <div id="premium">
                <PremiumButton triggerReload={() => setReloadPosts(!reloadPosts)}/>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;