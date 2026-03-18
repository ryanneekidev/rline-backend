const clients = new Map();

function addClient(userId, res) {
    clients.set(userId, res);
}

function removeClient(userId) {
    clients.delete(userId);
}

function getClient(userId) {
    return clients.get(userId);
}

module.exports = { addClient, removeClient, getClient };
