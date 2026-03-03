// محاكاة قاعدة بيانات Firebase
class Database {
    constructor() {
        this.users = {};
        this.withdrawals = [];
    }
    
    async saveUser(userId, data) {
        this.users[userId] = data;
        return true;
    }
    
    async getUser(userId) {
        return this.users[userId] || null;
    }
    
    async addWithdrawal(data) {
        this.withdrawals.push({
            id: Date.now(),
            ...data,
            status: 'pending'
        });
        return true;
    }
}

const db = new Database();