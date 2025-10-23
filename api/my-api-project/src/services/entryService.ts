export class EntryService {
    private entries: any[] = [];

    public createEntry(entry: any): void {
        this.entries.push(entry);
    }

    public getEntries(): any[] {
        return this.entries;
    }

    public findEntryById(id: string): any | undefined {
        return this.entries.find(entry => entry.id === id);
    }

    public updateEntry(id: string, updatedEntry: any): boolean {
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...updatedEntry };
            return true;
        }
        return false;
    }

    public deleteEntry(id: string): boolean {
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index !== -1) {
            this.entries.splice(index, 1);
            return true;
        }
        return false;
    }
}