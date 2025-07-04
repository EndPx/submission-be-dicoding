const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator){
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(Thread){
        const { title, body, owner } = Thread;
        const id = `thread-${this._idGenerator()}`;
        const date = new Date().toISOString();
        const query = {
            text : `INSERT INTO threads VALUES($1, $2, $3, $4, $5) returning id, title, owner`,
            values: [id, title, body, date, owner],
        }
        const result = await this._pool.query(query);
        return new AddedThread({...result.rows[0]});
    }

    async getThreadById(id) {
        const query = {
          text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username 
                 FROM threads 
                 JOIN users ON threads.owner = users.id 
                 WHERE threads.id = $1`,
          values: [id],
        };
      
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('thread tidak ditemukan');
        }
      
        return result.rows[0];
      }

    async isThreadExists(id){
        const query = {
            text: 'SELECT id FROM threads WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('thread tidak ditemukan');
        }

        return true;
    }
}

module.exports = ThreadRepositoryPostgres;