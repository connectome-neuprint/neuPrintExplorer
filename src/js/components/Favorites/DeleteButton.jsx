import React from 'react';
import Button from '@material-ui/core/Button';

function deleteItem(props) {
  const { token, appDB, actions, id, removeItem} = props;

  if (token !== '') {
    // fetch favorites and add to state
    fetch(`${appDB}/user/favorites/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'DELETE'
    })
      .then(() => {
        removeItem(id);
      })
      .catch(error => {
        actions.apiError(error);
      });
  }
};

function DeleteButton(props) {
  return (
    <Button color="primary" onClick={() => deleteItem(props)}>Delete</Button>
  );
}

export default DeleteButton;
