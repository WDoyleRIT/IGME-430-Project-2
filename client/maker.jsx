const helper = require("./helper.js");
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
//const { Domo } = require("../server/models/index.js");

const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const level = e.target.querySelector('#domoLevel').value;

    if(!name || !age || !level){
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, level}, onDomoAdded);
    return false;
};

const DomoForm = (props) => {
    return(
        <form id="domoForm"
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" />
            <label htmlFor="level">Level: </label>
            <input id="domoLevel" type="number" min="1" name="level" />
            <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
        </form>
    );
};

const deleteDomo = async (domoId, triggerReload) => {
    try {
        const response = await fetch('/deleteDomo', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: domoId }),
        });
        if (response.ok) {
            triggerReload();
        } else {
            console.error('Failed to delete Domo');
        }
    } catch (err) {
        console.error('Error deleting Domo:', err);
    }
};

const DomoList = (props) => {
    const [domos, setDomos] = useState(props.domos);

    useEffect(() => {
        const loadDomosFromServer = async () => {
            const response = await fetch('/getDomos');
            const data = await response.json();
            setDomos(data.domos);
        };
        loadDomosFromServer();
    }, [props.reloadDomos]);

    if(domos.length === 0){
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => {
        return (
            <div key={domo.id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
                <h3 className="domoLevel">Level: {domo.level}</h3>
                <button onClick={() => deleteDomo(domo._id, props.triggerReload)} className="deleteButton">
                Delete Domo
                </button>
            </div>
        );
    });

    return(
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const App = () => {
    const [reloadDomos, setReloadDomos] = useState(false);

    const triggerReload = () => {
        setReloadDomos((prev) => !prev); // Toggle the state to trigger a reload
    };

    return (
        <div>
            <div id="makeDomo">
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
            <div id="domos">
                <DomoList domos={[]} reloadDomos={reloadDomos} triggerReload={triggerReload}/>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App />);
};

window.onload = init;