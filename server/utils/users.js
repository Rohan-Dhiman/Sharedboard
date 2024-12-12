const users = [];

// Add a new user to the list

const  addUser = ({socketId, name, userId, roomId, host, presenter}) => {
    const user = {socketId, name, userId, roomId, host, presenter}
    users.push(user);
    // console.log(user);
    return users.filter(user => user.roomId === roomId);
}

// Remove a user from the list

const removeUser = (id) => {
    const index = users.findIndex(user => user.socketId === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

// Get a user from the list

const getUser = (socketId) => {
    for (const roomId in users) {
      const user = users[roomId].find((u) => u.socketId === socketId);
      if (user) return user;
    }
    return null;
  };

//Get all users in a room

const getUsersInRoom = (roomId) => {
    return users.filter(user => user.roomId === roomId)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}