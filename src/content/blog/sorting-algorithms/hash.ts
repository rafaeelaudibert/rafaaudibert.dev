/* table size (change here to test other values of M) */
const M = 293

class HashTableElement<K extends string, T> {
    key: K
    data: T

    constructor(key: K, data: T) {
        this.key = key;
        this.data = data;
    }
}

type HashTableMethod = 'openLinearSearch' | 'openDoubleHashing' | 'closedChaining'

class HashTable<K extends string, T> {
    tableSize: number
    table: { elem: HashTableElement<K, T> | null, elems: HashTableElement<K, T>[] }[]
    method: HashTableMethod

    constructor(hashSize: number, hashAddressing: HashTableMethod) {
        this.tableSize = hashSize;
        this.table = new Array(hashSize);
        this.method = hashAddressing;

        // Initialize with default values, although some methods will not use some of the array values
        for (let i = 0; i < hashSize; i++) {
            this.table[i] = {
                elem: null, // Used in open addressing
                elems: [] // Used in closed addressing
            }
        }

        return this;
    }

    insert(key: K, data: T) {
        let conflicts = 0;
        const hashedValue = this.computeHash(key);
        const hashedValueExtra = this.computeHashExtra(key);

        let exist = false;
        let endl = hashedValue; // Free address

        switch (this.method) {
            case 'openLinearSearch':
                do {
                    const { elem } = this.table[endl]
                    if (elem) {
                        if (elem.key == key)
                            exist = true; // Key exists, ends
                        else {
                            endl = (endl + 1) % this.tableSize; // Attempt next address
                            conflicts++;
                        }
                    } else {
                        this.table[endl].elem = new HashTableElement(key, data);
                        break;
                    }
                } while (hashedValue != endl && !exist);

                if (hashedValue == endl && !exist && this.table[endl].elem?.key != key)
                    throw new Error('Table full!')
                break;
            case 'openDoubleHashing':
                do {
                    const { elem } = this.table[endl]

                    if (elem) {
                        if (elem.key == key)
                            exist = true; // Key exists, ends
                        else {
                            endl = (endl + hashedValueExtra) % this.tableSize; // Passa para o próximo
                            conflicts++;
                        }
                    } else {
                        this.table[endl].elem = new HashTableElement(key, data);
                        break;
                    }
                } while (hashedValue != endl && !exist);

                if (hashedValue == endl && !exist && this.table[endl].elem?.key != key)
                    throw new Error('Table full!')
                break;
            case 'closedChaining':
                this.table[endl].elems.push(new HashTableElement(key, data));
                break;
            default:
                throw new Error('Invalid hash mode');
        }

        return {
            conflicts,
            exist
        };
    }

    search(key: K) {
        const hashedValue = this.computeHash(key);
        const hashedValueExtra = this.computeHashExtra(key);

        let endl = hashedValue;
        let conflicts = 0;

        switch (this.method) {
            case 'openLinearSearch':
                do {
                    const { elem } = this.table[endl]

                    if (elem) {
                        if (elem.key == key) {
                            return {
                                found: true,
                                elem,
                                conflicts,
                            }
                        } else {
                            endl = (endl + 1) % this.tableSize;
                            conflicts++;
                        }
                    } else {
                        return {
                            found: false,
                            elem: undefined,
                            conflicts: conflicts
                        }
                    }
                } while (endl != hashedValue);
                break;
            case 'openDoubleHashing':
                do {
                    const { elem } = this.table[endl]

                    if (elem) {
                        if (elem.key == key) {
                            return {
                                found: true,
                                elem,
                                conflicts,
                            }
                        } else {
                            endl = (endl + hashedValueExtra) % this.tableSize;
                            conflicts++;
                        }
                    } else {
                        return {
                            found: false,
                            elem: undefined,
                            conflicts: conflicts
                        }
                    }
                } while (endl != hashedValue);
                break;
            case 'closedChaining':
                for (let elem of this.table[endl].elems) {
                    if (elem.key == key)
                        return {
                            found: true,
                            elem: elem,
                            conflicts: conflicts
                        }
                    conflicts++;
                }
                break;
            default:
                break;
        }

        return {
            found: false,
            elem: undefined,
            conflicts: conflicts
        }
    }

    computeHash(key: K) {
        let encrypted = 0;
        for (let i = 0; i < key.length; i++)
            encrypted = (encrypted >> 1) + ((encrypted & 1) << 15) + key.charCodeAt(i);

        return encrypted % this.tableSize;
    }

    computeHashExtra(key: K) {
        let encrypted = 0;
        for (let i = 0; i < key.length; i++)
            encrypted += key.charCodeAt(i);

        return (encrypted % 53) + 1;
    }
}

export default HashTable