export interface Entry {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export class EntryModel {
    constructor(public entry: Entry) {}

    validate() {
        if (!this.entry.title || !this.entry.content) {
            throw new Error("Title and content are required.");
        }
    }
}