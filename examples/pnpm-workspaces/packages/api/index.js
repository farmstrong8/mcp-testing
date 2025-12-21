function fetchUser(id) {
    return { id, name: `User ${id}` };
}

module.exports = { fetchUser };

